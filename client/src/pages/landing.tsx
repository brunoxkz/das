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
  Package
} from "lucide-react";
import { Link as RouterLink } from "wouter";

export default function Landing() {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "I.A. CONVERSION +",
      description: "Sistema de IA para geração automática de vídeos personalizados com HeyGen API, criando conteúdo único para cada lead.",
      highlight: true,
      stats: "+340% conversão"
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Anti-WebView BlackHat",
      description: "Sistema avançado de remarketing que detecta quando usuários saem de apps e retornam ao navegador, capturando 100% dos leads.",
      highlight: true,
      stats: "100% captura"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Ultra-Personalização",
      description: "Captura CADA resposta para remarketing ultra-personalizado com segmentação avançada e mensagens dinâmicas.",
      highlight: true,
      stats: "Remarketing 360°"
    },
    {
      icon: <Crown className="w-8 h-8" />,
      title: "Super Afiliados",
      description: "Sistema exclusivo com 4 quizzes especiais onde apenas o usuário principal pode editar, afiliados ganham por vendas.",
      highlight: false,
      stats: "Comissões automáticas"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "SMS/WhatsApp Global",
      description: "Detecção automática de países e dois modos: 'AO VIVO' para novos leads e 'LEADS NA BASE' para remarketing.",
      highlight: false,
      stats: "200+ países"
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
        { name: "30+ Elementos", icon: <Palette className="w-4 h-4" /> },
        { name: "6 Jogos Interativos", icon: <Play className="w-4 h-4" /> },
        { name: "Páginas de Transição", icon: <Layers className="w-4 h-4" /> },
        { name: "Design Responsivo", icon: <Smartphone className="w-4 h-4" /> }
      ]
    },
    {
      category: "Marketing",
      items: [
        { name: "SMS Global", icon: <MessageSquare className="w-4 h-4" /> },
        { name: "Email Marketing", icon: <Mail className="w-4 h-4" /> },
        { name: "WhatsApp Business", icon: <Bot className="w-4 h-4" /> },
        { name: "Voice Calling", icon: <Phone className="w-4 h-4" /> }
      ]
    },
    {
      category: "Analytics",
      items: [
        { name: "Super Analytics", icon: <TrendingUp className="w-4 h-4" /> },
        { name: "Teste A/B", icon: <BarChart3 className="w-4 h-4" /> },
        { name: "Funis de Conversão", icon: <Target className="w-4 h-4" /> },
        { name: "Métricas Tempo Real", icon: <Gauge className="w-4 h-4" /> }
      ]
    },
    {
      category: "Integrações",
      items: [
        { name: "Webhooks", icon: <Webhook className="w-4 h-4" /> },
        { name: "Shopify/WooCommerce", icon: <Package className="w-4 h-4" /> },
        { name: "APIs Personalizadas", icon: <Plug className="w-4 h-4" /> },
        { name: "Extensões Chrome", icon: <Settings className="w-4 h-4" /> }
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
        "Templates básicos"
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
        "I.A. Conversion +",
        "Anti-WebView System",
        "SMS/WhatsApp Global",
        "Super Analytics",
        "Teste A/B"
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
        "Super Afiliados",
        "White Label",
        "Suporte Priority",
        "API Dedicada",
        "Treinamento 1:1"
      ],
      cta: "Falar com Vendas",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 backdrop-blur-sm bg-gray-900/80 sticky top-0 z-50">
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
                <a href="#features" className="text-gray-300 hover:text-white transition-colors">
                  Funcionalidades
                </a>
                <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">
                  Preços
                </a>
                <a href="#tech" className="text-gray-300 hover:text-white transition-colors">
                  Tecnologia
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <RouterLink href="/auth/login">
                <Button variant="ghost" className="text-gray-300 hover:text-white">
                  Entrar
                </Button>
              </RouterLink>
              <RouterLink href="/auth/register">
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
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-gray-900 to-blue-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <Badge className="mb-4 bg-green-500/20 text-green-400 border-green-500/30">
              🚀 Plataforma Mais Avançada do Brasil
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-green-200 to-white bg-clip-text text-transparent">
              Quiz Funnels
              <br />
              <span className="text-green-400">Ultra-Personalizados</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
              A única plataforma que captura <strong className="text-green-400">100% dos leads</strong> com 
              remarketing ultra-personalizado, I.A. para vídeos automáticos e sistema Anti-WebView revolucionário.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <RouterLink href="/auth/register">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 py-4">
                  <Play className="w-5 h-5 mr-2" />
                  Teste 3 Dias Grátis
                </Button>
              </RouterLink>
              <Button size="lg" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 text-lg px-8 py-4">
                <Video className="w-5 h-5 mr-2" />
                Ver Demo
              </Button>
            </div>
            <div className="mt-8 flex justify-center space-x-8 text-sm text-gray-400">
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
      <section id="features" className="py-24 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Funcionalidades <span className="text-green-400">Exclusivas</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Recursos únicos que nos diferenciam de qualquer outra plataforma do mercado
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className={`bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300 ${feature.highlight ? 'ring-2 ring-green-500/50' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${feature.highlight ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-300'}`}>
                      {feature.icon}
                    </div>
                    {feature.highlight && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Exclusivo
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
                  <Badge variant="outline" className="w-fit border-gray-600 text-gray-300">
                    {feature.stats}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Stack <span className="text-green-400">Tecnológico</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Plataforma completa com todas as ferramentas que você precisa
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {techStack.map((category, index) => (
              <Card key={index} className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-green-400 text-lg">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center space-x-3">
                        <div className="p-1 bg-gray-700 rounded text-gray-300">
                          {item.icon}
                        </div>
                        <span className="text-gray-300">{item.name}</span>
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
      <section className="py-24 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">100%</div>
              <div className="text-gray-300">Taxa de Captura</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">340%</div>
              <div className="text-gray-300">Aumento Conversão</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">200+</div>
              <div className="text-gray-300">Países Suportados</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">100k+</div>
              <div className="text-gray-300">Usuários Simultâneos</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Preços <span className="text-green-400">Transparentes</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Escolha o plano ideal para seu negócio. Teste grátis por 3 dias!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`bg-gray-800/50 border-gray-700 relative ${plan.popular ? 'ring-2 ring-green-500/50' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-500 text-white px-4 py-1">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                  <div className="text-center">
                    <span className="text-4xl font-bold text-green-400">{plan.price}</span>
                    <span className="text-gray-300">{plan.period}</span>
                  </div>
                  <p className="text-gray-300">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="w-4 h-4 text-green-400 mr-3" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'}`}
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
      <section className="py-24 bg-gradient-to-r from-green-900/20 to-blue-900/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para <span className="text-green-400">Revolucionar</span> seus Funnels?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Junte-se a milhares de empresas que já estão usando a plataforma mais avançada do Brasil
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <RouterLink href="/auth/register">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 py-4">
                <Zap className="w-5 h-5 mr-2" />
                Começar Agora - 3 Dias Grátis
              </Button>
            </RouterLink>
            <Button size="lg" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 text-lg px-8 py-4">
              <ExternalLink className="w-5 h-5 mr-2" />
              Agendar Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <img 
                src="https://vendzz.com.br/wp-content/uploads/2024/12/logo-vendzz.png" 
                alt="Vendzz" 
                className="h-8 w-auto mb-4"
              />
              <p className="text-gray-400">
                A plataforma mais avançada de quiz funnels do Brasil.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-white">Preços</a></li>
                <li><a href="#" className="hover:text-white">Templates</a></li>
                <li><a href="#" className="hover:text-white">Integrações</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Sobre</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Suporte</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Privacidade</a></li>
                <li><a href="#" className="hover:text-white">Termos</a></li>
                <li><a href="#" className="hover:text-white">Cookies</a></li>
                <li><a href="#" className="hover:text-white">LGPD</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2025 Vendzz. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}