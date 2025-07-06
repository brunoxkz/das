import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Settings, 
  BarChart3, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  Users, 
  TrendingUp,
  Globe,
  Clock
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Types
interface CloakerConfig {
  isEnabled: boolean;
  requiredUTMParams: string[];
  blockAdLibrary: boolean;
  blockDirectAccess: boolean;
  blockPage: 'maintenance' | 'unavailable' | 'custom';
  customBlockMessage?: string;
  whitelistedIPs?: string[];
  maxAttemptsPerIP: number;
  blockDuration: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
}

interface CloakerStats {
  totalRequests: number;
  blockedRequests: number;
  blockRate: number;
  topReasons: Array<{ reason: string; count: number }>;
  topUserAgents: Array<{ userAgent: string; count: number }>;
  recentDetections: Array<{
    isBlocked: boolean;
    reason: string;
    clientIP: string;
    userAgent: string;
    timestamp: Date;
  }>;
}

export default function CloakerPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedQuiz, setSelectedQuiz] = useState<string>("");
  const [config, setConfig] = useState<CloakerConfig>({
    isEnabled: false,
    requiredUTMParams: [],
    blockAdLibrary: true,
    blockDirectAccess: true,
    blockPage: 'maintenance',
    customBlockMessage: '',
    whitelistedIPs: [],
    maxAttemptsPerIP: 5,
    blockDuration: 60
  });

  // Fetch user's quizzes 
  const { data: quizzes, isLoading: quizzesLoading, error: quizzesError } = useQuery({
    queryKey: ["/api/quizzes"],
    queryFn: async () => {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/quizzes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch quizzes');
      }
      
      return response.json();
    },
    retry: 2,
    staleTime: 30000,
  });

  // Fetch cloaker config for selected quiz
  const { data: cloakerConfig, isLoading: configLoading } = useQuery({
    queryKey: ["/api/cloaker/config", selectedQuiz],
    enabled: !!selectedQuiz,
    retry: false,
  });

  // Fetch cloaker statistics
  const { data: cloakerStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/cloaker/stats"],
    retry: false,
  });

  // Use real quiz data from API
  const displayQuizzes = Array.isArray(quizzes) ? quizzes : [];

  // Update config when data is loaded
  if (cloakerConfig && JSON.stringify(config) !== JSON.stringify(cloakerConfig)) {
    setConfig(cloakerConfig);
  }

  // Save configuration mutation
  const saveConfigMutation = useMutation({
    mutationFn: async (newConfig: CloakerConfig) => {
      if (!selectedQuiz) throw new Error("Nenhum quiz selecionado");
      return apiRequest(`/api/cloaker/config`, {
        method: "POST",
        body: JSON.stringify({
          quizId: selectedQuiz,
          config: newConfig
        })
      });
    },
    onSuccess: () => {
      toast({
        title: "✅ Configuração salva",
        description: "As configurações do cloaker foram atualizadas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cloaker/config", selectedQuiz] });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Erro ao salvar",
        description: error.message || "Erro ao salvar configurações",
        variant: "destructive",
      });
    }
  });

  const handleSaveConfig = () => {
    saveConfigMutation.mutate(config);
  };

  const updateConfig = (updates: Partial<CloakerConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const addUTMParam = () => {
    const input = document.getElementById('utm-input') as HTMLInputElement;
    if (input?.value.trim()) {
      updateConfig({
        requiredUTMParams: [...config.requiredUTMParams, input.value.trim()]
      });
      input.value = '';
    }
  };

  const removeUTMParam = (index: number) => {
    updateConfig({
      requiredUTMParams: config.requiredUTMParams.filter((_, i) => i !== index)
    });
  };

  if (quizzesLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Shield className="h-8 w-8 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold">Sistema Cloaker</h1>
          <p className="text-muted-foreground">
            Proteja seus quizzes contra tráfego indesejado e bibliotecas de anúncios
          </p>
        </div>
      </div>

      {/* Quiz Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Selecione um Quiz para Proteger</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {quizzesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {displayQuizzes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayQuizzes.map((quiz: Quiz) => (
                    <Card
                      key={quiz.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                        selectedQuiz === quiz.id
                          ? "border-green-500 bg-green-50 shadow-md"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                      onClick={() => setSelectedQuiz(quiz.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${
                            selectedQuiz === quiz.id ? "bg-green-100" : "bg-gray-100"
                          }`}>
                            <Shield className={`h-5 w-5 ${
                              selectedQuiz === quiz.id ? "text-green-600" : "text-gray-600"
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm leading-5 truncate">
                              {quiz.title}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {quiz.description || "Configure proteções avançadas para este quiz"}
                            </p>
                            <div className="flex items-center mt-2">
                              {selectedQuiz === quiz.id ? (
                                <Badge variant="default" className="text-xs bg-green-600">
                                  ✓ Selecionado
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  Clique para selecionar
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Globe className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhum quiz encontrado</p>
                  <p className="text-sm text-muted-foreground">
                    Crie um quiz primeiro para configurar o cloaker
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedQuiz && (
        <>
          {/* Configuration Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Configurações de Proteção</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable/Disable */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-cloaker">Ativar Cloaker</Label>
                  <p className="text-sm text-muted-foreground">
                    Habilita a proteção para este quiz
                  </p>
                </div>
                <Switch
                  id="enable-cloaker"
                  checked={config.isEnabled}
                  onCheckedChange={(checked) => updateConfig({ isEnabled: checked })}
                />
              </div>

              <Separator />

              {/* UTM Parameters */}
              <div className="space-y-3">
                <Label>Parâmetros UTM Obrigatórios</Label>
                <p className="text-sm text-muted-foreground">
                  Lista de parâmetros UTM que devem estar presentes na URL
                </p>
                <div className="flex space-x-2">
                  <Input
                    id="utm-input"
                    placeholder="Ex: utm_source, utm_campaign"
                    onKeyPress={(e) => e.key === 'Enter' && addUTMParam()}
                  />
                  <Button onClick={addUTMParam} size="sm">
                    Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {config.requiredUTMParams.map((param, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeUTMParam(index)}>
                      {param} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Protection Options */}
              <div className="space-y-4">
                <Label>Opções de Proteção</Label>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="block-ad-library">Bloquear Bibliotecas de Anúncios</Label>
                    <p className="text-sm text-muted-foreground">
                      Detecta e bloqueia ferramentas de bibliotecas de anúncios
                    </p>
                  </div>
                  <Switch
                    id="block-ad-library"
                    checked={config.blockAdLibrary}
                    onCheckedChange={(checked) => updateConfig({ blockAdLibrary: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="block-direct">Bloquear Acesso Direto</Label>
                    <p className="text-sm text-muted-foreground">
                      Bloqueia acessos sem referrer ou UTMs
                    </p>
                  </div>
                  <Switch
                    id="block-direct"
                    checked={config.blockDirectAccess}
                    onCheckedChange={(checked) => updateConfig({ blockDirectAccess: checked })}
                  />
                </div>
              </div>

              <Separator />

              {/* Block Page Type */}
              <div className="space-y-3">
                <Label htmlFor="block-page">Página de Bloqueio</Label>
                <Select value={config.blockPage} onValueChange={(value: any) => updateConfig({ blockPage: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">Página de Manutenção</SelectItem>
                    <SelectItem value="unavailable">Serviço Indisponível</SelectItem>
                    <SelectItem value="custom">Mensagem Personalizada</SelectItem>
                  </SelectContent>
                </Select>

                {config.blockPage === 'custom' && (
                  <div>
                    <Label htmlFor="custom-message">Mensagem Personalizada</Label>
                    <Textarea
                      id="custom-message"
                      placeholder="Digite sua mensagem personalizada..."
                      value={config.customBlockMessage || ''}
                      onChange={(e) => updateConfig({ customBlockMessage: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Rate Limiting */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max-attempts">Máximo de Tentativas por IP</Label>
                  <Input
                    id="max-attempts"
                    type="number"
                    value={config.maxAttemptsPerIP}
                    onChange={(e) => updateConfig({ maxAttemptsPerIP: parseInt(e.target.value) || 5 })}
                  />
                </div>
                <div>
                  <Label htmlFor="block-duration">Duração do Bloqueio (minutos)</Label>
                  <Input
                    id="block-duration"
                    type="number"
                    value={config.blockDuration}
                    onChange={(e) => updateConfig({ blockDuration: parseInt(e.target.value) || 60 })}
                  />
                </div>
              </div>

              {/* Save Button */}
              <Button 
                onClick={handleSaveConfig} 
                disabled={saveConfigMutation.isPending}
                className="w-full"
              >
                {saveConfigMutation.isPending ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Estatísticas de Proteção</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ) : cloakerStats ? (
                <div className="space-y-6">
                  {/* Overview Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{cloakerStats.totalRequests || 0}</div>
                      <div className="text-sm text-muted-foreground">Total de Requisições</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{cloakerStats.blockedRequests || 0}</div>
                      <div className="text-sm text-muted-foreground">Requisições Bloqueadas</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{(cloakerStats.blockRate || 0).toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Taxa de Bloqueio</div>
                    </div>
                  </div>

                  {/* Top Block Reasons */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Principais Razões de Bloqueio
                    </h3>
                    <div className="space-y-2">
                      {cloakerStats.topReasons && Array.isArray(cloakerStats.topReasons) ? 
                        cloakerStats.topReasons.map((reason: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm">{reason.reason}</span>
                            <Badge variant="outline">{reason.count}</Badge>
                          </div>
                        )) : 
                        <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
                      }
                    </div>
                  </div>

                  {/* Top User Agents */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      User Agents Mais Bloqueados
                    </h3>
                    <div className="space-y-2">
                      {cloakerStats.topUserAgents && Array.isArray(cloakerStats.topUserAgents) ? 
                        cloakerStats.topUserAgents.map((ua: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm truncate">{ua.userAgent}</span>
                            <Badge variant="outline">{ua.count}</Badge>
                          </div>
                        )) : 
                        <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
                      }
                    </div>
                  </div>

                  {/* Recent Detections */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Detecções Recentes
                    </h3>
                    <div className="space-y-2">
                      {cloakerStats.recentDetections && Array.isArray(cloakerStats.recentDetections) ? 
                        cloakerStats.recentDetections.map((detection: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              {detection.isBlocked ? (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                              <div>
                                <div className="text-sm font-medium">{detection.reason}</div>
                                <div className="text-xs text-muted-foreground">IP: {detection.clientIP}</div>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(detection.timestamp).toLocaleString()}
                            </div>
                          </div>
                        )) : 
                        <p className="text-sm text-muted-foreground">Nenhuma detecção recente</p>
                      }
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma estatística disponível ainda
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}