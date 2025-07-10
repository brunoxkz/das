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
import { TutorialTour, dashboardTutorialSteps } from "@/components/tutorial-tour";
import { HelpCircle, RefreshCcw } from "lucide-react";
import { forceRefreshCache } from "@/lib/queryClient";

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
            onClick={() => {
              forceRefreshCache();
              toast({
                title: "Cache Atualizado",
                description: "Dados mais recentes carregados com sucesso!",
              });
            }}
            className="flex items-center gap-2"
            title="Atualizar dados do cache"
          >
            <RefreshCcw className="w-4 h-4" />
            Atualizar
          </Button>
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
      <div className="space-y-6" data-tutorial="stats-overview">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color.replace('text-', '').replace('-600', '')}
              change={index === 0 ? "+2" : index === 1 ? "+15%" : index === 2 ? "+8%" : "+3%"}
              changeType="positive"
            />
          ))}
        </div>

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
          {!userQuizzes || userQuizzes.length === 0 ? (
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
              {userQuizzes.slice(0, 5).map((quiz: any) => (
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
              
              {userQuizzes.length > 5 && (
                <div className="text-center pt-4">
                  <Link href="/quizzes">
                    <Button variant="outline">
                      Ver Todos os Quizzes
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dashboard de Ações Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Criação de Conteúdo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Criar Conteúdo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/quizzes/new">
                <Button className="w-full h-16 flex flex-col items-center justify-center gap-2">
                  <BarChart3 className="w-6 h-6" />
                  <span className="text-sm font-medium">Criar Quiz</span>
                </Button>
              </Link>
              <Link href="/templates">
                <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center gap-2">
                  <Palette className="w-6 h-6" />
                  <span className="text-sm font-medium">Templates</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Campanhas de Marketing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Campanhas de Marketing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              <Link href="/sms-credits">
                <Button variant="outline" className="w-full h-12 flex items-center justify-start gap-3 bg-blue-50 hover:bg-blue-100 border-blue-200">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Criar Campanha SMS</span>
                </Button>
              </Link>
              <Link href="/email-marketing">
                <Button variant="outline" className="w-full h-12 flex items-center justify-start gap-3 bg-green-50 hover:bg-green-100 border-green-200">
                  <Mail className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Criar Campanha Email</span>
                </Button>
              </Link>
              <Link href="/campanhas-whatsapp">
                <Button variant="outline" className="w-full h-12 flex items-center justify-start gap-3 bg-emerald-50 hover:bg-emerald-100 border-emerald-200">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <span className="font-medium">Criar Campanha WhatsApp</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link href="/analytics">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">Analytics</h3>
              <p className="text-xs text-gray-600 mt-1">Ver relatórios</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/ai-conversion">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Video className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">I.A. Videos</h3>
              <p className="text-xs text-gray-600 mt-1">HeyGen API</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/cloaker">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">Cloaker</h3>
              <p className="text-xs text-gray-600 mt-1">Proteção</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/vsl-player">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Video className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">VSL Player</h3>
              <p className="text-xs text-gray-600 mt-1">Grátis</p>
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
