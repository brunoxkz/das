import { useState } from "react";
import { useAuth } from "@/hooks/useAuth-jwt";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Send, 
  DollarSign, 
  Eye, 
  Users, 
  CheckCircle, 
  XCircle, 
  Plus, 
  TrendingUp, 
  Clock,
  CreditCard,
  FileText,
  BarChart3,
  Sparkles
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CampaignStyleSelector } from "@/components/campaign-style-selector";
import { SimpleSMSCampaignModal } from "@/components/simple-sms-campaign-modal";

export default function SMSCampaignsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showCampaignStyleSelector, setShowCampaignStyleSelector] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [selectedCampaignStyle, setSelectedCampaignStyle] = useState(null);

  // Fetch data
  const { data: campaigns } = useQuery({
    queryKey: ["/api/sms-campaigns"],
    enabled: !!user,
  });

  const { data: quizzes } = useQuery({
    queryKey: ["/api/quizzes"],
    enabled: !!user,
  });

  const { data: credits } = useQuery({
    queryKey: ["/api/user/credits"],
    enabled: !!user,
  });

  const { data: templates } = useQuery({
    queryKey: ["/api/sms-templates"],
    enabled: !!user,
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/sms-campaigns", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(campaignData)
      });

      if (!response.ok) {
        throw new Error("Failed to create campaign");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sms-campaigns"] });
      toast({
        title: "Campanha criada com sucesso!",
        description: "Sua campanha SMS foi criada e está pronta para envio.",
      });
      setShowCampaignModal(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar campanha",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  });

  const handleCampaignStyleSelect = (style: string) => {
    setSelectedCampaignStyle(style);
    setShowCampaignStyleSelector(false);
    setShowCampaignModal(true);
  };

  const handleCreateCampaign = (campaignData: any) => {
    createCampaignMutation.mutate(campaignData);
  };

  // Calculate stats
  const totalCampaigns = campaigns?.length || 0;
  const activeCampaigns = campaigns?.filter((c: any) => c.status === 'active').length || 0;
  const totalSent = campaigns?.reduce((sum: number, c: any) => sum + (c.sent || 0), 0) || 0;
  const totalDelivered = campaigns?.reduce((sum: number, c: any) => sum + (c.delivered || 0), 0) || 0;
  const smsCredits = credits?.sms || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header with main action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campanhas SMS</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas campanhas de SMS marketing
          </p>
        </div>
        <Button 
          onClick={() => setShowCampaignStyleSelector(true)}
          className="bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Selecionar Estilo de Campanha
        </Button>
      </div>

      {/* Main content in tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Campanhas</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Templates</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Análises</span>
          </TabsTrigger>
          <TabsTrigger value="credits" className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>Créditos</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Campanhas</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCampaigns}</div>
                <p className="text-xs text-muted-foreground">
                  {activeCampaigns} ativas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SMS Enviados</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSent}</div>
                <p className="text-xs text-muted-foreground">
                  {totalDelivered} entregues
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Entrega</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Últimos 30 dias
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Créditos SMS</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{smsCredits}</div>
                <p className="text-xs text-muted-foreground">
                  Créditos restantes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent campaigns */}
          <Card>
            <CardHeader>
              <CardTitle>Campanhas Recentes</CardTitle>
              <CardDescription>Suas últimas campanhas SMS</CardDescription>
            </CardHeader>
            <CardContent>
              {campaigns && campaigns.length > 0 ? (
                <div className="space-y-4">
                  {campaigns.slice(0, 5).map((campaign: any) => (
                    <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          campaign.status === 'active' ? 'bg-green-500' : 
                          campaign.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`} />
                        <div>
                          <h4 className="font-medium">{campaign.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {campaign.sent || 0} enviados · {campaign.delivered || 0} entregues
                          </p>
                        </div>
                      </div>
                      <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                        {campaign.status === 'active' ? 'Ativa' : 
                         campaign.status === 'paused' ? 'Pausada' : 'Concluída'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma campanha criada ainda</p>
                  <p className="text-sm">Clique em "Selecionar Estilo de Campanha" para começar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todas as Campanhas</CardTitle>
              <CardDescription>Gerencie todas as suas campanhas SMS</CardDescription>
            </CardHeader>
            <CardContent>
              {campaigns && campaigns.length > 0 ? (
                <div className="space-y-4">
                  {campaigns.map((campaign: any) => (
                    <div key={campaign.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{campaign.name}</h3>
                        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                          {campaign.status === 'active' ? 'Ativa' : 
                           campaign.status === 'paused' ? 'Pausada' : 'Concluída'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Enviados</p>
                          <p className="font-medium">{campaign.sent || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Entregues</p>
                          <p className="font-medium">{campaign.delivered || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Taxa</p>
                          <p className="font-medium">
                            {campaign.sent > 0 ? Math.round((campaign.delivered / campaign.sent) * 100) : 0}%
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Criada</p>
                          <p className="font-medium">
                            {new Date(campaign.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma campanha encontrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Templates de SMS</CardTitle>
              <CardDescription>Modelos prontos para suas campanhas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Templates em breve...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análises Detalhadas</CardTitle>
              <CardDescription>Métricas e insights das suas campanhas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Análises em breve...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credits Tab */}
        <TabsContent value="credits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Créditos SMS</CardTitle>
              <CardDescription>Compre e gerencie seus créditos para SMS</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Créditos Atuais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">{smsCredits}</div>
                    <p className="text-sm text-muted-foreground">SMS restantes</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Pacote Básico</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R$ 50</div>
                    <p className="text-sm text-muted-foreground">500 SMS (R$ 0,10 cada)</p>
                    <Button className="w-full mt-2" variant="outline">
                      Comprar
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Pacote Premium</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R$ 200</div>
                    <p className="text-sm text-muted-foreground">2.500 SMS (R$ 0,08 cada)</p>
                    <Button className="w-full mt-2">
                      Comprar
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CampaignStyleSelector
        open={showCampaignStyleSelector}
        onClose={() => setShowCampaignStyleSelector(false)}
        onStyleSelect={handleCampaignStyleSelect}
        platform="sms"
      />

      <SimpleSMSCampaignModal
        open={showCampaignModal}
        onClose={() => {
          setShowCampaignModal(false);
          setSelectedCampaignStyle(null);
        }}
        onCreateCampaign={handleCreateCampaign}
        quizzes={quizzes || []}
        isCreating={createCampaignMutation.isPending}
        selectedStyle={selectedCampaignStyle}
      />
    </div>
  );
}