import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  Users, 
  Eye, 
  TrendingUp,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ArrowLeft,
  Target,
  MousePointer,
  UserMinus,
  Clock,
  Percent
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth-jwt";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PageAnalytics {
  pageId: number;
  pageName: string;
  pageType: 'normal' | 'transition' | 'game';
  views: number;
  clicks: number;
  dropOffs: number;
  clickRate: number;
  dropOffRate: number;
  avgTimeOnPage: number;
  nextPageViews: number;
}

interface QuizAnalytics {
  totalViews: number;
  totalCompletions: number;
  totalDropOffs: number;
  completionRate: number;
  avgCompletionTime: number;
  pageAnalytics: PageAnalytics[];
}

export default function SuperAnalytics() {
  const params = new URLSearchParams(window.location.search);
  const quizId = params.get('quiz');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  console.log("SUPER ANALYTICS - URL:", window.location.search);
  console.log("SUPER ANALYTICS - Quiz ID:", quizId);
  const [timeRange, setTimeRange] = useState('7d');
  const [dateFilter, setDateFilter] = useState("7");
  const [isDataReset, setIsDataReset] = useState(false);
  const queryClient = useQueryClient();

  const { data: quizzes } = useQuery({
    queryKey: ["/api/quizzes"],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/quizzes", {
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
    retry: false,
  });
  
  console.log("SUPER ANALYTICS - Quizzes data:", quizzes);

  const quiz = quizzes?.find((q: any) => q.id === quizId);
  const quizLoading = !quizzes;

  const { data: analytics, isLoading: analyticsLoading, refetch } = useQuery({
    queryKey: ["/api/analytics", quizId, timeRange],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/analytics/${quizId}`, {
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
    enabled: !!quizId && !!quiz,
    retry: false,
  });
  
  // Debug logs (can be removed in production)
  // console.log("SUPER ANALYTICS - Analytics data:", analytics);
  // console.log("SUPER ANALYTICS - Analytics structure:", analytics?.analytics);
  // console.log("SUPER ANALYTICS - Total views:", analytics?.analytics?.totalViews);

  // Função para exportar dados como CSV
  const exportToCSV = () => {
    const csvData = (analyticsData?.pageAnalytics || []).map(page => ({
      'Página': page.pageName,
      'Tipo': page.pageType,
      'Visualizações': page.views,
      'Cliques': page.clicks,
      'Taxa de Clique (%)': page.clickRate.toFixed(1),
      'Abandonos': page.dropOffs,
      'Taxa de Abandono (%)': page.dropOffRate.toFixed(1),
      'Tempo Médio (s)': page.avgTimeOnPage.toFixed(0),
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `analytics-${quiz?.title || 'quiz'}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast({
      title: "CSV Exportado",
      description: "Os dados de analytics foram exportados com sucesso.",
    });
  };

  // Função para resetar dados do quiz
  const resetMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/analytics/${quizId}/reset`);
    },
    onSuccess: () => {
      setIsDataReset(true);
      toast({
        title: "Dados Resetados",
        description: "Todos os dados de analytics deste quiz foram zerados.",
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao resetar",
        description: error.message || "Não foi possível resetar os dados.",
        variant: "destructive",
      });
    },
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
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  if (authLoading || quizLoading || analyticsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-vendzz-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // If no quiz is selected, show quiz selection
  if (!quizId) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Super Analytics</h1>
            <p className="text-gray-600">Selecione um quiz para ver analytics detalhados</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Escolha um Quiz</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                Para acessar o Super Analytics, você precisa especificar um quiz. 
                Vá para Analytics geral e clique em "Ver Detalhes" em um quiz específico.
              </p>
              <div className="space-y-2">
                <Button onClick={() => setLocation("/analytics")} className="w-full">
                  Ir para Analytics Geral
                </Button>
                <Button onClick={() => setLocation("/dashboard")} variant="outline" className="w-full">
                  Voltar ao Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz não encontrado</h2>
          <p className="text-gray-600 mb-4">O quiz solicitado não existe ou você não tem permissão para acessá-lo.</p>
          <Button onClick={() => setLocation("/analytics")}>
            Voltar para Analytics
          </Button>
        </div>
      </div>
    );
  }

  // Use real analytics data from API
  const analyticsData = analytics?.analytics || {
    totalViews: 0,
    totalCompletions: 0,
    totalDropOffs: 0,
    completionRate: 0,
    avgCompletionTime: 0,
    pageAnalytics: []
  };

  // Ensure pageAnalytics exists and has data structure
  if (!analyticsData.pageAnalytics || analyticsData.pageAnalytics.length === 0) {
    // Generate page analytics from quiz structure if not available
    const pages = quiz?.structure?.pages || [];
    analyticsData.pageAnalytics = pages.map((page: any, index: number) => ({
      pageId: page.id,
      pageName: page.title || `Página ${index + 1}`,
      pageType: page.isGame ? 'game' : page.isTransition ? 'transition' : 'normal',
      views: 0,
      clicks: 0,
      dropOffs: 0,
      clickRate: 0,
      dropOffRate: 0,
      avgTimeOnPage: 0,
      nextPageViews: 0
    }));
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Super Analytics</h1>
              <p className="text-gray-600">{quiz?.title || "Carregando..."}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filtrar por dias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Último dia</SelectItem>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="15">Últimos 15 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="60">Últimos 60 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={() => refetch()} size="sm" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            
            <Button onClick={exportToCSV} size="sm" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Resetar dados do quiz?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação irá apagar permanentemente todos os dados de analytics deste quiz,
                    incluindo visualizações, respostas e métricas de performance. Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => resetMutation.mutate()}
                    disabled={resetMutation.isPending}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {resetMutation.isPending ? "Resetando..." : "Sim, resetar dados"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Visualizações</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(analyticsData?.totalViews || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12% vs. período anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercentage(analyticsData?.completionRate || 0)}</div>
              <p className="text-xs text-muted-foreground">+2.1% vs. período anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(analyticsData?.avgCompletionTime || 0)}</div>
              <p className="text-xs text-muted-foreground">-15s vs. período anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Desistências</CardTitle>
              <UserMinus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(analyticsData?.totalDropOffs || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{formatPercentage(100 - (analyticsData?.completionRate || 0))} taxa de desistência</p>
            </CardContent>
          </Card>
        </div>

        {/* Page Analytics Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Análise Detalhada por Página
            </CardTitle>
            <p className="text-sm text-gray-600">
              Métricas de performance e engajamento para cada página do seu quiz
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-4 font-semibold">Página</th>
                    <th className="text-left p-4 font-semibold">Tipo</th>
                    <th className="text-right p-4 font-semibold">Visualizações</th>
                    <th className="text-right p-4 font-semibold">Cliques</th>
                    <th className="text-right p-4 font-semibold">Taxa de Clique</th>
                    <th className="text-right p-4 font-semibold">Desistências</th>
                    <th className="text-right p-4 font-semibold">Taxa de Evasão</th>
                    <th className="text-right p-4 font-semibold">Tempo Médio</th>
                    <th className="text-right p-4 font-semibold">Conversão</th>
                  </tr>
                </thead>
                <tbody>
                  {(analyticsData?.pageAnalytics || []).map((page, index) => (
                    <tr key={page.pageId} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{page.pageName}</span>
                          <Badge variant="secondary" className="text-xs">
                            #{index + 1}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge 
                          variant={page.pageType === 'game' ? 'default' : 
                                 page.pageType === 'transition' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {page.pageType === 'game' ? '🎮 Jogo' : 
                           page.pageType === 'transition' ? '✨ Transição' : '📄 Normal'}
                        </Badge>
                      </td>
                      <td className="p-4 text-right font-mono">{page.views.toLocaleString()}</td>
                      <td className="p-4 text-right font-mono">{page.clicks.toLocaleString()}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-mono">{formatPercentage(page.clickRate)}</span>
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-vendzz-primary transition-all"
                              style={{ width: `${Math.min(100, page.clickRate)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right font-mono">{page.dropOffs.toLocaleString()}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`font-mono ${page.dropOffRate > 20 ? 'text-red-600' : page.dropOffRate > 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {formatPercentage(page.dropOffRate)}
                          </span>
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all ${page.dropOffRate > 20 ? 'bg-red-500' : page.dropOffRate > 10 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${Math.min(100, page.dropOffRate)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right font-mono">{formatTime(Math.floor(page.avgTimeOnPage))}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-mono">
                            {page.nextPageViews > 0 ? formatPercentage((page.nextPageViews / page.views) * 100) : 'Final'}
                          </span>
                          {page.nextPageViews > 0 && (
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 transition-all"
                                style={{ width: `${Math.min(100, (page.nextPageViews / page.views) * 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Insights and Recommendations */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Insights Automáticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">🚨 Alta Taxa de Evasão</h4>
                  <p className="text-sm text-red-700">
                    A página "{(analyticsData?.pageAnalytics || []).find(p => p.dropOffRate > 20)?.pageName || 'Página 2'}" 
                    tem {formatPercentage((analyticsData?.pageAnalytics || []).find(p => p.dropOffRate > 20)?.dropOffRate || 25)} de evasão. 
                    Considere simplificar o conteúdo ou melhorar a UX.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Boa Performance</h4>
                  <p className="text-sm text-green-700">
                    A página "{(analyticsData?.pageAnalytics || []).find(p => p.clickRate > 70)?.pageName || 'Página 1'}" 
                    tem excelente engajamento com {formatPercentage((analyticsData?.pageAnalytics || []).find(p => p.clickRate > 70)?.clickRate || 75)} de cliques.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">💡 Oportunidade</h4>
                  <p className="text-sm text-blue-700">
                    Adicione elementos interativos nas páginas com baixo tempo de permanência para aumentar o engajamento.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Recomendações de Otimização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-vendzz-primary text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <div>
                    <h4 className="font-semibold mb-1">Otimize a sequência de páginas</h4>
                    <p className="text-sm text-gray-600">Mova páginas com alto engajamento para o início do funil</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-vendzz-primary text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <div>
                    <h4 className="font-semibold mb-1">Adicione elementos de gamificação</h4>
                    <p className="text-sm text-gray-600">Jogos mantêm os usuários engajados por mais tempo</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-vendzz-primary text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <div>
                    <h4 className="font-semibold mb-1">Revise páginas com alta evasão</h4>
                    <p className="text-sm text-gray-600">Simplifique ou torne mais atrativas as páginas problemáticas</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-vendzz-primary text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                  <div>
                    <h4 className="font-semibold mb-1">Use transições estratégicas</h4>
                    <p className="text-sm text-gray-600">Páginas de transição podem reduzir a evasão entre seções</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}