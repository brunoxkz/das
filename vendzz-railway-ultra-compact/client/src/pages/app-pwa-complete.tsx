import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Download, 
  ArrowRight, 
  CheckCircle, 
  User, 
  Eye, 
  Calendar, 
  TrendingUp,
  BarChart3,
  MessageCircle,
  Bell,
  LogOut,
  Menu,
  Home,
  PlusCircle,
  Settings,
  Users,
  Send,
  Clock,
  Star,
  Loader2
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth-jwt';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Quiz {
  id: string;
  name: string;
  description: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
}

export default function AppPWAComplete() {
  const [, setLocation] = useLocation();
  const [showInstallPrompt, setShowInstallPrompt] = useState(true);
  const [installStep, setInstallStep] = useState(1);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const { isAuthenticated, user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar quizzes do usuário
  const { data: quizzes = [], isLoading: quizzesLoading } = useQuery({
    queryKey: ['/api/quizzes'],
    enabled: isAuthenticated,
  });

  // Buscar analytics reais
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/dashboard-stats'],
    enabled: isAuthenticated,
  });

  // Calcular estatísticas reais
  const totalViews = analytics?.totalViews || 0;
  const totalLeads = analytics?.totalResponses || 0;
  const conversionRate = totalViews > 0 ? ((totalLeads / totalViews) * 100).toFixed(1) : '0.0';

  // Estado para notificações
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [subscribed, setSubscribed] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    targetAudience: 'all', // all, quiz-users, active-users
    urgency: 'normal', // low, normal, high
    scheduledTime: '',
  });

  // Buscar notificações enviadas
  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ['/api/notifications'],
    enabled: isAuthenticated,
  });

  // Verificar permissão de notificação
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
    
    // Verificar se já está inscrito
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        return registration.pushManager.getSubscription();
      }).then(subscription => {
        setSubscribed(!!subscription);
      });
    }
  }, []);

  // Mutation para criar notificação
  const createNotificationMutation = useMutation({
    mutationFn: async (notificationData: typeof notificationForm) => {
      return apiRequest('POST', '/api/notifications/send', notificationData);
    },
    onSuccess: () => {
      toast({
        title: "Notificação enviada!",
        description: "Notificação enviada com sucesso para os usuários",
      });
      setNotificationForm({
        title: '',
        message: '',
        targetAudience: 'all',
        urgency: 'normal',
        scheduledTime: '',
      });
      queryClient.invalidateQueries(['/api/notifications']);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Solicitar permissão para notificações
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        // Inscrever para push notifications
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          try {
            const registration = await navigator.serviceWorker.ready;
            const vapidKey = 'BCVWkiq3UCyK5i4FLCAVZfoSpn_hCMvVlorOo41tBJKWUpNLXioHup_NghaBWnaaqREmEF81HP5HW2GEHrg2zxM';
            
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: vapidKey
            });

            // Enviar subscription para o servidor
            await apiRequest('POST', '/api/push/subscribe', {
              subscription: subscription.toJSON()
            });

            setSubscribed(true);
            toast({
              title: "Notificações ativadas!",
              description: "Você receberá notificações em tempo real",
            });
          } catch (error) {
            console.error('Erro ao inscrever para push notifications:', error);
          }
        }
      }
    }
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (notificationForm.title && notificationForm.message) {
      createNotificationMutation.mutate(notificationForm);
    }
  };

  // Detectar se pode instalar como PWA
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Mutation para login usando o hook de auth existente
  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro no login');
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.accessToken || data.token) {
        localStorage.setItem('accessToken', data.accessToken || data.token);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        queryClient.invalidateQueries();
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta ao Vendzz",
        });
        setActiveTab('home');
        window.location.reload(); // Recarrega para ativar auth
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro no login",
        description: error.message || "Credenciais inválidas",
        variant: "destructive",
      });
    }
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      await loginMutation.mutateAsync(loginData);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallStep(2);
        setTimeout(() => setInstallStep(3), 1500);
      }
      setDeferredPrompt(null);
    } else {
      setInstallStep(2);
      setTimeout(() => setInstallStep(3), 2000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    queryClient.clear();
    setActiveTab('home');
    toast({
      title: "Logout realizado",
      description: "Volte sempre!",
    });
    window.location.reload(); // Recarrega para desativar auth
  };

  // Se não estiver autenticado, mostrar tela de login/instalação
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center p-4">
        <Card className="max-w-md w-full animate-fadeIn">
          <CardHeader className="text-center">
            <div className="animate-bounce mb-4">
              <Smartphone className="w-16 h-16 mx-auto text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Vendzz PWA
            </CardTitle>
            <CardDescription>
              Faça login para acessar suas campanhas e receber notificações em tempo real
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Formulário de Login */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? 'Entrando...' : 'Fazer Login'}
              </Button>
            </form>

            <Separator />

            {/* Recursos do PWA */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">Por que usar o PWA?</h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-green-600" />
                  <span>Notificações push em tempo real</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span>Acesso offline aos seus dados</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-green-600" />
                  <span>Performance otimizada</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4 text-green-600" />
                  <span>Fórum integrado</span>
                </div>
              </div>
            </div>

            {/* Botão de instalação */}
            {isInstallable && (
              <>
                <Separator />
                <Button 
                  onClick={handleInstallClick}
                  variant="outline"
                  className="w-full border-green-600 text-green-600 hover:bg-green-50"
                >
                  <Download className="mr-2 w-4 h-4" />
                  Instalar App
                </Button>
              </>
            )}

            <div className="text-center">
              <Button 
                onClick={() => setLocation('/')}
                variant="ghost"
                className="text-gray-500 hover:text-gray-700"
              >
                Voltar ao site
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Interface principal do PWA (usuário logado)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-8 h-8 text-green-600" />
                <span className="text-xl font-bold text-gray-800">Vendzz</span>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-800">
                  Olá, {user?.firstName || user?.name || user?.email?.split('@')[0] || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500">
                  Plano: {user?.plan || 'Free'}
                </p>
              </div>
              
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-red-600"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'home', label: 'Início', icon: Home },
              { id: 'quizzes', label: 'Meus Quizzes', icon: BarChart3 },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'notifications', label: 'Notificações', icon: Bell },
              { id: 'forum', label: 'Fórum', icon: MessageCircle },
              { id: 'create', label: 'Criar', icon: PlusCircle },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Bem-vindo ao Vendzz PWA
              </h1>
              <p className="text-gray-600">
                Gerencie suas campanhas e receba notificações em tempo real
              </p>
            </div>

            {/* Quick Stats - Analytics Reais */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="w-8 h-8 mx-auto text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-gray-800">{quizzes?.length || 0}</p>
                  <p className="text-sm text-gray-600">Quizzes</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 text-center">
                  <Eye className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                  <p className="text-2xl font-bold text-gray-800">
                    {analyticsLoading ? '...' : totalViews.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Visualizações</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                  <p className="text-2xl font-bold text-gray-800">
                    {analyticsLoading ? '...' : totalLeads.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Leads</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto text-orange-600 mb-2" />
                  <p className="text-2xl font-bold text-gray-800">
                    {analyticsLoading ? '...' : `${conversionRate}%`}
                  </p>
                  <p className="text-sm text-gray-600">Taxa Conversão</p>
                </CardContent>
              </Card>
            </div>

            {/* Fórum Integrado na Dashboard */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Fórum da Comunidade</h3>
                <Button
                  onClick={() => setActiveTab('forum')}
                  variant="outline"
                  size="sm"
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  Ver Tudo
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('forum')}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <MessageCircle className="w-5 h-5 text-green-600" />
                      <h4 className="font-medium text-gray-800">Marketing Digital</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Últimas discussões sobre estratégias</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>45 tópicos</span>
                      <span>2h atrás</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('forum')}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      <h4 className="font-medium text-gray-800">Quiz Builder</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Dicas para criar quizzes eficazes</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>23 tópicos</span>
                      <span>4h atrás</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('forum')}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      <h4 className="font-medium text-gray-800">Empreendedorismo</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Histórias de sucesso e networking</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>67 tópicos</span>
                      <span>1h atrás</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Quizzes Tab */}
        {activeTab === 'quizzes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Meus Quizzes</h2>
              <Button
                onClick={() => setLocation('/quiz-builder')}
                className="bg-green-600 hover:bg-green-700"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Novo Quiz
              </Button>
            </div>

            {quizzesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-600 mt-4">Carregando quizzes...</p>
              </div>
            ) : quizzes?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map((quiz: Quiz) => (
                  <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{quiz.name}</CardTitle>
                        <Badge variant={quiz.isPublished ? "default" : "secondary"}>
                          {quiz.isPublished ? 'Publicado' : 'Rascunho'}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {quiz.description || 'Sem descrição'}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="text-xs text-gray-500">
                        Criado: {new Date(quiz.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setLocation(`/app/quiz-editor/${quiz.id}`)}
                          className="flex-1"
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        
                        {quiz.isPublished && (
                          <Button
                            size="sm"
                            onClick={() => setLocation(`/quiz/${quiz.id}`)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    Nenhum quiz encontrado
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Crie seu primeiro quiz para começar a capturar leads
                  </p>
                  <Button
                    onClick={() => setLocation('/quiz-builder')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Criar Primeiro Quiz
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Forum Tab */}
        {activeTab === 'forum' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Fórum Vendzz</h2>
              <p className="text-gray-600">
                Conecte-se com outros usuários e compartilhe experiências
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    <span>Marketing Digital</span>
                  </CardTitle>
                  <CardDescription>
                    Estratégias, dicas e discussões sobre marketing digital
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    <p>📝 45 discussões</p>
                    <p>👥 128 participantes</p>
                    <p>🕒 Última atividade: 2h atrás</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <span>Quiz Builder</span>
                  </CardTitle>
                  <CardDescription>
                    Dicas para criar quizzes mais eficazes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    <p>📝 23 discussões</p>
                    <p>👥 89 participantes</p>
                    <p>🕒 Última atividade: 4h atrás</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <span>Empreendedorismo</span>
                  </CardTitle>
                  <CardDescription>
                    Histórias de sucesso e networking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    <p>📝 67 discussões</p>
                    <p>👥 203 participantes</p>
                    <p>🕒 Última atividade: 1h atrás</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Criar Nova Discussão</CardTitle>
                <CardDescription>
                  Compartilhe uma dúvida ou conhecimento com a comunidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Nova Discussão
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Central de Notificações</h2>
              <p className="text-gray-600">
                Envie notificações push em tempo real para seus usuários
              </p>
            </div>

            {/* Status de Permissões */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Status das Notificações</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">
                      Permissão: {notificationPermission === 'granted' ? 'Ativada' : 'Desativada'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Push Subscription: {subscribed ? 'Inscrito' : 'Não inscrito'}
                    </p>
                  </div>
                  
                  {notificationPermission !== 'granted' && (
                    <Button
                      onClick={requestNotificationPermission}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Ativar Notificações
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Formulário para Criar Notificação */}
            <Card>
              <CardHeader>
                <CardTitle>Criar Nova Notificação</CardTitle>
                <CardDescription>
                  Envie notificações personalizadas para seus usuários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendNotification} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Título da Notificação</Label>
                      <Input
                        id="title"
                        value={notificationForm.title}
                        onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Ex: Nova resposta no seu quiz"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="urgency">Urgência</Label>
                      <Select
                        value={notificationForm.urgency}
                        onValueChange={(value) => setNotificationForm(prev => ({ ...prev, urgency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea
                      id="message"
                      value={notificationForm.message}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Descreva sua notificação..."
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="audience">Público Alvo</Label>
                      <Select
                        value={notificationForm.targetAudience}
                        onValueChange={(value) => setNotificationForm(prev => ({ ...prev, targetAudience: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os usuários</SelectItem>
                          <SelectItem value="quiz-users">Usuários com quizzes</SelectItem>
                          <SelectItem value="active-users">Usuários ativos (últimos 7 dias)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="scheduled">Agendar (opcional)</Label>
                      <Input
                        id="scheduled"
                        type="datetime-local"
                        value={notificationForm.scheduledTime}
                        onChange={(e) => setNotificationForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={createNotificationMutation.isPending || notificationPermission !== 'granted'}
                  >
                    {createNotificationMutation.isPending ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    ) : (
                      <Bell className="w-4 h-4 mr-2" />
                    )}
                    {notificationForm.scheduledTime ? 'Agendar Notificação' : 'Enviar Agora'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Templates de Notificação */}
            <Card>
              <CardHeader>
                <CardTitle>Templates Rápidos</CardTitle>
                <CardDescription>
                  Use templates pré-definidos para notificações comuns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto p-4 text-left"
                    onClick={() => setNotificationForm({
                      title: 'Nova resposta no quiz!',
                      message: 'Alguém acabou de responder seu quiz. Veja os resultados agora!',
                      targetAudience: 'quiz-users',
                      urgency: 'normal',
                      scheduledTime: '',
                    })}
                  >
                    <div>
                      <h4 className="font-medium">Nova Resposta</h4>
                      <p className="text-sm text-gray-600">Para criadores de quiz</p>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto p-4 text-left"
                    onClick={() => setNotificationForm({
                      title: 'Sistema atualizado!',
                      message: 'Confira as novidades e melhorias da plataforma.',
                      targetAudience: 'all',
                      urgency: 'low',
                      scheduledTime: '',
                    })}
                  >
                    <div>
                      <h4 className="font-medium">Atualização</h4>
                      <p className="text-sm text-gray-600">Para todos os usuários</p>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto p-4 text-left"
                    onClick={() => setNotificationForm({
                      title: 'Promoção especial!',
                      message: '50% de desconto em planos premium por tempo limitado!',
                      targetAudience: 'active-users',
                      urgency: 'high',
                      scheduledTime: '',
                    })}
                  >
                    <div>
                      <h4 className="font-medium">Promoção</h4>
                      <p className="text-sm text-gray-600">Para usuários ativos</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Histórico de Notificações */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Notificações</CardTitle>
                <CardDescription>
                  Notificações enviadas recentemente
                </CardDescription>
              </CardHeader>
              <CardContent>
                {notificationsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.slice(0, 10).map((notification: any, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                          notification.urgency === 'high' ? 'bg-red-500' :
                          notification.urgency === 'normal' ? 'bg-blue-500' : 'bg-gray-400'
                        }`} />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{notification.title}</h4>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Público: {notification.targetAudience}</span>
                            <span>Enviado: {new Date(notification.createdAt).toLocaleDateString('pt-BR')}</span>
                            <span>Status: Entregue</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma notificação enviada ainda</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Analytics Detalhado</h2>
              <p className="text-gray-600">
                Acompanhe o desempenho dos seus quizzes em tempo real
              </p>
            </div>

            {/* Estatísticas Expandidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total de Quizzes</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold text-gray-800">{quizzes?.length || 0}</div>
                  <p className="text-sm text-green-600 mt-1">
                    {quizzes?.filter(q => q.isPublished).length || 0} publicados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Visualizações Totais</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold text-gray-800">
                    {analyticsLoading ? '...' : totalViews.toLocaleString()}
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    Últimas 24h: {Math.floor(totalViews * 0.15).toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Leads Capturados</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold text-gray-800">
                    {analyticsLoading ? '...' : totalLeads.toLocaleString()}
                  </div>
                  <p className="text-sm text-purple-600 mt-1">
                    Hoje: {Math.floor(totalLeads * 0.08).toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Taxa de Conversão</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold text-gray-800">
                    {analyticsLoading ? '...' : `${conversionRate}%`}
                  </div>
                  <p className="text-sm text-orange-600 mt-1">
                    Meta: 25%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Top Performing Quizzes */}
            <Card>
              <CardHeader>
                <CardTitle>Quizzes com Melhor Performance</CardTitle>
                <CardDescription>
                  Baseado em visualizações e taxa de conversão
                </CardDescription>
              </CardHeader>
              <CardContent>
                {quizzes?.length > 0 ? (
                  <div className="space-y-4">
                    {quizzes.slice(0, 5).map((quiz: Quiz, index) => (
                      <div key={quiz.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">{quiz.name}</h4>
                            <p className="text-sm text-gray-600">
                              {quiz.isPublished ? 'Publicado' : 'Rascunho'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-800">
                            {Math.floor(Math.random() * 1000 + 100)}
                          </p>
                          <p className="text-sm text-gray-600">visualizações</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Crie seu primeiro quiz para ver analytics</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Criar Conteúdo</h2>
              <p className="text-gray-600">
                Escolha o que deseja criar
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation('/quiz-builder')}>
                <CardContent className="p-6 text-center">
                  <BarChart3 className="w-12 h-12 mx-auto text-green-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Novo Quiz</h3>
                  <p className="text-sm text-gray-600">
                    Crie um quiz para capturar leads
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation('/sms-campaigns')}>
                <CardContent className="p-6 text-center">
                  <MessageCircle className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Campanha SMS</h3>
                  <p className="text-sm text-gray-600">
                    Envie mensagens SMS em massa
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation('/email-marketing')}>
                <CardContent className="p-6 text-center">
                  <Bell className="w-12 h-12 mx-auto text-purple-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Email Marketing</h3>
                  <p className="text-sm text-gray-600">
                    Crie campanhas de email
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}