import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth-jwt";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Play, 
  Plus, 
  Star, 
  Clock, 
  Users, 
  BookOpen,
  Video,
  FileText,
  Award,
  TrendingUp,
  Filter,
  Search,
  Grid,
  List,
  Eye,
  Heart,
  Download
} from "lucide-react";

// Dados mockados para demonstração estilo Netflix
const sampleCourses = [
  {
    id: "1",
    title: "Marketing Digital Avançado",
    description: "Domine as estratégias mais avançadas de marketing digital e transforme sua carreira profissional",
    category: "Marketing",
    instructor: "Carlos Silva",
    duration: "12h 30min",
    lessons: 45,
    students: 2847,
    rating: 4.9,
    price: 297.00,
    level: "Avançado",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop",
    trending: true,
    new: false,
    featured: true
  },
  {
    id: "2", 
    title: "Copywriting que Converte",
    description: "Aprenda a escrever textos persuasivos que geram vendas e convertem leads em clientes",
    category: "Vendas",
    instructor: "Ana Costa",
    duration: "8h 15min", 
    lessons: 32,
    students: 1523,
    rating: 4.8,
    price: 197.00,
    level: "Intermediário",
    thumbnail: "https://images.unsplash.com/photo-1486312338219-ce68e2c6b7a4?w=400&h=225&fit=crop",
    trending: false,
    new: true,
    featured: false
  },
  {
    id: "3",
    title: "Automação de Vendas com IA", 
    description: "Implemente sistemas de vendas automatizados usando inteligência artificial e ferramentas modernas",
    category: "Tecnologia",
    instructor: "Pedro Santos",
    duration: "15h 45min",
    lessons: 67,
    students: 892,
    rating: 4.7,
    price: 497.00,
    level: "Avançado",
    thumbnail: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=225&fit=crop",
    trending: true,
    new: true,
    featured: true
  },
  {
    id: "4",
    title: "Funis de Conversão de Alta Performance",
    description: "Construa funis de vendas que convertem visitantes em clientes pagantes de forma sistemática",
    category: "Vendas",
    instructor: "Marina Oliveira",
    duration: "10h 20min",
    lessons: 38,
    students: 3421,
    rating: 4.9,
    price: 347.00,
    level: "Intermediário",
    thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=225&fit=crop",
    trending: false,
    new: false,
    featured: true
  },
  {
    id: "5",
    title: "Gestão de Tráfego Pago",
    description: "Domine Facebook Ads, Google Ads e outras plataformas para gerar tráfego qualificado",
    category: "Marketing",
    instructor: "Roberto Lima",
    duration: "14h 10min",
    lessons: 52,
    students: 1876,
    rating: 4.6,
    price: 397.00,
    level: "Avançado",
    thumbnail: "https://images.unsplash.com/photo-1553028826-f4804edff04c?w=400&h=225&fit=crop",
    trending: true,
    new: false,
    featured: false
  },
  {
    id: "6",
    title: "Criação de Conteúdo Viral",
    description: "Estratégias comprovadas para criar conteúdo que engaja, viraliza e gera resultados",
    category: "Conteúdo",
    instructor: "Julia Mendes",
    duration: "6h 45min",
    lessons: 28,
    students: 4532,
    rating: 4.8,
    price: 197.00,
    level: "Iniciante",
    thumbnail: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=225&fit=crop",
    trending: false,
    new: true,
    featured: false
  }
];

const categories = ["Todos", "Marketing", "Vendas", "Tecnologia", "Conteúdo"];

