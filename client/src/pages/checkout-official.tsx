import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Check, CreditCard, Shield, Zap, Users, Clock, ArrowRight } from 'lucide-react';

export default function CheckoutOfficial() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateCheckout = async () => {
    setIsLoading(true);
    try {
      // Buscar token do localStorage
      const token = localStorage.getItem('auth-token');
      if (!token) {
        toast({
          title: "Erro de autenticação",
          description: "Por favor, faça login primeiro",
          variant: "destructive",
        });
        return;
      }

      // Chamar o endpoint oficial
      const response = await fetch('/api/stripe/create-checkout-session-official-docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          trial_period_days: 3,
          activation_fee: 1.00,
          monthly_price: 29.90,
          currency: 'BRL'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar checkout');
      }

      console.log('✅ Checkout criado:', data);

      // Redirecionar para o Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast({
          title: "Checkout criado com sucesso",
          description: `Session ID: ${data.checkoutSessionId}`,
        });
      }

    } catch (error) {
      console.error('❌ Erro no checkout:', error);
      toast({
        title: "Erro no checkout",
        description: error.message || "Falha ao processar pagamento",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
          Checkout Oficial Stripe
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          Implementação baseada na documentação oficial do Stripe
        </p>
        <Badge variant="outline" className="text-green-600 border-green-600">
          Invoice Items + Subscription Pattern
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Plano Premium */}
        <Card className="relative">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Plano Premium</CardTitle>
                <CardDescription>
                  Acesso completo à plataforma Vendzz
                </CardDescription>
              </div>
              <Badge className="bg-green-600 hover:bg-green-700">
                Recomendado
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Preço */}
              <div className="text-center py-6">
                <div className="text-sm text-gray-600 mb-2">Taxa de ativação</div>
                <div className="text-4xl font-bold mb-2">R$ 1,00</div>
                <div className="text-sm text-gray-600">
                  Depois <span className="font-semibold">R$ 29,90/mês</span>
                </div>
              </div>

              <Separator />

              {/* Benefícios */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>3 dias de trial gratuito</span>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <span>Cartão salvo automaticamente</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span>Cobrança segura via Stripe</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-green-600" />
                  <span>Cancele a qualquer momento</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-green-600" />
                  <span>Suporte premium 24/7</span>
                </div>
              </div>

              <Separator />

              {/* Botão de ação */}
              <Button 
                onClick={handleCreateCheckout}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Criando checkout...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Começar Trial Gratuito</span>
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Detalhes técnicos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Implementação Oficial
            </CardTitle>
            <CardDescription>
              Baseado na documentação oficial do Stripe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">🔄 Fluxo de Pagamento</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Cliente informa dados do cartão</li>
                  <li>• Cartão é salvo automaticamente</li>
                  <li>• Taxa de R$1,00 cobrada imediatamente</li>
                  <li>• Trial de 3 dias inicia</li>
                  <li>• Após 3 dias: R$29,90/mês</li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">🛡️ Segurança</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• PCI DSS Level 1 compliant</li>
                  <li>• 3D Secure 2.0 suportado</li>
                  <li>• Criptografia end-to-end</li>
                  <li>• Webhooks verificados</li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">⚙️ Recursos Técnicos</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Invoice Items API</li>
                  <li>• Subscription API</li>
                  <li>• Setup Intent (salvamento de cartão)</li>
                  <li>• Webhook automation</li>
                </ul>
              </div>

              <Separator />

              <div className="flex items-center gap-2 text-sm text-green-600">
                <Clock className="h-4 w-4" />
                <span>100% conforme regulamentações brasileiras</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Observações legais */}
      <Card className="mt-8">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h4 className="font-medium">📋 Termos e Condições</h4>
            <p className="text-sm text-gray-600">
              Ao continuar, você concorda com nossos termos de uso e política de privacidade. 
              O trial pode ser cancelado a qualquer momento sem cobrança. 
              Após o período de trial, será cobrado R$29,90/mês até o cancelamento.
            </p>
            <p className="text-xs text-gray-500">
              Processamento seguro via Stripe. Dados do cartão não são armazenados em nossos servidores.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}