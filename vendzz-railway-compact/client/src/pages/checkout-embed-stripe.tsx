import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, CreditCard, Shield, Clock, Star, Zap, Users, Target } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51RjvV9HK6al3veW1pEfLvNULBNQJjbJmZBuOBPxhw4qzqTDJHhCBdVUf3AJ6mPZvhHCk8WK9f5aGnmhKQZ8Y00gLhVjdGx');

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: true,
};

interface CheckoutFormProps {
  onSuccess: (result: any) => void;
}

function CheckoutForm({ onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    if (!customerData.name || !customerData.email || !customerData.phone) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Usar o novo endpoint público que funciona sem autenticação
      const response = await fetch('/api/public/checkout/create-embed-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerName: customerData.name,
          customerEmail: customerData.email,
          customerPhone: customerData.phone
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Redirecionar para o checkout Stripe
        window.location.href = result.checkoutUrl;
      } else {
        throw new Error(result.message || 'Erro ao criar sessão de pagamento');
      }
    } catch (error) {
      toast({
        title: "Erro no pagamento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <Card className="border-2 border-green-200">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 bg-green-100 rounded-full">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
              Vendzz Pro
            </CardTitle>
          </div>
          <CardDescription className="text-lg text-gray-600">
            Plataforma completa de quiz funnels para captura de leads
          </CardDescription>
          
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Clock className="h-4 w-4 mr-1" />
              3 dias grátis
            </Badge>
            <Badge variant="outline" className="border-green-200">
              <Shield className="h-4 w-4 mr-1" />
              Cancela quando quiser
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {/* Resumo do Plano */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Resumo do Plano
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Taxa de ativação</span>
                <span className="font-bold text-green-600">R$ 1,00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Trial gratuito</span>
                <span className="font-bold text-blue-600">3 dias</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Após o trial</span>
                <span className="font-bold text-gray-900">R$ 29,90/mês</span>
              </div>
            </div>
          </div>

          {/* Benefícios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm">Quiz builder ilimitado</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm">Campanhas SMS/WhatsApp</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm">Analytics avançado</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm">Integrações premium</span>
            </div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome completo *</Label>
                <Input
                  id="name"
                  type="text"
                  value={customerData.name}
                  onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                  placeholder="Seu nome completo"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerData.phone}
                  onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={customerData.email}
                onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <Label>Informações do cartão *</Label>
              <div className="border rounded-md p-3 bg-white">
                <CardElement options={cardElementOptions} />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 text-lg font-semibold"
              disabled={!stripe || loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Processando...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Ativar por R$ 1,00
                </>
              )}
            </Button>

            <div className="text-center text-sm text-gray-500">
              <p>
                🔒 Pagamento seguro via Stripe • Cancele quando quiser
              </p>
              <p className="mt-1">
                Após 3 dias de trial será cobrado R$ 29,90/mês
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutEmbedStripe() {
  const [paymentResult, setPaymentResult] = useState(null);

  const handlePaymentSuccess = (result) => {
    setPaymentResult(result);
  };

  if (paymentResult) {
    return (
      <div className="w-full max-w-md mx-auto p-6">
        <Card className="border-2 border-green-200">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-xl font-bold text-green-800">
              Pagamento Realizado!
            </CardTitle>
            <CardDescription>
              Sua assinatura foi ativada com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Você tem 3 dias de trial gratuito para testar todas as funcionalidades.
            </p>
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="bg-green-600 hover:bg-green-700"
            >
              Acessar Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ative sua conta Vendzz Pro
          </h1>
          <p className="text-gray-600">
            Comece com 3 dias grátis por apenas R$ 1,00
          </p>
        </div>

        <Elements stripe={stripePromise}>
          <CheckoutForm onSuccess={handlePaymentSuccess} />
        </Elements>
      </div>
    </div>
  );
}