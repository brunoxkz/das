
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, Ban, Settings, BarChart3, TestTube, AlertTriangle, CheckCircle, Activity, Clock, Users, Target } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

interface CloakerStats {
  detection: {
    totalBlocks: number;
    blocksLast24h: number;
    blockedIPs: number;
    topReasons: Array<{ reason: string; count: number }>;
    topUserAgents: Array<{ agent: string; count: number }>;
    blocksByHour: number[];
  };
  usage: {
    totalQuizzes: number;
    protectedQuizzes: number;
    protectionRate: number;
    activeCloackers: Array<{
      quizId: string;
      quizTitle: string;
      isEnabled: boolean;
      blockAdLibrary: boolean;
      requiredUTMParams: string[];
    }>;
  };
}

interface Quiz {
  id: string;
  title: string;
  isPublished: boolean;
}

export default function CloakerPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedQuiz, setSelectedQuiz] = useState<string>('');
  const [testParams, setTestParams] = useState({
    referrer: '',
    userAgent: '',
    ip: '',
    utmParams: {} as Record<string, string>
  });

  // Fetch user quizzes
  const { data: quizzes = [] } = useQuery<Quiz[]>({
    queryKey: ['/api/quizzes'],
    queryFn: async () => {
      const response = await fetch('/api/quizzes', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Erro ao carregar quizzes');
      return response.json();
    }
  });

  // Fetch cloaker stats
  const { data: stats } = useQuery<CloakerStats>({
    queryKey: ['/api/cloaker/stats'],
    queryFn: async () => {
      const response = await fetch('/api/cloaker/stats', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Erro ao carregar estatísticas');
      return response.json();
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch cloaker config for selected quiz
  const { data: config, refetch: refetchConfig } = useQuery<CloakerConfig>({
    queryKey: ['/api/cloaker/config', selectedQuiz],
    queryFn: async () => {
      if (!selectedQuiz) return null;
      const response = await fetch(`/api/cloaker/config/${selectedQuiz}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Erro ao carregar configuração');
      return response.json();
    },
    enabled: !!selectedQuiz
  });

  // Save cloaker config mutation
  const saveConfigMutation = useMutation({
    mutationFn: async (newConfig: Partial<CloakerConfig>) => {
      if (!selectedQuiz) throw new Error('Nenhum quiz selecionado');
      
      const response = await fetch(`/api/cloaker/config/${selectedQuiz}`, {
        method: config ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newConfig)
      });
      
      if (!response.ok) throw new Error('Erro ao salvar configuração');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuração salva",
        description: "As configurações do cloaker foram atualizadas com sucesso."
      });
      refetchConfig();
      queryClient.invalidateQueries({ queryKey: ['/api/cloaker/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Test cloaker mutation
  const testCloakerMutation = useMutation({
    mutationFn: async (params: any) => {
      const response = await fetch(`/api/cloaker/test/${selectedQuiz}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ testParams: params })
      });
      
      if (!response.ok) throw new Error('Erro ao testar proteção');
      return response.json();
    }
  });

  const handleConfigUpdate = (updates: Partial<CloakerConfig>) => {
    const newConfig = { ...config, ...updates };
    saveConfigMutation.mutate(newConfig);
  };

  const handleTest = () => {
    testCloakerMutation.mutate(testParams);
  };

  const addUTMParam = () => {
    const newParams = [...(config?.requiredUTMParams || []), ''];
    handleConfigUpdate({ requiredUTMParams: newParams });
  };

  const updateUTMParam = (index: number, value: string) => {
    const newParams = [...(config?.requiredUTMParams || [])];
    newParams[index] = value;
    handleConfigUpdate({ requiredUTMParams: newParams });
  };

  const removeUTMParam = (index: number) => {
    const newParams = config?.requiredUTMParams?.filter((_, i) => i !== index) || [];
    handleConfigUpdate({ requiredUTMParams: newParams });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Cloaker Anti-Ad Library</h1>
          <p className="text-gray-600">Proteja suas ofertas de curiosos da biblioteca de anúncios do Facebook</p>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Bloqueios (24h)</p>
                  <p className="text-2xl font-bold">{stats.detection.blocksLast24h}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Ban className="w-4 h-4 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">IPs Bloqueados</p>
                  <p className="text-2xl font-bold">{stats.detection.blockedIPs}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Quizzes Protegidos</p>
                  <p className="text-2xl font-bold">{stats.usage.protectedQuizzes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Taxa de Proteção</p>
                  <p className="text-2xl font-bold">{stats.usage.protectionRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList>
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
          <TabsTrigger value="test">Teste</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Selecionar Quiz</CardTitle>
              <CardDescription>
                Escolha o quiz que deseja proteger com o cloaker
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um quiz" />
                </SelectTrigger>
                <SelectContent>
                  {quizzes.map((quiz) => (
                    <SelectItem key={quiz.id} value={quiz.id}>
                      {quiz.title} {quiz.isPublished ? '✅' : '⏸️'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedQuiz && config && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Configurações de Proteção</span>
                  <Badge variant={config.isEnabled ? "default" : "secondary"}>
                    {config.isEnabled ? "Ativo" : "Inativo"}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Configure como o cloaker deve proteger este quiz
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enable/Disable Cloaker */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Ativar Proteção Cloaker</Label>
                    <p className="text-sm text-gray-600">Habilita a proteção anti-espionagem para este quiz</p>
                  </div>
                  <Switch
                    checked={config.isEnabled}
                    onCheckedChange={(enabled) => handleConfigUpdate({ isEnabled: enabled })}
                  />
                </div>

                {config.isEnabled && (
                  <>
                    {/* Block Ad Library */}
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Bloquear Facebook Ad Library</Label>
                        <p className="text-sm text-gray-600">Bloqueia acessos vindos da biblioteca de anúncios</p>
                      </div>
                      <Switch
                        checked={config.blockAdLibrary}
                        onCheckedChange={(enabled) => handleConfigUpdate({ blockAdLibrary: enabled })}
                      />
                    </div>

                    {/* Block Direct Access */}
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Bloquear Acesso Direto</Label>
                        <p className="text-sm text-gray-600">Bloqueia acessos sem referrer ou UTM</p>
                      </div>
                      <Switch
                        checked={config.blockDirectAccess}
                        onCheckedChange={(enabled) => handleConfigUpdate({ blockDirectAccess: enabled })}
                      />
                    </div>

                    {/* Required UTM Parameters */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Parâmetros UTM Obrigatórios</Label>
                      <p className="text-sm text-gray-600">Usuários devem ter estes UTMs na URL para acessar</p>
                      
                      {config.requiredUTMParams?.map((param, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            placeholder="Ex: utm_source"
                            value={param}
                            onChange={(e) => updateUTMParam(index, e.target.value)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeUTMParam(index)}
                          >
                            Remover
                          </Button>
                        </div>
                      ))}
                      
                      <Button variant="outline" onClick={addUTMParam}>
                        Adicionar UTM
                      </Button>
                    </div>

                    {/* Block Page Type */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Página de Bloqueio</Label>
                      <Select
                        value={config.blockPage}
                        onValueChange={(value: any) => handleConfigUpdate({ blockPage: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="maintenance">Página de Manutenção</SelectItem>
                          <SelectItem value="unavailable">Página Indisponível</SelectItem>
                          <SelectItem value="custom">Mensagem Personalizada</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {config.blockPage === 'custom' && (
                        <Textarea
                          placeholder="Digite sua mensagem personalizada..."
                          value={config.customBlockMessage || ''}
                          onChange={(e) => handleConfigUpdate({ customBlockMessage: e.target.value })}
                        />
                      )}
                    </div>

                    {/* Advanced Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Máx. Tentativas por IP</Label>
                        <Input
                          type="number"
                          value={config.maxAttemptsPerIP}
                          onChange={(e) => handleConfigUpdate({ maxAttemptsPerIP: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>Duração do Bloqueio (minutos)</Label>
                        <Input
                          type="number"
                          value={config.blockDuration}
                          onChange={(e) => handleConfigUpdate({ blockDuration: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          {stats && (
            <>
              {/* Top Block Reasons */}
              <Card>
                <CardHeader>
                  <CardTitle>Principais Motivos de Bloqueio (24h)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.detection.topReasons.map((reason, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{reason.reason}</span>
                        <Badge variant="outline">{reason.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Active Cloackers */}
              <Card>
                <CardHeader>
                  <CardTitle>Quizzes com Proteção Ativa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.usage.activeCloackers.map((cloaker) => (
                      <div key={cloaker.quizId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{cloaker.quizTitle}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {cloaker.blockAdLibrary && <Badge size="sm">Ad Library</Badge>}
                            <Badge size="sm" variant="outline">
                              UTM: {cloaker.requiredUTMParams.join(', ')}
                            </Badge>
                          </div>
                        </div>
                        <Badge variant={cloaker.isEnabled ? "default" : "secondary"}>
                          {cloaker.isEnabled ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Blocks by Hour Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Bloqueios por Hora (24h)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-12 gap-1 h-24">
                    {stats.detection.blocksByHour.map((blocks, hour) => {
                      const maxBlocks = Math.max(...stats.detection.blocksByHour, 1);
                      const height = (blocks / maxBlocks) * 100;
                      
                      return (
                        <div key={hour} className="flex flex-col items-center space-y-1">
                          <div 
                            className="w-full bg-red-500 rounded-sm"
                            style={{ height: `${height}%` }}
                            title={`${hour}h: ${blocks} bloqueios`}
                          />
                          <span className="text-xs text-gray-500">{hour}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TestTube className="w-5 h-5" />
                <span>Testar Proteção</span>
              </CardTitle>
              <CardDescription>
                Simule diferentes cenários para testar se o cloaker está funcionando corretamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedQuiz && (
                <Alert>
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    Selecione um quiz na aba "Configuração" para testar a proteção.
                  </AlertDescription>
                </Alert>
              )}

              {selectedQuiz && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Referrer</Label>
                      <Input
                        placeholder="Ex: facebook.com/ads/library"
                        value={testParams.referrer}
                        onChange={(e) => setTestParams(prev => ({ ...prev, referrer: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>User-Agent</Label>
                      <Input
                        placeholder="Ex: facebookexternalhit"
                        value={testParams.userAgent}
                        onChange={(e) => setTestParams(prev => ({ ...prev, userAgent: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>IP Address</Label>
                    <Input
                      placeholder="Ex: 192.168.1.1"
                      value={testParams.ip}
                      onChange={(e) => setTestParams(prev => ({ ...prev, ip: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label>UTM Parameters (JSON)</Label>
                    <Textarea
                      placeholder='{"utm_source": "facebook", "utm_campaign": "test"}'
                      value={JSON.stringify(testParams.utmParams, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          setTestParams(prev => ({ ...prev, utmParams: parsed }));
                        } catch {}
                      }}
                    />
                  </div>

                  <Button onClick={handleTest} disabled={testCloakerMutation.isPending}>
                    {testCloakerMutation.isPending ? "Testando..." : "Executar Teste"}
                  </Button>

                  {testCloakerMutation.data && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          {testCloakerMutation.data.wouldBlock ? (
                            <Ban className="w-5 h-5 text-red-500" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                          <span>Resultado do Teste</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <Alert variant={testCloakerMutation.data.wouldBlock ? "destructive" : "default"}>
                            <AlertDescription>
                              {testCloakerMutation.data.wouldBlock 
                                ? `🚫 BLOQUEADO: ${testCloakerMutation.data.detection.reason}`
                                : "✅ ACESSO PERMITIDO"
                              }
                            </AlertDescription>
                          </Alert>
                          
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <pre className="text-sm overflow-auto">
                              {JSON.stringify(testCloakerMutation.data.detection, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
