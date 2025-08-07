import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Bell, Send, Users, Globe } from "lucide-react";

export default function AdminNotifications() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({
    title: "",
    body: "",
    url: "/app-pwa-vendzz",
    targetUserId: ""
  });

  // Verificar se é admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-gray-900 border-red-500/20">
          <CardContent className="p-8 text-center">
            <div className="text-red-400 text-2xl mb-4">🚫</div>
            <h2 className="text-white text-xl mb-2">Acesso Negado</h2>
            <p className="text-gray-400">Apenas administradores podem acessar esta página.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSendNotification = async () => {
    if (!notification.title || !notification.body) {
      toast({
        title: "Erro",
        description: "Título e mensagem são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/notifications/send-push', notification);
      
      toast({
        title: "✅ Sucesso",
        description: `Notificação enviada! ID: ${response.notificationId}`,
        variant: "default"
      });

      // Limpar formulário
      setNotification({
        title: "",
        body: "",
        url: "/app-pwa-vendzz",
        targetUserId: ""
      });
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao enviar notificação push",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = () => {
    setNotification({
      title: "🎯 Vendzz - Nova Campanha!",
      body: "Você tem uma nova resposta no seu quiz. Clique para visualizar!",
      url: "/app-pwa-vendzz?tab=analytics",
      targetUserId: ""
    });
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Bell className="h-8 w-8 text-green-500" />
            Admin - Notificações Push
          </h1>
          <p className="text-gray-400">
            Envie notificações push em tempo real para usuários do PWA Vendzz
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Formulário de Envio */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <Send className="h-5 w-5" />
                Enviar Notificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título da Notificação</Label>
                <Input
                  id="title"
                  value={notification.title}
                  onChange={(e) => setNotification(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: 🎯 Nova resposta no seu quiz!"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Mensagem</Label>
                <Textarea
                  id="body"
                  value={notification.body}
                  onChange={(e) => setNotification(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Você tem uma nova resposta no quiz de wellness. Clique para visualizar os resultados!"
                  className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL de Destino</Label>
                <Input
                  id="url"
                  value={notification.url}
                  onChange={(e) => setNotification(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="/app-pwa-vendzz?tab=analytics"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetUserId">ID do Usuário (opcional)</Label>
                <Input
                  id="targetUserId"
                  value={notification.targetUserId}
                  onChange={(e) => setNotification(prev => ({ ...prev, targetUserId: e.target.value }))}
                  placeholder="Deixe vazio para enviar globalmente"
                  className="bg-gray-800 border-gray-600 text-white"
                />
                <p className="text-xs text-gray-500">
                  Se vazio, a notificação será enviada para todos os usuários
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSendNotification}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Notificação
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleTestNotification}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  📝 Pré-definir
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Informações e Estatísticas */}
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-400">
                  <Users className="h-5 w-5" />
                  Tipos de Notificação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                  <Globe className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="font-medium">Global</div>
                    <div className="text-sm text-gray-400">Para todos os usuários PWA</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-medium">Específica</div>
                    <div className="text-sm text-gray-400">Para um usuário específico</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-yellow-400">📋 Como Testar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-black">1</div>
                  <span>Abra o PWA Vendzz em outra aba</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-black">2</div>
                  <span>Permita notificações quando solicitado</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-black">3</div>
                  <span>Envie uma notificação usando o formulário</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-black">4</div>
                  <span>A notificação aparecerá em tempo real!</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>🔔 Sistema de Notificações Push PWA Vendzz</p>
          <p>Service Worker integrado • Notificações em tempo real • Multiplataforma</p>
        </div>
      </div>
    </div>
  );
}