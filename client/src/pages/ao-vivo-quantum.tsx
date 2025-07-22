import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Zap, Target, Settings, Play, Pause, Bell, User } from "lucide-react";

export default function AoVivoQuantum() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("create-live");
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [availableVariables, setAvailableVariables] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState({ fieldId: "", responseValue: "" });

  // Form states
  const [campaignName, setCampaignName] = useState("");
  const [campaignMessage, setCampaignMessage] = useState("");
  const [targetType, setTargetType] = useState("lead"); // 'lead' ou 'admin'

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

  // Buscar campanhas Quantum existentes (apenas live)
  const { data: quantumCampaigns, isLoading: loadingCampaigns, refetch } = useQuery({
    queryKey: ['/api/sms-quantum/campaigns'],
    select: (data) => ({
      campaigns: data?.campaigns?.filter(campaign => campaign.quantumType === 'live') || []
    })
  });

  // Mutation para criar campanha Ao Vivo Quantum
  const createLiveMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/sms-quantum/live/create', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "⚡ Ao Vivo Quantum Criado!",
        description: "Sistema está monitorando completions automaticamente"
      });
      refetch();
      // Reset form
      setCampaignName("");
      setCampaignMessage("");
      setSelectedQuiz("");
      setSelectedFilter({ fieldId: "", responseValue: "" });
      setTargetType("lead");
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar Ao Vivo Quantum",
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

  const handleCreateLive = () => {
    if (!selectedQuiz || !selectedFilter.fieldId || !selectedFilter.responseValue || !campaignName || !campaignMessage) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para criar a campanha",
        variant: "destructive"
      });
      return;
    }

    createLiveMutation.mutate({
      name: campaignName,
      message: campaignMessage,
      quizId: selectedQuiz,
      quantumFilters: selectedFilter,
      targetType
    });
  };

  const handleToggleCampaign = (id: string, currentStatus: string) => {
    const action = currentStatus === 'monitoring' ? 'pause' : 'activate';
    toggleCampaignMutation.mutate({ id, action });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'monitoring': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTargetMessage = () => {
    if (targetType === 'lead') {
      return "SMS será enviado automaticamente para o lead que completar o quiz com a resposta específica";
    } else {
      return "SMS será enviado para você (admin) quando alguém completar o quiz com a resposta específica";
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Ao Vivo Quantum</h1>
            <p className="text-muted-foreground">SMS instantâneo quando quiz é completado com condições específicas</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create-live" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Criar Ao Vivo Quantum
          </TabsTrigger>
          <TabsTrigger value="manage-campaigns" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Campanhas Monitorando
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create-live" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Nova Campanha Ao Vivo Quantum
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Seleção de Quiz */}
              <div className="space-y-2">
                <Label>Quiz para Monitorar</Label>
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

              {/* Condição de Trigger */}
              {selectedQuiz && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Condição para Disparo</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Campo para Monitorar</Label>
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
                              {variable.fieldId}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Resposta que Dispara</Label>
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
                                {response.value} ({response.count} leads históricos)
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {selectedFilter.fieldId && selectedFilter.responseValue && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Trigger configurado:</strong> Quando alguém responder "{selectedFilter.responseValue}" 
                        no campo "{selectedFilter.fieldId}", o SMS será enviado automaticamente.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tipo de Alvo */}
              <div className="space-y-4">
                <Label>Para quem enviar o SMS?</Label>
                <RadioGroup value={targetType} onValueChange={setTargetType}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lead" id="lead" />
                    <Label htmlFor="lead" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Para o Lead (pessoa que completou o quiz)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin" className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Para você (notificação admin)
                    </Label>
                  </div>
                </RadioGroup>
                
                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                  {getTargetMessage()}
                </div>
              </div>

              {/* Configurações da Campanha */}
              <div className="space-y-2">
                <Label>Nome da Campanha</Label>
                <Input
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="Ex: Ao Vivo - Interesse Emagrecimento"
                />
              </div>

              <div className="space-y-2">
                <Label>Mensagem SMS</Label>
                <Textarea
                  value={campaignMessage}
                  onChange={(e) => setCampaignMessage(e.target.value)}
                  placeholder={targetType === 'lead' ? 
                    "Olá {nome}! Vi que você tem interesse em {resposta}. Vamos conversar?" :
                    "🔥 LEAD AO VIVO: {nome} respondeu {resposta} no quiz {quiz}!"
                  }
                  rows={4}
                />
                <p className="text-sm text-muted-foreground">
                  Variáveis disponíveis: {"{nome}"}, {"{resposta}"}, {"{quiz}"}
                  {targetType === 'admin' && " - Mensagem será enviada para seu WhatsApp cadastrado"}
                </p>
              </div>

              <Button 
                onClick={handleCreateLive}
                disabled={createLiveMutation.isPending}
                className="w-full"
                size="lg"
              >
                {createLiveMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Criar Ao Vivo Quantum
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage-campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campanhas Ao Vivo Monitorando</CardTitle>
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
                            {campaign.status === 'monitoring' ? '👁️ Monitorando' : 'Pausado'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleCampaign(campaign.id, campaign.status)}
                            disabled={toggleCampaignMutation.isPending}
                          >
                            {campaign.status === 'monitoring' ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <strong>Condição:</strong> Quando "{campaign.quantumFilters?.responseValue}" 
                          for respondido em "{campaign.quantumFilters?.fieldId}"
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-muted-foreground">
                          <div>
                            <strong>Alvo:</strong> {campaign.quantumConfig?.targetType === 'lead' ? 'Lead' : 'Admin'}
                          </div>
                          <div>
                            <strong>Enviados:</strong> {campaign.sent || 0} SMS
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(!quantumCampaigns?.campaigns || quantumCampaigns.campaigns.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma campanha Ao Vivo Quantum criada ainda</p>
                      <p className="text-sm mt-2">Crie uma para começar a monitorar quiz completions automaticamente</p>
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