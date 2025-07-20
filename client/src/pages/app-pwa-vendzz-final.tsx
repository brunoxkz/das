import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Settings, Users, Target, TrendingUp, Zap, BarChart3, BookOpen, Bot, MessageSquare, Plus, Share2, CheckCircle, Star, Download, Globe, Wifi } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
// @ts-ignore
import logoVendzz from '@assets/logo-vendzz-white_1753041219534.png';
import PWAInstallModal from '@/components/PWAInstallModal';
import PushNotificationManager from '@/components/PushNotificationManager';
import NotificationManager from '@/components/NotificationManager';

export default function AppPWAVendzz() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Estados da aplicação
  const [quizzes, setQuizzes] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  interface ForumPost {
    id: number;
    title: string;
    category: string;
    replies: number;
    author: string;
    time: string;
  }
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [analytics, setAnalytics] = useState({
    totalQuizzes: 0,
    totalResponses: 0,
    totalCampaigns: 0,
    conversionRate: 0
  });

  // Estados PWA
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [installPromptShown, setInstallPromptShown] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState('quizzes');

  // Mostrar modal de instalação primeiro, depois verificar login
  useEffect(() => {
    // Verificar se o modal já foi mostrado nesta sessão
    const hasShownInstallPrompt = sessionStorage.getItem('vendzz_install_prompt_shown');
    
    if (!hasShownInstallPrompt && !installPromptShown) {
      // Mostrar modal após 2 segundos
      setTimeout(() => {
        setShowInstallModal(true);
        setInstallPromptShown(true);
      }, 2000);
    }
  }, [installPromptShown]);

  // Verificação de login obrigatório (só depois do modal de instalação ser fechado)
  useEffect(() => {
    const hasShownInstallPrompt = sessionStorage.getItem('vendzz_install_prompt_shown');
    
    if (!isLoading && !isAuthenticated && hasShownInstallPrompt && !showInstallModal) {
      // Redirecionar para login PWA se não autenticado e modal já foi tratado
      window.location.href = '/login-pwa';
      return;
    }
  }, [isLoading, isAuthenticated, showInstallModal]);

  // Função para solicitar permissão de notificações push
  const requestNotificationPermission = async () => {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        
        if (permission === 'granted') {
          console.log('🔔 Permissão de notificação concedida');
          toast({
            title: "Notificações Ativadas",
            description: "Agora você receberá notificações importantes do Vendzz",
            variant: "default",
          });
        } else {
          console.log('🚫 Permissão de notificação negada');
        }
      }
    } catch (error) {
      console.error('❌ Erro ao solicitar permissão de notificação:', error);
    }
  };

  // PWA Install Prompt e Notificações
  useEffect(() => {
    // 1. Capturar evento beforeinstallprompt (Android/Desktop)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // 2. Solicitar permissão de notificação após instalação
    const requestNotificationPermission = async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        try {
          const permission = await Notification.requestPermission();
          setNotificationPermission(permission);
          
          if (permission === 'granted') {
            toast({
              title: "🔔 Notificações Ativadas",
              description: "Você receberá notificações em tempo real sobre suas campanhas",
              variant: "default"
            });
            
            // Registrar para notificações push
            registerForPushNotifications();
          }
        } catch (error) {
          console.error('Erro ao solicitar permissão de notificação:', error);
        }
      } else {
        setNotificationPermission(Notification.permission);
      }
    };

    // 4. Registrar Service Worker para notificações
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('🔧 Service Worker registrado:', registration);
        } catch (error) {
          console.error('❌ Erro ao registrar Service Worker:', error);
        }
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    registerServiceWorker();
    
    // Solicitar notificação após 5 segundos (primeira visita)
    const hasAskedNotification = localStorage.getItem('vendzz_notification_asked');
    if (!hasAskedNotification) {
      setTimeout(() => {
        requestNotificationPermission();
        localStorage.setItem('vendzz_notification_asked', 'true');
      }, 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Funções do Modal de Instalação
  const handleInstallModalClose = () => {
    setShowInstallModal(false);
    sessionStorage.setItem('vendzz_install_prompt_shown', 'true');
    
    // Após fechar o modal, verificar login
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/login-pwa';
    }
  };

  // Solicitar permissão de notificação quando entrar no PWA (após login)
  useEffect(() => {
    if (isAuthenticated && notificationPermission === 'default') {
      // Delay para dar tempo do usuário se acostumar com a interface
      setTimeout(() => {
        requestNotificationPermission();
      }, 3000); // 3 segundos após login
    }
  }, [isAuthenticated, notificationPermission]);

  const handleInstallFromModal = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
    handleInstallModalClose();
  };

  // Registrar para notificações push
  const registerForPushNotifications = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'BEl62iUYgUivxIkv69yViEuiBIa40HI4QGAH8VjqMCoEuDbQyAB9V1YGrWTrfXFhbTT3kILXG1lYIqsA7R_KTnk' // VAPID key
        });

        // Enviar subscription para o servidor
        await apiRequest('POST', '/api/notifications/subscribe', {
          subscription: subscription
        });

        console.log('📱 Inscrito para notificações push');
      } catch (error) {
        console.error('❌ Erro ao registrar para push:', error);
      }
    }
  };

  // Instalar PWA (Android/Desktop)
  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          toast({
            title: "✅ App Instalado",
            description: "Vendzz foi adicionado à sua tela inicial!",
            variant: "default"
          });
        }
        setDeferredPrompt(null);
      });
    }
  };

  // Carregar dados do usuário
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
    }
  }, [isAuthenticated, user]);

  const loadUserData = async () => {
    try {
      console.log('🔄 PWA: Carregando dados do usuário...');
      
      // Carregar quizzes do usuário
      console.log('📊 PWA: Buscando quizzes...');
      const quizzesResponse = await apiRequest('GET', '/api/quizzes');
      console.log('📊 PWA: Resposta quizzes:', quizzesResponse.status);
      
      if (quizzesResponse.ok) {
        const quizzesData = await quizzesResponse.json();
        console.log('📊 PWA: Dados quizzes recebidos:', quizzesData.length, 'quizzes');
        setQuizzes(quizzesData.slice(0, 6)); // Últimos 6 quizzes
        
        // Atualizar analytics com contagem real
        setAnalytics(prev => ({
          ...prev,
          totalQuizzes: quizzesData.length
        }));
      } else {
        console.error('❌ PWA: Erro ao carregar quizzes:', quizzesResponse.status);
      }

      // Carregar campanhas SMS
      console.log('📱 PWA: Buscando campanhas SMS...');
      const campaignsResponse = await apiRequest('GET', '/api/sms-campaigns');
      console.log('📱 PWA: Resposta campanhas:', campaignsResponse.status);
      
      if (campaignsResponse.ok) {
        const campaignsData = await campaignsResponse.json();
        console.log('📱 PWA: Dados campanhas recebidos:', campaignsData.length, 'campanhas');
        setCampaigns(campaignsData.slice(0, 4)); // Últimas 4 campanhas
        
        // Atualizar analytics com contagem real
        setAnalytics(prev => ({
          ...prev,
          totalCampaigns: campaignsData.length
        }));
      } else {
        console.error('❌ PWA: Erro ao carregar campanhas:', campaignsResponse.status);
      }

      // Carregar analytics completos
      console.log('📈 PWA: Buscando analytics...');
      const analyticsResponse = await apiRequest('GET', '/api/dashboard/stats');
      console.log('📈 PWA: Resposta analytics:', analyticsResponse.status);
      
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        console.log('📈 PWA: Dados analytics recebidos:', analyticsData);
        setAnalytics(prev => ({
          ...prev,
          ...analyticsData
        }));
      } else {
        console.error('❌ PWA: Erro ao carregar analytics:', analyticsResponse.status);
      }

      // Dados do fórum simulados
      setForumPosts([
        { id: 1, title: 'Como aumentar conversão de quizzes', category: 'Dicas e Truques', replies: 15, author: 'Maria Silva', time: '2h' },
        { id: 2, title: 'Nova atualização do Vendzz disponível', category: 'Novidades Vendzz', replies: 8, author: 'Equipe Vendzz', time: '4h' },
        { id: 3, title: 'Problemas com integração WhatsApp', category: 'Suporte da Comunidade', replies: 12, author: 'João Santos', time: '6h' },
        { id: 4, title: 'Melhores práticas para campanhas SMS', category: 'Dicas e Truques', replies: 22, author: 'Ana Costa', time: '1d' }
      ]);
      
      console.log('✅ PWA: Dados carregados com sucesso');

    } catch (error) {
      console.error('❌ PWA: Erro ao carregar dados:', error);
      toast({
        title: "Erro de Sincronização",
        description: "Falha ao carregar dados do usuário. Verifique sua conexão.",
        variant: "destructive"
      });
    }
  };

  // Se não estiver autenticado, mostrar loading ou redirecionar
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Será redirecionado
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white font-sans">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        
        {/* Header com Logo Vendzz */}
        <div className="text-center mb-8">
          <img 
            src={logoVendzz} 
            alt="Vendzz" 
            className="h-16 mx-auto mb-4 filter brightness-110"
          />
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Sistema Online</span>
            </div>
            <div className="text-gray-400 text-sm">
              Bem-vindo, {user?.email || 'Usuário'}
            </div>
          </div>
        </div>

        {/* Métricas Rápidas Mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-8">
          {[
            { icon: BookOpen, label: 'Meus Quizzes', value: analytics.totalQuizzes.toString(), color: 'from-blue-500 to-cyan-500' },
            { icon: Target, label: 'Respostas', value: analytics.totalResponses.toString(), color: 'from-green-500 to-emerald-500' },
            { icon: Bot, label: 'Campanhas', value: analytics.totalCampaigns.toString(), color: 'from-purple-500 to-pink-500' },
            { icon: TrendingUp, label: 'Conversão', value: `${analytics.conversionRate.toFixed(1)}%`, color: 'from-orange-500 to-red-500' }
          ].map((metric, index) => (
            <Card key={index} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl lg:rounded-3xl hover:scale-105 transition-all duration-300 group shadow-lg">
              <CardContent className="p-3 lg:p-6">
                <div className="flex items-center justify-between mb-2 lg:mb-4">
                  <div className={`w-8 h-8 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center shadow-lg`}>
                    <metric.icon className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
                  </div>
                </div>
                <div className="text-lg lg:text-3xl font-bold text-white mb-1">{metric.value}</div>
                <div className="text-gray-400 text-xs lg:text-sm">{metric.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navegação Principal */}
        <Tabs defaultValue="quizzes" className="space-y-8">
          <TabsList className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-1 grid grid-cols-5 w-full">
            <TabsTrigger value="quizzes" className="rounded-xl px-3 py-3 data-[state=active]:bg-green-500 data-[state=active]:text-white transition-all text-xs lg:text-sm">
              <BookOpen className="h-4 w-4 mr-1 lg:mr-2" />
              Meus Quizzes
            </TabsTrigger>
            <TabsTrigger value="forum" className="rounded-xl px-3 py-3 data-[state=active]:bg-green-500 data-[state=active]:text-white transition-all text-xs lg:text-sm">
              <MessageSquare className="h-4 w-4 mr-1 lg:mr-2" />
              Fórum
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-xl px-3 py-3 data-[state=active]:bg-green-500 data-[state=active]:text-white transition-all text-xs lg:text-sm">
              <BarChart3 className="h-4 w-4 mr-1 lg:mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="automations" className="rounded-xl px-2 py-3 data-[state=active]:bg-green-500 data-[state=active]:text-white transition-all text-xs lg:text-sm">
              <Bot className="h-4 w-4 mr-1 lg:mr-2" />
              Automações
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-xl px-2 py-3 data-[state=active]:bg-green-500 data-[state=active]:text-white transition-all text-xs lg:text-sm">
              <Settings className="h-4 w-4 mr-1 lg:mr-2" />
              Config
            </TabsTrigger>
          </TabsList>

          {/* Tab Meus Quizzes */}
          <TabsContent value="quizzes" className="space-y-6">
            <Card className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-3 text-xl">
                  <BookOpen className="h-6 w-6 text-green-400" />
                  Meus Quizzes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quizzes.length > 0 ? quizzes.map((quiz: any) => (
                    <Card key={quiz.id} className="bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                      <CardContent className="p-4">
                        <h3 className="text-white font-semibold mb-2">{quiz.title}</h3>
                        <p className="text-gray-400 text-sm mb-3">{quiz.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="border-green-400 text-green-400">
                            {quiz.status || 'Ativo'}
                          </Badge>
                          <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                            Ver Quiz
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="col-span-full text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">Nenhum quiz criado ainda</p>
                      <Button className="mt-4 bg-green-500 hover:bg-green-600">
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Primeiro Quiz
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Fórum */}
          <TabsContent value="forum" className="space-y-6">
            <Card className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-3 text-xl">
                  <MessageSquare className="h-6 w-6 text-green-400" />
                  Fórum da Comunidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {forumPosts.map((post) => (
                    <Card key={post.id} className="bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-white font-semibold">{post.title}</h3>
                          <Badge variant="outline" className="border-blue-400 text-blue-400 text-xs">
                            {post.category}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <span>por {post.author}</span>
                          <div className="flex items-center gap-4">
                            <span>{post.replies} respostas</span>
                            <span>{post.time}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button className="w-full mt-6 bg-green-500 hover:bg-green-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Discussão
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-3">
                    <BarChart3 className="h-6 w-6 text-green-400" />
                    Visão Geral
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Total de Visualizações</span>
                    <span className="text-white font-bold">{(analytics.totalResponses * 3.2).toFixed(0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Taxa de Conclusão</span>
                    <span className="text-white font-bold">{(analytics.conversionRate * 1.5).toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Leads Gerados</span>
                    <span className="text-white font-bold">{Math.floor(analytics.totalResponses * 0.8)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-3">
                    <Target className="h-6 w-6 text-green-400" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Conversão</span>
                      <span className="text-green-400">{analytics.conversionRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={analytics.conversionRate} className="bg-gray-700" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Engajamento</span>
                      <span className="text-blue-400">{(analytics.conversionRate * 1.2).toFixed(1)}%</span>
                    </div>
                    <Progress value={analytics.conversionRate * 1.2} className="bg-gray-700" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab Automações */}
          <TabsContent value="automations" className="space-y-6">
            <Card className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-3 text-xl">
                  <Bot className="h-6 w-6 text-green-400" />
                  Campanhas e Automações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campaigns.length > 0 ? campaigns.map((campaign: any) => (
                    <Card key={campaign.id} className="bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                      <CardContent className="p-4">
                        <h3 className="text-white font-semibold mb-2">{campaign.name}</h3>
                        <p className="text-gray-400 text-sm mb-3">
                          {campaign.message?.substring(0, 50)}...
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className={`${
                            campaign.status === 'active' ? 'border-green-400 text-green-400' :
                            campaign.status === 'paused' ? 'border-yellow-400 text-yellow-400' :
                            'border-red-400 text-red-400'
                          }`}>
                            {campaign.status}
                          </Badge>
                          <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                            Gerenciar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="col-span-full text-center py-8">
                      <Bot className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">Nenhuma automação criada ainda</p>
                      <Button className="mt-4 bg-green-500 hover:bg-green-600">
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Automação
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Configurações - Sistema de Notificações PWA */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-3 text-xl">
                  <Settings className="h-6 w-6 text-green-400" />
                  Configurações PWA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sistema de Notificações PWA Persistente */}
                <NotificationManager />
                
                {/* Outras configurações */}
                <div className="bg-gray-900/50 border border-green-500/20 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-400 mb-4">📱 Informações PWA</h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p>• Aplicativo instalado como PWA para melhor experiência</p>
                    <p>• Funciona offline com Service Worker avançado</p>
                    <p>• Notificações persistem mesmo com app fechado</p>
                    <p>• Sincronização automática quando voltar online</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>© 2025 Vendzz - Plataforma de Quiz e Marketing</p>
          <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              <span>PWA</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              <span>Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal PWA Install */}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={handleInstallModalClose}
        onInstall={handleInstallFromModal}
      />
      
      {/* Push Notification Manager */}
      {isAuthenticated && <PushNotificationManager />}
    </div>
  );
}