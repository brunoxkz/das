import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Mail, 
  Send, 
  Calendar, 
  Users, 
  BarChart3, 
  TrendingUp,
  Eye,
  MousePointer,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Filter,
  Download,
  Sparkles,
  Target,
  Zap,
  X,
  Code,
  Wand2,
  Settings,
  TestTube,
  Copy,
  Plus,
  Trash2,
  Edit3,
  FileText,
  Palette,
  Tag,
  ShoppingCart,
  Heart,
  Star,
  MessageCircle,
  ArrowRight,
  Play,
  Pause,
  LineChart,
  Activity,
  Database,
  Sliders,
  Layers,
  Maximize2,
  GitBranch,
  Timer,
  Repeat,
  Filter as FilterIcon,
  ChevronDown,
  ChevronUp,
  Rocket,
  Crown,
  Award,
  TrendingDown,
  DollarSign,
  Globe,
  Shield,
  Zap as Lightning
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Quiz {
  id: string;
  title: string;
  responseCount: number;
}

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sent' | 'active';
  quizId: string;
  quizTitle: string;
  targetAudience: string;
  emailCount: number;
  sentCount: number;
  openRate: number;
  clickRate: number;
  createdAt: string;
  sentAt?: string;
  scheduledAt?: string;
  availableVariables?: string[];
}

interface QuizVariable {
  name: string;
  type: string;
  description: string;
  sampleValue: string;
}

