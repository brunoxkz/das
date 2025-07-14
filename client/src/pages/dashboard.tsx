import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeSelector } from "@/components/theme-selector";
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
  MessageSquare,
  MessageCircle,
  Mail,
  FileText,
  Shield,
  Palette,
  Coins,
  BookOpen,
  Clock,
  CreditCard,
  X
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth-jwt";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import React from "react";
import { TutorialTour, dashboardTutorialSteps } from "@/components/tutorial-tour";
import { HelpCircle } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/useLanguage";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [showTutorial, setShowTutorial] = useState(false);
  const [showTrialBanner, setShowTrialBanner] = useState(true);
  const { t } = useLanguage();

  // Buscar dados do usuário
  const { data: userData } = useQuery({
    queryKey: ["/api/auth/validate"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Buscar quizzes do usuário
  const { data: userQuizzes, isLoading: quizzesLoading } = useQuery({
    queryKey: ["/api/quizzes"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Buscar analytics completos
  const { data: allAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/analytics"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Buscar dados de campanhas
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

  // Calcular estatísticas reais
  const totalQuizzes = userQuizzes?.length || 0;
  const totalLeads = (allAnalytics && Array.isArray(allAnalytics)) ? allAnalytics.reduce((sum: number, a: any) => sum + (a.leadsWithContact || 0), 0) : 0;
  const totalViews = (allAnalytics && Array.isArray(allAnalytics)) ? allAnalytics.reduce((sum: number, a: any) => sum + (a.totalViews || 0), 0) : 0;
  const avgConversionRate = (allAnalytics && Array.isArray(allAnalytics) && allAnalytics.length > 0) ? 
    Math.round(allAnalytics.reduce((sum: number, a: any) => sum + (a.conversionRate || 0), 0) / allAnalytics.length) : 0;

  const dashboardLoading = quizzesLoading || analyticsLoading;

  // Verificar plano e calcular dias restantes
  const userPlan = userData?.user?.plan || 'free';
  const planExpirationDate = userData?.user?.planExpirationDate;
  
  // Calcular dias restantes baseado no plano
  const calculateDaysLeft = () => {
    if (planExpirationDate) {
      const expDate = new Date(planExpirationDate);
      const today = new Date();
      const diffTime = expDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }
    
    // Valores padrão para demonstração
    switch (userPlan) {
      case 'trial':
        return 3;
      case 'free':
        return 7; // 7 dias gratuitos
      case 'premium':
        return 30; // 30 dias premium
      case 'enterprise':
        return 365; // 365 dias enterprise
      default:
        return 7;
    }
  };
  
  const daysLeft = calculateDaysLeft();
  const showPlanBanner = true; // Sempre mostrar banner para demonstração

  // Criar mapa de analytics por quiz
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
      const response = await apiRequest(`/api/quizzes/${quiz.id}/duplicate`, {
        method: 'POST'
      });
      
      if (response.quiz) {
        toast({
          title: "Quiz Duplicado",
          description: `Uma cópia de "${quiz.title}" foi criada com sucesso!`,
        });
        
        queryClient.invalidateQueries({ queryKey: ['/api/quizzes'] });
        queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
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
        description: "A URL pública do quiz foi copiada para a área de transferência.",
      });
    }).catch((error) => {
      console.error('Erro ao copiar URL:', error);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a URL. Tente novamente.",
        variant: "destructive",
      });
    });
  };

  const handleDeleteQuiz = async (quiz: any) => {
    if (!confirm(`Tem certeza que deseja excluir o quiz "${quiz.title}"?`)) {
      return;
    }

    try {
      await apiRequest(`/api/quizzes/${quiz.id}`, {
        method: 'DELETE'
      });
      
      toast({
        title: "Quiz Excluído",
        description: `"${quiz.title}" foi excluído com sucesso.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
    } catch (error) {
      console.error('Erro ao excluir quiz:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o quiz. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const dashboardStats = [
    {
      title: t("total_quizzes"),
      value: totalQuizzes,
      icon: <BarChart3 className="w-5 h-5" />,
      color: "bg-blue-500"
    },
    {
      title: t("responses"),
      value: totalLeads,
      icon: <Users className="w-5 h-5" />,
      color: "bg-purple-500"
    },
    {
      title: t("views"),
      value: totalViews,
      icon: <Eye className="w-5 h-5" />,
      color: "bg-green-500"
    },
    {
      title: t("conversion_rate"),
      value: `${avgConversionRate}%`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "bg-orange-500"
    }
  ];

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dashboard-background">
      {/* Faixa de Plano - Verde Vendzz */}
      {showPlanBanner && showTrialBanner && (
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5" />
              <div>
                <span className="font-semibold">
                  Plano {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)}: {daysLeft} {daysLeft === 1 ? 'dia restante' : 'dias restantes'}
                </span>
                <p className="text-sm text-green-100">
                  {userPlan === 'trial' ? 'Teste grátis por tempo limitado! Upgrade para continuar.' : 
                   userPlan === 'free' ? 'Upgrade para acesso ilimitado e recursos premium.' :
                   'Renove seu plano para continuar aproveitando todos os recursos.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/planos">
                <Button 
                  variant="outline" 
                  className="bg-white text-green-600 hover:bg-green-50 border-white"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {userPlan === 'trial' || userPlan === 'free' ? 'Assinar Agora' : 'Renovar Plano'}
                </Button>
              </Link>
              <Link href="/credits">
                <Button 
                  variant="outline" 
                  className="bg-white text-blue-600 hover:bg-blue-50 border-white"
                >
                  <Coins className="w-4 h-4 mr-2" />
                  Comprar Créditos
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTrialBanner(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t("dashboard")}
              </h1>
              <p className="dashboard-text-secondary mt-2">
                {t("welcome_back")} {userData?.user?.firstName || "Usuário"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Status Indicator - Live */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75"></div>
                </div>
                <span className="text-sm font-medium text-green-600">Sistema Ativo</span>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowTutorial(true)}
                className="dashboard-button"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Tutorial
              </Button>
              <Link href="/quizzes/new">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Quiz
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {dashboardStats.map((stat, index) => (
              <Card key={index} className="dashboard-stat-card shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm dashboard-text-muted mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold dashboard-text-primary">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-white`}>
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Campanhas Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="dashboard-stat-card shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm dashboard-text-muted mb-1">SMS Enviados</p>
                    <p className="text-2xl font-bold dashboard-text-primary">{smsCount?.count || 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-cyan-500 flex items-center justify-center text-white">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-stat-card shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm dashboard-text-muted mb-1">WhatsApp</p>
                    <p className="text-2xl font-bold dashboard-text-primary">{whatsappCount?.count || 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center text-white">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-stat-card shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm dashboard-text-muted mb-1">Emails</p>
                    <p className="text-2xl font-bold dashboard-text-primary">{emailCount?.count || 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                    <Mail className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dashboard-stat-card shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm dashboard-text-muted mb-1">Créditos</p>
                    <p className="text-2xl font-bold dashboard-text-primary">{userCredits?.total || 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center text-white">
                    <Coins className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seus Quizzes */}
          <Card className="dashboard-card shadow-xl mb-8">
            <CardHeader className="dashboard-header border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl dashboard-text-primary">Seus Quizzes</CardTitle>
                {userQuizzes && userQuizzes.length > 6 && (
                  <Link href="/quizzes">
                    <Button variant="outline" size="sm" className="dashboard-button">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Todos ({userQuizzes.length})
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {userQuizzes && userQuizzes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userQuizzes.slice(0, 6).map((quiz: any) => {
                    const analytics = quizAnalyticsMap.get(quiz.id) || { views: 0, leads: 0, conversions: 0 };
                    return (
                      <Card key={quiz.id} className="dashboard-quiz-card hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold dashboard-text-primary truncate">{quiz.title}</h3>
                            <Badge variant={quiz.isPublished ? "default" : "secondary"} className="dashboard-badge">
                              {quiz.isPublished ? "Publicado" : "Rascunho"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex justify-between text-sm dashboard-text-muted mb-3">
                            <span>{analytics.views} views</span>
                            <span>{analytics.leads} leads</span>
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/quizzes/${quiz.id}/edit`}>
                              <Button size="sm" variant="outline" className="dashboard-button">
                                <Edit className="w-3 h-3 mr-1" />
                                Editar
                              </Button>
                            </Link>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="dashboard-button"
                              onClick={() => handlePreviewQuiz(quiz)}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Preview
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="dashboard-text-muted mb-4">Você ainda não criou nenhum quiz.</p>
                  <Link href="/quizzes/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Quiz
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/analytics">
              <Card className="dashboard-card hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold dashboard-text-primary">Analytics</h3>
                  <p className="text-sm dashboard-text-muted">Relatórios</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/credits">
              <Card className="dashboard-card hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Coins className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold dashboard-text-primary">Créditos</h3>
                  <p className="text-sm dashboard-text-muted">Saldo</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/planos">
              <Card className="dashboard-card hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold dashboard-text-primary">Planos</h3>
                  <p className="text-sm dashboard-text-muted">Upgrade</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/tutoriais">
              <Card className="dashboard-card hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold dashboard-text-primary">Tutoriais</h3>
                  <p className="text-sm dashboard-text-muted">Guias</p>
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
    </div>
  );
}