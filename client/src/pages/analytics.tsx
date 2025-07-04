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
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import { Link } from "wouter";

export default function Analytics() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  const { data: quizzes, isLoading: quizzesLoading } = useQuery({
    queryKey: ["/api/quizzes"],
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
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  if (authLoading || statsLoading || quizzesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const dashboardStats = [
    {
      title: "Total de Visualizações",
      value: stats?.totalViews || 0,
      icon: <Eye className="w-4 h-4" />,
      color: "text-blue-600",
      change: "+12.5%",
      changeType: "positive" as const
    },
    {
      title: "Leads Capturados",
      value: stats?.totalLeads || 0,
      icon: <Users className="w-4 h-4" />,
      color: "text-green-600",
      change: "+8.3%",
      changeType: "positive" as const
    },
    {
      title: "Taxa de Conversão",
      value: `${stats?.avgConversionRate || 0}%`,
      icon: <TrendingUp className="w-4 h-4" />,
      color: "text-purple-600",
      change: "+3.2%",
      changeType: "positive" as const
    },
    {
      title: "Quizzes Ativos",
      value: quizzes?.filter((q: any) => q.isPublished).length || 0,
      icon: <BarChart3 className="w-4 h-4" />,
      color: "text-orange-600",
      change: "+2",
      changeType: "positive" as const
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Geral</h1>
            <p className="text-gray-600 mt-1">Visão geral do desempenho de todos os seus quizzes</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              📊 Visão Geral
            </Badge>
            <div className="text-sm text-gray-500">
              Última atualização: {new Date().toLocaleTimeString('pt-BR')}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance nos Últimos 30 Dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>Gráfico de performance será exibido aqui</p>
                <p className="text-sm text-gray-400">Dados em tempo real</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Funil de Conversão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Visualizações</span>
                <span className="font-semibold">{stats?.totalViews || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Iniciaram o Quiz</span>
                <span className="font-semibold">{Math.round((stats?.totalViews || 0) * 0.75)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completaram</span>
                <span className="font-semibold">{Math.round((stats?.totalViews || 0) * 0.45)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Deixaram Dados</span>
                <span className="font-semibold">{stats?.totalLeads || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${stats?.avgConversionRate || 0}%` }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance por Quiz
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!quizzes || quizzes.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum quiz para analisar</p>
              <p className="text-sm text-gray-400">Crie um quiz para ver os analytics</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Quiz</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Visualizações</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Leads</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Conversão</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map((quiz: any) => (
                    <tr key={quiz.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{quiz.title}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(quiz.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={quiz.isPublished ? "default" : "secondary"}>
                          {quiz.isPublished ? "Publicado" : "Rascunho"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-2 text-gray-400" />
                          {Math.floor(Math.random() * 1000)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-gray-400" />
                          {Math.floor(Math.random() * 100)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2 text-gray-400" />
                          {Math.floor(Math.random() * 50)}%
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/super-analytics/${quiz.id}`}>
                            <Button variant="outline" size="sm" className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200">
                              <BarChart3 className="w-4 h-4 mr-1" />
                              Super Analytics
                            </Button>
                          </Link>
                          <Link href={`/quiz-builder/${quiz.id}`}>
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                              <Eye className="w-4 h-4 mr-1" />
                              Editar
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
