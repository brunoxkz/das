import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth-jwt";
import { queryClient } from "@/lib/queryClient";
import { 
  FlaskConical, 
  Plus, 
  Play, 
  Pause, 
  TrendingUp, 
  BarChart3,
  Eye,
  CheckCircle,
  Clock,
  ExternalLink,
  Copy
} from "lucide-react";

interface AbTest {
  id: string;
  name: string;
  description: string;
  quizIds: string[];
  isActive: boolean;
  totalViews: number;
  createdAt: number;
  updatedAt: number;
}

interface Quiz {
  id: string;
  title: string;
  isPublished: boolean;
}

export default function TesteAbPage() {
  const { user } = useAuth();
  const [selectedQuizzes, setSelectedQuizzes] = useState<string[]>([]);
  const [newTestName, setNewTestName] = useState("");
  const [newTestDescription, setNewTestDescription] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Buscar testes A/B do usuário
  const { data: abTests, isLoading: isLoadingTests } = useQuery({
    queryKey: ["/api/ab-tests"],
  });

  // Buscar quizzes para seleção
  const { data: quizzes, isLoading: isLoadingQuizzes } = useQuery<Quiz[]>({
    queryKey: ["/api/quizzes"],
    enabled: !!user,
  });

  // Mutação para criar teste A/B
  const createTestMutation = useMutation({
    mutationFn: async (testData: { name: string; description: string; quizIds: string[] }) => {
      const response = await fetch("/api/ab-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });
      if (!response.ok) throw new Error("Erro ao criar teste A/B");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ab-tests"] });
      setIsCreateDialogOpen(false);
      setNewTestName("");
      setNewTestDescription("");
      setSelectedQuizzes([]);
    },
  });

  // Mutação para ativar/desativar teste A/B
  const toggleTestMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await fetch(`/api/ab-tests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) throw new Error("Erro ao atualizar teste A/B");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ab-tests"] });
    },
  });

  const handleQuizSelection = (quizId: string) => {
    setSelectedQuizzes(prev => {
      if (prev.includes(quizId)) {
        return prev.filter(id => id !== quizId);
      } else if (prev.length < 3) {
        return [...prev, quizId];
      }
      return prev;
    });
  };

  const handleCreateTest = () => {
    if (newTestName && selectedQuizzes.length >= 2) {
      createTestMutation.mutate({
        name: newTestName,
        description: newTestDescription,
        quizIds: selectedQuizzes
      });
    }
  };

  const copyTestUrl = (testId: string) => {
    const url = `${window.location.origin}/ab-test/${testId}`;
    navigator.clipboard.writeText(url);
  };

  const publishedQuizzes = quizzes?.filter(q => q.isPublished) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
              <FlaskConical className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Teste A/B
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Compare até 3 funis diferentes e descubra qual gera mais conversões
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <FlaskConical className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Testes Ativos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {abTests?.filter((t: AbTest) => t.isActive).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total de Visualizações</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {abTests?.reduce((sum: number, t: AbTest) => sum + t.totalViews, 0) || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total de Testes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {abTests?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Test Button */}
        <div className="flex justify-end">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Teste A/B
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Teste A/B</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="testName">Nome do Teste</Label>
                  <Input
                    id="testName"
                    placeholder="Ex: Teste Headline vs CTA"
                    value={newTestName}
                    onChange={(e) => setNewTestName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testDescription">Descrição (opcional)</Label>
                  <Textarea
                    id="testDescription"
                    placeholder="Descreva o objetivo deste teste..."
                    value={newTestDescription}
                    onChange={(e) => setNewTestDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Selecione 2-3 Funis para Comparar</Label>
                  <p className="text-sm text-gray-600">
                    Selecionados: {selectedQuizzes.length}/3
                  </p>
                  {isLoadingQuizzes ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Carregando funis...</p>
                    </div>
                  ) : publishedQuizzes.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">Nenhum funil publicado encontrado</p>
                      <p className="text-sm text-gray-500 mt-1">Publique pelo menos 2 quizzes para criar um teste A/B</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                      {publishedQuizzes.map((quiz) => (
                        <div
                          key={quiz.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            selectedQuizzes.includes(quiz.id)
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                          onClick={() => handleQuizSelection(quiz.id)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{quiz.title}</span>
                            {selectedQuizzes.includes(quiz.id) && (
                              <CheckCircle className="w-5 h-5 text-purple-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleCreateTest}
                    disabled={!newTestName || selectedQuizzes.length < 2 || createTestMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    {createTestMutation.isPending ? "Criando..." : "Criar Teste"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tests List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Seus Testes A/B</h2>
          
          {isLoadingTests ? (
            <div className="grid grid-cols-1 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : abTests && abTests.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {abTests.map((test: AbTest) => (
                <Card key={test.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <FlaskConical className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{test.name}</CardTitle>
                          {test.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {test.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={test.isActive ? "default" : "secondary"}>
                          {test.isActive ? (
                            <><Play className="w-3 h-3 mr-1" /> Ativo</>
                          ) : (
                            <><Pause className="w-3 h-3 mr-1" /> Pausado</>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {test.totalViews} visualizações
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {test.quizIds.length} funis
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(test.createdAt * 1000).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyTestUrl(test.id)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar URL
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/ab-test/${test.id}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Abrir Teste
                      </Button>
                      <Button
                        size="sm"
                        variant={test.isActive ? "destructive" : "default"}
                        onClick={() => toggleTestMutation.mutate({ 
                          id: test.id, 
                          isActive: !test.isActive 
                        })}
                        disabled={toggleTestMutation.isPending}
                      >
                        {test.isActive ? (
                          <><Pause className="w-4 h-4 mr-2" /> Pausar</>
                        ) : (
                          <><Play className="w-4 h-4 mr-2" /> Ativar</>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-12 text-center">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4">
                  <FlaskConical className="w-8 h-8 text-gray-400 mx-auto mt-2" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Nenhum teste A/B criado
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Crie seu primeiro teste para comparar diferentes funis e otimizar suas conversões.
                </p>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Teste
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}