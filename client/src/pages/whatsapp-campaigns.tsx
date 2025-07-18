import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Settings,
  Bot,
  Key,
  Shield,
  Zap,
  Crown,
  TrendingUp,
  ExternalLink,
  AlertCircle,
  Clock,
  Smartphone,
  Globe,
  Target,
  BarChart3,
  Sparkles,
  Gift,
  Eye,
  Copy,
  Database
} from "lucide-react";

interface ExtensionStatus {
  connected: boolean;
  version: string;
  lastPing: string | null;
  pendingMessages: number;
}

interface WhatsAppBusinessConfig {
  phoneNumberId: string;
  accessToken: string;
  webhookVerifyToken: string;
  businessAccountId: string;
}

export default function WhatsAppCampaignsPage() {
  const { toast } = useToast();
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [generatingToken, setGeneratingToken] = useState(false);
  const [activeTab, setActiveTab] = useState("extension");
  const [businessConfig, setBusinessConfig] = useState<WhatsAppBusinessConfig>({
    phoneNumberId: "",
    accessToken: "",
    webhookVerifyToken: "",
    businessAccountId: ""
  });

  // Fetch extension status
  const { data: extensionStatus, refetch: refetchStatus } = useQuery({
    queryKey: ["/api/whatsapp-extension/status"],
    select: (data) => data || { connected: false, version: "0.0.0", lastPing: null, pendingMessages: 0 },
    refetchInterval: 30000 // Verificar status a cada 30 segundos
  });

  // Gerar token para extensão
  const generateToken = async () => {
    setGeneratingToken(true);
    try {
      const response = await apiRequest("POST", "/api/whatsapp-extension/generate-token", {});
      setGeneratedToken(response.token);
      toast({
        title: "Token Gerado com Sucesso!",
        description: "Token criado para conectar sua extensão do Chrome.",
      });
    } catch (error) {
      toast({
        title: "Erro ao Gerar Token",
        description: "Falha ao gerar token de acesso.",
        variant: "destructive",
      });
    } finally {
      setGeneratingToken(false);
    }
  };

  // Copiar token para clipboard
  const copyToken = () => {
    if (generatedToken) {
      navigator.clipboard.writeText(generatedToken);
      toast({
        title: "Token Copiado!",
        description: "Token copiado para a área de transferência.",
      });
    }
  };

  // Salvar configuração WhatsApp Business API
  const saveBusinessConfig = async () => {
    try {
      await apiRequest("POST", "/api/whatsapp-business/config", businessConfig);
      toast({
        title: "Configuração Salva!",
        description: "Configurações do WhatsApp Business API salvas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao Salvar",
        description: "Falha ao salvar configurações.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Bot className="w-8 h-8 text-green-500" />
          <h1 className="text-3xl font-bold">WhatsApp Marketing</h1>
          <Badge className="bg-green-100 text-green-700 border-green-300">
            100% GRÁTIS
          </Badge>
        </div>
        
        <p className="text-gray-600 mb-6">
          Escolha entre nossa Extensão Gratuita exclusiva ou configure a API oficial do WhatsApp Business para automação avançada.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="extension" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            WhatsApp Extensão (Gratuita)
          </TabsTrigger>
          <TabsTrigger value="business-api" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            WhatsApp Business API
          </TabsTrigger>
        </TabsList>

        {/* Aba 1: WhatsApp Extensão (Gratuita) */}
        <TabsContent value="extension" className="space-y-6">
          {/* Status da Extensão */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-green-500" />
                Status da Extensão
                {extensionStatus?.connected ? (
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Conectada
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Desconectada
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {extensionStatus?.connected ? "Ativa" : "Inativa"}
                  </div>
                  <div className="text-sm text-gray-600">Status</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {extensionStatus?.version || "0.0.0"}
                  </div>
                  <div className="text-sm text-gray-600">Versão</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {extensionStatus?.pendingMessages || 0}
                  </div>
                  <div className="text-sm text-gray-600">Mensagens Pendentes</div>
                </div>
              </div>
              
              {extensionStatus?.lastPing && (
                <div className="mt-4 text-sm text-gray-600">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Último ping: {new Date(extensionStatus.lastPing).toLocaleString('pt-BR')}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Funcionalidades da Extensão */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-green-500" />
                  Funcionalidades Exclusivas
                </CardTitle>
                <CardDescription>
                  Nossa extensão oferece recursos únicos no mercado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Automação Baseada em Quiz</h4>
                    <p className="text-sm text-gray-600">Envie mensagens automáticas para leads que completaram ou abandonaram seus quizzes</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Segmentação Avançada</h4>
                    <p className="text-sm text-gray-600">Filtre leads por respostas específicas, idade, gênero e comportamento</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Envio em Massa Inteligente</h4>
                    <p className="text-sm text-gray-600">Envie milhares de mensagens personalizadas com delay inteligente</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Variáveis Dinâmicas</h4>
                    <p className="text-sm text-gray-600">Use variáveis como nome, idade, resposta automaticamente nas mensagens</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Analytics em Tempo Real</h4>
                    <p className="text-sm text-gray-600">Acompanhe entregas, aberturas e respostas instantaneamente</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ROI e Exclusividade */}
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  ROI e Exclusividade
                </CardTitle>
                <CardDescription>
                  Por que nossa extensão é superior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Crown className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">ROI até 500% maior</h4>
                    <p className="text-sm text-gray-600">Comparado a ferramentas tradicionais de WhatsApp marketing</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Tecnologia Exclusiva</h4>
                    <p className="text-sm text-gray-600">Única plataforma que conecta quizzes com WhatsApp automaticamente</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Velocidade de Conversão</h4>
                    <p className="text-sm text-gray-600">Leads quentes recebem mensagens em menos de 60 segundos</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Precisão Cirúrgica</h4>
                    <p className="text-sm text-gray-600">Targeting baseado em respostas reais, não em suposições</p>
                  </div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">+847%</div>
                    <div className="text-sm text-orange-700">Aumento médio em conversões</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Download e Token */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Download da Extensão */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-blue-500" />
                  Download da Extensão
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Baixe nossa extensão exclusiva para Chrome e comece a automatizar seus disparos de WhatsApp.
                </p>
                
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => window.open('https://chrome.google.com/webstore/category/extensions', '_blank')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Extensão do Chrome
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
                
                <div className="text-sm text-gray-500 space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Compatible com Chrome 90+
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Instalação em 30 segundos
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Atualizações automáticas
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Geração de Token */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-purple-500" />
                  Token de Acesso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Gere um token único para conectar a extensão à sua conta.
                </p>
                
                <Button 
                  onClick={generateToken}
                  disabled={generatingToken}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {generatingToken ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Key className="w-4 h-4 mr-2" />
                  )}
                  Gerar Novo Token
                </Button>
                
                {generatedToken && (
                  <div className="space-y-2">
                    <Label>Seu Token:</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={generatedToken} 
                        readOnly 
                        className="font-mono text-sm"
                      />
                      <Button 
                        onClick={copyToken}
                        variant="outline"
                        size="sm"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Copie este token e cole na extensão para ativar a conexão.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Mini Tutorial */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-500" />
                Tutorial Rápido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-green-600 font-bold">1</span>
                  </div>
                  <h4 className="font-medium">Baixar Extensão</h4>
                  <p className="text-sm text-gray-600">Instale a extensão no Chrome</p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-purple-600 font-bold">2</span>
                  </div>
                  <h4 className="font-medium">Gerar Token</h4>
                  <p className="text-sm text-gray-600">Clique em "Gerar Novo Token"</p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-blue-600 font-bold">3</span>
                  </div>
                  <h4 className="font-medium">Conectar</h4>
                  <p className="text-sm text-gray-600">Cole o token na extensão</p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-orange-600 font-bold">4</span>
                  </div>
                  <h4 className="font-medium">Automatizar</h4>
                  <p className="text-sm text-gray-600">Crie campanhas automáticas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba 2: WhatsApp Business API */}
        <TabsContent value="business-api" className="space-y-6">
          {/* Configurações da API */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-500" />
                Configurações WhatsApp Business API
              </CardTitle>
              <CardDescription>
                Configure as credenciais da Meta para usar a API oficial do WhatsApp Business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phoneNumberId">Phone Number ID</Label>
                    <Input
                      id="phoneNumberId"
                      value={businessConfig.phoneNumberId}
                      onChange={(e) => setBusinessConfig({...businessConfig, phoneNumberId: e.target.value})}
                      placeholder="Ex: 123456789012345"
                      className="font-mono"
                    />
                    <p className="text-xs text-gray-600 mt-1">ID do número de telefone no Meta Business</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="accessToken">Access Token</Label>
                    <Input
                      id="accessToken"
                      type="password"
                      value={businessConfig.accessToken}
                      onChange={(e) => setBusinessConfig({...businessConfig, accessToken: e.target.value})}
                      placeholder="EAAG..."
                      className="font-mono"
                    />
                    <p className="text-xs text-gray-600 mt-1">Token de acesso permanente da aplicação</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="webhookVerifyToken">Webhook Verify Token</Label>
                    <Input
                      id="webhookVerifyToken"
                      value={businessConfig.webhookVerifyToken}
                      onChange={(e) => setBusinessConfig({...businessConfig, webhookVerifyToken: e.target.value})}
                      placeholder="meu_token_verificacao_webhook"
                      className="font-mono"
                    />
                    <p className="text-xs text-gray-600 mt-1">Token para verificar webhooks</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="businessAccountId">Business Account ID</Label>
                    <Input
                      id="businessAccountId"
                      value={businessConfig.businessAccountId}
                      onChange={(e) => setBusinessConfig({...businessConfig, businessAccountId: e.target.value})}
                      placeholder="Ex: 987654321098765"
                      className="font-mono"
                    />
                    <p className="text-xs text-gray-600 mt-1">ID da conta comercial no Meta Business</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button onClick={saveBusinessConfig} className="bg-blue-600 hover:bg-blue-700">
                  <Database className="w-4 h-4 mr-2" />
                  Salvar Configurações
                </Button>
                
                <Button variant="outline" onClick={() => setBusinessConfig({phoneNumberId: "", accessToken: "", webhookVerifyToken: "", businessAccountId: ""})}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Limpar Campos
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Guia de Configuração */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Passo a Passo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-indigo-500" />
                  Guia de Configuração
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Criar App no Meta for Developers</h4>
                      <p className="text-sm text-gray-600">Acesse developers.facebook.com e crie um novo app Business</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Adicionar WhatsApp Business API</h4>
                      <p className="text-sm text-gray-600">No painel do app, adicione o produto WhatsApp Business API</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Configurar Número de Telefone</h4>
                      <p className="text-sm text-gray-600">Adicione e verifique seu número comercial no WhatsApp Business</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold text-sm">4</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Gerar Access Token</h4>
                      <p className="text-sm text-gray-600">Crie um token de acesso permanente para sua aplicação</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold text-sm">5</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Configurar Webhooks</h4>
                      <p className="text-sm text-gray-600">Configure os webhooks para receber respostas e status</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recursos e Limitações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-500" />
                  Recursos da API Oficial
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Mensagens de Template</h4>
                      <p className="text-sm text-gray-600">Envie mensagens pré-aprovadas pelo WhatsApp</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Mídia Suportada</h4>
                      <p className="text-sm text-gray-600">Envie imagens, vídeos, documentos e áudios</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Webhooks em Tempo Real</h4>
                      <p className="text-sm text-gray-600">Receba status de entrega e respostas instantaneamente</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Rate Limiting Oficial</h4>
                      <p className="text-sm text-gray-600">1.000 mensagens/segundo (com aprovação Meta)</p>
                    </div>
                  </div>
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Importante:</strong> A API oficial requer aprovação da Meta e tem custos por mensagem enviada.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparação entre Extensão e API */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-500" />
                Comparação: Extensão vs API Oficial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Recurso</th>
                      <th className="text-center p-4 font-medium">Extensão (Gratuita)</th>
                      <th className="text-center p-4 font-medium">API Oficial</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4">Custo</td>
                      <td className="p-4 text-center">
                        <Badge className="bg-green-100 text-green-700">100% Grátis</Badge>
                      </td>
                      <td className="p-4 text-center">
                        <Badge variant="outline">Por mensagem</Badge>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">Configuração</td>
                      <td className="p-4 text-center">
                        <Badge className="bg-blue-100 text-blue-700">Simples</Badge>
                      </td>
                      <td className="p-4 text-center">
                        <Badge className="bg-orange-100 text-orange-700">Complexa</Badge>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">Aprovação Meta</td>
                      <td className="p-4 text-center">
                        <Badge className="bg-green-100 text-green-700">Não Necessária</Badge>
                      </td>
                      <td className="p-4 text-center">
                        <Badge className="bg-red-100 text-red-700">Obrigatória</Badge>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">Velocidade de Envio</td>
                      <td className="p-4 text-center">
                        <Badge className="bg-yellow-100 text-yellow-700">Moderada</Badge>
                      </td>
                      <td className="p-4 text-center">
                        <Badge className="bg-green-100 text-green-700">Alta</Badge>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">Integração com Quiz</td>
                      <td className="p-4 text-center">
                        <Badge className="bg-green-100 text-green-700">Nativa</Badge>
                      </td>
                      <td className="p-4 text-center">
                        <Badge className="bg-blue-100 text-blue-700">Via API</Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4">Melhor Para</td>
                      <td className="p-4 text-center">
                        <span className="text-sm text-gray-600">Startups e PMEs</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-sm text-gray-600">Grandes Empresas</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Links Úteis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-indigo-500" />
                Links Úteis para Configuração
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4"
                  onClick={() => window.open('https://developers.facebook.com', '_blank')}
                >
                  <div className="text-left">
                    <div className="font-medium">Meta for Developers</div>
                    <div className="text-sm text-gray-600">Criar e gerenciar apps</div>
                  </div>
                  <ExternalLink className="w-4 h-4 ml-auto" />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4"
                  onClick={() => window.open('https://business.whatsapp.com', '_blank')}
                >
                  <div className="text-left">
                    <div className="font-medium">WhatsApp Business</div>
                    <div className="text-sm text-gray-600">Gerenciar conta comercial</div>
                  </div>
                  <ExternalLink className="w-4 h-4 ml-auto" />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4"
                  onClick={() => window.open('https://developers.facebook.com/docs/whatsapp', '_blank')}
                >
                  <div className="text-left">
                    <div className="font-medium">Documentação API</div>
                    <div className="text-sm text-gray-600">Guias e referências</div>
                  </div>
                  <ExternalLink className="w-4 h-4 ml-auto" />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4"
                  onClick={() => window.open('https://business.facebook.com', '_blank')}
                >
                  <div className="text-left">
                    <div className="font-medium">Meta Business</div>
                    <div className="text-sm text-gray-600">Gerenciar recursos</div>
                  </div>
                  <ExternalLink className="w-4 h-4 ml-auto" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}