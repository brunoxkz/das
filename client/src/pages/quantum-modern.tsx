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
  Reply, Forward, Paperclip, Send, ChevronLeft, ChevronRight, Pin
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
  const [smartInboxEnabled, setSmartInboxEnabled] = useState(true);
  const [quickReplyDraft, setQuickReplyDraft] = useState('');
  const [emailActions, setEmailActions] = useState<Record<string, { 
    snoozedUntil?: Date; 
    pinned?: boolean; 
    category?: 'important' | 'personal' | 'notifications' | 'newsletters' 
  }>>({});
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

  // Estados para sistema multi-email
  const [emailAccounts, setEmailAccounts] = useState<Array<{
    id: string;
    email: string;
    provider: string;
    isConnected: boolean;
    lastSync: string;
    unreadCount: number;
  }>>([]);
  
  const [activeEmailAccount, setActiveEmailAccount] = useState<string | null>(null);
  
  const [newEmailForm, setNewEmailForm] = useState({
    email: '',
    password: '',
    provider: 'zynt',
    isConfiguring: false,
    imapSettings: {
      host: '',
      port: 993,
      secure: true,
      autoDetected: false
    }
  });

  // Detecção automática de configurações IMAP baseada no domínio
  const detectImapSettings = (email: string) => {
    const domain = email.split('@')[1]?.toLowerCase();
    
    const imapConfigs: Record<string, { host: string; port: number; secure: boolean }> = {
      'gmail.com': { host: 'imap.gmail.com', port: 993, secure: true },
      'outlook.com': { host: 'imap-mail.outlook.com', port: 993, secure: true },
      'hotmail.com': { host: 'imap-mail.outlook.com', port: 993, secure: true },
      'live.com': { host: 'imap-mail.outlook.com', port: 993, secure: true },
      'yahoo.com': { host: 'imap.mail.yahoo.com', port: 993, secure: true },
      'icloud.com': { host: 'imap.mail.me.com', port: 993, secure: true },
      'me.com': { host: 'imap.mail.me.com', port: 993, secure: true },
      'zynt.com.br': { host: 'mail.zynt.com.br', port: 993, secure: true },
      'aol.com': { host: 'imap.aol.com', port: 993, secure: true },
      'zoho.com': { host: 'imap.zoho.com', port: 993, secure: true }
    };

    const config = imapConfigs[domain];
    if (config) {
      setNewEmailForm(prev => ({
        ...prev,
        imapSettings: {
          ...config,
          autoDetected: true
        }
      }));
    } else {
      // Configuração genérica para domínios desconhecidos
      setNewEmailForm(prev => ({
        ...prev,
        imapSettings: {
          host: `mail.${domain}`,
          port: 993,
          secure: true,
          autoDetected: false
        }
      }));
    }
  };

  // Handler para mudança de email com detecção automática
  const handleEmailChange = (value: string) => {
    setNewEmailForm(prev => ({ ...prev, email: value }));
    
    // Detectar IMAP automaticamente se tiver @ no email
    if (value.includes('@') && value.split('@')[1]) {
      detectImapSettings(value);
    }
  };

  // Adicionar nova conta de email
  const addEmailAccount = async () => {
    if (!newEmailForm.email || !newEmailForm.password) {
      alert('Por favor, preencha email e senha');
      return;
    }

    setNewEmailForm(prev => ({ ...prev, isConfiguring: true }));

    try {
      const response = await fetch('/api/email/add-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmailForm.email,
          password: newEmailForm.password,
          provider: newEmailForm.provider
        })
      });

      const result = await response.json();

      if (result.success) {
        const newAccount = {
          id: result.accountId || Date.now().toString(),
          email: newEmailForm.email,
          provider: newEmailForm.provider,
          isConnected: true,
          lastSync: new Date().toLocaleTimeString(),
          unreadCount: 0
        };
        
        setEmailAccounts(prev => [...prev, newAccount]);
        setActiveEmailAccount(newAccount.id);
        setNewEmailForm({ 
          email: '', 
          password: '', 
          provider: 'zynt', 
          isConfiguring: false,
          imapSettings: { host: '', port: 993, secure: true, autoDetected: false }
        });
        setShowEmailConfig(false);
        
        alert('✅ Conta de email adicionada com sucesso!');
      } else {
        alert('❌ Erro: ' + result.error);
      }
    } catch (error) {
      alert('❌ Erro na configuração: ' + (error as Error).message);
    } finally {
      setNewEmailForm(prev => ({ ...prev, isConfiguring: false }));
    }
  };

  // Remover conta de email
  const removeEmailAccount = async (accountId: string) => {
    try {
      await fetch(`/api/email/remove-account/${accountId}`, { method: 'DELETE' });
      setEmailAccounts(prev => prev.filter(acc => acc.id !== accountId));
      if (activeEmailAccount === accountId) {
        setActiveEmailAccount(emailAccounts[0]?.id || null);
      }
    } catch (error) {
      console.error('Erro ao remover conta:', error);
    }
  };

  // Funcionalidades Spark-like
  const snoozeEmail = (emailId: string, hours: number) => {
    const snoozeUntil = new Date(Date.now() + hours * 60 * 60 * 1000);
    setEmailActions(prev => ({
      ...prev,
      [emailId]: { ...prev[emailId], snoozedUntil: snoozeUntil }
    }));
    
    // Auto-remove snooze quando o tempo expirar
    setTimeout(() => {
      setEmailActions(prev => {
        const updated = { ...prev };
        if (updated[emailId]) {
          delete updated[emailId].snoozedUntil;
        }
        return updated;
      });
    }, hours * 60 * 60 * 1000);
  };

  // Quick Actions for Spark-style email management
  const pinEmail = (emailId: string) => {
    setEmailActions(prev => ({
      ...prev,
      [emailId]: { ...prev[emailId], pinned: !prev[emailId]?.pinned }
    }));
  };

  const categorizeEmail = (emailId: string, category: 'important' | 'personal' | 'notifications' | 'newsletters') => {
    setEmailActions(prev => ({
      ...prev,
      [emailId]: { ...prev[emailId], category }
    }));
  };

  const quickReply = async (emailId: string, message: string) => {
    // Implementação de resposta rápida
    console.log(`Enviando resposta rápida para ${emailId}: ${message}`);
    setQuickReplyDraft('');
  };

  // Smart Inbox categorization (estilo Spark)
  const categorizeEmails = (emails: any[]) => {
    if (!smartInboxEnabled) return emails;
    
    return emails.map(email => {
      const content = email.content?.toLowerCase() || '';
      const subject = email.subject?.toLowerCase() || '';
      const sender = email.sender_email?.toLowerCase() || '';
      
      let autoCategory = 'personal';
      
      // Detectar newsletters
      if (content.includes('unsubscribe') || subject.includes('newsletter') || sender.includes('noreply')) {
        autoCategory = 'newsletters';
      }
      // Detectar notificações
      else if (subject.includes('notification') || subject.includes('alert') || sender.includes('notification')) {
        autoCategory = 'notifications';
      }
      // Detectar importantes (palavras-chave)
      else if (subject.includes('urgent') || subject.includes('important') || content.includes('asap')) {
        autoCategory = 'important';
      }
      
      return {
        ...email,
        autoCategory,
        userCategory: emailActions[email.id]?.category || autoCategory
      };
    });
  };

  // Filtrar emails baseado em snooze e categorias
  const filterEmails = (emails: any[]) => {
    const now = new Date();
    
    return emails.filter(email => {
      const actions = emailActions[email.id];
      
      // Filtrar emails com snooze ativo
      if (actions?.snoozedUntil && actions.snoozedUntil > now) {
        return emailFilter === 'snoozed';
      }
      
      // Filtrar por categoria
      if (emailFilter !== 'all' && emailFilter !== 'snoozed') {
        return email.userCategory === emailFilter;
      }
      
      return emailFilter === 'all' || emailFilter === 'snoozed';
    });
  };



  // Carregar contas de email existentes
  const loadEmailAccounts = async () => {
    try {
      const response = await fetch('/api/email/accounts');
      const accounts = await response.json();
      
      if (accounts.success) {
        setEmailAccounts(accounts.accounts || []);
        if (accounts.accounts?.length > 0 && !activeEmailAccount) {
          setActiveEmailAccount(accounts.accounts[0].id);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
    }
  };

  // Carregar contas ao inicializar
  useEffect(() => {
    loadEmailAccounts();
    // Atualizar status a cada 30 segundos
    const interval = setInterval(loadEmailAccounts, 30000);
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

  // Lista de emails com funcionalidades Spark avançadas
  const EmailList = ({ emails }: { emails: any[] }) => {
    // Separar emails fixados dos regulares
    const pinnedEmails = emails.filter(email => emailActions[email.id]?.pinned);
    const regularEmails = emails.filter(email => !emailActions[email.id]?.pinned);
    
    return (
      <div className="space-y-2">
        {/* Emails fixados */}
        {pinnedEmails.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 mb-2 flex items-center">
              <Pin className="h-3 w-3 mr-1" />
              FIXADOS
            </h4>
            {pinnedEmails.map((email: any, index: number) => (
              <EmailCard key={`pinned-${index}`} email={email} isPinned={true} />
            ))}
          </div>
        )}
        
        {/* Emails regulares */}
        {regularEmails.map((email: any, index: number) => (
          <EmailCard key={index} email={email} isPinned={false} />
        ))}
      </div>
    );
  };

  // Card de email individual com Quick Actions
  const EmailCard = ({ email, isPinned }: { email: any; isPinned: boolean }) => {
    const actions = emailActions[email.id] || {};
    const categoryColors: { [key: string]: string } = {
      important: 'border-l-red-500 bg-red-50',
      personal: 'border-l-blue-500 bg-blue-50', 
      notifications: 'border-l-yellow-500 bg-yellow-50',
      newsletters: 'border-l-green-500 bg-green-50'
    };

    return (
      <Card 
        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
          email.read ? 'bg-gray-50' : `bg-white border-l-4 ${categoryColors[email.userCategory] || 'border-l-blue-500'}`
        } ${isPinned ? 'ring-2 ring-purple-200' : ''}`}
        onClick={() => setSelectedEmail(email)}
      >
        <CardContent className="p-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className={`font-medium text-sm ${!email.read ? 'text-gray-900' : 'text-gray-600'}`}>
                  {email.sender || email.sender_email}
                </span>
                {isPinned && <Pin className="h-3 w-3 text-purple-500 fill-current" />}
                {actions.snoozedUntil && <Clock className="h-3 w-3 text-orange-500" />}
                {email.userCategory === 'important' && <Star className="h-3 w-3 text-red-500 fill-current" />}
                <span className="text-xs px-2 py-0.5 rounded text-gray-500 bg-gray-100">
                  {email.userCategory}
                </span>
              </div>
              <p className={`text-sm mb-1 ${!email.read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                {email.subject}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {email.content}
              </p>
            </div>
            <div className="flex flex-col items-end space-y-1 ml-4">
              <span className="text-xs text-gray-500">{email.received_at}</span>
              <div className="flex items-center space-x-1">
                {/* Quick Actions */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-purple-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    pinEmail(email.id);
                  }}
                >
                  <Pin className={`h-3 w-3 ${isPinned ? 'text-purple-500 fill-current' : 'text-gray-400'}`} />
                </Button>
                <div className="relative group">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-orange-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Clock className="h-3 w-3 text-gray-400 group-hover:text-orange-500" />
                  </Button>
                  <div className="absolute right-0 top-8 bg-white shadow-lg rounded-lg p-2 hidden group-hover:block z-10">
                    <div className="space-y-1">
                      <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => snoozeEmail(email.id, 1)}>
                        1 hora
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => snoozeEmail(email.id, 4)}>
                        4 horas  
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => snoozeEmail(email.id, 24)}>
                        Amanhã
                      </Button>
                    </div>
                  </div>
                </div>
                {!email.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
              </div>
            </div>
          </div>
          
          {/* Quick Reply se habilitado */}
          {selectedEmail && selectedEmail.id === email.id && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Resposta rápida..."
                  value={quickReplyDraft}
                  onChange={(e) => setQuickReplyDraft(e.target.value)}
                  className="flex-1 h-8 text-sm"
                />
                <Button
                  size="sm"
                  className="h-8"
                  onClick={() => quickReply(email.id, quickReplyDraft)}
                >
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Renderização do conteúdo principal
  const renderContent = () => {
    if (activeTab === 'inbox') {
      if (composing) {
        return <EmailCompose />;
      }
      if (selectedEmail) {
        return <EmailView email={selectedEmail} />;
      }
      
      // Processar emails com categorização e filtros
      const emailsArray = Array.isArray(realEmails) ? realEmails : [];
      const categorizedEmails = categorizeEmails(emailsArray);
      const filteredEmails = filterEmails(categorizedEmails);
      
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
            <div className="flex items-center space-x-2">
              {/* Selector de contas */}
              {emailAccounts.length > 0 && (
                <select
                  className="px-3 py-1 text-sm border rounded-md bg-white"
                  value={activeEmailAccount || ''}
                  onChange={(e) => setActiveEmailAccount(e.target.value)}
                >
                  {emailAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.email} ({account.unreadCount})
                    </option>
                  ))}
                </select>
              )}
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowEmailConfig(true)}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Settings className="h-4 w-4 mr-2" />
                {emailAccounts.length > 0 ? 'Gerenciar' : 'Adicionar'} Email
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

          {/* Smart Inbox Filters (Spark-style) */}
          <div className="flex items-center space-x-2 pb-4 border-b">
            <div className="flex items-center space-x-1">
              <Button 
                variant={emailFilter === 'all' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setEmailFilter('all')}
                className="text-xs"
              >
                📧 Todos
              </Button>
              <Button 
                variant={emailFilter === 'important' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setEmailFilter('important')}
                className="text-xs"
              >
                ⭐ Importantes
              </Button>
              <Button 
                variant={emailFilter === 'personal' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setEmailFilter('personal')}
                className="text-xs"
              >
                👤 Pessoais
              </Button>
              <Button 
                variant={emailFilter === 'notifications' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setEmailFilter('notifications')}
                className="text-xs"
              >
                🔔 Notificações
              </Button>
              <Button 
                variant={emailFilter === 'newsletters' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setEmailFilter('newsletters')}
                className="text-xs"
              >
                📰 Newsletters
              </Button>
              <Button 
                variant={emailFilter === 'snoozed' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setEmailFilter('snoozed')}
                className="text-xs"
              >
                😴 Adiados
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <label className="flex items-center text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={smartInboxEnabled}
                  onChange={(e) => setSmartInboxEnabled(e.target.checked)}
                  className="mr-1"
                />
                Smart Inbox
              </label>
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

          {/* Lista de emails com funcionalidades Spark */}
          <EmailList emails={filteredEmails} />
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
                    <p className="text-3xl font-bold text-blue-700">{(dashboardStats as any)?.tasksToday || 0}</p>
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
                    <p className="text-3xl font-bold text-red-700">{(dashboardStats as any)?.emailsUnread || 0}</p>
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
                    <p className="text-3xl font-bold text-green-700">{(dashboardStats as any)?.activeProjects || 0}</p>
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
                    <span className="font-semibold">{(dashboardStats as any)?.productivity || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(dashboardStats as any)?.productivity || 0}%` }}
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
                    <span className="font-semibold">{(dashboardStats as any)?.completionRate || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-teal-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(dashboardStats as any)?.completionRate || 0}%` }}
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
        <QuantumLogin onLogin={async () => true} isLoading={false} />
      </QueryClientProvider>
    );
  }

  // Modal Multi-Email Moderno
  const MultiEmailConfigModal = () => (
    showEmailConfig && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🚀 Gerenciar Contas de Email
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setShowEmailConfig(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Lista de contas existentes */}
          {emailAccounts.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-3 text-gray-700">📧 Contas Conectadas</h4>
              <div className="space-y-2">
                {emailAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${account.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className="font-medium">{account.email}</p>
                        <p className="text-xs text-gray-500">
                          {account.provider} • {account.unreadCount} não lidas • {account.lastSync}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant={activeEmailAccount === account.id ? "default" : "outline"}
                        onClick={() => setActiveEmailAccount(account.id)}
                      >
                        {activeEmailAccount === account.id ? 'Ativa' : 'Ativar'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeEmailAccount(account.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Adicionar nova conta */}
          <div className="border-t pt-6">
            <h4 className="font-semibold mb-4 flex items-center text-gray-700">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Nova Conta
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Provedor</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={newEmailForm.provider}
                  onChange={(e) => setNewEmailForm(prev => ({ ...prev, provider: e.target.value }))}
                >
                  <option value="zynt">@zynt.com.br</option>
                  <option value="gmail">Gmail</option>
                  <option value="outlook">Outlook</option>
                  <option value="yahoo">Yahoo</option>
                  <option value="icloud">iCloud</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  placeholder="seu-email@dominio.com"
                  value={newEmailForm.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className="w-full"
                />
                {newEmailForm.imapSettings.autoDetected && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                    ✅ IMAP detectado: {newEmailForm.imapSettings.host}:{newEmailForm.imapSettings.port}
                  </div>
                )}
                {!newEmailForm.imapSettings.autoDetected && newEmailForm.email.includes('@') && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                    ⚠️ Configuração genérica: {newEmailForm.imapSettings.host}:{newEmailForm.imapSettings.port}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Senha</label>
                <Input
                  type="password"
                  placeholder="Sua senha de email"
                  value={newEmailForm.password}
                  onChange={(e) => setNewEmailForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={addEmailAccount}
                  disabled={newEmailForm.isConfiguring}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {newEmailForm.isConfiguring ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar & Sincronizar
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowEmailConfig(false)}>
                  Fechar
                </Button>
              </div>
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

        {/* Modal multi-email moderno */}
        <MultiEmailConfigModal />
      </div>
    </QueryClientProvider>
  );
};

export default QuantumTasksModern;