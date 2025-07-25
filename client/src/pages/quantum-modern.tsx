import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useQueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useQuantumAuth } from '@/hooks/useQuantumAuth';
import quantumQueryClient from '@/lib/quantumQueryClient';
import QuantumLogin from '@/components/QuantumLogin';
import { 
  Plus, CheckCircle, Mail, Settings, Brain, Clock, Users, Target, Calendar,
  Search, Filter, MoreHorizontal, Star, Flag, Tag, Bell, Zap, TrendingUp,
  BarChart3, PieChart, Activity, Globe, Smartphone, Archive, Trash2, Edit3,
  Repeat, RefreshCw, Home, User, Hash, Layers, Grid, List, LayoutGrid,
  X, Menu, Timer, Inbox, FolderOpen, Lightbulb, Sparkles, Flame, 
  ArrowUp, ArrowDown, Pause, Play, SkipForward, MessageCircle,
  FileText, Briefcase, Calendar as CalendarIcon, Clipboard, LogOut,
  Reply, Forward, Paperclip, Send, ChevronLeft, ChevronRight
} from 'lucide-react';

// Hook para dados reais com auto-atualização usando QueryClient independente
const useRealTimeData = () => {
  
  // Dashboard metrics que atualizam automaticamente
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['/api/dashboard-stats'],
    refetchInterval: 30000, // Atualiza a cada 30 segundos
    retry: false
  });

  // Tasks reais
  const { data: realTasks } = useQuery({
    queryKey: ['/api/tasks'],
    refetchInterval: 60000,
    retry: false
  });

  // Projects reais
  const { data: realProjects } = useQuery({
    queryKey: ['/api/projects'],
    refetchInterval: 60000,
    retry: false
  });

  // Emails reais
  const { data: realEmails } = useQuery({
    queryKey: ['/api/emails'],
    refetchInterval: 120000, // 2 minutos
    retry: false
  });

  // Recurring tasks reais
  const { data: realRecurring } = useQuery({
    queryKey: ['/api/recurring-tasks'],
    refetchInterval: 300000, // 5 minutos
    retry: false
  });

  return {
    dashboardStats: dashboardStats || {
      tasksToday: 0,
      emailsUnread: 0,
      activeProjects: 0,
      productivity: 0,
      weeklyGrowth: 0,
      completionRate: 0
    },
    realTasks: realTasks || [],
    realProjects: realProjects || [],
    realEmails: realEmails || [],
    realRecurring: realRecurring || [],
    isLoading
  };
};

