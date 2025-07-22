import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Bell, 
  Send, 
  Settings, 
  Users, 
  Activity,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  MessageSquare,
  Smartphone
} from 'lucide-react';

export default function AdminPush() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [config, setConfig] = useState({
    enabled: true,
    globalTemplate: {
      title: '🎉 Novo Quiz Completado!',
      message: 'Um usuário acabou de finalizar seu quiz: "{quizTitle}"'
    }
  });
  
  // Estado para mensagem personalizada
  const [customMessage, setCustomMessage] = useState({
    title: '',
    message: '',
    targetUser: 'all'
  });

  // Carregar configurações e estatísticas
  useEffect(() => {
    loadConfig();
    loadStats();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await apiRequest('/api/admin/push-config');
      if (response) {
        setConfig(response);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiRequest('/api/admin/push-stats');
      if (response) {
        setStats(response);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setStats({
        total: 0,
        recent: 0,
        enabled: true,
        sentToday: 0
      });
    }
  };

  const saveConfig = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/api/admin/push-config', {
        method: 'POST',
        body: JSON.stringify(config)
      });
      
      if (response?.success) {
        toast({
          title: "Configurações Salvas",
          description: "As configurações de push notifications foram atualizadas com sucesso!",
        });
        loadStats(); // Recarregar estatísticas
      } else {
        throw new Error('Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendCustomMessage = async () => {
    if (!customMessage.title || !customMessage.message) {
      toast({
        title: "Campos Obrigatórios",
        description: "Preencha o título e a mensagem antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await apiRequest('/api/admin/push-send', {
        method: 'POST',
        body: JSON.stringify(customMessage)
      });
      
      if (response?.success) {
        toast({
          title: "Mensagem Enviada",
          description: `Notificação enviada para ${response.sent || 0} dispositivos!`,
        });
        
        // Limpar formulário
        setCustomMessage({
          title: '',
          message: '',
          targetUser: 'all'
        });
        
        loadStats(); // Recarregar estatísticas
      } else {
        throw new Error('Erro ao enviar mensagem');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const quickMessages = [
    {
      title: "🚀 Nova Funcionalidade",
      message: "Acabamos de lançar uma nova funcionalidade incrível! Confira agora."
    },
    {
      title: "📊 Relatório Pronto",
      message: "Seu relatório de analytics está pronto para visualização."
    },
    {
      title: "💡 Dica do Dia",
      message: "Sabia que você pode duplicar quizzes para criar variações rapidamente?"
    },
    {
      title: "🎉 Parabéns!",
      message: "Você alcançou uma marca importante! Continue assim."
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administração Push Notifications</h1>
          <p className="text-muted-foreground">
            Configure e gerencie o sistema de notificações push do Vendzz
          </p>
        </div>
        <Button onClick={loadStats} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Total Dispositivos</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Novos (24h)</p>
                <p className="text-2xl font-bold">{stats?.recent || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Send className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Enviadas Hoje</p>
                <p className="text-2xl font-bold">{stats?.sentToday || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className={`h-4 w-4 ${config.enabled ? 'text-green-500' : 'text-red-500'}`} />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Status Sistema</p>
                <Badge variant={config.enabled ? "default" : "destructive"}>
                  {config.enabled ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configurações do Sistema
            </CardTitle>
            <CardDescription>
              Configure o template global para notificações automáticas de quiz completions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="system-enabled"
                checked={config.enabled}
                onCheckedChange={(enabled) => setConfig(prev => ({ ...prev, enabled }))}
              />
              <Label htmlFor="system-enabled">
                Sistema de notificações ativo
              </Label>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label htmlFor="template-title">Título da Notificação</Label>
              <Input
                id="template-title"
                value={config.globalTemplate.title}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  globalTemplate: { ...prev.globalTemplate, title: e.target.value }
                }))}
                placeholder="Ex: 🎉 Novo Quiz Completado!"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="template-message">Mensagem da Notificação</Label>
              <Textarea
                id="template-message"
                value={config.globalTemplate.message}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  globalTemplate: { ...prev.globalTemplate, message: e.target.value }
                }))}
                placeholder="Ex: Um usuário acabou de finalizar seu quiz: {quizTitle}"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Use {'{quizTitle}'} para incluir o nome do quiz automaticamente
              </p>
            </div>

            <Button onClick={saveConfig} className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Envio de Mensagem Personalizada */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Enviar Mensagem Personalizada
            </CardTitle>
            <CardDescription>
              Envie notificações personalizadas para todos os usuários conectados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="custom-title">Título</Label>
              <Input
                id="custom-title"
                value={customMessage.title}
                onChange={(e) => setCustomMessage(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: 🚀 Nova Funcionalidade"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="custom-message">Mensagem</Label>
              <Textarea
                id="custom-message"
                value={customMessage.message}
                onChange={(e) => setCustomMessage(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Digite sua mensagem personalizada aqui..."
                rows={3}
              />
            </div>

            <Button onClick={sendCustomMessage} className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar para Todos
                </>
              )}
            </Button>

            <Separator />

            <div className="space-y-2">
              <Label className="text-sm font-medium">Mensagens Rápidas</Label>
              <div className="grid grid-cols-1 gap-2">
                {quickMessages.map((msg, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="justify-start text-left h-auto p-3"
                    onClick={() => setCustomMessage(prev => ({ 
                      ...prev, 
                      title: msg.title, 
                      message: msg.message 
                    }))}
                  >
                    <div>
                      <div className="font-medium text-xs">{msg.title}</div>
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {msg.message}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${config.enabled ? 'bg-green-500' : 'bg-red-500'}`} />
              <div>
                <p className="font-medium">
                  Sistema de Push Notifications
                </p>
                <p className="text-sm text-muted-foreground">
                  {config.enabled 
                    ? 'Funcionando normalmente - notificações automáticas ativas' 
                    : 'Sistema desativado - notificações pausadas'
                  }
                </p>
              </div>
            </div>
            <Badge variant={config.enabled ? "default" : "destructive"}>
              {config.enabled ? 'Online' : 'Offline'}
            </Badge>
          </div>
          
          {stats?.lastConfigUpdate && (
            <p className="text-xs text-muted-foreground mt-3">
              Última atualização: {new Date(stats.lastConfigUpdate).toLocaleString('pt-BR')}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}