import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PageEditor } from "@/components/page-editor-simple";
import { QuizPreview } from "@/components/quiz-preview";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Save, 
  Play, 
  ArrowLeft, 
  Settings, 
  Eye,
  Share,
  Code,
  Globe
} from "lucide-react";
import { Link } from "wouter";

export default function QuizBuilder() {
  const [match, params] = useRoute("/quizzes/:id/edit");
  const isEditing = match && params?.id;
  const quizId = params?.id;
  
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    structure: {
      questions: [],
      settings: {
        theme: "default",
        showProgressBar: true,
        collectEmail: true,
        collectName: true,
        collectPhone: false,
      }
    },
    isPublished: false,
  });

  const [activeTab, setActiveTab] = useState<"editor" | "preview" | "settings">("editor");

  // Fetch quiz data if editing
  const { data: existingQuiz, isLoading: quizLoading } = useQuery({
    queryKey: [`/api/quizzes/${quizId}`],
    enabled: !!isEditing && !!quizId,
    retry: false,
  });

  // Save quiz mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = isEditing ? `/api/quizzes/${quizId}` : "/api/quizzes";
      const method = isEditing ? "PUT" : "POST";
      return await apiRequest(method, url, data);
    },
    onSuccess: () => {
      toast({
        title: "Quiz salvo com sucesso!",
        description: "Suas alterações foram salvas.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Acesso negado",
          description: "Você precisa estar logado para salvar o quiz.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erro ao salvar quiz",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });

  // Load existing quiz data
  useEffect(() => {
    if (existingQuiz) {
      console.log("Carregando quiz existente:", JSON.stringify(existingQuiz, null, 2));
      setQuizData({
        title: existingQuiz.title,
        description: existingQuiz.description || "",
        structure: existingQuiz.structure ? existingQuiz.structure : {
          pages: [{
            id: Date.now(),
            title: "Página 1",
            elements: []
          }],
          settings: {
            theme: "vendzz",
            showProgressBar: true,
            collectEmail: true,
            collectName: true,
            collectPhone: false,
            resultTitle: "",
            resultDescription: ""
          }
        },
        isPublished: existingQuiz.isPublished,
      });
      console.log("Dados carregados no estado:", {
        title: existingQuiz.title,
        structure: existingQuiz.structure
      });
    } else {
      // Initialize with default page structure for new quiz
      setQuizData(prev => ({
        ...prev,
        structure: {
          pages: [{
            id: Date.now(),
            title: "Página 1",
            elements: []
          }],
          settings: {
            theme: "vendzz",
            showProgressBar: true,
            collectEmail: true,
            collectName: true,
            collectPhone: false,
            resultTitle: "",
            resultDescription: ""
          }
        }
      }));
    }
  }, [existingQuiz]);

  // Auth check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar logado para acessar o editor.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const handleSave = () => {
    if (!quizData.title?.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, adicione um título ao seu quiz.",
        variant: "destructive",
      });
      return;
    }

    console.log("Salvando quiz com dados:", JSON.stringify(quizData, null, 2));
    saveMutation.mutate(quizData);
  };

  const handlePublish = () => {
    const updatedData = { ...quizData, isPublished: true };
    setQuizData(updatedData);
    saveMutation.mutate(updatedData);
  };

  const handlePageChange = (pages: any[]) => {
    setQuizData(prev => ({
      ...prev,
      structure: {
        ...prev.structure,
        pages
      }
    }));
  };

  const handleSettingsChange = (settings: any) => {
    setQuizData(prev => ({
      ...prev,
      structure: {
        ...prev.structure,
        settings
      }
    }));
  };

  // Função removida - agora gerenciada pelo PageEditor

  if (authLoading || (isEditing && quizLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {isEditing ? "Editar Quiz" : "Criar Novo Quiz"}
              </h1>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Status:</span>
                <Badge variant={quizData.isPublished ? "default" : "secondary"}>
                  {quizData.isPublished ? "Publicado" : "Rascunho"}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("preview")}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={saveMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={saveMutation.isPending || !quizData.title?.trim()}
            >
              <Globe className="w-4 h-4 mr-2" />
              Publicar
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-8">
          {[
            { id: "editor", label: "Editor", icon: <Settings className="w-4 h-4" /> },
            { id: "preview", label: "Preview", icon: <Play className="w-4 h-4" /> },
            { id: "settings", label: "Configurações", icon: <Settings className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "editor" && (
          <div className="h-full flex">
            {/* Quiz Title and Description */}
            <div className="w-80 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="title">Título do Quiz</Label>
                  <Input
                    id="title"
                    value={quizData.title || ""}
                    onChange={(e) => setQuizData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Digite o título do quiz"
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={quizData.description || ""}
                    onChange={(e) => setQuizData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o objetivo do quiz"
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Elementos</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="justify-start"
                      onClick={() => addQuestion("multiple_choice")}
                    >
                      <span className="mr-2">❓</span>
                      Pergunta
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="justify-start"
                      onClick={() => addQuestion("text")}
                    >
                      <span className="mr-2">📝</span>
                      Texto
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="justify-start"
                      onClick={() => addQuestion("email")}
                    >
                      <span className="mr-2">✉️</span>
                      Email
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="justify-start"
                      onClick={() => addQuestion("phone")}
                    >
                      <span className="mr-2">📞</span>
                      Telefone
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="justify-start"
                      onClick={() => addQuestion("textarea")}
                    >
                      <span className="mr-2">📄</span>
                      Texto Longo
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="justify-start"
                      onClick={() => addQuestion("number")}
                    >
                      <span className="mr-2">🔢</span>
                      Número
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="justify-start"
                      onClick={() => addQuestion("date")}
                    >
                      <span className="mr-2">📅</span>
                      Data
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="justify-start"
                      onClick={() => addQuestion("rating")}
                    >
                      <span className="mr-2">⭐</span>
                      Avaliação
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="justify-start col-span-2"
                      onClick={() => addQuestion("animated_transition")}
                    >
                      <span className="mr-2">✨</span>
                      Transição Animada
                    </Button>
                  </div>
                </div>

                {/* Results Configuration */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Resultado Personalizado</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="result-title">Título do Resultado</Label>
                      <Input
                        id="result-title"
                        placeholder="Parabéns {nome}! Seu resultado:"
                        value={quizData.structure.settings.resultTitle || ""}
                        onChange={(e) => handleSettingsChange({
                          ...quizData.structure.settings,
                          resultTitle: e.target.value
                        })}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="result-description">Descrição do Resultado</Label>
                      <Textarea
                        id="result-description"
                        placeholder="Com base nas suas respostas, sua empresa {empresa} pode crescer {percentual}% usando nossa solução..."
                        value={quizData.structure.settings.resultDescription || ""}
                        onChange={(e) => handleSettingsChange({
                          ...quizData.structure.settings,
                          resultDescription: e.target.value
                        })}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      <p>Use {"{campo_id}"} para inserir respostas automaticamente.</p>
                      <p>Exemplo: {"{nome}"}, {"{empresa}"}, {"{telefone}"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Page Editor */}
            <div className="flex-1 overflow-y-auto">
              <PageEditor
                pages={quizData.structure.pages || []}
                onPagesChange={handlePageChange}
              />
            </div>
          </div>
        )}

        {activeTab === "preview" && (
          <div className="h-full overflow-y-auto bg-gray-50">
            <QuizPreview quiz={quizData} />
          </div>
        )}

        {activeTab === "settings" && (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações do Quiz</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tema</Label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={quizData.structure.settings.theme}
                      onChange={(e) => handleSettingsChange({
                        ...quizData.structure.settings,
                        theme: e.target.value
                      })}
                    >
                      <option value="default">Padrão</option>
                      <option value="modern">Moderno</option>
                      <option value="minimal">Minimalista</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showProgressBar"
                      checked={quizData.structure.settings.showProgressBar}
                      onChange={(e) => handleSettingsChange({
                        ...quizData.structure.settings,
                        showProgressBar: e.target.checked
                      })}
                    />
                    <Label htmlFor="showProgressBar">Mostrar barra de progresso</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="collectEmail"
                      checked={quizData.structure.settings.collectEmail}
                      onChange={(e) => handleSettingsChange({
                        ...quizData.structure.settings,
                        collectEmail: e.target.checked
                      })}
                    />
                    <Label htmlFor="collectEmail">Coletar email</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="collectName"
                      checked={quizData.structure.settings.collectName}
                      onChange={(e) => handleSettingsChange({
                        ...quizData.structure.settings,
                        collectName: e.target.checked
                      })}
                    />
                    <Label htmlFor="collectName">Coletar nome</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="collectPhone"
                      checked={quizData.structure.settings.collectPhone}
                      onChange={(e) => handleSettingsChange({
                        ...quizData.structure.settings,
                        collectPhone: e.target.checked
                      })}
                    />
                    <Label htmlFor="collectPhone">Coletar telefone</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compartilhamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Link público</Label>
                    <div className="flex mt-2">
                      <Input
                        value={quizData.isPublished ? `${window.location.origin}/quiz/${quizId}` : "Quiz não publicado"}
                        readOnly
                        className="flex-1"
                      />
                      <Button variant="outline" size="sm" className="ml-2">
                        <Share className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Código de incorporação</Label>
                    <div className="flex mt-2">
                      <Textarea
                        value={quizData.isPublished ? `<iframe src="${window.location.origin}/quiz/${quizId}" width="100%" height="600"></iframe>` : "Quiz não publicado"}
                        readOnly
                        className="flex-1"
                        rows={3}
                      />
                      <Button variant="outline" size="sm" className="ml-2">
                        <Code className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
