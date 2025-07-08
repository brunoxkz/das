import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Phone, 
  Download, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Clock,
  Users
} from "lucide-react";

export default function WhatsAppAutomationPage() {
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [selectedAudience, setSelectedAudience] = useState<'all' | 'completed' | 'abandoned'>('all');
  const [dateFilter, setDateFilter] = useState("");
  const [generatingFile, setGeneratingFile] = useState(false);
  const [lastGeneratedFile, setLastGeneratedFile] = useState<any>(null);
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

  // Status da extensão
  const { data: extensionStatus } = useQuery({
    queryKey: ["/api/whatsapp-extension/status"],
    refetchInterval: 30000, // Verificar a cada 30 segundos
  });

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
        title: "Arquivo gerado com sucesso!",
        description: `Arquivo criado com ${filteredPhones.length} contatos. A extensão pode acessá-lo agora.`,
      });
      
    } catch (error) {
      console.error('Erro ao gerar arquivo:', error);
      toast({
        title: "Erro ao gerar arquivo",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setGeneratingFile(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Automação WhatsApp</h1>
          <p className="text-gray-600">Gere arquivos de contatos para a extensão Chrome</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={extensionStatus?.connected ? "default" : "destructive"}>
            {extensionStatus?.connected ? "Extensão Conectada" : "Extensão Desconectada"}
          </Badge>
        </div>
      </div>

      {/* Formulário de Geração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gerar Arquivo de Automação
          </CardTitle>
          <CardDescription>
            Selecione um quiz e configure os filtros para gerar o arquivo que a extensão Chrome irá usar
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

              {/* Botão de Gerar */}
              <Button 
                onClick={generateAutomationFile} 
                disabled={generatingFile || filteredPhones.length === 0}
                className="w-full"
              >
                {generatingFile ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Gerando Arquivo...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Gerar Arquivo de Automação ({filteredPhones.length} contatos)
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Arquivo Gerado Recentemente */}
      {lastGeneratedFile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Arquivo Gerado com Sucesso
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
                <Label className="text-gray-500">Gerado em</Label>
                <p className="font-semibold">
                  {new Date(lastGeneratedFile.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
            
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                ✅ <strong>Arquivo pronto!</strong> A extensão Chrome agora pode acessar este arquivo e exibir os contatos na sidebar do WhatsApp Web.
              </AlertDescription>
            </Alert>
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
    </div>
  );
}