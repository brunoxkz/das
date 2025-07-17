import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Code, 
  Copy, 
  ExternalLink, 
  Settings, 
  Eye,
  Palette,
  Monitor,
  Smartphone,
  Tablet,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  trial_price: number;
  trial_days: number;
  interval: string;
}

const CheckoutEmbed: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [embedSettings, setEmbedSettings] = useState({
    width: '100%',
    height: '600px',
    buttonText: 'Iniciar Teste Grátis',
    buttonColor: '#007bff',
    backgroundColor: '#f8f9fa',
  });
  const [generatedEmbed, setGeneratedEmbed] = useState<string>('');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar planos disponíveis
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['/api/stripe/plans'],
    staleTime: 30000,
  });

  // Mutation para gerar embed
  const generateEmbedMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/stripe/generate-embed', data);
    },
    onSuccess: (data) => {
      setGeneratedEmbed(data.embedCode);
      toast({
        title: "Embed gerado!",
        description: "Código de embed criado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: "Erro ao gerar embed: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerateEmbed = async () => {
    if (!selectedPlan) {
      toast({
        title: "Selecione um plano",
        description: "Por favor, selecione um plano antes de gerar o embed.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    generateEmbedMutation.mutate({
      planId: selectedPlan,
      ...embedSettings
    });
    setIsGenerating(false);
  };

  const handleCopyEmbed = () => {
    if (!generatedEmbed) return;
    
    navigator.clipboard.writeText(generatedEmbed);
    toast({
      title: "Copiado!",
      description: "Código de embed copiado para a área de transferência.",
    });
  };

  const getDeviceClass = () => {
    switch (previewDevice) {
      case 'mobile':
        return 'max-w-sm';
      case 'tablet':
        return 'max-w-md';
      default:
        return 'max-w-2xl';
    }
  };

  const selectedPlanData = plans.find((p: Plan) => p.id === selectedPlan);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sistema de Embed</h1>
        <p className="text-gray-600">Gere códigos de embed para integrar checkout em sites externos</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Configurações do Embed */}
        <div className="space-y-6">
          
          {/* Seleção de Plano */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações do Embed
              </CardTitle>
              <CardDescription>
                Configure o plano e aparência do seu embed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="space-y-2">
                <Label htmlFor="plan">Plano *</Label>
                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan: Plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - R$ {plan.trial_price.toFixed(2)} → R$ {plan.price.toFixed(2)}/{plan.interval === 'month' ? 'mês' : 'ano'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPlanData && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">{selectedPlanData.name}</h4>
                  <p className="text-sm text-blue-700 mb-2">{selectedPlanData.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Trial: R$ {selectedPlanData.trial_price.toFixed(2)} por {selectedPlanData.trial_days} dias
                    </Badge>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      Depois: R$ {selectedPlanData.price.toFixed(2)}/{selectedPlanData.interval === 'month' ? 'mês' : 'ano'}
                    </Badge>
                  </div>
                </div>
              )}

              <Separator />

              {/* Dimensões */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width">Largura</Label>
                  <Input
                    id="width"
                    value={embedSettings.width}
                    onChange={(e) => setEmbedSettings(prev => ({ ...prev, width: e.target.value }))}
                    placeholder="100%"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Altura</Label>
                  <Input
                    id="height"
                    value={embedSettings.height}
                    onChange={(e) => setEmbedSettings(prev => ({ ...prev, height: e.target.value }))}
                    placeholder="600px"
                  />
                </div>
              </div>

              {/* Aparência */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="buttonText">Texto do Botão</Label>
                  <Input
                    id="buttonText"
                    value={embedSettings.buttonText}
                    onChange={(e) => setEmbedSettings(prev => ({ ...prev, buttonText: e.target.value }))}
                    placeholder="Iniciar Teste Grátis"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="buttonColor">Cor do Botão</Label>
                    <div className="flex gap-2">
                      <Input
                        id="buttonColor"
                        type="color"
                        value={embedSettings.buttonColor}
                        onChange={(e) => setEmbedSettings(prev => ({ ...prev, buttonColor: e.target.value }))}
                        className="w-16 h-10"
                      />
                      <Input
                        value={embedSettings.buttonColor}
                        onChange={(e) => setEmbedSettings(prev => ({ ...prev, buttonColor: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backgroundColor">Cor de Fundo</Label>
                    <div className="flex gap-2">
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={embedSettings.backgroundColor}
                        onChange={(e) => setEmbedSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="w-16 h-10"
                      />
                      <Input
                        value={embedSettings.backgroundColor}
                        onChange={(e) => setEmbedSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleGenerateEmbed} 
                className="w-full" 
                disabled={isGenerating || !selectedPlan}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Code className="mr-2 h-4 w-4" />
                    Gerar Código de Embed
                  </>
                )}
              </Button>

            </CardContent>
          </Card>

          {/* Código Gerado */}
          {generatedEmbed && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Código de Embed
                </CardTitle>
                <CardDescription>
                  Copie e cole este código no seu site
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Textarea
                      value={generatedEmbed}
                      readOnly
                      rows={12}
                      className="font-mono text-sm"
                    />
                    <Button
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleCopyEmbed}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">
                      Código pronto para usar! Cole em qualquer site HTML.
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Preview */}
        <div className="space-y-6">
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview
              </CardTitle>
              <CardDescription>
                Visualize como o embed aparecerá no site
              </CardDescription>
            </CardHeader>
            <CardContent>
              
              {/* Seletor de Dispositivo */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewDevice('desktop')}
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  Desktop
                </Button>
                <Button
                  variant={previewDevice === 'tablet' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewDevice('tablet')}
                >
                  <Tablet className="h-4 w-4 mr-2" />
                  Tablet
                </Button>
                <Button
                  variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewDevice('mobile')}
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  Mobile
                </Button>
              </div>

              {/* Área de Preview */}
              <div className="border rounded-lg p-4 bg-gray-50 min-h-[400px] flex items-center justify-center">
                {selectedPlanData ? (
                  <div className={`${getDeviceClass()} transition-all duration-300`}>
                    <div 
                      style={{
                        width: embedSettings.width,
                        height: embedSettings.height,
                        background: embedSettings.backgroundColor,
                        borderRadius: '8px',
                        padding: '20px',
                        textAlign: 'center',
                        border: '1px solid #e9ecef'
                      }}
                    >
                      <h3 style={{ color: '#333', marginBottom: '20px' }}>
                        {selectedPlanData.name}
                      </h3>
                      <p style={{ color: '#666', marginBottom: '20px' }}>
                        {selectedPlanData.description}
                      </p>
                      <div style={{ marginBottom: '20px' }}>
                        <span style={{ color: '#28a745', fontSize: '24px', fontWeight: 'bold' }}>
                          R$ {selectedPlanData.trial_price.toFixed(2)}
                        </span>
                        <span style={{ color: '#666', fontSize: '14px' }}>
                          {' '}por {selectedPlanData.trial_days} dias
                        </span>
                      </div>
                      <div style={{ marginBottom: '20px' }}>
                        <span style={{ color: '#666', fontSize: '14px' }}>
                          Depois R$ {selectedPlanData.price.toFixed(2)}/{selectedPlanData.interval === 'month' ? 'mês' : 'ano'}
                        </span>
                      </div>
                      <button
                        style={{
                          background: embedSettings.buttonColor,
                          color: 'white',
                          border: 'none',
                          padding: '15px 30px',
                          borderRadius: '5px',
                          fontSize: '16px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        {embedSettings.buttonText}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Selecione um plano para visualizar o preview</p>
                  </div>
                )}
              </div>

              {selectedPlanData && (
                <div className="mt-4 flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-blue-500" />
                  <a 
                    href={`/checkout-public/${selectedPlanData.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline text-sm"
                  >
                    Abrir página de checkout pública
                  </a>
                </div>
              )}

            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
};

export default CheckoutEmbed;