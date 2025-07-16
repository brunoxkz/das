import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  ShoppingCart, 
  CreditCard, 
  Gift, 
  Zap, 
  Check, 
  X, 
  Star, 
  TrendingUp, 
  Shield, 
  Clock,
  Users,
  Crown,
  Sparkles,
  Globe,
  Lock,
  Package,
  ArrowRight,
  Plus,
  Minus,
  Info,
  AlertCircle
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Configuração do Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface CheckoutConfig {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: 'BRL' | 'USD' | 'EUR';
  billingType: 'one_time' | 'subscription';
  subscriptionInterval?: 'monthly' | 'yearly';
  features: string[];
  orderBumps: OrderBump[];
  upsells: Upsell[];
  design: CheckoutDesign;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface OrderBump {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  features: string[];
  selected: boolean;
  popular?: boolean;
}

interface Upsell {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  features: string[];
  triggerCondition: 'after_main_product' | 'after_payment' | 'exit_intent';
  design: {
    backgroundColor: string;
    textColor: string;
    buttonColor: string;
  };
}

interface CheckoutDesign {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  headerImage?: string;
  logo?: string;
  testimonials: Testimonial[];
  urgencyTimer: boolean;
  socialProof: boolean;
  guaranteeBadge: boolean;
  securityBadges: boolean;
}

interface Testimonial {
  name: string;
  photo?: string;
  rating: number;
  comment: string;
  verified: boolean;
}

interface CheckoutFormData {
  email: string;
  fullName: string;
  phone: string;
  document: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  orderBumps: string[];
  acceptedUpsells: string[];
}

// Componente de formulário de checkout
const CheckoutForm: React.FC<{
  config: CheckoutConfig;
  onSubmit: (data: CheckoutFormData) => void;
  loading: boolean;
}> = ({ config, onSubmit, loading }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    fullName: '',
    phone: '',
    document: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Brasil'
    },
    orderBumps: [],
    acceptedUpsells: []
  });

  const [showUpsell, setShowUpsell] = useState(false);
  const [currentUpsell, setCurrentUpsell] = useState<Upsell | null>(null);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutos em segundos

  // Timer de urgência
  useEffect(() => {
    if (config.design.urgencyTimer && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [config.design.urgencyTimer, timeLeft]);

  // Formatação do timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cálculo do preço total
  const calculateTotal = () => {
    let total = config.price;
    
    // Adicionar order bumps selecionados
    config.orderBumps.forEach(bump => {
      if (formData.orderBumps.includes(bump.id)) {
        total += bump.price;
      }
    });
    
    return total;
  };

  // Formatação de moeda
  const formatPrice = (price: number) => {
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: config.currency === 'BRL' ? 'BRL' : config.currency
    });
    return formatter.format(price);
  };

  // Toggle order bump
  const toggleOrderBump = (bumpId: string) => {
    setFormData(prev => ({
      ...prev,
      orderBumps: prev.orderBumps.includes(bumpId)
        ? prev.orderBumps.filter(id => id !== bumpId)
        : [...prev.orderBumps, bumpId]
    }));
  };

  // Handlesubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      toast({
        title: "Erro",
        description: "Sistema de pagamento não carregado",
        variant: "destructive"
      });
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast({
        title: "Erro",
        description: "Dados do cartão não encontrados",
        variant: "destructive"
      });
      return;
    }

    try {
      // Mostrar upsell se houver
      const mainProductUpsell = config.upsells.find(
        u => u.triggerCondition === 'after_main_product'
      );
      
      if (mainProductUpsell && !formData.acceptedUpsells.includes(mainProductUpsell.id)) {
        setCurrentUpsell(mainProductUpsell);
        setShowUpsell(true);
        return;
      }

      // Processar pagamento
      onSubmit(formData);
    } catch (error) {
      toast({
        title: "Erro no checkout",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header com logo e timer */}
      <div className="text-center mb-8">
        {config.design.logo && (
          <img 
            src={config.design.logo} 
            alt="Logo" 
            className="mx-auto mb-4 h-12"
          />
        )}
        
        {config.design.urgencyTimer && timeLeft > 0 && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="font-bold">Oferta expira em: {formatTime(timeLeft)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Upsell */}
      {showUpsell && currentUpsell && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            style={{ 
              backgroundColor: currentUpsell.design.backgroundColor,
              color: currentUpsell.design.textColor 
            }}
          >
            <div className="text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
              <h3 className="text-2xl font-bold mb-2">{currentUpsell.title}</h3>
              <p className="mb-4">{currentUpsell.description}</p>
              
              <div className="mb-4">
                <span className="text-3xl font-bold">
                  {formatPrice(currentUpsell.price)}
                </span>
                {currentUpsell.originalPrice && (
                  <span className="text-lg text-gray-500 line-through ml-2">
                    {formatPrice(currentUpsell.originalPrice)}
                  </span>
                )}
              </div>

              <ul className="text-left mb-6">
                {currentUpsell.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 mb-2">
                    <Check className="w-4 h-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="flex gap-3">
                <Button 
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      acceptedUpsells: [...prev.acceptedUpsells, currentUpsell.id]
                    }));
                    setShowUpsell(false);
                    setCurrentUpsell(null);
                  }}
                  className="flex-1"
                  style={{ 
                    backgroundColor: currentUpsell.design.buttonColor,
                    color: currentUpsell.design.textColor 
                  }}
                >
                  Sim, eu quero!
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowUpsell(false);
                    setCurrentUpsell(null);
                  }}
                  className="flex-1"
                >
                  Não, obrigado
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna 1: Produto Principal */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                {config.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{config.description}</p>
              
              <div className="mb-4">
                <span className="text-3xl font-bold text-green-600">
                  {formatPrice(config.price)}
                </span>
                {config.originalPrice && (
                  <span className="text-lg text-gray-500 line-through ml-2">
                    {formatPrice(config.originalPrice)}
                  </span>
                )}
                {config.billingType === 'subscription' && (
                  <span className="text-sm text-gray-500 ml-2">
                    /{config.subscriptionInterval === 'monthly' ? 'mês' : 'ano'}
                  </span>
                )}
              </div>

              <ul className="space-y-2 mb-6">
                {config.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Order Bumps */}
              {config.orderBumps.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Complementos Especiais</h3>
                  {config.orderBumps.map((bump) => (
                    <div 
                      key={bump.id}
                      className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleOrderBump(bump.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            formData.orderBumps.includes(bump.id) 
                              ? 'bg-green-500 border-green-500' 
                              : 'border-gray-300'
                          }`}>
                            {formData.orderBumps.includes(bump.id) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{bump.title}</h4>
                            {bump.popular && (
                              <Badge variant="secondary">Popular</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{bump.description}</p>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-green-600">
                              {formatPrice(bump.price)}
                            </span>
                            {bump.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(bump.originalPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Formulário de dados */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Dados para Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Nome Completo</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="document">CPF/CNPJ</Label>
                    <Input
                      id="document"
                      value={formData.document}
                      onChange={(e) => setFormData(prev => ({ ...prev, document: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <Label>Dados do Cartão</Label>
                  <div className="mt-2 p-3 border rounded-md">
                    <CardElement
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': {
                              color: '#aab7c4',
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                <Button 
                  type="submit"
                  disabled={!stripe || loading}
                  className="w-full"
                  style={{ 
                    backgroundColor: config.design.buttonColor,
                    color: config.design.buttonTextColor 
                  }}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Finalizar Compra - {formatPrice(calculateTotal())}
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Coluna 2: Resumo e Elementos de Confiança */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>{config.name}</span>
                  <span>{formatPrice(config.price)}</span>
                </div>

                {formData.orderBumps.map(bumpId => {
                  const bump = config.orderBumps.find(b => b.id === bumpId);
                  return bump ? (
                    <div key={bumpId} className="flex justify-between text-sm">
                      <span>{bump.title}</span>
                      <span>{formatPrice(bump.price)}</span>
                    </div>
                  ) : null;
                })}

                <Separator />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-green-600">{formatPrice(calculateTotal())}</span>
                </div>

                {config.billingType === 'subscription' && (
                  <p className="text-sm text-gray-600 text-center">
                    Renovação automática {config.subscriptionInterval === 'monthly' ? 'mensal' : 'anual'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Elementos de Confiança */}
          {config.design.guaranteeBadge && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 text-center">
                  <Shield className="w-8 h-8 text-green-500" />
                  <div>
                    <h4 className="font-semibold">Garantia de 7 dias</h4>
                    <p className="text-sm text-gray-600">100% do seu dinheiro de volta</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {config.design.securityBadges && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <Lock className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">SSL Seguro</p>
                  </div>
                  <div className="text-center">
                    <Shield className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Stripe</p>
                  </div>
                  <div className="text-center">
                    <CreditCard className="w-6 h-6 text-gray-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Seguro</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Depoimentos */}
          {config.design.testimonials.length > 0 && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">O que dizem nossos clientes</h4>
                <div className="space-y-3">
                  {config.design.testimonials.slice(0, 2).map((testimonial, index) => (
                    <div key={index} className="border-l-4 border-green-500 pl-3">
                      <div className="flex items-center gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${
                              i < testimonial.rating ? 'text-yellow-500' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">"{testimonial.comment}"</p>
                      <p className="text-xs font-semibold">
                        {testimonial.name}
                        {testimonial.verified && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Verificado
                          </Badge>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prova Social */}
          {config.design.socialProof && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-center">
                  <Users className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-semibold">+1.247 pessoas</p>
                    <p className="text-xs text-gray-600">compraram hoje</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente principal
const CheckoutSystem: React.FC = () => {
  const params = useParams();
  const [location] = useLocation();
  const { toast } = useToast();

  const checkoutId = params.id || new URLSearchParams(location.split('?')[1]).get('id');

  const { data: checkoutConfig, isLoading, error } = useQuery({
    queryKey: ['/api/checkout', checkoutId],
    queryFn: async () => {
      if (!checkoutId) throw new Error('ID do checkout não fornecido');
      
      const response = await fetch(`/api/checkout/${checkoutId}`);
      if (!response.ok) throw new Error('Checkout não encontrado');
      
      return response.json();
    },
    enabled: !!checkoutId
  });

  const processPaymentMutation = useMutation({
    mutationFn: async (formData: CheckoutFormData) => {
      const response = await fetch('/api/checkout/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          checkoutId,
          formData
        })
      });

      if (!response.ok) throw new Error('Erro ao processar pagamento');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Pagamento processado!",
        description: "Seu pedido foi confirmado com sucesso."
      });
      
      // Redirecionar para página de sucesso
      window.location.href = `/checkout/success?orderId=${data.orderId}`;
    },
    onError: (error) => {
      toast({
        title: "Erro no pagamento",
        description: error.message || "Tente novamente",
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando checkout...</p>
        </div>
      </div>
    );
  }

  if (error || !checkoutConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Checkout não encontrado</h1>
          <p className="text-gray-600">Verifique o link e tente novamente.</p>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <div 
        className="min-h-screen"
        style={{ 
          backgroundColor: checkoutConfig.design.backgroundColor,
          color: checkoutConfig.design.textColor 
        }}
      >
        <CheckoutForm
          config={checkoutConfig}
          onSubmit={(formData) => processPaymentMutation.mutate(formData)}
          loading={processPaymentMutation.isPending}
        />
      </div>
    </Elements>
  );
};

export default CheckoutSystem;