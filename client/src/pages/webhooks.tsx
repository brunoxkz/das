import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { 
  Webhook as WebhookIcon, 
  Plus, 
  Power, 
  PowerOff,
  Send, 
  Activity,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Shield,
  History
} from "lucide-react";

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret?: string;
  isActive: boolean;
  lastTriggered?: number;
  totalTriggers: number;
  createdAt: number;
  updatedAt: number;
}

interface WebhookLog {
  id: string;
  webhookId: string;
  event: string;
  payload: any;
  response?: string;
  statusCode?: number;
  success: boolean;
  createdAt: number;
}

const AVAILABLE_EVENTS = [
  { id: 'quiz.completed', label: 'Quiz Completado', description: 'Quando um usuário completa um quiz' },
  { id: 'lead.captured', label: 'Lead Capturado', description: 'Quando um novo lead é capturado' },
  { id: 'email.sent', label: 'Email Enviado', description: 'Quando um email é enviado' },
  { id: 'sms.sent', label: 'SMS Enviado', description: 'Quando um SMS é enviado' },
  { id: 'whatsapp.sent', label: 'WhatsApp Enviado', description: 'Quando uma mensagem WhatsApp é enviada' },
  { id: 'campaign.started', label: 'Campanha Iniciada', description: 'Quando uma campanha é iniciada' },
  { id: 'campaign.completed', label: 'Campanha Completada', description: 'Quando uma campanha é finalizada' },
];