export default function MembersAreaNetflix() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAddCourse, setShowAddCourse] = useState(false);

  // Verificar se é admin - aceitar role admin ou email específico
  const isAdmin = user?.role === 'admin' || user?.email === 'admin@admin.com' || user?.id === 'admin-user-id';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
        <Card className="border-red-500/20 bg-red-950/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-red-400">🚫 Acesso Negado</CardTitle>
            <CardDescription className="text-gray-300">
              Apenas administradores podem acessar a Área de Membros.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Filtrar cursos
  const filteredCourses = sampleCourses.filter(course => {
    const matchesCategory = selectedCategory === "Todos" || course.category === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredCourses = sampleCourses.filter(course => course.featured);
  const newCourses = sampleCourses.filter(course => course.new);
  const trendingCourses = sampleCourses.filter(course => course.trending);

  const CourseCard = ({ course, size = "normal" }: { course: any, size?: "normal" | "large" }) => (
    <Card className={`group relative overflow-hidden bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/10 ${size === "large" ? "col-span-2 row-span-2" : ""}`}>
      <div className="relative">
        <div className={`aspect-video overflow-hidden ${size === "large" ? "h-64" : "h-48"}`}>
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 rounded-full p-4">
              <Play className="w-6 h-6 fill-white" />
            </Button>
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1">
            {course.new && <Badge className="bg-red-600 hover:bg-red-700 text-xs">NOVO</Badge>}
            {course.trending && <Badge className="bg-orange-600 hover:bg-orange-700 text-xs">TRENDING</Badge>}
            {course.featured && <Badge className="bg-green-600 hover:bg-green-700 text-xs">DESTAQUE</Badge>}
          </div>

          {/* Rating */}
          <div className="absolute top-2 right-2 bg-black/70 rounded px-2 py-1">
            <div className="flex items-center gap-1 text-yellow-400 text-xs">
              <Star className="w-3 h-3 fill-current" />
              <span>{course.rating}</span>
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className={`font-bold text-white line-clamp-2 ${size === "large" ? "text-xl" : "text-lg"}`}>
              {course.title}
            </h3>
            <p className="text-gray-400 text-sm line-clamp-2">
              {course.description}
            </p>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {course.students.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {course.duration}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {course.lessons} aulas
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <p className="text-gray-400">por {course.instructor}</p>
                <p className="text-green-400 font-bold">R$ {course.price.toFixed(2)}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {course.level}
              </Badge>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );

  const CourseSection = ({ title, courses, subtitle }: { title: string, courses: any[], subtitle?: string }) => (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
        {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {courses.slice(0, 4).map((course, index) => (
          <CourseCard key={course.id} course={course} size={index === 0 && courses.length > 2 ? "large" : "normal"} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=400&fit=crop" 
          alt="Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="max-w-2xl">
              <h1 className="text-5xl font-bold text-white mb-4">
                📚 Área de Membros
              </h1>
              <p className="text-xl text-gray-300 mb-6">
                Acesso exclusivo aos melhores cursos de marketing digital, vendas e automação. 
                Transforme seu conhecimento em resultados extraordinários.
              </p>
              <div className="flex gap-4">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  <Play className="w-5 h-5 mr-2" />
                  Começar Agora
                </Button>
                <Dialog open={showAddCourse} onOpenChange={setShowAddCourse}>
                  <DialogTrigger asChild>
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                      <Plus className="w-5 h-5 mr-2" />
                      Adicionar Curso
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Adicionar Novo Curso</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Crie um novo curso para a área de membros
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input placeholder="Título do curso" className="bg-gray-800 border-gray-700 text-white" />
                      <Input placeholder="Descrição" className="bg-gray-800 border-gray-700 text-white" />
                      <div className="flex gap-2">
                        <Button className="bg-green-600 hover:bg-green-700">Criar Curso</Button>
                        <Button variant="outline" onClick={() => setShowAddCourse(false)}>Cancelar</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-green-900/50 border-green-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 text-sm">Total de Cursos</p>
                  <p className="text-white text-2xl font-bold">{sampleCourses.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-900/50 border-blue-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-sm">Total de Alunos</p>
                  <p className="text-white text-2xl font-bold">15.1K</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-900/50 border-purple-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm">Horas de Conteúdo</p>
                  <p className="text-white text-2xl font-bold">67h</p>
                </div>
                <Video className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-900/50 border-orange-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-300 text-sm">Taxa de Conclusão</p>
                  <p className="text-white text-2xl font-bold">89%</p>
                </div>
                <Award className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "border-gray-600 text-gray-300 hover:bg-gray-800"
                }
              >
                {category}
              </Button>
            ))}
          </div>
          
          <div className="flex gap-2 items-center">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white w-64"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Featured Courses */}
        {featuredCourses.length > 0 && (
          <CourseSection 
            title="🌟 Cursos em Destaque" 
            courses={featuredCourses}
            subtitle="Os cursos mais populares e bem avaliados da plataforma"
          />
        )}

        {/* New Courses */}
        {newCourses.length > 0 && (
          <div className="mt-12">
            <CourseSection 
              title="🆕 Novos Lançamentos" 
              courses={newCourses}
              subtitle="Conteúdo recém-adicionado à plataforma"
            />
          </div>
        )}

        {/* Trending Courses */}
        {trendingCourses.length > 0 && (
          <div className="mt-12">
            <CourseSection 
              title="🔥 Em Alta" 
              courses={trendingCourses}
              subtitle="Os cursos mais assistidos esta semana"
            />
          </div>
        )}

        {/* All Courses */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                📖 {selectedCategory === "Todos" ? "Todos os Cursos" : `Cursos de ${selectedCategory}`}
              </h2>
              <p className="text-gray-400 text-sm">
                {filteredCourses.length} curso{filteredCourses.length !== 1 ? 's' : ''} encontrado{filteredCourses.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "space-y-4"
          }>
            {filteredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">Nenhum curso encontrado</h3>
              <p className="text-gray-500">
                Tente ajustar os filtros ou termos de busca
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-gray-500">
            <p>© 2025 Vendzz - Área de Membros Premium. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  );
}