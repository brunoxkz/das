import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { 
  Plug, 
  Plus, 
  Settings, 
  CheckCircle,
  XCircle,
  Globe,
  ShoppingCart,
  Zap,
  RefreshCw,
  Eye,
  Calendar
} from "lucide-react";
import { SiShopify, SiWoocommerce, SiZapier } from "react-icons/si";

interface Integration {
  id: string;
  type: string;
  name: string;
  config: Record<string, any>;
  isActive: boolean;
  lastSync?: number;
  createdAt: number;
  updatedAt: number;
}

const INTEGRATION_TYPES = [
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Sincronize produtos, pedidos e clientes',
    icon: SiShopify,
    color: 'from-green-500 to-emerald-600',
    fields: [
      { key: 'shop_domain', label: 'Domínio da Loja', placeholder: 'minhaloja.myshopify.com', required: true },
      { key: 'access_token', label: 'Access Token', placeholder: 'shppa_...', required: true, type: 'password' },
      { key: 'webhook_secret', label: 'Webhook Secret', placeholder: 'Secret para validação', type: 'password' }
    ]
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    description: 'Integre com sua loja WooCommerce',
    icon: SiWoocommerce,
    color: 'from-purple-500 to-violet-600',
    fields: [
      { key: 'site_url', label: 'URL do Site', placeholder: 'https://minhaloja.com', required: true },
      { key: 'consumer_key', label: 'Consumer Key', placeholder: 'ck_...', required: true },
      { key: 'consumer_secret', label: 'Consumer Secret', placeholder: 'cs_...', required: true, type: 'password' },
      { key: 'webhook_secret', label: 'Webhook Secret', placeholder: 'Secret para validação', type: 'password' }
    ]
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Conecte com milhares de aplicações',
    icon: SiZapier,
    color: 'from-orange-500 to-red-600',
    fields: [
      { key: 'webhook_url', label: 'Webhook URL', placeholder: 'https://hooks.zapier.com/...', required: true },
      { key: 'api_key', label: 'API Key (opcional)', placeholder: 'Chave de autenticação', type: 'password' }
    ]
  }
];

