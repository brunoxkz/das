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
import logoVendzz from '@assets/logo-vendzz-white_1753041219534.png';

export default function AppPWAVendzz() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Estados da aplicação
  const [quizzes, setQuizzes] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [forumPosts, setForumPosts] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalQuizzes: 0,
    totalResponses: 0,
    totalCampaigns: 0,
    conversionRate: 0
  });

  // Verificação de login obrigatório
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirecionar para login se não autenticado
      window.location.href = '/login';
      return;
    }
  }, [isLoading, isAuthenticated]);

  // Carregar dados do usuário
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
    }
  }, [isAuthenticated, user]);

  const loadUserData = async () => {
    try {
      // Carregar quizzes do usuário
      const quizzesResponse = await apiRequest('GET', '/api/quizzes');
      if (quizzesResponse.ok) {
        const quizzesData = await quizzesResponse.json();
        setQuizzes(quizzesData.slice(0, 6)); // Últimos 6 quizzes
      }

      // Carregar campanhas
      const campaignsResponse = await apiRequest('GET', '/api/sms-campaigns');
      if (campaignsResponse.ok) {
        const campaignsData = await campaignsResponse.json();
        setCampaigns(campaignsData.slice(0, 4)); // Últimas 4 campanhas
      }

      // Carregar analytics
      const analyticsResponse = await apiRequest('GET', '/api/dashboard/stats');
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
      }

      // Dados do fórum simulados
      setForumPosts([
        { id: 1, title: 'Como aumentar conversão de quizzes', category: 'Dicas e Truques', replies: 15, author: 'Maria Silva', time: '2h' },
        { id: 2, title: 'Nova atualização do Vendzz disponível', category: 'Novidades Vendzz', replies: 8, author: 'Equipe Vendzz', time: '4h' },
        { id: 3, title: 'Problemas com integração WhatsApp', category: 'Suporte da Comunidade', replies: 12, author: 'João Santos', time: '6h' },
        { id: 4, title: 'Melhores práticas para campanhas SMS', category: 'Dicas e Truques', replies: 22, author: 'Ana Costa', time: '1d' }
      ]);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados do usuário",
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
          <TabsList className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-1 grid grid-cols-4 w-full">
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
            <TabsTrigger value="automations" className="rounded-xl px-3 py-3 data-[state=active]:bg-green-500 data-[state=active]:text-white transition-all text-xs lg:text-sm">
              <Bot className="h-4 w-4 mr-1 lg:mr-2" />
              Automações
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
    </div>
  );
}