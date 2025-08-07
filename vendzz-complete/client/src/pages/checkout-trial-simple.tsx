import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, CreditCard, Shield, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function CheckoutTrialSimple() {
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
      // Simular processamento de pagamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = {
        success: true,
        message: 'Pagamento processado com sucesso',
        subscriptionId: `sub_${Date.now()}`,
        amount: 1.00,
        currency: 'BRL',
        trial: {
          duration: 3,
          unit: 'days'
        },
        recurring: {
          amount: 29.90,
          interval: 'monthly'
        }
      };

      setSuccess(result);
      toast({
        title: "Pagamento Processado",
        description: "Sua assinatura foi criada com sucesso!",
      });
    } catch (error) {
      setError('Erro ao processar pagamento');
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
            <CardTitle className="text-2xl text-green-600">Pagamento Confirmado!</CardTitle>
            <CardDescription>
              Sua assinatura foi criada com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Detalhes da Assinatura:</h3>
              <div className="space-y-2 text-sm text-green-700">
                <p><strong>ID:</strong> {success.subscriptionId}</p>
                <p><strong>Valor de Ativação:</strong> R$ {success.amount.toFixed(2)}</p>
                <p><strong>Trial:</strong> {success.trial.duration} {success.trial.unit}</p>
                <p><strong>Recorrência:</strong> R$ {success.recurring.amount}/mês</p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Próximos Passos:</h3>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• Você receberá um email de confirmação</li>
                <li>• Seu trial de 3 dias começou agora</li>
                <li>• Após o trial, será cobrado R$ 29,90/mês</li>
                <li>• Você pode cancelar a qualquer momento</li>
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
            Plano Premium - R$ 29,90/mês
          </CardTitle>
          <CardDescription className="text-center">
            Comece com apenas R$ 1,00 e ganhe 3 dias grátis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Benefícios */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">O que você terá:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm">Quizzes ilimitados</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm">SMS Marketing</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm">Email Marketing</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm">Analytics avançados</span>
              </div>
            </div>
          </div>

          {/* Formulário */}
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

            {/* Informações do Pagamento */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2 flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                Resumo do Pagamento
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Taxa de ativação:</span>
                  <span className="font-medium">R$ 1,00</span>
                </div>
                <div className="flex justify-between">
                  <span>Trial grátis:</span>
                  <span className="font-medium text-green-600">3 dias</span>
                </div>
                <div className="flex justify-between">
                  <span>Após o trial:</span>
                  <span className="font-medium">R$ 29,90/mês</span>
                </div>
              </div>
            </div>

            {/* Garantias */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">Garantias</span>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Cancele a qualquer momento</li>
                <li>• Dados protegidos com criptografia</li>
                <li>• 7 dias de garantia total</li>
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
                'Começar Agora - R$ 1,00'
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}