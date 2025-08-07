import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import WhatsAppMethodSelector from "@/components/whatsapp-method-selector";
import { 
  Phone, 
  Chrome, 
  Zap, 
  Settings, 
  BarChart3,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Globe,
  Download
} from "lucide-react";

export default function WhatsAppDualSystem() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();

  // Buscar configurações do usuário
  const { data: userSettings } = useQuery({
    queryKey: ['/api/whatsapp-extension/settings'],
    staleTime: 1000 * 60 * 5
  });

  // Status da extensão
  const { data: extensionStatus } = useQuery({
    queryKey: ["/api/whatsapp-extension/status"],
    refetchInterval: 30000,
  });

  // Verifica se extensão está conectada
  const isExtensionConnected = extensionStatus?.connected && 
    extensionStatus?.lastPing && 
    (new Date().getTime() - new Date(extensionStatus.lastPing).getTime()) < 120000;

  // Método atual selecionado
  const currentMethod = userSettings?.method || 'extension';
  const isApiConfigured = userSettings?.apiConfig?.accessToken && 
    userSettings?.apiConfig?.phoneNumberId && 
    userSettings?.apiConfig?.businessAccountId;

  const handleDownloadExtension = () => {
    toast({
      title: "Extensão em desenvolvimento",
      description: "A extensão Chrome será disponibilizada em breve.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-6 w-6 text-green-600" />
        <h1 className="text-2xl font-bold">WhatsApp Business - Sistema Dual</h1>
        <Badge variant="secondary" className="ml-2">
          {currentMethod === 'extension' ? 'Extensão Chrome' : 'API Oficial'}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurar Método
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Campanhas
          </TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard">
          <div className="grid gap-6">
            {/* Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Status do Sistema WhatsApp
                </CardTitle>
                <CardDescription>
                  Visão geral do seu sistema de automação WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Método Atual */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {currentMethod === 'extension' ? (
                        <Chrome className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Zap className="h-5 w-5 text-green-600" />
                      )}
                      <span className="font-medium">Método Atual</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {currentMethod === 'extension' ? 'Extensão Chrome' : 'API Oficial'}
                    </p>
                    <Badge variant={currentMethod === 'extension' ? 'outline' : 'default'} className="mt-2">
                      {currentMethod === 'extension' ? 'Gratuito' : 'Pago'}
                    </Badge>
                  </div>

                  {/* Status de Conexão */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-5 w-5" />
                      <span className="font-medium">Status de Conexão</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {currentMethod === 'extension' ? (
                        <Badge variant={isExtensionConnected ? "default" : "destructive"}>
                          {isExtensionConnected ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Conectada
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Desconectada
                            </>
                          )}
                        </Badge>
                      ) : (
                        <Badge variant={isApiConfigured ? "default" : "destructive"}>
                          {isApiConfigured ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Configurada
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Não configurada
                            </>
                          )}
                        </Badge>
                      )}
                    </div>
                    {isExtensionConnected && extensionStatus?.lastPing && (
                      <p className="text-xs text-gray-500 mt-1">
                        Última atividade: {new Date(extensionStatus.lastPing).toLocaleTimeString('pt-BR')}
                      </p>
                    )}
                  </div>

                  {/* Campanhas Ativas */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-5 w-5" />
                      <span className="font-medium">Campanhas Ativas</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <p className="text-xs text-gray-600">Campanhas em execução</p>
                  </div>
                </div>

                {/* Alertas */}
                <div className="mt-6 space-y-3">
                  {currentMethod === 'extension' && !isExtensionConnected && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Extensão Chrome desconectada.</strong> Para usar o método de extensão, você precisa:
                        <ol className="list-decimal ml-4 mt-2 space-y-1">
                          <li>Instalar a extensão Chrome do Vendzz</li>
                          <li>Fazer login no WhatsApp Web</li>
                          <li>Manter a aba do WhatsApp Web aberta</li>
                        </ol>
                      </AlertDescription>
                    </Alert>
                  )}

                  {currentMethod === 'api' && !isApiConfigured && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>API do WhatsApp não configurada.</strong> Para usar a API oficial, você precisa configurar:
                        Access Token, Phone Number ID e Business Account ID na aba "Configurar Método".
                      </AlertDescription>
                    </Alert>
                  )}

                  {(currentMethod === 'extension' && isExtensionConnected) || (currentMethod === 'api' && isApiConfigured) && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Sistema WhatsApp pronto!</strong> Você pode criar campanhas na aba "Campanhas".
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Comparação dos Métodos */}
            <Card>
              <CardHeader>
                <CardTitle>Comparação dos Métodos</CardTitle>
                <CardDescription>
                  Entenda as diferenças entre os dois métodos disponíveis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Chrome className="h-5 w-5 text-blue-600" />
                      <h3 className="font-medium">Extensão Chrome</h3>
                      <Badge variant="outline">Gratuito</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>Fácil de configurar</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>Funciona com WhatsApp Web</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>Taxa de sucesso: 82%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-3 w-3 text-yellow-500" />
                        <span>Requer Chrome aberto</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-5 w-5 text-green-600" />
                      <h3 className="font-medium">API Oficial</h3>
                      <Badge variant="outline">Pago</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>Maior confiabilidade</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>Sem dependência de browser</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>Taxa de sucesso: 99%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-3 w-3 text-yellow-500" />
                        <span>Requer conta Meta Business</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Extensão Chrome */}
            {currentMethod === 'extension' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Chrome className="h-5 w-5" />
                    Extensão Chrome
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <Download className="h-4 w-4" />
                      <AlertDescription>
                        Para usar a extensão Chrome, você precisa instalá-la no seu navegador.
                      </AlertDescription>
                    </Alert>
                    
                    <Button onClick={handleDownloadExtension} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Extensão Chrome
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Configurar Método */}
        <TabsContent value="config">
          <WhatsAppMethodSelector />
        </TabsContent>

        {/* Campanhas */}
        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Campanhas WhatsApp
              </CardTitle>
              <CardDescription>
                Gerencie suas campanhas de WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Campanhas em desenvolvimento</h3>
                <p className="text-gray-600 mb-4">
                  O sistema de campanhas WhatsApp será disponibilizado em breve.
                </p>
                <Button variant="outline" disabled>
                  Criar Campanha
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}