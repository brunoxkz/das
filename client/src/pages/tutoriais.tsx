import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Clock, 
  Users, 
  BarChart3, 
  Settings, 
  Palette,
  Eye,
  Share2,
  Target,
  Lightbulb,
  ArrowRight,
  Video,
  FileText,
  Zap,
  TrendingUp
} from "lucide-react";

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: "Iniciante" | "Intermediário" | "Avançado";
  category: "Básico" | "Design" | "Analytics" | "Avançado";
  completed: boolean;
  icon: any;
  steps: string[];
}

export default function Tutoriais() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [completedTutorials, setCompletedTutorials] = useState<Set<string>>(new Set());

  const tutorials: Tutorial[] = [
    {
      id: "intro",
      title: "Introdução ao Vendzz",
      description: "Aprenda os conceitos básicos da plataforma e como criar seu primeiro quiz",
      duration: "5 min",
      level: "Iniciante",
      category: "Básico",
      completed: false,
      icon: <BookOpen className="w-5 h-5" />,
      steps: [
        "Navegue até 'Meus Quizzes' no menu lateral",
        "Clique em 'Criar Quiz' para iniciar",
        "Escolha um template ou comece do zero",
        "Configure título e descrição do quiz",
        "Adicione suas primeiras perguntas"
      ]
    },
    {
      id: "create-quiz",
      title: "Criando Seu Primeiro Quiz",
      description: "Passo a passo completo para criar um quiz eficaz de captação de leads",
      duration: "8 min",
      level: "Iniciante",
      category: "Básico",
      completed: false,
      icon: <Play className="w-5 h-5" />,
      steps: [
        "Acesse Templates e escolha 'Quiz de Personalidade'",
        "Personalize o título: 'Descubra Seu Perfil de Cliente'",
        "Adicione 5-7 perguntas de múltipla escolha",
        "Configure campos de captura: nome, email, telefone",
        "Defina resultados personalizados para cada perfil",
        "Teste o quiz antes de publicar"
      ]
    },
    {
      id: "design-quiz",
      title: "Personalizando Design",
      description: "Como usar o sistema de design para criar quizzes visualmente atraentes",
      duration: "10 min",
      level: "Intermediário",
      category: "Design",
      completed: false,
      icon: <Palette className="w-5 h-5" />,
      steps: [
        "Acesse a aba 'Design' no editor",
        "Escolha cores que combinem com sua marca",
        "Configure logo e elementos visuais",
        "Ajuste fontes e tamanhos de texto",
        "Configure barra de progresso",
        "Visualize mudanças em tempo real"
      ]
    },
    {
      id: "lead-capture",
      title: "Otimizando Captação de Leads",
      description: "Estratégias para maximizar a conversão de visitantes em leads qualificados",
      duration: "12 min",
      level: "Intermediário",
      category: "Básico",
      completed: false,
      icon: <Target className="w-5 h-5" />,
      steps: [
        "Posicione campos de captura estrategicamente",
        "Use perguntas que criem curiosidade",
        "Configure resultados personalizados",
        "Implemente gatilhos de urgência",
        "Teste diferentes abordagens",
        "Monitore taxa de conversão"
      ]
    },
    {
      id: "analytics",
      title: "Interpretando Analytics",
      description: "Como usar os dados do Vendzz para otimizar seus resultados",
      duration: "15 min",
      level: "Intermediário",
      category: "Analytics",
      completed: false,
      icon: <BarChart3 className="w-5 h-5" />,
      steps: [
        "Acesse a página Analytics",
        "Entenda métricas principais: visualizações, conversões",
        "Analise funil de conversão",
        "Identifique pontos de abandono",
        "Use dados para otimizar perguntas",
        "Configure relatórios automáticos"
      ]
    },
    {
      id: "sharing",
      title: "Compartilhamento e Distribuição",
      description: "Melhores práticas para compartilhar seus quizzes e aumentar o alcance",
      duration: "8 min",
      level: "Iniciante",
      category: "Básico",
      completed: false,
      icon: <Share2 className="w-5 h-5" />,
      steps: [
        "Obtenha link público do quiz",
        "Compartilhe em redes sociais",
        "Integre em landing pages",
        "Configure códigos de incorporação",
        "Use estratégias de SEO",
        "Monitore fontes de tráfego"
      ]
    },
    {
      id: "advanced-elements",
      title: "Elementos Avançados",
      description: "Domine elementos especiais: jogos, transições e elementos interativos",
      duration: "20 min",
      level: "Avançado",
      category: "Avançado",
      completed: false,
      icon: <Zap className="w-5 h-5" />,
      steps: [
        "Explore elementos de jogos (roleta, memory)",
        "Configure páginas de transição",
        "Use elementos de loading e contador",
        "Implemente redirecionamentos condicionais",
        "Configure elementos de mídia",
        "Teste experiência do usuário"
      ]
    },
    {
      id: "conversion-optimization",
      title: "Otimização de Conversão",
      description: "Técnicas avançadas para aumentar suas taxas de conversão",
      duration: "18 min",
      level: "Avançado",
      category: "Analytics",
      completed: false,
      icon: <TrendingUp className="w-5 h-5" />,
      steps: [
        "Analise heatmaps de abandono",
        "Teste diferentes layouts",
        "Optimize tempo de carregamento",
        "Configure pixel de tracking",
        "Implemente A/B testing",
        "Monitore métricas avançadas"
      ]
    }
  ];

  const categories = ["Todos", "Básico", "Design", "Analytics", "Avançado"];

  const filteredTutorials = selectedCategory === "Todos" 
    ? tutorials 
    : tutorials.filter(t => t.category === selectedCategory);

  const completedCount = completedTutorials.size;
  const totalCount = tutorials.length;
  const progressPercentage = Math.round((completedCount / totalCount) * 100);

  const markAsCompleted = (tutorialId: string) => {
    setCompletedTutorials(prev => new Set([...prev, tutorialId]));
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Iniciante": return "bg-green-100 text-green-800";
      case "Intermediário": return "bg-yellow-100 text-yellow-800";
      case "Avançado": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getIconForCategory = (category: string) => {
    switch (category) {
      case "Básico": return <BookOpen className="w-4 h-4" />;
      case "Design": return <Palette className="w-4 h-4" />;
      case "Analytics": return <BarChart3 className="w-4 h-4" />;
      case "Avançado": return <Zap className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tutoriais Vendzz</h1>
            <p className="text-gray-600">Aprenda a dominar todas as funcionalidades da plataforma</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{progressPercentage}%</div>
            <div className="text-sm text-gray-600">Concluído</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-200 rounded-full h-3 mb-6">
          <div 
            className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center">
              <div className="bg-primary/10 p-2 rounded-lg mr-3">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalCount}</div>
                <div className="text-sm text-gray-600">Tutoriais</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{completedCount}</div>
                <div className="text-sm text-gray-600">Concluídos</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">1h 30m</div>
                <div className="text-sm text-gray-600">Tempo Total</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center">
              <div className="bg-purple-100 p-2 rounded-lg mr-3">
                <Lightbulb className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">8</div>
                <div className="text-sm text-gray-600">Tópicos</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="flex items-center space-x-2"
          >
            {category !== "Todos" && getIconForCategory(category)}
            <span>{category}</span>
          </Button>
        ))}
      </div>

      {/* Tutorials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTutorials.map((tutorial) => {
          const isCompleted = completedTutorials.has(tutorial.id);
          
          return (
            <Card key={tutorial.id} className={`relative transition-all duration-200 hover:shadow-lg ${isCompleted ? 'border-green-200 bg-green-50/30' : ''}`}>
              {isCompleted && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    {tutorial.icon}
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge className={getLevelColor(tutorial.level)}>
                      {tutorial.level}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-3 h-3 mr-1" />
                      {tutorial.duration}
                    </div>
                  </div>
                </div>
                
                <CardTitle className="text-lg mb-2">{tutorial.title}</CardTitle>
                <p className="text-sm text-gray-600 line-clamp-3">{tutorial.description}</p>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">Você vai aprender:</div>
                  <ul className="space-y-1">
                    {tutorial.steps.slice(0, 3).map((step, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <ArrowRight className="w-3 h-3 mt-0.5 mr-2 text-primary flex-shrink-0" />
                        <span>{step}</span>
                      </li>
                    ))}
                    {tutorial.steps.length > 3 && (
                      <li className="text-sm text-gray-400">
                        + {tutorial.steps.length - 3} passos adicionais
                      </li>
                    )}
                  </ul>
                </div>

                <div className="flex items-center space-x-2 mt-4">
                  {!isCompleted ? (
                    <Button 
                      className="flex-1"
                      onClick={() => markAsCompleted(tutorial.id)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Começar
                    </Button>
                  ) : (
                    <Button variant="outline" className="flex-1" disabled>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Concluído
                    </Button>
                  )}
                  
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Tips */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Dicas Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center mb-3">
                <div className="bg-blue-500 p-2 rounded-lg mr-3">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-blue-900">Maximize Conversões</h3>
              </div>
              <p className="text-sm text-blue-800">
                Posicione campos de captura após despertar curiosidade com suas perguntas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center mb-3">
                <div className="bg-green-500 p-2 rounded-lg mr-3">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-green-900">Use Analytics</h3>
              </div>
              <p className="text-sm text-green-800">
                Monitore regularmente suas métricas para identificar oportunidades de melhoria
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center mb-3">
                <div className="bg-purple-500 p-2 rounded-lg mr-3">
                  <Palette className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-purple-900">Design Consistente</h3>
              </div>
              <p className="text-sm text-purple-800">
                Mantenha a identidade visual da sua marca em todos os elementos
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}