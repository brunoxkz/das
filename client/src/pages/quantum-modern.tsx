import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useQuantumAuth } from '@/hooks/useQuantumAuth';
import QuantumLogin from '@/components/QuantumLogin';
import { 
  Plus, CheckCircle, Mail, Settings, Brain, Clock, Users, Target, Calendar,
  Search, Filter, MoreHorizontal, Star, Flag, Tag, Bell, Zap, TrendingUp,
  BarChart3, PieChart, Activity, Globe, Smartphone, Archive, Trash2, Edit3,
  Repeat, RefreshCw, Home, User, Hash, Layers, Grid, List, LayoutGrid,
  X, Menu, Timer, Inbox, FolderOpen, Lightbulb, Sparkles, Flame, 
  ArrowUp, ArrowDown, Pause, Play, SkipForward, MessageCircle,
  FileText, Briefcase, Calendar as CalendarIcon, Clipboard, LogOut
} from 'lucide-react';

// Hook para dados reais com auto-atualização
const useRealTimeData = () => {
  const queryClient = useQueryClient();
  
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
  // TODOS os hooks devem ser chamados SEMPRE, no topo do componente
  const { user, isLoading: authLoading, isAuthenticated, login, logout } = useQuantumAuth();
  const [activeTab, setActiveTab] = useState('inicio');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { dashboardStats, realTasks, realProjects, realEmails, realRecurring, isLoading } = useRealTimeData();

  // Atualização automática visual do time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Lógica de autenticação após todos os hooks
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
          <span>Carregando Quantum Tasks...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <QuantumLogin onLogin={login} isLoading={authLoading} />;
  }

  const tabs = [
    { id: 'inicio', label: 'INICIO', icon: Home, color: 'from-blue-500 to-purple-600' },
    { id: 'tarefas', label: 'Tarefas', icon: CheckCircle, color: 'from-green-500 to-emerald-600' },
    { id: 'projetos', label: 'Projetos', icon: FolderOpen, color: 'from-purple-500 to-pink-600' },
    { id: 'lembretes', label: 'Lembretes', icon: Timer, color: 'from-orange-500 to-red-600' },
    { id: 'inbox', label: 'Inbox', icon: Inbox, color: 'from-cyan-500 to-blue-600' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'from-indigo-500 to-purple-600' },
  ];

  const TabHeader = () => (
    <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo e Brand */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Quantum Tasks
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Navigation Tabs - Estilo TickTick moderno */}
        <div className="flex items-center bg-slate-100/50 dark:bg-slate-800/50 rounded-xl p-1 backdrop-blur-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
              }`}
            >
              {activeTab === tab.id && (
                <div className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-lg shadow-lg`} />
              )}
              <tab.icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar
          </Button>
          <Button variant="outline" size="icon" className="rounded-xl">
            <Search className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-xl">
            <Bell className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            onClick={logout}
            className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 hover:border-red-300"
            title="Sair do Quantum Tasks"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  );

  // Dashboard INICIO com dados reais e auto-atualização
  const InicioTab = () => (
    <div className="p-6 space-y-6">
      {/* Header com saudação inteligente */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {(() => {
              const hour = currentTime.getHours();
              if (hour < 12) return 'Bom dia! ☀️';
              if (hour < 18) return 'Boa tarde! 🌤️';
              return 'Boa noite! 🌙';
            })()}
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            {currentTime.toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <Button variant="outline" className="rounded-xl" disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </div>

      {/* Métricas principais - Dados reais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Tarefas Hoje</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{dashboardStats.tasksToday}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +{dashboardStats.weeklyGrowth}% esta semana
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Emails Não Lidos</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{dashboardStats.emailsUnread}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">Gmail + Outlook</p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Projetos Ativos</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">{dashboardStats.activeProjects}</p>
                <p className="text-xs text-green-600 dark:text-green-400">2 finalizando</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Produtividade</p>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{dashboardStats.productivity}%</p>
                <p className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  Meta: 85%
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seções de conteúdo com dados reais */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tarefas urgentes */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <Flame className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                Tarefas Urgentes
              </span>
              <Badge variant="destructive" className="rounded-full">
                {realTasks.filter(task => task.priority === 'alta').length} urgentes
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {realTasks.slice(0, 3).map((task, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <CheckCircle className="w-5 h-5 text-slate-400 hover:text-green-500 cursor-pointer transition-colors" />
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">{task.title || `Tarefa prioritária ${index + 1}`}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{task.project || 'Projeto Quantum'}</p>
                </div>
                <Badge variant="destructive" className="text-xs">
                  {task.priority || 'alta'}
                </Badge>
              </div>
            ))}
            {realTasks.length === 0 && (
              <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma tarefa urgente</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Próximos lembretes */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Timer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                Próximos Lembretes
              </span>
              <Badge className="rounded-full bg-blue-100 text-blue-700">
                {realRecurring.length} ativos
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {realRecurring.slice(0, 3).map((reminder, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <Timer className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">{reminder.title || `Lembrete ${index + 1}`}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{reminder.nextOccurrence || 'Em alguns minutos'}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {reminder.frequency || 'diário'}
                </Badge>
              </div>
            ))}
            {realRecurring.length === 0 && (
              <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                <Timer className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum lembrete ativo</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Outras abas simplificadas (a serem expandidas)
  const TarefasTab = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Gerenciamento de Tarefas</h2>
      <p className="text-slate-600 dark:text-slate-300">Sistema avançado de tarefas em desenvolvimento...</p>
    </div>
  );

  const ProjetosTab = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Projetos Colaborativos</h2>
      <p className="text-slate-600 dark:text-slate-300">Gerenciamento de projetos em desenvolvimento...</p>
    </div>
  );

  const LembretesTab = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Lembretes Precisos</h2>
      <p className="text-slate-600 dark:text-slate-300">Sistema de lembretes com precisão hora/minuto em desenvolvimento...</p>
    </div>
  );

  const InboxTab = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Multi-Email Inbox</h2>
      <p className="text-slate-600 dark:text-slate-300">Inbox inteligente em desenvolvimento...</p>
    </div>
  );

  const AnalyticsTab = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Analytics Inteligente</h2>
      <p className="text-slate-600 dark:text-slate-300">Relatórios de produtividade em desenvolvimento...</p>
    </div>
  );

  // Modal de criação moderno
  const CreateModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md border-0 shadow-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <span>Criar Novo Item</span>
            <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)}>
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-20 flex-col gap-2 border-2 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-sm font-medium">Tarefa</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 border-2 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20">
              <FolderOpen className="w-6 h-6 text-purple-600" />
              <span className="text-sm font-medium">Projeto</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 border-2 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20">
              <Timer className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium">Lembrete</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 border-2 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20">
              <Mail className="w-6 h-6 text-orange-600" />
              <span className="text-sm font-medium">Email</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'inicio': return <InicioTab />;
      case 'tarefas': return <TarefasTab />;
      case 'projetos': return <ProjetosTab />;
      case 'lembretes': return <LembretesTab />;
      case 'inbox': return <InboxTab />;
      case 'analytics': return <AnalyticsTab />;
      default: return <InicioTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      <TabHeader />
      <main className="transition-all duration-300">
        {renderActiveTab()}
      </main>
      {showCreateModal && <CreateModal />}
    </div>
  );
};

export default QuantumTasksModern;