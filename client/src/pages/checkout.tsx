import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth-jwt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ShoppingCart, 
  CreditCard, 
  Gift, 
  TrendingUp, 
  Check, 
  X, 
  Plus,
  Minus,
  Star,
  Shield,
  Clock,
  Users,
  Zap,
  Crown,
  Package,
  Sparkles,
  ArrowRight,
  Info,
  AlertCircle,
  CheckCircle,
  FileText
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";

interface CheckoutItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  category: 'plan' | 'credits' | 'addon' | 'upsell';
  features?: string[];
  image?: string;
}

interface OrderBump {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  selected: boolean;
}

interface Upsell {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  features: string[];
  popular?: boolean;
}

export default function CheckoutSystem() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentStep, setCurrentStep] = useState<'cart' | 'payment' | 'upsells' | 'confirmation'>('cart');
  const [cartItems, setCartItems] = useState<CheckoutItem[]>([
    {
      id: 'premium-plan',
      name: 'Plano Premium',
      description: 'Acesso completo a todas as funcionalidades',
      price: 69.90,
      originalPrice: 149.90,
      quantity: 1,
      category: 'plan',
      features: ['Quizzes ilimitados', '50.000 leads/mês', 'Suporte prioritário']
    }
  ]);
  
  const [orderBumps, setOrderBumps] = useState<OrderBump[]>([
    {
      id: 'sms-credits',
      name: '1000 Créditos SMS',
      description: 'Créditos extras para campanhas SMS',
      price: 29.90,
      originalPrice: 49.90,
      discount: 40,
      selected: false
    },
    {
      id: 'whatsapp-pro',
      name: 'WhatsApp Pro',
      description: 'Automação avançada para WhatsApp',
      price: 39.90,
      originalPrice: 79.90,
      discount: 50,
      selected: false
    }
  ]);
  
  const [upsells, setUpsells] = useState<Upsell[]>([
    {
      id: 'enterprise-upgrade',
      name: 'Upgrade para Enterprise',
      description: 'Recursos empresariais avançados',
      price: 199.90,
      originalPrice: 399.90,
      features: ['Leads ilimitados', 'API completa', 'Suporte dedicado', 'Integrações personalizadas'],
      popular: true
    },
    {
      id: 'ai-assistant',
      name: 'Assistente I.A.',
      description: 'Criação automática de conteúdo',
      price: 49.90,
      originalPrice: 99.90,
      features: ['Geração de copy', 'Otimização automática', 'Análise preditiva']
    }
  ]);
  
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'debit' | 'pix' | 'boleto'>('credit');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    email: '',
    phone: '',
    document: '',
    zipCode: '',
    address: '',
    city: '',
    state: ''
  });

  // Cálculos do carrinho
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const orderBumpsTotal = orderBumps.filter(bump => bump.selected).reduce((total, bump) => total + bump.price, 0);
  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.discount / 100) : 0;
  const total = subtotal + orderBumpsTotal - discountAmount;
  
  // Mutations
  const applyCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch('/api/checkout/apply-coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ code })
      });
      if (!response.ok) throw new Error('Cupom inválido');
      return response.json();
    },
    onSuccess: (data) => {
      setAppliedCoupon(data);
      toast({
        title: "Cupom aplicado!",
        description: `Desconto de ${data.discount}% aplicado com sucesso!`
      });
    },
    onError: () => {
      toast({
        title: "Cupom inválido",
        description: "Verifique o código e tente novamente.",
        variant: "destructive"
      });
    }
  });
  
  const processPaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/checkout/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erro no pagamento');
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentStep('confirmation');
      toast({
        title: "Pagamento aprovado!",
        description: "Seu pedido foi processado com sucesso!"
      });
    },
    onError: () => {
      toast({
        title: "Erro no pagamento",
        description: "Tente novamente ou use outro método de pagamento.",
        variant: "destructive"
      });
    }
  });

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(items => 
      items.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setCartItems(items => items.filter(item => item.id !== itemId));
  };

  const toggleOrderBump = (bumpId: string) => {
    setOrderBumps(bumps => 
      bumps.map(bump => 
        bump.id === bumpId ? { ...bump, selected: !bump.selected } : bump
      )
    );
  };

  const applyCoupon = () => {
    if (!couponCode.trim()) return;
    applyCouponMutation.mutate(couponCode);
  };

  const processPayment = () => {
    const orderData = {
      items: cartItems,
      orderBumps: orderBumps.filter(bump => bump.selected),
      paymentMethod,
      billingCycle,
      coupon: appliedCoupon,
      total,
      paymentData
    };
    
    processPaymentMutation.mutate(orderData);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {['cart', 'payment', 'upsells', 'confirmation'].map((step, index) => (
          <div key={step} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${currentStep === step ? 'bg-green-500 text-white' : 
                ['cart', 'payment', 'upsells', 'confirmation'].indexOf(currentStep) > index ? 
                'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}
            `}>
              {['cart', 'payment', 'upsells', 'confirmation'].indexOf(currentStep) > index ? 
                <Check className="w-4 h-4" /> : index + 1}
            </div>
            {index < 3 && (
              <div className={`w-16 h-1 mx-2 rounded ${
                ['cart', 'payment', 'upsells', 'confirmation'].indexOf(currentStep) > index ? 
                'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const CartStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Seu Carrinho
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cartItems.map(item => (
            <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
                {item.features && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.features.map(feature => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-right">
                {item.originalPrice && (
                  <div className="text-sm text-gray-400 line-through">
                    {formatPrice(item.originalPrice)}
                  </div>
                )}
                <div className="font-semibold text-green-600">
                  {formatPrice(item.price)}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(item.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Order Bumps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Ofertas Especiais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {orderBumps.map(bump => (
            <div key={bump.id} className="flex items-center gap-4 p-4 border rounded-lg">
              <Checkbox
                checked={bump.selected}
                onCheckedChange={() => toggleOrderBump(bump.id)}
              />
              <div className="flex-1">
                <h3 className="font-semibold">{bump.name}</h3>
                <p className="text-sm text-gray-600">{bump.description}</p>
                {bump.discount && (
                  <Badge className="mt-1 bg-red-100 text-red-700">
                    {bump.discount}% OFF
                  </Badge>
                )}
              </div>
              <div className="text-right">
                {bump.originalPrice && (
                  <div className="text-sm text-gray-400 line-through">
                    {formatPrice(bump.originalPrice)}
                  </div>
                )}
                <div className="font-semibold text-green-600">
                  {formatPrice(bump.price)}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Coupon */}
      <Card>
        <CardHeader>
          <CardTitle>Cupom de Desconto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Digite seu cupom"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            <Button onClick={applyCoupon} disabled={applyCouponMutation.isPending}>
              {applyCouponMutation.isPending ? 'Aplicando...' : 'Aplicar'}
            </Button>
          </div>
          {appliedCoupon && (
            <Alert className="mt-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Cupom "{appliedCoupon.code}" aplicado! Desconto de {appliedCoupon.discount}%
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {orderBumpsTotal > 0 && (
            <div className="flex justify-between">
              <span>Ofertas especiais:</span>
              <span>{formatPrice(orderBumpsTotal)}</span>
            </div>
          )}
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Desconto:</span>
              <span>-{formatPrice(discountAmount)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total:</span>
            <span>{formatPrice(total)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={() => setCurrentStep('payment')}
          className="bg-green-600 hover:bg-green-700"
        >
          Continuar para Pagamento
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const PaymentStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Informações de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[
              { id: 'credit', name: 'Cartão de Crédito', icon: CreditCard },
              { id: 'debit', name: 'Cartão de Débito', icon: CreditCard },
              { id: 'pix', name: 'PIX', icon: Zap },
              { id: 'boleto', name: 'Boleto', icon: FileText }
            ].map(method => (
              <Button
                key={method.id}
                variant={paymentMethod === method.id ? "default" : "outline"}
                onClick={() => setPaymentMethod(method.id as any)}
                className="h-16 flex-col"
              >
                <method.icon className="w-5 h-5 mb-1" />
                <span className="text-xs">{method.name}</span>
              </Button>
            ))}
          </div>

          {(paymentMethod === 'credit' || paymentMethod === 'debit') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cardNumber">Número do Cartão</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={paymentData.cardNumber}
                  onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="cardName">Nome no Cartão</Label>
                <Input
                  id="cardName"
                  placeholder="João Silva"
                  value={paymentData.cardName}
                  onChange={(e) => setPaymentData({...paymentData, cardName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="expiryDate">Validade</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/AA"
                  value={paymentData.expiryDate}
                  onChange={(e) => setPaymentData({...paymentData, expiryDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={paymentData.cvv}
                  onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={paymentData.email}
                onChange={(e) => setPaymentData({...paymentData, email: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="(11) 99999-9999"
                value={paymentData.phone}
                onChange={(e) => setPaymentData({...paymentData, phone: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep('cart')}
        >
          Voltar ao Carrinho
        </Button>
        <Button 
          onClick={processPayment}
          disabled={processPaymentMutation.isPending}
          className="bg-green-600 hover:bg-green-700"
        >
          {processPaymentMutation.isPending ? 'Processando...' : `Pagar ${formatPrice(total)}`}
        </Button>
      </div>
    </div>
  );

  const ConfirmationStep = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-green-600">Pagamento Aprovado!</h2>
        <p className="text-gray-600 mt-2">
          Seu pedido foi processado com sucesso. Você receberá um email com os detalhes.
        </p>
      </div>
      <div className="flex justify-center gap-4">
        <Button asChild>
          <Link href="/dashboard">Ir para Dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/analytics">Ver Analytics</Link>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Sistema de Checkout</h1>
        <p className="text-gray-600 text-center">
          Complete sua compra de forma segura e rápida
        </p>
      </div>

      <StepIndicator />

      {currentStep === 'cart' && <CartStep />}
      {currentStep === 'payment' && <PaymentStep />}
      {currentStep === 'confirmation' && <ConfirmationStep />}
    </div>
  );
}