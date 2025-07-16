import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import WhatsAppMethodSelector from "@/components/whatsapp-method-selector";
import { 
  Phone, 
  Download, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Key,
  RefreshCw,
  Settings,
  BarChart3
} from "lucide-react";

export default function WhatsAppAutomationPage() {
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [selectedAudience, setSelectedAudience] = useState<'all' | 'completed' | 'abandoned'>('all');
  const [dateFilter, setDateFilter] = useState("");
  const [generatingFile, setGeneratingFile] = useState(false);
  const [lastGeneratedFile, setLastGeneratedFile] = useState<any>(null);
  const [generatingToken, setGeneratingToken] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();

  // Buscar quizzes
  const { data: quizzes, isLoading: loadingQuizzes, error: quizzesError } = useQuery({
    queryKey: ["/api/quizzes"],
  });

  // Buscar telefones do quiz selecionado
  const { data: phonesData, refetch: refetchPhones } = useQuery({
    queryKey: ["/api/quiz-phones", selectedQuiz],
    queryFn: async () => {
      if (!selectedQuiz) return { phones: [] };
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/quiz-phones/${selectedQuiz}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch quiz phones");
      return response.json();
    },
    enabled: !!selectedQuiz,
    refetchInterval: 10000 // Atualizar a cada 10 segundos para detectar novos leads
  });

  // Status da extensão - só considera conectada se realmente há activity recente
  const { data: extensionStatus } = useQuery({
    queryKey: ["/api/whatsapp-extension/status"],
    refetchInterval: 30000, // Verificar a cada 30 segundos
  });

  // Verifica se extensão está realmente conectada (ping nos últimos 2 minutos)
  const isExtensionConnected = extensionStatus?.connected && 
    extensionStatus?.lastPing && 
    (new Date().getTime() - new Date(extensionStatus.lastPing).getTime()) < 120000;

  const quizzesList = Array.isArray(quizzes) ? quizzes : [];
  const phonesList = phonesData?.phones || [];
  


  // Filtrar telefones baseado na audiência e data
  const filteredPhones = phonesList.filter(contact => {
    // Filtro de data
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      const contactDate = new Date(contact.submittedAt);
      if (contactDate < filterDate) return false;
    }
    
    // Filtro de audiência
    if (selectedAudience === 'completed') {
      return contact.isComplete === true;
    } else if (selectedAudience === 'abandoned') {
      return contact.isComplete === false;
    }
    
    return true; // 'all'
  });

  const audienceCounts = {
    completed: phonesList.filter(c => c.isComplete === true).length,
    abandoned: phonesList.filter(c => c.isComplete === false).length,
    all: phonesList.length
  };

  const generateAutomationFile = async () => {
    if (!selectedQuiz) return;
    
    setGeneratingFile(true);
    try {
      const response = await apiRequest('POST', '/api/whatsapp-automation-file', {
        quizId: selectedQuiz,
        targetAudience: selectedAudience,
        dateFilter: dateFilter
      });
      
      setLastGeneratedFile({
        ...response,
        quizTitle: quizzesList.find(q => q.id === selectedQuiz)?.title || 'Quiz',
        totalPhones: filteredPhones.length,
        createdAt: new Date().toISOString()
      });
      
      toast({
        title: "Sincronização ativada com sucesso!",
        description: `Funil sincronizado com ${filteredPhones.length} contatos. A ferramenta de automação pode acessá-lo agora.`,
      });
      
    } catch (error: any) {
      console.error('Erro ao ativar sincronização:', error);
      
      // Verifica se é erro de automação desabilitada
      if (error.message && error.message.includes('Automação WhatsApp não está habilitada')) {
        toast({
          title: "Automação WhatsApp Desabilitada",
          description: "Para usar esta funcionalidade, habilite a 'Automação WhatsApp' nas configurações do quiz.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao ativar sincronização",
          description: error.message || "Tente novamente em alguns instantes.",
          variant: "destructive",
        });
      }
    } finally {
      setGeneratingFile(false);
    }
  };

  const generateToken = async () => {
    setGeneratingToken(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Token de acesso não encontrado");
      }
      
      setGeneratedToken(token);
      
      toast({
        title: "Token gerado com sucesso!",
        description: "Token copiado para área de transferência. Use-o na extensão Chrome.",
      });
      
      // Copiar token para área de transferência
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(token);
      }
      
    } catch (error: any) {
      console.error('Erro ao gerar token:', error);
      toast({
        title: "Erro ao gerar token",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setGeneratingToken(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Automação WhatsApp</h1>
          <p className="text-gray-600">Sincronize seus funis com a ferramenta de automação</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isExtensionConnected ? "default" : "destructive"}>
            {isExtensionConnected ? "Extensão Conectada" : "Extensão Desconectada"}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="method">Configurar Método</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6 mt-6">

      {/* Formulário de Geração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Sincronize seu Funil customizado com o WhatsApp (ROI +38%)
          </CardTitle>
          <CardDescription>
            Selecione um quiz e configure os filtros para enviar os dados para a ferramenta de automação.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seleção de Quiz */}
          <div>
            <Label htmlFor="quiz-select">Selecionar Quiz</Label>
            <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um quiz" />
              </SelectTrigger>
              <SelectContent>
                {quizzesList.map((quiz) => (
                  <SelectItem key={quiz.id} value={quiz.id}>
                    {quiz.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Configurações quando quiz selecionado */}
          {selectedQuiz && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Público-Alvo */}
                <div>
                  <Label htmlFor="target-audience">Público-Alvo</Label>
                  <Select value={selectedAudience} onValueChange={(value: 'all' | 'completed' | 'abandoned') => setSelectedAudience(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o público" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Quiz Completo ({audienceCounts.completed})
                        </div>
                      </SelectItem>
                      <SelectItem value="abandoned">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          Quiz Abandonado ({audienceCounts.abandoned})
                        </div>
                      </SelectItem>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Todos os Leads ({audienceCounts.all})
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro de Data */}
                <div>
                  <Label htmlFor="date-filter">Filtrar por Data (opcional)</Label>
                  <Input
                    id="date-filter"
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    placeholder="Selecione a data mínima"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {dateFilter ? (
                      <>📅 Incluir apenas leads a partir de {new Date(dateFilter).toLocaleDateString('pt-BR')}</>
                    ) : (
                      <>📋 Incluir todos os leads - sem filtro de data</>
                    )}
                  </p>
                </div>
              </div>

              {/* Preview dos Contatos */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <Label>Preview dos Contatos ({filteredPhones.length})</Label>
                </div>
                
                <div className="max-h-32 overflow-y-auto border rounded-md p-2">
                  {filteredPhones.length > 0 ? (
                    <div className="space-y-1">
                      {filteredPhones.slice(0, 10).map((contact, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="font-mono">{contact.phone}</span>
                          <div className="flex items-center gap-2">
                            {contact.isComplete === true ? (
                              <Badge variant="default" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Completo
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                Abandonado
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                      {filteredPhones.length > 10 && (
                        <p className="text-xs text-gray-500 text-center">
                          ... e mais {filteredPhones.length - 10} contatos
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-4">
                      Nenhum contato encontrado com os filtros selecionados
                    </p>
                  )}
                </div>
              </div>

              {/* Botões */}
              <div className="space-y-3">
                <Button 
                  onClick={generateAutomationFile} 
                  disabled={generatingFile || filteredPhones.length === 0}
                  className="w-full"
                >
                  {generatingFile ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Ativando Sincronização...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Ativar Sincronização desse Funil ({filteredPhones.length} contatos)
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={generateToken} 
                  disabled={generatingToken}
                  variant="outline"
                  className="w-full"
                >
                  {generatingToken ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Gerando Token...
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4 mr-2" />
                      Gerar Token para Extensão
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Funil Sincronizado */}
      {lastGeneratedFile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Funil Sincronizado com Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <Label className="text-gray-500">Quiz</Label>
                <p className="font-semibold">{lastGeneratedFile.quizTitle}</p>
              </div>
              <div>
                <Label className="text-gray-500">Total de Contatos</Label>
                <p className="font-semibold">{lastGeneratedFile.totalPhones}</p>
              </div>
              <div>
                <Label className="text-gray-500">Sincronizado em</Label>
                <p className="font-semibold">
                  {new Date(lastGeneratedFile.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
            
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                ✅ <strong>Sincronização ativa!</strong> A ferramenta de automação agora pode acessar este funil e exibir os contatos na interface do WhatsApp Web.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Token Gerado */}
      {generatedToken && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Key className="h-5 w-5" />
              Token Gerado para Extensão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Label className="text-gray-500">Token de Autenticação</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input 
                    value={generatedToken} 
                    readOnly 
                    className="font-mono text-sm"
                    type="password"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(generatedToken)}
                  >
                    Copiar
                  </Button>
                </div>
              </div>
              
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  🔑 <strong>Token copiado!</strong> Use este token na extensão Chrome para conectar com o sistema. O token já foi copiado para sua área de transferência.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status da Extensão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Status da Extensão Chrome
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant={extensionStatus?.connected ? "default" : "destructive"} className="text-sm">
              {extensionStatus?.connected ? "✅ Conectada" : "❌ Desconectada"}
            </Badge>
            {extensionStatus?.connected && (
              <div className="text-sm text-gray-600">
                Última atividade: {extensionStatus.lastPing ? new Date(extensionStatus.lastPing).toLocaleTimeString('pt-BR') : 'Nunca'}
              </div>
            )}
          </div>
          
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              💡 <strong>Como usar:</strong> Após gerar o arquivo, acesse o WhatsApp Web no Chrome. A extensão irá automaticamente carregar e exibir os contatos na sidebar.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="method" className="space-y-6 mt-6">
          <WhatsAppMethodSelector />
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Campanhas WhatsApp</CardTitle>
              <CardDescription>
                Gerencie suas campanhas de WhatsApp aqui. Esta seção será expandida em futuras atualizações.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  🚧 Esta funcionalidade está em desenvolvimento. Use a aba Dashboard para gerenciar automações.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API WhatsApp
              </CardTitle>
              <CardDescription>
                Configure as credenciais da API do WhatsApp Business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  🚧 Configuração da API WhatsApp Business em desenvolvimento. Use a extensão por enquanto.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações
              </CardTitle>
              <CardDescription>
                Configurações gerais da automação WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  🚧 Configurações avançadas em desenvolvimento. Use a aba Dashboard para funcionalidades básicas.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}