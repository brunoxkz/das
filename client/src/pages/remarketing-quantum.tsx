import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Rocket, Zap, Target, Settings, Play, Pause } from "lucide-react";

export default function RemarketingQuantum() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("create-remarketing");
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [availableVariables, setAvailableVariables] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState({ fieldId: "", responseValue: "" });

  // Form states
  const [campaignName, setCampaignName] = useState("");
  const [campaignMessage, setCampaignMessage] = useState("");
  const [scheduleType, setScheduleType] = useState("immediate");
  const [delay, setDelay] = useState(0);
  const [delayUnit, setDelayUnit] = useState("minutes");

  // Buscar quizzes do usuário
  const { data: quizzes, isLoading: loadingQuizzes } = useQuery({
    queryKey: ['/api/quizzes'],
    select: (data) => data?.quizzes || []
  });

  // Buscar variáveis Ultra quando quiz é selecionado
  const { data: variablesData, isLoading: loadingVariables } = useQuery({
    queryKey: ['/api/quizzes', selectedQuiz, 'variables-ultra'],
    enabled: !!selectedQuiz,
    select: (data) => data?.variables || []
  });

  // Buscar campanhas Quantum existentes
  const { data: quantumCampaigns, isLoading: loadingCampaigns, refetch } = useQuery({
    queryKey: ['/api/sms-quantum/campaigns']
  });

  // Mutation para criar campanha Remarketing Quantum
  const createRemarketingMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/sms-quantum/remarketing/create', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "🔥 Remarketing Quantum Criado!",
        description: "Campanha ultra-segmentada criada com sucesso"
      });
      refetch();
      // Reset form
      setCampaignName("");
      setCampaignMessage("");
      setSelectedQuiz("");
      setSelectedFilter({ fieldId: "", responseValue: "" });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar Remarketing Quantum",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Mutation para toggle campanha
  const toggleCampaignMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string, action: string }) => {
      return apiRequest(`/api/sms-quantum/${id}/toggle`, {
        method: 'PUT',
        body: JSON.stringify({ action })
      });
    },
    onSuccess: () => {
      toast({
        title: "Campanha atualizada",
        description: "Status da campanha alterado com sucesso"
      });
      refetch();
    }
  });

  // Atualizar variáveis quando quiz muda
  useEffect(() => {
    if (variablesData) {
      setAvailableVariables(variablesData);
      setSelectedFilter({ fieldId: "", responseValue: "" });
    }
  }, [variablesData]);

  const handleCreateRemarketing = () => {
    if (!selectedQuiz || !selectedFilter.fieldId || !selectedFilter.responseValue || !campaignName || !campaignMessage) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para criar a campanha",
        variant: "destructive"
      });
      return;
    }

    createRemarketingMutation.mutate({
      name: campaignName,
      message: campaignMessage,
      quizId: selectedQuiz,
      quantumFilters: selectedFilter,
      scheduleType,
      delay,
      delayUnit
    });
  };

  const handleToggleCampaign = (id: string, currentStatus: string) => {
    const action = currentStatus === 'active' || currentStatus === 'monitoring' ? 'pause' : 'activate';
    toggleCampaignMutation.mutate({ id, action });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'monitoring': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Remarketing Quantum</h1>
            <p className="text-muted-foreground">Campanhas SMS ultra-segmentadas baseadas no Sistema Ultra</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create-remarketing" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Criar Remarketing Quantum
          </TabsTrigger>
          <TabsTrigger value="manage-campaigns" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Gerenciar Campanhas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create-remarketing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Nova Campanha Remarketing Quantum
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Seleção de Quiz */}
              <div className="space-y-2">
                <Label>Quiz para Segmentação</Label>
                <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um quiz" />
                  </SelectTrigger>
                  <SelectContent>
                    {quizzes?.map((quiz) => (
                      <SelectItem key={quiz.id} value={quiz.id}>
                        {quiz.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro Ultra Granular */}
              {selectedQuiz && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Campo para Filtrar</Label>
                    <Select 
                      value={selectedFilter.fieldId} 
                      onValueChange={(value) => setSelectedFilter({ ...selectedFilter, fieldId: value, responseValue: "" })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um campo" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableVariables?.map((variable) => (
                          <SelectItem key={variable.fieldId} value={variable.fieldId}>
                            {variable.fieldId} ({variable.totalResponses} respostas)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Valor da Resposta</Label>
                    <Select 
                      value={selectedFilter.responseValue} 
                      onValueChange={(value) => setSelectedFilter({ ...selectedFilter, responseValue: value })}
                      disabled={!selectedFilter.fieldId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma resposta" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableVariables
                          ?.find(v => v.fieldId === selectedFilter.fieldId)
                          ?.responses?.map((response) => (
                            <SelectItem key={response.value} value={response.value}>
                              {response.value} ({response.count} leads)
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Configurações da Campanha */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome da Campanha</Label>
                  <Input
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Ex: Remarketing Emagrecimento"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Agendamento</Label>
                  <Select value={scheduleType} onValueChange={setScheduleType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Enviar Imediatamente</SelectItem>
                      <SelectItem value="delayed">Enviar com Delay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {scheduleType === "delayed" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Delay</Label>
                    <Input
                      type="number"
                      value={delay}
                      onChange={(e) => setDelay(Number(e.target.value))}
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unidade</Label>
                    <Select value={delayUnit} onValueChange={setDelayUnit}>
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
                </div>
              )}

              <div className="space-y-2">
                <Label>Mensagem SMS</Label>
                <Textarea
                  value={campaignMessage}
                  onChange={(e) => setCampaignMessage(e.target.value)}
                  placeholder="Use variáveis: {nome}, {resposta}, {quiz}"
                  rows={4}
                />
                <p className="text-sm text-muted-foreground">
                  Variáveis disponíveis: {"{nome}"}, {"{resposta}"}, {"{quiz}"}
                </p>
              </div>

              <Button 
                onClick={handleCreateRemarketing}
                disabled={createRemarketingMutation.isPending}
                className="w-full"
                size="lg"
              >
                {createRemarketingMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Rocket className="w-4 h-4 mr-2" />
                )}
                Criar Remarketing Quantum
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage-campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campanhas Quantum Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingCampaigns ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {quantumCampaigns?.campaigns?.map((campaign) => (
                    <div key={campaign.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{campaign.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(campaign.status)}>
                            {campaign.status === 'monitoring' ? 'Monitorando' : 
                             campaign.status === 'active' ? 'Ativo' :
                             campaign.status === 'paused' ? 'Pausado' : campaign.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleCampaign(campaign.id, campaign.status)}
                            disabled={toggleCampaignMutation.isPending}
                          >
                            {campaign.status === 'active' || campaign.status === 'monitoring' ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                          <strong>Tipo:</strong> {campaign.quantumType === 'remarketing' ? 'Remarketing' : 'Ao Vivo'}
                        </div>
                        <div>
                          <strong>Enviados:</strong> {campaign.sent || 0}
                        </div>
                        <div>
                          <strong>Telefones:</strong> {campaign.phonesCount || 0}
                        </div>
                        <div>
                          <strong>Filtro:</strong> {campaign.quantumFilters?.fieldId} = {campaign.quantumFilters?.responseValue}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(!quantumCampaigns?.campaigns || quantumCampaigns.campaigns.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma campanha Quantum criada ainda
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}