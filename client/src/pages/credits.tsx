import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Coins, 
  MessageSquare, 
  Mail, 
  Phone, 
  Zap, 
  Plus, 
  History,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface CreditInfo {
  sms: number;
  email: number;
  whatsapp: number;
  ai: number;
  total: number;
}

interface PlanLimits {
  quizzesLimit: number;
  smsLimit: number;
  emailLimit: number;
  whatsappLimit: number;
  aiLimit: number;
}

interface UsageStats {
  quizzesCreated: number;
  smsUsed: number;
  emailUsed: number;
  whatsappUsed: number;
  aiUsed: number;
}

interface CreditTransaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

export default function Credits() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: credits, isLoading: creditsLoading } = useQuery({
    queryKey: ['/api/user/credits'],
    queryFn: () => apiRequest('GET', '/api/user/credits')
  });

  const { data: planLimits, isLoading: limitsLoading } = useQuery({
    queryKey: ['/api/user/plan-limits'],
    queryFn: () => apiRequest('GET', '/api/user/plan-limits')
  });

  const { data: usageStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/user/usage-stats'],
    queryFn: () => apiRequest('GET', '/api/user/usage-stats')
  });

  const { data: creditHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['/api/user/credit-history'],
    queryFn: () => apiRequest('GET', '/api/user/credit-history')
  });

  const addCreditsMutation = useMutation({
    mutationFn: ({ type, amount, description }: { type: string; amount: number; description: string }) =>
      apiRequest('POST', '/api/user/credits', { type, amount, description }),
    onSuccess: () => {
      toast({
        title: "Créditos adicionados",
        description: "Seus créditos foram adicionados com sucesso!"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/credits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/credit-history'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar créditos",
        variant: "destructive"
      });
    }
  });

  const creditTypes = [
    { 
      key: 'sms', 
      label: 'SMS', 
      icon: MessageSquare, 
      color: 'bg-blue-500',
      price: 'R$ 0,12'
    },
    { 
      key: 'email', 
      label: 'Email', 
      icon: Mail, 
      color: 'bg-green-500',
      price: 'R$ 0,05'
    },
    { 
      key: 'whatsapp', 
      label: 'WhatsApp', 
      icon: Phone, 
      color: 'bg-purple-500',
      price: 'R$ 0,15'
    },
    { 
      key: 'ai', 
      label: 'I.A.', 
      icon: Zap, 
      color: 'bg-orange-500',
      price: 'R$ 2,50'
    }
  ];

  const handleAddCredits = (type: string, amount: number) => {
    addCreditsMutation.mutate({
      type,
      amount,
      description: `Adicionados ${amount} créditos ${type.toUpperCase()}`
    });
  };

  if (creditsLoading || limitsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando créditos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Créditos</h1>
          <p className="text-muted-foreground">
            Gerencie seus créditos e monitore o uso
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          <Coins className="w-4 h-4 mr-1" />
          {credits?.total || 0} créditos totais
        </Badge>
      </div>

      {/* Credit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {creditTypes.map((type) => {
          const Icon = type.icon;
          const current = credits?.[type.key] || 0;
          const used = usageStats?.[`${type.key}Used`] || 0;
          const limit = planLimits?.[`${type.key}Limit`] || 0;
          const percentage = limit > 0 ? (used / limit) * 100 : 0;

          return (
            <Card key={type.key} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-1 ${type.color}`}></div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <CardTitle className="text-lg">{type.label}</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {type.price}
                  </Badge>
                </div>
                <CardDescription>
                  {current} créditos disponíveis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Usado: {used}</span>
                    <span>Limite: {limit}</span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-2"
                  />
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddCredits(type.key, 100)}
                      disabled={addCreditsMutation.isPending}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      +100
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddCredits(type.key, 500)}
                      disabled={addCreditsMutation.isPending}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      +500
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="history">
            <History className="w-4 h-4 mr-2" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="usage">
            <TrendingUp className="w-4 h-4 mr-2" />
            Uso
          </TabsTrigger>
          <TabsTrigger value="packages">
            <Coins className="w-4 h-4 mr-2" />
            Pacotes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
              <CardDescription>
                Últimas movimentações de créditos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : creditHistory?.length > 0 ? (
                <div className="space-y-3">
                  {creditHistory.map((transaction: CreditTransaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        +{transaction.amount} {transaction.type.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>Nenhuma transação encontrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas de Uso</CardTitle>
              <CardDescription>
                Acompanhe o consumo de créditos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {creditTypes.map((type) => {
                  const used = usageStats?.[`${type.key}Used`] || 0;
                  const limit = planLimits?.[`${type.key}Limit`] || 0;
                  const percentage = limit > 0 ? (used / limit) * 100 : 0;
                  const Icon = type.icon;

                  return (
                    <div key={type.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{type.label}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {used} / {limit}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packages" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Pacote Básico', sms: 1000, email: 2000, whatsapp: 500, ai: 10, price: 'R$ 49,90' },
              { name: 'Pacote Avançado', sms: 5000, email: 10000, whatsapp: 2000, ai: 50, price: 'R$ 149,90' },
              { name: 'Pacote Premium', sms: 20000, email: 50000, whatsapp: 10000, ai: 200, price: 'R$ 499,90' }
            ].map((pkg) => (
              <Card key={pkg.name} className="relative">
                <CardHeader>
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                  <CardDescription>
                    Pacote completo de créditos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>SMS</span>
                        <span>{pkg.sms.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Email</span>
                        <span>{pkg.email.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>WhatsApp</span>
                        <span>{pkg.whatsapp.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>I.A.</span>
                        <span>{pkg.ai}</span>
                      </div>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">{pkg.price}</span>
                        <Button size="sm">
                          Comprar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}