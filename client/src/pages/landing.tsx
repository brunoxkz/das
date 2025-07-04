import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Vote, 
  Wand2, 
  Users, 
  BarChart3, 
  Palette, 
  Code, 
  Link, 
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
  Zap
} from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: <Wand2 className="w-5 h-5" />,
      title: "Criador Visual",
      description: "Interface drag-and-drop intuitiva para criar quizzes profissionais em minutos, sem código.",
      color: "bg-primary/10 text-primary"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Captura de Leads",
      description: "Sistema integrado de captura com formulários customizáveis e follow-up automático.",
      color: "bg-accent/10 text-accent"
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Analytics em Tempo Real",
      description: "Acompanhe métricas de conversão, taxa de conclusão e performance dos seus quizzes.",
      color: "bg-secondary/10 text-secondary"
    },
    {
      icon: <Palette className="w-5 h-5" />,
      title: "Templates Prontos",
      description: "Biblioteca com 100+ templates para diferentes setores e objetivos de negócio.",
      color: "bg-yellow-100 text-yellow-600"
    },
    {
      icon: <Code className="w-5 h-5" />,
      title: "Sistema de Embed",
      description: "Incorpore seus quizzes em qualquer website com código simples ou popup.",
      color: "bg-pink-100 text-pink-600"
    },
    {
      icon: <Link className="w-5 h-5" />,
      title: "Integrações",
      description: "Conecte com Mailchimp, HubSpot, Zapier e 1000+ ferramentas via API.",
      color: "bg-green-100 text-green-600"
    }
  ];

  const plans = [
    {
      name: "Starter",
      price: "R$ 97",
      period: "/mês",
      features: [
        "Até 5 quizzes ativos",
        "1.000 respostas/mês",
        "Templates básicos",
        "Analytics básico",
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
      features: [
        "Quizzes ilimitados",
        "10.000 respostas/mês",
        "Todos os templates",
        "Analytics avançado",
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
      features: [
        "Recursos ilimitados",
        "100.000 respostas/mês",
        "White-label",
        "API personalizada",
        "Gerente de conta",
        "Suporte 24/7"
      ],
      buttonText: "Falar com Vendas",
      buttonVariant: "secondary" as const,
      popular: false
    }
  ];

  const templates = [
    {
      title: "E-commerce",
      description: "Quiz de recomendação de produtos para aumentar vendas",
      badge: "Popular",
      badgeColor: "bg-blue-100 text-blue-600",
      gradient: "from-blue-400 to-purple-500",
      icon: "🛒"
    },
    {
      title: "SaaS",
      description: "Avaliação de necessidades para software B2B",
      badge: "Novo",
      badgeColor: "bg-green-100 text-green-600",
      gradient: "from-green-400 to-teal-500",
      icon: "📊"
    },
    {
      title: "Saúde & Fitness",
      description: "Quiz de diagnóstico de saúde e plano personalizado",
      badge: "Trending",
      badgeColor: "bg-pink-100 text-pink-600",
      gradient: "from-pink-400 to-red-500",
      icon: "❤️"
    }
  ];

  const stats = [
    { value: "2.847", label: "Leads Capturados" },
    { value: "64%", label: "Taxa de Conversão" }
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
                <span className="text-xl font-bold text-neutral-900">QuizFlow</span>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#features" className="text-gray-600 hover:text-primary transition-colors">Recursos</a>
                <a href="#pricing" className="text-gray-600 hover:text-primary transition-colors">Preços</a>
                <a href="#templates" className="text-gray-600 hover:text-primary transition-colors">Templates</a>
                <a href="#contact" className="text-gray-600 hover:text-primary transition-colors">Contato</a>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Globe className="w-4 h-4 mr-1" />
                PT
              </Button>
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/api/login'}>
                Entrar
              </Button>
              <Button size="sm" onClick={() => window.location.href = '/api/login'}>
                Teste Grátis
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-bg text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Crie Quiz Funnels que 
                <span className="text-yellow-300"> Convertem</span>
              </h1>
              <p className="text-xl mb-8 text-gray-100">
                Transforme visitantes em leads qualificados com quizzes interativos. Interface visual, templates prontos e analytics em tempo real.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  onClick={() => window.location.href = '/api/login'}
                  className="bg-white text-primary hover:bg-gray-50"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Começar Agora
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-primary"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Ver Demo
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
              </div>
            </div>

            <div className="relative">
              <Card className="transform rotate-3 hover:rotate-0 transition-transform duration-300 shadow-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Dashboard</h3>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {stats.map((stat, index) => (
                      <div key={index} className={`p-4 rounded-lg ${index === 0 ? 'bg-blue-50' : 'bg-green-50'}`}>
                        <div className={`text-2xl font-bold ${index === 0 ? 'text-primary' : 'text-accent'}`}>
                          {stat.value}
                        </div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gray-50 h-32 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-900">
              Recursos Poderosos para Maximizar Conversões
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tudo que você precisa para criar quiz funnels profissionais e capturar leads qualificados
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-neutral-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quiz Builder Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-900">
              Crie Quizzes Profissionais em Minutos
            </h2>
            <p className="text-xl text-gray-600">
              Interface visual e intuitiva para criar quiz funnels que convertem
            </p>
          </div>

          <Card className="bg-gray-50 shadow-lg">
            <CardContent className="p-8">
              <Card className="border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-lg font-semibold text-gray-900">Editor de Quiz</h3>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Publicado
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Play className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button size="sm">
                        <Zap className="w-4 h-4 mr-1" />
                        Salvar
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[500px]">
                  {/* Sidebar */}
                  <div className="lg:col-span-1 bg-gray-50 border-r border-gray-200 p-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Perguntas</h4>
                        <div className="space-y-2">
                          {["Qual seu principal objetivo?", "Qual seu orçamento?", "Resultado"].map((question, index) => (
                            <Card key={index} className={`p-3 cursor-pointer ${index === 2 ? 'bg-primary/10 border-primary' : 'hover:border-primary'} transition-colors`}>
                              <div className="flex items-center justify-between">
                                <span className={`text-sm font-medium ${index === 2 ? 'text-primary' : ''}`}>
                                  Pergunta {index + 1}
                                </span>
                                <div className="w-2 h-4 bg-gray-400 rounded-sm opacity-50"></div>
                              </div>
                              <p className={`text-xs mt-1 ${index === 2 ? 'text-primary' : 'text-gray-500'}`}>
                                {question}
                              </p>
                            </Card>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Elementos</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" size="sm" className="h-auto p-2 flex-col">
                            <Vote className="w-4 h-4 mb-1" />
                            <span className="text-xs">Pergunta</span>
                          </Button>
                          <Button variant="outline" size="sm" className="h-auto p-2 flex-col">
                            <span className="text-sm mb-1">🖼️</span>
                            <span className="text-xs">Imagem</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Editor */}
                  <div className="lg:col-span-3 p-6">
                    <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                      <div className="max-w-md mx-auto">
                        <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <Vote className="text-primary text-2xl" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-900">Qual seu principal objetivo?</h3>
                        <p className="text-gray-600 mb-6">Selecione a opção que melhor descreve sua situação atual</p>

                        <div className="space-y-3">
                          {["Aumentar vendas online", "Capturar mais leads", "Melhorar engajamento"].map((option, index) => (
                            <Button
                              key={index}
                              variant={index === 1 ? "default" : "outline"}
                              className="w-full justify-start"
                              size="lg"
                            >
                              <div className={`w-4 h-4 rounded-full mr-3 ${index === 1 ? 'bg-white' : 'border-2 border-gray-300'}`} />
                              {option}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-900">
              Planos que Crescem com seu Negócio
            </h2>
            <p className="text-xl text-gray-600">
              Escolha o plano ideal para suas necessidades
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`card-hover relative ${plan.popular ? 'ring-2 ring-primary shadow-lg' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white px-4 py-1">
                      Mais Popular
                    </Badge>
                  </div>
                )}

                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-semibold mb-2 text-neutral-900">{plan.name}</h3>
                    <div className="text-4xl font-bold text-primary mb-2">{plan.price}</div>
                    <div className="text-gray-600">{plan.period}</div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="text-accent mr-3 w-4 h-4" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full" 
                    variant={plan.buttonVariant}
                    size="lg"
                    onClick={() => window.location.href = '/api/login'}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-900">
              Templates para Cada Setor
            </h2>
            <p className="text-xl text-gray-600">
              Comece rapidamente com templates otimizados para conversão
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((template, index) => (
              <Card key={index} className="overflow-hidden card-hover">
                <div className={`bg-gradient-to-br ${template.gradient} h-48 flex items-center justify-center`}>
                  <Card className="bg-white p-4 max-w-[200px] mx-auto">
                    <CardContent className="p-0 text-center">
                      <div className="text-2xl mb-2">{template.icon}</div>
                      <h4 className="text-sm font-semibold mb-2">Quiz de {template.title}</h4>
                      <div className="space-y-1">
                        <div className="w-full h-2 bg-gray-100 rounded"></div>
                        <div className="w-3/4 h-2 bg-gray-100 rounded"></div>
                        <div className="w-1/2 h-2 bg-gray-100 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-neutral-900">{template.title}</h3>
                    <Badge className={template.badgeColor}>{template.badge}</Badge>
                  </div>
                  <p className="text-gray-600 mb-4">{template.description}</p>
                  <Button variant="outline" className="w-full">
                    Usar Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" onClick={() => window.location.href = '/api/login'}>
              Ver Todos os Templates
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-bg text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Comece a Capturar Leads Hoje
          </h2>
          <p className="text-xl mb-8 text-gray-100">
            Junte-se a milhares de empresas que já transformaram visitantes em clientes com nossos quiz funnels
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Button 
              size="lg" 
              variant="secondary" 
              onClick={() => window.location.href = '/api/login'}
              className="bg-white text-primary hover:bg-gray-50"
            >
              Teste Grátis por 14 Dias
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-primary"
            >
              Agendar Demo
            </Button>
          </div>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-200">
            <span className="flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Dados seguros
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Setup em 5 minutos
            </span>
            <span className="flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              Sem compromisso
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Vote className="text-primary text-2xl mr-2" />
                <span className="text-xl font-bold">QuizFlow</span>
              </div>
              <p className="text-gray-400 mb-4">
                A plataforma líder para criação de quiz funnels que convertem visitantes em leads qualificados.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                  <Linkedin className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                  <Instagram className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {[
              {
                title: "Produto",
                links: ["Recursos", "Templates", "Integrações", "API"]
              },
              {
                title: "Empresa",
                links: ["Sobre", "Blog", "Carreiras", "Contato"]
              },
              {
                title: "Suporte",
                links: ["Central de Ajuda", "Tutoriais", "Status", "Segurança"]
              }
            ].map((section, index) => (
              <div key={index}>
                <h4 className="font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2 text-gray-400">
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

          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 QuizFlow. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}