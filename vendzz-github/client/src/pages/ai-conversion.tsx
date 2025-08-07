import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Video, 
  Play, 
  Pause, 
  Settings, 
  Sparkles, 
  Users, 
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Bot,
  Target,
  Zap
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Quiz {
  id: string;
  title: string;
  isPublished: boolean;
  createdAt: string;
}

interface AIConversionCampaign {
  id: string;
  name: string;
  quizId: string;
  quizTitle: string;
  scriptTemplate: string;
  heygenAvatar: string;
  heygenVoice: string;
  isActive: boolean;
  createdAt: string;
  stats: {
    totalGenerated: number;
    totalViews: number;
    conversionRate: number;
  };
}

interface Variable {
  name: string;
  type: string;
  sample: string;
}

export default function AIConversionPage() {
  const [selectedQuiz, setSelectedQuiz] = useState<string>('');
  const [campaignName, setCampaignName] = useState('');
  const [scriptTemplate, setScriptTemplate] = useState('');
  const [heygenAvatar, setHeygenAvatar] = useState('avatar_1');
  const [heygenVoice, setHeygenVoice] = useState('voice_1');
  const [variables, setVariables] = useState<Variable[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch quizzes
  const { data: quizzes = [], isLoading: loadingQuizzes } = useQuery<Quiz[]>({
    queryKey: ['/api/quizzes'],
    enabled: true
  });

  // Fetch AI campaigns
  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery<AIConversionCampaign[]>({
    queryKey: ['/api/ai-conversion-campaigns'],
    enabled: true
  });

  // Fetch variables for selected quiz
  const { data: quizVariables = [] } = useQuery<Variable[]>({
    queryKey: ['/api/quizzes', selectedQuiz, 'variables'],
    enabled: !!selectedQuiz
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      return apiRequest('/api/ai-conversion-campaigns', {
        method: 'POST',
        body: JSON.stringify(campaignData)
      });
    },
    onSuccess: () => {
      toast({
        title: "Campanha criada com sucesso!",
        description: "A campanha de I.A. Conversion está ativa.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-conversion-campaigns'] });
      // Reset form
      setCampaignName('');
      setScriptTemplate('');
      setSelectedQuiz('');
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar campanha",
        description: error.message || "Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Toggle campaign status
  const toggleCampaignMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiRequest(`/api/ai-conversion-campaigns/${id}/toggle`, {
        method: 'PUT',
        body: JSON.stringify({ isActive })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-conversion-campaigns'] });
    }
  });

  // Update variables when quiz changes
  useEffect(() => {
    if (quizVariables.length > 0) {
      setVariables(quizVariables);
    }
  }, [quizVariables]);

  // Insert variable into script
  const insertVariable = (variableName: string) => {
    const textarea = document.getElementById('scriptTemplate') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newText = before + `{${variableName}}` + after;
      setScriptTemplate(newText);
      
      // Focus and set cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variableName.length + 2, start + variableName.length + 2);
      }, 0);
    }
  };

  // Generate preview text
  const generatePreview = () => {
    let previewText = scriptTemplate;
    variables.forEach(variable => {
      previewText = previewText.replace(
        new RegExp(`{${variable.name}}`, 'g'),
        variable.sample || `[${variable.name}]`
      );
    });
    return previewText;
  };

  // Handle campaign creation
  const handleCreateCampaign = () => {
    if (!campaignName.trim()) {
      toast({
        title: "Nome da campanha obrigatório",
        description: "Digite um nome para sua campanha.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedQuiz) {
      toast({
        title: "Quiz não selecionado",
        description: "Selecione um quiz para sua campanha.",
        variant: "destructive"
      });
      return;
    }

    if (!scriptTemplate.trim()) {
      toast({
        title: "Script não definido",
        description: "Digite o texto que será falado no vídeo.",
        variant: "destructive"
      });
      return;
    }

    const selectedQuizData = quizzes.find(q => q.id === selectedQuiz);
    
    createCampaignMutation.mutate({
      name: campaignName,
      quizId: selectedQuiz,
      quizTitle: selectedQuizData?.title || 'Quiz',
      scriptTemplate,
      heygenAvatar,
      heygenVoice,
      isActive: true
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">I.A. CONVERSION +</h1>
            <p className="text-gray-600">Vídeos personalizados com inteligência artificial para cada lead</p>
          </div>
        </div>
        
        <Alert>
          <Bot className="h-4 w-4" />
          <AlertDescription>
            <strong>Como funciona:</strong> Selecione um funil, monte seu texto personalizado usando variáveis dos leads, 
            e nossa I.A. gerará vídeos únicos para cada nova pessoa que responder seu quiz.
          </AlertDescription>
        </Alert>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de Criação */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Nova Campanha I.A.
              </CardTitle>
              <CardDescription>
                Configure sua campanha de vídeos personalizados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nome da Campanha */}
              <div className="space-y-2">
                <Label htmlFor="campaignName">Nome da Campanha</Label>
                <Input
                  id="campaignName"
                  placeholder="Ex: Conversão VIP, Follow-up Premium..."
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>

              {/* Seleção do Quiz */}
              <div className="space-y-2">
                <Label htmlFor="quizSelect">Selecionar Funil (Quiz)</Label>
                <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um quiz publicado" />
                  </SelectTrigger>
                  <SelectContent>
                    {quizzes
                      .filter(quiz => quiz.isPublished)
                      .map(quiz => (
                        <SelectItem key={quiz.id} value={quiz.id}>
                          {quiz.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Variáveis Disponíveis */}
              {selectedQuiz && variables.length > 0 && (
                <div className="space-y-2">
                  <Label>Variáveis Disponíveis</Label>
                  <div className="flex flex-wrap gap-2">
                    {variables.map(variable => (
                      <Badge 
                        key={variable.name}
                        variant="secondary"
                        className="cursor-pointer hover:bg-purple-100"
                        onClick={() => insertVariable(variable.name)}
                      >
                        {variable.name}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    Clique em uma variável para inserir no seu texto
                  </p>
                </div>
              )}

              {/* Script Template */}
              <div className="space-y-2">
                <Label htmlFor="scriptTemplate">Texto do Vídeo</Label>
                <Textarea
                  id="scriptTemplate"
                  placeholder="Ex: Olá {nome}! Vi que você tem interesse em {produto_interesse}. Preparei uma oferta especial para você..."
                  value={scriptTemplate}
                  onChange={(e) => setScriptTemplate(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-sm text-gray-500">
                  Use variáveis como {"{nome}"} ou {"{email}"} para personalizar o vídeo
                </p>
              </div>

              {/* Configurações do Avatar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar HeyGen</Label>
                  <Select value={heygenAvatar} onValueChange={setHeygenAvatar}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="avatar_1">Avatar Feminino - Professional</SelectItem>
                      <SelectItem value="avatar_2">Avatar Masculino - Casual</SelectItem>
                      <SelectItem value="avatar_3">Avatar Feminino - Executiva</SelectItem>
                      <SelectItem value="avatar_4">Avatar Masculino - Formal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voice">Voz</Label>
                  <Select value={heygenVoice} onValueChange={setHeygenVoice}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="voice_1">Feminina - Profissional</SelectItem>
                      <SelectItem value="voice_2">Masculina - Amigável</SelectItem>
                      <SelectItem value="voice_3">Feminina - Carismática</SelectItem>
                      <SelectItem value="voice_4">Masculina - Autoritária</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Preview */}
              {scriptTemplate && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Preview do Texto</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      {showPreview ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {showPreview ? 'Ocultar' : 'Mostrar'} Preview
                    </Button>
                  </div>
                  
                  {showPreview && (
                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Como ficará para um lead:
                      </p>
                      <p className="text-gray-800 leading-relaxed">
                        {generatePreview()}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Botão de Criação */}
              <Button 
                onClick={handleCreateCampaign}
                disabled={createCampaignMutation.isPending}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {createCampaignMutation.isPending ? (
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Criar Campanha I.A.
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Campanhas Ativas */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Campanhas Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingCampaigns ? (
                <div className="flex items-center justify-center py-8">
                  <Clock className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Video className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma campanha criada ainda</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.map(campaign => (
                    <div key={campaign.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium">{campaign.name}</h3>
                          <p className="text-sm text-gray-500">{campaign.quizTitle}</p>
                        </div>
                        <Switch
                          checked={campaign.isActive}
                          onCheckedChange={(checked) => 
                            toggleCampaignMutation.mutate({
                              id: campaign.id,
                              isActive: checked
                            })
                          }
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center">
                          <div className="font-medium text-purple-600">
                            {campaign.stats.totalGenerated}
                          </div>
                          <div className="text-gray-500">Vídeos</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-blue-600">
                            {campaign.stats.totalViews}
                          </div>
                          <div className="text-gray-500">Visualizações</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-green-600">
                            {campaign.stats.conversionRate}%
                          </div>
                          <div className="text-gray-500">Conversão</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Estatísticas Gerais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Estatísticas Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {campaigns.reduce((sum, c) => sum + c.stats.totalGenerated, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Vídeos Gerados</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {campaigns.reduce((sum, c) => sum + c.stats.totalViews, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Visualizações</div>
                </div>
              </div>
              
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {campaigns.length > 0 ? 
                    Math.round(campaigns.reduce((sum, c) => sum + c.stats.conversionRate, 0) / campaigns.length) : 0
                  }%
                </div>
                <div className="text-sm text-gray-600">Taxa de Conversão Média</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}