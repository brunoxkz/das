import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Shield, 
  Star, 
  ArrowRight, 
  Play, 
  Sparkles,
  TrendingUp,
  Users,
  Target,
  Brain,
  Layers,
  Trophy,
  Building,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Chrome,
  Palette,
  BarChart4,
  MessageCircle,
  Mail,
  Phone,
  Gamepad2,
  Flame,
  Cpu,
  Rocket,
  Database
} from "lucide-react";
import { Link as RouterLink } from "wouter";

export default function ModernHome() {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Quiz Inteligente com IA",
      description: "Algoritmos avançados que personalizam perguntas baseadas no comportamento do usuário para máxima conversão",
      gradient: "from-purple-500 to-pink-500",
      stats: "+340% conversão"
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "WhatsApp Automation",
      description: "Sistema completo de automação WhatsApp com mensagens rotativas, anti-ban e Chrome Extension",
      gradient: "from-green-500 to-emerald-500",
      stats: "50+ msg/dia"
    },
    {
      icon: <BarChart4 className="w-8 h-8" />,
      title: "Analytics Avançado",
      description: "Dashboards em tempo real com insights preditivos, funis de conversão e análise de abandono",
      gradient: "from-blue-500 to-cyan-500",
      stats: "Tempo real"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Sistema de Premiações",
      description: "Gamificação completa com rankings, medalhas e premiações para aumentar engajamento",
      gradient: "from-yellow-500 to-orange-500",
      stats: "+40% engajamento"
    },
    {
      icon: <Mail className="w-8 h-8" />,
      title: "Email Marketing",
      description: "Campanhas automatizadas com segmentação inteligente e templates responsivos",
      gradient: "from-indigo-500 to-purple-500",
      stats: "90% entrega"
    },
    {
      icon: <Phone className="w-8 h-8" />,
      title: "SMS Marketing",
      description: "Disparos em massa com validação de números e sistema de créditos integrado",
      gradient: "from-red-500 to-rose-500",
      stats: "98% abertura"
    },
    {
      icon: <Layers className="w-8 h-8" />,
      title: "Páginas de Transição",
      description: "Elementos avançados com loading, contadores, redirecionamentos e animações",
      gradient: "from-teal-500 to-cyan-500",
      stats: "-25% abandono"
    },
    {
      icon: <Gamepad2 className="w-8 h-8" />,
      title: "Jogos Interativos",
      description: "6 tipos de jogos: roleta, raspadinha, quebra-tijolos, memory, slots e seletor de cores",
      gradient: "from-pink-500 to-rose-500",
      stats: "6 jogos"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Lead Scoring",
      description: "Sistema inteligente de pontuação que identifica leads mais qualificados automaticamente",
      gradient: "from-amber-500 to-yellow-500",
      stats: "Score IA"
    },
    {
      icon: <Chrome className="w-8 h-8" />,
      title: "Chrome Extension",
      description: "Extensão oficial para automação direta no WhatsApp Web com sidebar integrada",
      gradient: "from-slate-500 to-gray-500",
      stats: "Automação total"
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "CRM Integrado",
      description: "Gestão completa de leads com histórico, segmentação e pipeline de vendas",
      gradient: "from-violet-500 to-purple-500",
      stats: "Leads infinitos"
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "30+ Elementos",
      description: "Biblioteca completa com textos, imagens, vídeos, formulários, jogos e elementos especiais",
      gradient: "from-emerald-500 to-teal-500",
      stats: "30+ elementos"
    }
  ];

  const stats = [
    { value: "2.8M+", label: "Leads Capturados", icon: <Users className="w-6 h-6" /> },
    { value: "94%", label: "Taxa de Conversão", icon: <TrendingUp className="w-6 h-6" /> },
    { value: "15K+", label: "Empresas Ativas", icon: <Building className="w-6 h-6" /> },
    { value: "99.9%", label: "Uptime Garantido", icon: <Shield className="w-6 h-6" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/3 left-1/2 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl animate-pulse delay-3000"></div>
      </div>

      {/* Laser Beam Effect */}
      <div className="absolute top-0 left-1/2 w-1 h-full bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent transform -translate-x-1/2 animate-pulse"></div>
      
      {/* Header */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div className="text-3xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Vendzz
          </div>
        </div>
        
        <div className="flex items-center space-x-8">
          <a href="#features" className="text-gray-300 hover:text-green-400 transition-colors font-medium">Recursos</a>
          <a href="#pricing" className="text-gray-300 hover:text-green-400 transition-colors font-medium">Preços</a>
          <a href="#demo" className="text-gray-300 hover:text-green-400 transition-colors font-medium">Demo</a>
          <RouterLink to="/login">
            <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-none px-6 py-3 rounded-xl font-semibold shadow-lg shadow-green-500/25">
              Entrar
            </Button>
          </RouterLink>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30 mb-8 px-6 py-3 text-lg">
            <Rocket className="w-5 h-5 mr-2" />
            Plataforma Mais Avançada do Brasil
          </Badge>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent">
              Tudo que Você Precisa
            </span>
            <br />
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              para Gerar Leads
            </span>
          </h1>
          
          <p className="text-2xl md:text-3xl text-gray-300 mb-16 max-w-5xl mx-auto leading-relaxed">
            Plataforma completa com <span className="text-green-400 font-semibold">Quiz + WhatsApp + Email + SMS + Analytics</span> 
            <br />que automatiza todo seu processo de vendas em um só lugar
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-20">
            <RouterLink to="/login">
              <Button 
                size="lg" 
                className="group relative bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-none px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl shadow-green-500/30 transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <Flame className="w-6 h-6 mr-3 relative z-10" />
                <span className="relative z-10">Começar Gratuitamente</span>
              </Button>
            </RouterLink>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-green-500/50 bg-green-500/10 text-green-300 hover:bg-green-500/20 hover:border-green-400 px-12 py-6 text-xl font-bold rounded-2xl backdrop-blur-sm transition-all duration-300"
            >
              <Play className="w-6 h-6 mr-3" />
              Ver Demo Completa
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-20">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 bg-gray-800/30 rounded-2xl backdrop-blur-sm border border-gray-700/30">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-3 rounded-xl">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Dashboard Preview */}
          <div className="relative max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-cyan-500/10 rounded-3xl p-8 backdrop-blur-sm border border-green-500/20 shadow-2xl">
              <div className="bg-gray-900/80 rounded-2xl p-8 backdrop-blur-sm border border-gray-700/30">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-sm text-gray-400 font-mono">vendzz.com.br</div>
                </div>
                
                <div className="space-y-6">
                  <div className="h-3 bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 rounded-full"></div>
                  
                  <div className="grid grid-cols-4 gap-4">
                    <div className="h-24 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30"></div>
                    <div className="h-24 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30"></div>
                    <div className="h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30"></div>
                    <div className="h-24 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30"></div>
                  </div>
                  
                  <div className="h-40 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl border border-gray-600/30"></div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/30"></div>
                    <div className="h-32 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-xl border border-pink-500/30"></div>
                    <div className="h-32 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-xl border border-teal-500/30"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-12 -right-12 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full text-lg font-bold shadow-xl animate-bounce">
              <TrendingUp className="w-5 h-5 inline mr-2" />
              +340% Conversão
            </div>
            <div className="absolute -bottom-12 -left-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full text-lg font-bold shadow-xl animate-bounce delay-1000">
              <Brain className="w-5 h-5 inline mr-2" />
              IA Integrada
            </div>
            <div className="absolute top-1/2 -right-16 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-full text-lg font-bold shadow-xl animate-bounce delay-2000">
              <Zap className="w-5 h-5 inline mr-2" />
              Automação Total
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-900/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-8">
          <div className="text-center mb-20">
            <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30 mb-8 px-6 py-3 text-lg">
              <Cpu className="w-5 h-5 mr-2" />
              Funcionalidades Completas
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Tudo Integrado em
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Uma Plataforma
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Não precisa mais de 10 ferramentas diferentes. Tudo que você precisa para gerar e converter leads está aqui.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group bg-gray-900/50 border-gray-800/50 hover:border-green-500/50 transition-all duration-500 backdrop-blur-sm hover:bg-gray-800/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 to-emerald-500/0 group-hover:from-green-500/5 group-hover:to-emerald-500/5 transition-all duration-500"></div>
                <CardContent className="p-8 relative">
                  <div className={`w-18 h-18 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white group-hover:text-green-300 transition-colors">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed mb-4">{feature.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      {feature.stats}
                    </Badge>
                    <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-green-400 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-r from-green-900/20 via-emerald-900/20 to-cyan-900/20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-green-500/10 to-emerald-500/10"></div>
        </div>
        <div className="relative max-w-5xl mx-auto px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-8">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Pronto para Revolucionar
            </span>
            <br />
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Sua Geração de Leads?
            </span>
          </h2>
          <p className="text-2xl text-gray-300 mb-16 max-w-3xl mx-auto leading-relaxed">
            Mais de 15.000 empresas já transformaram seus resultados com nossa plataforma completa
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <RouterLink to="/login">
              <Button 
                size="lg" 
                className="group relative bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-none px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl shadow-green-500/30 transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <Sparkles className="w-6 h-6 mr-3 relative z-10" />
                <span className="relative z-10">Começar Gratuitamente</span>
              </Button>
            </RouterLink>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-green-500/50 bg-green-500/10 text-green-300 hover:bg-green-500/20 hover:border-green-400 px-12 py-6 text-xl font-bold rounded-2xl backdrop-blur-sm transition-all duration-300"
            >
              <Phone className="w-6 h-6 mr-3" />
              Falar com Especialista
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900/80 py-16 border-t border-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Vendzz
                </span>
              </div>
              <p className="text-gray-400 mb-6">
                A plataforma mais completa para geração e conversão de leads do Brasil
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                  <Linkedin className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Produto</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Quiz Builder</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">WhatsApp Automation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Email Marketing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">SMS Marketing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Analytics</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Recursos</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Chrome Extension</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Templates</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Integrações</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">API</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Tutoriais</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Documentação</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Contato</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Status</a></li>
                <li><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Termos</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800/50 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 Vendzz. Todos os direitos reservados. Transformando leads em vendas desde 2024.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}