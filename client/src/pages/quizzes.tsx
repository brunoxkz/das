import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Plus, 
  BarChart3, 
  Edit, 
  Trash2,
  Eye,
  Users,
  Calendar,
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Quizzes() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  const { data: quizzes, isLoading, error } = useQuery({
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
  });

  const deleteMutation = useMutation({
    mutationFn: async (quizId: string) => {
      await apiRequest("DELETE", `/api/quizzes/${quizId}`);
    },
    onSuccess: () => {
      toast({
        title: "Quiz excluído",
        description: "O quiz foi excluído com sucesso.",
      });
      // Limpar cache completamente e forçar nova busca
      queryClient.removeQueries({ queryKey: ["/api/quizzes"] });
      queryClient.removeQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir",
        description: error.message || "Não foi possível excluir o quiz.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteQuiz = (quizId: string, quizTitle: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o quiz "${quizTitle}"? Esta ação não pode ser desfeita.`)) {
      deleteMutation.mutate(quizId);
    }
  };

  const quizzesList = Array.isArray(quizzes) ? quizzes : [];
  const filteredQuizzes = quizzesList.filter((quiz: any) =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcula o status correto do quiz
  const getQuizStatus = (quiz: any) => {
    return quiz.isPublished ? "Ativo" : "Inativo";
  };

  // Calcula estatísticas com dados reais
  const totalLeads = quizzesList.reduce((total: number, quiz: any) => total + (quiz.totalResponses || 0), 0);
  const totalViews = quizzesList.reduce((total: number, quiz: any) => total + (quiz.totalViews || 0), 0);
  const avgConversionRate = quizzesList.length > 0 ? 
    Math.round((quizzesList.reduce((total: number, quiz: any) => {
      const rate = quiz.totalViews > 0 ? (quiz.totalResponses / quiz.totalViews) * 100 : 0;
      return total + rate;
    }, 0) / quizzesList.length)) : 0;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-2">Erro ao carregar quizzes</div>
          <p className="text-gray-600">Tente novamente mais tarde</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Quizzes</h1>
          <p className="text-gray-600">Gerencie todos os seus quizzes em um só lugar</p>
        </div>
        <Link href="/quizzes/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Criar Quiz
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Pesquisar quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Quizzes</p>
                <p className="text-2xl font-bold text-gray-900">{quizzesList.length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Leads Capturados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalLeads}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-gray-900">
                  {avgConversionRate}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quizzes Grid */}
      {filteredQuizzes.length === 0 ? (
        <div className="text-center py-12">
          {searchTerm ? (
            <>
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum quiz encontrado</h3>
              <p className="text-gray-600">Tente ajustar sua pesquisa ou criar um novo quiz</p>
            </>
          ) : (
            <>
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum quiz criado ainda</h3>
              <p className="text-gray-600 mb-4">Crie seu primeiro quiz para começar a capturar leads</p>
              <Link href="/quizzes/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Quiz
                </Button>
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz: any) => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg mb-1">{quiz.title}</CardTitle>
                    <p className="text-sm text-gray-600 line-clamp-2">{quiz.description}</p>
                  </div>
                  <Badge variant={quiz.isPublished ? "default" : "secondary"}>
                    {getQuizStatus(quiz)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Eye className="w-4 h-4 mr-1" />
                      {quiz.totalViews || 0} visualizações
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      {quiz.totalResponses || 0} respostas
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    Criado em {format(new Date(quiz.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-2">
                    <Link href={`/quizzes/${quiz.id}/edit`}>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="px-2"
                      onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}