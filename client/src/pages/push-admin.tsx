import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bell, Send, Users, TrendingUp, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function PushAdmin() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar estatísticas
  const { data: stats } = useQuery({
    queryKey: ["/api/push-simple/stats"],
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

  // Mutação para enviar push
  const sendPushMutation = useMutation({
    mutationFn: async (data: { title: string; body: string }) => {
      return await apiRequest("POST", "/api/push-simple/send", data);
    },
    onSuccess: (response) => {
      toast({
        title: "✅ Push Enviado!",
        description: `${response.message}`,
      });
      setTitle("");
      setBody("");
      queryClient.invalidateQueries({ queryKey: ["/api/push-simple/stats"] });
    },
    onError: (error) => {
      toast({
        title: "❌ Erro ao enviar",
        description: error.message || "Falha no envio do push",
        variant: "destructive",
      });
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título e mensagem",
        variant: "destructive",
      });
      return;
    }
    sendPushMutation.mutate({ title: title.trim(), body: body.trim() });
  };

  // Templates de mensagem rápida
  const quickTemplates = [
    {
      title: "🎉 Promoção Especial",
      body: "Não perca! 50% OFF em todos os planos Vendzz por tempo limitado!"
    },
    {
      title: "📊 Relatório Semanal",
      body: "Seus resultados da semana estão prontos. Confira suas campanhas!"
    },
    {
      title: "🚀 Nova Funcionalidade",
      body: "Acabamos de lançar o Quiz Builder com IA. Teste agora!"
    },
    {
      title: "💡 Dica do Dia",
      body: "Use variáveis personalizadas para aumentar em 300% sua conversão!"
    }
  ];

  const useTemplate = (template: { title: string; body: string }) => {
    setTitle(template.title);
    setBody(template.body);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Bell className="h-8 w-8 text-green-600" />
              <CardTitle className="text-2xl font-bold text-green-700 dark:text-green-400">
                Push Notifications Admin
              </CardTitle>
            </div>
            <CardDescription>
              Envie notificações push personalizadas para todos os usuários conectados
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Estatísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {stats?.total || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Conectados
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Smartphone className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {stats?.recent || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Recentes (24h)
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  Sistema Ativo
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Formulário de Envio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-green-600" />
                Enviar Notificação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSend} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Título *
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: 🎉 Promoção Especial"
                    maxLength={50}
                    className="mt-1"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {title.length}/50 caracteres
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mensagem *
                  </label>
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Digite sua mensagem aqui..."
                    maxLength={120}
                    rows={3}
                    className="mt-1"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {body.length}/120 caracteres
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={sendPushMutation.isPending || !title.trim() || !body.trim()}
                >
                  {sendPushMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Enviando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Enviar Push
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Templates Rápidos */}
        <Card>
          <CardHeader>
            <CardTitle>📝 Templates Rápidos</CardTitle>
            <CardDescription>
              Clique em um template para usar como base
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {quickTemplates.map((template, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                     onClick={() => useTemplate(template)}>
                  <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {template.title}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {template.body}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <CardHeader>
            <CardTitle className="text-amber-800 dark:text-amber-400">
              💡 Como funciona
            </CardTitle>
          </CardHeader>
          <CardContent className="text-amber-700 dark:text-amber-300 space-y-2">
            <p>• <strong>Usuários conectados:</strong> Apenas dispositivos que ativaram as notificações receberão</p>
            <p>• <strong>Tempo real:</strong> As notificações aparecem imediatamente na tela de bloqueio</p>
            <p>• <strong>Limite de caracteres:</strong> Título (50) e mensagem (120) para melhor visualização</p>
            <p>• <strong>Emojis permitidos:</strong> Use emojis para tornar as mensagens mais atrativas</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}