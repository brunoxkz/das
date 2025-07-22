import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Coins, 
  ShoppingCart, 
  MessageSquare, 
  Mail, 
  Phone, 
  Bot,
  Plus,
  CreditCard,
  Gift
} from "lucide-react";

export default function Credits() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar créditos do usuário
  const { data: credits, isLoading } = useQuery({
    queryKey: ["/api/credits"],
  });

  // Buscar histórico de transações
  const { data: transactions } = useQuery({
    queryKey: ["/api/credits/history"],
  });

  // Garantir que credits seja um objeto válido
  const safeCredits = credits || { sms: 0, email: 0, whatsapp: 0, ia: 0 };
  const safeTransactions = transactions || [];

  // Comprar créditos
  const buyCredits = useMutation({
    mutationFn: async (data: { type: string; quantity: number }) => {
      return apiRequest("/api/credits/purchase", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: () => {
      toast({
        title: "Créditos comprados com sucesso!",
        description: "Seus créditos foram adicionados à sua conta."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/credits"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao comprar créditos",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  });

  const creditTypes = [
    {
      type: 'sms',
      name: 'SMS',
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200',
      price: 0.12,
      description: 'Envie mensagens SMS para seus leads'
    },
    {
      type: 'email',
      name: 'Email',
      icon: <Mail className="w-6 h-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200',
      price: 0.05,
      description: 'Campanhas de email marketing'
    },
    {
      type: 'whatsapp',
      name: 'WhatsApp',
      icon: <Phone className="w-6 h-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 border-purple-200',
      price: 0.15,
      description: 'Automação WhatsApp Business'
    },
    {
      type: 'ia',
      name: 'I.A.',
      icon: <Bot className="w-6 h-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 border-orange-200',
      price: 2.50,
      description: 'Processamento de IA para quizzes'
    }
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gerenciar Créditos</h1>
        <Button>
          <Gift className="w-4 h-4 mr-2" />
          Códigos Promocionais
        </Button>
      </div>

      {/* Resumo de Créditos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {creditTypes.map((type) => {
          const currentCredits = safeCredits[type.type as keyof typeof safeCredits] || 0;
          return (
            <Card key={type.type} className={`border-2 ${type.bgColor}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg bg-white ${type.color}`}>
                    {type.icon}
                  </div>
                  <Badge variant="outline" className={type.color}>
                    R$ {type.price.toFixed(2)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{type.name}</h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{currentCredits}</span>
                    <Button 
                      size="sm" 
                      onClick={() => buyCredits.mutate({ type: type.type, quantity: 100 })}
                      disabled={buyCredits.isPending}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Comprar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="purchase" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="purchase">Comprar Créditos</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="purchase" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {creditTypes.map((type) => (
              <Card key={type.type}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {type.icon}
                    Créditos {type.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[100, 500, 1000, 5000].map((quantity) => (
                      <Button
                        key={quantity}
                        variant="outline"
                        className="flex flex-col h-auto p-4"
                        onClick={() => buyCredits.mutate({ type: type.type, quantity })}
                        disabled={buyCredits.isPending}
                      >
                        <span className="font-bold">{quantity}</span>
                        <span className="text-sm text-gray-500">
                          R$ {(quantity * type.price).toFixed(2)}
                        </span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
            </CardHeader>
            <CardContent>
              {safeTransactions.length > 0 ? (
                <div className="space-y-2">
                  {safeTransactions.map((transaction: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">{transaction.type} - {transaction.quantity} créditos</p>
                          <p className="text-sm text-gray-500">{new Date(transaction.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600">
                        +{transaction.quantity}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Nenhuma transação encontrada
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}