import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Shield, 
  Star, 
  ArrowRight, 
  Play, 
  CheckCircle, 
  Sparkles,
  TrendingUp,
  Users,
  Target,
  Brain,
  Layers,
  BarChart3,
  Globe,
  Award,
  Gauge,
  ChevronRight,
  ExternalLink,
  Video,
  Database,
  MessageSquare,
  Mail,
  Phone,
  Monitor,
  Smartphone,
  Eye,
  Gift,
  Trophy,
  BookOpen,
  Code,
  Download,
  Filter,
  Calendar,
  Clock,
  CreditCard,
  Building,
  Facebook,
  Twitter,
  Linkedin,
  Instagram
} from "lucide-react";
import { Link as RouterLink } from "wouter";

export default function DarkLanding() {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "IA Avançada",
      description: "Algoritmos inteligentes que otimizam automaticamente suas campanhas para máxima conversão",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Performance Extrema",
      description: "Carregamento instantâneo e processamento em tempo real para experiência fluida",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Segurança Total",
      description: "Proteção enterprise com criptografia end-to-end e conformidade LGPD",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Analytics Avançado",
      description: "Dashboards em tempo real com insights preditivos e análise de comportamento",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Segmentação Inteligente",
      description: "Público-alvo dinâmico com machine learning para personalização máxima",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Conversão Otimizada",
      description: "Testes A/B automáticos e otimização contínua para resultados superiores",
      gradient: "from-pink-500 to-rose-500"
    }
  ];

  const stats = [
    { value: "2.8M+", label: "Leads Capturados", icon: <Users className="w-5 h-5" /> },
    { value: "94%", label: "Taxa de Conversão", icon: <TrendingUp className="w-5 h-5" /> },
    { value: "15K+", label: "Empresas Ativas", icon: <Building className="w-5 h-5" /> },
    { value: "99.9%", label: "Uptime Garantido", icon: <Shield className="w-5 h-5" /> }
  ];

  const testimonials = [
    {
      name: "Carlos Mendoza",
      role: "CEO, TechFlow",
      content: "A Vendzz transformou nossa geração de leads. Aumentamos 340% em apenas 2 meses.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Ana Silva",
      role: "Marketing Director, InnovaLabs",
      content: "Interface incrível e resultados impressionantes. Nunca vi algo tão eficiente.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b67158bb?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Ricardo Santos",
      role: "Growth Hacker, StartupX",
      content: "A automação da Vendzz nos economiza 40 horas por semana. Simplesmente fantástico!",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    }
  ];

  const plans = [
    {
      name: "Starter",
      price: "R$ 97",
      period: "/mês",
      description: "Perfeito para começar sua jornada",
      features: [
        "5 Quizzes ativos",
        "1.000 leads/mês",
        "Analytics básico",
        "Suporte email",
        "Integrações básicas"
      ],
      highlight: false,
      buttonText: "Começar Agora"
    },
    {
      name: "Professional",
      price: "R$ 197",
      period: "/mês",
      description: "Para empresas em crescimento",
      features: [
        "25 Quizzes ativos",
        "10.000 leads/mês",
        "Analytics avançado",
        "Suporte prioritário",
        "Todas as integrações",
        "WhatsApp automático",
        "A/B Testing"
      ],
      highlight: true,
      buttonText: "Mais Popular"
    },
    {
      name: "Enterprise",
      price: "R$ 497",
      period: "/mês",
      description: "Para grandes volumes",
      features: [
        "Quizzes ilimitados",
        "Leads ilimitados",
        "Analytics premium",
        "Suporte 24/7",
        "API personalizada",
        "Gerente dedicado",
        "Customização total"
      ],
      highlight: false,
      buttonText: "Falar com Vendas"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          {/* Header */}
          <nav className="flex items-center justify-between mb-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Vendzz
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Recursos</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Preços</a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Depoimentos</a>
              <RouterLink to="/login">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none">
                  Entrar
                </Button>
              </RouterLink>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="text-center mb-20">
            <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-200 border-purple-500/30 mb-8">
              <Sparkles className="w-4 h-4 mr-2" />
              Plataforma Mais Avançada do Brasil
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Capture Leads que
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Realmente Convertem
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Plataforma de quiz funnels com IA que gera até <span className="text-purple-400 font-semibold">340% mais leads</span> 
              e automatiza todo seu processo de vendas com tecnologia de ponta.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
              <RouterLink to="/login">
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none px-8 py-4 text-lg">
                  <Play className="w-5 h-5 mr-2" />
                  Começar Gratuitamente
                </Button>
              </RouterLink>
              <Button size="lg" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg">
                <Video className="w-5 h-5 mr-2" />
                Ver Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-2 rounded-lg mr-2">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="relative max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-8 backdrop-blur-sm border border-purple-500/20">
              <div className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-sm text-gray-400">vendzz.com.br</div>
                </div>
                <div className="space-y-4">
                  <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg"></div>
                    <div className="h-20 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg"></div>
                    <div className="h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg"></div>
                  </div>
                  <div className="h-32 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg"></div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-8 -right-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold animate-bounce">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              +340% Conversão
            </div>
            <div className="absolute -bottom-8 -left-8 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-semibold animate-bounce delay-1000">
              <Zap className="w-4 h-4 inline mr-1" />
              IA Integrada
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 border-blue-500/30 mb-8">
              <Brain className="w-4 h-4 mr-2" />
              Tecnologia de Ponta
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Recursos que Revolucionam
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Sua Geração de Leads
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Tecnologia enterprise que grandes corporações usam, agora acessível para seu negócio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gray-900/50 border-gray-800 hover:border-purple-500/50 transition-all duration-300 backdrop-blur-sm group">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32 bg-gradient-to-b from-gray-900/50 to-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-200 border-green-500/30 mb-8">
              <Star className="w-4 h-4 mr-2" />
              Depoimentos Reais
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Resultados que Falam
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Por Si Só
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-sm text-gray-400">{testimonial.role}</div>
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{testimonial.content}</p>
                  <div className="flex mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-200 border-purple-500/30 mb-8">
              <CreditCard className="w-4 h-4 mr-2" />
              Planos Flexíveis
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Escolha o Plano
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Perfeito para Você
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Sem taxas ocultas, sem compromisso. Cancele quando quiser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`${
                plan.highlight 
                  ? 'bg-gradient-to-b from-purple-900/50 to-pink-900/50 border-purple-500/50 scale-105' 
                  : 'bg-gray-900/50 border-gray-800'
              } backdrop-blur-sm transition-all duration-300`}>
                <CardContent className="p-8">
                  {plan.highlight && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none mb-4">
                      Mais Popular
                    </Badge>
                  )}
                  <h3 className="text-2xl font-bold mb-4 text-white">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400">{plan.period}</span>
                  </div>
                  <p className="text-gray-300 mb-8">{plan.description}</p>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <RouterLink to="/login">
                    <Button className={`w-full ${
                      plan.highlight 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' 
                        : 'bg-gray-800 hover:bg-gray-700'
                    } text-white border-none`}>
                      {plan.buttonText}
                    </Button>
                  </RouterLink>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-r from-purple-900/50 via-blue-900/50 to-cyan-900/50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-500/10 to-pink-500/10"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Pronto para Revolucionar
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Sua Geração de Leads?
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Junte-se a mais de 15.000 empresas que já transformaram seus resultados com a Vendzz
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <RouterLink to="/login">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none px-8 py-4 text-lg">
                <Sparkles className="w-5 h-5 mr-2" />
                Começar Gratuitamente
              </Button>
            </RouterLink>
            <Button size="lg" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg">
              <Phone className="w-5 h-5 mr-2" />
              Falar com Especialista
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Vendzz
                </span>
              </div>
              <p className="text-gray-400 mb-4">
                A plataforma mais avançada para geração de leads do Brasil
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Produto</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Integrações</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Sobre</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Carreiras</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentação</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Termos</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 Vendzz. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}