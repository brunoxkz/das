import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  Plus, 
  ExternalLink, 
  DollarSign, 
  Calendar, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Link as LinkIcon
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface CheckoutLink {
  id: string;
  linkId: string;
  name: string;
  description: string;
  immediateAmount: number;
  trialDays: number;
  recurringAmount: number;
  currency: string;
  checkoutUrl: string;
  accessToken: string;
  expiresAt: string;
  createdAt: string;
  isActive: boolean;
  usageCount: number;
}

interface CreateLinkData {
  name: string;
  description: string;
  immediateAmount: number;
  trialDays: number;
  recurringAmount: number;
  currency: string;
  expiresInHours: number;
}

const StripeCheckoutManager: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CreateLinkData>({
    name: 'Plano Premium - Vendzz',
    description: 'Acesso completo à plataforma com trial de 3 dias',
    immediateAmount: 1.00,
    trialDays: 3,
    recurringAmount: 29.90,
    currency: 'BRL',
    expiresInHours: 24
  });

  // Buscar links existentes
  const { data: links, isLoading } = useQuery({
    queryKey: ['/api/stripe/checkout-links'],
    retry: false,
  });

  // Criar novo link
  const createLinkMutation = useMutation({
    mutationFn: async (data: CreateLinkData) => {
      return await apiRequest('POST', '/api/stripe/checkout-links', data);
    },
    onSuccess: (response) => {
      toast({
        title: "Link criado com sucesso!",
        description: `Link válido por ${formData.expiresInHours} horas`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/stripe/checkout-links'] });
      setIsCreating(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar link",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    createLinkMutation.mutate(formData);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Link copiado para área de transferência",
    });
  };

  const openLink = (url: string) => {
    window.open(url, '_blank');
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'BRL' ? 'BRL' : 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Gerenciar Links de Checkout
          </h1>
          <p className="text-slate-300">
            Crie e gerencie links de checkout do Stripe Elements com trial automático
          </p>
        </div>

        {/* Formulário de criação */}
        <Card className="mb-8 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5" />
              {isCreating ? 'Criar Novo Link' : 'Criar Link de Checkout'}
            </CardTitle>
            <CardDescription className="text-slate-300">
              Links direcionam para o Stripe Elements com campos completos de cartão
            </CardDescription>
          </CardHeader>
          
          {isCreating && (
            <CardContent>
              <form onSubmit={handleCreateLink} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-white">Nome do Produto</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Plano Premium - Vendzz"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="expiresInHours" className="text-white">Expira em (horas)</Label>
                    <Input
                      id="expiresInHours"
                      type="number"
                      value={formData.expiresInHours}
                      onChange={(e) => setFormData({...formData, expiresInHours: Number(e.target.value)})}
                      className="bg-slate-700 border-slate-600 text-white"
                      min="1"
                      max="168"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-white">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Acesso completo à plataforma com trial de 3 dias"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="immediateAmount" className="text-white">Valor Imediato (R$)</Label>
                    <Input
                      id="immediateAmount"
                      type="number"
                      step="0.01"
                      value={formData.immediateAmount}
                      onChange={(e) => setFormData({...formData, immediateAmount: Number(e.target.value)})}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="trialDays" className="text-white">Dias de Trial</Label>
                    <Input
                      id="trialDays"
                      type="number"
                      value={formData.trialDays}
                      onChange={(e) => setFormData({...formData, trialDays: Number(e.target.value)})}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="recurringAmount" className="text-white">Valor Recorrente (R$)</Label>
                    <Input
                      id="recurringAmount"
                      type="number"
                      step="0.01"
                      value={formData.recurringAmount}
                      onChange={(e) => setFormData({...formData, recurringAmount: Number(e.target.value)})}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="currency" className="text-white">Moeda</Label>
                    <Input
                      id="currency"
                      value={formData.currency}
                      onChange={(e) => setFormData({...formData, currency: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="BRL"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    disabled={createLinkMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {createLinkMutation.isPending ? 'Criando...' : 'Criar Link'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreating(false)}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
          
          {!isCreating && (
            <CardContent>
              <Button 
                onClick={() => setIsCreating(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Novo Link
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Lista de links existentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {links?.links && links.links.length > 0 ? (
            links.links.map((link: CheckoutLink) => (
              <Card key={link.id} className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white text-lg">{link.name}</CardTitle>
                      <CardDescription className="text-slate-300 mt-1">
                        {link.description}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={isExpired(link.expiresAt) ? "destructive" : "secondary"}
                      className={isExpired(link.expiresAt) ? "bg-red-600" : "bg-green-600"}
                    >
                      {isExpired(link.expiresAt) ? (
                        <><AlertCircle className="w-3 h-3 mr-1" />Expirado</>
                      ) : (
                        <><CheckCircle className="w-3 h-3 mr-1" />Ativo</>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-slate-300">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {formatCurrency(link.immediateAmount, link.currency)} → {formatCurrency(link.recurringAmount, link.currency)}
                    </div>
                    <div className="flex items-center text-slate-300">
                      <Calendar className="w-4 h-4 mr-1" />
                      {link.trialDays} dias trial
                    </div>
                    <div className="flex items-center text-slate-300">
                      <Clock className="w-4 h-4 mr-1" />
                      Expira: {formatDate(link.expiresAt)}
                    </div>
                    <div className="flex items-center text-slate-300">
                      <LinkIcon className="w-4 h-4 mr-1" />
                      Usos: {link.usageCount || 0}
                    </div>
                  </div>

                  <div className="bg-slate-700 p-3 rounded-lg">
                    <Label className="text-white text-sm">URL do Checkout:</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={link.checkoutUrl}
                        readOnly
                        className="bg-slate-800 border-slate-600 text-slate-300 text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(link.checkoutUrl)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-600 px-3"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openLink(link.checkoutUrl)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-600 px-3"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-2 text-center py-12">
              <LinkIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Nenhum link criado ainda
              </h3>
              <p className="text-slate-400 mb-4">
                Crie seu primeiro link de checkout para começar a receber pagamentos
              </p>
              <Button 
                onClick={() => setIsCreating(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Link
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StripeCheckoutManager;