import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  BookOpen, 
  Video, 
  FileText, 
  Settings, 
  Palette, 
  BarChart3,
  Users,
  Play,
  CheckCircle,
  Plus,
  Edit,
  Eye,
  Image,
  MousePointer,
  Hash,
  Mail,
  Phone,
  Calendar,
  Star,
  Upload,
  Type,
  Divide,
  Zap,
  Timer,
  ArrowRight,
  Globe,
  Smartphone,
  Target
} from "lucide-react";

export default function Tutoriais() {
  const [activeSection, setActiveSection] = useState("introducao");

  const tutorialSections = [
    {
      id: "introducao",
      title: "Introdução ao Vendzz",
      icon: <BookOpen className="w-5 h-5" />,
      description: "Entenda como criar quizzes eficazes para captura de leads"
    },
    {
      id: "elementos",
      title: "Elementos do Quiz",
      icon: <Settings className="w-5 h-5" />,
      description: "Aprenda sobre cada elemento disponível no editor"
    },
    {
      id: "transicoes",
      title: "Páginas de Transição",
      icon: <Zap className="w-5 h-5" />,
      description: "Como criar experiências fluidas entre perguntas"
    },
    {
      id: "branding",
      title: "Personalização e Branding",
      icon: <Palette className="w-5 h-5" />,
      description: "Configure visual, cores e marca do seu quiz"
    },
    {
      id: "publicacao",
      title: "Publicação e Compartilhamento",
      icon: <Globe className="w-5 h-5" />,
      description: "Como publicar e compartilhar seus quizzes"
    },
    {
      id: "analytics",
      title: "Analytics e Resultados",
      icon: <BarChart3 className="w-5 h-5" />,
      description: "Acompanhe performance e gerencie leads"
    }
  ];

  const elementos = [
    {
      categoria: "Conteúdo",
      items: [
        {
          name: "Título",
          icon: <Type className="w-4 h-4" />,
          description: "Adiciona títulos e cabeçalhos",
          uso: "Use para introduzir seções ou dar destaque a informações importantes",
          exemplo: "Bem-vindo ao Quiz de Personalidade!"
        },
        {
          name: "Parágrafo",
          icon: <FileText className="w-4 h-4" />,
          description: "Texto explicativo ou descritivo",
          uso: "Ideal para instruções, descrições ou contexto adicional",
          exemplo: "Responda as perguntas a seguir para descobrir seu perfil ideal de investidor."
        },
        {
          name: "Imagem",
          icon: <Image className="w-4 h-4" />,
          description: "Adiciona imagens ao quiz",
          uso: "Use para tornar o quiz mais visual e atrativo",
          exemplo: "Adicione uma imagem de capa ou ilustração explicativa"
        },
        {
          name: "Vídeo",
          icon: <Video className="w-4 h-4" />,
          description: "Embeds de YouTube, Vimeo, TikTok e Instagram",
          uso: "Perfeito para explicações em vídeo ou conteúdo interativo",
          exemplo: "https://www.youtube.com/watch?v=exemplo"
        },
        {
          name: "Divisor",
          icon: <Divide className="w-4 h-4" />,
          description: "Linha de separação visual",
          uso: "Para separar seções ou criar pausas visuais",
          exemplo: "Entre diferentes grupos de perguntas"
        }
      ]
    },
    {
      categoria: "Perguntas",
      items: [
        {
          name: "Múltipla Escolha",
          icon: <MousePointer className="w-4 h-4" />,
          description: "Opções de escolha única ou múltipla",
          uso: "Para perguntas com opções predefinidas",
          exemplo: "Qual seu objetivo principal com investimentos? (Renda, Crescimento, Preservação)"
        },
        {
          name: "Avaliação",
          icon: <Star className="w-4 h-4" />,
          description: "Sistema de estrelas ou escala numérica",
          uso: "Para avaliar satisfação, qualidade ou preferências",
          exemplo: "Como você avalia nosso atendimento? (1-5 estrelas)"
        },
        {
          name: "Texto",
          icon: <Type className="w-4 h-4" />,
          description: "Campo de texto livre",
          uso: "Para respostas abertas e personalizadas",
          exemplo: "Descreva seu maior desafio financeiro atual"
        },
        {
          name: "Texto Longo",
          icon: <FileText className="w-4 h-4" />,
          description: "Área de texto expandida",
          uso: "Para feedback detalhado ou histórias pessoais",
          exemplo: "Conte-nos sobre sua experiência com investimentos"
        },
        {
          name: "Checkbox",
          icon: <CheckCircle className="w-4 h-4" />,
          description: "Caixas de seleção múltipla",
          uso: "Para múltiplas seleções ou confirmações",
          exemplo: "Quais investimentos você já possui? (Ações, Fundos, Tesouro)"
        }
      ]
    },
    {
      categoria: "Formulário",
      items: [
        {
          name: "Email",
          icon: <Mail className="w-4 h-4" />,
          description: "Campo específico para email",
          uso: "Essencial para captura de leads e contato",
          exemplo: "Digite seu email para receber o resultado"
        },
        {
          name: "Telefone",
          icon: <Phone className="w-4 h-4" />,
          description: "Campo formatado para telefone",
          uso: "Para contato direto via WhatsApp ou ligação",
          exemplo: "(11) 99999-9999"
        },
        {
          name: "Data",
          icon: <Calendar className="w-4 h-4" />,
          description: "Seletor de data",
          uso: "Para idades, datas importantes ou agendamentos",
          exemplo: "Quando você pretende se aposentar?"
        },
        {
          name: "Número",
          icon: <Hash className="w-4 h-4" />,
          description: "Campo numérico com validação",
          uso: "Para valores, idades, quantidades",
          exemplo: "Qual sua renda mensal?"
        },
        {
          name: "Data Nascimento",
          icon: <Calendar className="w-4 h-4" />,
          description: "Campo específico para nascimento",
          uso: "Calcula idade automaticamente",
          exemplo: "Para personalizar recomendações por faixa etária"
        },
        {
          name: "Altura",
          icon: <ArrowRight className="w-4 h-4" />,
          description: "Campo para altura com unidades",
          uso: "Em quizzes de saúde, fitness ou bem-estar",
          exemplo: "1,75m ou 175cm"
        },
        {
          name: "Peso Atual",
          icon: <Target className="w-4 h-4" />,
          description: "Campo para peso com validação",
          uso: "Para cálculos de IMC e recomendações de saúde",
          exemplo: "70kg - pode calcular IMC automaticamente"
        },
        {
          name: "Peso Meta",
          icon: <Target className="w-4 h-4" />,
          description: "Objetivo de peso desejado",
          uso: "Para planos de emagrecimento ou ganho muscular",
          exemplo: "Comparar com peso atual para sugerir estratégias"
        },
        {
          name: "Upload Imagem",
          icon: <Upload className="w-4 h-4" />,
          description: "Upload de arquivos de imagem",
          uso: "Para portfolio, antes/depois, documentos",
          exemplo: "Envie uma foto do seu sorriso atual"
        }
      ]
    }
  ];

  const elementosTransicao = [
    {
      name: "Fundo",
      icon: <Palette className="w-4 h-4" />,
      description: "Define cor sólida, gradiente ou imagem de fundo",
      uso: "Cria impacto visual entre seções do quiz",
      exemplo: "Gradiente verde para transmitir crescimento"
    },
    {
      name: "Texto",
      icon: <Type className="w-4 h-4" />,
      description: "Texto formatado com efeitos visuais",
      uso: "Mensagens motivacionais ou explicativas",
      exemplo: "Analisando suas respostas..."
    },
    {
      name: "Contador",
      icon: <Timer className="w-4 h-4" />,
      description: "Cronômetro regressivo ou progressivo",
      uso: "Criar urgência ou mostrar progresso",
      exemplo: "Oferta expira em: 05:30"
    },
    {
      name: "Carregamento",
      icon: <Zap className="w-4 h-4" />,
      description: "Animações de loading com texto alternado",
      uso: "Simular processamento de dados",
      exemplo: "Calculando seu perfil... / Analisando respostas..."
    },
    {
      name: "Redirecionamento",
      icon: <ArrowRight className="w-4 h-4" />,
      description: "Redireciona para próxima página ou URL externa",
      uso: "Levar para resultado final ou página de vendas",
      exemplo: "Redirecionamento automático em 3 segundos"
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          📚 Central de Tutoriais Vendzz
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Aprenda a criar quizzes profissionais que capturam leads e geram resultados. 
          Guias completos com exemplos práticos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Seções</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tutorialSections.map((section) => (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "default" : "ghost"}
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => setActiveSection(section.id)}
                >
                  <div className="flex items-start gap-3">
                    {section.icon}
                    <div>
                      <div className="font-medium">{section.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {section.description}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Introdução */}
          {activeSection === "introducao" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Introdução ao Vendzz
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose max-w-none">
                    <h3>O que é o Vendzz?</h3>
                    <p>
                      O Vendzz é uma plataforma moderna de criação de quizzes focada na captura de leads 
                      e geração de resultados para o seu negócio. Com nossa interface intuitiva, você pode 
                      criar experiências interativas que engajam seu público e coletam informações valiosas.
                    </p>

                    <h3>Por que usar Quizzes para Leads?</h3>
                    <ul>
                      <li><strong>Engajamento Alto:</strong> Quizzes têm taxa de conclusão 85% maior que formulários tradicionais</li>
                      <li><strong>Dados Qualificados:</strong> Você conhece seu lead antes mesmo do primeiro contato</li>
                      <li><strong>Experiência Divertida:</strong> Torna a captura de lead uma experiência positiva</li>
                      <li><strong>Segmentação Natural:</strong> Diferentes resultados para diferentes perfis de cliente</li>
                    </ul>

                    <h3>Estrutura de um Quiz Eficaz</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                      <div className="bg-green-50 p-4 rounded-lg border">
                        <h4 className="font-semibold text-green-800">1. Abertura</h4>
                        <p className="text-sm text-green-600">Título atrativo + promessa de valor</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg border">
                        <h4 className="font-semibold text-blue-800">2. Perguntas</h4>
                        <p className="text-sm text-blue-600">5-10 perguntas engajantes</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg border">
                        <h4 className="font-semibold text-purple-800">3. Resultado</h4>
                        <p className="text-sm text-purple-600">Valor + captura de contato</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🎯 Exemplo Prático: Quiz de Investimentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Título:</h4>
                      <p>"Descubra Seu Perfil de Investidor em 2 Minutos"</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Perguntas Exemplo:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Qual sua faixa etária?</li>
                        <li>Qual sua experiência com investimentos?</li>
                        <li>Como você reage a oscilações no mercado?</li>
                        <li>Qual seu objetivo principal?</li>
                        <li>Qual sua renda mensal aproximada?</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Resultado:</h4>
                      <p>"Parabéns! Você é um investidor MODERADO. Baixe nosso e-book gratuito com estratégias personalizadas."</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Elementos */}
          {activeSection === "elementos" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Guia Completo dos Elementos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-6">
                    Cada elemento tem uma função específica na criação da experiência do usuário. 
                    Aprenda quando e como usar cada um.
                  </p>
                </CardContent>
              </Card>

              {elementos.map((categoria, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-lg">{categoria.categoria}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {categoria.items.map((elemento, elemIdx) => (
                        <AccordionItem key={elemIdx} value={`item-${idx}-${elemIdx}`}>
                          <AccordionTrigger className="flex items-center gap-2">
                            <div className="flex items-center gap-3">
                              {elemento.icon}
                              <span className="font-medium">{elemento.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {categoria.categoria}
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">O que faz:</h4>
                              <p className="text-gray-600">{elemento.description}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Quando usar:</h4>
                              <p className="text-gray-600">{elemento.uso}</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                              <h4 className="font-semibold text-green-800 mb-2">💡 Exemplo:</h4>
                              <p className="text-green-700 text-sm">{elemento.exemplo}</p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Transições */}
          {activeSection === "transicoes" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Páginas de Transição
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p>
                      As páginas de transição criam experiências fluidas e profissionais entre as perguntas do seu quiz. 
                      Elas mantêm o usuário engajado e podem ser usadas para:
                    </p>
                    <ul>
                      <li>Criar suspense antes do resultado</li>
                      <li>Simular processamento de dados</li>
                      <li>Adicionar elementos de urgência</li>
                      <li>Preparar o usuário para a próxima seção</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Elementos de Transição</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {elementosTransicao.map((elemento, idx) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-3">
                          {elemento.icon}
                          <div>
                            <h4 className="font-semibold">{elemento.name}</h4>
                            <p className="text-gray-600 text-sm">{elemento.description}</p>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded text-sm">
                          <strong>Uso:</strong> {elemento.uso}
                        </div>
                        <div className="bg-blue-50 p-3 rounded text-sm mt-2">
                          <strong>Exemplo:</strong> {elemento.exemplo}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🎬 Sequência de Transição Recomendada</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                      <span>Última pergunta respondida</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                      <span>Página de transição com loading ("Analisando suas respostas...")</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                      <span>Texto motivacional ("Quase pronto! Seu resultado será incrível...")</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                      <span>Redirecionamento automático para página de resultado</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Branding */}
          {activeSection === "branding" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Personalização e Branding
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-6">
                    Configure a identidade visual do seu quiz para refletir sua marca e criar uma experiência consistente.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Opções de Branding</h3>
                      
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">🎨 Logo Flutuante</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Adicione seu logo que aparece discretamente sobre as perguntas
                        </p>
                        <div className="bg-gray-50 p-2 rounded text-xs">
                          Formato: PNG/SVG | Tamanho: 200x80px recomendado
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">📊 Barra de Progresso</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Defina a cor da barra que mostra o progresso do quiz
                        </p>
                        <div className="bg-gray-50 p-2 rounded text-xs">
                          Cor padrão: #10b981 (Verde Vendzz)
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">🔘 Cor dos Botões</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Personalize a cor de todos os botões do quiz
                        </p>
                        <div className="bg-gray-50 p-2 rounded text-xs">
                          Aplica a: Botões de resposta, "Próximo", "Finalizar"
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">🌐 Favicon</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Ícone que aparece na aba do navegador
                        </p>
                        <div className="bg-gray-50 p-2 rounded text-xs">
                          Formato: ICO/PNG | Tamanho: 32x32px
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">SEO e Meta Tags</h3>
                      
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">📝 Título SEO</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Título que aparece no Google e redes sociais
                        </p>
                        <div className="bg-gray-50 p-2 rounded text-xs">
                          Máximo: 60 caracteres | Inclua palavras-chave
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">📖 Descrição SEO</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Descrição que aparece nos resultados de busca
                        </p>
                        <div className="bg-gray-50 p-2 rounded text-xs">
                          Máximo: 160 caracteres | Chame para ação
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">🏷️ Palavras-chave</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Tags para melhor indexação
                        </p>
                        <div className="bg-gray-50 p-2 rounded text-xs">
                          Separe por vírgulas | Máximo: 10 palavras
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">📱 Redes Sociais</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Preview otimizado para compartilhamento
                        </p>
                        <div className="bg-gray-50 p-2 rounded text-xs">
                          Open Graph tags automáticas
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🎯 Tracking e Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">📘 Facebook Pixel</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        ID do pixel para remarketing
                      </p>
                      <div className="bg-gray-50 p-2 rounded text-xs">
                        Formato: 1234567890123456
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">🔍 Google Pixel</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Google Ads tracking
                      </p>
                      <div className="bg-gray-50 p-2 rounded text-xs">
                        Formato: AW-1234567890
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">📊 Google Analytics</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        GA4 Measurement ID
                      </p>
                      <div className="bg-gray-50 p-2 rounded text-xs">
                        Formato: G-XXXXXXXXXX
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">💡 Script Personalizado</h4>
                    <p className="text-blue-700 text-sm">
                      Adicione códigos JavaScript personalizados no &lt;head&gt; para integrações avançadas, 
                      chatbots ou outras ferramentas de marketing.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Publicação */}
          {activeSection === "publicacao" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Publicação e Compartilhamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="prose max-w-none">
                    <h3>Como Publicar Seu Quiz</h3>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Finalize a criação do seu quiz com todas as perguntas</li>
                      <li>Configure as opções de branding e tracking</li>
                      <li>Clique em "Publicar" no editor</li>
                      <li>Seu quiz estará disponível em uma URL única</li>
                    </ol>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">🌐 Link Direto</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Compartilhe o link direto do seu quiz
                      </p>
                      <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                        vendzz.app/quiz/abc123def
                      </div>
                      <div className="mt-2 space-x-2">
                        <Badge variant="outline">WhatsApp</Badge>
                        <Badge variant="outline">Email</Badge>
                        <Badge variant="outline">SMS</Badge>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">📱 Código Embed</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Incorpore o quiz em seu site
                      </p>
                      <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                        &lt;iframe src="..." /&gt;
                      </div>
                      <div className="mt-2 space-x-2">
                        <Badge variant="outline">WordPress</Badge>
                        <Badge variant="outline">Landing Page</Badge>
                        <Badge variant="outline">Blog</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">⚡ Dicas de Distribuição</h4>
                    <ul className="text-yellow-700 text-sm space-y-1">
                      <li>• Compartilhe em stories do Instagram com call-to-action</li>
                      <li>• Adicione link na bio das redes sociais</li>
                      <li>• Inclua em assinaturas de email</li>
                      <li>• Use em campanhas de Facebook e Google Ads</li>
                      <li>• Incorpore em pop-ups do site</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Analytics */}
          {activeSection === "analytics" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Analytics e Gestão de Leads
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="prose max-w-none">
                    <h3>Acompanhe a Performance</h3>
                    <p>
                      O Vendzz fornece métricas detalhadas para você otimizar seus quizzes e maximizar a conversão.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                      <Eye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-blue-800">Visualizações</h4>
                      <p className="text-blue-600 text-sm">Quantas pessoas viram seu quiz</p>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-green-800">Conclusões</h4>
                      <p className="text-green-600 text-sm">Quantos completaram todo o quiz</p>
                    </div>
                    
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                      <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-purple-800">Conversão</h4>
                      <p className="text-purple-600 text-sm">Taxa de captura de leads</p>
                    </div>
                    
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                      <Mail className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-orange-800">Leads</h4>
                      <p className="text-orange-600 text-sm">Contatos capturados</p>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">📊 Relatórios Disponíveis</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm">Respostas por pergunta - veja onde as pessoas abandonam</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm">Dados demográficos dos respondentes</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm">Origem do tráfego (redes sociais, email, etc.)</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm">Tempo médio de conclusão</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm">Dispositivos utilizados (mobile/desktop)</span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">🎯 Gestão de Leads</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2">Exportação de Dados</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Excel/CSV com todas as respostas</li>
                          <li>• Filtros por data e perfil</li>
                          <li>• Segmentação automática</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Integrações</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Envio automático para CRM</li>
                          <li>• Webhook para sistemas externos</li>
                          <li>• Email marketing automation</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">🚀 Dicas para Melhorar Conversão</h4>
                    <ul className="text-green-700 text-sm space-y-1">
                      <li>• Mantenha o quiz entre 5-8 perguntas para maior conclusão</li>
                      <li>• Use perguntas abertas no início para engajamento</li>
                      <li>• Ofereça algo de valor em troca do email (e-book, desconto, consultoria)</li>
                      <li>• Teste diferentes títulos e promessas de valor</li>
                      <li>• Otimize para mobile - 70% dos usuários estão no celular</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}