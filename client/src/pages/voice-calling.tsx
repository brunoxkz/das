import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { 
  Phone, 
  Play, 
  Pause, 
  Trash2, 
  Plus, 
  PhoneCall, 
  Clock, 
  Users, 
  AlertCircle,
  Mic,
  Volume2,
  Timer,
  RotateCcw,
  CheckCircle,
  XCircle,
  FileAudio,
  Upload
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface VoiceCampaign {
  id: string;
  name: string;
  quiz_id: string;
  user_id: string;
  voice_message: string;
  voice_file?: string;
  voice_type: 'tts' | 'recording';
  voice_settings: any;
  phones: any[];
  status: 'active' | 'paused' | 'completed' | 'draft';
  sent: number;
  answered: number;
  voicemail: number;
  busy: number;
  failed: number;
  duration: number;
  scheduled_at?: number;
  target_audience: 'all' | 'completed' | 'abandoned';
  campaign_mode: 'modo_ao_vivo' | 'leads_ja_na_base';
  trigger_delay: number;
  trigger_unit: 'minutes' | 'hours' | 'days';
  max_retries: number;
  retry_delay: number;
  call_timeout: number;
  created_at: number;
  updated_at: number;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
}

export default function VoiceCalling() {
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("campaigns");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showLogsDialog, setShowLogsDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<VoiceCampaign | null>(null);
  const [campaignLogs, setCampaignLogs] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    quizId: "",
    voiceMessage: "",
    voiceFile: "",
    voiceType: "tts" as "tts" | "recording",
    voiceSettings: {
      voice: "pt-BR-FranciscaNeural",
      rate: "1.0",
      pitch: "0Hz",
      volume: "100"
    },
    targetAudience: "all" as "all" | "completed" | "abandoned",
    campaignMode: "leads_ja_na_base" as "modo_ao_vivo" | "leads_ja_na_base",
    triggerDelay: 10,
    triggerUnit: "minutes" as "minutes" | "hours" | "days",
    maxRetries: 3,
    retryDelay: 60,
    callTimeout: 30,
    fromDate: ""
  });

  // Queries
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ["/api/voice-campaigns"],
  });

  const { data: quizzes, isLoading: quizzesLoading } = useQuery({
    queryKey: ["/api/quizzes"],
  });

  // Mutations
  const createCampaignMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/voice-campaigns", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/voice-campaigns"] });
      setShowCreateDialog(false);
      resetForm();
      toast({ title: "Campanha criada com sucesso!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao criar campanha", 
        description: error.message || "Tente novamente",
        variant: "destructive"
      });
    }
  });

  const pauseCampaignMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/voice-campaigns/${id}/pause`, "PUT"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/voice-campaigns"] });
      toast({ title: "Campanha pausada com sucesso!" });
    }
  });

  const resumeCampaignMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/voice-campaigns/${id}/resume`, "PUT"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/voice-campaigns"] });
      toast({ title: "Campanha retomada com sucesso!" });
    }
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/voice-campaigns/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/voice-campaigns"] });
      toast({ title: "Campanha deletada com sucesso!" });
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      quizId: "",
      voiceMessage: "",
      voiceFile: "",
      voiceType: "tts",
      voiceSettings: {
        voice: "pt-BR-FranciscaNeural",
        rate: "1.0",
        pitch: "0Hz",
        volume: "100"
      },
      targetAudience: "all",
      campaignMode: "leads_ja_na_base",
      triggerDelay: 10,
      triggerUnit: "minutes",
      maxRetries: 3,
      retryDelay: 60,
      callTimeout: 30,
      fromDate: ""
    });
  };

  const handleCreateCampaign = () => {
    if (!formData.name || !formData.quizId || !formData.voiceMessage) {
      toast({ 
        title: "Campos obrigatórios", 
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    createCampaignMutation.mutate(formData);
  };

  const handleShowLogs = async (campaign: VoiceCampaign) => {
    try {
      const logs = await apiRequest(`/api/voice-campaigns/${campaign.id}/logs`, "GET");
      setCampaignLogs(logs);
      setSelectedCampaign(campaign);
      setShowLogsDialog(true);
    } catch (error) {
      toast({ 
        title: "Erro ao carregar logs", 
        description: "Tente novamente",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "paused": return "bg-yellow-500";
      case "completed": return "bg-blue-500";
      case "draft": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Ativa";
      case "paused": return "Pausada";
      case "completed": return "Concluída";
      case "draft": return "Rascunho";
      default: return status;
    }
  };

  const calculateAnswerRate = (campaign: VoiceCampaign) => {
    const total = campaign.answered + campaign.voicemail + campaign.busy + campaign.failed;
    return total > 0 ? Math.round((campaign.answered / total) * 100) : 0;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Voice Calling
          </h1>
          <p className="text-gray-600 mt-2">
            Remarketing por voz com TTS e gravações personalizadas
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Nova Campanha
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Campanha de Voice Calling</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome da Campanha *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Nome da campanha"
                  />
                </div>
                <div>
                  <Label htmlFor="quiz">Quiz *</Label>
                  <Select value={formData.quizId} onValueChange={(value) => setFormData({...formData, quizId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o quiz" />
                    </SelectTrigger>
                    <SelectContent>
                      {quizzes?.map((quiz: Quiz) => (
                        <SelectItem key={quiz.id} value={quiz.id}>{quiz.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="voiceType">Tipo de Voz</Label>
                <Select value={formData.voiceType} onValueChange={(value: "tts" | "recording") => setFormData({...formData, voiceType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tts">
                      <div className="flex items-center">
                        <Mic className="mr-2 h-4 w-4" />
                        TTS (Texto para Fala)
                      </div>
                    </SelectItem>
                    <SelectItem value="recording">
                      <div className="flex items-center">
                        <FileAudio className="mr-2 h-4 w-4" />
                        Gravação de Áudio
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.voiceType === "tts" ? (
                <div>
                  <Label htmlFor="voiceMessage">Mensagem de Voz *</Label>
                  <Textarea
                    id="voiceMessage"
                    value={formData.voiceMessage}
                    onChange={(e) => setFormData({...formData, voiceMessage: e.target.value})}
                    placeholder="Digite a mensagem que será convertida em voz..."
                    rows={4}
                  />
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="voice">Voz</Label>
                      <Select 
                        value={formData.voiceSettings.voice} 
                        onValueChange={(value) => setFormData({
                          ...formData, 
                          voiceSettings: {...formData.voiceSettings, voice: value}
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pt-BR-FranciscaNeural">Francisca (Feminina)</SelectItem>
                          <SelectItem value="pt-BR-AntonioNeural">Antonio (Masculina)</SelectItem>
                          <SelectItem value="pt-BR-BrendaNeural">Brenda (Feminina)</SelectItem>
                          <SelectItem value="pt-BR-DonatoNeural">Donato (Masculina)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="rate">Velocidade</Label>
                      <Select 
                        value={formData.voiceSettings.rate} 
                        onValueChange={(value) => setFormData({
                          ...formData, 
                          voiceSettings: {...formData.voiceSettings, rate: value}
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.8">Lenta</SelectItem>
                          <SelectItem value="1.0">Normal</SelectItem>
                          <SelectItem value="1.2">Rápida</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="voiceFile">Arquivo de Áudio *</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="voiceFile"
                      type="file"
                      accept=".mp3,.wav,.ogg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFormData({...formData, voiceFile: file.name, voiceMessage: `Arquivo: ${file.name}`});
                        }
                      }}
                    />
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetAudience">Público-Alvo</Label>
                  <Select value={formData.targetAudience} onValueChange={(value: any) => setFormData({...formData, targetAudience: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Leads</SelectItem>
                      <SelectItem value="completed">Quiz Completos</SelectItem>
                      <SelectItem value="abandoned">Quiz Abandonados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="campaignMode">Modo da Campanha</Label>
                  <Select value={formData.campaignMode} onValueChange={(value: any) => setFormData({...formData, campaignMode: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leads_ja_na_base">Leads já na Base</SelectItem>
                      <SelectItem value="modo_ao_vivo">Modo ao Vivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="triggerDelay">Delay</Label>
                  <Input
                    id="triggerDelay"
                    type="number"
                    value={formData.triggerDelay}
                    onChange={(e) => setFormData({...formData, triggerDelay: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="triggerUnit">Unidade</Label>
                  <Select value={formData.triggerUnit} onValueChange={(value: any) => setFormData({...formData, triggerUnit: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutos</SelectItem>
                      <SelectItem value="hours">Horas</SelectItem>
                      <SelectItem value="days">Dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="callTimeout">Timeout (seg)</Label>
                  <Input
                    id="callTimeout"
                    type="number"
                    value={formData.callTimeout}
                    onChange={(e) => setFormData({...formData, callTimeout: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxRetries">Máx. Tentativas</Label>
                  <Input
                    id="maxRetries"
                    type="number"
                    value={formData.maxRetries}
                    onChange={(e) => setFormData({...formData, maxRetries: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="retryDelay">Delay entre Tentativas (min)</Label>
                  <Input
                    id="retryDelay"
                    type="number"
                    value={formData.retryDelay}
                    onChange={(e) => setFormData({...formData, retryDelay: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="fromDate">Filtrar por Data (opcional)</Label>
                <Input
                  id="fromDate"
                  type="date"
                  value={formData.fromDate}
                  onChange={(e) => setFormData({...formData, fromDate: e.target.value})}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateCampaign}
                  disabled={createCampaignMutation.isPending}
                >
                  {createCampaignMutation.isPending ? "Criando..." : "Criar Campanha"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          {campaignsLoading ? (
            <div className="text-center py-8">Carregando campanhas...</div>
          ) : campaigns?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <PhoneCall className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma campanha encontrada</h3>
                <p className="text-gray-600 mb-4">Crie sua primeira campanha de voice calling</p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Campanha
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns?.map((campaign: VoiceCampaign) => (
                <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{campaign.name}</CardTitle>
                        <Badge className={`${getStatusColor(campaign.status)} text-white mt-1`}>
                          {getStatusText(campaign.status)}
                        </Badge>
                      </div>
                      <div className="flex space-x-1">
                        {campaign.status === "active" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => pauseCampaignMutation.mutate(campaign.id)}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resumeCampaignMutation.mutate(campaign.id)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteCampaignMutation.mutate(campaign.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Tipo:</span>
                        <Badge variant="outline" className="flex items-center">
                          {campaign.voice_type === "tts" ? (
                            <><Mic className="mr-1 h-3 w-3" /> TTS</>
                          ) : (
                            <><FileAudio className="mr-1 h-3 w-3" /> Gravação</>
                          )}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Telefones:</span>
                        <span className="font-medium">{campaign.phones?.length || 0}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center">
                          <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                          <span>{campaign.answered}</span>
                        </div>
                        <div className="flex items-center">
                          <Volume2 className="mr-1 h-3 w-3 text-blue-500" />
                          <span>{campaign.voicemail}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3 text-yellow-500" />
                          <span>{campaign.busy}</span>
                        </div>
                        <div className="flex items-center">
                          <XCircle className="mr-1 h-3 w-3 text-red-500" />
                          <span>{campaign.failed}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Taxa de Resposta:</span>
                        <span className="font-medium text-green-600">
                          {calculateAnswerRate(campaign)}%
                        </span>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleShowLogs(campaign)}
                      >
                        Ver Logs
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-600">Total de Campanhas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {campaigns?.length || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-600">Chamadas Atendidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {campaigns?.reduce((total: number, campaign: VoiceCampaign) => total + campaign.answered, 0) || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-600">Correio de Voz</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {campaigns?.reduce((total: number, campaign: VoiceCampaign) => total + campaign.voicemail, 0) || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-600">Taxa Média de Resposta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {campaigns?.length > 0 ? 
                    Math.round(campaigns.reduce((total: number, campaign: VoiceCampaign) => 
                      total + calculateAnswerRate(campaign), 0) / campaigns.length) : 0
                  }%
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Logs Dialog */}
      <Dialog open={showLogsDialog} onOpenChange={setShowLogsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Logs da Campanha: {selectedCampaign?.name}</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {campaignLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum log encontrado para esta campanha
              </div>
            ) : (
              <div className="space-y-2">
                {campaignLogs.map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{log.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline" 
                        className={`${
                          log.status === 'answered' ? 'border-green-500 text-green-700' :
                          log.status === 'voicemail' ? 'border-blue-500 text-blue-700' :
                          log.status === 'busy' ? 'border-yellow-500 text-yellow-700' :
                          log.status === 'failed' ? 'border-red-500 text-red-700' :
                          'border-gray-500 text-gray-700'
                        }`}
                      >
                        {log.status}
                      </Badge>
                      {log.call_duration && (
                        <span className="text-sm text-gray-500">
                          {log.call_duration}s
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}