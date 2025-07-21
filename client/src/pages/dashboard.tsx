import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast, useToast } from '@/hooks/use-toast';
import {
  PlusCircle,
  BarChart3,
  Users,
  Eye,
  TrendingUp,
  MessageSquare,
  Phone,
  Mail,
  BookOpen,
  Settings,
  Bell,
  Zap,
  CreditCard,
  Coins,
  X,
  ArrowRight,
  MessageCircle,
  Send
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
// Removido import que estava causando problema

interface UserData {
  user?: {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  };
  credits?: {
    sms: number;
    email: number;
    whatsapp: number;
    voice: number;
    breakdown?: {
      email: number;
    };
  };
  plan?: {
    name: string;
    features: string[];
    expiresAt?: string;
    status?: string;
  };
}

interface DashboardStats {
  totalQuizzes: number;
  totalResponses: number;
  conversionRate: number;
  totalViews: number;
  campaignStats: {
    sms: number;
    email: number;
    whatsapp: number;
  };
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  isPublished: boolean;
  views?: number;
  responses?: number;
  createdAt?: string;
}

export default function Dashboard() {
  const [forumMode, setForumMode] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showTrialBanner, setShowTrialBanner] = useState(true);
  const [pushNotificationState, setPushNotificationState] = useState({
    isIOS: false,
    isPWA: false,
    hasPermission: false
  });
  
  const { data: userData, isLoading: userLoading } = useQuery<UserData>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    retry: false,
  });

  const { data: quizzes, isLoading: quizzesLoading } = useQuery<Quiz[]>({
    queryKey: ['/api/quizzes'],
    retry: false,
  });

  const toggleForumMode = () => setForumMode(!forumMode);

  useEffect(() => {
    console.log('🔍 Iniciando configuração push para usuário:', userData?.user?.id);
    
    // Detectar iOS PWA
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone === true;
    const hasPermission = Notification.permission === 'granted';
    
    setPushNotificationState({ isIOS, isPWA, hasPermission });
    console.log('ℹ️ Permissão já definida:', Notification.permission);
  }, [userData?.user?.id]);

  const userPlan = userData?.plan?.name || 'free';
  const planStatus = userData?.plan?.status || 'active';
  const expiresAt = userData?.plan?.expiresAt ? new Date(userData?.plan.expiresAt) : null;
  const now = new Date();
  const daysLeft = expiresAt ? Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;
  
  const isBlocked = planStatus === 'expired' || (expiresAt && expiresAt < now);
  const renewalRequired = daysLeft <= 7 && daysLeft > 0;

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen", forumMode ? "bg-black text-white" : "bg-gray-50")}>
      {/* Trial/Renewal Banner */}
      {showTrialBanner && (isBlocked || renewalRequired || userPlan === 'free' || userPlan === 'trial') && (
        <div className={`${isBlocked ? 'bg-gradient-to-r from-red-600 to-red-700' : renewalRequired ? 'bg-gradient-to-r from-orange-600 to-orange-700' : userPlan === 'trial' ? 'bg-gradient-to-r from-blue-600 to-blue-700' : 'bg-gradient-to-r from-green-600 to-green-700'} text-white p-4 shadow-md`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${isBlocked || renewalRequired ? 'bg-white animate-pulse' : 'bg-white/80'}`}></div>
              <div>
                <span className="font-semibold">
                  {isBlocked ? '🚨 CONTA BLOQUEADA - Renove agora!' : 
                   userPlan === 'trial' ? '⏰ Período Trial' : 
                   renewalRequired ? '⚡ Renovação Urgente' : 
                   '🚀 Upgrade Disponível'}
                </span>
                <p className="text-sm opacity-90">
                  {isBlocked ? (
                    'Sua conta está bloqueada. Renove para continuar usando o sistema.'
                  ) : userPlan === 'trial' ? (
                    `Seu trial expira em ${daysLeft} dias. Upgrade para continuar com acesso completo.`
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
                forumMode ? "text-gray-300" : "text-gray-600"
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
                  onClick={() => window.location.href = '/admin/bulk-push-messaging'}
                  className="border-green-200 text-green-700 hover:bg-green-50"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Mensagens Bulk
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
                        
                        // Enviar subscription para servidor
                        const subscribeResponse = await fetch('/api/push-simple/subscribe', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ subscription: subscription.toJSON() })
                        });
                        const subscribeResult = await subscribeResponse.json();
                        console.log('💾 Resultado subscribe:', subscribeResult);
                        
                        // Enviar primeira push notification
                        console.log('📤 Enviando primeira push após permissão...');
                        const response = await fetch('/api/push-simple/send', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            title: "🔥 Teste Push Vendzz", 
                            message: "Sistema funcionando! Notificação na tela de bloqueio 📱" 
                          })
                        });
                        const result = await response.json();
                        console.log('📤 Resultado final:', result);
                        
                        toast({
                          title: "Push Notification Enviada!",
                          description: `Permissão concedida e enviado para ${result.stats?.success || 0} dispositivos`,
                        });
                      } else {
                        console.log('❌ Permissão negada');
                        toast({
                          title: "Permissão Negada",
                          description: "É necessário permitir notificações para enviar mensagens",
                          variant: "destructive",
                        });
                      }
                    } else {
                      console.log('❌ Permissão explicitamente negada');
                      toast({
                        title: "Notificações Bloqueadas",
                        description: "Habilite as notificações nas configurações do navegador",
                        variant: "destructive",
                      });
                    }
                  } catch (error) {
                    console.error('❌ Erro no push notification:', error);
                    toast({
                      title: "Erro no Push",
                      description: "Erro ao enviar notificação push",
                      variant: "destructive",
                    });
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Bell className="w-4 h-4 mr-2" />
                Testar Push
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          {!forumMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Quizzes</CardTitle>
                  <PlusCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalQuizzes || 0}</div>
                  <p className="text-xs text-muted-foreground">+2 desde ontem</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Respostas</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalResponses || 0}</div>
                  <p className="text-xs text-muted-foreground">+12% desde ontem</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.conversionRate?.toFixed(1) || "0.0"}%</div>
                  <p className="text-xs text-muted-foreground">+5.2% desde ontem</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalViews || 0}</div>
                  <p className="text-xs text-muted-foreground">+18% desde ontem</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Actions */}
          {!forumMode && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlusCircle className="w-5 h-5" />
                    Ações Rápidas
                  </CardTitle>
                  <CardDescription>Criar novos conteúdos rapidamente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="/quiz-builder">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Criar Quiz
                    </Button>
                  </Link>
                  <Link href="/sms-campaigns">
                    <Button variant="outline" className="w-full">
                      <Phone className="w-4 h-4 mr-2" />
                      Campanha SMS
                    </Button>
                  </Link>
                  <Link href="/email-marketing">
                    <Button variant="outline" className="w-full">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Marketing
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="w-5 h-5" />
                    Seus Créditos
                  </CardTitle>
                  <CardDescription>Saldo atual de créditos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">SMS</span>
                    <Badge variant="outline">{userData?.credits?.sms || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Email</span>
                    <Badge variant="outline">{userData?.credits?.breakdown?.email || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">WhatsApp</span>
                    <Badge variant="outline">Ilimitado</Badge>
                  </div>
                  <Link href="/credits">
                    <Button variant="outline" size="sm" className="w-full">
                      <Coins className="w-4 h-4 mr-2" />
                      Comprar Créditos
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Campanhas Ativas
                  </CardTitle>
                  <CardDescription>Status das suas campanhas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      SMS
                    </span>
                    <Badge>{stats?.campaignStats?.sms || 0} ativas</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </span>
                    <Badge>{stats?.campaignStats?.email || 0} ativas</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </span>
                    <Badge>{stats?.campaignStats?.whatsapp || 0} ativas</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Seus Quizzes Section */}
          {!forumMode && (
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Seus Quizzes
                  </CardTitle>
                  <CardDescription>Gerencie e monitore seus quizzes</CardDescription>
                </CardHeader>
                <CardContent>
                  {quizzesLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                          <div className="flex gap-2">
                            <div className="h-8 bg-gray-200 rounded w-20"></div>
                            <div className="h-8 bg-gray-200 rounded w-20"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : !quizzes || quizzes.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">Nenhum quiz encontrado</p>
                      <Link href="/quiz-builder">
                        <Button className="bg-green-600 hover:bg-green-700">
                          <PlusCircle className="w-4 h-4 mr-2" />
                          Criar Primeiro Quiz
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {quizzes.slice(0, 10).map((quiz) => (
                        <div key={quiz.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">{quiz.title}</h3>
                              {quiz.description && (
                                <p className="text-sm text-gray-600 mb-2">{quiz.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Eye className="w-4 h-4" />
                                  {quiz.views || 0} visualizações
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  {quiz.responses || 0} respostas
                                </div>
                                <Badge variant={quiz.isPublished ? "default" : "secondary"}>
                                  {quiz.isPublished ? "Publicado" : "Rascunho"}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Link href={`/quiz-builder?id=${quiz.id}`}>
                                <Button size="sm" variant="outline">
                                  <Edit className="w-4 h-4 mr-1" />
                                  Editar
                                </Button>
                              </Link>
                              {quiz.isPublished && (
                                <Link href={`/quiz/${quiz.id}`}>
                                  <Button size="sm" variant="outline">
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    Ver
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {quizzes.length > 10 && (
                        <div className="text-center py-4">
                          <Link href="/quiz-list">
                            <Button variant="outline">
                              Ver todos os {quizzes.length} quizzes
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Forum Mode Content */}
          {forumMode && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Vendzz Community Forum</h2>
                <p className="text-gray-400 mb-8">Conecte-se com outros usuários e compartilhe experiências</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="font-semibold mb-2">Marketing Digital</h3>
                    <p className="text-sm text-gray-400">125 discussões ativas</p>
                  </div>
                  <div className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="font-semibold mb-2">Quiz Builder</h3>
                    <p className="text-sm text-gray-400">89 discussões ativas</p>
                  </div>
                  <div className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="font-semibold mb-2">Empreendedorismo</h3>
                    <p className="text-sm text-gray-400">67 discussões ativas</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}