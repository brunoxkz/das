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
    },
    messages: [],
    rotationEnabled: false
  });
  
  // Estado para mensagem personalizada
  const [customMessage, setCustomMessage] = useState({
    title: '',
    message: '',
    targetUser: 'all'
  });
  
  // Estado para nova mensagem rotativa
  const [newMessage, setNewMessage] = useState({
    title: '',
    message: ''
  });
  
  const [editingMessage, setEditingMessage] = useState(null);

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

  // Funções para mensagens rotativas
  const addMessage = async () => {
    if (!newMessage.title || !newMessage.message) {
      toast({
        title: "Erro",
        description: "Título e mensagem são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest('/api/admin/push-messages', {
        method: 'POST',
        body: JSON.stringify(newMessage)
      });
      if (response.success) {
        toast({
          title: "Mensagem adicionada",
          description: "Nova mensagem criada com sucesso!",
        });
        setNewMessage({ title: '', message: '' });
        loadConfig();
      } else {
        throw new Error(response.error || 'Erro ao adicionar mensagem');
      }
    } catch (error) {
      console.error('Erro ao adicionar mensagem:', error);
      toast({
        title: "Erro",
        description: "Falha ao adicionar mensagem",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (messageId) => {
    setLoading(true);
    try {
      const response = await apiRequest(`/api/admin/push-messages/${messageId}`, {
        method: 'DELETE'
      });
      if (response.success) {
        toast({
          title: "Mensagem removida",
          description: "Mensagem deletada com sucesso!",
        });
        loadConfig();
      } else {
        throw new Error(response.error || 'Erro ao remover mensagem');
      }
    } catch (error) {
      console.error('Erro ao remover mensagem:', error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao remover mensagem",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMessage = async (messageId, updates) => {
    setLoading(true);
    try {
      const response = await apiRequest(`/api/admin/push-messages/${messageId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      if (response.success) {
        toast({
          title: "Mensagem atualizada",
          description: "Mensagem editada com sucesso!",
        });
        setEditingMessage(null);
        loadConfig();
      } else {
        throw new Error(response.error || 'Erro ao atualizar mensagem');
      }
    } catch (error) {
      console.error('Erro ao atualizar mensagem:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar mensagem",
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

        {/* Mensagens Rotativas */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Mensagens Rotativas
            </CardTitle>
            <CardDescription>
              Configure múltiplas mensagens que serão alternadas automaticamente nos quiz completions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Switch de rotação */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Rotação Automática</Label>
                <p className="text-xs text-muted-foreground">
                  Quando ativada, alterna entre as mensagens ativas a cada quiz completion
                </p>
              </div>
              <Switch
                checked={config.rotationEnabled}
                onCheckedChange={(enabled) => setConfig(prev => ({ ...prev, rotationEnabled: enabled }))}
              />
            </div>

            {/* Lista de mensagens existentes */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Mensagens ({config.messages?.length || 0})</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {config.messages?.map((message, index) => (
                  <div key={message.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={message.active ? "default" : "secondary"}>
                          #{index + 1}
                        </Badge>
                        <span className="text-sm font-medium">{message.title}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateMessage(message.id, { active: !message.active })}
                        >
                          {message.active ? "Desativar" : "Ativar"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingMessage(message)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteMessage(message.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remover
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{message.message}</p>
                  </div>
                )) || (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma mensagem configurada. Adicione a primeira mensagem abaixo.
                  </p>
                )}
              </div>
            </div>

            {/* Formulário para nova mensagem */}
            <div className="border-t pt-4 space-y-4">
              <Label className="text-sm font-medium">Adicionar Nova Mensagem</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-msg-title">Título</Label>
                  <Input
                    id="new-msg-title"
                    value={newMessage.title}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: 🔥 Quiz Finalizado!"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-msg-message">Mensagem</Label>
                  <Input
                    id="new-msg-message"
                    value={newMessage.message}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Ex: Mais um funil convertendo!"
                  />
                </div>
              </div>
              <Button onClick={addMessage} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Adicionar Mensagem
                  </>
                )}
              </Button>
            </div>

            {/* Botão para salvar configurações de rotação */}
            <div className="border-t pt-4">
              <Button onClick={saveConfig} variant="outline" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Salvar Configurações de Rotação
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Edição */}
      {editingMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Editar Mensagem</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Título</Label>
                <Input
                  id="edit-title"
                  value={editingMessage.title}
                  onChange={(e) => setEditingMessage(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título da mensagem"
                />
              </div>
              <div>
                <Label htmlFor="edit-message">Mensagem</Label>
                <Textarea
                  id="edit-message"
                  value={editingMessage.message}
                  onChange={(e) => setEditingMessage(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Conteúdo da mensagem"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setEditingMessage(null)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => updateMessage(editingMessage.id, {
                    title: editingMessage.title,
                    message: editingMessage.message
                  })}
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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