// Interface principal do Quantum Tasks
const QuantumTasksModern = () => {
  const { isAuthenticated } = useQuantumAuth();
  const [activeTab, setActiveTab] = useState('inicio');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [composing, setComposing] = useState(false);
  const [emailFilter, setEmailFilter] = useState('all');
  const [showEmailConfig, setShowEmailConfig] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  
  const { dashboardStats, realTasks, realProjects, realEmails, realRecurring, isLoading } = useRealTimeData();

  // Sistema de detecção de dispositivo móvel
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sistema de swipe para mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  // Estados para configuração de email
  const [emailConfig, setEmailConfig] = useState({
    email: '',
    password: '',
    isConfiguring: false,
    isConnected: false,
    lastSync: null
  });

  // Configurar email em tempo real
  const configureEmailSync = async () => {
    if (!emailConfig.email || !emailConfig.password) {
      alert('Por favor, preencha email e senha');
      return;
    }

    setEmailConfig(prev => ({ ...prev, isConfiguring: true }));

    try {
      const response = await fetch('/api/email/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailConfig.email,
          password: emailConfig.password
        })
      });

      const result = await response.json();

      if (result.success) {
        setEmailConfig(prev => ({ 
          ...prev, 
          isConnected: true, 
          lastSync: new Date().toLocaleTimeString() 
        }));
        
        // Recarregar emails após configuração
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        
        alert('✅ Email sincronizado com sucesso! Recarregando...');
      } else {
        alert('❌ Erro: ' + result.error);
      }
    } catch (error) {
      alert('❌ Erro na configuração: ' + error.message);
    } finally {
      setEmailConfig(prev => ({ ...prev, isConfiguring: false }));
    }
  };

  // Verificar status da sincronização
  const checkEmailStatus = async () => {
    try {
      const response = await fetch('/api/email/status');
      const status = await response.json();
      
      setEmailConfig(prev => ({ 
        ...prev, 
        isConnected: status.connected,
        lastSync: status.connected ? new Date().toLocaleTimeString() : null
      }));
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  };

  // Verificar status ao carregar
  useEffect(() => {
    checkEmailStatus();
    // Verificar status a cada 30 segundos
    const interval = setInterval(checkEmailStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    const tabs = ['inicio', 'tarefas', 'inbox', 'projetos', 'lembretes', 'analytics'];
    const currentIndex = tabs.indexOf(activeTab);
    
    if (isLeftSwipe && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
    if (isRightSwipe && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  // Saudação inteligente baseada no horário
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  // Menu items
  const menuItems = [
    { id: 'inicio', label: 'INÍCIO', icon: Home, gradient: 'from-blue-500 to-purple-600' },
    { id: 'tarefas', label: 'TAREFAS', icon: CheckCircle, gradient: 'from-green-500 to-teal-600' },
    { id: 'inbox', label: 'INBOX', icon: Mail, gradient: 'from-red-500 to-pink-600' },
    { id: 'projetos', label: 'PROJETOS', icon: Briefcase, gradient: 'from-yellow-500 to-orange-600' },
    { id: 'lembretes', label: 'LEMBRETES', icon: Bell, gradient: 'from-purple-500 to-indigo-600' },
    { id: 'analytics', label: 'ANALYTICS', icon: BarChart3, gradient: 'from-cyan-500 to-blue-600' }
  ];

  // Sidebar para desktop
  const Sidebar = () => (
    <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-gray-900 to-black text-white z-30 transition-all duration-300 ${
      isMobile ? (sidebarOpen ? 'w-64' : 'w-0 overflow-hidden') : 'w-64'
    }`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Quantum Tasks
          </h1>
          {isMobile && (
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (isMobile) setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === item.id 
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg` 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
        
        <div className="absolute bottom-6 left-6 right-6">
          <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white">
            <LogOut className="h-4 w-4 mr-3" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  );

  // Abas horizontais para mobile
  const MobileTabs = () => (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-gray-900 to-black text-white z-20 md:hidden">
      <div 
        className="flex overflow-x-auto scrollbar-hide py-3 px-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-shrink-0 flex flex-col items-center space-y-1 px-4 py-2 mx-1 rounded-lg transition-all duration-200 ${
                activeTab === item.id 
                  ? `bg-gradient-to-r ${item.gradient} text-white` 
                  : 'text-gray-400'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // Componente de Email Compose (Spark-like)
  const EmailCompose = () => (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <Edit3 className="h-5 w-5" />
          <span>Nova Mensagem</span>
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setComposing(false)}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Input placeholder="Para:" />
          <Input placeholder="Assunto:" />
          <Textarea 
            placeholder="Escreva sua mensagem..." 
            className="min-h-[300px] resize-none"
          />
        </div>
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Star className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => setComposing(false)}>
              Cancelar
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
              <Send className="h-4 w-4 mr-2" />
              Enviar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Componente de visualização de email (Spark-like)
  const EmailView = ({ email }: { email: any }) => (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between border-b">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => setSelectedEmail(null)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h3 className="font-semibold">{email.subject}</h3>
            <p className="text-sm text-gray-500">{email.sender}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Star className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Archive className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-6">
        <div className="prose max-w-none">
          <p className="text-sm text-gray-500 mb-4">{email.date}</p>
          <div className="whitespace-pre-wrap">
            {email.content}
          </div>
        </div>
      </CardContent>
      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Reply className="h-4 w-4 mr-2" />
            Responder
          </Button>
          <Button variant="outline" size="sm">
            <Forward className="h-4 w-4 mr-2" />
            Encaminhar
          </Button>
        </div>
      </div>
    </Card>
  );

  // Lista de emails (Spark-like)
  const EmailList = () => (
    <div className="space-y-2">
      {Array.isArray(realEmails) && realEmails.map((email: any, index: number) => (
        <Card 
          key={index} 
          className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
            email.read ? 'bg-gray-50' : 'bg-white border-l-4 border-l-blue-500'
          }`}
          onClick={() => setSelectedEmail(email)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`font-medium ${!email.read ? 'text-gray-900' : 'text-gray-600'}`}>
                    {email.sender}
                  </span>
                  {email.important && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                  {email.hasAttachment && <Paperclip className="h-4 w-4 text-gray-400" />}
                </div>
                <p className={`text-sm mb-1 ${!email.read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                  {email.subject}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {email.preview}
                </p>
              </div>
              <div className="flex flex-col items-end space-y-1 ml-4">
                <span className="text-xs text-gray-500">{email.time}</span>
                {!email.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Renderização do conteúdo principal
  const renderContent = () => {
    if (activeTab === 'inbox') {
      if (composing) {
        return <EmailCompose />;
      }
      if (selectedEmail) {
        return <EmailView email={selectedEmail} />;
      }
      
      return (
        <div className="space-y-6">
          {/* Header do Inbox */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-600 bg-clip-text text-transparent">
                Inbox
              </h2>
              <Badge variant="secondary">
                {Array.isArray(realEmails) ? realEmails.filter((e: any) => !e.read).length : 0} não lidas
              </Badge>
            </div>
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowEmailConfig(true)}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Settings className="h-4 w-4 mr-2" />
                Config Email
              </Button>
              <Button 
                onClick={() => setComposing(true)}
                className="bg-gradient-to-r from-red-500 to-pink-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Compor
              </Button>
            </div>
          </div>

          {/* Filtros do Inbox */}
          <div className="flex items-center space-x-2 pb-4 border-b">
            <div className="flex items-center space-x-2">
              <Button 
                variant={emailFilter === 'all' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setEmailFilter('all')}
              >
                Todos
              </Button>
              <Button 
                variant={emailFilter === 'unread' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setEmailFilter('unread')}
              >
                Não lidos
              </Button>
              <Button 
                variant={emailFilter === 'important' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setEmailFilter('important')}
              >
                <Star className="h-4 w-4 mr-1" />
                Importantes
              </Button>
            </div>
            <div className="flex-1"></div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="Buscar emails..." 
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="ghost" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Lista de emails */}
          <EmailList />
        </div>
      );
    }

    if (activeTab === 'inicio') {
      return (
        <div className="space-y-6">
          {/* Saudação */}
          <div className="text-center py-8">
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              {getGreeting()}! 👋
            </h2>
            <p className="text-gray-600">Bem-vindo ao seu espaço de produtividade ultra-moderno</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Tarefas Hoje</p>
                    <p className="text-3xl font-bold text-blue-700">{dashboardStats?.tasksToday || 0}</p>
                  </div>
                  <CheckCircle className="h-12 w-12 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 text-sm font-medium">Emails Não Lidos</p>
                    <p className="text-3xl font-bold text-red-700">{dashboardStats?.emailsUnread || 0}</p>
                  </div>
                  <Mail className="h-12 w-12 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Projetos Ativos</p>
                    <p className="text-3xl font-bold text-green-700">{dashboardStats?.activeProjects || 0}</p>
                  </div>
                  <Briefcase className="h-12 w-12 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progresso */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <span>Produtividade Semanal</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Progresso</span>
                    <span className="font-semibold">{dashboardStats?.productivity || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${dashboardStats?.productivity || 0}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-green-500" />
                  <span>Taxa de Conclusão</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Eficiência</span>
                    <span className="font-semibold">{dashboardStats?.completionRate || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-teal-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${dashboardStats?.completionRate || 0}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    // Outras abas (implementação básica)
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">
          {menuItems.find(item => item.id === activeTab)?.label}
        </h2>
        <p className="text-gray-600">Conteúdo em desenvolvimento...</p>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={quantumQueryClient}>
        <QuantumLogin onLogin={() => {}} isLoading={false} />
      </QueryClientProvider>
    );
  }

  // Modal de Configuração de Email
  const EmailConfigModal = () => (
    showEmailConfig && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Configurar Email @zynt.com.br</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowEmailConfig(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                placeholder="seu-email@zynt.com.br"
                className="w-full px-3 py-2 border rounded-md"
                value={emailConfig.email}
                onChange={(e) => setEmailConfig(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Senha</label>
              <input
                type="password"
                placeholder="Sua senha de email"
                className="w-full px-3 py-2 border rounded-md"
                value={emailConfig.password}
                onChange={(e) => setEmailConfig(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
            
            {emailConfig.isConnected && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center text-green-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Conectado - Última sincronização: {emailConfig.lastSync}
                </div>
              </div>
            )}
            
            <div className="flex space-x-2">
              <Button
                onClick={configureEmailSync}
                disabled={emailConfig.isConfiguring}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {emailConfig.isConfiguring ? 'Conectando...' : 'Conectar & Sincronizar'}
              </Button>
              <Button variant="outline" onClick={() => setShowEmailConfig(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  );

  return (
    <QueryClientProvider client={quantumQueryClient}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Overlay para mobile quando sidebar está aberta */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar Desktop / Mobile */}
        <Sidebar />

        {/* Abas Mobile */}
        <MobileTabs />

        {/* Botão de menu mobile */}
        {isMobile && (
          <Button
            className="fixed top-4 left-4 z-30 md:hidden bg-gradient-to-r from-blue-500 to-purple-600"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}

        {/* Conteúdo principal */}
        <main className={`transition-all duration-300 ${
          isMobile ? 'pt-20 px-4 pb-4' : 'ml-64 p-8'
        }`}>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            renderContent()
          )}
        </main>

        {/* Modal de configuração de email */}
        <EmailConfigModal />
      </div>
    </QueryClientProvider>
  );
};

export default QuantumTasksModern;