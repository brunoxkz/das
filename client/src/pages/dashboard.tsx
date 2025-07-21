import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeSelector } from "@/components/theme-selector";
import { 
  Plus, 
  BarChart3, 
  Users, 
  Eye, 
  TrendingUp,
  Edit,
  Copy,
  Trash2,
  ExternalLink,
  Calendar,
  MessageSquare,
  MessageCircle,
  Mail,
  FileText,
  Shield,
  Palette,
  Coins,
  BookOpen,
  Clock,
  CreditCard,
  X,
  Zap,
  MapPin,
  Bell
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth-jwt";
import { useToast } from "@/hooks/use-toast";
import { TutorialTour, dashboardTutorialSteps } from "@/components/tutorial-tour";
import { queryClient, apiRequest } from "@/lib/queryClient";
import QuizFullPreview from "@/components/QuizFullPreview";
import { cn } from "@/lib/utils";
// import { useLanguage } from "@/hooks/useLanguage";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [showTutorial, setShowTutorial] = useState(false);
  const [showTrialBanner, setShowTrialBanner] = useState(true);
  const [previewQuiz, setPreviewQuiz] = useState(null);
  const [showQuizPreview, setShowQuizPreview] = useState(false);
  const [forumMode, setForumMode] = useState(false);
  const [pushNotificationState, setPushNotificationState] = useState({
    isIOS: false,
    isPWA: false,
    isSupported: false,
    hasPermission: false,
    isSubscribed: false,
    showAutoPrompt: false
  });

  // Configuração de push notifications - SEM LOOP INFINITO
  useEffect(() => {
    let hasExecuted = false;
    
    const checkDeviceAndSetupPush = async () => {
      // Evitar execuções múltiplas
      if (hasExecuted) return;
      hasExecuted = true;
      
      try {
        // Verificar se já está configurado
        if (pushNotificationState.hasPermission || pushNotificationState.isSubscribed) {
          console.log('✅ Push já configurado');
          return;
        }
        
        // Verificar suporte básico
        const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
        if (!isSupported) {
          console.log('❌ Navegador não suporta push notifications');
          return;
        }
        
        // Verificar se usuário está logado
        if (!user?.id) {
          console.log('❌ Usuário não autenticado');
          return;
        }
        
        console.log('🔍 Iniciando configuração push para usuário:', user.id);
        
        // Só tentar se permissão ainda não foi solicitada
        if (Notification.permission === 'default') {
          console.log('🔔 Solicitando permissões...');
          
          // Registrar service worker primeiro
          const registration = await navigator.serviceWorker.register('/sw-simple.js');
          console.log('🔧 Service Worker registrado');
          
          // Solicitar permissão de forma não bloqueante
          const permission = await Notification.requestPermission();
          console.log('📱 Resultado permissão:', permission);
          
          if (permission === 'granted') {
            try {
              // Obter VAPID key do servidor
              const vapidResponse = await fetch('/api/push-simple/vapid');
              if (!vapidResponse.ok) {
                throw new Error('Falha ao obter VAPID key');
              }
              const { publicKey } = await vapidResponse.json();
              
              // Criar subscription
              const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: publicKey
              });
              
              // Salvar subscription no servidor
              const response = await fetch('/api/push-simple/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscription })
              });
              
              if (response.ok) {
                console.log('✅ Push notifications configuradas!');
                
                // Atualizar estado sem causar re-render infinito
                setPushNotificationState(prev => ({
                  ...prev,
                  hasPermission: true,
                  isSubscribed: true,
                  showAutoPrompt: false
                }));
                
                // Toast de sucesso (sem dependência no useEffect)
                toast({
                  title: "Push Notifications Ativadas!",
                  description: "Você receberá notificações na tela de bloqueio",
                  duration: 3000
                });
              }
            } catch (error) {
              console.error('❌ Erro ao configurar subscription:', error);
            }
          } else {
            console.log('❌ Permissão negada pelo usuário');
          }
        } else {
          console.log(`ℹ️ Permissão já definida: ${Notification.permission}`);
        }
      } catch (error) {
        console.error('❌ Erro na configuração de push:', error);
      }
    };

    // Executar apenas se autenticado e ainda não executou
    if (isAuthenticated && user) {
      // Delay para evitar conflitos de renderização
      const timeoutId = setTimeout(checkDeviceAndSetupPush, 1500);
      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, user?.id]); // Dependências mínimas e estáveis

  // Função para alternar modo fórum
  const toggleForumMode = () => {
    const newForumMode = !forumMode;
    setForumMode(newForumMode);
    
    // Enviar evento para sidebar detectar mudança
    const event = new CustomEvent('toggleForumMode', {
      detail: {
        forumMode: newForumMode,
        compactSidebar: newForumMode
      }
    });
    window.dispatchEvent(event);
  };
  // const { t } = useLanguage();

  // Dados do fórum
  const { data: forumCategories = [], isLoading: forumLoading } = useQuery({
    queryKey: ["/api/forum/categories"],
    enabled: forumMode,
    retry: false,
  });

  const { data: recentTopics = [] } = useQuery({
    queryKey: ["/api/forum/recent"],
    enabled: forumMode,
    retry: false,
  });

  const { data: forumStats = {} } = useQuery({
    queryKey: ["/api/forum/stats"],
    enabled: forumMode,
    retry: false,
  });

  // Buscar dados do usuário
  const { data: userData } = useQuery({
    queryKey: ["/api/auth/validate"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Buscar quizzes do usuário
  const { data: userQuizzes, isLoading: quizzesLoading } = useQuery({
    queryKey: ["/api/quizzes"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Buscar analytics completos
  const { data: allAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/analytics"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Buscar status do plano em tempo real
  const { data: planStatus, isLoading: planLoading } = useQuery({
    queryKey: ["/api/plan/status"],
    enabled: isAuthenticated,
    retry: false,
    refetchInterval: 60000, // Atualizar a cada minuto
  });

  // Buscar dados de campanhas
  const { data: smsCount } = useQuery({
    queryKey: ["/api/sms-campaigns/count"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: whatsappCount } = useQuery({
    queryKey: ["/api/whatsapp-campaigns/count"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: emailCount } = useQuery({
    queryKey: ["/api/email-campaigns/count"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Buscar créditos do usuário
  const { data: userCredits } = useQuery({
    queryKey: ["/api/user/credits"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Query para buscar estatísticas de usuários online
  const { data: onlineStats, isLoading: onlineStatsLoading } = useQuery({
    queryKey: ['/api/users/online-stats'],
    enabled: !!user,
    refetchInterval: 15000 // Atualiza a cada 15 segundos para dados em tempo real
  });

  // Calcular estatísticas reais
  const totalQuizzes = userQuizzes?.length || 0;
  const totalLeads = (allAnalytics && Array.isArray(allAnalytics)) ? allAnalytics.reduce((sum: number, a: any) => sum + (a.leadsWithContact || 0), 0) : 0;
  const totalViews = (allAnalytics && Array.isArray(allAnalytics)) ? allAnalytics.reduce((sum: number, a: any) => sum + (a.totalViews || 0), 0) : 0;
  const avgConversionRate = (allAnalytics && Array.isArray(allAnalytics) && allAnalytics.length > 0) ? 
    Math.round(allAnalytics.reduce((sum: number, a: any) => sum + (a.conversionRate || 0), 0) / allAnalytics.length) : 0;

  const dashboardLoading = quizzesLoading || analyticsLoading;

  // Usar dados do sistema de planos em tempo real
  const userPlan = planStatus?.plan || userData?.user?.plan || 'free';
  const daysLeft = planStatus?.daysRemaining || 0;
  const isBlocked = planStatus?.isBlocked || false;
  const renewalRequired = planStatus?.planRenewalRequired || false;
  const blockReason = planStatus?.blockReason;
  const showPlanBanner = userPlan !== 'enterprise' && (daysLeft < 15 || isBlocked || renewalRequired);

  // Criar mapa de analytics por quiz
  const quizAnalyticsMap = React.useMemo(() => {
    const map = new Map();
    if (userQuizzes && Array.isArray(userQuizzes) && allAnalytics) {
      userQuizzes.forEach((quiz: any) => {
        const quizAnalytic = Array.isArray(allAnalytics) ? allAnalytics.find((a: any) => a.quizId === quiz.id) : null;
        
        const totalViews = quizAnalytic?.totalViews || 0;
        const leadsWithContact = quizAnalytic?.leadsWithContact || 0;
        const conversionRate = quizAnalytic?.conversionRate || 0;
        
        map.set(quiz.id, {
          views: totalViews,
          leads: leadsWithContact,
          conversions: Math.round(conversionRate)
        });
      });
    }
    return map;
  }, [userQuizzes, allAnalytics]);

  // Funções dos botões
  const handleDuplicateQuiz = async (quiz: any) => {
    try {
      const response = await apiRequest(`/api/quizzes/${quiz.id}/duplicate`, {
        method: 'POST'
      });
      
      if (response.quiz) {
        toast({
          title: "Quiz Duplicado",
          description: `Uma cópia de "${quiz.title}" foi criada com sucesso!`,
        });
        
        queryClient.invalidateQueries({ queryKey: ['/api/quizzes'] });
        queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
      }
    } catch (error) {
      console.error('Erro ao duplicar quiz:', error);
      toast({
        title: "Erro",
        description: "Não foi possível duplicar o quiz. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handlePreviewQuiz = (quiz: any) => {
    setPreviewQuiz(quiz);
    setShowQuizPreview(true);
  };

  const handlePublicUrl = (quiz: any) => {
    if (!quiz.isPublished) {
      toast({
        title: "Quiz não publicado",
        description: "Este quiz precisa ser publicado antes de ter uma URL pública.",
        variant: "destructive",
      });
      return;
    }
    
    const publicUrl = `${window.location.origin}/quiz/${quiz.id}`;
    navigator.clipboard.writeText(publicUrl).then(() => {
      toast({
        title: "URL Copiada",
        description: "A URL pública do quiz foi copiada para a área de transferência.",
      });
    }).catch((error) => {
      console.error('Erro ao copiar URL:', error);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a URL. Tente novamente.",
        variant: "destructive",
      });
    });
  };

  const handleDeleteQuiz = async (quiz: any) => {
    if (!confirm(`Tem certeza que deseja excluir o quiz "${quiz.title}"?`)) {
      return;
    }

    try {
      await apiRequest(`/api/quizzes/${quiz.id}`, {
        method: 'DELETE'
      });
      
      toast({
        title: "Quiz Excluído",
        description: `"${quiz.title}" foi excluído com sucesso.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
    } catch (error) {
      console.error('Erro ao excluir quiz:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o quiz. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const dashboardStats = [
    {
      title: "Quizzes Criados",
      value: totalQuizzes,
      icon: <BarChart3 className="w-5 h-5" />,
      color: "bg-blue-500"
    },
    {
      title: "Leads Capturados",
      value: totalLeads,
      icon: <Users className="w-5 h-5" />,
      color: "bg-purple-500"
    },
    {
      title: "Visualizações",
      value: totalViews,
      icon: <Eye className="w-5 h-5" />,
      color: "bg-green-500"
    },
    {
      title: "Taxa de Conversão",
      value: `${avgConversionRate}%`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "bg-orange-500"
    }
  ];

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Aplicar tema do modo fórum
  const dashboardClasses = forumMode 
    ? "min-h-screen bg-black text-white" 
    : "min-h-screen bg-background dashboard-background";

  return (
    <div className={dashboardClasses}>
      {/* Faixa de Plano - Sistema de Regressão Automática */}
      {showPlanBanner && showTrialBanner && (
        <div className={`${isBlocked || renewalRequired ? 'bg-gradient-to-r from-red-600 to-red-700' : 'bg-gradient-to-r from-green-600 to-emerald-600'} text-white p-4 shadow-lg`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isBlocked || renewalRequired ? (
                <Shield className="w-5 h-5 animate-pulse" />
              ) : (
                <Clock className="w-5 h-5" />
              )}
              <div>
                <span className="font-semibold">
                  {isBlocked ? (
                    '🔒 CONTA BLOQUEADA - Renovação Obrigatória'
                  ) : renewalRequired ? (
                    '⚠️ RENOVAÇÃO NECESSÁRIA'
                  ) : (
                    `Plano ${userPlan === 'enterprise' ? 'Enterprise' : 
                     userPlan === 'premium' ? 'Premium' : 
                     userPlan === 'basic' ? 'Básico' : 
                     userPlan === 'trial' ? 'Trial' : 
                     'Gratuito'}: ${daysLeft} dias restantes`
                  )}
                </span>
                <p className="text-sm opacity-90">
                  {isBlocked ? (
                    `${blockReason || 'Plano expirado'} - Todas as funcionalidades foram bloqueadas`
                  ) : renewalRequired ? (
                    'Seu plano expirou. Renove para reativar todas as funcionalidades.'
                  ) : daysLeft <= 3 ? (
                    '🚨 URGENTE: Renove agora para evitar bloqueio da conta!'
                  ) : daysLeft <= 7 ? (
                    '⚡ Últimos dias! Renove para continuar com todos os recursos.'
                  ) : userPlan === 'free' ? (
                    'Upgrade para acesso ilimitado e recursos premium.'
                  ) : (
                    'Renove seu plano para continuar aproveitando todos os recursos.'
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/planos">
                <Button 
                  variant="outline" 
                  className={`${isBlocked || renewalRequired ? 'bg-white text-red-600 hover:bg-red-50 border-white animate-pulse' : 'bg-white text-green-600 hover:bg-green-50 border-white'}`}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {isBlocked || renewalRequired ? 'RENOVAR AGORA' : userPlan === 'trial' || userPlan === 'free' ? 'Upgrade' : 'Renovar'}
                </Button>
              </Link>
              {!isBlocked && (
                <Link href="/credits">
                  <Button 
                    variant="outline" 
                    className="bg-white text-blue-600 hover:bg-blue-50 border-white"
                  >
                    <Coins className="w-4 h-4 mr-2" />
                    Comprar Créditos
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTrialBanner(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Banner de Push Notifications iOS PWA */}
      {pushNotificationState.isIOS && pushNotificationState.isPWA && pushNotificationState.hasPermission && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 animate-bounce" />
              <div>
                <span className="font-semibold">📱 Push Notifications Ativas</span>
                <p className="text-sm opacity-90">
                  Você receberá notificações na tela de bloqueio mesmo fora do app
                </p>
              </div>
            </div>
            <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
              iOS PWA
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className={cn(
                "text-3xl font-bold",
                forumMode ? "text-white" : "text-green-600"
              )}>
                {forumMode ? "Vendzz Fórum" : "Dashboard"}
              </h1>
              <p className={cn(
                "mt-2",
                forumMode ? "text-gray-300" : "dashboard-text-secondary"
              )}>
                {forumMode 
                  ? "Central de discussões e comunidade" 
                  : `Bem-vindo de volta, ${userData?.user?.firstName || "Admin"}!`
                }
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Status Indicator - Live */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75"></div>
                </div>
                <span className="text-sm font-medium text-green-600">Sistema Ativo</span>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowTutorial(true)}
                className="border-gray-300 text-black hover:bg-gray-50 transition-all duration-300"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Tutorial
              </Button>
              {!forumMode && (
                <Button
                  variant="outline"
                  onClick={toggleForumMode}
                  className="border-purple-200 text-purple-700 hover:bg-purple-50 mr-2"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Modo Fórum
                </Button>
              )}
              {forumMode && (
                <Button
                  variant="outline"
                  onClick={toggleForumMode}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 mr-2"
                >
                  Voltar Dashboard
                </Button>
              )}
              {userData?.user?.role === 'admin' && (
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/admin/push-admin'}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Push Admin
                </Button>
              )}
              <Button
                onClick={async () => {
                  console.log('🔵 BOTÃO TESTE PUSH CLICADO');
                  console.log('📍 Status atual:', {
                    permission: Notification.permission,
                    hasServiceWorker: 'serviceWorker' in navigator,
                    hasPushManager: 'PushManager' in window
                  });
                  
                  try {
                    if (Notification.permission === 'granted') {
                      console.log('✅ Permissão já concedida, verificando/configurando subscription...');
                      
                      // Registrar service worker se necessário
                      const registration = await navigator.serviceWorker.register('/sw-simple.js');
                      console.log('🔧 Service Worker verificado/registrado');
                      
                      // Obter VAPID key
                      const vapidResponse = await fetch('/api/push-simple/vapid');
                      const { publicKey: vapidPublicKey } = await vapidResponse.json();
                      console.log('🔑 VAPID key obtida para subscription');
                      
                      // Criar subscription REAL
                      const subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: vapidPublicKey
                      });
                      console.log('📝 Subscription REAL criada:', {
                        endpoint: subscription.endpoint.substring(0, 50) + '...',
                        keys: subscription.toJSON().keys
                      });
                      
                      // Salvar subscription no servidor
                      const subscribeResponse = await fetch('/api/push-simple/subscribe', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ subscription: subscription.toJSON() })
                      });
                      const subscribeResult = await subscribeResponse.json();
                      console.log('💾 Subscription salva no servidor:', subscribeResult);
                      
                      // Agora enviar push notification
                      console.log('📤 Enviando push notification...');
                      const response = await fetch('/api/push-simple/send', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                          title: "🔥 Teste Push Vendzz", 
                          message: "Sistema funcionando! Notificação na tela de bloqueio 📱" 
                        })
                      });
                      const result = await response.json();
                      console.log('📤 Resposta do servidor:', result);
                      
                      toast({
                        title: "Push Notification Enviada!",
                        description: `Enviado para ${result.stats?.success || 0} dispositivos`,
                      });
                    } else if (Notification.permission === 'default') {
                      console.log('❓ Solicitando permissões...');
                      const permission = await Notification.requestPermission();
                      console.log('📱 Resultado da permissão:', permission);
                      
                      if (permission === 'granted') {
                        console.log('✅ Permissão concedida! Configurando service worker...');
                        
                        // Registrar service worker
                        const registration = await navigator.serviceWorker.register('/sw-simple.js');
                        console.log('🔧 Service Worker registrado:', registration);
                        
                        // Obter VAPID key
                        const vapidResponse = await fetch('/api/push-simple/vapid');
                        const { publicKey: vapidPublicKey } = await vapidResponse.json();
                        console.log('🔑 VAPID key obtida:', vapidPublicKey?.substring(0, 20) + '...');
                        
                        // Criar subscription
                        const subscription = await registration.pushManager.subscribe({
                          userVisibleOnly: true,
                          applicationServerKey: vapidPublicKey
                        });
                        console.log('📝 Subscription criada:', subscription);
                        console.log('📝 Endpoint:', subscription.endpoint);
                        console.log('📝 Keys:', subscription.toJSON().keys);
                        
                        // Enviar subscription para servidor
                        const subscribeResponse = await fetch('/api/push-simple/subscribe', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ subscription: subscription.toJSON() })
                        });
                        const subscribeResult = await subscribeResponse.json();
                        console.log('💾 Subscription salva:', subscribeResult);
                        
                        toast({
                          title: "Permissões Concedidas!",
                          description: "Push notifications configuradas com sucesso!",
                        });
                      } else {
                        toast({
                          title: "Permissões Negadas",
                          description: "Não é possível enviar notificações",
                          variant: "destructive"
                        });
                      }
                    } else {
                      toast({
                        title: "Permissões Negadas",
                        description: "Notificações foram bloqueadas pelo usuário",
                        variant: "destructive"
                      });
                    }
                  } catch (error) {
                    console.error('❌ Erro no teste push:', error);
                    toast({
                      title: "Erro",
                      description: `Falha: ${error.message}`,
                      variant: "destructive"
                    });
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 shadow-lg text-white"
              >
                <Bell className="w-4 h-4 mr-2" />
                Testar Push
              </Button>
              <Link href="/push-admin">
                <Button className="bg-purple-600 hover:bg-purple-700 shadow-lg text-white">
                  <Bell className="w-4 h-4 mr-2" />
                  Enviar Push
                </Button>
              </Link>
              <Link href="/quizzes/new">
                <Button className="bg-green-600 hover:bg-green-700 shadow-lg text-white shock-green">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Quiz
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid - Conteúdo do fórum quando ativo */}
          {!forumMode ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {dashboardStats.map((stat, index) => (
                <Card key={index} className="dashboard-stat-card shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm dashboard-text-muted mb-1 text-gray-600 dark:text-gray-300">{stat.title}</p>
                        <p className="text-2xl font-bold dashboard-text-primary text-gray-900 dark:text-white">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-white`}>
                        {stat.icon}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // MODO FÓRUM - Conteúdo preto versão completa
            <div className="bg-black text-white min-h-screen">
              {/* Campanhas em linha minimalista */}
              <div className="flex gap-4 mb-6 overflow-x-auto p-4 bg-gray-900 rounded-lg">
                {dashboardStats.map((stat, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg min-w-fit">
                    <div className={`w-6 h-6 rounded ${stat.color} flex items-center justify-center`}>
                      {React.cloneElement(stat.icon, { className: "w-3 h-3 text-white" })}
                    </div>
                    <span className="text-sm font-medium text-white">{stat.value}</span>
                    <span className="text-xs text-gray-400">{stat.title}</span>
                  </div>
                ))}
              </div>

              {/* Conteúdo do Fórum */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Categorias do Fórum */}
                <div className="lg:col-span-2">
                  <h2 className="text-xl font-bold text-white mb-4">Categorias do Fórum</h2>
                  <div className="space-y-4">
                    {[
                      { 
                        title: "📈 Marketing Digital", 
                        description: "Estratégias, campanhas e cases de sucesso",
                        topics: 127,
                        posts: 489,
                        lastActivity: "2h atrás"
                      },
                      { 
                        title: "🧩 Quiz Builder", 
                        description: "Dicas e tutoriais para criar quizzes eficazes",
                        topics: 89,
                        posts: 312,
                        lastActivity: "1h atrás"
                      },
                      { 
                        title: "💼 Empreendedorismo", 
                        description: "Discussões sobre negócios e crescimento",
                        topics: 156,
                        posts: 623,
                        lastActivity: "30min atrás"
                      }
                    ].map((category, index) => (
                      <Card key={index} className="bg-gray-900 border-gray-700 hover:bg-gray-800 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-white mb-2">{category.title}</h3>
                              <p className="text-gray-400 text-sm mb-3">{category.description}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>{category.topics} tópicos</span>
                                <span>{category.posts} posts</span>
                                <span>Última atividade: {category.lastActivity}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Sidebar do Fórum */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Criar Nova Discussão</h3>
                  <Card className="bg-gray-900 border-gray-700 mb-6">
                    <CardContent className="p-4">
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Discussão
                      </Button>
                    </CardContent>
                  </Card>

                  <h3 className="text-lg font-semibold text-white mb-4">Discussões Recentes</h3>
                  <div className="space-y-3">
                    {[
                      { title: "Como aumentar conversão em 200%", author: "João Silva", time: "2h" },
                      { title: "Melhores práticas para SMS", author: "Maria Santos", time: "4h" },
                      { title: "Quiz para e-commerce", author: "Pedro Costa", time: "6h" },
                      { title: "Automação de WhatsApp", author: "Ana Paula", time: "1d" }
                    ].map((topic, index) => (
                      <Card key={index} className="bg-gray-900 border-gray-700 hover:bg-gray-800 transition-colors">
                        <CardContent className="p-3">
                          <h4 className="text-sm font-medium text-white mb-1">{topic.title}</h4>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>por {topic.author}</span>
                            <span>{topic.time}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Campanhas Row - Minimalista no modo fórum */}
          {!forumMode && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="dashboard-stat-card shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm dashboard-text-muted mb-1 text-gray-600 dark:text-gray-300">Campanhas SMS</p>
                    <p className="text-2xl font-bold dashboard-text-primary text-gray-900 dark:text-white">{smsCount?.count || 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-cyan-500 flex items-center justify-center text-white">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-stat-card shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm dashboard-text-muted mb-1 text-gray-600 dark:text-gray-300">Campanhas WhatsApp</p>
                    <p className="text-2xl font-bold dashboard-text-primary text-gray-900 dark:text-white">{whatsappCount?.count || 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center text-white">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-stat-card shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm dashboard-text-muted mb-1 text-gray-600 dark:text-gray-300">Campanhas Email</p>
                    <p className="text-2xl font-bold dashboard-text-primary text-gray-900 dark:text-white">{emailCount?.count || 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                    <Mail className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-stat-card shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm dashboard-text-muted mb-1 text-gray-600 dark:text-gray-300">Créditos Email</p>
                    <p className="text-2xl font-bold dashboard-text-primary text-gray-900 dark:text-white">{userCredits?.breakdown?.email || 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center text-white">
                    <Coins className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          )}

          {/* Conteúdo do Fórum em modo black */}
          {forumMode && (
            <div className="bg-black text-white p-8 rounded-lg">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-center">💬 Fórum da Comunidade Vendzz</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gray-900 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-green-400">📈 Marketing Digital</h3>
                    <p className="text-gray-300 text-sm mb-4">Estratégias, dicas e discussões sobre marketing digital</p>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>245 tópicos</span>
                      <span>1.2k mensagens</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-blue-400">🎯 Quiz Builder</h3>
                    <p className="text-gray-300 text-sm mb-4">Ajuda e tutoriais para criação de quizzes</p>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>189 tópicos</span>
                      <span>956 mensagens</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-purple-400">💼 Empreendedorismo</h3>
                    <p className="text-gray-300 text-sm mb-4">Discussões sobre negócios e crescimento</p>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>156 tópicos</span>
                      <span>743 mensagens</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">🔥 Discussões Recentes</h3>
                  <div className="space-y-4">
                    <div className="border-b border-gray-700 pb-4">
                      <h4 className="font-medium text-green-400 mb-2">Como aumentar a taxa de conversão dos meus quizzes?</h4>
                      <p className="text-gray-300 text-sm mb-2">Estou com uma taxa de 12% mas gostaria de melhorar...</p>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Por: @MarketingPro</span>
                        <span>23 respostas • 2h atrás</span>
                      </div>
                    </div>
                    
                    <div className="border-b border-gray-700 pb-4">
                      <h4 className="font-medium text-blue-400 mb-2">Melhores práticas para campanhas SMS</h4>
                      <p className="text-gray-300 text-sm mb-2">Compartilho aqui as estratégias que me deram 35% de conversão...</p>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Por: @SMSMaster</span>
                        <span>15 respostas • 4h atrás</span>
                      </div>
                    </div>
                    
                    <div className="pb-4">
                      <h4 className="font-medium text-purple-400 mb-2">Automatização de WhatsApp: vale a pena?</h4>
                      <p className="text-gray-300 text-sm mb-2">Quero implementar mas tenho dúvidas sobre compliance...</p>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Por: @AutomationGuru</span>
                        <span>8 respostas • 6h atrás</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-8">
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Criar Nova Discussão
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!forumMode && (
            <>
          {/* Seus Quizzes */}
          <Card className="dashboard-card shadow-xl mb-8">
            <CardHeader className="dashboard-header border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl dashboard-text-primary">Seus Quizzes</CardTitle>
                {userQuizzes && userQuizzes.length > 6 && (
                  <Link href="/quizzes">
                    <Button variant="outline" size="sm" className="dashboard-button">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Todos ({userQuizzes.length})
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {userQuizzes && userQuizzes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userQuizzes.slice(0, 6).map((quiz: any) => {
                    const analytics = quizAnalyticsMap.get(quiz.id) || { views: 0, leads: 0, conversions: 0 };
                    return (
                      <Card key={quiz.id} className="dashboard-quiz-card hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold dashboard-text-primary truncate">{quiz.title}</h3>
                            <Badge variant={quiz.isPublished ? "default" : "secondary"} className="dashboard-badge">
                              {quiz.isPublished ? 'Publicado' : 'Rascunho'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex justify-between text-sm dashboard-text-muted mb-3">
                            <span>{analytics.views} visualizações</span>
                            <span>{analytics.leads} leads</span>
                          </div>
                          <div className="flex gap-1">
                            <Link href={`/quizzes/${quiz.id}/edit`}>
                              <Button size="sm" variant="outline" className="dashboard-button">
                                <Edit className="w-3 h-3 mr-1" />
                                Editar
                              </Button>
                            </Link>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="dashboard-button"
                              onClick={() => handlePreviewQuiz(quiz)}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Visualizar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="dashboard-button bg-blue-50 hover:bg-blue-100 text-blue-600"
                              onClick={() => {
                                toast({
                                  title: "Clonar Quiz",
                                  description: `Quiz "${quiz.title}" será clonado em breve`,
                                });
                              }}
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Clonar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="dashboard-text-muted mb-4">Você ainda não criou nenhum quiz.</p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Link href="/quizzes/new">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Primeiro Quiz
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      className="bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border-purple-200 text-purple-700 font-semibold"
                      onClick={() => {
                        toast({
                          title: "Transforme VSL > Quiz",
                          description: "Funcionalidade de conversão será implementada em breve",
                          duration: 3000,
                        });
                      }}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Transforme VSL &gt; Quiz
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usuários Online */}
          <Card className="dashboard-card shadow-xl mb-6">
            <CardHeader className="dashboard-header border-b">
              <CardTitle className="text-xl dashboard-text-primary flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Usuários Online
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                  {onlineStats?.onlineCount || 42} pessoas
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {onlineStatsLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Atividades Recentes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Atividades Recentes
                      </h4>
                      <div className="space-y-2">
                        {onlineStats?.recentActivities?.slice(0, 5)?.map((activity: any, index: number) => (
                          <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="font-medium">{activity.userName}</span>
                              <span className="text-gray-600">{activity.description}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="w-3 h-3" />
                              {activity.city}
                            </div>
                          </div>
                        )) || [
                          <div key="1" className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="font-medium">Maria Silva</span>
                              <span className="text-gray-600">criou um novo quiz</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="w-3 h-3" />
                              São Paulo
                            </div>
                          </div>,
                          <div key="2" className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="font-medium">João Santos</span>
                              <span className="text-gray-600">capturou novos leads</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="w-3 h-3" />
                              Rio de Janeiro
                            </div>
                          </div>,
                          <div key="3" className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="font-medium">Ana Costa</span>
                              <span className="text-gray-600">enviou uma campanha SMS</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="w-3 h-3" />
                              Belo Horizonte
                            </div>
                          </div>
                        ]}
                      </div>
                    </div>
                    
                    {/* Estatísticas */}
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-3">Estatísticas em Tempo Real</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Crescimento por Hora</span>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            +{onlineStats?.growth?.hourly || 5} usuários
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Top Cidade</span>
                          <span className="text-sm font-medium">
                            {onlineStats?.topCities?.[0]?.city || 'São Paulo'} ({onlineStats?.topCities?.[0]?.users || 12})
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Planos Premium</span>
                          <span className="text-sm font-medium text-green-600">
                            {onlineStats?.planDistribution?.premium || 8} usuários
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Link href="/analytics">
              <Card className="dashboard-card hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold dashboard-text-primary">Ver Analytics</h3>
                  <p className="text-sm dashboard-text-muted">Relatórios</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/credits">
              <Card className="dashboard-card hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Coins className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold dashboard-text-primary">Créditos</h3>
                  <p className="text-sm dashboard-text-muted">Saldo</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/planos">
              <Card className="dashboard-card hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold dashboard-text-primary">Planos</h3>
                  <p className="text-sm dashboard-text-muted">Upgrade</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/tutoriais">
              <Card className="dashboard-card hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold dashboard-text-primary">Tutoriais</h3>
                  <p className="text-sm dashboard-text-muted">Guias</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Tutorial Component */}
          {showTutorial && (
            <TutorialTour
              steps={dashboardTutorialSteps}
              isOpen={showTutorial}
              onClose={() => setShowTutorial(false)}
              onComplete={() => setShowTutorial(false)}
            />
          )}

          {/* Quiz Full Preview */}
          <QuizFullPreview
            quiz={previewQuiz}
            isOpen={showQuizPreview}
            onClose={() => {
              setShowQuizPreview(false);
              setPreviewQuiz(null);
            }}
          />
          </>
          )}
        </div>
      </div>
    </div>
  );
}