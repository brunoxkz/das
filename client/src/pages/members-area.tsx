import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth-sqlite";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  GraduationCap, 
  Plus, 
  Book, 
  Video, 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  Edit, 
  Trash2, 
  Play, 
  Upload,
  Clock,
  Star,
  Award,
  BookOpen,
  User,
  Calendar,
  Eye,
  EyeOff
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  price: number;
  imageUrl?: string;
  isPublished: boolean;
  instructorId: string;
  createdAt: string;
  updatedAt: string;
}

interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description: string;
  orderIndex: number;
  createdAt: string;
}

interface CourseLesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  content: string;
  lessonType: 'text' | 'video' | 'pdf';
  videoUrl?: string;
  duration: number;
  orderIndex: number;
  attachments?: string;
  createdAt: string;
}

interface CourseCategory {
  id: string;
  name: string;
  description: string;
  color: string;
}

export default function MembersArea() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);

  // Verificar se é admin - aceitar role admin ou email específico
  const isAdmin = user?.role === 'admin' || user?.email === 'admin@admin.com' || user?.id === 'admin-user-id';
  
  // Debug do usuário atual
  console.log('User data:', user);
  console.log('Is admin:', isAdmin);

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Acesso Negado</CardTitle>
            <CardDescription>
              Apenas administradores podem acessar a Área de Membros.
              <br />
              <small className="text-gray-500 mt-2 block">
                Usuário: {user?.email || 'N/A'} | Role: {user?.role || 'N/A'} | ID: {user?.id || 'N/A'}
              </small>
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Queries para dados
  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ["/api/courses"],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/course-categories"],
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/members-area/dashboard"],
  });

  // Mutations
  const createCourseMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/courses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setShowCourseModal(false);
      toast({
        title: "Sucesso",
        description: "Curso criado com sucesso!",
      });
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest("PUT", `/api/courses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setShowCourseModal(false);
      setSelectedCourse(null);
      toast({
        title: "Sucesso",
        description: "Curso atualizado com sucesso!",
      });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/courses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Sucesso",
        description: "Curso deletado com sucesso!",
      });
    },
  });

  const publishCourseMutation = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) => 
      apiRequest("PATCH", `/api/courses/${id}/publish`, { isPublished }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Sucesso",
        description: "Status de publicação atualizado!",
      });
    },
  });

  const CourseForm = () => {
    const [formData, setFormData] = useState({
      title: selectedCourse?.title || "",
      description: selectedCourse?.description || "",
      categoryId: selectedCourse?.categoryId || "",
      difficulty: selectedCourse?.difficulty || "beginner",
      duration: selectedCourse?.duration || 0,
      price: selectedCourse?.price || 0,
      imageUrl: selectedCourse?.imageUrl || "",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedCourse) {
        updateCourseMutation.mutate({
          id: selectedCourse.id,
          data: formData
        });
      } else {
        createCourseMutation.mutate(formData);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Título do Curso</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Ex: Curso Completo de Marketing Digital"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descrição detalhada do curso..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="difficulty">Dificuldade</Label>
            <Select 
              value={formData.difficulty} 
              onValueChange={(value) => setFormData({ ...formData, difficulty: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Iniciante</SelectItem>
                <SelectItem value="intermediate">Intermediário</SelectItem>
                <SelectItem value="advanced">Avançado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="duration">Duração (horas)</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              placeholder="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Preço (R$)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="imageUrl">URL da Imagem</Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              setShowCourseModal(false);
              setSelectedCourse(null);
            }}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={createCourseMutation.isPending || updateCourseMutation.isPending}
          >
            {selectedCourse ? "Atualizar" : "Criar"} Curso
          </Button>
        </div>
      </form>
    );
  };

  const CourseCard = ({ course }: { course: Course }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">{course.title}</CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {course.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <Badge variant={course.isPublished ? "default" : "secondary"}>
              {course.isPublished ? (
                <><Eye className="w-3 h-3 mr-1" /> Publicado</>
              ) : (
                <><EyeOff className="w-3 h-3 mr-1" /> Rascunho</>
              )}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {course.duration}h
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              {course.difficulty === 'beginner' ? 'Iniciante' : 
               course.difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
            </div>
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4" />
              R$ {course.price.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedCourse(course);
              setShowCourseModal(true);
            }}
          >
            <Edit className="w-4 h-4 mr-1" />
            Editar
          </Button>
          
          <Button
            size="sm"
            variant={course.isPublished ? "secondary" : "default"}
            onClick={() => publishCourseMutation.mutate({
              id: course.id,
              isPublished: !course.isPublished
            })}
          >
            {course.isPublished ? (
              <><EyeOff className="w-4 h-4 mr-1" /> Despublicar</>
            ) : (
              <><Eye className="w-4 h-4 mr-1" /> Publicar</>
            )}
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              if (confirm("Tem certeza que deseja deletar este curso?")) {
                deleteCourseMutation.mutate(course.id);
              }
            }}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Deletar
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const Dashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cursos</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">
              {courses.filter((c: Course) => c.isPublished).length} publicados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Módulos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totalModules || 0}</div>
            <p className="text-xs text-muted-foreground">
              Em todos os cursos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aulas</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totalLessons || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total de conteúdo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totalStudents || 0}</div>
            <p className="text-xs text-muted-foreground">
              Matriculados
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cursos Recentes</CardTitle>
          <CardDescription>
            Seus últimos cursos criados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingCourses ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-muted-foreground mt-2">Carregando cursos...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum curso criado ainda</p>
              <Button 
                className="mt-4"
                onClick={() => setShowCourseModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Curso
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.slice(0, 6).map((course: Course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const CoursesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Cursos</h2>
          <p className="text-muted-foreground">
            Crie e gerencie seus cursos da área de membros
          </p>
        </div>
        <Dialog open={showCourseModal} onOpenChange={setShowCourseModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Curso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedCourse ? "Editar Curso" : "Criar Novo Curso"}
              </DialogTitle>
              <DialogDescription>
                {selectedCourse 
                  ? "Atualize as informações do curso"
                  : "Preencha as informações para criar um novo curso"
                }
              </DialogDescription>
            </DialogHeader>
            <CourseForm />
          </DialogContent>
        </Dialog>
      </div>

      {loadingCourses ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground mt-2">Carregando cursos...</p>
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum curso criado</h3>
              <p className="text-muted-foreground mb-6">
                Comece criando seu primeiro curso para a área de membros
              </p>
              <Button onClick={() => setShowCourseModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Curso
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: Course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Área de Membros
          </h1>
          <p className="text-muted-foreground mt-1">
            Sistema completo de gerenciamento de cursos e conteúdo educacional
          </p>
        </div>
        <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
          <User className="w-3 h-3 mr-1" />
          Admin Only
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <Book className="w-4 h-4" />
            Cursos
          </TabsTrigger>
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Módulos
          </TabsTrigger>
          <TabsTrigger value="lessons" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Aulas
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <Dashboard />
        </TabsContent>

        <TabsContent value="courses">
          <CoursesTab />
        </TabsContent>

        <TabsContent value="modules">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Módulos</CardTitle>
              <CardDescription>
                Organize o conteúdo dos seus cursos em módulos estruturados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Selecione um curso para gerenciar seus módulos
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lessons">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Aulas</CardTitle>
              <CardDescription>
                Crie e edite aulas com conteúdo texto, vídeo e PDF
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Selecione um módulo para gerenciar suas aulas
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics da Área de Membros</CardTitle>
              <CardDescription>
                Acompanhe o desempenho dos seus cursos e engajamento dos alunos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Em breve: Relatórios detalhados de performance
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}