import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Chrome, 
  Zap, 
  Settings, 
  Key,
  Phone, 
  Building,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Globe
} from "lucide-react";

interface ExtensionSettings {
  autoSend: boolean;
  messageDelay: number;
  maxMessagesPerDay: number;
  method: 'extension' | 'api';
  apiConfig: {
    accessToken: string;
    phoneNumberId: string;
    businessAccountId: string;
    version: string;
    webhookVerifyToken: string;
    webhookUrl: string;
  };
}

export default function WhatsAppMethodSelector() {
  const [selectedMethod, setSelectedMethod] = useState<'extension' | 'api'>('extension');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle');
  const [apiConfig, setApiConfig] = useState({
    accessToken: '',
    phoneNumberId: '',
    businessAccountId: '',
    version: '18.0',
    webhookVerifyToken: '',
    webhookUrl: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar configurações atuais
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/whatsapp-extension/settings'],
    staleTime: 1000 * 60 * 5
  });

  // Mutation para salvar configurações
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<ExtensionSettings>) => {
      return apiRequest('POST', '/api/whatsapp-extension/settings', newSettings);
    },
    onSuccess: () => {
      toast({
        title: "Configurações salvas",
        description: "As configurações do WhatsApp foram salvas com sucesso."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp-extension/settings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Erro ao salvar configurações",
        variant: "destructive"
      });
    }
  });

  // Mutation para testar API
  const testApiMutation = useMutation({
    mutationFn: async (config: any) => {
      return apiRequest('POST', '/api/whatsapp-api/test', { apiConfig: config });
    },
    onSuccess: (data) => {
      setConnectionStatus('connected');
      toast({
        title: "Conexão bem-sucedida",
        description: "A API do WhatsApp foi configurada com sucesso."
      });
    },
    onError: (error: any) => {
      setConnectionStatus('error');
      toast({
        title: "Erro na conexão",
        description: error.message || "Não foi possível conectar com a API do WhatsApp",
        variant: "destructive"
      });
    }
  });

  // Carregar configurações quando disponíveis
  useEffect(() => {
    if (settings) {
      setSelectedMethod(settings.method || 'extension');
      setApiConfig(settings.apiConfig || {
        accessToken: '',
        phoneNumberId: '',
        businessAccountId: '',
        version: '18.0',
        webhookVerifyToken: '',
        webhookUrl: ''
      });
    }
  }, [settings]);

  const handleTestConnection = async () => {
    if (!apiConfig.accessToken || !apiConfig.phoneNumberId || !apiConfig.businessAccountId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus('testing');
    
    try {
      await testApiMutation.mutateAsync(apiConfig);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSaveSettings = async () => {
    const newSettings = {
      method: selectedMethod,
      apiConfig: selectedMethod === 'api' ? apiConfig : {}
    };

    await saveSettingsMutation.mutateAsync(newSettings);
  };

  const handleMethodChange = (method: 'extension' | 'api') => {
    setSelectedMethod(method);
    setConnectionStatus('idle');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seletor de Método */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Método de Envio WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Extensão Chrome */}
            <div
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedMethod === 'extension' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleMethodChange('extension')}
            >
              <div className="flex items-center gap-3 mb-3">
                <Chrome className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-medium">Extensão Chrome</h3>
                  <Badge variant="outline" className="text-xs">Gratuito</Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Usa a extensão Chrome para enviar mensagens através do WhatsApp Web
              </p>
              <div className="text-xs text-gray-500">
                • Fácil de configurar<br/>
                • Funciona com WhatsApp Web<br/>
                • Taxa de sucesso: 82%
              </div>
            </div>

            {/* API Oficial */}
            <div
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedMethod === 'api' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleMethodChange('api')}
            >
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="font-medium">API Oficial</h3>
                  <Badge variant="outline" className="text-xs">Pago</Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Usa a API oficial do WhatsApp Business para envio profissional
              </p>
              <div className="text-xs text-gray-500">
                • Maior confiabilidade<br/>
                • Sem dependência de browser<br/>
                • Taxa de sucesso: 99%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações da API */}
      {selectedMethod === 'api' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Configurações da API WhatsApp Business
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Para usar a API oficial do WhatsApp, você precisa de uma conta Meta Business e um número de telefone aprovado.
                  <a 
                    href="https://developers.facebook.com/docs/whatsapp/getting-started" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline ml-1"
                  >
                    Saiba mais
                  </a>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accessToken">Access Token *</Label>
                  <Input
                    id="accessToken"
                    type="password"
                    placeholder="EAAxxxxxxxxxxxx"
                    value={apiConfig.accessToken}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, accessToken: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="phoneNumberId">Phone Number ID *</Label>
                  <Input
                    id="phoneNumberId"
                    placeholder="123456789012345"
                    value={apiConfig.phoneNumberId}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="businessAccountId">Business Account ID *</Label>
                  <Input
                    id="businessAccountId"
                    placeholder="987654321098765"
                    value={apiConfig.businessAccountId}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, businessAccountId: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="version">Versão da API</Label>
                  <Input
                    id="version"
                    placeholder="18.0"
                    value={apiConfig.version}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, version: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="webhookVerifyToken">Webhook Verify Token</Label>
                  <Input
                    id="webhookVerifyToken"
                    placeholder="meu_token_secreto"
                    value={apiConfig.webhookVerifyToken}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, webhookVerifyToken: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    placeholder="https://seu-dominio.com/api/whatsapp-api/webhook"
                    value={apiConfig.webhookUrl}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t">
                <Button
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                  variant="outline"
                >
                  {isTestingConnection ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mr-2" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4 mr-2" />
                      Testar Conexão
                    </>
                  )}
                </Button>

                {connectionStatus === 'connected' && (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Conectado
                  </Badge>
                )}

                {connectionStatus === 'error' && (
                  <Badge variant="destructive">
                    <XCircle className="w-3 h-3 mr-1" />
                    Erro
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extensão Chrome */}
      {selectedMethod === 'extension' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Chrome className="w-5 h-5" />
              Extensão Chrome
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <Download className="h-4 w-4" />
                <AlertDescription>
                  Para usar a extensão Chrome, você precisa instalá-la no seu navegador Chrome.
                  <Button variant="link" className="p-0 h-auto ml-2">
                    Baixar extensão
                  </Button>
                </AlertDescription>
              </Alert>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Como funciona:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>Instale a extensão Chrome do Vendzz</li>
                  <li>Faça login no WhatsApp Web</li>
                  <li>A extensão sincronizará automaticamente com suas campanhas</li>
                  <li>As mensagens serão enviadas através do WhatsApp Web</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          disabled={saveSettingsMutation.isPending}
          className="bg-green-600 hover:bg-green-700"
        >
          {saveSettingsMutation.isPending ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Salvando...
            </>
          ) : (
            <>
              <Settings className="w-4 h-4 mr-2" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </div>
  );
}