export default function IntegracoesPage() {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<string>("");
  const [integrationName, setIntegrationName] = useState("");
  const [configFields, setConfigFields] = useState<Record<string, string>>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Buscar integrações do usuário
  const { data: integrations, isLoading: isLoadingIntegrations } = useQuery({
    queryKey: ["/api/integrations"],
  });

  // Mutação para criar integração
  const createIntegrationMutation = useMutation({
    mutationFn: async (integrationData: { type: string; name: string; config: Record<string, any> }) => {
      const response = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(integrationData),
      });
      if (!response.ok) throw new Error("Erro ao criar integração");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      setIsCreateDialogOpen(false);
      setSelectedType("");
      setIntegrationName("");
      setConfigFields({});
      toast({ title: "Integração criada com sucesso!" });
    },
  });

  // Mutação para ativar/desativar integração
  const toggleIntegrationMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await fetch(`/api/integrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) throw new Error("Erro ao atualizar integração");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({ title: "Integração atualizada com sucesso!" });
    },
  });

  // Mutação para sincronizar integração
  const syncIntegrationMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      const response = await fetch(`/api/integrations/${integrationId}/sync`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Erro ao sincronizar integração");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({ title: "Sincronização iniciada!" });
    },
  });

  const handleFieldChange = (key: string, value: string) => {
    setConfigFields(prev => ({ ...prev, [key]: value }));
  };

  const handleCreateIntegration = () => {
    if (selectedType && integrationName && Object.keys(configFields).length > 0) {
      const integrationConfig = INTEGRATION_TYPES.find(t => t.id === selectedType);
      const requiredFields = integrationConfig?.fields.filter(f => f.required) || [];
      const hasAllRequired = requiredFields.every(field => configFields[field.key]);

      if (hasAllRequired) {
        createIntegrationMutation.mutate({
          type: selectedType,
          name: integrationName,
          config: configFields
        });
      } else {
        toast({ 
          title: "Campos obrigatórios não preenchidos", 
          variant: "destructive" 
        });
      }
    }
  };

  const getIntegrationIcon = (type: string) => {
    const integration = INTEGRATION_TYPES.find(t => t.id === type);
    if (!integration) return Plug;
    return integration.icon;
  };

  const getIntegrationColor = (type: string) => {
    const integration = INTEGRATION_TYPES.find(t => t.id === type);
    return integration?.color || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl shadow-lg">
              <Plug className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Integrações
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Conecte o Vendzz com suas ferramentas favoritas e automatize seus processos
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <Plug className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total de Integrações</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {integrations?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Integrações Ativas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {integrations?.filter((i: Integration) => i.isActive).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <Globe className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tipos Disponíveis</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {INTEGRATION_TYPES.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                  <RefreshCw className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sincronizações Hoje</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {integrations?.filter((i: Integration) => {
                      if (!i.lastSync) return false;
                      const today = new Date();
                      const syncDate = new Date(i.lastSync * 1000);
                      return syncDate.toDateString() === today.toDateString();
                    }).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Integrations */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Integrações Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {INTEGRATION_TYPES.map((integration) => {
              const Icon = integration.icon;
              const hasExisting = integrations?.some((i: Integration) => i.type === integration.id);
              
              return (
                <Card key={integration.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all">
                  <CardContent className="p-6 text-center">
                    <div className={`p-4 bg-gradient-to-br ${integration.color} rounded-2xl w-16 h-16 mx-auto mb-4`}>
                      <Icon className="w-8 h-8 text-white mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {integration.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {integration.description}
                    </p>
                    {hasExisting ? (
                      <Badge variant="secondary" className="mb-4">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Configurado
                      </Badge>
                    ) : (
                      <Button
                        onClick={() => {
                          setSelectedType(integration.id);
                          setIsCreateDialogOpen(true);
                        }}
                        className={`bg-gradient-to-r ${integration.color} hover:opacity-90`}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Conectar
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Create Integration Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Configurar {INTEGRATION_TYPES.find(t => t.id === selectedType)?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="integrationName">Nome da Integração</Label>
                <Input
                  id="integrationName"
                  placeholder="Ex: Minha Loja Principal"
                  value={integrationName}
                  onChange={(e) => setIntegrationName(e.target.value)}
                />
              </div>

              {selectedType && INTEGRATION_TYPES.find(t => t.id === selectedType)?.fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>
                    {field.label}
                    
                  </Label>
                  <Input
                    id={field.key}
                    type={field.type || 'text'}
                    placeholder={field.placeholder}
                    value={configFields[field.key] || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  />
                </div>
              ))}

              <div className="flex gap-3">
                <Button
                  onClick={handleCreateIntegration}
                  disabled={!selectedType || !integrationName || createIntegrationMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600"
                >
                  {createIntegrationMutation.isPending ? "Conectando..." : "Conectar Integração"}
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

        {/* Configured Integrations */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Suas Integrações</h2>
          
          {isLoadingIntegrations ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : integrations && integrations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {integrations.map((integration: Integration) => {
                const Icon = getIntegrationIcon(integration.type);
                const color = getIntegrationColor(integration.type);
                
                return (
                  <Card key={integration.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 bg-gradient-to-br ${color} rounded-lg`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{integration.name}</CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                              {integration.type}
                            </p>
                          </div>
                        </div>
                        <Badge variant={integration.isActive ? "default" : "secondary"}>
                          {integration.isActive ? (
                            <><CheckCircle className="w-3 h-3 mr-1" /> Ativa</>
                          ) : (
                            <><XCircle className="w-3 h-3 mr-1" /> Inativa</>
                          )}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(integration.createdAt * 1000).toLocaleDateString()}
                        </div>
                        {integration.lastSync && (
                          <div className="flex items-center gap-1">
                            <RefreshCw className="w-4 h-4" />
                            Última sync: {new Date(integration.lastSync * 1000).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => syncIntegrationMutation.mutate(integration.id)}
                          disabled={syncIntegrationMutation.isPending}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Sincronizar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Configurar
                        </Button>
                        <Button
                          size="sm"
                          variant={integration.isActive ? "destructive" : "default"}
                          onClick={() => toggleIntegrationMutation.mutate({ 
                            id: integration.id, 
                            isActive: !integration.isActive 
                          })}
                          disabled={toggleIntegrationMutation.isPending}
                        >
                          {integration.isActive ? (
                            <><XCircle className="w-4 h-4 mr-2" /> Desativar</>
                          ) : (
                            <><CheckCircle className="w-4 h-4 mr-2" /> Ativar</>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-12 text-center">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4">
                  <Plug className="w-8 h-8 text-gray-400 mx-auto mt-2" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Nenhuma integração configurada
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Conecte suas ferramentas favoritas para automatizar seus processos.
                </p>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-gradient-to-r from-green-600 to-blue-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Configurar Primeira Integração
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}