import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Link, Copy, Clock, CheckCircle, X, ExternalLink } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface CheckoutLinkConfig {
  name: string;
  description: string;
  immediateAmount: number;
  trialDays: number;
  recurringAmount: number;
  currency: string;
  userId: string;
  expiresInHours?: number;
}

interface CheckoutLink {
  id: string;
  userId: string;
  config: CheckoutLinkConfig;
  accessToken: string;
  expiresAt: string;
  createdAt: string;
  usedAt?: string;
  used: boolean;
}

interface CreateLinkResponse {
  success: boolean;
  linkId: string;
  checkoutUrl: string;
  accessToken: string;
  expiresAt: string;
  message: string;
}

export default function StripeCheckoutLinksManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state
  const [formData, setFormData] = useState({
    name: 'Vendzz Premium',
    description: 'Acesso completo à plataforma de marketing',
    immediateAmount: 1.0,
    trialDays: 3,
    recurringAmount: 29.9,
    currency: 'brl',
    expiresInHours: 24,
  });

  const [showCreateForm, setShowCreateForm] = useState(false);

  // Query para listar links
  const { data: links, isLoading, refetch } = useQuery<CheckoutLink[]>({
    queryKey: ['/api/stripe/checkout-links'],
    refetchInterval: 30000, // Refetch a cada 30 segundos
  });

  // Mutation para criar link
  const createLinkMutation = useMutation({
    mutationFn: async (data: CheckoutLinkConfig) => {
      const response = await apiRequest('POST', '/api/stripe/create-checkout-link', data);
      return response as CreateLinkResponse;
    },
    onSuccess: (data) => {
      toast({
        title: "Link Criado!",
        description: `Link de checkout criado com sucesso e válido por ${formData.expiresInHours} horas`,
      });
      
      // Refetch links
      refetch();
      
      // Reset form
      setShowCreateForm(false);
      
      // Copiar para clipboard
      navigator.clipboard.writeText(data.checkoutUrl);
      
      toast({
        title: "Link Copiado!",
        description: "URL do checkout copiada para a área de transferência",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao Criar Link",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateLink = () => {
    createLinkMutation.mutate(formData);
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Copiado!",
      description: "URL copiada para a área de transferência",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Stripe Checkout Links</h1>
          <p className="text-gray-400 mt-1">Crie links diretos para checkout sem necessidade de login</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          {showCreateForm ? 'Cancelar' : 'Criar Link'}
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Criar Novo Link de Checkout</CardTitle>
            <CardDescription className="text-gray-400">
              Configure o produto e preços para o link de checkout
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-white">Nome do Produto</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="currency" className="text-white">Moeda</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brl">BRL (Real)</SelectItem>
                    <SelectItem value="usd">USD (Dólar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-white">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="immediateAmount" className="text-white">Taxa de Ativação (R$)</Label>
                <Input
                  id="immediateAmount"
                  type="number"
                  step="0.01"
                  value={formData.immediateAmount}
                  onChange={(e) => setFormData({ ...formData, immediateAmount: parseFloat(e.target.value) })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="trialDays" className="text-white">Dias de Trial</Label>
                <Input
                  id="trialDays"
                  type="number"
                  value={formData.trialDays}
                  onChange={(e) => setFormData({ ...formData, trialDays: parseInt(e.target.value) })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="recurringAmount" className="text-white">Valor Recorrente (R$)</Label>
                <Input
                  id="recurringAmount"
                  type="number"
                  step="0.01"
                  value={formData.recurringAmount}
                  onChange={(e) => setFormData({ ...formData, recurringAmount: parseFloat(e.target.value) })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="expiresInHours" className="text-white">Expiração (horas)</Label>
              <Select value={formData.expiresInHours?.toString()} onValueChange={(value) => setFormData({ ...formData, expiresInHours: parseInt(value) })}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hora</SelectItem>
                  <SelectItem value="6">6 horas</SelectItem>
                  <SelectItem value="12">12 horas</SelectItem>
                  <SelectItem value="24">24 horas</SelectItem>
                  <SelectItem value="48">48 horas</SelectItem>
                  <SelectItem value="72">72 horas</SelectItem>
                  <SelectItem value="168">1 semana</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCreateLink}
                disabled={createLinkMutation.isPending}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
              >
                {createLinkMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Criando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    Criar Link de Checkout
                  </div>
                )}
              </Button>
              
              <Button
                onClick={() => setShowCreateForm(false)}
                variant="outline"
                className="border-gray-600 text-gray-400 hover:bg-gray-700"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Links List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </CardContent>
          </Card>
        ) : links && links.length > 0 ? (
          links.map((link) => (
            <Card key={link.id} className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-lg">{link.config.name}</CardTitle>
                    <CardDescription className="text-gray-400 mt-1">
                      {link.config.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {link.used ? (
                      <span className="px-2 py-1 bg-green-900 text-green-300 rounded-full text-xs flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Usado
                      </span>
                    ) : isExpired(link.expiresAt) ? (
                      <span className="px-2 py-1 bg-red-900 text-red-300 rounded-full text-xs flex items-center gap-1">
                        <X className="w-3 h-3" />
                        Expirado
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-blue-900 text-blue-300 rounded-full text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Ativo
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pricing Info */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-green-400 font-semibold">
                      R$ {link.config.immediateAmount.toFixed(2)}
                    </div>
                    <div className="text-gray-400">Taxa de ativação</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-400 font-semibold">
                      {link.config.trialDays} dias
                    </div>
                    <div className="text-gray-400">Trial gratuito</div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-400 font-semibold">
                      R$ {link.config.recurringAmount.toFixed(2)}
                    </div>
                    <div className="text-gray-400">Depois do trial</div>
                  </div>
                </div>

                {/* Link URL */}
                <div className="bg-gray-700 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300 text-sm">Link de Checkout:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-600 px-2 py-1 rounded text-xs text-gray-300 flex-1 truncate">
                      {process.env.NODE_ENV === 'development' 
                        ? `http://localhost:5000/stripe-checkout-link/${link.id}?token=${link.accessToken}`
                        : `https://your-domain.com/stripe-checkout-link/${link.id}?token=${link.accessToken}`
                      }
                    </code>
                    <Button
                      onClick={() => copyToClipboard(
                        process.env.NODE_ENV === 'development' 
                          ? `http://localhost:5000/stripe-checkout-link/${link.id}?token=${link.accessToken}`
                          : `https://your-domain.com/stripe-checkout-link/${link.id}?token=${link.accessToken}`
                      )}
                      size="sm"
                      className="bg-gray-600 hover:bg-gray-500 text-white"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Criado: {formatDate(link.createdAt)}</span>
                  <span>Expira: {formatDate(link.expiresAt)}</span>
                  {link.usedAt && <span>Usado: {formatDate(link.usedAt)}</span>}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="text-center py-8">
              <Link className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Nenhum link de checkout criado ainda</p>
              <p className="text-gray-500 text-sm mt-2">
                Crie seu primeiro link para começar a receber pagamentos
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}