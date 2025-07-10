import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Plus, 
  BarChart3, 
  Edit, 
  Trash2,
  Eye,
  Users,
  Calendar,
  TrendingUp,
  ExternalLink,
  Copy,
  Filter,
  Grid3X3,
  List,
  Settings,
  Activity,
  CheckCircle,
  Clock,
  Zap
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Quizzes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();
  
  const { data: quizzes, isLoading, error, refetch } = useQuery({
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
      
      // Invalidação completa do cache para atualizar analytics e dashboard
      queryClient.removeQueries({ queryKey: ["/api/quizzes"] });
      queryClient.removeQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.removeQueries({ queryKey: ["/api/analytics"] });
      
      // Refetch imediato
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      
      // Refetch manual para garantir
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir",
        description: error.message || "Não foi possível excluir o quiz.",
        variant: "destructive",
      });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (quiz: any) => {
      const duplicatedQuiz = {
        title: `${quiz.title} - Cópia`,
        description: quiz.description,
        structure: quiz.structure,
        settings: quiz.settings,
        isPublished: false, // Sempre criar como rascunho
      };
      
      const response = await apiRequest("POST", "/api/quizzes", duplicatedQuiz);
      if (!response.ok) {
        throw new Error("Erro ao duplicar quiz");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Quiz duplicado",
        description: "O quiz foi duplicado com sucesso.",
      });
      // Atualizar cache
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao duplicar",
        description: error.message || "Não foi possível duplicar o quiz.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteQuiz = (quizId: string, quizTitle: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o quiz "${quizTitle}"? Esta ação não pode ser desfeita.`)) {
      deleteMutation.mutate(quizId);
    }
  };

  const handleDuplicateQuiz = (quiz: any) => {
    if (window.confirm(`Deseja duplicar o quiz "${quiz.title}"? Uma cópia será criada como rascunho.`)) {
      duplicateMutation.mutate(quiz);
    }
  };

  const quizzesList = Array.isArray(quizzes) ? quizzes : [];
  
  // Filtros e busca otimizados com useMemo
  const { filteredQuizzes, publishedCount, draftCount } = useMemo(() => {
    let filtered = quizzesList.filter((quiz: any) =>
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filtro por status
    if (activeTab === "published") {
      filtered = filtered.filter((quiz: any) => quiz.isPublished);
    } else if (activeTab === "draft") {
      filtered = filtered.filter((quiz: any) => !quiz.isPublished);
    }

    const published = quizzesList.filter((quiz: any) => quiz.isPublished).length;
    const draft = quizzesList.filter((quiz: any) => !quiz.isPublished).length;

    return {
      filteredQuizzes: filtered,
      publishedCount: published,
      draftCount: draft
    };
  }, [quizzesList, searchTerm, activeTab]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header moderno */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Meus Quizzes
            </h1>
            <p className="text-gray-600">Gerencie e monitore seus quizzes com performance em tempo real</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Botões de visualização */}
            <div className="flex items-center bg-white rounded-lg border p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="px-3"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="px-3"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            
            <Link href="/quizzes/new">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Criar Quiz
              </Button>
            </Link>
          </div>
        </div>

        {/* Barra de busca e filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Pesquisar por título ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-0 shadow-sm"
            />
          </div>
        </div>

        {/* Stats Cards modernos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total</p>
                  <p className="text-2xl font-bold">{quizzesList.length}</p>
                  <p className="text-blue-100 text-xs">quizzes criados</p>
                </div>
                <BarChart3 className="w-10 h-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Publicados</p>
                  <p className="text-2xl font-bold">{publishedCount}</p>
                  <p className="text-green-100 text-xs">ativos</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Rascunhos</p>
                  <p className="text-2xl font-bold">{draftCount}</p>
                  <p className="text-orange-100 text-xs">em edição</p>
                </div>
                <Clock className="w-10 h-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Conversão</p>
                  <p className="text-2xl font-bold">{avgConversionRate}%</p>
                  <p className="text-purple-100 text-xs">média geral</p>
                </div>
                <Zap className="w-10 h-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de filtro */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-white border shadow-sm">
            <TabsTrigger value="all" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              Todos ({quizzesList.length})
            </TabsTrigger>
            <TabsTrigger value="published" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
              Publicados ({publishedCount})
            </TabsTrigger>
            <TabsTrigger value="draft" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700">
              Rascunhos ({draftCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Lista de Quizzes */}
        {filteredQuizzes.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300 bg-white">
            <CardContent className="text-center py-16">
              {searchTerm ? (
                <>
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum quiz encontrado</h3>
                  <p className="text-gray-600 mb-4">Tente ajustar sua pesquisa ou filtros</p>
                  <Button variant="outline" onClick={() => setSearchTerm("")}>
                    Limpar busca
                  </Button>
                </>
              ) : (
                <>
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Comece criando seu primeiro quiz</h3>
                  <p className="text-gray-600 mb-6">Capture leads qualificados com quizzes interativos</p>
                  <Link href="/quizzes/new">
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Quiz
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === "grid" ? 
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : 
            "space-y-4"
          }>
            {filteredQuizzes.map((quiz: any) => 
              viewMode === "grid" ? (
                <Card key={quiz.id} className="bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge 
                        variant={quiz.isPublished ? "default" : "secondary"}
                        className={quiz.isPublished ? 
                          "bg-green-100 text-green-800 border-green-200" : 
                          "bg-orange-100 text-orange-800 border-orange-200"
                        }
                      >
                        {quiz.isPublished ? "Ativo" : "Rascunho"}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity px-2"
                        onClick={() => window.open(`/quiz/${quiz.id}`, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                    <CardTitle className="text-lg mb-2 leading-tight">{quiz.title}</CardTitle>
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{quiz.description}</p>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <Eye className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">{quiz.totalViews || 0}</span>
                          </div>
                          <p className="text-xs text-blue-700 mt-1">Visualizações</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <Users className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-900">{quiz.totalResponses || 0}</span>
                          </div>
                          <p className="text-xs text-green-700 mt-1">Respostas</p>
                        </div>
                      </div>

                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {format(new Date(quiz.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link href={`/quizzes/${quiz.id}/edit`} className="flex-1">
                          <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                            <Edit className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                        </Link>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="px-3"
                          onClick={() => {
                            const url = `${window.location.origin}/quiz/${quiz.id}`;
                            navigator.clipboard.writeText(url);
                            toast({
                              title: "Link copiado!",
                              description: "Link do quiz copiado com sucesso.",
                            });
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card key={quiz.id} className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                          {quiz.title.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{quiz.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{quiz.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {quiz.totalViews || 0} views
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {quiz.totalResponses || 0} respostas
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(quiz.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={quiz.isPublished ? "default" : "secondary"}
                          className={quiz.isPublished ? 
                            "bg-green-100 text-green-800" : 
                            "bg-orange-100 text-orange-800"
                          }
                        >
                          {quiz.isPublished ? "Ativo" : "Rascunho"}
                        </Badge>
                        
                        <Link href={`/quizzes/${quiz.id}/edit`}>
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                        </Link>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            const url = `${window.location.origin}/quiz/${quiz.id}`;
                            navigator.clipboard.writeText(url);
                            toast({
                              title: "Link copiado!",
                              description: "Link do quiz copiado com sucesso.",
                            });
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}