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
  Calendar
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth-jwt";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect, useState } from "react";
import { TutorialTour, dashboardTutorialSteps } from "@/components/tutorial-tour";
import { HelpCircle } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [showTutorial, setShowTutorial] = useState(false);

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
    staleTime: 30000, // 30 segundos de cache
    enabled: isAuthenticated,
  });

  // Calcular estatísticas em tempo real
  const quizzesList = Array.isArray((dashboardData as any)?.quizzes) ? (dashboardData as any).quizzes : [];
  const responsesList = Array.isArray((dashboardData as any)?.responses) ? (dashboardData as any).responses : [];
  
  const totalQuizzes = quizzesList.length;
  const totalLeads = responsesList.length;
  const totalViews = quizzesList.reduce((sum: number, quiz: any) => sum + (quiz.totalViews || 0), 0);
  const avgConversionRate = totalViews > 0 ? Math.round((totalLeads / totalViews) * 100) : 0;

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
    <div className="p-4 md:p-6 space-y-6" data-tutorial="dashboard-main">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 text-sm md:text-base">Gerencie seus quizzes e acompanhe o desempenho</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={() => setShowTutorial(true)}
            className="flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            Tutorial
          </Button>
          <Link href="/quizzes/new">
            <Button className="flex items-center gap-2 w-full sm:w-auto" data-tutorial="create-quiz-btn">
              <Plus className="w-4 h-4" />
              Criar Quiz
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-tutorial="stats-cards">
        {dashboardStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Recent Quizzes */}
      <Card data-tutorial="quizzes-list">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Seus Quizzes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {quizzesList.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum quiz criado ainda
              </h3>
              <p className="text-gray-600 mb-6">
                Crie seu primeiro quiz para começar a capturar leads
              </p>
              <Link href="/quizzes/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Quiz
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {quizzesList.slice(0, 5).map((quiz: any) => (
                <div key={quiz.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate">{quiz.title}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-600 space-y-1 sm:space-y-0">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(quiz.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                        <Badge variant={quiz.isPublished ? "default" : "secondary"}>
                          {quiz.isPublished ? "Publicado" : "Rascunho"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 sm:ml-4">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Link href={`/quizzes/${quiz.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {quizzesList.length > 5 && (
                <div className="text-center pt-4">
                  <Button variant="outline">
                    Ver Todos os Quizzes
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Link href="/quizzes/new">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900">Criar Quiz</h3>
                  <p className="text-sm text-gray-600">Novo quiz do zero</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/templates">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900">Templates</h3>
                  <p className="text-sm text-gray-600">Usar template pronto</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/super-analytics">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900">Analytics</h3>
                  <p className="text-sm text-gray-600">Ver relatórios</p>
                </div>
              </div>
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
  );
}
