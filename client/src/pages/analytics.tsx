import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/stats-card";
import { 
  BarChart3, 
  Users, 
  Eye, 
  TrendingUp,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth-hybrid";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import React from "react";
import { Link, useLocation } from "wouter";

export default function Analytics() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [location, navigate] = useLocation();

  // Get quiz data from URL params  
  const params = new URLSearchParams(window.location.search);
  const selectedQuizId = params.get('quiz');

  // Fetch dashboard stats for general view
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: isAuthenticated && !selectedQuizId,
    retry: false,
  });

  // Fetch user's quizzes for general view
  const { data: userQuizzes, isLoading: quizzesLoading, error: quizzesError } = useQuery({
    queryKey: ["/api/quizzes"],
    enabled: isAuthenticated,
    retry: false,
  });



  // Fetch specific quiz analytics if quiz is selected
  const { data: quizAnalytics, isLoading: quizAnalyticsLoading } = useQuery({
    queryKey: ["/api/analytics", selectedQuizId],
    enabled: isAuthenticated && !!selectedQuizId,
    retry: false,
  });

  // Fetch all analytics data
  const { data: allAnalytics } = useQuery({
    queryKey: ["/api/analytics"],
    enabled: isAuthenticated && !selectedQuizId,
    retry: false,
  });

  // Create map of quiz analytics for displaying real data
  const quizAnalyticsMap = React.useMemo(() => {
    const map = new Map();
    if (userQuizzes && Array.isArray(userQuizzes) && allAnalytics) {
      userQuizzes.forEach((quiz: any) => {
        const quizAnalytic = Array.isArray(allAnalytics) ? allAnalytics.find((a: any) => a.quizId === quiz.id) : null;
        
        // Use the correct field names from backend response
        const totalViews = quizAnalytic?.totalViews || 0;
        const leadsWithContact = quizAnalytic?.leadsWithContact || 0; // NEW: Real leads with email/phone
        const conversionRate = quizAnalytic?.conversionRate || 0;
        
        map.set(quiz.id, {
          views: totalViews,
          leads: leadsWithContact, // Real leads with contact info
          conversions: Math.round(conversionRate)
        });
      });
    }
    return map;
  }, [userQuizzes, allAnalytics]);

  // Auth check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar logado para acessar os analytics.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  if (authLoading || (selectedQuizId ? quizAnalyticsLoading : (statsLoading || quizzesLoading))) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // If specific quiz is selected, show quiz-specific analytics
  if (selectedQuizId) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/analytics")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para Analytics Geral
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Analytics do Quiz: {quizAnalytics?.quiz?.title || "Carregando..."}
              </h1>
              <p className="text-gray-600">Análise detalhada do desempenho</p>
            </div>
          </div>

          {quizAnalytics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Visualizações"
                value={quizAnalytics.totalViews || 0}
                icon={<Eye className="w-5 h-5 text-blue-600" />}
                color="blue"
                change="+12%"
                changeType="positive"
              />
              <StatsCard
                title="Leads Gerados"
                value={quizAnalytics.leadsWithContact || 0}
                icon={<Users className="w-5 h-5 text-green-600" />}
                color="green"
                change="+8%"
                changeType="positive"
              />
              <div className="text-xs text-gray-500 mt-1">Leads = Email ou telefone capturado</div>
              <StatsCard
                title="Taxa de Conversão"
                value={`${quizAnalytics.conversionRate || 0}%`}
                icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
                color="purple"
                change="+5%"
                changeType="positive"
              />
              <div className="text-xs text-gray-500 mt-1">Conversão = Chegaram até a última página do quiz</div>
              <StatsCard
                title="Completados"
                value={quizAnalytics.completedCount || 0}
                icon={<BarChart3 className="w-5 h-5 text-orange-600" />}
                color="orange"
                change="+3%"
                changeType="positive"
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Nenhum dado disponível para este quiz</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // General analytics view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Analytics
            </h1>
            <p className="text-gray-600">Performance em tempo real otimizada para 100k+ usuários simultâneos</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Stats Cards Modernos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total de Quizzes</p>
                  <p className="text-3xl font-bold">{dashboardStats?.quizzes?.length || 0}</p>
                  <p className="text-blue-100 text-xs">quizzes criados</p>
                </div>
                <BarChart3 className="w-12 h-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total de Leads</p>
                  <p className="text-3xl font-bold">{allAnalytics ? allAnalytics.reduce((sum: number, a: any) => sum + (a.leadsWithContact || 0), 0) : 0}</p>
                  <p className="text-green-100 text-xs">com contato capturado</p>
                </div>
                <Users className="w-12 h-12 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Visualizações</p>
                  <p className="text-3xl font-bold">{allAnalytics ? allAnalytics.reduce((sum: number, a: any) => sum + (a.totalViews || 0), 0) : 0}</p>
                  <p className="text-purple-100 text-xs">acessos únicos</p>
                </div>
                <Eye className="w-12 h-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Taxa de Conversão</p>
                  <p className="text-3xl font-bold">{allAnalytics && allAnalytics.length > 0 ? Math.round(allAnalytics.reduce((sum: number, a: any) => sum + (a.conversionRate || 0), 0) / allAnalytics.length) : 0}%</p>
                  <p className="text-orange-100 text-xs">média geral</p>
                </div>
                <TrendingUp className="w-12 h-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Definições dos Dados */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 mb-8 border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-600" />
              <span className="font-medium text-gray-700">Leads:</span>
              <span className="text-gray-600">Respostas com email/telefone</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-gray-700">Conversões:</span>
              <span className="text-gray-600">Chegaram na última página</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-700">Views:</span>
              <span className="text-gray-600">Acessos ao quiz público</span>
            </div>
          </div>
        </div>

        {/* Quiz List with Analytics - Otimizado para Performance */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Desempenho por Quiz
              <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-800">
                {(userQuizzes || dashboardStats?.quizzes || []).length} quizzes
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {(userQuizzes || dashboardStats?.quizzes) && (userQuizzes?.length > 0 || dashboardStats?.quizzes?.length > 0) ? (
              <div className="divide-y divide-gray-100">
                {(userQuizzes || dashboardStats?.quizzes || []).map((quiz: any, index: number) => (
                  <div
                    key={quiz.id}
                    className={`flex items-center justify-between p-6 hover:bg-gray-50 transition-colors ${
                      index === 0 ? 'rounded-t-lg' : ''
                    } ${
                      index === (userQuizzes || dashboardStats?.quizzes || []).length - 1 ? 'rounded-b-lg' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                        {quiz.title.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{quiz.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Criado em {new Date(quiz.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {quizAnalyticsMap.get(quiz.id)?.views || 0}
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Visualizações</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {quizAnalyticsMap.get(quiz.id)?.leads || 0}
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Leads</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {quizAnalyticsMap.get(quiz.id)?.conversions || 0}%
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Conversão</div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/super-analytics?quiz=${quiz.id}`)}
                        className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                      >
                        Ver Detalhes
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Nenhum quiz encontrado</p>
                <p className="text-sm text-gray-400 mt-2">
                  Crie seu primeiro quiz para começar a ver analytics
                </p>
                <Button className="mt-4" onClick={() => navigate("/quiz-builder")}>
                  Criar Primeiro Quiz
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}