import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, CreditCard, Clock, Zap } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function CheckoutGPTSolution() {
  const [isLoading, setIsLoading] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleCreateCheckoutSession = async () => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Faça login para continuar",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/stripe/create-checkout-session-combined", {
        trial_period_days: 3,
        trial_price: 1.00,
        regular_price: 29.90,
        currency: "BRL"
      });

      setSessionData(response);
      
      toast({
        title: "Checkout criado com sucesso!",
        description: "Redirecionando para o pagamento...",
        variant: "default",
      });

      // Redirecionar para o Stripe Checkout
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      console.error('Erro ao criar checkout:', error);
      toast({
        title: "Erro ao criar checkout",
        description: error.message || "Tente novamente em alguns instantes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
              Solução GPT Combinada
            </Badge>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Checkout Stripe - Mode Subscription
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Implementação com line_items duplos conforme sugerido pelo GPT
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Plano */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-green-500" />
                  Plano Premium
                </CardTitle>
                <CardDescription>
                  Acesso completo à plataforma de quiz funnels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <CreditCard className="w-4 h-4" />
                    <span>R$1,00 taxa de ativação - cobrada agora</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span>3 dias de trial gratuito</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <CheckCircle className="w-4 h-4" />
                    <span>R$29,90/mês após trial - cobrança automática</span>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        R$1,00
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        hoje, depois R$29,90/mês
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Implementação Técnica */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600 dark:text-green-400">
                  Implementação Técnica
                </CardTitle>
                <CardDescription>
                  Detalhes da solução GPT combinada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">Mode</Badge>
                    <span>subscription</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">Line Items</Badge>
                    <span>Duplos (taxa + assinatura)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">Stripe</Badge>
                    <span>Assinatura criada automaticamente no Dashboard</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">Cartão</Badge>
                    <span>Salvo automaticamente para assinatura</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">Legal</Badge>
                    <span>100% compatível com políticas Stripe</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Botão de Ação */}
          <div className="mt-8 text-center">
            <Button 
              onClick={handleCreateCheckoutSession}
              disabled={isLoading}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg"
            >
              {isLoading ? (
                <>
                  <Clock className="w-5 h-5 mr-2 animate-spin" />
                  Criando checkout...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Testar Solução GPT Combinada
                </>
              )}
            </Button>
            
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Implementação com mode: subscription e line_items duplos
            </p>
          </div>

          {/* Resultado */}
          {sessionData && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-green-600 dark:text-green-400">
                  Checkout Session Criado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm font-mono bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div><strong>Session ID:</strong> {sessionData.sessionId}</div>
                  <div><strong>Customer ID:</strong> {sessionData.customerId}</div>
                  <div><strong>Monthly Price ID:</strong> {sessionData.monthlyPriceId}</div>
                  <div><strong>Trial Period:</strong> {sessionData.trialPeriodDays} dias</div>
                  <div><strong>Implementation:</strong> {sessionData.technical_implementation?.method}</div>
                  <div><strong>Mode:</strong> {sessionData.technical_implementation?.mode}</div>
                  <div><strong>Line Items:</strong> {sessionData.technical_implementation?.line_items}</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}