import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth-jwt";
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
  EyeOff
} from "lucide-react";

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
              <CardTitle>WhatsApp Business API</CardTitle>
              <CardDescription>
                Configure a API oficial do WhatsApp para empresas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-1">API Oficial vs Extensão Gratuita</h4>
                    <div className="text-sm text-blue-700 space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium mb-1">✅ Extensão Gratuita:</h5>
                          <ul className="text-xs space-y-1">
                            <li>• Gratuita e ilimitada</li>
                            <li>• Setup em 5 minutos</li>
                            <li>• Ideal para PMEs</li>
                            <li>• Sem custos mensais</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium mb-1">🏢 API Oficial:</h5>
                          <ul className="text-xs space-y-1">
                            <li>• Para grandes volumes</li>
                            <li>• Verificação empresarial</li>
                            <li>• Templates aprovados</li>
                            <li>• Custo por mensagem</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Configuração da API Oficial</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}