export default function WebhooksPage() {
  const { toast } = useToast();
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [newWebhookName, setNewWebhookName] = useState("");
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [newWebhookSecret, setNewWebhookSecret] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedWebhookId, setSelectedWebhookId] = useState<string | null>(null);

  // Buscar webhooks do usuário
  const { data: webhooks, isLoading: isLoadingWebhooks } = useQuery({
    queryKey: ["/api/webhooks"],
  });

  // Buscar logs do webhook selecionado
  const { data: webhookLogs } = useQuery({
    queryKey: ["/api/webhooks", selectedWebhookId, "logs"],
    enabled: !!selectedWebhookId,
  });

  // Mutação para criar webhook
  const createWebhookMutation = useMutation({
    mutationFn: async (webhookData: { name: string; url: string; events: string[]; secret?: string }) => {
      const response = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookData),
      });
      if (!response.ok) throw new Error("Erro ao criar webhook");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      setIsCreateDialogOpen(false);
      setNewWebhookName("");
      setNewWebhookUrl("");
      setNewWebhookSecret("");
      setSelectedEvents([]);
      toast({ title: "Webhook criado com sucesso!" });
    },
  });

  // Mutação para ativar/desativar webhook
  const toggleWebhookMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await fetch(`/api/webhooks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) throw new Error("Erro ao atualizar webhook");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      toast({ title: "Webhook atualizado com sucesso!" });
    },
  });

  // Mutação para testar webhook
  const testWebhookMutation = useMutation({
    mutationFn: async (webhookId: string) => {
      const response = await fetch(`/api/webhooks/${webhookId}/test`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Erro ao testar webhook");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      toast({ title: "Teste de webhook enviado!" });
    },
  });

  const handleEventToggle = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleCreateWebhook = () => {
    if (newWebhookName && newWebhookUrl && selectedEvents.length > 0) {
      createWebhookMutation.mutate({
        name: newWebhookName,
        url: newWebhookUrl,
        events: selectedEvents,
        secret: newWebhookSecret || undefined
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <WebhookIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Webhooks
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Integre suas aplicações com eventos em tempo real do Vendzz
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <WebhookIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total de Webhooks</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {webhooks?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <Power className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Webhooks Ativos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {webhooks?.filter((w: Webhook) => w.isActive).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <Send className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total de Disparos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {webhooks?.reduce((sum: number, w: Webhook) => sum + w.totalTriggers, 0) || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                  <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Eventos Disponíveis</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {AVAILABLE_EVENTS.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Webhook Button */}
        <div className="flex justify-end">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Webhook
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Webhook</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="webhookName">Nome do Webhook</Label>
                  <Input
                    id="webhookName"
                    placeholder="Ex: Integração CRM"
                    value={newWebhookName}
                    onChange={(e) => setNewWebhookName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">URL do Endpoint</Label>
                  <Input
                    id="webhookUrl"
                    placeholder="https://suaapi.com/webhook"
                    value={newWebhookUrl}
                    onChange={(e) => setNewWebhookUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhookSecret">Secret (opcional)</Label>
                  <Input
                    id="webhookSecret"
                    placeholder="Chave secreta para validação"
                    value={newWebhookSecret}
                    onChange={(e) => setNewWebhookSecret(e.target.value)}
                  />
                  <p className="text-xs text-gray-600">
                    Use um secret para validar que os webhooks vêm do Vendzz
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>Eventos para Escutar</Label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {AVAILABLE_EVENTS.map((event) => (
                      <div key={event.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={event.id}
                          checked={selectedEvents.includes(event.id)}
                          onCheckedChange={() => handleEventToggle(event.id)}
                        />
                        <div className="flex-1">
                          <Label htmlFor={event.id} className="font-medium cursor-pointer">
                            {event.label}
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">
                            {event.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleCreateWebhook}
                    disabled={!newWebhookName || !newWebhookUrl || selectedEvents.length === 0 || createWebhookMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    {createWebhookMutation.isPending ? "Criando..." : "Criar Webhook"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Webhooks List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Webhooks Column */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Seus Webhooks</h2>
            
            {isLoadingWebhooks ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : webhooks && webhooks.length > 0 ? (
              <div className="space-y-4">
                {webhooks.map((webhook: Webhook) => (
                  <Card 
                    key={webhook.id} 
                    className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl cursor-pointer transition-all ${
                      selectedWebhookId === webhook.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedWebhookId(webhook.id)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <WebhookIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{webhook.name}</CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                              {webhook.url}
                            </p>
                          </div>
                        </div>
                        <Badge variant={webhook.isActive ? "default" : "secondary"}>
                          {webhook.isActive ? (
                            <><Power className="w-3 h-3 mr-1" /> Ativo</>
                          ) : (
                            <><PowerOff className="w-3 h-3 mr-1" /> Inativo</>
                          )}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Activity className="w-4 h-4" />
                          {webhook.events.length} eventos
                        </div>
                        <div className="flex items-center gap-1">
                          <Send className="w-4 h-4" />
                          {webhook.totalTriggers} disparos
                        </div>
                        {webhook.secret && (
                          <div className="flex items-center gap-1">
                            <Shield className="w-4 h-4" />
                            Protegido
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            testWebhookMutation.mutate(webhook.id);
                          }}
                          disabled={testWebhookMutation.isPending}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Testar
                        </Button>
                        <Button
                          size="sm"
                          variant={webhook.isActive ? "destructive" : "default"}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWebhookMutation.mutate({ 
                              id: webhook.id, 
                              isActive: !webhook.isActive 
                            });
                          }}
                          disabled={toggleWebhookMutation.isPending}
                        >
                          {webhook.isActive ? (
                            <><PowerOff className="w-4 h-4 mr-2" /> Desativar</>
                          ) : (
                            <><Power className="w-4 h-4 mr-2" /> Ativar</>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-12 text-center">
                  <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4">
                    <WebhookIcon className="w-8 h-8 text-gray-400 mx-auto mt-2" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Nenhum webhook configurado
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Configure webhooks para receber eventos em tempo real do Vendzz.
                  </p>
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Webhook
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Logs Column */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Logs {selectedWebhookId ? `do Webhook` : ''}
            </h2>
            
            {!selectedWebhookId ? (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-12 text-center">
                  <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4">
                    <History className="w-8 h-8 text-gray-400 mx-auto mt-2" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Selecione um webhook
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Clique em um webhook para ver seus logs de execução.
                  </p>
                </CardContent>
              </Card>
            ) : webhookLogs && webhookLogs.length > 0 ? (
              <div className="space-y-3">
                {webhookLogs.map((log: WebhookLog) => (
                  <Card key={log.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {log.success ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span className="font-medium">{log.event}</span>
                            {log.statusCode && (
                              <Badge variant={log.success ? "default" : "destructive"}>
                                {log.statusCode}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="w-3 h-3" />
                            {new Date(log.createdAt * 1000).toLocaleString()}
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-8 text-center">
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full w-12 h-12 mx-auto mb-3">
                    <History className="w-6 h-6 text-gray-400 mx-auto mt-1.5" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Nenhum log encontrado
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Este webhook ainda não foi executado.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}