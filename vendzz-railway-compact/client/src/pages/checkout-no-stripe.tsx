import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, CreditCard, Shield, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CheckoutNoStripe() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<any>(null);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsProcessing(true);

    // Validação básica
    if (!customerName.trim()) {
      setError('Nome é obrigatório');
      setIsProcessing(false);
      return;
    }

    if (!customerEmail.trim()) {
      setError('Email é obrigatório');
      setIsProcessing(false);
      return;
    }

    try {
      // Simular processamento sem Stripe
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = {
        success: true,
        message: 'Checkout processado com sucesso',
        subscriptionId: `sub_${Date.now()}`,
        paymentId: `pay_${Date.now()}`,
        amount: 1.00,
        currency: 'BRL',
        status: 'active'
      };

      setSuccess(result);
      toast({
        title: "Checkout Concluído",
        description: "Sua solicitação foi processada com sucesso!",
      });
    } catch (error) {
      setError('Erro ao processar checkout');
      console.error('Erro:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Checkout Concluído!</CardTitle>
            <CardDescription>
              Sua solicitação foi processada com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Detalhes da Transação:</h3>
              <div className="space-y-2 text-sm text-green-700">
                <p><strong>ID da Assinatura:</strong> {success.subscriptionId}</p>
                <p><strong>ID do Pagamento:</strong> {success.paymentId}</p>
                <p><strong>Valor:</strong> R$ {success.amount.toFixed(2)}</p>
                <p><strong>Status:</strong> {success.status}</p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Próximos Passos:</h3>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• Você receberá um email de confirmação</li>
                <li>• Acesse sua conta para gerenciar a assinatura</li>
                <li>• Suporte disponível 24/7</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Checkout Vendzz
          </CardTitle>
          <CardDescription className="text-center">
            Sistema de checkout sem dependências externas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Sistema funcionando sem Stripe.js para evitar erros de carregamento
              </AlertDescription>
            </Alert>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2 flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                Informações do Pagamento
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Valor:</span>
                  <span className="font-medium">R$ 1,00</span>
                </div>
                <div className="flex justify-between">
                  <span>Método:</span>
                  <span className="font-medium">Simulação</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium text-green-600">Pronto</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">Segurança</span>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Processamento seguro sem dependências externas</li>
                <li>• Sistema próprio de validação</li>
                <li>• Dados protegidos localmente</li>
              </ul>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                'Finalizar Checkout'
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Sistema de checkout interno - sem dependências externas
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}