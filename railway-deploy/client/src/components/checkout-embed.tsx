import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, Code, Zap, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CheckoutEmbedProps {
  planId?: string;
  amount?: number;
  currency?: string;
  theme?: 'light' | 'dark';
  buttonText?: string;
  width?: string;
  height?: string;
}

const CheckoutEmbed: React.FC<CheckoutEmbedProps> = ({
  planId = 'default',
  amount = 1,
  currency = 'BRL',
  theme = 'light',
  buttonText = 'Ativar Trial R$ 1,00',
  width = '400px',
  height = '600px'
}) => {
  const [config, setConfig] = useState({
    planId,
    amount,
    currency,
    theme,
    buttonText,
    width,
    height
  });
  const { toast } = useToast();

  const generateEmbedCode = () => {
    const baseUrl = window.location.origin;
    const embedUrl = `${baseUrl}/checkout-perfect?embed=true&planId=${config.planId}&amount=${config.amount}&currency=${config.currency}&theme=${config.theme}`;
    
    return `<!-- Vendzz Checkout Embed -->
<iframe 
  src="${embedUrl}"
  width="${config.width}"
  height="${config.height}"
  frameborder="0"
  scrolling="no"
  style="border: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);"
  title="Vendzz Checkout">
</iframe>
<script>
  // Comunicação com o iframe
  window.addEventListener('message', function(event) {
    if (event.data.type === 'vendzz-checkout-success') {
      console.log('Checkout success:', event.data);
      // Redirecionar ou executar ação customizada
      window.location.href = '/success';
    }
  });
</script>`;
  };

  const generateDirectLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/checkout-perfect?planId=${config.planId}&amount=${config.amount}&currency=${config.currency}&theme=${config.theme}`;
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${type} copiado!`,
      description: `O ${type.toLowerCase()} foi copiado para a área de transferência.`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Checkout Embed Generator
        </h1>
        <p className="text-gray-600">
          Crie códigos de embed para integrar o checkout em qualquer site
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Configurações</span>
            </CardTitle>
            <CardDescription>
              Personalize o checkout embed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={config.amount}
                  onChange={(e) => setConfig(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="currency">Moeda</Label>
                <select
                  id="currency"
                  value={config.currency}
                  onChange={(e) => setConfig(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="BRL">Real (BRL)</option>
                  <option value="USD">Dólar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="buttonText">Texto do Botão</Label>
              <Input
                id="buttonText"
                value={config.buttonText}
                onChange={(e) => setConfig(prev => ({ ...prev, buttonText: e.target.value }))}
                placeholder="Ativar Trial R$ 1,00"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="width">Largura</Label>
                <Input
                  id="width"
                  value={config.width}
                  onChange={(e) => setConfig(prev => ({ ...prev, width: e.target.value }))}
                  placeholder="400px"
                />
              </div>
              <div>
                <Label htmlFor="height">Altura</Label>
                <Input
                  id="height"
                  value={config.height}
                  onChange={(e) => setConfig(prev => ({ ...prev, height: e.target.value }))}
                  placeholder="600px"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="theme">Tema</Label>
              <select
                id="theme"
                value={config.theme}
                onChange={(e) => setConfig(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Preview</span>
            </CardTitle>
            <CardDescription>
              Visualização do checkout
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-gray-50">
              <div 
                className="mx-auto bg-white rounded-lg shadow-sm border p-6"
                style={{ width: config.width, minHeight: '300px' }}
              >
                <div className="text-center space-y-4">
                  <Badge className="bg-green-600 text-white">
                    Trial Especial
                  </Badge>
                  <h3 className="text-xl font-bold">
                    Plano Premium
                  </h3>
                  <div className="text-3xl font-bold text-green-600">
                    R$ {config.amount.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">
                    por 3 dias, depois R$ 29,90/mês
                  </div>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled
                  >
                    {config.buttonText}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Códigos Gerados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Código Embed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Code className="w-5 h-5" />
              <span>Código Embed</span>
            </CardTitle>
            <CardDescription>
              Cole este código no seu site
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{generateEmbedCode()}</code>
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(generateEmbedCode(), 'Código embed')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Link Direto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ExternalLink className="w-5 h-5" />
              <span>Link Direto</span>
            </CardTitle>
            <CardDescription>
              Link para redirecionamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Input
                  value={generateDirectLink()}
                  readOnly
                  className="pr-10"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-1 right-1"
                  onClick={() => copyToClipboard(generateDirectLink(), 'Link direto')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(generateDirectLink(), '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Testar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generateDirectLink(), 'Link direto')}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instruções */}
      <Alert>
        <Code className="w-4 h-4" />
        <AlertDescription>
          <strong>Como usar:</strong> Cole o código embed em qualquer página HTML ou use o link direto para redirecionamento. 
          O checkout processará pagamentos automaticamente e enviará eventos de sucesso via postMessage.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default CheckoutEmbed;