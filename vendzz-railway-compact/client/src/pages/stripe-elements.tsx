import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Eye, Code, ExternalLink, Plus, Trash2, Settings, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";

export default function StripeElementsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLink, setSelectedLink] = useState<any>(null);
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    immediateAmount: 1.00,
    trialDays: 3,
    recurringAmount: 29.90,
    recurringInterval: 'monthly' as 'monthly' | 'quarterly' | 'yearly'
  });

  // Buscar links existentes
  const { data: linksData, isLoading, refetch } = useQuery({
    queryKey: ["/api/stripe/checkout-links"],
  });

  const links = linksData?.links || [];

  // Mutation para criar novo checkout link
  const createCheckoutMutation = useMutation({
    mutationFn: async (planData: any) => {
      return await apiRequest("POST", "/api/stripe/create-checkout-link", {
        name: planData.name,
        description: planData.description,
        immediateAmount: planData.immediateAmount,
        trialDays: planData.trialDays,
        recurringAmount: planData.recurringAmount,
        currency: 'BRL',
        expiresInHours: 24 * 7, // 7 dias
        recurringInterval: planData.recurringInterval // Adicionando suporte ao intervalo
      });
    },
    onSuccess: () => {
      toast({
        title: "Checkout Link criado!",
        description: "Seu novo link de checkout foi criado com sucesso.",
      });
      setShowCreateForm(false);
      setNewPlan({
        name: '',
        description: '',
        immediateAmount: 1.00,
        trialDays: 3,
        recurringAmount: 29.90,
        recurringInterval: 'monthly'
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stripe/checkout-links"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar link",
        description: "Não foi possível criar o checkout link. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  // Mutation para criar checkout session oficial
  const createOfficialCheckoutMutation = useMutation({
    mutationFn: async (planData: any) => {
      return await apiRequest("POST", "/api/stripe/create-one-time-subscription", {
        customerEmail: 'admin@vendzz.com',
        customerName: 'Admin Vendzz',
        immediateAmount: planData.immediateAmount,
        trialDays: planData.trialDays,
        recurringAmount: planData.recurringAmount,
        recurringInterval: planData.recurringInterval,
        successUrl: `${window.location.origin}/stripe-success`,
        cancelUrl: `${window.location.origin}/stripe-cancel`,
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Checkout Session criado!",
        description: "Redirecionando para o checkout oficial da Stripe...",
      });
      
      // Redirecionar para o checkout da Stripe
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar checkout",
        description: "Não foi possível criar o checkout session. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  // Mutation para criar Payment Intent
  const createPaymentIntentMutation = useMutation({
    mutationFn: async (planData: any) => {
      return await apiRequest("POST", "/api/stripe/payment-intent-simple", {
        customerEmail: 'admin@vendzz.com',
        immediateAmount: planData.immediateAmount,
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Payment Intent criado!",
        description: "Redirecionando para demonstração completa...",
      });
      
      console.log("Payment Intent criado:", data);
      // Redirecionar para página de demonstração
      window.location.href = '/stripe-payment-intent-demo';
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar Payment Intent",
        description: "Não foi possível criar o Payment Intent. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  // Gerar código embed para o link
  const generateEmbedCode = (link: any) => {
    // Gerar URL pública baseada no domínio atual
    const publicUrl = window.location.origin + link.checkoutUrl.replace(/^https?:\/\/[^\/]+/, '');
    
    const embedCode = `<!-- Stripe Elements Embed - ${link.name} -->
<iframe 
  src="${publicUrl}" 
  width="100%" 
  height="600" 
  frameborder="0" 
  style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);"
  title="Checkout ${link.name}">
</iframe>

<!-- Código JavaScript para integração avançada -->
<script>
  // Escutar eventos do checkout
  window.addEventListener('message', function(event) {
    if (event.data.type === 'checkout_success') {
      // Redirecionar após sucesso
      window.location.href = '/sucesso';
    }
    if (event.data.type === 'checkout_error') {
      // Tratar erro
      console.error('Erro no checkout:', event.data.error);
    }
  });
</script>`;

    return embedCode;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Código copiado!",
      description: "O código embed foi copiado para a área de transferência.",
    });
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL copiada!",
      description: "A URL do checkout foi copiada para a área de transferência.",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Carregando links de checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Stripe Elements</h1>
            <p className="text-gray-600">
              Gerencie códigos embed e integre checkouts em qualquer site
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Checkout Link
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Total de Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{links.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Links Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {links.filter((link: any) => link.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Total de Usos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {links.reduce((sum: number, link: any) => sum + link.usageCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Links List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {links.map((link: any) => (
          <Card key={link.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{link.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  {link.isActive ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Inativo</Badge>
                  )}
                </div>
              </div>
              <CardDescription>{link.description}</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {/* Pricing Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-500">Taxa de Ativação</Label>
                    <p className="font-medium">R$ {link.immediateAmount?.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Valor Recorrente</Label>
                    <p className="font-medium">R$ {link.recurringAmount?.toFixed(2)}/mês</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Trial</Label>
                    <p className="font-medium">{link.trialDays} dias</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Usos</Label>
                    <p className="font-medium">{link.usageCount}</p>
                  </div>
                </div>

                {/* URLs */}
                <div className="space-y-2">
                  <Label className="text-gray-500">URL do Checkout</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={link.checkoutUrl}
                      readOnly
                      className="flex-1 text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyUrl(link.checkoutUrl)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(link.checkoutUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedLink(link);
                      setShowEmbedCode(true);
                    }}
                  >
                    <Code className="w-4 h-4 mr-2" />
                    Código Embed
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(link.checkoutUrl, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </Button>
                </div>

                {/* Dates */}
                <div className="text-xs text-gray-500 pt-2 border-t">
                  <p>Criado em {format(new Date(link.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                  <p>Expira em {format(new Date(link.expiresAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {links.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-500 mb-4">
              <Code className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum link encontrado</h3>
              <p>Crie seu primeiro checkout link para começar a usar o Stripe Elements</p>
            </div>
            <Button onClick={() => window.location.href = '/stripe-checkout-manager'}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Link de Checkout
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Checkout Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2 text-blue-600" />
                Criar Checkout Link
              </CardTitle>
              <CardDescription>
                Configure seu plano com invoice + recurring + save payment card
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Passo 1: Dados do Plano */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <h3 className="font-semibold">Dados do Plano</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome do Plano</Label>
                      <Input
                        id="name"
                        value={newPlan.name}
                        onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                        placeholder="Ex: Plano Premium"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Input
                        id="description"
                        value={newPlan.description}
                        onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                        placeholder="Ex: Acesso completo às funcionalidades"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="immediateAmount">Taxa de Ativação (R$)</Label>
                      <Input
                        id="immediateAmount"
                        type="number"
                        step="0.01"
                        value={newPlan.immediateAmount}
                        onChange={(e) => setNewPlan({...newPlan, immediateAmount: parseFloat(e.target.value) || 0})}
                        placeholder="1.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="trialDays">Dias de Trial</Label>
                      <Input
                        id="trialDays"
                        type="number"
                        value={newPlan.trialDays}
                        onChange={(e) => setNewPlan({...newPlan, trialDays: parseInt(e.target.value) || 0})}
                        placeholder="3"
                      />
                    </div>
                    <div>
                      <Label htmlFor="recurringAmount">Valor Recorrente (R$)</Label>
                      <Input
                        id="recurringAmount"
                        type="number"
                        step="0.01"
                        value={newPlan.recurringAmount}
                        onChange={(e) => setNewPlan({...newPlan, recurringAmount: parseFloat(e.target.value) || 0})}
                        placeholder="29.90"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="recurringInterval">Frequência da Cobrança</Label>
                    <Select 
                      value={newPlan.recurringInterval} 
                      onValueChange={(value) => setNewPlan({...newPlan, recurringInterval: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a frequência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="quarterly">Trimestral</SelectItem>
                        <SelectItem value="yearly">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Passo 2: Preview do Embed */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <h3 className="font-semibold">Preview do Fluxo</h3>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 space-y-2">
                      <div className="flex items-center justify-between">
                        <span>✅ Cobrança Imediata:</span>
                        <span className="font-bold text-green-600">R$ {newPlan.immediateAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>🎁 Trial Gratuito:</span>
                        <span className="font-bold text-blue-600">{newPlan.trialDays} dias</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>💳 Cobrança Recorrente:</span>
                        <span className="font-bold text-purple-600">
                          R$ {newPlan.recurringAmount.toFixed(2)}/{newPlan.recurringInterval === 'monthly' ? 'mês' : newPlan.recurringInterval === 'quarterly' ? 'trimestre' : 'ano'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>💾 Cartão Salvo:</span>
                        <span className="font-bold text-indigo-600">Sim (Auto-cobrança)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Três Opções de Checkout baseadas na Referência Stripe */}
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold text-blue-800 mb-2">📋 Fluxo Baseado na Referência Oficial Stripe</h4>
                  <p className="text-sm text-blue-600 mb-3">
                    Implementação baseada em: <code>stripe-samples/subscription-use-cases/one-time-and-subscription</code>
                  </p>
                  
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        onClick={() => {
                          if (!newPlan.name || !newPlan.description) {
                            toast({
                              title: "Campos obrigatórios",
                              description: "Preencha nome e descrição do plano",
                              variant: "destructive",
                            });
                            return;
                          }
                          createOfficialCheckoutMutation.mutate(newPlan);
                        }}
                        disabled={createOfficialCheckoutMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        {createOfficialCheckoutMutation.isPending ? (
                          <div className="flex items-center">
                            <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-1"></div>
                            Criando...
                          </div>
                        ) : (
                          <>
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Checkout Oficial
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={() => {
                          if (!newPlan.name || !newPlan.description) {
                            toast({
                              title: "Campos obrigatórios",
                              description: "Preencha nome e descrição do plano",
                              variant: "destructive",
                            });
                            return;
                          }
                          createPaymentIntentMutation.mutate(newPlan);
                        }}
                        disabled={createPaymentIntentMutation.isPending}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        size="sm"
                      >
                        {createPaymentIntentMutation.isPending ? (
                          <div className="flex items-center">
                            <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-1"></div>
                            Criando...
                          </div>
                        ) : (
                          <>
                            <Code className="w-3 h-3 mr-1" />
                            Payment Intent
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={() => {
                          if (!newPlan.name || !newPlan.description) {
                            toast({
                              title: "Campos obrigatórios",
                              description: "Preencha nome e descrição do plano",
                              variant: "destructive",
                            });
                            return;
                          }
                          createCheckoutMutation.mutate(newPlan);
                        }}
                        disabled={createCheckoutMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                      >
                        {createCheckoutMutation.isPending ? (
                          <div className="flex items-center">
                            <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-1"></div>
                            Criando...
                          </div>
                        ) : (
                          <>
                            <Zap className="w-3 h-3 mr-1" />
                            Embed Link
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="text-xs text-blue-600 space-y-1">
                      <p>🟢 <strong>Checkout Oficial:</strong> Redirecionamento para Stripe Checkout (recomendado)</p>
                      <p>🟣 <strong>Payment Intent:</strong> Integração via Stripe Elements (customizável)</p>
                      <p>🔵 <strong>Embed Link:</strong> Link compartilhável com embed code</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Embed Code Modal */}
      {showEmbedCode && selectedLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Código Embed - {selectedLink.name}</CardTitle>
              <CardDescription>
                Cole este código em qualquer site para integrar o checkout
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Código HTML/JavaScript</Label>
                  <Textarea
                    value={generateEmbedCode(selectedLink)}
                    readOnly
                    className="font-mono text-sm h-64"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={() => copyToClipboard(generateEmbedCode(selectedLink))}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Código
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowEmbedCode(false)}
                  >
                    Fechar
                  </Button>
                </div>

                <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Instruções de Uso:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Cole o código em qualquer página HTML</li>
                    <li>O iframe carregará automaticamente o checkout</li>
                    <li>Personalize width e height conforme necessário</li>
                    <li>O JavaScript captura eventos de sucesso/erro</li>
                    <li>Redirecione para páginas de sucesso personalizadas</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}