import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { 
  Save, 
  Eye, 
  Settings, 
  Plus,
  Trash2,
  ArrowLeft,
  Play,
  Palette,
  Zap,
  Bot,
  Target
} from "lucide-react";

interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'text' | 'email' | 'rating';
  question: string;
  options?: string[];
  required: boolean;
}

interface Quiz {
  id?: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  settings: {
    theme: string;
    showProgress: boolean;
    collectEmail: boolean;
    resultTitle: string;
    resultDescription: string;
  };
  status: 'draft' | 'published';
}

export default function QuizBuilder() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados do quiz
  const [quiz, setQuiz] = useState<Quiz>({
    title: "Novo Quiz",
    description: "Descrição do quiz",
    questions: [],
    settings: {
      theme: "default",
      showProgress: true,
      collectEmail: true,
      resultTitle: "Obrigado!",
      resultDescription: "Suas respostas foram registradas."
    },
    status: "draft"
  });

  const [activeTab, setActiveTab] = useState("editor");
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);

  // Buscar quiz se estiver editando
  const urlParams = new URLSearchParams(window.location.search);
  const quizId = urlParams.get('id');

  const { data: existingQuiz, isLoading } = useQuery({
    queryKey: ["/api/quizzes", quizId],
    enabled: !!quizId,
  });

  useEffect(() => {
    if (existingQuiz && typeof existingQuiz === 'object') {
      setQuiz(existingQuiz as Quiz);
    }
  }, [existingQuiz]);

  // Mutação para salvar quiz
  const saveQuizMutation = useMutation({
    mutationFn: async (quizData: Quiz) => {
      const endpoint = quizId ? `/api/quizzes/${quizId}` : "/api/quizzes";
      const method = quizId ? "PUT" : "POST";
      
      return await apiRequest(endpoint, {
        method,
        body: JSON.stringify(quizData),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Quiz salvo!",
        description: "Suas alterações foram salvas com sucesso."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      if (!quizId && data?.id) {
        setLocation(`/quiz-builder?id=${data.id}`);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Erro ao salvar o quiz.",
        variant: "destructive"
      });
    }
  });

  // Funções de manipulação de perguntas
  const addQuestion = (type: QuizQuestion['type']) => {
    const newQuestion: QuizQuestion = {
      id: `q_${Date.now()}`,
      type,
      question: "Nova pergunta",
      options: type === 'multiple_choice' ? ["Opção 1", "Opção 2"] : undefined,
      required: true
    };
    
    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
    setSelectedQuestion(quiz.questions.length);
  };

  const updateQuestion = (index: number, updates: Partial<QuizQuestion>) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, ...updates } : q
      )
    }));
  };

  const removeQuestion = (index: number) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
    setSelectedQuestion(null);
  };

  const addOption = (questionIndex: number) => {
    const question = quiz.questions[questionIndex];
    if (question.type === 'multiple_choice' && question.options) {
      updateQuestion(questionIndex, {
        options: [...question.options, `Opção ${question.options.length + 1}`]
      });
    }
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const question = quiz.questions[questionIndex];
    if (question.options) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      updateQuestion(questionIndex, { options: newOptions });
    }
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const question = quiz.questions[questionIndex];
    if (question.options && question.options.length > 2) {
      updateQuestion(questionIndex, {
        options: question.options.filter((_, i) => i !== optionIndex)
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <p className="text-muted-foreground">
              {quizId ? 'Editando quiz' : 'Criando novo quiz'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={quiz.status === 'published' ? 'default' : 'secondary'}>
            {quiz.status === 'published' ? 'Publicado' : 'Rascunho'}
          </Badge>
          <Button
            onClick={() => saveQuizMutation.mutate(quiz)}
            disabled={saveQuizMutation.isPending}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveQuizMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editor" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Perguntas */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Perguntas</CardTitle>
                  <CardDescription>
                    Adicione e organize suas perguntas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Button
                      onClick={() => addQuestion('multiple_choice')}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Múltipla Escolha
                    </Button>
                    <Button
                      onClick={() => addQuestion('text')}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Texto
                    </Button>
                    <Button
                      onClick={() => addQuestion('email')}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                    <Button
                      onClick={() => addQuestion('rating')}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Avaliação
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {quiz.questions.map((question, index) => (
                      <div
                        key={question.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedQuestion === index
                            ? 'border-blue-500 bg-blue-50'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedQuestion(index)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm truncate">
                              {question.question}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {question.type}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeQuestion(index);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Editor de Pergunta */}
            <div className="lg:col-span-2">
              {selectedQuestion !== null && quiz.questions[selectedQuestion] ? (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Editando Pergunta {selectedQuestion + 1}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="question">Pergunta</Label>
                      <Textarea
                        id="question"
                        value={quiz.questions[selectedQuestion].question}
                        onChange={(e) => updateQuestion(selectedQuestion, {
                          question: e.target.value
                        })}
                        placeholder="Digite sua pergunta..."
                      />
                    </div>

                    {quiz.questions[selectedQuestion].type === 'multiple_choice' && (
                      <div>
                        <Label>Opções</Label>
                        <div className="space-y-2">
                          {quiz.questions[selectedQuestion].options?.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-2">
                              <Input
                                value={option}
                                onChange={(e) => updateOption(selectedQuestion, optionIndex, e.target.value)}
                                placeholder={`Opção ${optionIndex + 1}`}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeOption(selectedQuestion, optionIndex)}
                                disabled={quiz.questions[selectedQuestion].options!.length <= 2}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addOption(selectedQuestion)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Opção
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Selecione uma pergunta para editar ou adicione uma nova
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview do Quiz</CardTitle>
              <CardDescription>
                Veja como seu quiz aparecerá para os usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-2xl mx-auto space-y-6 p-6 border rounded-lg">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">{quiz.title}</h2>
                  <p className="text-muted-foreground">{quiz.description}</p>
                </div>

                {quiz.questions.map((question, index) => (
                  <div key={question.id} className="space-y-3">
                    <Label className="text-base font-medium">
                      {index + 1}. {question.question}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>

                    {question.type === 'multiple_choice' && question.options && (
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <input type="radio" name={`q_${index}`} disabled />
                            <Label>{option}</Label>
                          </div>
                        ))}
                      </div>
                    )}

                    {question.type === 'text' && (
                      <Textarea placeholder="Sua resposta..." disabled />
                    )}

                    {question.type === 'email' && (
                      <Input type="email" placeholder="seu@email.com" disabled />
                    )}

                    {question.type === 'rating' && (
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} className="text-yellow-400 text-xl" disabled>
                            ⭐
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <Button className="w-full" disabled>
                  <Play className="w-4 h-4 mr-2" />
                  Enviar Respostas
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Título do Quiz</Label>
                  <Input
                    id="title"
                    value={quiz.title}
                    onChange={(e) => setQuiz(prev => ({
                      ...prev,
                      title: e.target.value
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={quiz.description}
                    onChange={(e) => setQuiz(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configurações de Resultado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="resultTitle">Título do Resultado</Label>
                  <Input
                    id="resultTitle"
                    value={quiz.settings.resultTitle}
                    onChange={(e) => setQuiz(prev => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        resultTitle: e.target.value
                      }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="resultDescription">Descrição do Resultado</Label>
                  <Textarea
                    id="resultDescription"
                    value={quiz.settings.resultDescription}
                    onChange={(e) => setQuiz(prev => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        resultDescription: e.target.value
                      }
                    }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}