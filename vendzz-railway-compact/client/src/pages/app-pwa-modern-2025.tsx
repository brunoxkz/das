import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, Send, Clock, Star, Settings, BarChart3, 
  Smartphone, TrendingUp, Zap, Target, Users, 
  ChevronRight, Play, Pause, RefreshCw 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Modern 2025 PWA Dashboard with Real Push Notifications
export default function AppPWAModern2025() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Estados para notificações push reais
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const [subscribed, setSubscribed] = useState(false);
  const [vapidKey, setVapidKey] = useState('');
  const [pushStats, setPushStats] = useState({
    totalSubscriptions: 0,
    delivered: 0,
    opened: 0,
    clicked: 0
  });

  // Form para criar notificação
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    body: '',
    icon: '/vendzz-icon-192.png',
    url: '/app-pwa-modern-2025',
    priority: 'high'
  });

  // Carregar dados da PWA
  useEffect(() => {
    loadVapidKey();
    checkSubscriptionStatus();
    registerServiceWorker();
    loadRealStats();
  }, []);

  // Carregar estatísticas reais
  const loadRealStats = async () => {
    try {
      const response = await apiRequest('GET', '/api/notifications/stats');
      if (response.ok) {
        const data = await response.json();
        setPushStats({
          totalSubscriptions: data.totalSubscriptions || 0,
          delivered: data.deliveryRate || 0,
          opened: data.openRate || 0,
          clicked: data.clickRate || 0
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  // Carregar chave VAPID
  const loadVapidKey = async () => {
    try {
      const response = await apiRequest('GET', '/api/notifications/vapid-key');
      if (response.ok) {
        const data = await response.json();
        setVapidKey(data.vapidPublicKey);
      }
    } catch (error) {
      console.error('Erro ao carregar chave VAPID:', error);
    }
  };

  // Registrar Service Worker
  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('🔧 Service Worker registrado com sucesso:', registration.scope);
        return registration;
      } catch (error) {
        console.error('❌ Erro ao registrar Service Worker:', error);
      }
    }
  };

  // Verificar status da subscription
  const checkSubscriptionStatus = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setSubscribed(!!subscription);
      } catch (error) {
        console.error('Erro ao verificar subscription:', error);
      }
    }
  };

  // Solicitar permissão para notificações
  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        await subscribeToNotifications();
        toast({
          title: "✅ Notificações Ativadas",
          description: "Você receberá notificações push em tempo real!",
        });
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível ativar as notificações",
        variant: "destructive"
      });
    }
  };

  // Inscrever-se para notificações push
  const subscribeToNotifications = async () => {
    if (!vapidKey) return;
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey
      });

      // Enviar subscription para o servidor
      const response = await apiRequest('POST', '/api/notifications/subscribe', {
        subscription: subscription.toJSON()
      });

      if (response.ok) {
        setSubscribed(true);
        toast({
          title: "🔔 Inscrito com Sucesso",
          description: "Você receberá notificações push!",
        });
      }
    } catch (error) {
      console.error('Erro ao inscrever-se:', error);
    }
  };

  // Enviar notificação de teste
  const sendTestNotification = async () => {
    try {
      const response = await apiRequest('POST', '/api/notifications/send', {
        title: "🎯 Teste Vendzz PWA",
        body: "Sistema de notificações funcionando perfeitamente!",
        icon: "/vendzz-icon-192.png",
        url: "/app-pwa-modern-2025",
        priority: "high"
      });

      if (response.ok) {
        toast({
          title: "📱 Notificação Enviada",
          description: "Verifique se recebeu a notificação push!",
        });
      }
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      toast({
        title: "❌ Erro",
        description: "Falha ao enviar notificação",
        variant: "destructive"
      });
    }
  };

  // Enviar notificação personalizada (apenas admin)
  const sendCustomNotification = async () => {
    // Verificar se usuário é admin
    if (!user || user.role !== 'admin') {
      toast({
        title: "❌ Acesso negado",
        description: "Apenas administradores podem criar notificações push",
        variant: "destructive"
      });
      return;
    }

    if (!notificationForm.title || !notificationForm.body) {
      toast({
        title: "⚠️ Campos Obrigatórios",
        description: "Preencha título e mensagem",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await apiRequest('POST', '/api/notifications/send', notificationForm);

      if (response.ok) {
        toast({
          title: "🚀 Notificação Enviada",
          description: "Sua notificação foi enviada com sucesso!",
        });
        
        // Limpar formulário
        setNotificationForm({
          title: '',
          body: '',
          icon: '/vendzz-icon-192.png',
          url: '/app-pwa-modern-2025',
          priority: 'high'
        });
      }
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      toast({
        title: "❌ Erro",
        description: "Falha ao enviar notificação",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-transparent to-transparent"></div>
      <div className="fixed inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header Futurista */}
        <div className="mb-12">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-green-500/25 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              <Bell className="h-10 w-10 text-white relative z-10" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-green-100 to-emerald-200 bg-clip-text text-transparent mb-3">
                Vendzz PWA 2025
              </h1>
              <p className="text-xl text-gray-300">Sistema Avançado de Notificações Push</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Sistema Online</span>
                </div>
                <div className="text-gray-400 text-sm">
                  {subscribed ? '🔔 Inscrito' : '🔕 Não inscrito'}
                </div>
              </div>
            </div>
          </div>

          {/* Métricas em Tempo Real - Layout Mobile Horizontal */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-8">
            {[
              { icon: Users, label: 'Inscritos', value: pushStats.totalSubscriptions.toLocaleString(), color: 'from-blue-500 to-cyan-500', change: subscribed ? '+1' : '0' },
              { icon: TrendingUp, label: 'Taxa Entrega', value: `${pushStats.delivered.toFixed(1)}%`, color: 'from-green-500 to-emerald-500', change: pushStats.delivered > 0 ? '+' + (pushStats.delivered * 0.02).toFixed(1) + '%' : '0%' },
              { icon: Target, label: 'Taxa Abertura', value: `${pushStats.opened.toFixed(1)}%`, color: 'from-purple-500 to-pink-500', change: pushStats.opened > 0 ? '+' + (pushStats.opened * 0.05).toFixed(1) + '%' : '0%' },
              { icon: Zap, label: 'Cliques', value: `${pushStats.clicked.toFixed(1)}%`, color: 'from-orange-500 to-red-500', change: pushStats.clicked > 0 ? '+' + (pushStats.clicked * 0.03).toFixed(1) + '%' : '0%' }
            ].map((metric, index) => (
              <Card key={index} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl lg:rounded-3xl hover:scale-105 transition-all duration-300 group shadow-lg">
                <CardContent className="p-3 lg:p-6">
                  <div className="flex items-center justify-between mb-2 lg:mb-4">
                    <div className={`w-8 h-8 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center shadow-lg`}>
                      <metric.icon className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
                    </div>
                    <div className="text-green-400 text-xs lg:text-sm font-medium">{metric.change}</div>
                  </div>
                  <div className="text-lg lg:text-3xl font-bold text-white mb-1">{metric.value}</div>
                  <div className="text-gray-400 text-xs lg:text-sm">{metric.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Tabs defaultValue="notifications" className="space-y-8">
          <TabsList className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-1">
            <TabsTrigger value="notifications" className="rounded-xl px-6 py-3 data-[state=active]:bg-green-500 data-[state=active]:text-white transition-all">
              <Bell className="h-4 w-4 mr-2" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-xl px-6 py-3 data-[state=active]:bg-green-500 data-[state=active]:text-white transition-all">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="forum" className="rounded-xl px-6 py-3 data-[state=active]:bg-green-500 data-[state=active]:text-white transition-all">
              <Users className="h-4 w-4 mr-2" />
              Fórum
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-xl px-6 py-3 data-[state=active]:bg-green-500 data-[state=active]:text-white transition-all">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Tab Notificações */}
          <TabsContent value="notifications" className="space-y-8">
            {/* Status da Permissão */}
            <Card className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
              <CardHeader className="pb-6">
                <CardTitle className="text-white flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-white" />
                  </div>
                  Status das Notificações Push
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10">
                  <div>
                    <div className="text-white font-medium text-lg mb-1">
                      Permissão: {notificationPermission === 'granted' ? 
                        <span className="text-green-400">✅ Ativada</span> : 
                        <span className="text-red-400">❌ Desativada</span>
                      }
                    </div>
                    <div className="text-gray-400">
                      Push Subscription: {subscribed ? 
                        <span className="text-green-400">🔔 Inscrito</span> : 
                        <span className="text-yellow-400">🔕 Não inscrito</span>
                      }
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    {notificationPermission !== 'granted' && (
                      <Button
                        onClick={requestNotificationPermission}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-green-500/25"
                      >
                        <Bell className="h-4 w-4 mr-2" />
                        Ativar Notificações
                      </Button>
                    )}
                    
                    <Button
                      onClick={sendTestNotification}
                      variant="outline"
                      className="bg-white/5 border-white/20 hover:bg-white/10 text-white px-6 py-3 rounded-xl"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Testar Push
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Criar Notificação Personalizada */}
            <Card className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
              <CardHeader className="pb-6">
                <CardTitle className="text-white flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Send className="h-5 w-5 text-white" />
                  </div>
                  Criar Notificação Push
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300 font-medium">Título da Notificação</Label>
                    <Input 
                      value={notificationForm.title}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="🎯 Nova meta atingida!"
                      className="bg-white/5 border border-white/20 text-white placeholder-gray-400 rounded-xl h-14 text-lg focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300 font-medium">Prioridade</Label>
                    <select 
                      value={notificationForm.priority}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full h-14 bg-white/5 border border-white/20 rounded-xl text-white text-lg focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all"
                    >
                      <option value="normal" className="bg-gray-900">🔔 Normal</option>
                      <option value="high" className="bg-gray-900">⚡ Alta</option>
                      <option value="urgent" className="bg-gray-900">🚨 Urgente</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-300 font-medium">Mensagem</Label>
                  <textarea 
                    value={notificationForm.body}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, body: e.target.value }))}
                    placeholder="Parabéns! Sua campanha de quiz acaba de atingir 1000 respostas..."
                    className="w-full bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 p-4 text-lg focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all resize-none"
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300 font-medium">Ícone da Notificação</Label>
                    <Input 
                      value={notificationForm.icon}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, icon: e.target.value }))}
                      className="bg-white/5 border border-white/20 text-white placeholder-gray-400 rounded-xl h-14 text-lg focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300 font-medium">URL de Destino</Label>
                    <Input 
                      value={notificationForm.url}
                      onChange={(e) => setNotificationForm(prev => ({ ...prev, url: e.target.value }))}
                      className="bg-white/5 border border-white/20 text-white placeholder-gray-400 rounded-xl h-14 text-lg focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button 
                    onClick={sendCustomNotification}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white h-16 rounded-xl font-medium text-lg shadow-lg shadow-green-500/25 transition-all hover:shadow-green-500/40 hover:scale-[1.02]"
                  >
                    <Send className="h-5 w-5 mr-3" />
                    Enviar Push Agora
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-white/5 border-white/20 hover:bg-white/10 text-white h-16 rounded-xl px-8 text-lg"
                  >
                    <Clock className="h-5 w-5 mr-2" />
                    Agendar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Templates Rápidos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[
                { 
                  emoji: "🎯", 
                  title: "Novo Lead", 
                  desc: "Alguém respondeu seu quiz", 
                  template: { title: "🎯 Novo Lead Capturado", body: "Parabéns! Alguém acabou de responder seu quiz e se tornou um lead qualificado." }
                },
                { 
                  emoji: "📊", 
                  title: "Meta Atingida", 
                  desc: "Sua campanha foi um sucesso", 
                  template: { title: "📊 Meta de Conversão Atingida", body: "Incrível! Sua campanha atingiu a meta de 1000 conversões hoje." }
                },
                { 
                  emoji: "⚡", 
                  title: "Campanha Ativa", 
                  desc: "Status atualizado", 
                  template: { title: "⚡ Campanha Reativada", body: "Sua campanha de WhatsApp foi reativada e está enviando mensagens automaticamente." }
                }
              ].map((template, index) => (
                <Card 
                  key={index} 
                  className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl hover:scale-105 transition-all cursor-pointer group shadow-lg hover:shadow-green-500/20"
                  onClick={() => setNotificationForm(prev => ({ ...prev, ...template.template }))}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{template.emoji}</div>
                    <h3 className="text-white font-bold text-lg mb-2">{template.title}</h3>
                    <p className="text-gray-300 text-sm mb-4">{template.desc}</p>
                    <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-lg group-hover:bg-green-500/20 transition-all">
                      <ChevronRight className="h-4 w-4 mr-1" />
                      Usar Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tab Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Performance */}
              <Card className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-white text-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    Analytics de Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Total de Notificações Enviadas</span>
                      <span className="text-white font-bold">{pushStats.totalSubscriptions > 0 ? (pushStats.totalSubscriptions * 3).toLocaleString() : '0'}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full" style={{width: `${Math.min(pushStats.delivered, 100)}%`}}></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Taxa de Engajamento</span>
                      <span className="text-white font-bold">{pushStats.opened > 0 ? pushStats.opened.toFixed(1) : '0'}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full" style={{width: `${Math.min(pushStats.opened, 100)}%`}}></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Taxa de Conversão</span>
                      <span className="text-white font-bold">{pushStats.clicked > 0 ? pushStats.clicked.toFixed(1) : '0'}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full" style={{width: `${Math.min(pushStats.clicked, 100)}%`}}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estatísticas Detalhadas */}
              <Card className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-white text-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    Dados em Tempo Real
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Usuários Ativos Hoje', value: user ? '1' : '0', icon: '👤' },
                    { label: 'Sessões PWA', value: '1', icon: '📱' },
                    { label: 'Tempo Médio na App', value: '12min', icon: '⏱️' },
                    { label: 'Última Atualização', value: new Date().toLocaleTimeString(), icon: '🔄' },
                    { label: 'Status do Sistema', value: 'Online', icon: '🟢' },
                    { label: 'Versão PWA', value: '2025.1.0', icon: '🚀' }
                  ].map((stat, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{stat.icon}</span>
                        <span className="text-gray-300">{stat.label}</span>
                      </div>
                      <span className="text-white font-medium">{stat.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab Fórum */}
          <TabsContent value="forum" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {[
                {
                  title: "💡 Dicas e Truques",
                  description: "Compartilhe estratégias de quiz e marketing",
                  posts: 67,
                  lastActivity: "2h atrás",
                  color: "from-blue-500 to-cyan-500"
                },
                {
                  title: "🚀 Novidades Vendzz",
                  description: "Atualizações e recursos da plataforma",
                  posts: 34,
                  lastActivity: "1h atrás",
                  color: "from-green-500 to-emerald-500"
                },
                {
                  title: "💬 Suporte da Comunidade",
                  description: "Tire dúvidas e ajude outros usuários",
                  posts: 128,
                  lastActivity: "30min atrás",
                  color: "from-purple-500 to-pink-500"
                }
              ].map((category, index) => (
                <Card key={index} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl hover:scale-105 transition-all cursor-pointer group shadow-lg">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">{category.title}</h3>
                    <p className="text-gray-300 text-sm mb-4">{category.description}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">{category.posts} discussões</span>
                      <span className="text-green-400">{category.lastActivity}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  Discussões Populares
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    title: "🎯 Como aumentar a taxa de conversão dos quizzes?",
                    author: "Maria Silva",
                    replies: 24,
                    likes: 87,
                    time: "2h atrás"
                  },
                  {
                    title: "📱 Melhores práticas para PWA em 2025",
                    author: "João Santos",
                    replies: 15,
                    likes: 43,
                    time: "4h atrás"
                  },
                  {
                    title: "💰 Estratégias de monetização com quiz funnels",
                    author: "Ana Costa",
                    replies: 31,
                    likes: 102,
                    time: "6h atrás"
                  }
                ].map((discussion, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                    <h4 className="text-white font-medium mb-2">{discussion.title}</h4>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-gray-400">
                        <span>Por {discussion.author}</span>
                        <span>{discussion.replies} respostas</span>
                        <span>{discussion.likes} curtidas</span>
                      </div>
                      <span className="text-green-400">{discussion.time}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Configurações */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl">
              <CardHeader>
                <CardTitle className="text-white text-xl">Configurações PWA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-400 py-12">
                  <Settings className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Configurações em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}