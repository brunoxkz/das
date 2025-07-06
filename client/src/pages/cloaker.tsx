import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Eye, 
  Users, 
  AlertTriangle, 
  Settings, 
  Globe, 
  Target,
  CheckCircle,
  XCircle,
  Activity,
  TrendingUp,
  Clock,
  Ban
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth-hybrid";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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

interface CloakerDetection {
  isBlocked: boolean;
  reason: string;
  clientIP: string;
  userAgent: string;
  referrer: string;
  utmParams: Record<string, string>;
  timestamp: Date;
}

interface CloakerStats {
  totalRequests: number;
  blockedRequests: number;
  blockRate: number;
  topReasons: Array<{ reason: string; count: number }>;
  topUserAgents: Array<{ userAgent: string; count: number }>;
  recentDetections: CloakerDetection[];
}

export default function CloakerPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedQuiz, setSelectedQuiz] = useState<string>("");
  const [config, setConfig] = useState<CloakerConfig>({
    isEnabled: false,
    requiredUTMParams: [],
    blockAdLibrary: true,
    blockDirectAccess: false,
    blockPage: 'maintenance',
    customBlockMessage: '',
    whitelistedIPs: [],
    maxAttemptsPerIP: 3,
    blockDuration: 60
  });
  
  const [newUTMParam, setNewUTMParam] = useState("");
  const [newWhitelistedIP, setNewWhitelistedIP] = useState("");

  // Fetch user's quizzes
  const { data: quizzes = [], isLoading: quizzesLoading } = useQuery({
    queryKey: ["/api/quizzes"],
    retry: false,
  });

  // Fetch cloaker config for selected quiz
  const { data: cloakerConfig = null, isLoading: configLoading } = useQuery({
    queryKey: ["/api/cloaker/config", selectedQuiz],
    enabled: !!selectedQuiz,
    retry: false,
  });

  // Fetch cloaker statistics
  const { data: stats = { totalRequests: 0, blockedRequests: 0, blockRate: 0, topReasons: [], topUserAgents: [], recentDetections: [] }, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/cloaker/stats", selectedQuiz],
    enabled: !!selectedQuiz,
    retry: false,
  });

  // Update config when cloaker config is loaded
  useEffect(() => {
    if (cloakerConfig) {
      setConfig(cloakerConfig);
    }
  }, [cloakerConfig]);

  // Save cloaker configuration
  const saveConfigMutation = useMutation({
    mutationFn: async (configData: CloakerConfig) => {
      return await apiRequest("POST", `/api/cloaker/config/${selectedQuiz}`, configData);
    },
    onSuccess: () => {
      toast({
        title: "Configuração salva!",
        description: "As configurações do cloaker foram atualizadas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cloaker/config", selectedQuiz] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Erro ao salvar as configurações do cloaker.",
        variant: "destructive",
      });
    },
  });

  const handleSaveConfig = () => {
    if (!selectedQuiz) {
      toast({
        title: "Selecione um quiz",
        description: "Por favor, selecione um quiz para aplicar as configurações.",
        variant: "destructive",
      });
      return;
    }
    saveConfigMutation.mutate(config);
  };

  const addUTMParam = () => {
    if (newUTMParam.trim() && !config.requiredUTMParams.includes(newUTMParam.trim())) {
      setConfig(prev => ({
        ...prev,
        requiredUTMParams: [...prev.requiredUTMParams, newUTMParam.trim()]
      }));
      setNewUTMParam("");
    }
  };

  const removeUTMParam = (param: string) => {
    setConfig(prev => ({
      ...prev,
      requiredUTMParams: prev.requiredUTMParams.filter(p => p !== param)
    }));
  };

  const addWhitelistedIP = () => {
    if (newWhitelistedIP.trim() && !config.whitelistedIPs?.includes(newWhitelistedIP.trim())) {
      setConfig(prev => ({
        ...prev,
        whitelistedIPs: [...(prev.whitelistedIPs || []), newWhitelistedIP.trim()]
      }));
      setNewWhitelistedIP("");
    }
  };

  const removeWhitelistedIP = (ip: string) => {
    setConfig(prev => ({
      ...prev,
      whitelistedIPs: prev.whitelistedIPs?.filter(i => i !== ip) || []
    }));
  };

  if (quizzesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cloaker Avançado</h1>
            <p className="text-gray-600">Proteja seus quizzes contra acessos indesejados</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-sm">
          <Activity className="h-4 w-4 mr-1" />
          Sistema Ativo
        </Badge>
      </div>

      {/* Quiz Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Selecionar Quiz</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="quiz-select">Escolha o quiz para configurar o cloaker</Label>
              <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
                <SelectTrigger id="quiz-select">
                  <SelectValue placeholder="Selecione um quiz..." />
                </SelectTrigger>
                <SelectContent>
                  {quizzes?.map((quiz: any) => (
                    <SelectItem key={quiz.id} value={quiz.id}>
                      {quiz.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedQuiz && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Quiz selecionado: <strong>{quizzes?.find((q: any) => q.id === selectedQuiz)?.title}</strong>
                </AlertDescription>
              </Alert>
            )}
          </div>
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
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <Label className="text-base font-medium">Ativar Cloaker</Label>
                    <p className="text-sm text-gray-600">Habilitar proteção para este quiz</p>
                  </div>
                </div>
                <Switch
                  checked={config.isEnabled}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, isEnabled: checked }))}
                />
              </div>

              <Separator />

              {/* UTM Parameters */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <Label className="text-base font-medium">Parâmetros UTM Obrigatórios</Label>
                </div>
                <p className="text-sm text-gray-600">
                  Bloqueia acessos que não possuem os parâmetros UTM especificados
                </p>
                
                <div className="flex space-x-2">
                  <Input
                    placeholder="Ex: utm_source, utm_campaign..."
                    value={newUTMParam}
                    onChange={(e) => setNewUTMParam(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addUTMParam()}
                  />
                  <Button onClick={addUTMParam} variant="outline">
                    Adicionar
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {config.requiredUTMParams.map((param) => (
                    <Badge key={param} variant="secondary" className="cursor-pointer" onClick={() => removeUTMParam(param)}>
                      {param} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Ad Library Protection */}
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Ban className="h-5 w-5 text-orange-600" />
                  <div>
                    <Label className="text-base font-medium">Bloquear Bibliotecas de Anúncios</Label>
                    <p className="text-sm text-gray-600">Detecta e bloqueia acessos de ferramentas de spy ads</p>
                  </div>
                </div>
                <Switch
                  checked={config.blockAdLibrary}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, blockAdLibrary: checked }))}
                />
              </div>

              {/* Direct Access Protection */}
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <Label className="text-base font-medium">Bloquear Acesso Direto</Label>
                    <p className="text-sm text-gray-600">Bloqueia acessos que não possuem referrer</p>
                  </div>
                </div>
                <Switch
                  checked={config.blockDirectAccess}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, blockDirectAccess: checked }))}
                />
              </div>

              <Separator />

              {/* IP Whitelist */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <Label className="text-base font-medium">IPs Permitidos</Label>
                </div>
                <p className="text-sm text-gray-600">
                  IPs que nunca serão bloqueados (seus IPs de teste)
                </p>
                
                <div className="flex space-x-2">
                  <Input
                    placeholder="Ex: 192.168.1.1"
                    value={newWhitelistedIP}
                    onChange={(e) => setNewWhitelistedIP(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addWhitelistedIP()}
                  />
                  <Button onClick={addWhitelistedIP} variant="outline">
                    Adicionar
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {config.whitelistedIPs?.map((ip) => (
                    <Badge key={ip} variant="secondary" className="cursor-pointer" onClick={() => removeWhitelistedIP(ip)}>
                      {ip} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Rate Limiting */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tentativas Máximas por IP</Label>
                  <Input
                    type="number"
                    value={config.maxAttemptsPerIP}
                    onChange={(e) => setConfig(prev => ({ ...prev, maxAttemptsPerIP: parseInt(e.target.value) || 3 }))}
                    min="1"
                    max="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duração do Bloqueio (minutos)</Label>
                  <Input
                    type="number"
                    value={config.blockDuration}
                    onChange={(e) => setConfig(prev => ({ ...prev, blockDuration: parseInt(e.target.value) || 60 }))}
                    min="1"
                    max="1440"
                  />
                </div>
              </div>

              <Separator />

              {/* Block Page Configuration */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-purple-600" />
                  <Label className="text-base font-medium">Página de Bloqueio</Label>
                </div>
                
                <Select value={config.blockPage} onValueChange={(value: any) => setConfig(prev => ({ ...prev, blockPage: value }))}>
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
                  <div className="space-y-2">
                    <Label>Mensagem Personalizada</Label>
                    <Textarea
                      placeholder="Digite a mensagem que será exibida para usuários bloqueados..."
                      value={config.customBlockMessage || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, customBlockMessage: e.target.value }))}
                      rows={3}
                    />
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveConfig} 
                  disabled={saveConfigMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {saveConfigMutation.isPending ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Estatísticas de Proteção</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalRequests}</div>
                    <div className="text-sm text-gray-600">Total de Requisições</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{stats.blockedRequests}</div>
                    <div className="text-sm text-gray-600">Requisições Bloqueadas</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.blockRate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Taxa de Bloqueio</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Top Block Reasons */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center">
                      <XCircle className="h-4 w-4 mr-2 text-red-600" />
                      Principais Motivos de Bloqueio
                    </h4>
                    <div className="space-y-2">
                      {stats.topReasons.map((reason, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">{reason.reason}</span>
                          <Badge variant="outline">{reason.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top User Agents */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center">
                      <Users className="h-4 w-4 mr-2 text-blue-600" />
                      User Agents Mais Bloqueados
                    </h4>
                    <div className="space-y-2">
                      {stats.topUserAgents.map((ua, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm truncate">{ua.userAgent}</span>
                          <Badge variant="outline">{ua.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Detections */}
                <div className="mt-6">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-purple-600" />
                    Detecções Recentes
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {stats.recentDetections.map((detection, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <Badge variant={detection.isBlocked ? "destructive" : "secondary"}>
                                {detection.isBlocked ? "Bloqueado" : "Permitido"}
                              </Badge>
                              <span className="text-sm text-gray-600">{detection.clientIP}</span>
                            </div>
                            <div className="text-sm text-gray-700 mt-1">{detection.reason}</div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(detection.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}