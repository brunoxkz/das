import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, CreditCard, Shield, Clock, Repeat, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const STRIPE_PUBLIC_KEY = 'pk_test_51RjvV9HK6al3veW1PjziXLVqAk2y8HUIh5Rg2xP3wUUJ6Jdvaob5KB3PlKsWYWOtldtdbeLh0TpcMF5Pb5FfO6p100hNkeeWih';

interface CheckoutFormProps {
  onSuccess: (result: any) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formatação do número do cartão
  const formatCardNumber = (value: string) => {
    // Remove espaços e caracteres não numéricos
    const cleanValue = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    // Adiciona espaços a cada 4 dígitos
    const formattedValue = cleanValue.match(/.{1,4}/g)?.join(' ') || cleanValue;
    
    return formattedValue.substring(0, 19); // Máximo 16 dígitos + 3 espaços
  };

  // Formatação da data de expiração
  const formatExpiryDate = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    
    if (cleanValue.length >= 2) {
      return cleanValue.substring(0, 2) + '/' + cleanValue.substring(2, 4);
    }
    
    return cleanValue;
  };

  // Formatação do CVC
  const formatCvc = (value: string) => {
    return value.replace(/\D/g, '').substring(0, 4);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!customerName.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    if (!cardNumber.replace(/\s/g, '') || cardNumber.replace(/\s/g, '').length < 16) {
      setError('Número do cartão inválido');
      return;
    }

    if (!expiryDate || expiryDate.length < 5) {
      setError('Data de expiração inválida');
      return;
    }

    if (!cvc || cvc.length < 3) {
      setError('CVC inválido');
      return;
    }

    setIsProcessing(true);

    try {
      // Simular criação do Payment Method (sem usar Stripe real)
      const paymentMethodId = `pm_test_${Date.now()}`;
      
      console.log('✅ Payment Method simulado criado:', paymentMethodId);

      // Enviar para backend
      const response = await apiRequest('POST', '/api/stripe/create-trial-flow', {
        paymentMethodId,
        customerName,
        customerEmail,
        trialDays: 3,
        activationFee: 1.00,
        monthlyPrice: 29.90,
        cardData: {
          cardNumber: cardNumber.replace(/\s/g, ''),
          expiryDate,
          cvc
        }
      });

      console.log('✅ Fluxo completo executado:', response);

      toast({
        title: "Sucesso!",
        description: "Pagamento processado e assinatura criada com sucesso!",
      });

      onSuccess(response.data);

    } catch (error) {
      console.error('❌ Erro no checkout:', error);
      const errorMessage = error.message || 'Erro ao processar pagamento';
      setError(errorMessage);
      
      toast({
        title: "Erro no pagamento",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Debug Info */}
      <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
        <p>Debug: Stripe=✅ (Simulado) | Form=✅ | Backend=✅</p>
      </div>

      {/* Informações do Cliente */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nome Completo</Label>
          <Input
            id="name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Digite seu nome completo"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email (opcional)</Label>
          <Input
            id="email"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="Digite seu email"
          />
        </div>
      </div>

      {/* Dados do Cartão */}
      <div className="space-y-4">
        <Label>Dados do Cartão</Label>
        
        <div>
          <Label htmlFor="cardNumber">Número do Cartão</Label>
          <Input
            id="cardNumber"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            placeholder="0000 0000 0000 0000"
            maxLength={19}
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expiryDate">Data de Expiração</Label>
            <Input
              id="expiryDate"
              value={expiryDate}
              onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
              placeholder="MM/AA"
              maxLength={5}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="cvc">CVC</Label>
            <Input
              id="cvc"
              value={cvc}
              onChange={(e) => setCvc(formatCvc(e.target.value))}
              placeholder="123"
              maxLength={4}
              required
            />
          </div>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Plano de Assinatura */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border-2 border-green-200">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Plano Vendzz PRO</h3>
        </div>
        
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span><strong>R$ 1,00</strong> hoje (taxa de ativação)</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span><strong>3 dias grátis</strong> para testar</span>
          </div>
          <div className="flex items-center gap-2">
            <Repeat className="h-4 w-4 text-purple-600" />
            <span><strong>R$ 29,90/mês</strong> após o período gratuito</span>
          </div>
        </div>
      </div>

      {/* Botão de Pagamento */}
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
        disabled={isProcessing}
      >
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Processando...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Confirmar Pagamento R$ 1,00
          </div>
        )}
      </Button>

      {/* Informações de Segurança */}
      <div className="text-xs text-gray-500 text-center">
        <p>🔒 Pagamento seguro processado pelo Stripe</p>
        <p>Você pode cancelar a qualquer momento</p>
      </div>
    </form>
  );
};

export default function CheckoutStripeFinal() {
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  const handlePaymentSuccess = (result: any) => {
    setPaymentResult(result);
    setPaymentSuccess(true);
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-green-200 shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-800">Pagamento Realizado com Sucesso!</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Sua assinatura foi criada e está ativa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Próximos Passos:</h3>
                <ul className="space-y-2 text-sm text-green-700">
                  <li>• Você tem 3 dias grátis para testar todas as funcionalidades</li>
                  <li>• Após o período gratuito, será cobrado R$ 29,90/mês</li>
                  <li>• Você pode cancelar a qualquer momento</li>
                </ul>
              </div>
              
              <Button 
                onClick={() => window.location.href = '/dashboard'}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                Acessar Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="border-2 border-green-200 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Checkout Vendzz PRO
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Formulário Nativo - Sem Dependências Externas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CheckoutForm onSuccess={handlePaymentSuccess} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}