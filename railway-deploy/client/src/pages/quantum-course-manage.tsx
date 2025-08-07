import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  ArrowLeft,
  Plus, 
  Book, 
  Users, 
  Settings, 
  Play,
  Edit,
  Trash2,
  Upload,
  Eye,
  Clock,
  Award,
  BarChart,
  MessageSquare,
  FileText,
  Video,
  Image
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  totalLessons: number;
  totalDuration: number;
  enrollmentCount: number;
  rating: number;
  isPublished: boolean;
  status: string;
  createdAt: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  duration: number;
  order: number;
  isFree: boolean;
  isPublished: boolean;
}

export default function QuantumCourseManage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    videoUrl: '',
    isFree: false
  });

  // Carregar dados do curso
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['/api/quantum/courses', courseId],
    retry: false,
  });

  // Carregar aulas do curso
  const { data: lessons, isLoading: lessonsLoading } = useQuery({
    queryKey: ['/api/quantum/courses', courseId, 'lessons'],
    retry: false,
  });

  // Carregar estudantes matriculados
  const { data: enrollments } = useQuery({
    queryKey: ['/api/quantum/courses', courseId, 'enrollments'],
    retry: false,
  });

  // Criar/Editar aula
  const saveLessonMutation = useMutation({
    mutationFn: async (lessonData: any) => {
      if (editingLesson) {
        return await apiRequest('PUT', `/api/quantum/courses/${courseId}/lessons/${editingLesson.id}`, lessonData);
      } else {
        return await apiRequest('POST', `/api/quantum/courses/${courseId}/lessons`, lessonData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quantum/courses', courseId, 'lessons'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quantum/courses', courseId] });
      setIsLessonDialogOpen(false);
      setEditingLesson(null);
      setNewLesson({ title: '', description: '', videoUrl: '', isFree: false });
      toast({
        title: editingLesson ? "Aula atualizada!" : "Aula criada!",
        description: "As informações da aula foram salvas com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar aula",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });

  // Deletar aula
  const deleteLessonMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      return await apiRequest('DELETE', `/api/quantum/courses/${courseId}/lessons/${lessonId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quantum/courses', courseId, 'lessons'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quantum/courses', courseId] });
      toast({
        title: "Aula excluída!",
        description: "A aula foi removida do curso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir aula",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });

  // Atualizar status de publicação do curso
  const updateCourseStatusMutation = useMutation({
    mutationFn: async (isPublished: boolean) => {
      return await apiRequest('PUT', `/api/quantum/courses/${courseId}`, { isPublished });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quantum/courses', courseId] });
      toast({
        title: "Status atualizado!",
        description: course?.isPublished ? "Curso despublicado" : "Curso publicado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });

  const handleSaveLesson = () => {
    const lessonData = editingLesson ? { ...newLesson } : { ...newLesson };
    
    if (!lessonData.title) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, insira um título para a aula.",
        variant: "destructive",
      });
      return;
    }
    
    saveLessonMutation.mutate(lessonData);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setNewLesson({
      title: lesson.title,
      description: lesson.description || '',
      videoUrl: lesson.videoUrl || '',
      isFree: lesson.isFree
    });
    setIsLessonDialogOpen(true);
  };

  if (courseLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="container mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-white">Carregando curso...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="container mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-white mb-4">Curso não encontrado</h1>
            <Button onClick={() => window.location.href = '/quantum-members'}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar à Área de Membros
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/quantum-members'}
                className="text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
                <div className="flex items-center gap-4">
                  <Badge variant={course.isPublished ? "default" : "secondary"}>
                    {course.isPublished ? 'Publicado' : 'Rascunho'}
                  </Badge>
                  <span className="text-slate-400">{course.enrollmentCount} alunos matriculados</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={course.isPublished}
                onCheckedChange={(checked) => updateCourseStatusMutation.mutate(checked)}
                className="data-[state=checked]:bg-green-600"
              />
              <span className="text-white">Publicado</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="lessons" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="lessons" className="data-[state=active]:bg-slate-700">
              <Book className="w-4 h-4 mr-2" />
              Aulas
            </TabsTrigger>
            <TabsTrigger value="students" className="data-[state=active]:bg-slate-700">
              <Users className="w-4 h-4 mr-2" />
              Estudantes
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-700">
              <BarChart className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-slate-700">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Aulas Tab */}
          <TabsContent value="lessons" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Aulas do Curso</h2>
              <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      setEditingLesson(null);
                      setNewLesson({ title: '', description: '', videoUrl: '', isFree: false });
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Aula
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      {editingLesson ? 'Editar Aula' : 'Nova Aula'}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                      Configure as informações da aula
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="lesson-title" className="text-white">Título da Aula</Label>
                      <Input
                        id="lesson-title"
                        value={newLesson.title}
                        onChange={(e) => setNewLesson(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Ex: Introdução ao Marketing Digital"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lesson-description" className="text-white">Descrição</Label>
                      <Textarea
                        id="lesson-description"
                        value={newLesson.description}
                        onChange={(e) => setNewLesson(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descreva o conteúdo da aula..."
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lesson-video" className="text-white">URL do Vídeo</Label>
                      <Input
                        id="lesson-video"
                        value={newLesson.videoUrl}
                        onChange={(e) => setNewLesson(prev => ({ ...prev, videoUrl: e.target.value }))}
                        placeholder="https://youtube.com/watch?v=... ou arquivo de upload"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="lesson-free"
                        checked={newLesson.isFree}
                        onCheckedChange={(checked) => setNewLesson(prev => ({ ...prev, isFree: checked }))}
                      />
                      <Label htmlFor="lesson-free" className="text-white">Aula gratuita (preview)</Label>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleSaveLesson}
                        disabled={saveLessonMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 flex-1"
                      >
                        {saveLessonMutation.isPending ? 'Salvando...' : (editingLesson ? 'Atualizar' : 'Criar Aula')}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsLessonDialogOpen(false);
                          setEditingLesson(null);
                        }}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Lista de Aulas */}
            <div className="space-y-4">
              {lessons?.map((lesson: Lesson, index: number) => (
                <Card key={lesson.id} className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-slate-400 font-mono text-sm">#{index + 1}</span>
                          <h3 className="text-lg font-semibold text-white">{lesson.title}</h3>
                          <div className="flex gap-1">
                            {lesson.isFree && (
                              <Badge variant="secondary" className="bg-green-600 text-white text-xs">
                                Gratuita
                              </Badge>
                            )}
                            <Badge variant={lesson.isPublished ? "default" : "secondary"} className="text-xs">
                              {lesson.isPublished ? 'Publicada' : 'Rascunho'}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-slate-400 mb-3">{lesson.description}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          {lesson.videoUrl && (
                            <div className="flex items-center">
                              <Video className="w-4 h-4 mr-1" />
                              Vídeo
                            </div>
                          )}
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {Math.round(lesson.duration / 60)} min
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditLesson(lesson)}
                          className="text-blue-400 hover:bg-blue-400/20"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteLessonMutation.mutate(lesson.id)}
                          className="text-red-400 hover:bg-red-400/20"
                          disabled={deleteLessonMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {(!lessons || lessons.length === 0) && (
                <Card className="bg-slate-800/50 border-slate-700 border-dashed">
                  <CardContent className="p-12 text-center">
                    <Video className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Nenhuma aula criada
                    </h3>
                    <p className="text-slate-400 mb-6">
                      Comece adicionando a primeira aula ao seu curso
                    </p>
                    <Button 
                      onClick={() => setIsLessonDialogOpen(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeira Aula
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Estudantes Tab */}
          <TabsContent value="students" className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Estudantes Matriculados</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrollments?.map((enrollment: any) => (
                <Card key={enrollment.id} className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-white">{enrollment.student?.name || 'Estudante'}</h3>
                      <Badge variant={enrollment.status === 'active' ? 'default' : 'secondary'}>
                        {enrollment.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Progresso:</span>
                        <span className="text-white">{Math.round(enrollment.progress)}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${enrollment.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Inscrito em: {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {(!enrollments || enrollments.length === 0) && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Nenhum estudante matriculado
                  </h3>
                  <p className="text-slate-400">
                    Publique o curso para que estudantes possam se inscrever
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Analytics do Curso</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total de Aulas</p>
                      <p className="text-2xl font-bold text-white">{course.totalLessons}</p>
                    </div>
                    <Book className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Duração Total</p>
                      <p className="text-2xl font-bold text-white">{Math.round(course.totalDuration / 60)}h</p>
                    </div>
                    <Clock className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Avaliação</p>
                      <p className="text-2xl font-bold text-white">{course.rating.toFixed(1)}</p>
                    </div>
                    <Award className="w-8 h-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Matrículas</p>
                      <p className="text-2xl font-bold text-white">{course.enrollmentCount}</p>
                    </div>
                    <Users className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Configurações Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Configurações do Curso</h2>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Informações Básicas</CardTitle>
                <CardDescription className="text-slate-400">
                  Configure os dados principais do curso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="course-title" className="text-white">Título do Curso</Label>
                  <Input
                    id="course-title"
                    defaultValue={course.title}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="course-description" className="text-white">Descrição</Label>
                  <Textarea
                    id="course-description"
                    defaultValue={course.description}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <Button className="bg-green-600 hover:bg-green-700">
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}