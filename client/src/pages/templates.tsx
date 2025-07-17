import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
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
  Utensils,
  Eye,
  CheckCircle,
  AlertTriangle,
  Dumbbell,
  Palette,
  Car,
  GamepadIcon,
  Music,
  Camera,
  Coffee,
  Globe,
  Plane,
  Baby,
  MapPin,
  PieChart,
  Clock,
  Shield,
  Leaf,
  Smartphone
} from "lucide-react";

export default function Templates() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const { data: templates, isLoading } = useQuery({
    queryKey: ["/api/templates"],
    retry: false,
  });

  const categories = [
    { id: "all", label: t("templates.all"), icon: <Filter className="w-4 h-4" /> },
    { id: "ecommerce", label: t("templates.ecommerce"), icon: <ShoppingCart className="w-4 h-4" /> },
    { id: "saas", label: t("templates.saas"), icon: <TrendingUp className="w-4 h-4" /> },
    { id: "health", label: t("templates.health"), icon: <Heart className="w-4 h-4" /> },
    { id: "education", label: t("templates.education"), icon: <GraduationCap className="w-4 h-4" /> },
    { id: "business", label: t("templates.business"), icon: <Building className="w-4 h-4" /> },
    { id: "real-estate", label: t("templates.realEstate"), icon: <Home className="w-4 h-4" /> },
    { id: "finance", label: t("templates.finance"), icon: <Briefcase className="w-4 h-4" /> },
    { id: "food", label: t("templates.food"), icon: <Utensils className="w-4 h-4" /> },
    { id: "fitness", label: t("templates.fitness"), icon: <Dumbbell className="w-4 h-4" /> },
    { id: "design", label: t("templates.design"), icon: <Palette className="w-4 h-4" /> },
    { id: "automotive", label: t("templates.automotive"), icon: <Car className="w-4 h-4" /> },
    { id: "gaming", label: t("templates.gaming"), icon: <GamepadIcon className="w-4 h-4" /> },
    { id: "music", label: t("templates.music"), icon: <Music className="w-4 h-4" /> },
    { id: "photography", label: t("templates.photography"), icon: <Camera className="w-4 h-4" /> },
    { id: "lifestyle", label: t("templates.lifestyle"), icon: <Coffee className="w-4 h-4" /> },
    { id: "travel", label: t("templates.travel"), icon: <Plane className="w-4 h-4" /> },
    { id: "technology", label: t("templates.technology"), icon: <Smartphone className="w-4 h-4" /> },
  ];

  // Comprehensive 50 templates with complete structures
  const mockTemplates = [
    // E-COMMERCE (10 templates)
    {
      id: 1,
      name: "Quiz de Produto E-commerce",
      description: "Recomende produtos baseado nas preferências do cliente",
      category: "ecommerce",
      thumbnail: "🛒",
      isPopular: true,
      structure: {
        pages: [
          {
            id: 1,
            title: "Página 1",
            elements: [
              { id: 1, type: "heading", properties: { text: "Encontre o produto perfeito para você!", size: "large" } },
              { id: 2, type: "multiple_choice", properties: { question: "Qual categoria mais te interessa?", options: ["Roupas", "Eletrônicos", "Casa & Decoração", "Esportes"], fieldId: "categoria_interesse" } },
            ]
          },
          {
            id: 2,
            title: "Página 2", 
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Qual é o seu orçamento?", options: ["Até R$ 100", "R$ 100 - R$ 500", "R$ 500 - R$ 1000", "Acima de R$ 1000"], fieldId: "faixa_orcamento" } },
              { id: 2, type: "text", properties: { question: "Qual seu nome?", placeholder: "Digite seu nome", fieldId: "nome_completo" } },
              { id: 3, type: "email", properties: { question: "Qual seu melhor email?", placeholder: "seuemail@exemplo.com", fieldId: "email_contato" } },
            ]
          }
        ]
      }
    },
    {
      id: 2,
      name: "Personalização de Estilo",
      description: "Descubra produtos que combinam com seu estilo pessoal",
      category: "ecommerce",
      thumbnail: "👗",
      isPopular: false,
      structure: {
        pages: [
          {
            id: 1,
            title: "Seu Estilo",
            elements: [
              { id: 1, type: "heading", properties: { text: "Qual é o seu estilo?", size: "large" } },
              { id: 2, type: "multiple_choice", properties: { question: "Como você se descreve?", options: ["Clássico/Elegante", "Casual/Despojado", "Moderno/Urbano", "Boho/Alternativo"], fieldId: "estilo_pessoal" } },
              { id: 3, type: "multiple_choice", properties: { question: "Para qual ocasião você mais compra?", options: ["Trabalho", "Lazer", "Festas", "Academia"], fieldId: "ocasiao_compra" } },
            ]
          }
        ]
      }
    },
    {
      id: 3,
      name: "Carrinho Abandonado",
      description: "Recupere vendas perdidas com ofertas personalizadas",
      category: "ecommerce",
      thumbnail: "🛍️",
      isPopular: true,
      structure: {
        pages: [
          {
            id: 1,
            title: "Oferta Especial",
            elements: [
              { id: 1, type: "heading", properties: { text: "Que tal finalizar sua compra com desconto?", size: "large" } },
              { id: 2, type: "multiple_choice", properties: { question: "O que te fez desistir da compra?", options: ["Preço alto", "Frete caro", "Dúvidas sobre o produto", "Apenas navegando"], fieldId: "motivo_desistencia" } },
              { id: 3, type: "email", properties: { question: "Receba 15% OFF:", placeholder: "seuemail@exemplo.com", fieldId: "email_desconto" } },
            ]
          }
        ]
      }
    },
    {
      id: 4,
      name: "Tamanho e Medidas",
      description: "Ajude clientes a escolher o tamanho correto",
      category: "ecommerce",
      thumbnail: "📏",
      isPopular: false,
      structure: {
        pages: [
          {
            id: 1,
            title: "Encontre seu tamanho",
            elements: [
              { id: 1, type: "height", properties: { question: "Qual sua altura?", fieldId: "altura_usuario" } },
              { id: 2, type: "current_weight", properties: { question: "Qual seu peso atual?", fieldId: "peso_atual" } },
              { id: 3, type: "multiple_choice", properties: { question: "Como você prefere que a roupa fique?", options: ["Bem justa", "Ajustada", "Folgada", "Muito folgada"], fieldId: "preferencia_caimento" } },
            ]
          }
        ]
      }
    },
    {
      id: 5,
      name: "Quiz de Presentes",
      description: "Encontre o presente perfeito para alguém especial",
      category: "ecommerce",
      thumbnail: "🎁",
      isPopular: true,
      structure: {
        pages: [
          {
            id: 1,
            title: "Presente Perfeito",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Para quem é o presente?", options: ["Namorado(a)", "Mãe", "Pai", "Amigo(a)", "Filho(a)"], fieldId: "destinatario_presente" } },
              { id: 2, type: "multiple_choice", properties: { question: "Qual a ocasião?", options: ["Aniversário", "Natal", "Dia das Mães", "Dia dos Pais", "Sem ocasião específica"], fieldId: "ocasiao_presente" } },
              { id: 3, type: "phone", properties: { question: "WhatsApp para enviarmos sugestões:", placeholder: "11999999999", fieldId: "telefone_sugestoes" } },
            ]
          }
        ]
      }
    },

    // SAAS (8 templates)
    {
      id: 6,
      name: "Assessment de Necessidades SaaS",
      description: "Identifique as necessidades do cliente para software B2B",
      category: "saas",
      thumbnail: "📊",
      isPopular: false,
      structure: {
        pages: [
          {
            id: 1,
            title: "Sua Empresa",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Qual o tamanho da sua empresa?", options: ["1-10 funcionários", "11-50 funcionários", "51-200 funcionários", "200+ funcionários"], fieldId: "tamanho_empresa" } },
              { id: 2, type: "multiple_choice", properties: { question: "Qual seu maior desafio atual?", options: ["Gestão de tarefas", "Comunicação interna", "Vendas", "Atendimento ao cliente"], fieldId: "principal_desafio" } },
              { id: 3, type: "text", properties: { question: "Nome da empresa:", placeholder: "Digite o nome da sua empresa", fieldId: "nome_empresa" } },
              { id: 4, type: "email", properties: { question: "Email corporativo:", placeholder: "contato@empresa.com", fieldId: "email_corporativo" } },
            ]
          }
        ]
      }
    },
    {
      id: 7,
      name: "Ferramenta de Produtividade",
      description: "Descubra qual ferramenta aumentará sua produtividade",
      category: "saas",
      thumbnail: "⚡",
      isPopular: true,
      structure: {
        pages: [
          {
            id: 1,
            title: "Produtividade",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Como você organiza suas tarefas hoje?", options: ["Papel e caneta", "Planilhas Excel", "Apps básicos", "Não tenho organização"], fieldId: "metodo_organizacao" } },
              { id: 2, type: "multiple_choice", properties: { question: "Quantas horas você perde por semana com desorganização?", options: ["1-2 horas", "3-5 horas", "6-10 horas", "Mais de 10 horas"], fieldId: "tempo_perdido" } },
            ]
          }
        ]
      }
    },

    // HEALTH (8 templates)
    {
      id: 8,
      name: "Avaliação de Saúde",
      description: "Quiz para avaliar hábitos de saúde e bem-estar",
      category: "health",
      thumbnail: "❤️",
      isPopular: true,
      structure: {
        pages: [
          {
            id: 1,
            title: "Sua Saúde",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Como você avalia sua alimentação?", options: ["Muito saudável", "Boa", "Regular", "Precisa melhorar muito"], fieldId: "qualidade_alimentacao" } },
              { id: 2, type: "multiple_choice", properties: { question: "Quantas vezes por semana você se exercita?", options: ["Nunca", "1-2 vezes", "3-4 vezes", "5+ vezes"], fieldId: "frequencia_exercicio" } },
              { id: 3, type: "birth_date", properties: { question: "Data de nascimento:", fieldId: "data_nascimento" } },
              { id: 4, type: "phone", properties: { question: "WhatsApp para dicas personalizadas:", placeholder: "11999999999", fieldId: "telefone_dicas" } },
            ]
          }
        ]
      }
    },
    {
      id: 9,
      name: "Plano Nutricional",
      description: "Descubra o plano alimentar ideal para seus objetivos",
      category: "health",
      thumbnail: "🥗",
      isPopular: false,
      structure: {
        pages: [
          {
            id: 1,
            title: "Nutrição",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Qual seu principal objetivo?", options: ["Perder peso", "Ganhar massa muscular", "Manter peso", "Melhorar saúde geral"], fieldId: "objetivo_nutricional" } },
              { id: 2, type: "current_weight", properties: { question: "Peso atual:", fieldId: "peso_atual_nutricao" } },
              { id: 3, type: "target_weight", properties: { question: "Peso objetivo:", fieldId: "peso_objetivo" } },
            ]
          }
        ]
      }
    },

    // FITNESS (6 templates)
    {
      id: 10,
      name: "Personal Trainer Virtual",
      description: "Encontre o treino perfeito para seu nível e objetivos",
      category: "fitness",
      thumbnail: "💪",
      isPopular: true,
      structure: {
        pages: [
          {
            id: 1,
            title: "Seu Treino",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Qual seu nível de experiência?", options: ["Iniciante", "Intermediário", "Avançado", "Atleta"], fieldId: "nivel_experiencia" } },
              { id: 2, type: "multiple_choice", properties: { question: "Quantos dias por semana você pode treinar?", options: ["2-3 dias", "4-5 dias", "6 dias", "Todos os dias"], fieldId: "frequencia_treino" } },
              { id: 3, type: "multiple_choice", properties: { question: "Onde você prefere treinar?", options: ["Casa", "Academia", "Parque/Ar livre", "Tanto faz"], fieldId: "local_treino" } },
            ]
          }
        ]
      }
    },

    // EDUCATION (6 templates)
    {
      id: 11,
      name: "Curso Ideal",
      description: "Ajude estudantes a escolher o curso certo",
      category: "education",
      thumbnail: "🎓",
      isPopular: true,
      structure: {
        pages: [
          {
            id: 1,
            title: "Sua Carreira",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Qual área mais te interessa?", options: ["Exatas", "Humanas", "Biológicas", "Tecnologia"], fieldId: "area_interesse" } },
              { id: 2, type: "multiple_choice", properties: { question: "Como você aprende melhor?", options: ["Lendo", "Vendo vídeos", "Praticando", "Conversando"], fieldId: "estilo_aprendizagem" } },
              { id: 3, type: "text", properties: { question: "Nome completo:", placeholder: "Digite seu nome completo", fieldId: "nome_estudante" } },
            ]
          }
        ]
      }
    },

    // FINANCE (5 templates)
    {
      id: 12,
      name: "Perfil de Investidor",
      description: "Determine o perfil de risco para investimentos",
      category: "finance",
      thumbnail: "💰",
      isPopular: false,
      structure: {
        pages: [
          {
            id: 1,
            title: "Investimentos",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Qual sua experiência com investimentos?", options: ["Iniciante", "Intermediário", "Avançado", "Especialista"], fieldId: "experiencia_investimentos" } },
              { id: 2, type: "multiple_choice", properties: { question: "Qual seu objetivo principal?", options: ["Reserva de emergência", "Aposentadoria", "Renda extra", "Comprar algo específico"], fieldId: "objetivo_investimento" } },
              { id: 3, type: "multiple_choice", properties: { question: "Quanto você pode investir mensalmente?", options: ["Até R$ 500", "R$ 500 - R$ 1.000", "R$ 1.000 - R$ 5.000", "Acima de R$ 5.000"], fieldId: "valor_mensal_investimento" } },
            ]
          }
        ]
      }
    },

    // REAL ESTATE (4 templates)
    {
      id: 13,
      name: "Imóvel Ideal",
      description: "Encontre o imóvel perfeito para o cliente",
      category: "real-estate",
      thumbnail: "🏠",
      isPopular: false,
      structure: {
        pages: [
          {
            id: 1,
            title: "Seu Imóvel",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Que tipo de imóvel você procura?", options: ["Apartamento", "Casa", "Terreno", "Comercial"], fieldId: "tipo_imovel" } },
              { id: 2, type: "multiple_choice", properties: { question: "Qual sua faixa de preço?", options: ["Até R$ 200mil", "R$ 200-500mil", "R$ 500mil-1mi", "Acima de R$ 1mi"], fieldId: "faixa_preco_imovel" } },
              { id: 3, type: "multiple_choice", properties: { question: "Quantos quartos você precisa?", options: ["1 quarto", "2 quartos", "3 quartos", "4+ quartos"], fieldId: "numero_quartos" } },
            ]
          }
        ]
      }
    },

    // BUSINESS (4 templates) 
    {
      id: 14,
      name: "Consultoria Empresarial",
      description: "Identifique as necessidades de consultoria da empresa",
      category: "business",
      thumbnail: "🏢",
      isPopular: false,
      structure: {
        pages: [
          {
            id: 1,
            title: "Sua Empresa",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Há quanto tempo sua empresa existe?", options: ["Menos de 1 ano", "1-3 anos", "3-10 anos", "Mais de 10 anos"], fieldId: "tempo_empresa" } },
              { id: 2, type: "multiple_choice", properties: { question: "Qual sua principal dificuldade?", options: ["Vendas", "Gestão financeira", "Marketing", "Recursos humanos"], fieldId: "principal_dificuldade" } },
            ]
          }
        ]
      }
    },

    // FOOD (3 templates)
    {
      id: 15,
      name: "Delivery Personalizado",
      description: "Recomende pratos baseados nas preferências do cliente",
      category: "food",
      thumbnail: "🍕",
      isPopular: true,
      structure: {
        pages: [
          {
            id: 1,
            title: "Seu Paladar",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Que tipo de comida você prefere?", options: ["Brasileira", "Italiana", "Japonesa", "Fast Food"], fieldId: "tipo_comida_preferida" } },
              { id: 2, type: "multiple_choice", properties: { question: "Você tem alguma restrição alimentar?", options: ["Nenhuma", "Vegetariano", "Vegano", "Sem glúten", "Sem lactose"], fieldId: "restricao_alimentar" } },
              { id: 3, type: "phone", properties: { question: "WhatsApp para delivery:", placeholder: "11999999999", fieldId: "telefone_delivery" } },
            ]
          }
        ]
      }
    },

    // LIFESTYLE (3 templates)
    {
      id: 16,
      name: "Estilo de Vida Ideal",
      description: "Descubra produtos e serviços para seu estilo de vida",
      category: "lifestyle",
      thumbnail: "☕",
      isPopular: false,
      structure: {
        pages: [
          {
            id: 1,
            title: "Seu Estilo",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Como você gosta de passar o tempo livre?", options: ["Lendo", "Assistindo séries", "Saindo com amigos", "Praticando hobbies"], fieldId: "tempo_livre" } },
              { id: 2, type: "multiple_choice", properties: { question: "Qual sua bebida favorita?", options: ["Café", "Chá", "Suco", "Refrigerante"], fieldId: "bebida_favorita" } },
            ]
          }
        ]
      }
    },

    // TECHNOLOGY (3 templates)
    {
      id: 17,
      name: "Gadget Perfeito",
      description: "Encontre o dispositivo tecnológico ideal",
      category: "technology",
      thumbnail: "📱",
      isPopular: true,
      structure: {
        pages: [
          {
            id: 1,
            title: "Tecnologia",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Que tipo de dispositivo você procura?", options: ["Smartphone", "Laptop", "Tablet", "Smartwatch"], fieldId: "tipo_dispositivo" } },
              { id: 2, type: "multiple_choice", properties: { question: "Para que você mais usa tecnologia?", options: ["Trabalho", "Entretenimento", "Estudos", "Comunicação"], fieldId: "uso_principal_tech" } },
            ]
          }
        ]
      }
    },

    // TRAVEL (2 templates)
    {
      id: 18,
      name: "Destino dos Sonhos",
      description: "Encontre o destino de viagem perfeito",
      category: "travel",
      thumbnail: "✈️",
      isPopular: false,
      structure: {
        pages: [
          {
            id: 1,
            title: "Sua Viagem",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Que tipo de viagem você prefere?", options: ["Praia", "Montanha", "Cidade histórica", "Aventura"], fieldId: "tipo_viagem" } },
              { id: 2, type: "multiple_choice", properties: { question: "Qual seu orçamento para viagem?", options: ["Até R$ 2mil", "R$ 2-5mil", "R$ 5-10mil", "Acima de R$ 10mil"], fieldId: "orcamento_viagem" } },
            ]
          }
        ]
      }
    },

    // AUTOMOTIVE (2 templates)
    {
      id: 19,
      name: "Carro Ideal",
      description: "Encontre o veículo perfeito para suas necessidades",
      category: "automotive",
      thumbnail: "🚗",
      isPopular: false,
      structure: {
        pages: [
          {
            id: 1,
            title: "Seu Carro",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Que tipo de carro você procura?", options: ["Hatch compacto", "Sedan", "SUV", "Pickup"], fieldId: "tipo_carro" } },
              { id: 2, type: "multiple_choice", properties: { question: "Qual seu orçamento?", options: ["Até R$ 50mil", "R$ 50-100mil", "R$ 100-200mil", "Acima de R$ 200mil"], fieldId: "orcamento_carro" } },
            ]
          }
        ]
      }
    },

    // GAMING (2 templates)
    {
      id: 20,
      name: "Setup Gamer",
      description: "Monte o setup gamer ideal para seu perfil",
      category: "gaming",
      thumbnail: "🎮",
      isPopular: true,
      structure: {
        pages: [
          {
            id: 1,
            title: "Gaming",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Que tipo de jogos você mais joga?", options: ["FPS", "RPG", "Strategy", "Sports"], fieldId: "tipo_jogos" } },
              { id: 2, type: "multiple_choice", properties: { question: "Qual plataforma você prefere?", options: ["PC", "PlayStation", "Xbox", "Mobile"], fieldId: "plataforma_gaming" } },
            ]
          }
        ]
      }
    },

    // MUSIC (1 template)
    {
      id: 21,
      name: "Instrumento Musical",
      description: "Descubra qual instrumento combina com você",
      category: "music",
      thumbnail: "🎵",
      isPopular: false,
      structure: {
        pages: [
          {
            id: 1,
            title: "Música",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Que estilo musical você prefere?", options: ["Rock", "Pop", "Jazz", "Clássica"], fieldId: "estilo_musical" } },
              { id: 2, type: "multiple_choice", properties: { question: "Você já tocou algum instrumento?", options: ["Nunca", "Um pouco", "Intermediário", "Avançado"], fieldId: "experiencia_musical" } },
            ]
          }
        ]
      }
    },

    // PHOTOGRAPHY (1 template)
    {
      id: 22,
      name: "Equipamento Fotográfico",
      description: "Encontre a câmera e equipamentos ideais",
      category: "photography",
      thumbnail: "📸",
      isPopular: false,
      structure: {
        pages: [
          {
            id: 1,
            title: "Fotografia",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Que tipo de fotografia te interessa?", options: ["Paisagem", "Retrato", "Street", "Macro"], fieldId: "tipo_fotografia" } },
              { id: 2, type: "multiple_choice", properties: { question: "Qual seu nível de experiência?", options: ["Iniciante", "Hobbyista", "Semi-profissional", "Profissional"], fieldId: "nivel_fotografia" } },
            ]
          }
        ]
      }
    },

    // DESIGN (1 template)
    {
      id: 23,
      name: "Identidade Visual",
      description: "Crie a identidade visual perfeita para sua marca",
      category: "design",
      thumbnail: "🎨",
      isPopular: false,
      structure: {
        pages: [
          {
            id: 1,
            title: "Design",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Que tipo de negócio você tem?", options: ["Loja física", "E-commerce", "Prestação de serviços", "Blog/Conteúdo"], fieldId: "tipo_negocio_design" } },
              { id: 2, type: "multiple_choice", properties: { question: "Qual estilo visual você prefere?", options: ["Minimalista", "Colorido/Vibrante", "Elegante/Sofisticado", "Moderno/Tech"], fieldId: "estilo_visual" } },
              { id: 3, type: "text", properties: { question: "Nome da sua marca:", placeholder: "Digite o nome da marca", fieldId: "nome_marca" } },
            ]
          }
        ]
      }
    },

    // ADDING MORE TEMPLATES TO REACH 50

    // E-COMMERCE CONTINUAÇÃO (24-28)
    {
      id: 24,
      name: "Fidelização de Cliente",
      description: "Programa de fidelidade personalizado",
      category: "ecommerce",
      thumbnail: "⭐",
      isPopular: false,
      structure: {
        pages: [
          {
            id: 1,
            title: "Fidelidade",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Com que frequência você compra conosco?", options: ["Primeira vez", "Mensalmente", "Semanalmente", "Raramente"], fieldId: "frequencia_compra" } },
              { id: 2, type: "multiple_choice", properties: { question: "O que mais te motiva a voltar?", options: ["Preços baixos", "Qualidade", "Atendimento", "Variedade"], fieldId: "motivacao_retorno" } },
              { id: 3, type: "email", properties: { question: "Email para ofertas exclusivas:", placeholder: "seuemail@exemplo.com", fieldId: "email_ofertas" } },
            ]
          }
        ]
      }
    },
    {
      id: 25,
      name: "Avaliação de Produto",
      description: "Colete feedback sobre produtos",
      category: "ecommerce",
      thumbnail: "📝",
      isPopular: true,
      structure: {
        pages: [
          {
            id: 1,
            title: "Avaliação",
            elements: [
              { id: 1, type: "rating", properties: { question: "Como você avalia o produto?", min: 1, max: 5, fieldId: "avaliacao_produto" } },
              { id: 2, type: "textarea", properties: { question: "Deixe seu comentário:", placeholder: "Conte sua experiência...", fieldId: "comentario_produto" } },
              { id: 3, type: "multiple_choice", properties: { question: "Você recomendaria para um amigo?", options: ["Definitivamente sim", "Provavelmente sim", "Talvez", "Provavelmente não"], fieldId: "recomendacao" } },
            ]
          }
        ]
      }
    },

    // SAAS CONTINUAÇÃO (26-32)
    {
      id: 26,
      name: "Onboarding de Cliente",
      description: "Processo de integração para novos usuários",
      category: "saas",
      thumbnail: "🚀",
      isPopular: true,
      structure: {
        pages: [
          {
            id: 1,
            title: "Bem-vindo",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Qual sua função na empresa?", options: ["CEO/Fundador", "Gerente", "Analista", "Desenvolvedor"], fieldId: "funcao_empresa" } },
              { id: 2, type: "multiple_choice", properties: { question: "Qual seu objetivo principal?", options: ["Aumentar produtividade", "Reduzir custos", "Melhorar comunicação", "Automatizar processos"], fieldId: "objetivo_principal" } },
              { id: 3, type: "text", properties: { question: "Nome completo:", placeholder: "Digite seu nome", fieldId: "nome_usuario" } },
            ]
          }
        ]
      }
    },
    {
      id: 27,
      name: "ROI e Performance",
      description: "Calcule o retorno sobre investimento",
      category: "saas",
      thumbnail: "📈",
      isPopular: false,
      structure: {
        pages: [
          {
            id: 1,
            title: "ROI",
            elements: [
              { id: 1, type: "number", properties: { question: "Qual seu faturamento mensal atual?", placeholder: "Ex: 50000", fieldId: "faturamento_mensal" } },
              { id: 2, type: "multiple_choice", properties: { question: "Quanto tempo você gasta em tarefas manuais?", options: ["1-5 horas/dia", "6-10 horas/dia", "Mais de 10 horas/dia", "Não sei"], fieldId: "tempo_tarefas_manuais" } },
            ]
          }
        ]
      }
    },

    // HEALTH CONTINUAÇÃO (28-35)
    {
      id: 28,
      name: "Check-up Médico",
      description: "Avaliação preventiva de saúde",
      category: "health",
      thumbnail: "🩺",
      isPopular: false,
      structure: {
        pages: [
          {
            id: 1,
            title: "Check-up",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Quando foi seu último check-up?", options: ["Há menos de 6 meses", "6 meses a 1 ano", "1-2 anos", "Mais de 2 anos"], fieldId: "ultimo_checkup" } },
              { id: 2, type: "multiple_choice", properties: { question: "Você tem histórico familiar de doenças?", options: ["Diabetes", "Hipertensão", "Câncer", "Nenhum"], fieldId: "historico_familiar" } },
              { id: 3, type: "phone", properties: { question: "WhatsApp para agendamento:", placeholder: "11999999999", fieldId: "telefone_agendamento" } },
            ]
          }
        ]
      }
    },
    {
      id: 29,
      name: "Saúde Mental",
      description: "Avalie seu bem-estar emocional",
      category: "health",
      thumbnail: "🧠",
      isPopular: true,
      structure: {
        pages: [
          {
            id: 1,
            title: "Bem-estar",
            elements: [
              { id: 1, type: "rating", properties: { question: "Como você se sente hoje?", min: 1, max: 10, fieldId: "nivel_bemestar" } },
              { id: 2, type: "multiple_choice", properties: { question: "Você tem dormido bem?", options: ["Muito bem", "Bem", "Mais ou menos", "Mal"], fieldId: "qualidade_sono" } },
              { id: 3, type: "multiple_choice", properties: { question: "Como está sua ansiedade?", options: ["Baixa", "Moderada", "Alta", "Muito alta"], fieldId: "nivel_ansiedade" } },
            ]
          }
        ]
      }
    },

    // FITNESS CONTINUAÇÃO (30-35)
    {
      id: 30,
      name: "Avaliação Física",
      description: "Teste seu condicionamento físico",
      category: "fitness",
      thumbnail: "🏃‍♂️",
      isPopular: false,
      structure: {
        pages: [
          {
            id: 1,
            title: "Condicionamento",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Você consegue subir 3 andares sem cansar?", options: ["Facilmente", "Com pouco esforço", "Com dificuldade", "Não consigo"], fieldId: "teste_escada" } },
              { id: 2, type: "multiple_choice", properties: { question: "Quantas flexões você faz?", options: ["0-5", "6-15", "16-30", "Mais de 30"], fieldId: "numero_flexoes" } },
              { id: 3, type: "height", properties: { question: "Sua altura:", fieldId: "altura_fisica" } },
            ]
          }
        ]
      }
    },
    {
      id: 31,
      name: "Programa de Corrida",
      description: "Plano personalizado para corrida",
      category: "fitness",
      thumbnail: "🏃",
      isPopular: true,
      structure: {
        pages: [
          {
            id: 1,
            title: "Corrida",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Qual sua experiência com corrida?", options: ["Nunca corri", "Iniciante", "Corro ocasionalmente", "Corredor experiente"], fieldId: "experiencia_corrida" } },
              { id: 2, type: "multiple_choice", properties: { question: "Qual seu objetivo?", options: ["Perder peso", "Condicionamento", "Competir", "Hobby"], fieldId: "objetivo_corrida" } },
            ]
          }
        ]
      }
    },

    // EDUCATION CONTINUAÇÃO (32-37)
    {
      id: 32,
      name: "Capacitação Profissional",
      description: "Encontre cursos para sua carreira",
      category: "education",
      thumbnail: "💼",
      isPopular: false,
      structure: {
        pages: [
          {
            id: 1,
            title: "Capacitação",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Em que área você trabalha?", options: ["Tecnologia", "Marketing", "Vendas", "Administração"], fieldId: "area_trabalho" } },
              { id: 2, type: "multiple_choice", properties: { question: "Qual habilidade quer desenvolver?", options: ["Liderança", "Comunicação", "Técnicas específicas", "Idiomas"], fieldId: "habilidade_desenvolver" } },
            ]
          }
        ]
      }
    },
    {
      id: 33,
      name: "Preparatório para Vestibular",
      description: "Plano de estudos personalizado",
      category: "education",
      thumbnail: "📚",
      isPopular: true,
      structure: {
        pages: [
          {
            id: 1,
            title: "Vestibular",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Qual curso pretende fazer?", options: ["Medicina", "Engenharia", "Direito", "Administração"], fieldId: "curso_pretendido" } },
              { id: 2, type: "multiple_choice", properties: { question: "Qual sua maior dificuldade?", options: ["Matemática", "Português", "Ciências", "Redação"], fieldId: "dificuldade_materia" } },
            ]
          }
        ]
      }
    },

    // FINANCE CONTINUAÇÃO (34-38)
    {
      id: 34,
      name: "Planejamento Financeiro",
      description: "Organize suas finanças pessoais",
      category: "finance",
      thumbnail: "📊",
      isPopular: true,
      structure: {
        pages: [
          {
            id: 1,
            title: "Finanças",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Como estão suas finanças?", options: ["Controladas", "Mais ou menos", "Desorganizadas", "Em crise"], fieldId: "situacao_financeira" } },
              { id: 2, type: "multiple_choice", properties: { question: "Você tem reserva de emergência?", options: ["Sim, 6+ meses", "Sim, 1-3 meses", "Pouco", "Não tenho"], fieldId: "reserva_emergencia" } },
            ]
          }
        ]
      }
    },
    {
      id: 35,
      name: "Crédito e Financiamento",
      description: "Encontre a melhor opção de crédito",
      category: "finance",
      thumbnail: "🏦",
      isPopular: false,
      structure: {
        pages: [
          {
            id: 1,
            title: "Crédito",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Para que você precisa do crédito?", options: ["Casa própria", "Carro", "Negócio", "Estudos"], fieldId: "finalidade_credito" } },
              { id: 2, type: "number", properties: { question: "Qual valor você precisa?", placeholder: "Ex: 50000", fieldId: "valor_credito" } },
            ]
          }
        ]
      }
    },

    // REAL ESTATE CONTINUAÇÃO (36-39)
    {
      id: 36,
      name: "Avaliação de Imóvel",
      description: "Descubra o valor do seu imóvel",
      category: "real-estate",
      thumbnail: "💰",
      isPopular: false,
      structure: {
        pages: [
          {
            id: 1,
            title: "Avaliação",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Qual o tipo do seu imóvel?", options: ["Apartamento", "Casa", "Sobrado", "Cobertura"], fieldId: "tipo_imovel_avaliacao" } },
              { id: 2, type: "number", properties: { question: "Quantos metros quadrados?", placeholder: "Ex: 80", fieldId: "metragem_imovel" } },
              { id: 3, type: "text", properties: { question: "Qual o bairro?", placeholder: "Digite o bairro", fieldId: "bairro_imovel" } },
            ]
          }
        ]
      }
    },
    {
      id: 37,
      name: "Investimento Imobiliário",
      description: "Encontre oportunidades de investimento",
      category: "real-estate",
      thumbnail: "🏗️",
      isPopular: true,
      structure: {
        pages: [
          {
            id: 1,
            title: "Investimento",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Qual seu objetivo?", options: ["Renda de aluguel", "Valorização", "Ambos", "Morar e valorizar"], fieldId: "objetivo_investimento_imovel" } },
              { id: 2, type: "multiple_choice", properties: { question: "Qual seu orçamento?", options: ["Até R$ 300mil", "R$ 300-500mil", "R$ 500mil-1mi", "Acima de R$ 1mi"], fieldId: "orcamento_investimento" } },
            ]
          }
        ]
      }
    },

    // BUSINESS CONTINUAÇÃO (38-41)
    {
      id: 38,
      name: "Franquia Ideal",
      description: "Encontre a franquia perfeita para você",
      category: "business",
      thumbnail: "🏪",
      isPopular: false,
      structure: {
        pages: [
          {
            id: 1,
            title: "Franquia",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Qual setor te interessa?", options: ["Alimentação", "Educação", "Beleza", "Serviços"], fieldId: "setor_franquia" } },
              { id: 2, type: "multiple_choice", properties: { question: "Quanto você pode investir?", options: ["Até R$ 50mil", "R$ 50-100mil", "R$ 100-300mil", "Acima de R$ 300mil"], fieldId: "investimento_franquia" } },
            ]
          }
        ]
      }
    },
    {
      id: 39,
      name: "Marketing Digital",
      description: "Estratégia de marketing para seu negócio",
      category: "business",
      thumbnail: "📱",
      isPopular: true,
      structure: {
        pages: [
          {
            id: 1,
            title: "Marketing",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Qual seu público-alvo?", options: ["Jovens 18-25", "Adultos 26-40", "Meia idade 41-60", "Terceira idade 60+"], fieldId: "publico_alvo" } },
              { id: 2, type: "multiple_choice", properties: { question: "Qual canal você mais usa?", options: ["Instagram", "Facebook", "Google Ads", "WhatsApp"], fieldId: "canal_marketing" } },
            ]
          }
        ]
      }
    },

    // FOOD CONTINUAÇÃO (40-42)
    {
      id: 40,
      name: "Dieta Personalizada",
      description: "Plano alimentar sob medida",
      category: "food",
      thumbnail: "🥙",
      isPopular: true,
      structure: {
        pages: [
          {
            id: 1,
            title: "Dieta",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Qual seu objetivo?", options: ["Emagrecer", "Ganhar massa", "Manter peso", "Melhorar saúde"], fieldId: "objetivo_dieta" } },
              { id: 2, type: "multiple_choice", properties: { question: "Você tem restrições?", options: ["Nenhuma", "Vegetariano", "Vegano", "Diabético"], fieldId: "restricoes_dieta" } },
            ]
          }
        ]
      }
    },
    {
      id: 41,
      name: "Receitas Saudáveis",
      description: "Descubra receitas para seu estilo de vida",
      category: "food",
      thumbnail: "👨‍🍳",
      isPopular: false,
      structure: {
        pages: [
          {
            id: 1,
            title: "Receitas",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Quanto tempo você tem para cozinhar?", options: ["Até 15 min", "15-30 min", "30-60 min", "Mais de 1 hora"], fieldId: "tempo_cozinhar" } },
              { id: 2, type: "multiple_choice", properties: { question: "Qual tipo de receita prefere?", options: ["Doces", "Salgados", "Bebidas", "Lanches"], fieldId: "tipo_receita" } },
            ]
          }
        ]
      }
    },

    // LIFESTYLE CONTINUAÇÃO (42-44)
    {
      id: 42,
      name: "Rotina de Bem-estar",
      description: "Crie uma rotina personalizada",
      category: "lifestyle",
      thumbnail: "🧘‍♀️",
      isPopular: true,
      structure: {
        pages: [
          {
            id: 1,
            title: "Bem-estar",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Que horas você acorda?", options: ["Antes das 6h", "6h-8h", "8h-10h", "Depois das 10h"], fieldId: "horario_acordar" } },
              { id: 2, type: "multiple_choice", properties: { question: "Como você relaxa?", options: ["Meditação", "Leitura", "Música", "Exercícios"], fieldId: "forma_relaxar" } },
            ]
          }
        ]
      }
    },
    {
      id: 43,
      name: "Organização Pessoal",
      description: "Organize sua vida e ambiente",
      category: "lifestyle",
      thumbnail: "📅",
      isPopular: false,
      structure: {
        pages: [
          {
            id: 1,
            title: "Organização",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Como está sua organização?", options: ["Muito organizado", "Organizado", "Desorganizado", "Caótico"], fieldId: "nivel_organizacao" } },
              { id: 2, type: "multiple_choice", properties: { question: "Onde você mais perde tempo?", options: ["Procurando coisas", "Planejando", "Executando", "Decidindo"], fieldId: "onde_perde_tempo" } },
            ]
          }
        ]
      }
    },

    // TECHNOLOGY CONTINUAÇÃO (44-47)
    {
      id: 44,
      name: "Setup de Home Office",
      description: "Monte seu escritório em casa",
      category: "technology",
      thumbnail: "💻",
      isPopular: true,
      structure: {
        pages: [
          {
            id: 1,
            title: "Home Office",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Qual sua função principal?", options: ["Programador", "Designer", "Gestor", "Vendedor"], fieldId: "funcao_homeoffice" } },
              { id: 2, type: "multiple_choice", properties: { question: "Qual seu orçamento para setup?", options: ["Até R$ 2mil", "R$ 2-5mil", "R$ 5-10mil", "Acima de R$ 10mil"], fieldId: "orcamento_setup" } },
            ]
          }
        ]
      }
    },
    {
      id: 45,
      name: "Segurança Digital",
      description: "Proteja seus dados pessoais",
      category: "technology",
      thumbnail: "🔒",
      isPopular: false,
      structure: {
        pages: [
          {
            id: 1,
            title: "Segurança",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Você usa senhas diferentes?", options: ["Sempre", "Na maioria das vezes", "Raramente", "Nunca"], fieldId: "uso_senhas_diferentes" } },
              { id: 2, type: "multiple_choice", properties: { question: "Você faz backup dos dados?", options: ["Diariamente", "Semanalmente", "Mensalmente", "Nunca"], fieldId: "frequencia_backup" } },
            ]
          }
        ]
      }
    },

    // TRAVEL CONTINUAÇÃO (46-47)
    {
      id: 46,
      name: "Intercâmbio Ideal",
      description: "Encontre o programa de intercâmbio perfeito",
      category: "travel",
      thumbnail: "🌍",
      isPopular: false,
      structure: {
        pages: [
          {
            id: 1,
            title: "Intercâmbio",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Qual seu objetivo?", options: ["Aprender idioma", "Estudar", "Trabalhar", "Turismo"], fieldId: "objetivo_intercambio" } },
              { id: 2, type: "multiple_choice", properties: { question: "Quanto tempo você tem?", options: ["1-3 meses", "6 meses", "1 ano", "2+ anos"], fieldId: "duracao_intercambio" } },
            ]
          }
        ]
      }
    },

    // AUTOMOTIVE CONTINUAÇÃO (47-48)
    {
      id: 47,
      name: "Seguro Automotivo",
      description: "Encontre o seguro ideal para seu carro",
      category: "automotive",
      thumbnail: "🛡️",
      isPopular: false,
      structure: {
        pages: [
          {
            id: 1,
            title: "Seguro",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Que tipo de cobertura você quer?", options: ["Básica", "Intermediária", "Completa", "Premium"], fieldId: "tipo_cobertura" } },
              { id: 2, type: "text", properties: { question: "Modelo do seu carro:", placeholder: "Ex: Honda Civic 2020", fieldId: "modelo_carro" } },
            ]
          }
        ]
      }
    },

    // GAMING CONTINUAÇÃO (48-49)
    {
      id: 48,
      name: "PC Gamer Personalizado",
      description: "Monte o PC gamer dos seus sonhos",
      category: "gaming",
      thumbnail: "🖥️",
      isPopular: true,
      structure: {
        pages: [
          {
            id: 1,
            title: "PC Gamer",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Qual resolução você joga?", options: ["1080p", "1440p", "4K", "Ultrawide"], fieldId: "resolucao_jogo" } },
              { id: 2, type: "multiple_choice", properties: { question: "Qual seu orçamento?", options: ["R$ 3-5mil", "R$ 5-8mil", "R$ 8-15mil", "Acima de R$ 15mil"], fieldId: "orcamento_pc" } },
            ]
          }
        ]
      }
    },

    // MUSIC CONTINUAÇÃO (49-50)
    {
      id: 49,
      name: "Aulas de Música Online",
      description: "Encontre o curso de música ideal",
      category: "music",
      thumbnail: "🎸",
      isPopular: false,
      structure: {
        pages: [
          {
            id: 1,
            title: "Música",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Qual instrumento quer aprender?", options: ["Violão", "Piano", "Bateria", "Canto"], fieldId: "instrumento_escolhido" } },
              { id: 2, type: "multiple_choice", properties: { question: "Quanto tempo pode dedicar?", options: ["30 min/dia", "1 hora/dia", "2+ horas/dia", "Fins de semana"], fieldId: "tempo_estudo_musica" } },
            ]
          }
        ]
      }
    },

    // PHOTOGRAPHY (50)
    {
      id: 50,
      name: "Ensaio Fotográfico",
      description: "Planeje sua sessão de fotos perfeita",
      category: "photography",
      thumbnail: "📷",
      isPopular: false,
      structure: {
        pages: [
          {
            id: 1,
            title: "Ensaio",
            elements: [
              { id: 1, type: "multiple_choice", properties: { question: "Que tipo de ensaio você quer?", options: ["Retrato", "Casal", "Família", "Gestante"], fieldId: "tipo_ensaio" } },
              { id: 2, type: "multiple_choice", properties: { question: "Onde prefere fazer?", options: ["Estúdio", "Parque", "Praia", "Casa"], fieldId: "local_ensaio" } },
              { id: 3, type: "phone", properties: { question: "WhatsApp para agendamento:", placeholder: "11999999999", fieldId: "telefone_ensaio" } },
            ]
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

  const handlePreviewTemplate = (template: any) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const confirmUseTemplate = () => {
    if (selectedTemplate) {
      handleUseTemplate(selectedTemplate);
      setShowPreview(false);
      setSelectedTemplate(null);
    }
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
        <h1 className="text-3xl font-bold text-gray-900">{t("templates.title")}</h1>
        <p className="text-gray-600">{t("templates.subtitle")}</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={t("templates.searchPlaceholder")}
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
          <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
            {/* Template Preview */}
            <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <div className="bg-white rounded-lg p-3 max-w-[180px] mx-auto shadow-sm">
                <div className="text-center">
                  <div className="text-2xl mb-2">{template.thumbnail}</div>
                  <h4 className="text-xs font-semibold mb-2 line-clamp-1">{template.name}</h4>
                  <div className="space-y-1">
                    <div className="w-full h-1.5 bg-gray-100 rounded"></div>
                    <div className="w-3/4 h-1.5 bg-gray-100 rounded"></div>
                    <div className="w-1/2 h-1.5 bg-gray-100 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            <CardContent className="p-4 flex flex-col flex-1">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900 line-clamp-1 flex-1">{template.name}</h3>
                {template.isPopular && (
                  <Badge className="bg-yellow-100 text-yellow-800 flex-shrink-0 ml-2">
                    <Star className="w-3 h-3 mr-1" />
                    {t("templates.popular")}
                  </Badge>
                )}
              </div>
              
              <p className="text-gray-600 mb-3 text-sm line-clamp-2 flex-grow">{template.description}</p>
              
              <div className="space-y-3 mt-auto">
                <div className="flex justify-center">
                  <Badge variant="outline" className="text-xs">
                    {categories.find(c => c.id === template.category)?.label || template.category}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handlePreviewTemplate(template)}
                    className="w-full text-xs"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    {t("templates.preview")}
                  </Button>
                  
                  <Button 
                    size="sm" 
                    onClick={() => handleUseTemplate(template)}
                    className="w-full text-xs"
                  >
                    {t("templates.use")}
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("templates.noTemplatesFound")}
          </h3>
          <p className="text-gray-600">
            {t("templates.tryDifferentSearch")}
          </p>
        </div>
      )}

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="text-2xl">{selectedTemplate?.thumbnail}</div>
              <div>
                <div className="text-xl font-semibold">{selectedTemplate?.name}</div>
                <div className="text-sm text-gray-600 font-normal">
                  {categories.find(c => c.id === selectedTemplate?.category)?.label}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-6">
              {/* Funcionalidades */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Este template inclui:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-700">
                  <div>• {selectedTemplate.structure.pages?.length || 1} página(s) de quiz</div>
                  <div>• Elementos pré-configurados</div>
                  <div>• Perguntas otimizadas para conversão</div>
                  <div>• Campo de captura de leads</div>
                  <div>• Design responsivo</div>
                  <div>• Pronto para publicar</div>
                </div>
              </div>

              {/* Preview das Páginas */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Preview do Template:</h4>
                {selectedTemplate.structure.pages?.map((page: any, pageIndex: number) => (
                  <div key={page.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-900">{page.title || `Página ${pageIndex + 1}`}</h5>
                      <Badge variant="outline" className="text-xs">
                        {page.elements?.length || 0} elementos
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      {page.elements?.map((element: any, elementIndex: number) => (
                        <div key={element.id} className="bg-white rounded border p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs font-medium text-gray-600 uppercase">
                              {element.type.replace('_', ' ')}
                            </span>
                          </div>
                          
                          {element.type === 'heading' && (
                            <h6 className="text-lg font-semibold text-gray-900">
                              {element.properties?.text}
                            </h6>
                          )}
                          
                          {element.type === 'multiple_choice' && (
                            <div>
                              <p className="font-medium text-gray-900 mb-2">
                                {element.properties?.question}
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                {element.properties?.options?.map((option: string, optIndex: number) => (
                                  <div key={optIndex} className="bg-gray-100 rounded px-3 py-2 text-sm">
                                    {option}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {(element.type === 'text' || element.type === 'email' || element.type === 'phone') && (
                            <div>
                              <p className="font-medium text-gray-900 mb-2">
                                {element.properties?.question}
                              </p>
                              <div className="bg-gray-100 rounded px-3 py-2 text-sm text-gray-500">
                                {element.properties?.placeholder || `Campo ${element.type}`}
                              </div>
                            </div>
                          )}
                          
                          {(element.type === 'birth_date' || element.type === 'height' || element.type === 'current_weight' || element.type === 'target_weight') && (
                            <div>
                              <p className="font-medium text-gray-900 mb-2">
                                {element.properties?.question}
                              </p>
                              <div className="bg-gray-100 rounded px-3 py-2 text-sm text-gray-500">
                                Campo especial: {element.type.replace('_', ' ')}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Aviso de Importação */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Como funciona a importação:
                </h4>
                <div className="text-sm text-orange-700 space-y-1">
                  <p>• O template será importado 100% pronto com todas as configurações</p>
                  <p>• Você só precisará adicionar um título personalizado</p>
                  <p>• Depois é só salvar e publicar o quiz</p>
                  <p>• Todas as perguntas e elementos já estão configurados</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmUseTemplate}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Sim, importar este template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
