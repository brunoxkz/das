import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth-sqlite";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  Key, 
  Chrome, 
  RefreshCw, 
  MessageCircle, 
  ExternalLink,
  TrendingUp,
  Target,
  Users,
  Zap,
  CheckCircle,
  AlertTriangle,
  Globe,
  Smartphone,
  Settings,
  BarChart,
  DollarSign,
  Rocket,
  Copy,
  Eye,
  EyeOff,
  Send,
  Database,
  Webhook,
  FileText,
  Plus,
  Edit,
  Trash2,
  Save,
  TestTube,
  Shield
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function WhatsAppCampaigns() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [extensionStatus, setExtensionStatus] = useState({
    connected: false,
    pendingMessages: 0,
    version: null
  });
  
  const [tokenData, setTokenData] = useState({
    isVisible: false,
    token: '',
    showToken: false
  });

  // Dados simulados para demonstração
  const stats = {
    totalCampaigns: 12,
    totalSent: 2847,
    totalDelivered: 2698,
    totalReplies: 425,
    conversionRate: 15.7
  };

  const checkExtensionStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp-extension/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setExtensionStatus({
          connected: data.connected || false,
          pendingMessages: data.pendingMessages || 0,
          version: data.version || null
        });
      } else {
        // Se erro na API, marcar como desconectado
        setExtensionStatus({
          connected: false,
          pendingMessages: 0,
          version: null
        });
      }
    } catch (error) {
      console.error('Erro ao verificar status da extensão:', error);
      setExtensionStatus({
        connected: false,
        pendingMessages: 0,
        version: null
      });
    }
  };

  useEffect(() => {
    checkExtensionStatus();
  }, []);

  const generateToken = () => {
    const newToken = `wzz_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setTokenData({
      isVisible: true,
      token: newToken,
      showToken: false
    });
  };

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(tokenData.token);
      toast({
        title: "Token copiado!",
        description: "Token copiado para a área de transferência",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o token",
        variant: "destructive"
      });
    }
  };

  const toggleTokenVisibility = () => {
    setTokenData(prev => ({
      ...prev,
      showToken: !prev.showToken
    }));
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">WhatsApp Marketing</h1>
            <p className="text-gray-600">Automação gratuita e API oficial para campanhas</p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={checkExtensionStatus}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>

        {/* Status da Extensão */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${extensionStatus.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500 animate-pulse'}`}></div>
            <span className={`text-sm font-medium ${extensionStatus.connected ? 'text-green-700' : 'text-red-700'}`}>
              {extensionStatus.connected ? 'Extensão Conectada' : 'Extensão Desconectada'}
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="extension" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="extension">WhatsApp Extensão (Gratuita)</TabsTrigger>
          <TabsTrigger value="api">WhatsApp Business API</TabsTrigger>
        </TabsList>

        <TabsContent value="extension" className="space-y-6">
          {/* 1. Tutorial */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                Tutorial Rápido
              </CardTitle>
              <CardDescription>Como configurar sua automação WhatsApp em 4 passos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 text-sm font-bold">1</div>
                  <h4 className="font-semibold mb-1">Baixar Extensão</h4>
                  <p className="text-sm text-gray-600">Instale no Chrome/Opera</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
                  <h4 className="font-semibold mb-1">Gerar Token</h4>
                  <p className="text-sm text-gray-600">Configure autenticação</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
                  <h4 className="font-semibold mb-1">Conectar Quiz</h4>
                  <p className="text-sm text-gray-600">Vincule aos seus quizzes</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 text-sm font-bold">4</div>
                  <h4 className="font-semibold mb-1">Automatizar</h4>
                  <p className="text-sm text-gray-600">Envios automáticos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Download e Token */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                Download & Token
              </CardTitle>
              <CardDescription>Baixe a extensão e configure sua autenticação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Download Section */}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-l-4 border-l-blue-500">
                <div className="flex items-center gap-3">
                  <Chrome className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-800">Extensão WhatsApp Vendzz</h3>
                    <p className="text-sm text-blue-600">Compatível com Chrome, Opera e Edge</p>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => window.open('https://chrome.google.com/webstore', '_blank')}
                >
                  <Download className="h-5 w-5 mr-2" />
                  BAIXAR EXTENSÃO
                </Button>
              </div>

              {/* Token Section */}
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-l-4 border-l-green-500">
                <div className="flex items-center gap-3">
                  <Key className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-800">Token de Autenticação</h3>
                    <p className="text-sm text-green-600">Gere seu token único para conectar a extensão</p>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-50"
                  onClick={generateToken}
                >
                  <Key className="h-5 w-5 mr-2" />
                  GERAR TOKEN
                </Button>
              </div>

              {/* Token Display Section */}
              {tokenData.isVisible && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800">🔐 Seu Token de Autenticação</h4>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={toggleTokenVisibility}
                        className="h-8"
                      >
                        {tokenData.showToken ? (
                          <><EyeOff className="h-4 w-4 mr-1" /> Ocultar</>
                        ) : (
                          <><Eye className="h-4 w-4 mr-1" /> Mostrar</>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={copyToken}
                        className="h-8 bg-green-600 hover:bg-green-700"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copiar
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-dashed border-gray-300">
                    <code className="text-sm font-mono text-gray-700 break-all">
                      {tokenData.showToken ? tokenData.token : '•'.repeat(tokenData.token.length)}
                    </code>
                  </div>
                  
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>✅ <strong>Instruções:</strong></p>
                    <p>1. Copie este token usando o botão "Copiar" acima</p>
                    <p>2. Abra a extensão WhatsApp Vendzz no seu navegador</p>
                    <p>3. Cole o token no campo "Token de Autenticação"</p>
                    <p>4. Clique em "Conectar" para ativar a automação</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. Funcionalidades */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                Funcionalidades Principais
              </CardTitle>
              <CardDescription>Recursos completos da extensão gratuita</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <Zap className="h-8 w-8 text-yellow-500 mb-3" />
                  <h4 className="font-semibold mb-2">Envio Automático</h4>
                  <p className="text-sm text-gray-600">Mensagens automáticas baseadas nas respostas do quiz</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Users className="h-8 w-8 text-blue-500 mb-3" />
                  <h4 className="font-semibold mb-2">Segmentação Inteligente</h4>
                  <p className="text-sm text-gray-600">Envios personalizados baseados no perfil do lead</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Target className="h-8 w-8 text-green-500 mb-3" />
                  <h4 className="font-semibold mb-2">Campanhas Direcionadas</h4>
                  <p className="text-sm text-gray-600">Filtragem avançada por respostas específicas</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <BarChart className="h-8 w-8 text-purple-500 mb-3" />
                  <h4 className="font-semibold mb-2">Analytics Completo</h4>
                  <p className="text-sm text-gray-600">Métricas detalhadas de entrega e conversão</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Globe className="h-8 w-8 text-indigo-500 mb-3" />
                  <h4 className="font-semibold mb-2">Multi-País</h4>
                  <p className="text-sm text-gray-600">Suporte a números internacionais</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Smartphone className="h-8 w-8 text-pink-500 mb-3" />
                  <h4 className="font-semibold mb-2">WhatsApp Web</h4>
                  <p className="text-sm text-gray-600">Integração direta com WhatsApp Web</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. ROI e Benefícios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                ROI e Performance
              </CardTitle>
              <CardDescription>Resultados comprovados com WhatsApp Marketing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
                  <DollarSign className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-green-600 mb-2">340%</div>
                  <div className="text-sm text-gray-600">Maior ROI vs Email</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                  <TrendingUp className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-blue-600 mb-2">89%</div>
                  <div className="text-sm text-gray-600">Taxa de Entrega</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                  <Rocket className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-purple-600 mb-2">67%</div>
                  <div className="text-sm text-gray-600">Taxa de Conversão</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-l-yellow-400 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-1">Vantagens Comprovadas:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• <strong>98% taxa de abertura</strong> - vs 20% do email marketing</li>
                      <li>• <strong>Resposta em 90 segundos</strong> - vs 90 minutos do email</li>
                      <li>• <strong>340% maior conversão</strong> - comprovado em +1000 campanhas</li>
                      <li>• <strong>Custo 85% menor</strong> - vs SMS tradicionais</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>


        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-green-600" />
                WhatsApp Business API (Oficial)
              </CardTitle>
              <CardDescription>
                Sistema completo de integração com a API oficial do Meta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Configuração da API */}
              <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border">
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-semibold">Configuração da API</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="accessToken">Access Token</Label>
                    <Input
                      id="accessToken"
                      type="password"
                      placeholder="Seu Access Token do Meta"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumberId">Phone Number ID</Label>
                    <Input
                      id="phoneNumberId"
                      placeholder="ID do número de telefone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessAccountId">Business Account ID</Label>
                    <Input
                      id="businessAccountId"
                      placeholder="ID da conta comercial"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">Webhook URL</Label>
                    <Input
                      id="webhookUrl"
                      placeholder="https://seudominio.com/webhook"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <Switch id="enableApi" />
                  <Label htmlFor="enableApi">Habilitar API do WhatsApp Business</Label>
                </div>

                <div className="flex gap-2">
                  <Button>
                    <TestTube className="h-4 w-4 mr-2" />
                    Testar Conexão
                  </Button>
                  <Button variant="outline">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Configuração
                  </Button>
                </div>
              </div>

              {/* Templates */}
              <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-semibold">Gerenciar Templates</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="templateName">Nome do Template</Label>
                    <Input
                      id="templateName"
                      placeholder="nome_do_template"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="templateCategory">Categoria</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MARKETING">Marketing</SelectItem>
                        <SelectItem value="UTILITY">Utilitário</SelectItem>
                        <SelectItem value="AUTHENTICATION">Autenticação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <Label htmlFor="templateBody">Conteúdo da Mensagem</Label>
                  <Textarea
                    id="templateBody"
                    placeholder="Olá {1}, sua mensagem personalizada aqui..."
                    rows={4}
                  />
                  <p className="text-xs text-gray-600">Use {"{1}"}, {"{2}"} para variáveis dinâmicas</p>
                </div>

                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Template
                </Button>
              </div>

              {/* Webhooks */}
              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border">
                <div className="flex items-center gap-3 mb-4">
                  <Webhook className="h-6 w-6 text-purple-600" />
                  <h3 className="text-lg font-semibold">Webhooks</h3>
                </div>

                <div className="p-4 bg-white rounded-lg border mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Status do Webhook</span>
                    <Badge variant="secondary">Desconectado</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    URL: Não configurado
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button>
                    <TestTube className="h-4 w-4 mr-2" />
                    Testar Webhook
                  </Button>
                  <Button variant="outline">
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Teste
                  </Button>
                </div>
              </div>

              {/* Analytics */}
              <div className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart className="h-6 w-6 text-orange-600" />
                  <h3 className="text-lg font-semibold">Analytics da API</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <Send className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600 mb-1">0</div>
                    <div className="text-sm text-gray-600">Mensagens Enviadas</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <CheckCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600 mb-1">0%</div>
                    <div className="text-sm text-gray-600">Taxa de Entrega</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border">
                    <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600 mb-1">0%</div>
                    <div className="text-sm text-gray-600">Taxa de Resposta</div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-1">Configuração Necessária</h4>
                      <p className="text-sm text-yellow-700">
                        Configure suas credenciais da API para começar a ver as métricas de performance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guia de Setup */}
              <div className="p-6 bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg border">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-6 w-6 text-gray-600" />
                  <h3 className="text-lg font-semibold">Guia de Configuração</h3>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <h4 className="font-semibold text-blue-800 mb-2">📋 Passo a Passo:</h4>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Acesse o <a href="https://developers.facebook.com/apps" target="_blank" className="underline">Meta for Developers</a></li>
                    <li>Crie um novo app e adicione o produto "WhatsApp Business API"</li>
                    <li>Configure um número de telefone comercial</li>
                    <li>Obtenha o Access Token e Phone Number ID</li>
                    <li>Configure o webhook com sua URL</li>
                    <li>Verifique o webhook com o token</li>
                    <li>Teste a conexão usando o botão acima</li>
                  </ol>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="justify-start h-auto p-4"
                    onClick={() => window.open('https://developers.facebook.com/docs/whatsapp/business-management-api/get-started', '_blank')}
                  >
                    <div className="text-left">
                      <div className="font-medium">📚 Documentação Oficial</div>
                      <div className="text-sm text-gray-600">Guia completo do Meta</div>
                    </div>
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="justify-start h-auto p-4"
                    onClick={() => window.open('https://business.facebook.com', '_blank')}
                  >
                    <div className="text-left">
                      <div className="font-medium">🏢 Meta Business</div>
                      <div className="text-sm text-gray-600">Gerenciar conta</div>
                    </div>
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
