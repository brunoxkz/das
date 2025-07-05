
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Vote, 
  Wand2, 
  Users, 
  BarChart3, 
  Palette, 
  Code, 
  Play, 
  Video,
  Check,
  Shield,
  Clock,
  CreditCard,
  Star,
  Twitter,
  Facebook,
  Linkedin,
  Instagram,
  Globe,
  ArrowRight,
  Zap,
  Target,
  Trophy,
  BookOpen,
  Layers,
  TrendingUp,
  Award,
  Brain,
  Smartphone,
  Monitor,
  Download,
  Eye,
  ChevronRight,
  Gift,
  Layout,
  Sparkles,
  Database,
  Mail,
  Filter,
  BarChart4,
  Users2,
  Gauge,
  Calendar,
  MessageSquare,
  ExternalLink
} from "lucide-react";
import { Link as RouterLink } from "wouter";

export default function Landing() {
  const superFeatures = [
    {
      icon: <BarChart4 className="w-6 h-6" />,
      title: "Super Analytics",
      description: "Dashboard avançado com métricas em tempo real, funis de conversão, análise de abandono e insights de performance.",
      color: "bg-blue-500/10 text-blue-600",
      stats: "Taxa de conversão 64% média",
      highlight: true
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Sistema de Premiações",
      description: "Gamificação completa com rankings, medalhas e premiações para aumentar engajamento e conversões.",
      color: "bg-yellow-500/10 text-yellow-600",
      stats: "+40% engajamento",
      highlight: true
    },
    {
      icon: <Layers className="w-6 h-6" />,
      title: "Páginas de Transição",
      description: "Elementos avançados para guiar o usuário com páginas de loading, redirecionamentos e transições suaves.",
      color: "bg-purple-500/10 text-purple-600",
      stats: "Reduz abandono em 25%"
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Tutoriais Integrados",
      description: "Sistema completo de onboarding com tutoriais interativos e guias passo-a-passo para maximizar resultados.",
      color: "bg-green-500/10 text-green-600",
      stats: "Setup em 5 minutos"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "IA para Elementos",
      description: "Elementos inteligentes como calculadora de IMC, análise de perfil e recomendações personalizadas.",
      color: "bg-cyan-500/10 text-cyan-600",
      stats: "Personalização 100%"
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "Captura Avançada",
      description: "Sistema robusto de captura com validação automática, segmentação inteligente e exportação em massa.",
      color: "bg-indigo-500/10 text-indigo-600",
      stats: "2.847 leads capturados"
    }
  ];

  const analyticsFeatures = [
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Funis de Conversão",
      description: "Visualize cada etapa do funil e identifique pontos de melhoria"
    },
    {
      icon: <Users2 className="w-5 h-5" />,
      title: "Análise de Comportamento",
      description: "Entenda como seus leads interagem com cada pergunta"
    },
    {
      icon: <Gauge className="w-5 h-5" />,
      title: "Performance em Tempo Real",
      description: "Monitore conversões, tempo médio e taxa de abandono"
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: "Relatórios Automáticos",
      description: "Receba insights semanais direto no seu email"
    }
  ];

  const gamificationFeatures = [
    {
      icon: <Award className="w-5 h-5" />,
      title: "Rankings Dinâmicos",
      description: "Sistema de pontuação que motiva participação"
    },
    {
      icon: <Gift className="w-5 h-5" />,
      title: "Premiações Customizadas",
      description: "Configure prêmios e recompensas automaticamente"
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: "Metas e Desafios",
      description: "Crie objetivos que aumentam o engajamento"
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "Badges e Conquistas",
      description: "Sistema de conquistas para fidelizar usuários"
    }
  ];

  const advancedElements = [
    {
      name: "Calculadora IMC",
      description: "Coleta altura/peso e calcula IMC automaticamente",
      icon: "⚖️",
      category: "Saúde"
    },
    {
      name: "Upload de Imagens",
      description: "Permite upload com conversão automática para WebP",
      icon: "🖼️",
      category: "Mídia"
    },
    {
      name: "Player de Vídeo",
      description: "Suporte a YouTube, Vimeo, TikTok e Instagram",
      icon: "🎥",
      category: "Mídia"
    },
    {
      name: "Data de Nascimento",
      description: "Captura e calcula idade automaticamente",
      icon: "📅",
      category: "Perfil"
    },
    {
      name: "Peso Atual/Meta",
      description: "Elementos especializados para fitness e saúde",
      icon: "🎯",
      category: "Fitness"
    },
    {
      name: "Múltipla Escolha+",
      description: "Com suporte a imagens e validação avançada",
      icon: "✅",
      category: "Básico"
    }
  ];

  const templates = [
    {
      title: "E-commerce Avançado",
      description: "Quiz com IA para recomendação de produtos e análise de perfil de compra",
      badge: "IA Integrada",
      badgeColor: "bg-blue-100 text-blue-600",
      gradient: "from-blue-400 to-purple-500",
      icon: "🛒",
      features: ["Recomendação IA", "Análise de Perfil", "Gamificação"]
    },
    {
      title: "Saúde & Fitness",
      description: "Sistema completo com IMC, metas de peso e plano personalizado",
      badge: "Mais Usado",
      badgeColor: "bg-green-100 text-green-600",
      gradient: "from-green-400 to-teal-500",
      icon: "❤️",
      features: ["Calc. IMC", "Metas", "Premiações"]
    },
    {
      title: "Diagnóstico B2B",
      description: "Avaliação empresarial com métricas avançadas e relatórios automáticos",
      badge: "Enterprise",
      badgeColor: "bg-purple-100 text-purple-600",
      gradient: "from-purple-400 to-pink-500",
      icon: "📊",
      features: ["Super Analytics", "Relatórios", "CRM Integration"]
    },
    {
      title: "Imobiliário",
      description: "Quiz para perfil do comprador com análise financeira integrada",
      badge: "Novo",
      badgeColor: "bg-orange-100 text-orange-600",
      gradient: "from-orange-400 to-red-500",
      icon: "🏠",
      features: ["Análise Financeira", "Geolocalização", "Leads Qualificados"]
    }
  ];

  const plans = [
    {
      name: "Starter",
      price: "R$ 97",
      period: "/mês",
      description: "Para começar com quizzes profissionais",
      features: [
        "Até 5 quizzes ativos",
        "1.000 respostas/mês",
        "Templates básicos",
        "Analytics essencial",
        "Elementos básicos",
        "Suporte por email"
      ],
      buttonText: "Começar Teste Grátis",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "Professional",
      price: "R$ 197",
      period: "/mês",
      description: "Recursos avançados para crescer",
      features: [
        "Quizzes ilimitados",
        "10.000 respostas/mês",
        "Todos os templates",
        "Super Analytics completo",
        "Sistema de premiações",
        "Elementos avançados + IA",
        "Páginas de transição",
        "Integrações premium",
        "Suporte prioritário"
      ],
      buttonText: "Começar Teste Grátis",
      buttonVariant: "default" as const,
      popular: true
    },
    {
      name: "Enterprise",
      price: "R$ 497",
      period: "/mês",
      description: "Solução completa para empresas",
      features: [
        "Recursos ilimitados",
        "100.000 respostas/mês",
        "White-label completo",
        "API personalizada",
        "Tutoriais personalizados",
        "Analytics customizado",
        "Gamificação avançada",
        "Gerente de conta dedicado",
        "Suporte 24/7"
      ],
      buttonText: "Falar com Vendas",
      buttonVariant: "secondary" as const,
      popular: false
    }
  ];

  const stats = [
    { value: "2.847", label: "Leads Capturados", growth: "+23%" },
    { value: "64%", label: "Taxa de Conversão", growth: "+18%" },
    { value: "120s", label: "Tempo Médio", growth: "-15%" },
    { value: "85%", label: "Taxa de Conclusão", growth: "+31%" }
  ];

  const testimonials = [
    {
      name: "Carlos Silva",
      company: "E-commerce Fashion",
      role: "CEO",
      content: "Com os quiz funnels da Vendzz, aumentamos nossa conversão em 340%. O sistema de premiações é revolucionário!",
      rating: 5,
      results: "340% aumento em conversões"
    },
    {
      name: "Ana Costa",
      company: "Clínica Bem Estar",
      role: "Diretora de Marketing",
      content: "Os elementos de saúde e o sistema de IMC nos ajudaram a capturar leads muito mais qualificados.",
      rating: 5,
      results: "85% leads mais qualificados"
    },
    {
      name: "Roberto Santos",
      company: "Consultoria B2B",
      role: "Sócio-Fundador",
      content: "O Super Analytics nos deu insights que nunca tivemos antes. ROI de 450% em 3 meses.",
      rating: 5,
      results: "ROI 450% em 3 meses"
    }
  ];

  return (
    <div className="font-sans text-gray-900 bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Vote className="text-primary text-2xl mr-2" />
                <img 
                  src="https://vendzz.com.br/wp-content/uploads/2024/12/logo-vendzz.png" 
                  alt="Vendzz" 
                  className="h-8 object-contain"
                />
              </div>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#features" className="text-gray-600 hover:text-primary transition-colors">Recursos</a>
                <a href="#analytics" className="text-gray-600 hover:text-primary transition-colors">Analytics</a>
                <a href="#templates" className="text-gray-600 hover:text-primary transition-colors">Templates</a>
                <a href="#pricing" className="text-gray-600 hover:text-primary transition-colors">Preços</a>
                <a href="#testimonials" className="text-gray-600 hover:text-primary transition-colors">Cases</a>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Globe className="w-4 h-4 mr-1" />
                PT
              </Button>
              <Button variant="ghost" size="sm">
                <RouterLink to="/login">
                  Entrar
                </RouterLink>
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-primary to-primary/80">
                <RouterLink to="/login">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Teste Grátis
                </RouterLink>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-bg text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="bg-white/10 text-white border-white/20 mb-6">
                <Sparkles className="w-3 h-3 mr-1" />
                Plataforma Mais Avançada do Brasil
              </Badge>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Quiz Funnels com
                <span className="text-yellow-300 block"> Super Analytics</span>
                <span className="text-green-300 block"> + Gamificação</span>
              </h1>
              
              <p className="text-xl mb-8 text-gray-100 leading-relaxed">
                A única plataforma que combina quiz funnels inteligentes, analytics avançado, 
                sistema de premiações e elementos de IA para maximizar suas conversões.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-gray-200">{stat.label}</div>
                    <div className="text-xs text-green-300 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {stat.growth}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="bg-white text-primary hover:bg-gray-50 text-lg px-8 py-4"
                >
                  <RouterLink to="/login" className="flex items-center">
                    <Play className="w-5 h-5 mr-2" />
                    Começar Agora Grátis
                  </RouterLink>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-4"
                >
                  <Video className="w-5 h-5 mr-2" />
                  Ver Demo Completa
                </Button>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-200">
                <span className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-300" />
                  Setup em 5 minutos
                </span>
                <span className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-300" />
                  Sem cartão de crédito
                </span>
                <span className="flex items-center">
                  <Check className="w-4 h-4 mr-2 text-green-300" />
                  14 dias grátis
                </span>
              </div>
            </div>

            <div className="relative">
              <Card className="transform rotate-2 hover:rotate-0 transition-transform duration-500 shadow-2xl bg-white/95 backdrop-blur">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                      <BarChart4 className="w-5 h-5 mr-2 text-primary" />
                      Super Analytics
                    </h3>
                    <Badge className="bg-green-100 text-green-700">
                      Tempo Real
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">2.847</div>
                      <div className="text-sm text-blue-700">Leads Capturados</div>
                      <div className="text-xs text-green-600 flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +23% esta semana
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                      <div className="text-2xl font-bold text-green-600">64%</div>
                      <div className="text-sm text-green-700">Taxa Conversão</div>
                      <div className="text-xs text-green-600 flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +18% vs. mês anterior
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 h-32 rounded-lg p-4 flex items-center justify-center">
                    <div className="w-full">
                      <div className="flex justify-between items-end h-20 mb-2">
                        <div className="bg-primary h-12 w-8 rounded opacity-60"></div>
                        <div className="bg-primary h-16 w-8 rounded opacity-70"></div>
                        <div className="bg-primary h-10 w-8 rounded opacity-50"></div>
                        <div className="bg-primary h-20 w-8 rounded"></div>
                        <div className="bg-primary h-14 w-8 rounded opacity-80"></div>
                        <div className="bg-primary h-18 w-8 rounded opacity-90"></div>
                        <div className="bg-primary h-8 w-8 rounded opacity-40"></div>
                      </div>
                      <div className="text-xs text-gray-500 text-center">
                        Conversões dos últimos 7 dias
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 bg-yellow-400 text-yellow-900 px-3 py-2 rounded-lg text-sm font-semibold shadow-lg">
                <Trophy className="w-4 h-4 inline mr-1" />
                +40% Engajamento
              </div>
              <div className="absolute -bottom-4 -left-4 bg-green-400 text-green-900 px-3 py-2 rounded-lg text-sm font-semibold shadow-lg">
                <Brain className="w-4 h-4 inline mr-1" />
                IA Integrada
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Super Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-primary/10 text-primary mb-4">
              Recursos Exclusivos
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-neutral-900">
              Muito Além de Quiz Simples
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              A Vendzz é a única plataforma que oferece analytics avançado, gamificação, 
              elementos de IA e sistema de premiações integrados para maximizar suas conversões
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {superFeatures.map((feature, index) => (
              <Card key={index} className={`card-hover relative ${feature.highlight ? 'ring-2 ring-primary/20 shadow-lg' : ''}`}>
                {feature.highlight && (
                  <div className="absolute -top-3 left-4">
                    <Badge className="bg-primary text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Destaque
                    </Badge>
                  </div>
                )}
                <CardContent className="p-8">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-neutral-900">{feature.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                  <div className="text-sm font-medium text-primary bg-primary/10 px-3 py-2 rounded-lg inline-block">
                    {feature.stats}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Super Analytics Deep Dive */}
      <section id="analytics" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="bg-blue-100 text-blue-600 mb-6">
                <BarChart4 className="w-4 h-4 mr-1" />
                Super Analytics
              </Badge>
              <h2 className="text-4xl font-bold mb-6 text-neutral-900">
                Analytics que Transformam Dados em Resultados
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Não se contente com métricas básicas. Nosso Super Analytics oferece 
                insights profundos que revelam exatamente como otimizar seus funnels.
              </p>

              <div className="space-y-6">
                {analyticsFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button size="lg" className="mt-8">
                <RouterLink to="/login" className="flex items-center">
                  Ver Analytics em Ação
                  <ArrowRight className="w-4 h-4 ml-2" />
                </RouterLink>
              </Button>
            </div>

            <div className="relative">
              <Card className="shadow-2xl">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
                    <h3 className="text-lg font-semibold mb-2">Dashboard Analytics</h3>
                    <p className="text-blue-100 text-sm">Dados dos últimos 30 dias</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">847</div>
                        <div className="text-xs text-gray-600">Visitantes Únicos</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">542</div>
                        <div className="text-xs text-gray-600">Leads Gerados</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Pergunta 1 → 2</span>
                        <span className="text-green-600">92%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '92%'}}></div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>Pergunta 2 → 3</span>
                        <span className="text-green-600">78%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '78%'}}></div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>Pergunta 3 → Lead</span>
                        <span className="text-yellow-600">64%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{width: '64%'}}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Gamification Section */}
      <section className="py-24 bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <Card className="shadow-2xl">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6">
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <Trophy className="w-5 h-5 mr-2" />
                      Sistema de Premiações
                    </h3>
                    <p className="text-yellow-100 text-sm">Rankings em tempo real</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                            1
                          </div>
                          <div>
                            <div className="font-semibold">Carlos Silva</div>
                            <div className="text-xs text-gray-600">1.247 pontos</div>
                          </div>
                        </div>
                        <div className="text-yellow-600">
                          <Trophy className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                            2
                          </div>
                          <div>
                            <div className="font-semibold">Ana Costa</div>
                            <div className="text-xs text-gray-600">1.156 pontos</div>
                          </div>
                        </div>
                        <div className="text-gray-400">
                          <Award className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                            3
                          </div>
                          <div>
                            <div className="font-semibold">Roberto Santos</div>
                            <div className="text-xs text-gray-600">1.089 pontos</div>
                          </div>
                        </div>
                        <div className="text-orange-500">
                          <Award className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                      <div className="text-sm font-semibold text-purple-800 mb-1">Próxima Premiação</div>
                      <div className="text-xs text-purple-600">R$ 5.000 para o 1º lugar em Dezembro</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Badge className="bg-yellow-100 text-yellow-600 mb-6">
                <Trophy className="w-4 h-4 mr-1" />
                Gamificação Avançada
              </Badge>
              <h2 className="text-4xl font-bold mb-6 text-neutral-900">
                Premiações que Multiplicam o Engajamento
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Transforme seus quizzes em experiências viciantes com nosso sistema 
                completo de gamificação e premiações automáticas.
              </p>

              <div className="space-y-6">
                {gamificationFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl border border-yellow-200">
                <h4 className="font-semibold text-gray-900 mb-2">Resultado Comprovado</h4>
                <p className="text-gray-700 text-sm mb-3">
                  Clientes que usam nosso sistema de premiações têm:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                    <span>+40% engajamento</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                    <span>+25% taxa de conclusão</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Elements Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-purple-100 text-purple-600 mb-4">
              <Brain className="w-4 h-4 mr-1" />
              Elementos Inteligentes
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-neutral-900">
              Elementos com IA Integrada
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Vá além de perguntas simples. Use elementos inteligentes que calculam, 
              analisam e personalizam a experiência automaticamente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advancedElements.map((element, index) => (
              <Card key={index} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl">{element.icon}</div>
                    <Badge variant="secondary" className="text-xs">
                      {element.category}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{element.name}</h3>
                  <p className="text-gray-600 text-sm">{element.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline">
              <RouterLink to="/login" className="flex items-center">
                Ver Todos os Elementos
                <ChevronRight className="w-4 h-4 ml-1" />
              </RouterLink>
            </Button>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-green-100 text-green-600 mb-4">
              <Layout className="w-4 h-4 mr-1" />
              Templates Avançados
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-neutral-900">
              Templates que Convertem por Setor
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Modelos pré-construídos com estratégias testadas e aprovadas, 
              otimizados para cada tipo de negócio e objetivo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {templates.map((template, index) => (
              <Card key={index} className="overflow-hidden card-hover">
                <div className={`bg-gradient-to-br ${template.gradient} h-56 flex items-center justify-center relative`}>
                  <div className="absolute top-4 right-4">
                    <Badge className={template.badgeColor}>{template.badge}</Badge>
                  </div>
                  
                  <Card className="bg-white/95 backdrop-blur p-6 max-w-[250px] mx-auto">
                    <CardContent className="p-0 text-center">
                      <div className="text-4xl mb-3">{template.icon}</div>
                      <h4 className="font-semibold mb-3 text-gray-900">Quiz {template.title}</h4>
                      <div className="space-y-2">
                        <div className="w-full h-3 bg-gray-100 rounded"></div>
                        <div className="w-4/5 h-3 bg-gray-100 rounded"></div>
                        <div className="w-3/5 h-3 bg-gray-100 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-neutral-900 mb-3">{template.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{template.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {template.features.map((feature, featureIndex) => (
                      <Badge key={featureIndex} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button className="w-full">
                    <RouterLink to="/login" className="flex items-center justify-center">
                      Usar Template
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </RouterLink>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg">
              <RouterLink to="/login" className="flex items-center">
                Ver Biblioteca Completa (50+ Templates)
                <ArrowRight className="w-4 h-4 ml-2" />
              </RouterLink>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-600 mb-4">
              <MessageSquare className="w-4 h-4 mr-1" />
              Casos de Sucesso
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-neutral-900">
              Resultados Reais de Clientes Reais
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Veja como empresas estão transformando visitantes em clientes com a Vendzz
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="card-hover">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <blockquote className="text-gray-700 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>
                  
                  <div className="border-t pt-6">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-gray-600">{testimonial.company}</div>
                    
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <div className="text-sm font-medium text-green-800">
                        🎯 {testimonial.results}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-primary/10 text-primary mb-4">
              <CreditCard className="w-4 h-4 mr-1" />
              Planos e Preços
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-neutral-900">
              Invista no Crescimento do seu Negócio
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Planos escaláveis com todos os recursos necessários para maximizar suas conversões
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`card-hover relative ${plan.popular ? 'ring-2 ring-primary shadow-xl scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white px-6 py-2">
                      <Star className="w-3 h-3 mr-1" />
                      Mais Escolhido
                    </Badge>
                  </div>
                )}

                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-semibold mb-2 text-neutral-900">{plan.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                    <div className="text-5xl font-bold text-primary mb-2">{plan.price}</div>
                    <div className="text-gray-600">{plan.period}</div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="text-green-500 mr-3 w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`} 
                    variant={plan.buttonVariant}
                    size="lg"
                  >
                    <RouterLink to="/login">
                      {plan.buttonText}
                    </RouterLink>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Todos os planos incluem 14 dias de teste grátis • Cancele a qualquer momento
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <span className="flex items-center">
                <Shield className="w-4 h-4 mr-1" />
                Dados seguros
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Suporte brasileiro
              </span>
              <span className="flex items-center">
                <Check className="w-4 h-4 mr-1" />
                Sem taxas extras
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-bg text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Comece a Capturar Leads de Verdade
          </h2>
          <p className="text-xl mb-8 text-gray-100 leading-relaxed">
            Junte-se a milhares de empresas que já multiplicaram suas conversões 
            com quiz funnels inteligentes, analytics avançado e gamificação
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12">
            <Button 
              size="lg" 
              variant="secondary" 
              className="bg-white text-primary hover:bg-gray-50 text-lg px-8 py-4"
            >
              <RouterLink to="/login" className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                Começar Teste Grátis 14 Dias
              </RouterLink>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-4"
            >
              Agendar Demo Personalizada
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <Clock className="w-8 h-8 text-white mx-auto mb-3" />
                <div className="font-semibold text-white">Setup em 5 minutos</div>
                <div className="text-sm text-gray-200">Comece imediatamente</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <Shield className="w-8 h-8 text-white mx-auto mb-3" />
                <div className="font-semibold text-white">Sem cartão de crédito</div>
                <div className="text-sm text-gray-200">Teste completamente grátis</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <Users className="w-8 h-8 text-white mx-auto mb-3" />
                <div className="font-semibold text-white">Suporte brasileiro</div>
                <div className="text-sm text-gray-200">Ajuda quando precisar</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <Vote className="text-primary text-2xl mr-2" />
                <img 
                  src="https://vendzz.com.br/wp-content/uploads/2024/12/logo-vendzz.png" 
                  alt="Vendzz" 
                  className="h-6 object-contain"
                />
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                A plataforma mais avançada do Brasil para criação de quiz funnels 
                que convertem visitantes em leads qualificados com analytics, 
                gamificação e IA integrados.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                  <Twitter className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                  <Facebook className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                  <Linkedin className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                  <Instagram className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {[
              {
                title: "Recursos",
                links: [
                  "Super Analytics", 
                  "Sistema de Premiações", 
                  "Elementos de IA", 
                  "Templates Avançados",
                  "Páginas de Transição",
                  "Tutoriais Integrados"
                ]
              },
              {
                title: "Empresa",
                links: ["Sobre", "Blog", "Cases de Sucesso", "Carreiras", "Contato"]
              },
              {
                title: "Suporte",
                links: ["Central de Ajuda", "Tutoriais", "API", "Status", "Segurança"]
              }
            ].map((section, index) => (
              <div key={index}>
                <h4 className="font-semibold mb-6">{section.title}</h4>
                <ul className="space-y-3 text-gray-400">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Button variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto font-normal">
                        {link}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-700 mt-16 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                &copy; 2024 Vendzz. Todos os direitos reservados.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-gray-400">
                <Button variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto font-normal">
                  Política de Privacidade
                </Button>
                <Button variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto font-normal">
                  Termos de Uso
                </Button>
                <Button variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto font-normal">
                  LGPD
                </Button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
