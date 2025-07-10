import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/stats-card";
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
  Video,
  MessageSquare,
  Mail,
  FileText,
  Shield,
  Palette
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth-hybrid";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect, useState } from "react";
import React from "react";
import { TutorialTour, dashboardTutorialSteps } from "@/components/tutorial-tour";
import { HelpCircle, RefreshCcw } from "lucide-react";
import { forceRefreshCache, queryClient, apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [showTutorial, setShowTutorial] = useState(false);

  // Buscar quizzes do usuário
  const { data: userQuizzes, isLoading: quizzesLoading } = useQuery({
    queryKey: ["/api/quizzes"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Buscar analytics completos (igual ao analytics.tsx)
  const { data: allAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/analytics"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Calcular estatísticas reais baseadas nos analytics
  const totalQuizzes = userQuizzes?.length || 0;
  const totalLeads = allAnalytics ? allAnalytics.reduce((sum: number, a: any) => sum + (a.leadsWithContact || 0), 0) : 0;
  const totalViews = allAnalytics ? allAnalytics.reduce((sum: number, a: any) => sum + (a.totalViews || 0), 0) : 0;
  const avgConversionRate = allAnalytics && allAnalytics.length > 0 ? 
    Math.round(allAnalytics.reduce((sum: number, a: any) => sum + (a.conversionRate || 0), 0) / allAnalytics.length) : 0;

  const dashboardLoading = quizzesLoading || analyticsLoading;

  // Criar mapa de analytics por quiz para mostrar dados reais
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
      console.log('Duplicando quiz:', quiz.id);
      
      const response = await apiRequest(`/api/quizzes/${quiz.id}/duplicate`, {
        method: 'POST'
      });
      
      if (response.quiz) {
        toast({
          title: "Quiz Duplicado",
          description: `Uma cópia de "${quiz.title}" foi criada com sucesso!`,
        });
        
        // Invalidar cache e recarregar dados
        queryClient.invalidateQueries({ queryKey: ['/api/quizzes'] });
        queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
        
        console.log('Quiz duplicado com sucesso:', response.quiz.id);
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
    const previewUrl = `/quiz/${quiz.id}?preview=true`;
    window.open(previewUrl, '_blank');
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
        description: "A URL pública do quiz foi copiada para a área de transferência!",
      });
    }).catch(() => {
      // Fallback - abrir em nova aba se não conseguir copiar
      window.open(publicUrl, '_blank');
    });
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Acesso Negado",
        description: "Você precisa estar logado para acessar o dashboard.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);



  const dashboardStats = [
    {
      title: "Total de Quizzes",
      value: totalQuizzes,
      icon: <BarChart3 className="w-4 h-4" />,
      color: "text-blue-600"
    },
    {
      title: "Leads Capturados",
      value: totalLeads,
      icon: <Users className="w-4 h-4" />,
      color: "text-green-600"
    },
    {
      title: "Visualizações",
      value: totalViews,
      icon: <Eye className="w-4 h-4" />,
      color: "text-purple-600"
    },
    {
      title: "Taxa de Conversão",
      value: `${avgConversionRate}%`,
      icon: <TrendingUp className="w-4 h-4" />,
      color: "text-orange-600"
    }
  ];

  // Show loading spinner while dashboard data is loading
  if (dashboardLoading || authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading dashboard"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" data-tutorial="dashboard-main">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header Futurístico */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-600 text-lg">Gerencie seus quizzes e campanhas de marketing</p>
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full w-fit">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Sistema em tempo real ativo
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={() => {
                forceRefreshCache();
                toast({
                  title: "Cache Atualizado",
                  description: "Dados mais recentes carregados com sucesso!",
                });
              }}
              className="bg-white shadow-sm hover:shadow-md transition-all duration-200 border-0"
              title="Atualizar dados do cache"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowTutorial(true)}
              className="bg-white shadow-sm hover:shadow-md transition-all duration-200 border-0"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Tutorial
            </Button>
            <Link href="/quizzes/new">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200" data-tutorial="create-quiz-btn">
                <Plus className="w-4 h-4 mr-2" />
                Criar Quiz
              </Button>
            </Link>
          </div>
        </div>

      {/* Stats Grid Futurístico */}
      <div className="space-y-8" data-tutorial="stats-overview">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Quizzes Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent"></div>
            <CardContent className="relative p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div className="text-blue-100 text-sm font-medium bg-blue-400/30 px-3 py-1 rounded-full text-center">
                  +2 esta semana
                </div>
              </div>
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total de Quizzes</p>
                <p className="text-3xl font-bold mb-1">{dashboardStats[0]?.value || 0}</p>
                <p className="text-blue-200 text-xs">quizzes criados</p>
              </div>
            </CardContent>
          </Card>

          {/* Visualizações Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-transparent"></div>
            <CardContent className="relative p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Eye className="w-6 h-6" />
                </div>
                <div className="text-green-100 text-sm font-medium bg-green-400/30 px-3 py-1 rounded-full text-center">
                  +15% hoje
                </div>
              </div>
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Visualizações</p>
                <p className="text-3xl font-bold mb-1">{dashboardStats[2]?.value || 0}</p>
                <p className="text-green-200 text-xs">acessos únicos</p>
              </div>
            </CardContent>
          </Card>

          {/* Respostas Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-violet-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-transparent"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Users className="w-6 h-6" />
                </div>
                <div className="text-purple-100 text-sm font-medium bg-purple-400/30 px-2 py-1 rounded-full">
                  +8% semana
                </div>
              </div>
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Respostas</p>
                <p className="text-3xl font-bold mb-1">{dashboardStats[1]?.value || 0}</p>
                <p className="text-purple-200 text-xs">leads capturados</p>
              </div>
            </CardContent>
          </Card>

          {/* Conversão Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-transparent"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="text-orange-100 text-sm font-medium bg-orange-400/30 px-2 py-1 rounded-full">
                  +3% mês
                </div>
              </div>
              <div>
                <p className="text-orange-100 text-sm font-medium mb-1">Taxa de Conversão</p>
                <p className="text-3xl font-bold mb-1">{dashboardStats[3]?.value || "0%"}</p>
                <p className="text-orange-200 text-xs">média geral</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Quizzes com Design Futurístico */}
      <div className="mt-12">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl" data-tutorial="quizzes-list">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100">
          <CardTitle className="flex items-center gap-3 text-gray-900">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Seus Quizzes</h3>
              <p className="text-sm text-gray-600 font-normal">Gerencie e monitore performance</p>
            </div>
            <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-800 px-3 py-1">
              {userQuizzes?.length || 0} quizzes
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!userQuizzes || userQuizzes.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Comece sua jornada
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Crie seu primeiro quiz para começar a capturar leads qualificados e impulsionar seu negócio
              </p>
              <Link href="/quizzes/new">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 text-lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Criar Primeiro Quiz
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {userQuizzes.slice(0, 5).map((quiz: any, index: number) => {
                const isFirst = index === 0;
                const isLast = index === Math.min(userQuizzes.length - 1, 4);
                return (
                  <div key={quiz.id} className={`flex flex-col lg:flex-row lg:items-center lg:justify-between p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 ${
                    isFirst ? 'rounded-t-lg' : ''
                  } ${
                    isLast ? 'rounded-b-lg' : ''
                  }`}>
                    <div className="flex items-center gap-4 flex-1 mb-4 lg:mb-0">
                      <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {quiz.title.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">{quiz.title}</h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(quiz.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                          <Badge 
                            variant={quiz.isPublished ? "default" : "secondary"}
                            className={quiz.isPublished ? 
                              "bg-green-100 text-green-800 border-green-200" : 
                              "bg-orange-100 text-orange-800 border-orange-200"
                            }
                          >
                            {quiz.isPublished ? "Publicado" : "Rascunho"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="hidden lg:flex items-center gap-6 mr-6">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {quizAnalyticsMap.get(quiz.id)?.views || 0}
                          </div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">Views</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            {quizAnalyticsMap.get(quiz.id)?.leads || 0}
                          </div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">Leads</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="hover:bg-blue-100"
                          onClick={() => handlePreviewQuiz(quiz)}
                          title="Visualizar Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Link href={`/quizzes/${quiz.id}/edit`}>
                          <Button variant="ghost" size="sm" className="hover:bg-purple-100" title="Editar Quiz">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="hover:bg-gray-100"
                          onClick={() => handleDuplicateQuiz(quiz)}
                          title="Duplicar Quiz"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="hover:bg-green-100"
                          onClick={() => handlePublicUrl(quiz)}
                          title="Copiar URL Pública"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {userQuizzes.length > 5 && (
                <div className="text-center p-6 bg-gradient-to-r from-gray-50 to-blue-50">
                  <Link href="/quizzes">
                    <Button variant="outline" className="bg-white hover:bg-blue-50 border-blue-200 text-blue-700">
                      Ver Todos os Quizzes ({userQuizzes.length})
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      </div>

      {/* Dashboard de Ações Principais */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Botões Rápidos */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Botões Rápidos</h3>
                <p className="text-sm text-gray-600 font-normal">Acesso direto às principais funcionalidades</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <Link href="/quizzes/new">
                <Button className="w-full h-16 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200">
                  <BarChart3 className="w-6 h-6" />
                  <span className="text-sm font-medium">Criar Quiz</span>
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full h-16 flex flex-col items-center justify-center gap-2 bg-white hover:bg-purple-50 border-purple-200 text-purple-700 hover:text-purple-800 shadow-sm hover:shadow-lg transition-all duration-200"
                onClick={() => setShowTutorial(true)}
              >
                <HelpCircle className="w-6 h-6" />
                <span className="text-sm font-medium">Tutoriais</span>
              </Button>
              <Link href="/templates">
                <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center gap-2 bg-white hover:bg-green-50 border-green-200 text-green-700 hover:text-green-800 shadow-sm hover:shadow-lg transition-all duration-200">
                  <Palette className="w-6 h-6" />
                  <span className="text-sm font-medium">Templates</span>
                </Button>
              </Link>
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center gap-2 bg-white hover:bg-orange-50 border-orange-200 text-orange-700 hover:text-orange-800 shadow-sm hover:shadow-lg transition-all duration-200">
                <Shield className="w-6 h-6" />
                <span className="text-sm font-medium">Planos</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Campanhas de Marketing */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Marketing Automation</h3>
                <p className="text-sm text-gray-600 font-normal">Campanhas multi-canal para conversão</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Link href="/sms-credits">
                <Button variant="outline" className="w-full h-14 flex items-center justify-start gap-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-200 text-blue-700 shadow-sm hover:shadow-lg transition-all duration-200">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Campanha SMS</div>
                    <div className="text-xs text-blue-600">Mensagens diretas e efetivas</div>
                  </div>
                </Button>
              </Link>
              <Link href="/email-marketing">
                <Button variant="outline" className="w-full h-14 flex items-center justify-start gap-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-green-200 text-green-700 shadow-sm hover:shadow-lg transition-all duration-200">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Email Marketing</div>
                    <div className="text-xs text-green-600">Nutrição automatizada de leads</div>
                  </div>
                </Button>
              </Link>
              <Link href="/campanhas-whatsapp">
                <Button variant="outline" className="w-full h-14 flex items-center justify-start gap-4 bg-gradient-to-r from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 border-emerald-200 text-emerald-700 shadow-sm hover:shadow-lg transition-all duration-200">
                  <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">WhatsApp Business</div>
                    <div className="text-xs text-emerald-600">Remarketing inteligente</div>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas com Design Futurístico */}
      <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/analytics">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-200">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Analytics</h3>
              <p className="text-sm text-gray-600">Relatórios detalhados</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/ai-conversion">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-200">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">I.A. Vídeos</h3>
              <p className="text-sm text-gray-600">HeyGen Automation</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/cloaker">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-200">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Cloaker</h3>
              <p className="text-sm text-gray-600">Anti WebView</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/vsl-player">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-200">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">VSL Player</h3>
              <p className="text-sm text-gray-600">Vídeo Sales Letter</p>
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
      </div>
    </div>
  );
}
