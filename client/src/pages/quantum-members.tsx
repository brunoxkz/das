import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Plus, 
  Book, 
  Users, 
  Smartphone, 
  Bell, 
  Settings, 
  Play, 
  Star,
  Calendar,
  TrendingUp,
  Download,
  Share,
  Globe
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
  isPWA: boolean;
  domain?: string;
  createdAt: string;
}

interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  progress: number;
  status: string;
  enrolledAt: string;
  course: Course;
}

export default function QuantumMembers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    category: ''
  });

  // Carregar cursos do usuário
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['/api/quantum/courses'],
    retry: false,
  });

  // Garantir que courses sempre seja um array
  const coursesData = Array.isArray(courses) ? courses : [];

  // Criar novo curso
  const createCourseMutation = useMutation({
    mutationFn: async (courseData: { title: string; description: string; category: string }) => {
      return await apiRequest('POST', '/api/quantum/courses', courseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quantum/courses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quantum/stats'] });
      setIsCreateDialogOpen(false);
      setNewCourse({ title: '', description: '', category: '' });
      toast({
        title: "Sucesso!",
        description: "Curso criado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: "Erro ao criar curso: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Transformar curso em PWA
  const transformToPWAMutation = useMutation({
    mutationFn: async (courseId: string) => {
      return await apiRequest('POST', `/api/quantum/courses/${courseId}/transform-to-pwa`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quantum/courses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quantum/stats'] });
      toast({
        title: "Sucesso!",
        description: "Curso transformado em PWA com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: "Erro ao transformar em PWA: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateCourse = () => {
    if (!newCourse.title.trim()) {
      toast({
        title: "Erro",
        description: "Título do curso é obrigatório",
        variant: "destructive",
      });
      return;
    }
    createCourseMutation.mutate(newCourse);
  };

  // Carregar estatísticas gerais
  const { data: stats } = useQuery({
    queryKey: ['/api/quantum/stats'],
    retry: false,
  });

  // Garantir que stats sempre seja um objeto válido
  const statsData = stats || {
    totalCourses: 0,
    totalStudents: 0,
    totalPWAs: 0,
    totalPushSent: 0
  };

  if (coursesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="container mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-white">Carregando Área de Membros Quantum...</p>
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
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  Quantum
                </span>{' '}
                Área de Membros
              </h1>
              <p className="text-slate-300">
                Crie cursos, transforme em Apps PWA e gerencie notificações push
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Curso
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Criar Novo Curso</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Configure as informações básicas do seu curso Quantum
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-white">Título do Curso</Label>
                    <Input
                      id="title"
                      value={newCourse.title}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Curso Avançado de Marketing Digital"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-white">Descrição</Label>
                    <Textarea
                      id="description"
                      value={newCourse.description}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva o conteúdo e objetivos do curso..."
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category" className="text-white">Categoria</Label>
                    <Input
                      id="category"
                      value={newCourse.category}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="Ex: Marketing, Desenvolvimento, Design"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleCreateCourse}
                      disabled={createCourseMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 flex-1"
                    >
                      {createCourseMutation.isPending ? 'Criando...' : 'Criar Curso'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total de Cursos</p>
                  <p className="text-2xl font-bold text-white">{statsData.totalCourses}</p>
                </div>
                <Book className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total de Alunos</p>
                  <p className="text-2xl font-bold text-white">{statsData.totalStudents}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Apps PWA</p>
                  <p className="text-2xl font-bold text-white">{statsData.totalPWAs}</p>
                </div>
                <Smartphone className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Push Enviadas</p>
                  <p className="text-2xl font-bold text-white">{statsData.totalPushSent}</p>
                </div>
                <Bell className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coursesData.map((course: Course) => (
            <Card key={course.id} className="bg-slate-800/50 border-slate-700 hover:border-green-500 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg">{course.title}</CardTitle>
                    <CardDescription className="text-slate-400 mt-1">
                      {course.description?.substring(0, 100)}...
                    </CardDescription>
                  </div>
                  <div className="flex gap-1 ml-2">
                    {course.isPublished && (
                      <Badge variant="secondary" className="bg-green-600 text-white">
                        Publicado
                      </Badge>
                    )}
                    {course.isPWA && (
                      <Badge variant="secondary" className="bg-purple-600 text-white">
                        PWA
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Course Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-slate-400">
                      <Play className="w-4 h-4 mr-1" />
                      {course.totalLessons} aulas
                    </div>
                    <div className="flex items-center text-slate-400">
                      <Users className="w-4 h-4 mr-1" />
                      {course.enrollmentCount} alunos
                    </div>
                    <div className="flex items-center text-slate-400">
                      <Calendar className="w-4 h-4 mr-1" />
                      {Math.round(course.totalDuration / 60)}h
                    </div>
                    <div className="flex items-center text-slate-400">
                      <Star className="w-4 h-4 mr-1" />
                      {course.rating.toFixed(1)}
                    </div>
                  </div>

                  {/* PWA Domain */}
                  {course.isPWA && course.domain && (
                    <div className="p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-purple-400">
                          <Globe className="w-4 h-4 mr-2" />
                          <span className="text-sm font-mono">{course.domain}</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-purple-400 hover:bg-purple-400/20"
                          onClick={() => window.open(`https://${course.domain}`, '_blank')}
                        >
                          <Share className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700 flex-1"
                      onClick={() => window.location.href = `/quantum/courses/${course.id}/manage`}
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Gerenciar
                    </Button>
                    {!course.isPWA && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-purple-600 text-purple-400 hover:bg-purple-600/20"
                        onClick={() => transformToPWAMutation.mutate(course.id)}
                        disabled={transformToPWAMutation.isPending}
                      >
                        <Smartphone className="w-4 h-4 mr-1" />
                        {transformToPWAMutation.isPending ? 'Gerando...' : 'Virar App'}
                      </Button>
                    )}
                    {course.isPWA && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/20"
                        onClick={() => window.location.href = `/quantum/courses/${course.id}/push`}
                      >
                        <Bell className="w-4 h-4 mr-1" />
                        Push
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Empty State */}
          {coursesData.length === 0 && (
            <div className="col-span-full">
              <Card className="bg-slate-800/50 border-slate-700 border-dashed">
                <CardContent className="p-12 text-center">
                  <Book className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Nenhum curso criado ainda
                  </h3>
                  <p className="text-slate-400 mb-6">
                    Comece criando seu primeiro curso na área de membros Quantum
                  </p>
                  <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Curso
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}