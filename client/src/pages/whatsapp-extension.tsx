import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth-hybrid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Copy, 
  Chrome, 
  Download, 
  Key, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  EyeOff,
  ExternalLink,
  Settings,
  Users,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ExtensionStatus {
  isConnected: boolean;
  isActive: boolean;
  phoneCount: number;
  lastSync: string;
}

interface ExtensionToken {
  token: string;
  expiresAt: string;
  createdAt: string;
}

export default function WhatsAppExtensionPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showToken, setShowToken] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  // Buscar status da extensão
  const { data: extensionStatus, isLoading: statusLoading } = useQuery<ExtensionStatus>({
    queryKey: ['/api/whatsapp/extension-status'],
    refetchInterval: 30000 // Atualizar a cada 30 segundos
  });

  // Gerar token para extensão
  const generateTokenMutation = useMutation({
    mutationFn: async (): Promise<ExtensionToken> => {
      return apiRequest('/api/whatsapp/extension-token', {
        method: 'POST',
        body: JSON.stringify({ purpose: 'chrome_extension' })
      });
    },
    onSuccess: (data) => {
      setGeneratedToken(data.token);
      toast({
        title: "Token gerado com sucesso!",
        description: "Use este token para conectar a Chrome Extension.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao gerar token",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    }
  });

  const copyToken = async () => {
    if (generatedToken) {
      await navigator.clipboard.writeText(generatedToken);
      toast({
        title: "Token copiado!",
        description: "Cole este token na configuração da extensão.",
      });
    }
  };

  const downloadExtension = () => {
    // Simular download da extensão (na prática seria um arquivo ZIP)
    const extensionInfo = {
      name: "Vendzz WhatsApp Extension",
      version: "1.0.0",
      manifest_url: "/chrome-extension-webjs/manifest.json",
      installation_guide: "https://docs.vendzz.com/extension-install"
    };
    
    const blob = new Blob([JSON.stringify(extensionInfo, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vendzz-extension-info.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">WhatsApp Extension</h1>
        <p className="text-muted-foreground">
          Configure e monitore a conexão da Chrome Extension para automação WhatsApp
        </p>
      </div>

      {/* Status da Conexão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Chrome className="h-5 w-5" />
            Status da Extensão
          </CardTitle>
          <CardDescription>
            Monitoramento em tempo real da conexão com a Chrome Extension
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              {extensionStatus?.isConnected ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="font-medium">Conexão</p>
                <p className="text-sm text-muted-foreground">
                  {extensionStatus?.isConnected ? 'Conectada' : 'Desconectada'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Status</p>
                <p className="text-sm text-muted-foreground">
                  {extensionStatus?.isActive ? 'Ativa' : 'Pausada'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <p className="font-medium">Telefones</p>
                <p className="text-sm text-muted-foreground">
                  {extensionStatus?.phoneCount || 0} detectados
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Última sincronização</p>
              <p className="text-xs text-muted-foreground">
                {extensionStatus?.lastSync || 'Nunca'}
              </p>
            </div>
            <Badge 
              variant={extensionStatus?.isConnected ? "default" : "secondary"}
            >
              {extensionStatus?.isConnected ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Geração de Token */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Token de Autenticação
          </CardTitle>
          <CardDescription>
            Gere um token seguro para conectar a Chrome Extension ao sistema Vendzz
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Este token permite que a extensão acesse seus quizzes e telefones. 
              Mantenha-o seguro e não compartilhe com terceiros.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <Button 
              onClick={() => generateTokenMutation.mutate()}
              disabled={generateTokenMutation.isPending}
              className="w-full"
            >
              {generateTokenMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Gerando Token...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  Gerar Novo Token
                </>
              )}
            </Button>

            {generatedToken && (
              <div className="space-y-3">
                <Label htmlFor="token">Token Gerado</Label>
                <div className="flex gap-2">
                  <Input
                    id="token"
                    type={showToken ? "text" : "password"}
                    value={generatedToken}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToken}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Token gerado com sucesso!</strong><br />
                    Cole este token na configuração da Chrome Extension para estabelecer a conexão.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instalação da Extensão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Chrome Extension
          </CardTitle>
          <CardDescription>
            Baixe e instale a Chrome Extension para automação WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Passos de Instalação</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Baixe os arquivos da extensão</li>
                <li>Abra Chrome → chrome://extensions/</li>
                <li>Ative "Modo desenvolvedor"</li>
                <li>Clique "Carregar sem compactação"</li>
                <li>Selecione a pasta da extensão</li>
                <li>Configure o token gerado</li>
              </ol>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Funcionalidades</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Automação de mensagens WhatsApp</li>
                <li>• Segmentação de audiência</li>
                <li>• Intervalos anti-spam</li>
                <li>• Monitoramento em tempo real</li>
                <li>• Sincronização com quizzes</li>
              </ul>
            </div>
          </div>

          <Separator />

          <div className="flex gap-3">
            <Button onClick={downloadExtension} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Baixar Extensão
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => window.open('https://chrome.google.com/webstore/category/extensions', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Chrome Web Store
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configurações Avançadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações de Segurança
          </CardTitle>
          <CardDescription>
            Configurações recomendadas para uso seguro da automação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-green-600">✅ Configurações Seguras</h4>
              <ul className="text-sm space-y-1">
                <li>• Intervalo: 7-10 segundos</li>
                <li>• Aleatorização: Ativada</li>
                <li>• Horário: 09:00-18:00</li>
                <li>• Máximo: 100 msgs/dia</li>
                <li>• Mensagens: 4+ rotativas</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-red-600">⚠️ Evitar</h4>
              <ul className="text-sm space-y-1">
                <li>• Intervalos menores que 5s</li>
                <li>• Mensagens idênticas</li>
                <li>• Envio 24h contínuo</li>
                <li>• Mais de 200 msgs/dia</li>
                <li>• Números não validados</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}