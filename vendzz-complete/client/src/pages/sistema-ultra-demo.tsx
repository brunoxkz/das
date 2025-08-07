import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";

export default function SistemaUltraDemo() {
  const [selectedQuizId] = useState('RdAUwmQgTthxbZLA0HJWu');
  const [selectedFilter, setSelectedFilter] = useState<{fieldId: string, value: string} | null>(null);
  
  // Query para buscar análise ultra-granular
  const { data: ultraData, isLoading: ultraLoading } = useQuery({
    queryKey: ['/api/quizzes', selectedQuizId, 'variables-ultra'],
    queryFn: () => apiRequest(`/api/quizzes/${selectedQuizId}/variables-ultra`)
  });

  // Mutation para filtrar leads por resposta específica
  const filterLeadsMutation = useMutation({
    mutationFn: async (filterData: {fieldId: string, responseValue: string, format: string}) => {
      return apiRequest(`/api/quizzes/${selectedQuizId}/leads-by-response`, {
        method: 'POST',
        body: JSON.stringify(filterData)
      });
    }
  });

  const handleFilterLeads = (fieldId: string, value: string, format: string = 'leads') => {
    setSelectedFilter({fieldId, value});
    filterLeadsMutation.mutate({
      fieldId,
      responseValue: value,
      format
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-600 mb-2">
          🔥 SISTEMA ULTRA - MODO DEMONSTRAÇÃO
        </h1>
        <p className="text-gray-600 text-lg">
          Ultra-segmentação granular por resposta específica
        </p>
        <Badge variant="outline" className="mt-2">
          Quiz ID: {selectedQuizId}
        </Badge>
      </div>

      {ultraLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p>Carregando análise ultra-granular...</p>
          </CardContent>
        </Card>
      )}

      {ultraData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Painel de Análise Ultra */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Análise Ultra-Granular
                <Badge>{ultraData.totalVariables} campos</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold">Total Variáveis</p>
                  <p className="text-2xl font-bold text-green-600">{ultraData.totalVariables}</p>
                </div>
                <div>
                  <p className="font-semibold">Total Respostas</p>
                  <p className="text-2xl font-bold text-blue-600">{ultraData.totalResponses}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {ultraData.variables?.map((variable: any, index: number) => (
                  <div key={variable.fieldId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-sm">{variable.fieldId}</h4>
                      <Badge variant="secondary">
                        {variable.totalLeads} leads | {variable.totalResponses} respostas
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {variable.responseStats?.slice(0, 4).map((stat: any, statIndex: number) => (
                        <div key={statIndex} className="flex items-center justify-between text-sm">
                          <span className="truncate max-w-48">"{stat.value}"</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {stat.leadsCount} leads
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFilterLeads(variable.fieldId, stat.value)}
                              className="text-xs px-2 py-1"
                            >
                              Filtrar
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {variable.responseStats?.length > 4 && (
                        <p className="text-xs text-gray-500">
                          + {variable.responseStats.length - 4} outras respostas
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Painel de Resultados do Filtro */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎯 Resultados do Filtro Ultra
                {selectedFilter && (
                  <Badge>
                    {selectedFilter.fieldId} = "{selectedFilter.value}"
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedFilter && (
                <div className="text-center text-gray-500 py-12">
                  <p className="text-lg mb-2">🔍</p>
                  <p>Clique em "Filtrar" em qualquer resposta acima para ver os leads</p>
                </div>
              )}

              {filterLeadsMutation.isPending && (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
                  <p>Filtrando leads...</p>
                </div>
              )}

              {filterLeadsMutation.data && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-semibold">Leads Encontrados</p>
                      <p className="text-2xl font-bold text-green-600">
                        {filterLeadsMutation.data.totalMatches}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">Total Analisado</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {filterLeadsMutation.data.totalScanned}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => selectedFilter && handleFilterLeads(selectedFilter.fieldId, selectedFilter.value, 'phones')}
                      >
                        📱 Ver Telefones
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => selectedFilter && handleFilterLeads(selectedFilter.fieldId, selectedFilter.value, 'emails')}
                      >
                        📧 Ver Emails
                      </Button>
                    </div>
                  </div>

                  {/* Lista de leads */}
                  <div className="max-h-64 overflow-y-auto space-y-3">
                    {filterLeadsMutation.data.leads?.slice(0, 10).map((lead: any, index: number) => (
                      <div key={lead.responseId} className="border rounded-lg p-3 text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">
                            {lead.nome || lead.name || `Lead ${index + 1}`}
                          </span>
                          <Badge variant={lead.isComplete ? "default" : "secondary"}>
                            {lead.isComplete ? "Completo" : "Parcial"}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-xs text-gray-600">
                          <p>📧 {lead.email || 'N/A'}</p>
                          <p>📱 {lead.telefone || lead.phone || 'N/A'}</p>
                          <p>⏰ {new Date(lead.submittedAt).toLocaleString('pt-BR')}</p>
                          <p>🎯 Respondeu: "<strong>{lead.matchingValue}</strong>"</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filterLeadsMutation.data.leads?.length > 10 && (
                    <p className="text-xs text-gray-500 text-center">
                      + {filterLeadsMutation.data.leads.length - 10} leads adicionais
                    </p>
                  )}
                </div>
              )}

              {filterLeadsMutation.error && (
                <div className="text-center text-red-500 py-12">
                  <p className="text-lg mb-2">❌</p>
                  <p>Erro ao filtrar leads</p>
                  <p className="text-sm">{filterLeadsMutation.error.message}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Painel de Informações */}
      <Card>
        <CardHeader>
          <CardTitle>🔥 Como Funciona o Sistema ULTRA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl mb-2">📊</div>
              <h4 className="font-semibold mb-2">1. Análise Ultra-Granular</h4>
              <p className="text-sm text-gray-600">
                Sistema analisa TODAS as respostas e agrupa por valor específico
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-semibold mb-2">2. Segmentação Precisa</h4>
              <p className="text-sm text-gray-600">
                Filtra leads por resposta exata: "Emagrecer" vs "Ganhar Massa"
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl mb-2">🚀</div>
              <h4 className="font-semibold mb-2">3. Campanhas Direcionadas</h4>
              <p className="text-sm text-gray-600">
                Crie campanhas específicas para cada segmento de resposta
              </p>
            </div>
          </div>

          <Separator />

          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Ultra Requirement:</strong> Uma pergunta com 4 respostas (A, B, C, D) cria 4 segmentos distintos e filtráveis.</p>
            <p><strong>Exemplo Prático:</strong> Pergunta sobre objetivo fitness gera segmentos: "Emagrecer", "Ganhar Massa", "Definir", "Manter"</p>
            <p><strong>Campanhas Direcionadas:</strong> SMS/Email/WhatsApp específicos para cada resposta individual</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}