interface AudienceStats {
  totalLeads: number;
  completedLeads: number;
  abandonedLeads: number;
  estimatedOpenRate: number;
  estimatedClickRate: number;
  estimatedDeliveryRate: number;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  previewImage?: string;
  gradient: string;
  icon: any;
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Boas-vindas Premium',
    category: 'Engajamento',
    gradient: 'from-emerald-400 via-teal-500 to-blue-600',
    icon: Crown,
    subject: 'Bem-vindo(a) à elite, {nome}! 🎯',
    content: `<div style="font-family: 'Inter', Arial, sans-serif; max-width: 650px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 20px; overflow: hidden;">
      <!-- Header Section -->
      <div style="background: linear-gradient(135deg, #22c55e 0%, #059669 50%, #047857 100%); padding: 40px 30px; text-align: center; position: relative;">
        <div style="background: rgba(255,255,255,0.1); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(255,255,255,0.2);">
          <span style="font-size: 32px;">👑</span>
        </div>
        <h1 style="color: white; font-size: 28px; margin: 0; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Olá, {nome}!</h1>
        <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 10px 0 0 0;">Bem-vindo(a) à nossa comunidade exclusiva</p>
      </div>
      
      <!-- Content Section -->
      <div style="padding: 40px 30px; color: white;">
        <p style="font-size: 18px; line-height: 1.6; margin-bottom: 30px; color: #e2e8f0;">
          Parabéns por completar nosso quiz premium! Você agora faz parte de um grupo seleto de pessoas comprometidas com a excelência.
        </p>
        
        <!-- Stats Card -->
        <div style="background: linear-gradient(135deg, #334155 0%, #475569 100%); border-radius: 16px; padding: 25px; margin: 30px 0; border: 1px solid rgba(34, 197, 94, 0.2);">
          <h3 style="color: #22c55e; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">📊 Seus Dados Exclusivos</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div style="text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 14px;">Email</p>
              <p style="margin: 5px 0 0 0; color: white; font-weight: 600;">{email}</p>
            </div>
            <div style="text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 14px;">Telefone</p>
              <p style="margin: 5px 0 0 0; color: white; font-weight: 600;">{telefone}</p>
            </div>
          </div>
        </div>
        
        <!-- CTA Button -->
        <div style="text-align: center; margin: 40px 0;">
          <a href="#" style="background: linear-gradient(135deg, #22c55e 0%, #059669 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 8px 25px rgba(34, 197, 94, 0.3); display: inline-block; transition: all 0.3s ease;">
            🚀 Acessar Área VIP
          </a>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.1);">
          <p style="color: #94a3b8; font-size: 14px; margin: 0;">
            Prepare-se para uma experiência transformadora!
          </p>
        </div>
      </div>
    </div>`
  },
  {
    id: 'abandoned',
    name: 'Reengajamento Urgente',
    category: 'Reengajamento',
    gradient: 'from-red-400 via-pink-500 to-purple-600',
    icon: Lightning,
    subject: '⚡ {nome}, última chance! Não perca isso...',
    content: `<div style="font-family: 'Inter', Arial, sans-serif; max-width: 650px; margin: 0 auto; background: linear-gradient(135deg, #7c2d12 0%, #991b1b 100%); border-radius: 20px; overflow: hidden;">
      <!-- Urgent Header -->
      <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%); padding: 40px 30px; text-align: center; position: relative;">
        <div style="background: rgba(255,255,255,0.15); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(255,255,255,0.3); animation: pulse 2s infinite;">
          <span style="font-size: 32px;">⚡</span>
        </div>
        <h1 style="color: white; font-size: 26px; margin: 0; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">Ops! {nome}</h1>
        <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 10px 0 0 0;">Você estava quase lá...</p>
      </div>
      
      <!-- Content Section -->
      <div style="padding: 40px 30px; color: white;">
        <p style="font-size: 18px; line-height: 1.6; margin-bottom: 25px; color: #fecaca;">
          Notamos que você começou nosso quiz, mas não finalizou. Isso é mais comum do que imagina!
        </p>
        
        <!-- Urgency Card -->
        <div style="background: linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%); border-radius: 16px; padding: 25px; margin: 25px 0; border: 2px solid #dc2626; position: relative;">
          <div style="position: absolute; top: -10px; right: 20px; background: #dc2626; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: 600;">
            URGENTE
          </div>
          <h3 style="color: #fca5a5; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">⏰ Últimas Horas!</h3>
          <p style="color: white; margin: 0; font-size: 16px; line-height: 1.5;">
            Milhares de pessoas já transformaram suas vidas. Não fique de fora desta oportunidade única.
          </p>
        </div>
        
        <!-- Stats Section -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin: 30px 0;">
          <div style="text-align: center; background: rgba(220, 38, 38, 0.1); padding: 20px; border-radius: 12px;">
            <div style="font-size: 24px; font-weight: 700; color: #fca5a5;">98%</div>
            <div style="font-size: 12px; color: #fecaca;">Taxa de Sucesso</div>
          </div>
          <div style="text-align: center; background: rgba(220, 38, 38, 0.1); padding: 20px; border-radius: 12px;">
            <div style="font-size: 24px; font-weight: 700; color: #fca5a5;">2.3k</div>
            <div style="font-size: 12px; color: #fecaca;">Vidas Mudadas</div>
          </div>
          <div style="text-align: center; background: rgba(220, 38, 38, 0.1); padding: 20px; border-radius: 12px;">
            <div style="font-size: 24px; font-weight: 700; color: #fca5a5;">24h</div>
            <div style="font-size: 12px; color: #fecaca;">Restam</div>
          </div>
        </div>
        
        <!-- CTA Button -->
        <div style="text-align: center; margin: 40px 0;">
          <a href="#" style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 18px 50px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 18px; box-shadow: 0 8px 25px rgba(220, 38, 38, 0.4); display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">
            ⚡ Finalizar Agora
          </a>
        </div>
      </div>
    </div>`
  },
  {
    id: 'promotional',
    name: 'Oferta Premium',
    category: 'Vendas',
    gradient: 'from-amber-400 via-orange-500 to-red-600',
    icon: Award,
    subject: '🔥 {nome}, oferta exclusiva: 70% OFF por 6h!',
    content: `<div style="font-family: 'Inter', Arial, sans-serif; max-width: 650px; margin: 0 auto; background: linear-gradient(135deg, #0c0a09 0%, #1c1917 100%); border-radius: 20px; overflow: hidden;">
      <!-- Premium Header -->
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%); padding: 40px 30px; text-align: center; position: relative;">
        <div style="background: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(255,255,255,0.3);">
          <span style="font-size: 32px;">🏆</span>
        </div>
        <h1 style="color: white; font-size: 28px; margin: 0; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Oferta Exclusiva</h1>
        <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 10px 0 0 0;">Especialmente para você, {nome}</p>
      </div>
      
      <!-- Content Section -->
      <div style="padding: 40px 30px; color: white;">
        <p style="font-size: 18px; line-height: 1.6; margin-bottom: 30px; color: #fbbf24;">
          Com base no seu perfil exclusivo do quiz, preparamos uma oferta que vai transformar sua jornada!
        </p>
        
        <!-- Offer Card -->
        <div style="background: linear-gradient(135deg, #451a03 0%, #78350f 100%); border-radius: 20px; padding: 40px; margin: 30px 0; border: 2px solid #f59e0b; text-align: center; position: relative; overflow: hidden;">
          <div style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); background: #dc2626; color: white; padding: 8px 25px; border-radius: 20px; font-size: 14px; font-weight: 700; box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);">
            LIMITADO
          </div>
          
          <div style="margin-top: 20px;">
            <div style="font-size: 48px; font-weight: 900; color: #fbbf24; margin-bottom: 10px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
              70% OFF
            </div>
            <p style="font-size: 20px; color: white; margin: 0; font-weight: 600;">
              Acesso Premium Vitalício
            </p>
            <p style="font-size: 14px; color: #fed7aa; margin: 15px 0 0 0;">
              Válido apenas por <span style="color: #dc2626; font-weight: 700;">6 HORAS</span>
            </p>
          </div>
          
          <!-- Timer -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 25px 0;">
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px;">
              <div style="font-size: 20px; font-weight: 700; color: #fbbf24;">05</div>
              <div style="font-size: 10px; color: #fed7aa;">HORAS</div>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px;">
              <div style="font-size: 20px; font-weight: 700; color: #fbbf24;">42</div>
              <div style="font-size: 10px; color: #fed7aa;">MIN</div>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px;">
              <div style="font-size: 20px; font-weight: 700; color: #fbbf24;">18</div>
              <div style="font-size: 10px; color: #fed7aa;">SEG</div>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px;">
              <div style="font-size: 20px; font-weight: 700; color: #fbbf24;">09</div>
              <div style="font-size: 10px; color: #fed7aa;">MS</div>
            </div>
          </div>
        </div>
        
        <!-- Benefits -->
        <div style="margin: 30px 0;">
          <h3 style="color: #fbbf24; font-size: 18px; margin-bottom: 20px; text-align: center;">🎯 O que você vai receber:</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div style="background: rgba(245, 158, 11, 0.1); padding: 15px; border-radius: 12px; border-left: 3px solid #f59e0b;">
              <div style="font-weight: 600; color: white; font-size: 14px;">✨ Acesso Vitalício</div>
              <div style="color: #fed7aa; font-size: 12px;">Sem mensalidades</div>
            </div>
            <div style="background: rgba(245, 158, 11, 0.1); padding: 15px; border-radius: 12px; border-left: 3px solid #f59e0b;">
              <div style="font-weight: 600; color: white; font-size: 14px;">🎓 Mentoria Premium</div>
              <div style="color: #fed7aa; font-size: 12px;">Suporte 24/7</div>
            </div>
            <div style="background: rgba(245, 158, 11, 0.1); padding: 15px; border-radius: 12px; border-left: 3px solid #f59e0b;">
              <div style="font-weight: 600; color: white; font-size: 14px;">📚 Material Exclusivo</div>
              <div style="color: #fed7aa; font-size: 12px;">Conteúdo VIP</div>
            </div>
            <div style="background: rgba(245, 158, 11, 0.1); padding: 15px; border-radius: 12px; border-left: 3px solid #f59e0b;">
              <div style="font-weight: 600; color: white; font-size: 14px;">🏆 Comunidade Elite</div>
              <div style="color: #fed7aa; font-size: 12px;">Networking exclusivo</div>
            </div>
          </div>
        </div>
        
        <!-- CTA Button -->
        <div style="text-align: center; margin: 40px 0;">
          <a href="#" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 20px 60px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 18px; box-shadow: 0 8px 30px rgba(245, 158, 11, 0.4); display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; transition: all 0.3s ease;">
            🔥 Garantir Desconto
          </a>
          <p style="color: #92400e; font-size: 12px; margin: 15px 0 0 0; font-style: italic;">
            * Oferta válida apenas para os primeiros 50 clientes
          </p>
        </div>
      </div>
    </div>`
  }
];

export default function AdvancedEmailMarketing() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedTab, setSelectedTab] = useState("campaigns");
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [audiencePreview, setAudiencePreview] = useState<AudienceStats | null>(null);
  const [variablePreview, setVariablePreview] = useState<Record<string, any>>({});
  const [showVariableHelper, setShowVariableHelper] = useState(false);
  
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    subject: "",
    content: "",
    quizId: "",
    targetAudience: "all",
    scheduleType: "immediate",
    scheduledAt: "",
    abTestEnabled: false,
    abTestSubject: "",
    personalizedContent: true,
    dateFilter: "",
    segmentationRules: {}
  });

  // Fetch quizzes
  const { data: quizzes = [], isLoading: loadingQuizzes } = useQuery<Quiz[]>({
    queryKey: ['/api/quizzes'],
    enabled: isAuthenticated,
  });

  // Fetch email campaigns
  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery<EmailCampaign[]>({
    queryKey: ['/api/email-campaigns'],
    enabled: isAuthenticated,
  });

  // Fetch quiz variables when quiz is selected
  const { data: quizVariables, isLoading: loadingVariables } = useQuery({
    queryKey: ['/api/quiz', selectedQuiz, 'variables'],
    queryFn: () => apiRequest(`/api/quiz/${selectedQuiz}/variables`),
    enabled: isAuthenticated && !!selectedQuiz,
  });

  // Get audience preview
  const audiencePreviewMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('/api/email-campaigns/preview-audience', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (data) => {
      setAudiencePreview(data.stats);
    },
    onError: (error) => {
      console.error("Audience preview error:", error);
    }
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('/api/email-campaigns/advanced', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "🎉 Campanha criada com sucesso!",
        description: `${data.targetedLeads || 0} leads foram segmentados para esta campanha.`,
      });
      setShowNewCampaignModal(false);
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns'] });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "❌ Erro ao criar campanha",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setNewCampaign({
      name: "",
      subject: "",
      content: "",
      quizId: "",
      targetAudience: "all",
      scheduleType: "immediate",
      scheduledAt: "",
      abTestEnabled: false,
      abTestSubject: "",
      personalizedContent: true,
      dateFilter: "",
      segmentationRules: {}
    });
    setSelectedQuiz("");
    setSelectedTemplate("");
    setAudiencePreview(null);
    setVariablePreview({});
  };

  const handleTemplateSelect = (template: EmailTemplate) => {
    setNewCampaign({
      ...newCampaign,
      subject: template.subject,
      content: template.content
    });
    setSelectedTemplate(template.id);
    toast({
      title: "✨ Template aplicado",
      description: `Template "${template.name}" foi aplicado com sucesso!`,
    });
  };

  const handleQuizSelect = (quizId: string) => {
    setSelectedQuiz(quizId);
    setNewCampaign({
      ...newCampaign,
      quizId
    });
    
    // Preview audience
    audiencePreviewMutation.mutate({
      quizId,
      targetAudience: newCampaign.targetAudience,
      dateFilter: newCampaign.dateFilter
    });
  };

  const handleAudienceChange = (audience: string) => {
    setNewCampaign({
      ...newCampaign,
      targetAudience: audience
    });
    
    if (selectedQuiz) {
      audiencePreviewMutation.mutate({
        quizId: selectedQuiz,
        targetAudience: audience,
        dateFilter: newCampaign.dateFilter
      });
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('campaign-content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newText = before + `{${variable}}` + after;
      
      setNewCampaign({
        ...newCampaign,
        content: newText
      });
      
      // Focus back on textarea
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 2, start + variable.length + 2);
      }, 0);
    }
  };

  // Safe calculation helpers
  const safeAverage = (items: any[], field: string) => {
    if (!Array.isArray(items) || items.length === 0) return "0";
    const sum = items.reduce((acc, item) => acc + (item[field] || 0), 0);
    return (sum / items.length).toFixed(1);
  };

  const safeSum = (items: any[], field: string) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((acc, item) => acc + (item[field] || 0), 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Modern Header */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-blue-500/20 to-purple-600/20 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl shadow-lg">
                  <Rocket className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                    Email Marketing Pro
                  </h1>
                  <p className="mt-2 text-lg text-gray-600 font-medium">
                    Sistema avançado de email marketing com IA e personalização total
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="bg-white/50 backdrop-blur border-white/20 hover:bg-white/80"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </Button>
                <Button
                  onClick={() => setShowNewCampaignModal(true)}
                  className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white border-0 shadow-xl"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Campanha
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          {/* Modern Tab Navigation */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-pink-400/10 to-red-400/10 rounded-2xl blur-lg"></div>
            <TabsList className="relative grid w-full grid-cols-4 bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl p-2">
              <TabsTrigger 
                value="campaigns" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-xl font-medium"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Campanhas
              </TabsTrigger>
              <TabsTrigger 
                value="templates"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-xl font-medium"
              >
                <Palette className="mr-2 h-4 w-4" />
                Templates
              </TabsTrigger>
              <TabsTrigger 
                value="analytics"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white rounded-xl font-medium"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-600 data-[state=active]:to-gray-800 data-[state=active]:text-white rounded-xl font-medium"
              >
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="campaigns" className="space-y-6">
            {/* Premium Stats Cards */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              {[
                {
                  title: "Campanhas Ativas",
                  value: Array.isArray(campaigns) ? campaigns.length : 0,
                  change: "+12%",
                  icon: Mail,
                  gradient: "from-blue-500 to-cyan-500",
                  bgGradient: "from-blue-50 to-cyan-50"
                },
                {
                  title: "Emails Enviados",
                  value: safeSum(campaigns, 'sentCount'),
                  change: "+18%",
                  icon: Send,
                  gradient: "from-emerald-500 to-teal-500",
                  bgGradient: "from-emerald-50 to-teal-50"
                },
                {
                  title: "Taxa de Abertura",
                  value: `${safeAverage(campaigns, 'openRate')}%`,
                  change: "+2.3%",
                  icon: Eye,
                  gradient: "from-purple-500 to-pink-500",
                  bgGradient: "from-purple-50 to-pink-50"
                },
                {
                  title: "Taxa de Cliques",
                  value: `${safeAverage(campaigns, 'clickRate')}%`,
                  change: "+1.2%",
                  icon: MousePointer,
                  gradient: "from-orange-500 to-red-500",
                  bgGradient: "from-orange-50 to-red-50"
                }
              ].map((stat, index) => (
                <Card key={index} className="relative overflow-hidden border-0 shadow-xl">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`}></div>
                  <CardHeader className="relative pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-700">{stat.title}</CardTitle>
                      <div className={`p-2 bg-gradient-to-r ${stat.gradient} rounded-lg shadow-lg`}>
                        <stat.icon className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                    <p className="text-xs text-emerald-600 font-medium">{stat.change} vs mês anterior</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Campaign List */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">Campanhas Ativas</CardTitle>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                    {Array.isArray(campaigns) ? campaigns.length : 0} ativas
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {loadingCampaigns ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">Carregando campanhas...</p>
                    </div>
                  </div>
                ) : !Array.isArray(campaigns) || campaigns.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-2xl"></div>
                      <div className="relative p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl border border-blue-200/50">
                        <Rocket className="mx-auto h-16 w-16 text-blue-500 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Pronto para decolar?</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          Crie sua primeira campanha avançada e veja a mágica acontecer com personalização total e IA
                        </p>
                        <Button 
                          onClick={() => setShowNewCampaignModal(true)}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-xl"
                        >
                          <Lightning className="mr-2 h-4 w-4" />
                          Criar Primeira Campanha
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaigns.map((campaign, index) => (
                      <div key={campaign.id} className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-600/10 rounded-2xl blur-sm group-hover:blur-none transition-all"></div>
                        <div className="relative bg-white/80 backdrop-blur border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all group-hover:scale-[1.02]">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className={`p-2 bg-gradient-to-r ${index % 3 === 0 ? 'from-blue-500 to-cyan-500' : index % 3 === 1 ? 'from-emerald-500 to-teal-500' : 'from-purple-500 to-pink-500'} rounded-lg shadow-lg`}>
                                  <Mail className="h-4 w-4 text-white" />
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg">{campaign.name}</h3>
                              </div>
                              <p className="text-gray-600 mb-3 font-medium">{campaign.subject}</p>
                              <div className="flex items-center gap-4 flex-wrap">
                                <Badge 
                                  variant={campaign.status === 'sent' ? 'default' : 'secondary'}
                                  className={campaign.status === 'sent' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700'}
                                >
                                  {campaign.status === 'sent' ? '✓ Enviada' : campaign.status}
                                </Badge>
                                <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                                  📊 Quiz: {campaign.quizTitle}
                                </span>
                                <span className="text-sm text-gray-500 bg-blue-50 px-3 py-1 rounded-full">
                                  📧 {campaign.emailCount || 0} emails • {campaign.sentCount || 0} enviados
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-emerald-600">{campaign.openRate || 0}%</div>
                                <div className="text-xs text-gray-500 font-medium">Abertura</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{campaign.clickRate || 0}%</div>
                                <div className="text-xs text-gray-500 font-medium">Cliques</div>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="bg-white/50 backdrop-blur border-white/20 hover:bg-white/80 shadow-lg"
                              >
                                <BarChart3 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                    <Palette className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">Templates Premium</CardTitle>
                    <p className="text-sm text-gray-600 font-medium">
                      Templates profissionais otimizados para máxima conversão
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {EMAIL_TEMPLATES.map((template, index) => (
                    <div key={template.id} className="group relative">
                      <div className={`absolute inset-0 bg-gradient-to-r ${template.gradient} opacity-20 rounded-2xl blur-lg group-hover:opacity-30 transition-all`}></div>
                      <div className="relative bg-white/90 backdrop-blur border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all group-hover:scale-[1.02]">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`p-3 bg-gradient-to-r ${template.gradient} rounded-xl shadow-lg`}>
                              <template.icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">{template.name}</h3>
                              <Badge variant="outline" className="mt-1 text-xs">{template.category}</Badge>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4 font-medium bg-gray-50 p-3 rounded-lg">
                          {template.subject}
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleTemplateSelect(template)}
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white border-0"
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Usar Template
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="bg-white/50 backdrop-blur border-white/20 hover:bg-white/80"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-lg">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">Performance Geral</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {[
                      { label: "Taxa de Entrega", value: "98.5%", color: "emerald" },
                      { label: "Taxa de Abertura", value: "24.3%", color: "blue" },
                      { label: "Taxa de Cliques", value: "4.7%", color: "purple" },
                      { label: "Taxa de Conversão", value: "2.1%", color: "orange" }
                    ].map((stat, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <span className="text-sm font-medium text-gray-700">{stat.label}</span>
                        <span className={`text-lg font-bold text-${stat.color}-600`}>{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                      <LineChart className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">Tendências</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-blue-600/20 rounded-full blur-xl"></div>
                      <div className="relative p-6 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl">
                        <TrendingUp className="h-16 w-16 text-emerald-500 mx-auto" />
                      </div>
                    </div>
                    <p className="text-center text-gray-600 font-medium mt-4">
                      Gráficos em tempo real serão exibidos aqui
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-lg">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-t-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-gray-600 to-gray-800 rounded-lg">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">Configurações Gerais</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {[
                    {
                      id: "auto-send",
                      title: "Envio Automático",
                      description: "Enviar campanhas automaticamente quando agendadas",
                      defaultChecked: false
                    },
                    {
                      id: "track-opens",
                      title: "Rastrear Aberturas",
                      description: "Acompanhar quando emails são abertos",
                      defaultChecked: true
                    },
                    {
                      id: "track-clicks",
                      title: "Rastrear Cliques",
                      description: "Acompanhar cliques em links dos emails",
                      defaultChecked: true
                    }
                  ].map((setting, index) => (
                    <div key={setting.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <Label htmlFor={setting.id} className="text-base font-medium text-gray-900">
                          {setting.title}
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                      </div>
                      <Switch id={setting.id} defaultChecked={setting.defaultChecked} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Ultra Modern Campaign Modal */}
        {showNewCampaignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-5xl max-h-[95vh] overflow-y-auto">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/95 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl">
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                          <Rocket className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                            Nova Campanha Avançada
                          </h2>
                          <p className="text-gray-600 font-medium">Crie campanhas personalizadas com IA</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowNewCampaignModal(false)}
                        className="hover:bg-gray-100 rounded-xl"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="space-y-8">
                      {/* Basic Information */}
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="campaign-name" className="text-base font-medium text-gray-900">
                            Nome da Campanha
                          </Label>
                          <Input
                            id="campaign-name"
                            placeholder="Ex: Boas-vindas Nutrição Premium"
                            value={newCampaign.name}
                            onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                            className="bg-white/80 border-white/20 backdrop-blur focus:ring-2 focus:ring-blue-500 rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quiz-select" className="text-base font-medium text-gray-900">
                            Quiz Fonte
                          </Label>
                          <Select value={selectedQuiz} onValueChange={handleQuizSelect}>
                            <SelectTrigger className="bg-white/80 border-white/20 backdrop-blur rounded-xl">
                              <SelectValue placeholder="Selecione um quiz" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.isArray(quizzes) && quizzes.map((quiz) => (
                                <SelectItem key={quiz.id} value={quiz.id}>
                                  {quiz.title} ({quiz.responseCount} respostas)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Subject Line */}
                      <div className="space-y-2">
                        <Label htmlFor="campaign-subject" className="text-base font-medium text-gray-900">
                          Assunto do Email
                        </Label>
                        <Input
                          id="campaign-subject"
                          placeholder="Ex: Olá {nome}, aqui está seu resultado personalizado!"
                          value={newCampaign.subject}
                          onChange={(e) => setNewCampaign({...newCampaign, subject: e.target.value})}
                          className="bg-white/80 border-white/20 backdrop-blur focus:ring-2 focus:ring-blue-500 rounded-xl"
                        />
                      </div>

                      {/* Content Editor */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="campaign-content" className="text-base font-medium text-gray-900">
                            Conteúdo do Email
                          </Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowVariableHelper(!showVariableHelper)}
                            className="bg-white/50 backdrop-blur border-white/20 hover:bg-white/80 rounded-xl"
                          >
                            <Code className="h-4 w-4 mr-2" />
                            Variáveis Disponíveis
                            {showVariableHelper ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                          </Button>
                        </div>
                        
                        {showVariableHelper && quizVariables?.variables && (
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/50">
                            <p className="text-sm font-medium mb-3 text-gray-900">🎯 Variáveis do Quiz:</p>
                            <div className="flex flex-wrap gap-2">
                              {quizVariables.variables.map((variable: string) => (
                                <Button
                                  key={variable}
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => insertVariable(variable)}
                                  className="bg-white/80 hover:bg-blue-100 border-blue-200 text-blue-700 rounded-lg"
                                >
                                  {variable}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <Textarea
                          id="campaign-content"
                          placeholder="Digite o conteúdo do email ou selecione um template..."
                          value={newCampaign.content}
                          onChange={(e) => setNewCampaign({...newCampaign, content: e.target.value})}
                          rows={10}
                          className="bg-white/80 border-white/20 backdrop-blur focus:ring-2 focus:ring-blue-500 rounded-xl"
                        />
                      </div>

                      {/* Campaign Settings */}
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="target-audience" className="text-base font-medium text-gray-900">
                            Público-Alvo
                          </Label>
                          <Select value={newCampaign.targetAudience} onValueChange={handleAudienceChange}>
                            <SelectTrigger className="bg-white/80 border-white/20 backdrop-blur rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">🎯 Todos os Leads</SelectItem>
                              <SelectItem value="completed">✅ Quiz Completo</SelectItem>
                              <SelectItem value="abandoned">⏰ Quiz Abandonado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="schedule-type" className="text-base font-medium text-gray-900">
                            Tipo de Envio
                          </Label>
                          <Select value={newCampaign.scheduleType} onValueChange={(value) => setNewCampaign({...newCampaign, scheduleType: value})}>
                            <SelectTrigger className="bg-white/80 border-white/20 backdrop-blur rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="immediate">🚀 Imediato</SelectItem>
                              <SelectItem value="scheduled">📅 Agendado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="date-filter" className="text-base font-medium text-gray-900">
                            Filtro de Data
                          </Label>
                          <Input
                            id="date-filter"
                            type="date"
                            value={newCampaign.dateFilter}
                            onChange={(e) => setNewCampaign({...newCampaign, dateFilter: e.target.value})}
                            className="bg-white/80 border-white/20 backdrop-blur focus:ring-2 focus:ring-blue-500 rounded-xl"
                          />
                        </div>
                      </div>

                      {/* Audience Preview */}
                      {audiencePreview && (
                        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
                          <CardHeader>
                            <CardTitle className="text-lg text-gray-900 flex items-center">
                              <Target className="mr-2 h-5 w-5 text-blue-600" />
                              Preview da Audiência
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                              {[
                                { label: "Total de Leads", value: audiencePreview.totalLeads, color: "blue" },
                                { label: "Completos", value: audiencePreview.completedLeads, color: "emerald" },
                                { label: "Abandonados", value: audiencePreview.abandonedLeads, color: "orange" },
                                { label: "Taxa Estimada", value: `${audiencePreview.estimatedOpenRate}%`, color: "purple" }
                              ].map((stat, index) => (
                                <div key={index} className="text-center p-4 bg-white/80 rounded-xl">
                                  <div className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</div>
                                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                        <Button 
                          variant="outline" 
                          onClick={() => setShowNewCampaignModal(false)}
                          className="bg-white/50 backdrop-blur border-white/20 hover:bg-white/80 rounded-xl"
                        >
                          Cancelar
                        </Button>
                        <Button 
                          onClick={() => createCampaignMutation.mutate(newCampaign)}
                          disabled={!newCampaign.name || !newCampaign.subject || !newCampaign.content || !selectedQuiz || createCampaignMutation.isPending}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-xl rounded-xl px-8"
                        >
                          {createCampaignMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Criando Magia...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Criar Campanha
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}