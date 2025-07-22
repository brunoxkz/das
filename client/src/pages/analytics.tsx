import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Users, 
  Calendar,
  Target,
  Award
} from "lucide-react";

export default function AnalyticsPage() {
  // Buscar dados de analytics
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/analytics"],
  });

  // Buscar quizzes para analytics
  const { data: quizzes } = useQuery({
    queryKey: ["/api/quizzes"],
  });

  const safeAnalytics = analytics || {
    totalViews: 0,
    totalResponses: 0,
    conversionRate: 0,
    topQuizzes: [],
    weeklyStats: []
  };

  const safeQuizzes = quizzes || [];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Acompanhe o desempenho dos seus quizzes
        </p>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeAnalytics.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Visualizações dos seus quizzes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Respostas</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeAnalytics.totalResponses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Respostas completas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeAnalytics.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Taxa média de conclusão
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quizzes Ativos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeQuizzes.length}</div>
            <p className="text-xs text-muted-foreground">
              Quizzes criados
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="quizzes">Por Quiz</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quizzes com Melhor Performance</CardTitle>
                <CardDescription>
                  Seus quizzes com maior taxa de conversão
                </CardDescription>
              </CardHeader>
              <CardContent>
                {safeAnalytics.topQuizzes.length > 0 ? (
                  <div className="space-y-4">
                    {safeAnalytics.topQuizzes.map((quiz: any, index: number) => (
                      <div key={quiz.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{quiz.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {quiz.views} visualizações
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {quiz.conversionRate}% conversão
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Dados de performance aparecerão aqui conforme seus quizzes recebem respostas
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo Semanal</CardTitle>
                <CardDescription>
                  Performance dos últimos 7 dias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Visualizações</span>
                    <span className="text-sm">{safeAnalytics.weeklyViews || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Respostas</span>
                    <span className="text-sm">{safeAnalytics.weeklyResponses || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Taxa de Conversão</span>
                    <span className="text-sm">{(safeAnalytics.weeklyConversion || 0).toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance por Quiz</CardTitle>
              <CardDescription>
                Detalhes de performance de cada quiz
              </CardDescription>
            </CardHeader>
            <CardContent>
              {safeQuizzes.length > 0 ? (
                <div className="space-y-4">
                  {safeQuizzes.map((quiz: any) => (
                    <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{quiz.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Criado em {new Date(quiz.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <p className="font-medium">{quiz.views || 0}</p>
                          <p className="text-muted-foreground">Visualizações</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{quiz.responses || 0}</p>
                          <p className="text-muted-foreground">Respostas</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{((quiz.responses || 0) / (quiz.views || 1) * 100).toFixed(1)}%</p>
                          <p className="text-muted-foreground">Conversão</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Você ainda não criou nenhum quiz
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendências</CardTitle>
              <CardDescription>
                Análise de tendências e padrões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Dados de tendências estarão disponíveis conforme você acumula mais dados
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}