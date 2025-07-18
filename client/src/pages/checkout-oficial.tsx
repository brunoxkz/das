import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Copy, ExternalLink, Eye, Code, Settings, CreditCard, Globe, Link2 } from 'lucide-react';

export default function CheckoutOficial() {
  const [selectedPlan, setSelectedPlan] = useState('');
  const [embedConfig, setEmbedConfig] = useState({
    buttonText: 'Comprar Agora',
    buttonColor: '#059669',
    buttonStyle: 'rounded',
    openMode: 'redirect',
    width: '300px',
    height: '50px'
  });
  const [generatedCode, setGeneratedCode] = useState('');
  const { toast } = useToast();

  const plansQuery = useQuery({
    queryKey: ['/api/stripe/plans'],
    queryFn: () => apiRequest('GET', '/api/stripe/plans'),
  });

  const plans = Array.isArray(plansQuery.data) ? plansQuery.data : [];

  const generateEmbedCode = () => {
    if (!selectedPlan) {
      toast({
        title: "Selecione um plano",
        description: "Você precisa selecionar um plano para gerar o código embed",
        variant: "destructive",
      });
      return;
    }

    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return;

    const checkoutUrl = `${window.location.origin}/checkout-embed/${selectedPlan}`;
    
    const embedCode = `<!-- Vendzz Checkout Embed -->
<div id="vendzz-checkout-${selectedPlan}" class="vendzz-checkout-container">
  <button 
    onclick="window.open('${checkoutUrl}', '${embedConfig.openMode === 'popup' ? '_blank' : '_self'}')"
    style="
      background-color: ${embedConfig.buttonColor};
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      width: ${embedConfig.width};
      height: ${embedConfig.height};
      border-radius: ${embedConfig.buttonStyle === 'rounded' ? '8px' : embedConfig.buttonStyle === 'pill' ? '25px' : '0px'};
    "
    onmouseover="this.style.opacity='0.9'; this.style.transform='scale(1.05)'"
    onmouseout="this.style.opacity='1'; this.style.transform='scale(1)'"
  >
    ${embedConfig.buttonText}
  </button>
</div>

<script>
  // Opcional: Tracking de cliques
  document.querySelector('#vendzz-checkout-${selectedPlan} button').addEventListener('click', function() {
    console.log('Checkout button clicked for plan: ${selectedPlan}');
    // Adicione seu código de analytics aqui
  });
</script>`;

    setGeneratedCode(embedCode);
  };

  const generateDirectLink = () => {
    if (!selectedPlan) {
      toast({
        title: "Selecione um plano",
        description: "Você precisa selecionar um plano para gerar o link direto",
        variant: "destructive",
      });
      return;
    }

    return `${window.location.origin}/checkout-embed/${selectedPlan}`;
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${type} copiado para área de transferência`,
    });
  };

  const previewCheckout = () => {
    if (!selectedPlan) {
      toast({
        title: "Selecione um plano",
        description: "Você precisa selecionar um plano para visualizar",
        variant: "destructive",
      });
      return;
    }

    window.open(`/checkout-embed/${selectedPlan}`, '_blank');
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Checkout Oficial</h1>
        <p className="text-gray-600">Crie links de pagamento e códigos embed para seus planos</p>
      </div>

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Gerador de Embed
          </TabsTrigger>
          <TabsTrigger value="links" className="flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            Links Diretos
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Visualizar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Configurações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configurações do Embed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="plan-select">Selecionar Plano</Label>
                  <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha um plano" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - R$ {plan.price?.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="button-text">Texto do Botão</Label>
                  <Input
                    id="button-text"
                    value={embedConfig.buttonText}
                    onChange={(e) => setEmbedConfig(prev => ({ ...prev, buttonText: e.target.value }))}
                    placeholder="Comprar Agora"
                  />
                </div>

                <div>
                  <Label htmlFor="button-color">Cor do Botão</Label>
                  <div className="flex gap-2">
                    <Input
                      id="button-color"
                      type="color"
                      value={embedConfig.buttonColor}
                      onChange={(e) => setEmbedConfig(prev => ({ ...prev, buttonColor: e.target.value }))}
                      className="w-20"
                    />
                    <Input
                      value={embedConfig.buttonColor}
                      onChange={(e) => setEmbedConfig(prev => ({ ...prev, buttonColor: e.target.value }))}
                      placeholder="#059669"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="button-style">Estilo do Botão</Label>
                  <Select value={embedConfig.buttonStyle} onValueChange={(value) => setEmbedConfig(prev => ({ ...prev, buttonStyle: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rounded">Arredondado</SelectItem>
                      <SelectItem value="pill">Pill</SelectItem>
                      <SelectItem value="square">Quadrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="width">Largura</Label>
                    <Input
                      id="width"
                      value={embedConfig.width}
                      onChange={(e) => setEmbedConfig(prev => ({ ...prev, width: e.target.value }))}
                      placeholder="300px"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Altura</Label>
                    <Input
                      id="height"
                      value={embedConfig.height}
                      onChange={(e) => setEmbedConfig(prev => ({ ...prev, height: e.target.value }))}
                      placeholder="50px"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="open-mode">Modo de Abertura</Label>
                  <Select value={embedConfig.openMode} onValueChange={(value) => setEmbedConfig(prev => ({ ...prev, openMode: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="redirect">Redirecionar</SelectItem>
                      <SelectItem value="popup">Nova Aba</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={generateEmbedCode} className="w-full">
                  <Code className="w-4 h-4 mr-2" />
                  Gerar Código Embed
                </Button>
              </CardContent>
            </Card>

            {/* Preview e Código */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Preview e Código
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedPlan && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Preview do Botão:</h4>
                    <button
                      style={{
                        backgroundColor: embedConfig.buttonColor,
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        width: embedConfig.width,
                        height: embedConfig.height,
                        borderRadius: embedConfig.buttonStyle === 'rounded' ? '8px' : embedConfig.buttonStyle === 'pill' ? '25px' : '0px'
                      }}
                    >
                      {embedConfig.buttonText}
                    </button>
                  </div>
                )}

                {generatedCode && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Código HTML/JavaScript</Label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(generatedCode, 'Código embed')}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar
                      </Button>
                    </div>
                    <Textarea
                      value={generatedCode}
                      readOnly
                      className="font-mono text-sm h-64"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="links" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5" />
                Links Diretos de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plans.map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{plan.name}</h4>
                      <p className="text-sm text-gray-600">{plan.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">R$ {plan.trial_price?.toFixed(2) || '1,00'} taxa</Badge>
                        <Badge variant="outline">R$ {plan.price?.toFixed(2)}/mês</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(`${window.location.origin}/checkout/${plan.id}`, 'Link direto')}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar Link
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => window.open(`/checkout/${plan.id}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Abrir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Visualizar Checkout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="preview-plan">Selecionar Plano para Visualizar</Label>
                  <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha um plano" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - R$ {plan.price?.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={previewCheckout} disabled={!selectedPlan}>
                  <Eye className="w-4 h-4 mr-2" />
                  Visualizar Checkout
                </Button>

                {selectedPlan && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Instruções de Uso:</h4>
                    <ul className="space-y-1 text-sm text-blue-700">
                      <li>• Copie o código embed e cole no seu site</li>
                      <li>• Use os links diretos em campanhas de email</li>
                      <li>• Compartilhe em redes sociais</li>
                      <li>• Integre com suas landing pages</li>
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}