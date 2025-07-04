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
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
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

  // Debug logs
  useEffect(() => {
    console.log("Analytics Debug:", {
      isAuthenticated,
      selectedQuizId,
      userQuizzes,
      quizzesLoading,
      quizzesError,
      dashboardStats
    });
  }, [isAuthenticated, selectedQuizId, userQuizzes, quizzesLoading, quizzesError, dashboardStats]);

  // Fetch specific quiz analytics if quiz is selected
  const { data: quizAnalytics, isLoading: quizAnalyticsLoading } = useQuery({
    queryKey: ["/api/analytics", selectedQuizId],
    enabled: isAuthenticated && !!selectedQuizId,
    retry: false,
  });

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
                value={quizAnalytics.totalLeads || 0}
                icon={<Users className="w-5 h-5 text-green-600" />}
                color="green"
                change="+8%"
                changeType="positive"
              />
              <StatsCard
                title="Taxa de Conversão"
                value={`${quizAnalytics.conversionRate || 0}%`}
                icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
                color="purple"
                change="+5%"
                changeType="positive"
              />
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Geral</h1>
            <p className="text-gray-600">Visão geral do desempenho dos seus quizzes</p>
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
        </div>

        {/* General Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total de Quizzes"
            value={dashboardStats?.totalQuizzes || 0}
            icon={<BarChart3 className="w-5 h-5 text-blue-600" />}
            color="blue"
            change="+5%"
            changeType="positive"
          />
          <StatsCard
            title="Total de Leads"
            value={dashboardStats?.totalLeads || 0}
            icon={<Users className="w-5 h-5 text-green-600" />}
            color="green"
            change="+12%"
            changeType="positive"
          />
          <StatsCard
            title="Total de Visualizações"
            value={dashboardStats?.totalViews || 0}
            icon={<Eye className="w-5 h-5 text-purple-600" />}
            color="purple"
            change="+8%"
            changeType="positive"
          />
          <StatsCard
            title="Taxa Média de Conversão"
            value={`${dashboardStats?.avgConversionRate || 0}%`}
            icon={<TrendingUp className="w-5 h-5 text-orange-600" />}
            color="orange"
            change="+3%"
            changeType="positive"
          />
        </div>

        {/* Quiz List with Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Desempenho por Quiz
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userQuizzes && userQuizzes.length > 0 ? (
              <div className="space-y-3">
                {userQuizzes.map((quiz: any) => (
                  <div
                    key={quiz.id}
                    className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{quiz.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Criado em {new Date(quiz.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {Math.floor(Math.random() * 100)}
                        </div>
                        <div className="text-xs text-gray-500">Visualizações</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {Math.floor(Math.random() * 50)}
                        </div>
                        <div className="text-xs text-gray-500">Leads</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {Math.floor(Math.random() * 30)}%
                        </div>
                        <div className="text-xs text-gray-500">Conversão</div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/super-analytics?quiz=${quiz.id}`)}
                        className="flex items-center gap-1"
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