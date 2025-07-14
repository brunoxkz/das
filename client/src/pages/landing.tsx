import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight,
  Play,
  Check,
  Star,
  Zap,
  Target,
  Trophy,
  Shield,
  Brain,
  Smartphone,
  BarChart3,
  Users,
  MessageSquare,
  Mail,
  Bot,
  Phone,
  Crown,
  Palette,
  TrendingUp,
  Globe,
  Eye,
  Filter,
  Sparkles,
  Video,
  Layers,
  Database,
  Clock,
  Award,
  Gauge,
  ExternalLink,
  ChevronRight,
  Webhook,
  Settings,
  Plug,
  Package,
  Sun,
  Moon,
  Quote
} from "lucide-react";
import { Link as RouterLink } from "wouter";
import { useState } from "react";

export default function Landing() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Funil Dinâmico Otimizado",
      description: "Sistema avançado onde todas as variáveis são automaticamente salvas como respostas e podem ser configuradas para remarketing sem limites.",
      highlight: true,
      stats: "Remarketing ilimitado"
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: "Remarketing WhatsApp",
      description: "Sistema completo de remarketing WhatsApp com 4 tipos de campanhas: Remarketing, Ultra Customizado, Ao Vivo e Ultra Personalizada.",
      highlight: true,
      stats: "100% GRÁTIS",
      free: true
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Cloaker Avançado",
      description: "Sistema de proteção e redirecionamento inteligente para proteger suas campanhas de tráfego pago e concorrência.",
      highlight: true,
      stats: "100% GRÁTIS",
      free: true
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "SMS Marketing",
      description: "Envio de SMS em massa com segmentação avançada, mensagens rotativas e detecção automática de países.",
      highlight: false,
      stats: "200+ países"
    },
    {
      icon: <Mail className="w-8 h-8" />,
      title: "Email Marketing",
      description: "Campanhas de email com templates personalizados, automação avançada e analytics completos.",
      highlight: false,
      stats: "Templates ilimitados"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Teste A/B Avançado",
      description: "Sistema de A/B testing com até 3 funis por teste, analytics comparativos e otimização automática.",
      highlight: false,
      stats: "3 variações simultâneas"
    }
  ];

  const techStack = [
    {
      category: "Quiz Builder",
      items: [
        { name: "30+ Elementos Visuais", icon: <Palette className="w-4 h-4" /> },
        { name: "6 Jogos Interativos", icon: <Play className="w-4 h-4" /> },
        { name: "Páginas de Transição", icon: <Layers className="w-4 h-4" /> },
        { name: "Design Responsivo", icon: <Smartphone className="w-4 h-4" /> }
      ]
    },
    {
      category: "Marketing Automation",
      items: [
        { name: "SMS Global + Voice", icon: <MessageSquare className="w-4 h-4" /> },
        { name: "Email Marketing Avançado", icon: <Mail className="w-4 h-4" /> },
        { name: "WhatsApp Business API", icon: <Bot className="w-4 h-4" /> },
        { name: "Cloaker + Proteção", icon: <Shield className="w-4 h-4" /> }
      ]
    },
    {
      category: "Analytics & Testes",
      items: [
        { name: "Super Analytics Tempo Real", icon: <TrendingUp className="w-4 h-4" /> },
        { name: "Teste A/B Avançado", icon: <BarChart3 className="w-4 h-4" /> },
        { name: "Funis de Conversão", icon: <Target className="w-4 h-4" /> },
        { name: "Métricas Detalhadas", icon: <Gauge className="w-4 h-4" /> }
      ]
    },
    {
      category: "Integrações & APIs",
      items: [
        { name: "Webhooks Personalizados", icon: <Webhook className="w-4 h-4" /> },
        { name: "E-commerce Integration", icon: <Package className="w-4 h-4" /> },
        { name: "APIs RESTful", icon: <Plug className="w-4 h-4" /> },
        { name: "Chrome Extensions", icon: <Settings className="w-4 h-4" /> }
      ]
    }
  ];

  const plans = [
    {
      name: "Gratuito",
      price: "R$ 0",
      period: "/mês",
      description: "Ideal para começar",
      features: [
        "3 quizzes por mês",
        "100 respostas",
        "Analytics básico",
        "Templates básicos",
        "WhatsApp Remarketing GRÁTIS",
        "Cloaker GRÁTIS"
      ],
      cta: "Começar Grátis",
      popular: false
    },
    {
      name: "Premium",
      price: "R$ 97",
      period: "/mês",
      description: "Para negócios sérios",
      features: [
        "Quizzes ilimitados",
        "Respostas ilimitadas",
        "Funil Dinâmico Otimizado",
        "SMS/Email Marketing",
        "WhatsApp + Cloaker",
        "Super Analytics",
        "Teste A/B Avançado",
        "Voice Calling"
      ],
      cta: "Teste 3 Dias Grátis",
      popular: true
    },
    {
      name: "Enterprise",
      price: "R$ 297",
      period: "/mês",
      description: "Escala empresarial",
      features: [
        "Tudo do Premium",
        "Suporte Priority",
        "API Dedicada",
        "Webhooks Customizados",
        "Chrome Extensions",
        "Treinamento 1:1",
        "Escalabilidade Ilimitada"
      ],
      cta: "Falar com Vendas",
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Carlos Silva",
      role: "CEO, FitLife",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
      content: "A Vendzz revolucionou nosso funil. Conseguimos 340% mais conversões usando o sistema de remarketing ultra-personalizado. Incrível!",
      rating: 5
    },
    {
      name: "Ana Santos",
      role: "Marketing Manager, BeautyPro",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b8f5?w=80&h=80&fit=crop&crop=face",
      content: "O WhatsApp Remarketing gratuito da Vendzz nos trouxe R$ 50k em vendas extras no primeiro mês. Ferramenta essencial!",
      rating: 5
    },
    {
      name: "Roberto Lima",
      role: "Founder, TechStart",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face",
      content: "O Cloaker protegeu nossas campanhas e o teste A/B nos ajudou a encontrar o funil perfeito. ROI aumentou 280%!",
      rating: 5
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gray-900 text-white' 
        : 'bg-white text-gray-900'
    }`}>
      {/* Header */}
      <header className={`border-b backdrop-blur-sm sticky top-0 z-50 transition-colors duration-300 ${
        theme === 'dark' 
          ? 'border-gray-800 bg-gray-900/80' 
          : 'border-gray-200 bg-white/80'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <img 
                  src="https://vendzz.com.br/wp-content/uploads/2024/12/logo-vendzz.png" 
                  alt="Vendzz" 
                  className="h-8 w-auto"
                />
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                  Beta
                </Badge>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="#features" className={`transition-colors ${
                  theme === 'dark' 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}>
                  Funcionalidades
                </a>
                <a href="#pricing" className={`transition-colors ${
                  theme === 'dark' 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}>
                  Preços
                </a>
                <a href="#tech" className={`transition-colors ${
                  theme === 'dark' 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}>
                  Tecnologia
                </a>
                <a href="#testimonials" className={`transition-colors ${
                  theme === 'dark' 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}>
                  Depoimentos
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`${
                  theme === 'dark' 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <RouterLink href="/login">
                <Button variant="ghost" className={`${
                  theme === 'dark' 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}>
                  Entrar
                </Button>
              </RouterLink>
              <RouterLink href="/login">
                <Button className="bg-green-600 hover:bg-green-700">
                  Começar Grátis
                </Button>
              </RouterLink>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className={`absolute inset-0 transition-colors duration-300 ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-green-900/20 via-gray-900 to-blue-900/20' 
            : 'bg-gradient-to-br from-green-50 via-white to-blue-50'
        }`}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <Badge className="mb-4 bg-green-500/20 text-green-400 border-green-500/30">
              🚀 Plataforma Mais Avançada do Brasil
            </Badge>
            <h1 className={`text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r ${
              theme === 'dark' 
                ? 'from-white via-green-200 to-white' 
                : 'from-gray-900 via-green-600 to-gray-900'
            } bg-clip-text text-transparent`}>
              Quiz Funnels
              <br />
              <span className="text-green-400">Ultra-Personalizados</span>
            </h1>
            <p className={`text-xl md:text-2xl mb-8 max-w-4xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              A única plataforma que captura <strong className="text-green-400">100% dos leads</strong> com 
              funil dinâmico otimizado, remarketing WhatsApp gratuito e sistema cloaker avançado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <RouterLink href="/login">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 py-4">
                  <Play className="w-5 h-5 mr-2" />
                  Teste 3 Dias Grátis
                </Button>
              </RouterLink>
              <Button size="lg" variant="outline" className={`text-lg px-8 py-4 ${
                theme === 'dark' 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}>
                <Video className="w-5 h-5 mr-2" />
                Ver Demo
              </Button>
            </div>
            <div className={`mt-8 flex justify-center space-x-8 text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <div className="flex items-center">
                <Check className="w-4 h-4 mr-2 text-green-400" />
                3 dias grátis
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 mr-2 text-green-400" />
                Sem cartão de crédito
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 mr-2 text-green-400" />
                Cancele quando quiser
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`py-24 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Funcionalidades <span className="text-green-400">Exclusivas</span>
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Recursos únicos que nos diferenciam de qualquer outra plataforma do mercado
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className={`transition-all duration-300 hover:shadow-lg ${
                theme === 'dark' 
                  ? `bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 ${feature.highlight ? 'ring-2 ring-green-500/50' : ''}` 
                  : `bg-white border-gray-200 hover:bg-gray-50 ${feature.highlight ? 'ring-2 ring-green-500/50' : ''}`
              }`}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${
                      feature.highlight 
                        ? 'bg-green-500/20 text-green-400' 
                        : theme === 'dark' 
                          ? 'bg-gray-700 text-gray-300' 
                          : 'bg-gray-100 text-gray-600'
                    }`}>
                      {feature.icon}
                    </div>
                    {feature.highlight && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Exclusivo
                      </Badge>
                    )}
                    {feature.free && (
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        GRÁTIS
                      </Badge>
                    )}
                  </div>
                  <CardTitle className={`text-lg ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {feature.title}
                  </CardTitle>
                  <Badge variant="outline" className={`w-fit ${
                    theme === 'dark' 
                      ? 'border-gray-600 text-gray-300' 
                      : 'border-gray-300 text-gray-600'
                  }`}>
                    {feature.stats}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className={`${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="lg" 
              className={`text-lg px-8 py-4 ${
                theme === 'dark' 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Muito Mais...
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className={`py-24 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              O que nossos <span className="text-green-400">Clientes</span> dizem
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Depoimentos reais de empresas que transformaram seus resultados
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className={`transition-all duration-300 hover:shadow-lg ${
                theme === 'dark' 
                  ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70' 
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className={`font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {testimonial.name}
                      </h4>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1 mt-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Quote className="absolute top-0 left-0 w-8 h-8 text-green-400 opacity-20" />
                    <p className={`text-sm leading-relaxed pl-6 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {testimonial.content}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech" className={`py-24 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Stack <span className="text-green-400">Tecnológico</span>
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Plataforma completa com todas as ferramentas que você precisa
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {techStack.map((category, index) => (
              <Card key={index} className={`transition-all duration-300 hover:shadow-lg ${
                theme === 'dark' 
                  ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70' 
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}>
                <CardHeader>
                  <CardTitle className="text-green-400 text-lg">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center space-x-3">
                        <div className={`p-1 rounded ${
                          theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {item.icon}
                        </div>
                        <span className={`${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-24 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">100%</div>
              <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Taxa de Captura</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">340%</div>
              <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Aumento Conversão</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">200+</div>
              <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Países Suportados</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">100k+</div>
              <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Usuários Simultâneos</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className={`py-24 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Preços <span className="text-green-400">Transparentes</span>
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Escolha o plano ideal para seu negócio. Teste grátis por 3 dias!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative transition-all duration-300 hover:shadow-lg ${
                theme === 'dark' 
                  ? `bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 ${plan.popular ? 'ring-2 ring-green-500/50' : ''}` 
                  : `bg-white border-gray-200 hover:bg-gray-50 ${plan.popular ? 'ring-2 ring-green-500/50' : ''}`
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-500 text-white px-4 py-1">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className={`text-2xl ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {plan.name}
                  </CardTitle>
                  <div className="text-center">
                    <span className="text-4xl font-bold text-green-400">{plan.price}</span>
                    <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{plan.period}</span>
                  </div>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="w-4 h-4 text-green-400 mr-3" />
                        <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : theme === 'dark' 
                          ? 'bg-gray-700 hover:bg-gray-600' 
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-24 transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gradient-to-r from-green-900/20 to-blue-900/20' 
          : 'bg-gradient-to-r from-green-50 to-blue-50'
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`text-4xl font-bold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Pronto para <span className="text-green-400">Revolucionar</span> seus Funnels?
          </h2>
          <p className={`text-xl mb-8 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Junte-se a milhares de empresas que já estão usando a plataforma mais avançada do Brasil
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <RouterLink href="/login">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 py-4">
                <Zap className="w-5 h-5 mr-2" />
                Começar Agora - 3 Dias Grátis
              </Button>
            </RouterLink>
            <Button size="lg" variant="outline" className={`text-lg px-8 py-4 ${
              theme === 'dark' 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}>
              <ExternalLink className="w-5 h-5 mr-2" />
              Agendar Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t py-16 transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-900 border-gray-800' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <img 
                src="https://vendzz.com.br/wp-content/uploads/2024/12/logo-vendzz.png" 
                alt="Vendzz" 
                className="h-8 w-auto mb-4"
              />
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                A plataforma mais avançada de quiz funnels do Brasil.
              </p>
            </div>
            <div>
              <h4 className={`font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Produto
              </h4>
              <ul className={`space-y-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <li><a href="#" className={`${
                  theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'
                }`}>Funcionalidades</a></li>
                <li><a href="#" className={`${
                  theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'
                }`}>Preços</a></li>
                <li><a href="#" className={`${
                  theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'
                }`}>Templates</a></li>
                <li><a href="#" className={`${
                  theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'
                }`}>Integrações</a></li>
              </ul>
            </div>
            <div>
              <h4 className={`font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Empresa
              </h4>
              <ul className={`space-y-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <li><a href="#" className={`${
                  theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'
                }`}>Sobre</a></li>
                <li><a href="#" className={`${
                  theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'
                }`}>Blog</a></li>
                <li><a href="#" className={`${
                  theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'
                }`}>Suporte</a></li>
                <li><a href="#" className={`${
                  theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'
                }`}>Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className={`font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Legal
              </h4>
              <ul className={`space-y-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <li><a href="#" className={`${
                  theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'
                }`}>Privacidade</a></li>
                <li><a href="#" className={`${
                  theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'
                }`}>Termos</a></li>
                <li><a href="#" className={`${
                  theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'
                }`}>Cookies</a></li>
                <li><a href="#" className={`${
                  theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'
                }`}>LGPD</a></li>
              </ul>
            </div>
          </div>
          <div className={`mt-12 pt-8 border-t text-center ${
            theme === 'dark' 
              ? 'border-gray-800 text-gray-400' 
              : 'border-gray-200 text-gray-500'
          }`}>
            <p>&copy; 2025 Vendzz. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}