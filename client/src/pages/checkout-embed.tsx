import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, CreditCard, Shield, Clock, User, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';

export default function CheckoutEmbed() {
  const [, params] = useRoute('/checkout-embed/:planId');
  const planId = params?.planId;
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const { data: plan, isLoading } = useQuery({
    queryKey: ['/api/stripe/plans', planId],
    enabled: !!planId,
  });

  const handleCheckout = async () => {
    if (!plan) return;
    
    // Validar campos obrigatórios
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos pessoais",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.cardNumber || !formData.expiryDate || !formData.cvv) {
      toast({
        title: "Dados do cartão",
        description: "Por favor, preencha todos os dados do cartão",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const response = await apiRequest('POST', '/api/stripe/simple-trial', {
        productName: plan.name,
        description: plan.description,
        activationPrice: plan.trial_price,
        trialDays: plan.trial_days,
        recurringPrice: plan.price,
        currency: plan.currency || 'BRL',
        customerData: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        }
      });
      
      if (response.success && response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
        toast({
          title: "Erro no checkout",
          description: response.message || "Erro ao criar checkout",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro no checkout",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold mb-2">Plano não encontrado</h2>
            <p className="text-gray-600">O plano solicitado não existe ou foi removido.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center pb-8">
            <div className="mb-4">
              <Badge className="bg-white/20 text-white border-white/30">
                Oferta Especial
              </Badge>
            </div>
            <CardTitle className="text-3xl font-bold mb-2">{plan.name}</CardTitle>
            <CardDescription className="text-blue-100 text-lg">
              {plan.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8">
            {/* Pricing Section */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    R$ {(plan.trial_price || 1.00).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Hoje</div>
                </div>
                <div className="text-gray-400">+</div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    R$ {(plan.price || 29.90).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">
                    /{plan.interval === 'month' ? 'mês' : 'ano'}
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center gap-2 text-blue-700">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">
                    {plan.trial_days || 3} dias de trial gratuito após primeiro pagamento
                  </span>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className="mb-8">
              <h3 className="font-semibold mb-4 text-center">O que está incluso:</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Quiz Builder Avançado',
                  'SMS Marketing',
                  'Email Marketing',
                  'WhatsApp Business',
                  'Analytics Completo',
                  'Integrações',
                  'Suporte Prioritário',
                  'Temas Personalizados'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Information Form */}
            <div className="mb-8">
              <h3 className="font-semibold mb-4 text-center text-lg">Complete seus dados</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Nome Completo
                  </label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digite seu nome completo"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Telefone
                  </label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="mb-8">
              <h3 className="font-semibold mb-4 text-center text-lg">
                <CreditCard className="w-5 h-5 inline mr-2" />
                Informações de Pagamento
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Número do Cartão</label>
                  <input 
                    type="text" 
                    value={formData.cardNumber}
                    onChange={(e) => handleFormChange('cardNumber', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Validade</label>
                    <input 
                      type="text" 
                      value={formData.expiryDate}
                      onChange={(e) => handleFormChange('expiryDate', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="MM/AA"
                      maxLength={5}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">CVV</label>
                    <input 
                      type="text" 
                      value={formData.cvv}
                      onChange={(e) => handleFormChange('cvv', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="123"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-6 mb-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Pagamento Seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span>Stripe</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Cancele quando quiser</span>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-4 text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Processando...
                </div>
              ) : (
                <>
                  🔒 Finalizar Compra - R$ {(plan?.trial_price || 1.00).toFixed(2)}
                </>
              )}
            </Button>

            {/* Guarantee */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                ✅ Garantia de 30 dias • 🔒 Dados seguros • 📱 Suporte via WhatsApp
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}