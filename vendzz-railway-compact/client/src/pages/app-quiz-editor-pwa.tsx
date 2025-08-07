import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  Save,
  Eye,
  Plus,
  Settings,
  Trash2,
  Move,
  Edit3,
  Smartphone,
  Monitor,
  Palette,
  Type,
  Image,
  MousePointer,
  CheckSquare,
  Star
} from 'lucide-react';
import { useLocation, useRoute } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface QuizElement {
  id: string;
  type: 'text' | 'multiple_choice' | 'email' | 'rating' | 'image_choice';
  question: string;
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

interface QuizPage {
  id: string;
  elements: QuizElement[];
  title: string;
}

interface Quiz {
  id: string;
  name: string;
  description: string;
  pages: QuizPage[];
  settings: {
    theme: string;
    primaryColor: string;
    showProgress: boolean;
  };
  isPublished: boolean;
}

export default function AppQuizEditorPWA() {
  const [, setLocation] = useLocation();
  const [match] = useRoute('/app/quiz-editor/:quizId');
  const quizId = match?.quizId;
  
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('editor');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar dados do quiz
  const { data: quiz, isLoading } = useQuery({
    queryKey: [`/api/quizzes/${quizId}`],
    enabled: !!quizId,
  });

  const [localQuiz, setLocalQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    if (quiz) {
      setLocalQuiz(quiz);
    }
  }, [quiz]);

  // Mutation para salvar quiz
  const saveQuizMutation = useMutation({
    mutationFn: async (quizData: Partial<Quiz>) => {
      return apiRequest('PATCH', `/api/quizzes/${quizId}`, quizData);
    },
    onSuccess: () => {
      toast({
        title: "Quiz salvo!",
        description: "Alterações salvas com sucesso",
      });
      queryClient.invalidateQueries([`/api/quizzes/${quizId}`]);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    if (localQuiz) {
      saveQuizMutation.mutate(localQuiz);
    }
  };

  const addElement = (type: QuizElement['type']) => {
    if (!localQuiz) return;

    const newElement: QuizElement = {
      id: `element_${Date.now()}`,
      type,
      question: `Nova pergunta ${type}`,
      options: type === 'multiple_choice' || type === 'image_choice' ? ['Opção 1', 'Opção 2'] : undefined,
      required: true,
      placeholder: type === 'text' || type === 'email' ? 'Digite aqui...' : undefined,
    };

    const updatedPages = [...localQuiz.pages];
    updatedPages[currentPageIndex].elements.push(newElement);

    setLocalQuiz({
      ...localQuiz,
      pages: updatedPages
    });
  };

  const updateElement = (elementId: string, updates: Partial<QuizElement>) => {
    if (!localQuiz) return;

    const updatedPages = [...localQuiz.pages];
    const currentPage = updatedPages[currentPageIndex];
    const elementIndex = currentPage.elements.findIndex(el => el.id === elementId);
    
    if (elementIndex >= 0) {
      currentPage.elements[elementIndex] = {
        ...currentPage.elements[elementIndex],
        ...updates
      };

      setLocalQuiz({
        ...localQuiz,
        pages: updatedPages
      });
    }
  };

  const removeElement = (elementId: string) => {
    if (!localQuiz) return;

    const updatedPages = [...localQuiz.pages];
    updatedPages[currentPageIndex].elements = updatedPages[currentPageIndex].elements.filter(el => el.id !== elementId);

    setLocalQuiz({
      ...localQuiz,
      pages: updatedPages
    });
  };

  const addPage = () => {
    if (!localQuiz) return;

    const newPage: QuizPage = {
      id: `page_${Date.now()}`,
      title: `Página ${localQuiz.pages.length + 1}`,
      elements: []
    };

    setLocalQuiz({
      ...localQuiz,
      pages: [...localQuiz.pages, newPage]
    });
  };

  if (isLoading || !localQuiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const currentPage = localQuiz.pages[currentPageIndex] || localQuiz.pages[0];
  const selectedElement = selectedElementId ? 
    currentPage.elements.find(el => el.id === selectedElementId) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header PWA Otimizado */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setLocation('/app')}
                variant="ghost"
                size="sm"
                className="p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-green-600" />
                <h1 className="text-lg font-bold text-gray-800 truncate">
                  {localQuiz.name}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={handleSave}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                disabled={saveQuizMutation.isPending}
              >
                <Save className="w-4 h-4 mr-1" />
                Salvar
              </Button>
              
              <Button
                onClick={() => setLocation(`/quiz/${quizId}`)}
                size="sm"
                variant="outline"
              >
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="editor" className="flex items-center space-x-1">
              <Edit3 className="w-4 h-4" />
              <span>Editor</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-1">
              <Settings className="w-4 h-4" />
              <span>Config</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Editor */}
          <TabsContent value="editor" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Sidebar de Elementos */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Adicionar Elemento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    onClick={() => addElement('text')}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Type className="w-4 h-4 mr-2" />
                    Texto
                  </Button>
                  
                  <Button
                    onClick={() => addElement('multiple_choice')}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Múltipla Escolha
                  </Button>
                  
                  <Button
                    onClick={() => addElement('email')}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <MousePointer className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                  
                  <Button
                    onClick={() => addElement('rating')}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Avaliação
                  </Button>
                  
                  <Button
                    onClick={() => addElement('image_choice')}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Imagem
                  </Button>
                </CardContent>
              </Card>

              {/* Editor Principal */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">
                      {currentPage.title}
                    </CardTitle>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        Página {currentPageIndex + 1} de {localQuiz.pages.length}
                      </Badge>
                      
                      <Button
                        onClick={addPage}
                        size="sm"
                        variant="outline"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {currentPage.elements.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Edit3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Adicione elementos à sua página</p>
                    </div>
                  ) : (
                    currentPage.elements.map((element, index) => (
                      <Card
                        key={element.id}
                        className={`cursor-pointer border-2 transition-colors ${
                          selectedElementId === element.id 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedElementId(element.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="secondary">
                              {element.type.replace('_', ' ')}
                            </Badge>
                            
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeElement(element.id);
                              }}
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <h4 className="font-medium text-gray-800 mb-2">
                            {element.question}
                          </h4>
                          
                          {element.options && (
                            <div className="space-y-1">
                              {element.options.map((option, optIndex) => (
                                <div key={optIndex} className="text-sm text-gray-600">
                                  • {option}
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Painel de Propriedades */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    {selectedElement ? 'Propriedades' : 'Páginas'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedElement ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="question">Pergunta</Label>
                        <Textarea
                          id="question"
                          value={selectedElement.question}
                          onChange={(e) => updateElement(selectedElement.id, { question: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      
                      {(selectedElement.type === 'multiple_choice' || selectedElement.type === 'image_choice') && (
                        <div>
                          <Label>Opções</Label>
                          <div className="space-y-2 mt-1">
                            {selectedElement.options?.map((option, index) => (
                              <Input
                                key={index}
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(selectedElement.options || [])];
                                  newOptions[index] = e.target.value;
                                  updateElement(selectedElement.id, { options: newOptions });
                                }}
                                placeholder={`Opção ${index + 1}`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="required"
                          checked={selectedElement.required}
                          onCheckedChange={(checked) => 
                            updateElement(selectedElement.id, { required: checked })
                          }
                        />
                        <Label htmlFor="required">Obrigatório</Label>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {localQuiz.pages.map((page, index) => (
                        <Button
                          key={page.id}
                          onClick={() => setCurrentPageIndex(index)}
                          variant={index === currentPageIndex ? "default" : "outline"}
                          size="sm"
                          className="w-full justify-start"
                        >
                          {page.title}
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab Preview */}
          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Preview do Quiz</CardTitle>
                <CardDescription>
                  Visualize como seu quiz aparecerá para os usuários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-w-md mx-auto bg-white border rounded-lg p-6 shadow-lg">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                      {localQuiz.name}
                    </h2>
                    <p className="text-gray-600">{localQuiz.description}</p>
                  </div>
                  
                  <div className="space-y-4">
                    {currentPage.elements.map((element) => (
                      <div key={element.id} className="space-y-2">
                        <Label className="text-sm font-medium">
                          {element.question}
                          {element.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        
                        {element.type === 'text' && (
                          <Input placeholder={element.placeholder} />
                        )}
                        
                        {element.type === 'email' && (
                          <Input type="email" placeholder={element.placeholder} />
                        )}
                        
                        {element.type === 'multiple_choice' && (
                          <div className="space-y-2">
                            {element.options?.map((option, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <input type="radio" name={element.id} className="w-4 h-4" />
                                <span className="text-sm">{option}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {element.type === 'rating' && (
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className="w-6 h-6 text-gray-300" />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Configurações */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Quiz</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="quiz-name">Nome do Quiz</Label>
                    <Input
                      id="quiz-name"
                      value={localQuiz.name}
                      onChange={(e) => setLocalQuiz({ ...localQuiz, name: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="theme">Tema</Label>
                    <Select
                      value={localQuiz.settings.theme}
                      onValueChange={(value) => 
                        setLocalQuiz({
                          ...localQuiz,
                          settings: { ...localQuiz.settings, theme: value }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Moderno</SelectItem>
                        <SelectItem value="classic">Clássico</SelectItem>
                        <SelectItem value="minimal">Minimalista</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={localQuiz.description}
                    onChange={(e) => setLocalQuiz({ ...localQuiz, description: e.target.value })}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-progress"
                    checked={localQuiz.settings.showProgress}
                    onCheckedChange={(checked) => 
                      setLocalQuiz({
                        ...localQuiz,
                        settings: { ...localQuiz.settings, showProgress: checked }
                      })
                    }
                  />
                  <Label htmlFor="show-progress">Mostrar barra de progresso</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}