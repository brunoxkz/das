import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ArrowLeft, CreditCard, Eye, Code, Copy } from 'lucide-react';
import { Link } from 'wouter';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Componente do formulário de pagamento
const PaymentForm = ({ clientSecret, customerData }: { clientSecret: string, customerData: any }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
    });

    if (error) {
      toast({
        title: "Erro no pagamento",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Pagamento processado!",
        description: "Seu pagamento foi processado com sucesso.",
      });
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border">
        <h3 className="font-semibold text-gray-800 mb-2">Resumo do Plano</h3>
        <div className="space-y-1 text-sm">
          <p><strong>Cliente:</strong> {customerData.name}</p>
          <p><strong>Email:</strong> {customerData.email}</p>
          <p><strong>Plano:</strong> Vendzz Premium</p>
          <p><strong>Taxa de Ativação:</strong> R$ 1,00 (única vez)</p>
          <p><strong>Trial:</strong> 3 dias gratuitos</p>
          <p><strong>Após trial:</strong> R$ 29,90/mês</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <PaymentElement />
      </div>

      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
      >
        {isProcessing ? 'Processando...' : 'Confirmar Pagamento - R$ 1,00'}
      </Button>
    </form>
  );
};

export default function StripePaymentIntentDemo() {
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState<string>('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showEmbedCode, setShowEmbedCode] = useState(false);

  // Dados do cliente editáveis
  const [customerData, setCustomerData] = useState({
    name: 'João Silva',
    email: 'joao.silva@exemplo.com',
    phone: '(11) 99999-9999',
    document: '123.456.789-00'
  });

  // Mutation para criar Payment Intent
  const createPaymentIntentMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/stripe/payment-intent-simple", {
        customerEmail: data.email,
        customerName: data.name,
        immediateAmount: 1,
      });
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
      setShowPaymentForm(true);
      toast({
        title: "Payment Intent criado!",
        description: "Formulário de pagamento carregado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar Payment Intent",
        description: "Não foi possível criar o Payment Intent. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreatePaymentIntent = () => {
    createPaymentIntentMutation.mutate(customerData);
  };

  const generateEmbedCode = () => {
    const embedCode = `<!-- Stripe Payment Intent - Vendzz Premium -->
<div id="vendzz-payment-widget" style="max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="color: #1f2937; margin: 0 0 8px 0;">Vendzz Premium</h2>
    <p style="color: #6b7280; margin: 0; font-size: 14px;">Plataforma completa de quiz e marketing</p>
  </div>
  
  <div style="background: linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%); padding: 16px; border-radius: 6px; margin-bottom: 20px;">
    <h3 style="color: #1f2937; margin: 0 0 12px 0; font-size: 16px;">Resumo do Plano</h3>
    <div style="font-size: 14px; line-height: 1.5;">
      <p style="margin: 4px 0;"><strong>Cliente:</strong> ${customerData.name}</p>
      <p style="margin: 4px 0;"><strong>Email:</strong> ${customerData.email}</p>
      <p style="margin: 4px 0;"><strong>Taxa de Ativação:</strong> R$ 1,00 (única vez)</p>
      <p style="margin: 4px 0;"><strong>Trial:</strong> 3 dias gratuitos</p>
      <p style="margin: 4px 0;"><strong>Após trial:</strong> R$ 29,90/mês</p>
    </div>
  </div>
  
  <iframe 
    src="${window.location.origin}/stripe-payment-intent-demo?embed=true&name=${encodeURIComponent(customerData.name)}&email=${encodeURIComponent(customerData.email)}" 
    width="100%" 
    height="400" 
    frameborder="0" 
    style="border-radius: 6px; border: 1px solid #e5e7eb;"
    title="Vendzz Premium - Checkout">
  </iframe>
  
  <div style="text-align: center; margin-top: 16px; font-size: 12px; color: #6b7280;">
    Powered by <strong>Vendzz</strong> & <strong>Stripe</strong>
  </div>
</div>

<!-- Script de integração -->
<script>
window.addEventListener('message', function(event) {
  if (event.data.type === 'VENDZZ_PAYMENT_SUCCESS') {
    console.log('Pagamento realizado com sucesso!', event.data);
    // Adicione aqui sua lógica de sucesso
  }
});
</script>`;

    return embedCode;
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(generateEmbedCode());
    toast({
      title: "Código copiado!",
      description: "Código embed copiado para a área de transferência.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/stripe-elements">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Sistema de Pagamento Stripe - FUNCIONAL
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuração do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Dados do Cliente (Editáveis)
              </CardTitle>
              <CardDescription>
                Configure os dados do cliente para o pagamento real. Payment Intent processa pagamentos de R$ 1,00 para ativação do plano Premium.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={customerData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Digite o nome completo"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Digite o email"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={customerData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Digite o telefone"
                />
              </div>
              <div>
                <Label htmlFor="document">CPF</Label>
                <Input
                  id="document"
                  value={customerData.document}
                  onChange={(e) => handleInputChange('document', e.target.value)}
                  placeholder="Digite o CPF"
                />
              </div>

              <Button 
                onClick={handleCreatePaymentIntent}
                disabled={createPaymentIntentMutation.isPending}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {createPaymentIntentMutation.isPending ? 'Criando...' : 'Criar Payment Intent'}
              </Button>
            </CardContent>
          </Card>

          {/* Formulário de Pagamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Formulário de Pagamento
              </CardTitle>
              <CardDescription>
                Demonstração completa do Payment Intent com Stripe Elements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showPaymentForm ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    Configure os dados do cliente e clique em "Criar Payment Intent" para ver o formulário.
                  </p>
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border">
                    <h3 className="font-semibold text-gray-800 mb-2">Plano: Vendzz Premium</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Taxa de Ativação:</strong> R$ 1,00 (única vez)</p>
                      <p><strong>Trial:</strong> 3 dias gratuitos</p>
                      <p><strong>Após trial:</strong> R$ 29,90/mês</p>
                    </div>
                  </div>
                </div>
              ) : (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentForm clientSecret={clientSecret} customerData={customerData} />
                </Elements>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Código Embed */}
        {showPaymentForm && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Código Embed
              </CardTitle>
              <CardDescription>
                Copie este código para incorporar o checkout em seu site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowEmbedCode(!showEmbedCode)}
                    variant="outline"
                  >
                    {showEmbedCode ? 'Ocultar' : 'Mostrar'} Código
                  </Button>
                  <Button onClick={copyEmbedCode} variant="outline">
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Código
                  </Button>
                </div>
                
                {showEmbedCode && (
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm whitespace-pre-wrap">{generateEmbedCode()}</pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}