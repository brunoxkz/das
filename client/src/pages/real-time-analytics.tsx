import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer, 
  Mail, 
  MessageCircle,
  Phone,
  Clock,
  MapPin,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Zap,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Download,
  Filter,
  Search
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth-hybrid";
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';

interface RealTimeMetrics {
  activeUsers: number;
  quizViews: number;
  leadsToday: number;
  conversionRate: number;
  emailsSent: number;
  whatsappMessages: number;
  smsMessages: number;
  avgResponseTime: number;
  topQuizzes: Array<{
    id: string;
    title: string;
    views: number;
    leads: number;
    conversionRate: number;
  }>;
  recentActivities: Array<{
    id: string;
    type: 'quiz_view' | 'lead_capture' | 'email_sent' | 'whatsapp_sent' | 'sms_sent';
    description: string;
    timestamp: string;
    location?: string;
    device?: string;
  }>;
  trafficSources: Array<{
    source: string;
    visits: number;
    percentage: number;
  }>;
  deviceBreakdown: Array<{
    device: string;
    count: number;
    percentage: number;
  }>;
  hourlyData: Array<{
    hour: string;
    views: number;
    leads: number;
    emails: number;
  }>;
}

export default function RealTimeAnalytics() {
  const { isAuthenticated } = useAuth();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 segundos
  const [selectedMetric, setSelectedMetric] = useState("overview");

  // Fetch real-time metrics
  const { data: metrics, isLoading, refetch } = useQuery({
    queryKey: ["/api/real-time-metrics"],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/real-time-metrics", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    enabled: isAuthenticated,
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refetch();
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refetch]);

  // Mock data for demonstration (replace with real data)
  const mockMetrics: RealTimeMetrics = {
    activeUsers: 127,
    quizViews: 1543,
    leadsToday: 89,
    conversionRate: 5.8,
    emailsSent: 234,
    whatsappMessages: 156,
    smsMessages: 67,
    avgResponseTime: 2.3,
    topQuizzes: [
      { id: "1", title: "Quiz de Vendas", views: 234, leads: 23, conversionRate: 9.8 },
      { id: "2", title: "Quiz de Marketing", views: 189, leads: 15, conversionRate: 7.9 },
      { id: "3", title: "Quiz de Produtos", views: 156, leads: 12, conversionRate: 7.7 },
    ],
    recentActivities: [
      { id: "1", type: "lead_capture", description: "Novo lead capturado - João Silva", timestamp: "2 min atrás", location: "São Paulo, SP", device: "Mobile" },
      { id: "2", type: "quiz_view", description: "Quiz visualizado - Quiz de Vendas", timestamp: "3 min atrás", location: "Rio de Janeiro, RJ", device: "Desktop" },
      { id: "3", type: "email_sent", description: "Email enviado - Campanha Promocional", timestamp: "5 min atrás" },
      { id: "4", type: "whatsapp_sent", description: "WhatsApp enviado - Campanha Automática", timestamp: "7 min atrás" },
      { id: "5", type: "sms_sent", description: "SMS enviado - Notificação", timestamp: "10 min atrás" },
    ],
    trafficSources: [
      { source: "Google", visits: 456, percentage: 34.2 },
      { source: "Facebook", visits: 234, percentage: 17.5 },
      { source: "Instagram", visits: 189, percentage: 14.2 },
      { source: "Direto", visits: 167, percentage: 12.5 },
      { source: "WhatsApp", visits: 145, percentage: 10.9 },
      { source: "Outros", visits: 143, percentage: 10.7 },
    ],
    deviceBreakdown: [
      { device: "Mobile", count: 789, percentage: 58.9 },
      { device: "Desktop", count: 456, percentage: 34.0 },
      { device: "Tablet", count: 95, percentage: 7.1 },
    ],
    hourlyData: [
      { hour: "00:00", views: 23, leads: 2, emails: 12 },
      { hour: "01:00", views: 18, leads: 1, emails: 8 },
      { hour: "02:00", views: 15, leads: 1, emails: 5 },
      { hour: "03:00", views: 12, leads: 0, emails: 3 },
      { hour: "04:00", views: 9, leads: 0, emails: 2 },
      { hour: "05:00", views: 14, leads: 1, emails: 4 },
      { hour: "06:00", views: 28, leads: 3, emails: 15 },
      { hour: "07:00", views: 45, leads: 5, emails: 23 },
      { hour: "08:00", views: 67, leads: 8, emails: 34 },
      { hour: "09:00", views: 89, leads: 12, emails: 45 },
      { hour: "10:00", views: 123, leads: 15, emails: 67 },
      { hour: "11:00", views: 145, leads: 18, emails: 78 },
      { hour: "12:00", views: 167, leads: 21, emails: 89 },
      { hour: "13:00", views: 189, leads: 24, emails: 98 },
      { hour: "14:00", views: 234, leads: 28, emails: 112 },
      { hour: "15:00", views: 267, leads: 32, emails: 134 },
      { hour: "16:00", views: 289, leads: 35, emails: 145 },
      { hour: "17:00", views: 312, leads: 38, emails: 156 },
      { hour: "18:00", views: 345, leads: 42, emails: 167 },
      { hour: "19:00", views: 378, leads: 45, emails: 178 },
      { hour: "20:00", views: 289, leads: 35, emails: 145 },
      { hour: "21:00", views: 234, leads: 28, emails: 123 },
      { hour: "22:00", views: 189, leads: 22, emails: 98 },
      { hour: "23:00", views: 145, leads: 17, emails: 76 },
    ],
  };

  const currentMetrics = metrics || mockMetrics;

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quiz_view': return <Eye className="w-4 h-4 text-blue-500" />;
      case 'lead_capture': return <Users className="w-4 h-4 text-green-500" />;
      case 'email_sent': return <Mail className="w-4 h-4 text-purple-500" />;
      case 'whatsapp_sent': return <MessageCircle className="w-4 h-4 text-green-600" />;
      case 'sms_sent': return <Phone className="w-4 h-4 text-orange-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'desktop': return <Monitor className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics em Tempo Real</h1>
            <p className="text-gray-600">Monitoramento ao vivo da sua plataforma</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => refetch()}
              className="flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Real-time Status */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-600">Ao vivo</span>
          </div>
          <div className="text-sm text-gray-500">
            Última atualização: {new Date().toLocaleTimeString('pt-BR')}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Usuários Ativos</p>
                  <p className="text-2xl font-bold text-blue-900">{currentMetrics.activeUsers}</p>
                  <p className="text-xs text-blue-600">Agora online</p>
                </div>
                <div className="bg-blue-500 p-3 rounded-full">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Visualizações</p>
                  <p className="text-2xl font-bold text-green-900">{currentMetrics.quizViews}</p>
                  <p className="text-xs text-green-600">Hoje</p>
                </div>
                <div className="bg-green-500 p-3 rounded-full">
                  <Eye className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Leads Hoje</p>
                  <p className="text-2xl font-bold text-purple-900">{currentMetrics.leadsToday}</p>
                  <p className="text-xs text-purple-600">{currentMetrics.conversionRate}% conversão</p>
                </div>
                <div className="bg-purple-500 p-3 rounded-full">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Mensagens</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {currentMetrics.emailsSent + currentMetrics.whatsappMessages + currentMetrics.smsMessages}
                  </p>
                  <p className="text-xs text-orange-600">Hoje</p>
                </div>
                <div className="bg-orange-500 p-3 rounded-full">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
          <TabsTrigger value="traffic">Tráfego</TabsTrigger>
          <TabsTrigger value="devices">Dispositivos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  Atividade por Hora
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={currentMetrics.hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="views" stroke="#10b981" strokeWidth={2} />
                      <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="emails" stroke="#8b5cf6" strokeWidth={2} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Top Quizzes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentMetrics.topQuizzes.map((quiz, index) => (
                    <div key={quiz.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{quiz.title}</p>
                          <p className="text-sm text-gray-600">{quiz.views} views • {quiz.leads} leads</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{quiz.conversionRate}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {currentMetrics.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activity.timestamp}
                        </div>
                        {activity.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {activity.location}
                          </div>
                        )}
                        {activity.device && (
                          <div className="flex items-center gap-1">
                            {getDeviceIcon(activity.device)}
                            {activity.device}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Fontes de Tráfego
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={currentMetrics.trafficSources}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ source, percentage }) => `${source} ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="visits"
                      >
                        {currentMetrics.trafficSources.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Visitas por Fonte
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentMetrics.trafficSources.map((source, index) => (
                    <div key={source.source} className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{source.source}</span>
                          <span className="text-sm text-gray-600">{source.visits} visitas</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full"
                            style={{ 
                              width: `${source.percentage}%`,
                              backgroundColor: COLORS[index % COLORS.length]
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Dispositivos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {currentMetrics.deviceBreakdown.map((device, index) => (
                  <div key={device.device} className="text-center p-6 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center mb-4">
                      <div className="bg-green-500 p-4 rounded-full">
                        {getDeviceIcon(device.device)}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{device.device}</h3>
                    <p className="text-2xl font-bold text-green-600 mb-1">{device.count}</p>
                    <p className="text-sm text-gray-600">{device.percentage}% do total</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}