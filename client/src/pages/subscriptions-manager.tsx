import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  PauseCircle,
  CreditCard,
  Eye,
  X
} from "lucide-react";

interface Subscription {
  id: string;
  user_id: string;
  product_id: string;
  customer_id: string;
  status: 'active' | 'trialing' | 'cancelled' | 'past_due' | 'unpaid';
  trial_start: string;
  trial_end: string;
  next_billing_date: string;
  last_billing_date: string;
  billing_cycle: 'daily' | 'weekly' | 'monthly' | 'yearly';
  amount: number;
  setup_fee: number;
  currency: string;
  gateway_id: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  product_name: string;
  customer_name: string;
  customer_email: string;
}

interface BillingStats {
  total_subscriptions: number;
  active_subscriptions: number;
  trial_subscriptions: number;
  cancelled_subscriptions: number;
  total_monthly_revenue: number;
}

export default function SubscriptionsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Buscar assinaturas
  const { data: subscriptionsData, isLoading: loadingSubscriptions } = useQuery({
    queryKey: ["/api/subscriptions"],
  });

  // Buscar estatísticas
  const { data: statsData } = useQuery({
    queryKey: ["/api/billing/stats"],
  });

  const subscriptions = subscriptionsData?.subscriptions || [];
  const stats = statsData?.stats || {};
  const monthlyTransactions = statsData?.monthly_transactions || [];
  const upcomingCharges = statsData?.upcoming_charges || [];

  // Mutation para cancelar assinatura
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return await apiRequest("POST", `/api/subscriptions/${id}/cancel`, { reason });
    },
    onSuccess: () => {
      toast({
        title: "Assinatura cancelada com sucesso!",
        description: "A assinatura foi cancelada e não será mais cobrada.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/billing/stats"] });
      setShowCancelDialog(false);
      setSelectedSubscription(null);
      setCancelReason('');
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cancelar assinatura",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleCancelSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowCancelDialog(true);
  };

  const confirmCancelSubscription = () => {
    if (!selectedSubscription) return;
    
    cancelSubscriptionMutation.mutate({
      id: selectedSubscription.id,
      reason: cancelReason || 'Cancelamento solicitado pelo usuário'
    });
  };

  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(priceInCents / 100);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Ativa', variant: 'default' as const, icon: <CheckCircle className="w-3 h-3" /> },
      trialing: { label: 'Trial', variant: 'secondary' as const, icon: <Clock className="w-3 h-3" /> },
      cancelled: { label: 'Cancelada', variant: 'destructive' as const, icon: <XCircle className="w-3 h-3" /> },
      past_due: { label: 'Vencida', variant: 'destructive' as const, icon: <AlertCircle className="w-3 h-3" /> },
      unpaid: { label: 'Não Paga', variant: 'destructive' as const, icon: <PauseCircle className="w-3 h-3" /> },
    };

    const config = statusConfig[status] || statusConfig.active;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getBillingCycleLabel = (cycle: string) => {
    const cycles = {
      daily: 'Diário',
      weekly: 'Semanal', 
      monthly: 'Mensal',
      yearly: 'Anual'
    };
    return cycles[cycle] || cycle;
  };

  if (loadingSubscriptions) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gerenciador de Assinaturas</h1>
          <p className="text-gray-600 mt-2">
            Acompanhe e gerencie todas as assinaturas de seus produtos
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Total de Assinaturas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_subscriptions || 0}</div>
            <p className="text-xs text-gray-600">Todas as assinaturas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Assinaturas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active_subscriptions || 0}</div>
            <p className="text-xs text-gray-600">Cobrança ativa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Em Trial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.trial_subscriptions || 0}</div>
            <p className="text-xs text-gray-600">Período de teste</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              Receita Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(stats.total_monthly_revenue || 0)}
            </div>
            <p className="text-xs text-gray-600">Receita recorrente</p>
          </CardContent>
        </Card>
      </div>

      {/* Próximas Cobranças */}
      {upcomingCharges.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Próximas Cobranças
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingCharges.slice(0, 5).map((charge: any) => (
                <div key={charge.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{charge.product_name}</div>
                    <div className="text-sm text-gray-600">{charge.customer_name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatPrice(charge.amount)}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(charge.next_billing_date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Assinaturas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Todas as Assinaturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma assinatura encontrada
              </h3>
              <p className="text-gray-600">
                Crie produtos e gere assinaturas para vê-las aqui
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((subscription: Subscription) => (
                <div key={subscription.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium">{subscription.product_name}</div>
                        <div className="text-sm text-gray-600">{subscription.customer_name}</div>
                        <div className="text-sm text-gray-500">{subscription.customer_email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(subscription.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSubscription(subscription)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {subscription.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelSubscription(subscription)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Valor</div>
                      <div className="font-medium">{formatPrice(subscription.amount)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Ciclo</div>
                      <div className="font-medium">{getBillingCycleLabel(subscription.billing_cycle)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Próxima Cobrança</div>
                      <div className="font-medium">
                        {new Date(subscription.next_billing_date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Criada em</div>
                      <div className="font-medium">
                        {new Date(subscription.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Cancelamento */}
      {showCancelDialog && selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Cancelar Assinatura</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Tem certeza que deseja cancelar a assinatura de:
              </p>
              <p className="font-medium">{selectedSubscription.product_name}</p>
              <p className="text-sm text-gray-600">{selectedSubscription.customer_name}</p>
            </div>

            <div className="mb-4">
              <Label htmlFor="reason">Motivo do cancelamento (opcional)</Label>
              <Textarea
                id="reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Descreva o motivo do cancelamento..."
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCancelDialog(false);
                  setSelectedSubscription(null);
                  setCancelReason('');
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmCancelSubscription}
                disabled={cancelSubscriptionMutation.isPending}
              >
                {cancelSubscriptionMutation.isPending ? 'Cancelando...' : 'Confirmar Cancelamento'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {selectedSubscription && !showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium">Detalhes da Assinatura</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSubscription(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Produto</div>
                  <div className="font-medium">{selectedSubscription.product_name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Status</div>
                  <div>{getStatusBadge(selectedSubscription.status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Cliente</div>
                  <div className="font-medium">{selectedSubscription.customer_name}</div>
                  <div className="text-sm text-gray-500">{selectedSubscription.customer_email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Valor</div>
                  <div className="font-medium">{formatPrice(selectedSubscription.amount)}</div>
                  <div className="text-sm text-gray-500">
                    {getBillingCycleLabel(selectedSubscription.billing_cycle)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Início do Trial</div>
                  <div className="font-medium">
                    {new Date(selectedSubscription.trial_start).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Fim do Trial</div>
                  <div className="font-medium">
                    {new Date(selectedSubscription.trial_end).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Próxima Cobrança</div>
                  <div className="font-medium">
                    {new Date(selectedSubscription.next_billing_date).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Última Cobrança</div>
                  <div className="font-medium">
                    {selectedSubscription.last_billing_date ? 
                      new Date(selectedSubscription.last_billing_date).toLocaleDateString('pt-BR') : 
                      'Nenhuma'
                    }
                  </div>
                </div>
              </div>

              {selectedSubscription.setup_fee > 0 && (
                <div>
                  <div className="text-sm text-gray-600">Taxa de Ativação</div>
                  <div className="font-medium">{formatPrice(selectedSubscription.setup_fee)}</div>
                </div>
              )}

              {selectedSubscription.cancelled_at && (
                <div>
                  <div className="text-sm text-gray-600">Cancelada em</div>
                  <div className="font-medium">
                    {new Date(selectedSubscription.cancelled_at).toLocaleDateString('pt-BR')}
                  </div>
                  {selectedSubscription.cancellation_reason && (
                    <div className="text-sm text-gray-500 mt-1">
                      Motivo: {selectedSubscription.cancellation_reason}
                    </div>
                  )}
                </div>
              )}

              <div>
                <div className="text-sm text-gray-600">Gateway</div>
                <div className="font-medium">{selectedSubscription.gateway_id}</div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Criada em</div>
                <div className="font-medium">
                  {new Date(selectedSubscription.created_at).toLocaleDateString('pt-BR')} às {' '}
                  {new Date(selectedSubscription.created_at).toLocaleTimeString('pt-BR')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}