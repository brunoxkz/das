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
import { useAuth } from "@/hooks/useAuth-jwt";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect, useState } from "react";
import React from "react";
import { TutorialTour, dashboardTutorialSteps } from "@/components/tutorial-tour";
import { HelpCircle, RefreshCcw } from "lucide-react";
import { forceRefreshCache, queryClient, apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/useLanguage";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [showTutorial, setShowTutorial] = useState(false);
  const { t } = useLanguage();

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

  // Buscar dados de disparos de campanhas
  const { data: smsCount } = useQuery({
    queryKey: ["/api/sms-campaigns/count"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: whatsappCount } = useQuery({
    queryKey: ["/api/whatsapp-campaigns/count"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: emailCount } = useQuery({
    queryKey: ["/api/email-campaigns/count"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Buscar créditos do usuário
  const { data: userCredits } = useQuery({
    queryKey: ["/api/user/credits"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Buscar dados do usuário
  const { data: userData } = useQuery({
    queryKey: ["/api/auth/verify"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Calcular estatísticas reais baseadas nos analytics
  const totalQuizzes = userQuizzes?.length || 0;
  const totalLeads = (allAnalytics && Array.isArray(allAnalytics)) ? allAnalytics.reduce((sum: number, a: any) => sum + (a.leadsWithContact || 0), 0) : 0;
  const totalViews = (allAnalytics && Array.isArray(allAnalytics)) ? allAnalytics.reduce((sum: number, a: any) => sum + (a.totalViews || 0), 0) : 0;
  const avgConversionRate = (allAnalytics && Array.isArray(allAnalytics) && allAnalytics.length > 0) ? 
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
    <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pb-8" data-tutorial="dashboard-main">
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

      {/* Stats Grid Minimalista */}
      <div className="space-y-8" data-tutorial="stats-overview">
        <div className="grid grid-cols-4 gap-4">
          {/* Quizzes Card */}
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                    <BarChart3 className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t("total_quizzes")}</p>
                    <p className="text-lg font-semibold text-gray-900">{dashboardStats[0]?.value || 0}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visualizações Card */}
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center">
                    <Eye className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t("views")}</p>
                    <p className="text-lg font-semibold text-gray-900">{dashboardStats[2]?.value || 0}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Respostas Card */}
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center">
                    <Users className="w-3 h-3 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t("responses")}</p>
                    <p className="text-lg font-semibold text-gray-900">{dashboardStats[1]?.value || 0}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversão Card */}
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-orange-100 rounded-md flex items-center justify-center">
                    <TrendingUp className="w-3 h-3 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t("conversion_rate")}</p>
                    <p className="text-lg font-semibold text-gray-900">{dashboardStats[3]?.value || "0%"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Nova linha de disparos de campanhas - Design Minimalista */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          {/* SMS Disparos */}
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-cyan-100 rounded-md flex items-center justify-center">
                    <MessageSquare className="w-3 h-3 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">SMS</p>
                    <p className="text-lg font-semibold text-gray-900">{smsCount?.count || 0}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp Disparos */}
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center">
                    <MessageSquare className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">WhatsApp</p>
                    <p className="text-lg font-semibold text-gray-900">{whatsappCount?.count || 0}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Disparos */}
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center">
                    <Mail className="w-3 h-3 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-lg font-semibold text-gray-900">{emailCount?.count || 0}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plano Card */}
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-yellow-100 rounded-md flex items-center justify-center">
                    <Shield className="w-3 h-3 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Plano</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">{userData?.user?.plan || 'Free'}</p>
                  </div>
                </div>
                <Button 
                  size="sm"
                  className="w-6 h-6 p-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-sm"
                  onClick={() => window.location.href = '/planos'}
                  title="Fazer upgrade do plano"
                >
                  <Plus className="w-3 h-3 text-white" />
                </Button>
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
              <h3 className="text-xl font-semibold">{t("your_quizzes_title")}</h3>
              <p className="text-sm text-gray-600 font-normal">{t("manage_and_monitor")}</p>
            </div>
            <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-800 px-3 py-1">
              {userQuizzes?.length || 0} {t("quizzes_count")}
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
                {t("start_your_journey")}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {t("create_first_quiz_desc")}
              </p>
              <Link href="/quizzes/new">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 text-lg">
                  <Plus className="w-5 h-5 mr-2" />
                  {t("create_first_quiz")}
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
                            {quiz.isPublished ? t("published") : t("draft")}
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
                          <div className="text-xs text-gray-500 uppercase tracking-wide">{t("views")}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            {quizAnalyticsMap.get(quiz.id)?.leads || 0}
                          </div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">{t("leads")}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="hover:bg-blue-100"
                          onClick={() => handlePreviewQuiz(quiz)}
                          title={t("view_preview")}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Link href={`/quizzes/${quiz.id}/edit`}>
                          <Button variant="ghost" size="sm" className="hover:bg-purple-100" title={t("edit_quiz")}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="hover:bg-gray-100"
                          onClick={() => handleDuplicateQuiz(quiz)}
                          title={t("duplicate_quiz")}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="hover:bg-green-100"
                          onClick={() => handlePublicUrl(quiz)}
                          title={t("copy_public_url")}
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
                      {t("view_all_quizzes")} ({userQuizzes.length})
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
                <h3 className="text-xl font-semibold text-gray-900">{t("quick_buttons")}</h3>
                <p className="text-sm text-gray-600 font-normal">{t("direct_access_main_features")}</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-3">
              <Link href="/quizzes/new">
                <Button className="w-full h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-200">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm font-medium">{t("create_quiz")}</span>
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full h-12 flex items-center justify-center gap-2 bg-white hover:bg-purple-50 border-purple-200 text-purple-700 hover:text-purple-800 shadow-sm hover:shadow-md transition-all duration-200"
                onClick={() => setShowTutorial(true)}
              >
                <HelpCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{t("tutorials")}</span>
              </Button>
              <Link href="/templates">
                <Button variant="outline" className="w-full h-12 flex items-center justify-center gap-2 bg-white hover:bg-green-50 border-green-200 text-green-700 hover:text-green-800 shadow-sm hover:shadow-md transition-all duration-200">
                  <Palette className="w-4 h-4" />
                  <span className="text-sm font-medium">{t("templates")}</span>
                </Button>
              </Link>
              <Button variant="outline" className="w-full h-12 flex items-center justify-center gap-2 bg-white hover:bg-orange-50 border-orange-200 text-orange-700 hover:text-orange-800 shadow-sm hover:shadow-md transition-all duration-200">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">{t("plans")}</span>
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
                <h3 className="text-xl font-semibold text-gray-900">{t("marketing_automation")}</h3>
                <p className="text-sm text-gray-600 font-normal">{t("multichannel_campaigns")}</p>
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

      {/* Ações Rápidas - Design Minimalista Horizontal */}
      <div className="mt-12 grid grid-cols-4 gap-3">
        <Link href="/analytics">
          <Card className="bg-white border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 cursor-pointer">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Analytics</h3>
                  <p className="text-xs text-gray-500">Relatórios</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/ai-conversion">
          <Card className="bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Video className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">I.A. Vídeos</h3>
                  <p className="text-xs text-gray-500">HeyGen</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/cloaker">
          <Card className="bg-white border border-gray-200 hover:border-gray-400 hover:shadow-md transition-all duration-200 cursor-pointer">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Cloaker</h3>
                  <p className="text-xs text-gray-500">Anti WebView</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/vsl-player">
          <Card className="bg-white border border-gray-200 hover:border-red-300 hover:shadow-md transition-all duration-200 cursor-pointer">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Video className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">VSL Player</h3>
                  <p className="text-xs text-gray-500">Vídeo Sales</p>
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
    </div>
  );
}
