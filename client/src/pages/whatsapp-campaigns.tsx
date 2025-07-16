import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Download, 
  RefreshCw, 
  MessageCircle, 
  CheckCircle, 
  Users, 
  Send,
  Plus,
  Play,
  Pause,
  Settings
} from "lucide-react";

interface WhatsAppCampaign {
  id: string;
  name: string;
  quizId: string;
  quizTitle: string;
  status: 'active' | 'paused' | 'completed';
  messages: string[];
  sent: number;
  delivered: number;
  replies: number;
  createdAt: string;
}

interface ExtensionStatus {
  connected: boolean;
  version: string;
  lastPing: string | null;
  pendingMessages: number;
}

export default function WhatsAppCampaignsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [message, setMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Fetch campaigns
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["/api/whatsapp/campaigns"],
    select: (data) => data || []
  });

  // Fetch quizzes
  const { data: quizzes = [] } = useQuery({
    queryKey: ["/api/quizzes"],
    select: (data) => data || []
  });

  // Fetch extension status
  const { data: extensionStatus } = useQuery({
    queryKey: ["/api/extension/status"],
    select: (data) => data || { connected: false, version: "0.0.0", lastPing: null, pendingMessages: 0 }
  });

  // Calculate totals
  const totalSent = campaigns.reduce((sum, campaign) => sum + (campaign.sent || 0), 0);
  const totalDelivered = campaigns.reduce((sum, campaign) => sum + (campaign.delivered || 0), 0);
  const totalReplies = campaigns.reduce((sum, campaign) => sum + (campaign.replies || 0), 0);

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      return apiRequest("POST", "/api/whatsapp/campaigns", campaignData);
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Campanha criada com sucesso!",
      });
      setShowCreateForm(false);
      setCampaignName("");
      setSelectedQuiz("");
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/campaigns"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao criar campanha",
        variant: "destructive",
      });
    }
  });

  const handleCreateCampaign = async () => {
    if (!campaignName || !selectedQuiz || !message) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      await createCampaignMutation.mutateAsync({
        name: campaignName,
        quizId: selectedQuiz,
        messages: [message],
        targetAudience: 'all',
        extensionSettings: {
          delay: 10,
          maxRetries: 3,
          enabled: true
        }
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">WhatsApp Automação</h1>
        <p className="text-gray-600">Envie mensagens automáticas para seus leads do quiz</p>
      </div>

      {/* Step 1: Download Extension */}
      <Card className="mb-6 bg-green-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-green-800 mb-2">📱 1. Baixe a Extensão</h2>
              <p className="text-green-700">Extensão gratuita para Chrome - Automação total</p>
            </div>
            <Button 
              size="lg" 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => window.open('https://chrome.google.com/webstore', '_blank')}
            >
              <Download className="h-5 w-5 mr-2" />
              BAIXAR EXTENSÃO
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Extension Status */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${extensionStatus?.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <h3 className="font-bold">2. Status da Extensão</h3>
                <p className="text-sm text-gray-600">
                  {extensionStatus?.connected ? 
                    `✅ Conectada e funcionando (${extensionStatus.pendingMessages} mensagens na fila)` : 
                    '❌ Desconectada - Instale e ative a extensão'
                  }
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Verificar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{campaigns.length}</div>
            <div className="text-sm text-gray-600">Campanhas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{totalSent}</div>
            <div className="text-sm text-gray-600">Enviadas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{totalDelivered}</div>
            <div className="text-sm text-gray-600">Entregues</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{totalReplies}</div>
            <div className="text-sm text-gray-600">Respostas</div>
          </CardContent>
        </Card>
      </div>

      {/* Step 3: Campaigns */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>📞 3. Suas Campanhas</CardTitle>
              <CardDescription>Gerencie suas campanhas de mensagens</CardDescription>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Campanha
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Create Campaign Form */}
          {showCreateForm && (
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">Criar Nova Campanha</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="campaign-name">Nome da Campanha</Label>
                  <Input
                    id="campaign-name"
                    placeholder="Ex: Campanha de Vendas Janeiro"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="quiz-select">Selecione o Quiz</Label>
                  <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha um quiz" />
                    </SelectTrigger>
                    <SelectContent>
                      {quizzes.map((quiz: any) => (
                        <SelectItem key={quiz.id} value={quiz.id}>
                          {quiz.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    placeholder="Olá! Vi que você fez nosso quiz. Tenho uma proposta especial para você..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCreateCampaign}
                    disabled={isCreating}
                    className="flex-1"
                  >
                    {isCreating ? "Criando..." : "Criar Campanha"}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Campaigns List */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando campanhas...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma campanha criada ainda</p>
              <p className="text-sm text-gray-500">Clique em "Nova Campanha" para começar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign: WhatsAppCampaign) => (
                <Card key={campaign.id} className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{campaign.name}</h3>
                          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                            {campaign.status === 'active' ? 'Ativa' : 'Pausada'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Quiz: {campaign.quizTitle}</p>
                        <div className="flex gap-4 text-sm">
                          <span className="text-green-600">✅ {campaign.sent} enviadas</span>
                          <span className="text-blue-600">📧 {campaign.delivered} entregues</span>
                          <span className="text-purple-600">💬 {campaign.replies} respostas</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Toggle campaign status
                            toast({
                              title: "Funcionalidade em desenvolvimento",
                              description: "Esta funcionalidade será implementada em breve",
                            });
                          }}
                        >
                          {campaign.status === 'active' ? (
                            <>
                              <Pause className="h-4 w-4 mr-1" />
                              Pausar
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-1" />
                              Iniciar
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "Funcionalidade em desenvolvimento",
                              description: "Esta funcionalidade será implementada em breve",
                            });
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}