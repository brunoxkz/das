import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MessageSquare, Phone, Users, TrendingUp, Search } from 'lucide-react';

interface PhoneContact {
  phone: string;
  name: string;
  email?: string;
  quizId: string;
  quizTitle: string;
  status: 'completed' | 'abandoned';
  lastActivity: string;
  responses?: any[];
}

export default function CampanhasPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedQuiz, setSelectedQuiz] = useState<string>("");
  const [phoneSearch, setPhoneSearch] = useState("");

  // Fetch quizzes
  const { data: quizzes, isLoading: quizzesLoading } = useQuery<any>({
    queryKey: ["/api/quizzes"],
    enabled: true
  });

  // Fetch phone numbers for selected quiz
  const { data: quizPhones, isLoading: phonesLoading } = useQuery<any>({
    queryKey: ["/api/quizzes", selectedQuiz, "phones"],
    queryFn: async () => {
      if (!selectedQuiz) return { phones: [] };
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/quizzes/${selectedQuiz}/phones`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch quiz phones");
      return response.json();
    },
    enabled: !!selectedQuiz
  });

  const filteredPhones = quizPhones?.phones?.filter((phone: any) => 
    phone.phone.toLowerCase().includes(phoneSearch.toLowerCase()) ||
    phone.name?.toLowerCase().includes(phoneSearch.toLowerCase())
  ) || [];

  if (quizzesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campanhas SMS</h1>
          <p className="text-gray-600">Gerencie suas campanhas de remarketing via SMS</p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <MessageSquare className="w-5 h-5" />
            Sistema Inteligente de Remarketing SMS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">📱 Captura Automática</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Detecta automaticamente campos de telefone nos quizzes</li>
                <li>• Sincronização em tempo real das respostas</li>
                <li>• Validação e formatação automática dos números</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">🎯 Segmentação Inteligente</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Leads que completaram o quiz</li>
                <li>• Leads que abandonaram no meio</li>
                <li>• Filtros por quiz específico</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">⚡ Automação Avançada</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Envio imediato ou com delay configurável</li>
                <li>• Templates personalizáveis com variáveis</li>
                <li>• Métricas de entrega e conversão</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="phones">Telefones</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                  Quizzes Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {quizzes?.length || 0}
                </div>
                <p className="text-xs text-gray-600 mt-1">Total de quizzes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  Telefones Capturados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {quizPhones?.phones?.length || 0}
                </div>
                <p className="text-xs text-gray-600 mt-1">Leads com telefone</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  Taxa de Captura
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  85%
                </div>
                <p className="text-xs text-gray-600 mt-1">Média de conversão</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Como Funciona o Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold">Captura Automática</h4>
                    <p className="text-sm text-gray-600">O sistema detecta automaticamente campos com ID "telefone_*" nos seus quizzes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold">Sincronização em Tempo Real</h4>
                    <p className="text-sm text-gray-600">Cada resposta de quiz é processada instantaneamente e os telefones são organizados</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold">Campanhas Direcionadas</h4>
                    <p className="text-sm text-gray-600">Use a aba "Telefones" para ver todos os contatos e criar campanhas personalizadas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Phones Tab */}
        <TabsContent value="phones" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-600" />
                Selecionar Funil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um quiz para ver os telefones" />
                </SelectTrigger>
                <SelectContent>
                  {quizzes?.map((quiz: any) => (
                    <SelectItem key={quiz.id} value={quiz.id}>
                      {quiz.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedQuiz && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-green-600" />
                  Telefones ({filteredPhones.length} encontrados)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {phonesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                  </div>
                ) : filteredPhones.length === 0 ? (
                  <div className="text-center py-8">
                    <Phone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum telefone encontrado
                    </h3>
                    <p className="text-gray-600">
                      Este quiz ainda não capturou nenhum telefone.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredPhones.map((contact: PhoneContact, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{contact.phone}</p>
                          {contact.name && <p className="text-sm text-gray-600">{contact.name}</p>}
                        </div>
                        <Badge variant={contact.status === 'completed' ? 'default' : 'secondary'}>
                          {contact.status === 'completed' ? 'Completo' : 'Abandonado'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}