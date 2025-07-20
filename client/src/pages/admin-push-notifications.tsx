import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Send, Users, Smartphone, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth-jwt';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface NotificationStats {
  totalSubscriptions: number;
  activeUsers: number;
  timestamp: number;
}

const AdminPushNotifications: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Estados
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // Estados do formulário
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [notificationTitle, setNotificationTitle] = useState('🔔 Vendzz - Notificação Importante');
  const [notificationBody, setNotificationBody] = useState('');
  const [notificationType, setNotificationType] = useState<'individual' | 'global'>('individual');

  // Verificar se é admin
  const isAdmin = user?.email === 'admin@vendzz.com' || user?.email === 'bruno@vendzz.com';

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchStats();
    }
  }, [isAdmin]);

  // Buscar usuários
  const fetchUsers = async () => {
    try {
      const response = await apiRequest('GET', '/api/admin/users');
      if (response.success && Array.isArray(response.users)) {
        setUsers(response.users);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar usuários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive"
      });
    }
  };

  // Buscar estatísticas
  const fetchStats = async () => {
    try {
      const response = await apiRequest('GET', '/api/push-notifications/stats');
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
    }
  };

  // Enviar notificação individual
  const sendIndividualNotification = async () => {
    if (!selectedUserId || !notificationBody.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um usuário e digite a mensagem.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);

    try {
      const response = await apiRequest('POST', '/api/push-notifications/send', {
        targetUserId: selectedUserId,
        title: notificationTitle,
        body: notificationBody,
        url: '/app-pwa-vendzz',
        icon: '/vendzz-logo-official.png',
        tag: 'admin-notification'
      });

      if (response.success) {
        toast({
          title: "✅ Notificação enviada!",
          description: `Notificação push enviada para o usuário. Aparecerá na tela de bloqueio.`,
        });
        
        // Limpar formulário
        setNotificationBody('');
        setSelectedUserId('');
        
        // Atualizar estatísticas
        await fetchStats();
      }
    } catch (error) {
      console.error('❌ Erro ao enviar notificação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a notificação.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  // Enviar notificação global
  const sendGlobalNotification = async () => {
    if (!notificationBody.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Digite a mensagem da notificação.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);

    try {
      const response = await apiRequest('POST', '/api/push-notifications/global', {
        title: notificationTitle,
        body: notificationBody,
        url: '/app-pwa-vendzz',
        icon: '/vendzz-logo-official.png',
        tag: 'global-announcement'
      });

      if (response.success) {
        toast({
          title: "🌍 Notificação global enviada!",
          description: `Enviada para ${response.sentCount} usuários. Aparecerá na tela de bloqueio.`,
        });
        
        // Limpar formulário
        setNotificationBody('');
        
        // Atualizar estatísticas
        await fetchStats();
      }
    } catch (error) {
      console.error('❌ Erro ao enviar notificação global:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a notificação global.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  // Renderizar se não for admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <Card className="bg-red-900/50 border border-red-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-red-400" />
              <div>
                <h3 className="text-xl font-bold text-red-400">Acesso Negado</h3>
                <p className="text-red-300">Apenas administradores podem acessar esta página.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-green-400 flex items-center justify-center gap-3">
            <Bell className="h-8 w-8" />
            Admin - Push Notifications PWA
          </h1>
          <p className="text-gray-300">
            Envie notificações que aparecem na tela de bloqueio mesmo com app fechado
          </p>
        </div>

        {/* Estatísticas */}
        {stats && (
          <Card className="bg-gray-900/50 border border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Estatísticas em Tempo Real
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">{stats.totalSubscriptions}</div>
                  <div className="text-gray-400">Dispositivos Conectados</div>
                  <div className="text-xs text-gray-500 mt-1">Recebem notificações push</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">{stats.activeUsers}</div>
                  <div className="text-gray-400">Usuários Ativos</div>
                  <div className="text-xs text-gray-500 mt-1">Com notificações habilitadas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selector de Tipo */}
        <Card className="bg-gray-900/50 border border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-purple-400">Tipo de Notificação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={notificationType === 'individual' ? 'default' : 'outline'}
                onClick={() => setNotificationType('individual')}
                className={notificationType === 'individual' ? 'bg-purple-600 hover:bg-purple-700' : 'border-purple-500 text-purple-400'}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Individual
              </Button>
              <Button
                variant={notificationType === 'global' ? 'default' : 'outline'}
                onClick={() => setNotificationType('global')}
                className={notificationType === 'global' ? 'bg-purple-600 hover:bg-purple-700' : 'border-purple-500 text-purple-400'}
              >
                <Users className="h-4 w-4 mr-2" />
                Global
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Formulário de Notificação */}
        <Card className="bg-gray-900/50 border border-green-500/20">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center">
              <Send className="h-5 w-5 mr-2" />
              {notificationType === 'individual' ? 'Enviar Notificação Individual' : 'Enviar Notificação Global'}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {notificationType === 'individual' 
                ? 'Notificação aparecerá na tela de bloqueio do usuário selecionado'
                : 'Notificação será enviada para todos os usuários com PWA ativo'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Seletor de usuário (apenas para individual) */}
            {notificationType === 'individual' && (
              <div className="space-y-2">
                <Label htmlFor="user-select" className="text-gray-300">Usuário Destinatário</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Selecione um usuário..." />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id} className="text-white">
                        {user.email} {user.firstName && `(${user.firstName})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Título da notificação */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-300">Título da Notificação</Label>
              <Input
                id="title"
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Título que aparecerá na notificação"
              />
            </div>

            {/* Corpo da notificação */}
            <div className="space-y-2">
              <Label htmlFor="body" className="text-gray-300">Mensagem da Notificação</Label>
              <Textarea
                id="body"
                value={notificationBody}
                onChange={(e) => setNotificationBody(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Mensagem que aparecerá na notificação push..."
                rows={4}
              />
            </div>

            {/* Preview */}
            {notificationTitle && notificationBody && (
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                <h4 className="text-gray-300 text-sm mb-2">Preview da Notificação:</h4>
                <div className="bg-gray-700 p-3 rounded border-l-4 border-green-500">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-500 p-1 rounded">
                      <Bell className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-sm">{notificationTitle}</div>
                      <div className="text-gray-300 text-sm mt-1">{notificationBody}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botão de envio */}
            <Button
              onClick={notificationType === 'individual' ? sendIndividualNotification : sendGlobalNotification}
              disabled={isSending || (notificationType === 'individual' && !selectedUserId) || !notificationBody.trim()}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Zap className="h-4 w-4 mr-2" />
              {isSending ? 'Enviando...' : 
               notificationType === 'individual' ? 'Enviar Notificação Individual' : 'Enviar Notificação Global'}
            </Button>

            {/* Informações importantes */}
            <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/20">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-300">
                  <p className="font-semibold mb-1">Como funciona:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Notificação aparece na tela de bloqueio</li>
                    <li>• Funciona mesmo com app fechado</li>
                    <li>• Persiste após reinicialização do dispositivo</li>
                    <li>• Compatível com Android, iOS 16.4+ e Desktop</li>
                    <li>• Usuário precisa ter ativado as notificações no PWA</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPushNotifications;