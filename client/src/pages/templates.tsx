import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { 
  Search, 
  Filter, 
  Star, 
  ArrowRight,
  ShoppingCart,
  TrendingUp,
  Heart,
  GraduationCap,
  Building,
  Home,
  Briefcase,
  Utensils
} from "lucide-react";

export default function Templates() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: templates, isLoading } = useQuery({
    queryKey: ["/api/templates"],
    retry: false,
  });

  const categories = [
    { id: "all", label: "Todos", icon: <Filter className="w-4 h-4" /> },
    { id: "ecommerce", label: "E-commerce", icon: <ShoppingCart className="w-4 h-4" /> },
    { id: "saas", label: "SaaS", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "health", label: "Saúde", icon: <Heart className="w-4 h-4" /> },
    { id: "education", label: "Educação", icon: <GraduationCap className="w-4 h-4" /> },
    { id: "business", label: "Negócios", icon: <Building className="w-4 h-4" /> },
    { id: "real-estate", label: "Imóveis", icon: <Home className="w-4 h-4" /> },
    { id: "finance", label: "Finanças", icon: <Briefcase className="w-4 h-4" /> },
    { id: "food", label: "Alimentação", icon: <Utensils className="w-4 h-4" /> },
  ];

  // Mock templates data since the API might not have templates yet
  const mockTemplates = [
    {
      id: 1,
      name: "Quiz de Produto E-commerce",
      description: "Recomende produtos baseado nas preferências do cliente",
      category: "ecommerce",
      thumbnail: "🛒",
      isPopular: true,
      structure: {
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "Qual tipo de produto você procura?",
            options: ["Roupas", "Eletrônicos", "Casa", "Esporte"]
          }
        ]
      }
    },
    {
      id: 2,
      name: "Assessment de Necessidades SaaS",
      description: "Identifique as necessidades do cliente para software B2B",
      category: "saas",
      thumbnail: "📊",
      isPopular: false,
      structure: {
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "Qual o tamanho da sua empresa?",
            options: ["1-10", "11-50", "51-200", "200+"]
          }
        ]
      }
    },
    {
      id: 3,
      name: "Avaliação de Saúde",
      description: "Quiz para avaliar hábitos de saúde e bem-estar",
      category: "health",
      thumbnail: "❤️",
      isPopular: true,
      structure: {
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "Como você avalia sua alimentação?",
            options: ["Muito boa", "Boa", "Regular", "Precisa melhorar"]
          }
        ]
      }
    },
    {
      id: 4,
      name: "Perfil de Investidor",
      description: "Determine o perfil de risco para investimentos",
      category: "finance",
      thumbnail: "💰",
      isPopular: false,
      structure: {
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "Qual sua experiência com investimentos?",
            options: ["Iniciante", "Intermediário", "Avançado", "Especialista"]
          }
        ]
      }
    },
    {
      id: 5,
      name: "Curso Ideal",
      description: "Ajude estudantes a escolher o curso certo",
      category: "education",
      thumbnail: "🎓",
      isPopular: true,
      structure: {
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "Qual área mais te interessa?",
            options: ["Exatas", "Humanas", "Biológicas", "Tecnologia"]
          }
        ]
      }
    },
    {
      id: 6,
      name: "Imóvel Ideal",
      description: "Encontre o imóvel perfeito para o cliente",
      category: "real-estate",
      thumbnail: "🏠",
      isPopular: false,
      structure: {
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "Que tipo de imóvel você procura?",
            options: ["Apartamento", "Casa", "Terreno", "Comercial"]
          }
        ]
      }
    }
  ];

  const displayTemplates = templates || mockTemplates;

  const filteredTemplates = displayTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template: any) => {
    // Create a new quiz based on the template
    const newQuiz = {
      title: template.name,
      description: template.description,
      structure: template.structure,
      templateId: template.id,
    };
    
    // Store in localStorage for the quiz builder
    localStorage.setItem('newQuizFromTemplate', JSON.stringify(newQuiz));
    
    // Navigate to quiz builder
    window.location.href = '/quizzes/new';
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Templates de Quiz</h1>
        <p className="text-gray-600">Comece rapidamente com templates otimizados para conversão</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="flex items-center gap-2"
          >
            {category.icon}
            {category.label}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Template Preview */}
            <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <div className="bg-white rounded-lg p-4 max-w-[200px] mx-auto shadow-sm">
                <div className="text-center">
                  <div className="text-3xl mb-2">{template.thumbnail}</div>
                  <h4 className="text-sm font-semibold mb-2">{template.name}</h4>
                  <div className="space-y-1">
                    <div className="w-full h-2 bg-gray-100 rounded"></div>
                    <div className="w-3/4 h-2 bg-gray-100 rounded"></div>
                    <div className="w-1/2 h-2 bg-gray-100 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                {template.isPopular && (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Star className="w-3 h-3 mr-1" />
                    Popular
                  </Badge>
                )}
              </div>
              
              <p className="text-gray-600 mb-4 text-sm">{template.description}</p>
              
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {categories.find(c => c.id === template.category)?.label || template.category}
                </Badge>
                
                <Button 
                  size="sm" 
                  onClick={() => handleUseTemplate(template)}
                  className="flex items-center gap-1"
                >
                  Usar Template
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum template encontrado
          </h3>
          <p className="text-gray-600">
            Tente ajustar sua busca ou escolha uma categoria diferente
          </p>
        </div>
      )}
    </div>
  );
}
