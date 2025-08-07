import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Split, 
  Play, 
  Pause, 
  BarChart3, 
  Users, 
  Target, 
  TrendingUp, 
  Copy,
  ExternalLink,
  Trash2,
  Plus
} from 'lucide-react';

interface AbTest {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed';
  trafficSplit: number[];
  funnelIds: string[];
  funnelNames: string[];
  createdAt: string;
  views: number;
  conversions: number;
  conversionRate: number;
  endDate?: string;
}

interface Quiz {
  id: string;
  title: string;
  published: boolean;
  views: number;
  responses: number;
}

export default function ABTestingPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedFunnels, setSelectedFunnels] = useState<string[]>([]);
  const [trafficSplit, setTrafficSplit] = useState<number[]>([50, 50]);
  const [newTest, setNewTest] = useState({
    name: '',
    description: '',
    duration: 14
  });

  // Buscar quizzes disponíveis
  const { data: quizzes = [] } = useQuery<Quiz[]>({
    queryKey: ['/api/quizzes'],
    queryFn: () => apiRequest('GET', '/api/quizzes')
  });

  // Buscar testes A/B existentes
  const { data: abTests = [] } = useQuery<AbTest[]>({
    queryKey: ['/api/ab-tests'],
    queryFn: () => apiRequest('GET', '/api/ab-tests')
  });

  // Criar novo teste A/B
  const createTestMutation = useMutation({
    mutationFn: (testData: any) => apiRequest('POST', '/api/ab-tests', testData),
    onSuccess: () => {
      toast({
        title: "Teste A/B Criado",
        description: "URLs únicas foram geradas para divisão automática de tráfego",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ab-tests'] });
      setIsCreating(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar teste A/B",
        variant: "destructive"
      });
    }
  });

  // Pausar/Retomar teste
  const toggleTestMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'pause' | 'resume' }) => 
      apiRequest('PATCH', `/api/ab-tests/${id}/${action}`),
    onSuccess: () => {
      toast({
        title: "Teste Atualizado",
        description: "Status do teste foi alterado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ab-tests'] });
    }
  });

  // Deletar teste
  const deleteTestMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/ab-tests/${id}`),
    onSuccess: () => {
      toast({
        title: "Teste Deletado",
        description: "Teste A/B foi removido com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ab-tests'] });
    }
  });

  const resetForm = () => {
    setNewTest({ name: '', description: '', duration: 14 });
    setSelectedFunnels([]);
    setTrafficSplit([50, 50]);
  };

  const handleFunnelSelection = (funnelId: string, index: number) => {
    const newFunnels = [...selectedFunnels];
    newFunnels[index] = funnelId;
    setSelectedFunnels(newFunnels);
  };

  const addFunnel = () => {
    if (selectedFunnels.length < 3) {
      setSelectedFunnels([...selectedFunnels, '']);
      const newSplit = [...trafficSplit];
      const splitValue = Math.floor(100 / (selectedFunnels.length + 1));
      for (let i = 0; i < newSplit.length; i++) {
        newSplit[i] = splitValue;
      }
      newSplit.push(100 - (splitValue * selectedFunnels.length));
      setTrafficSplit(newSplit);
    }
  };

  const removeFunnel = (index: number) => {
    const newFunnels = selectedFunnels.filter((_, i) => i !== index);
    setSelectedFunnels(newFunnels);
    const newSplit = trafficSplit.filter((_, i) => i !== index);
    setTrafficSplit(newSplit);
  };

  const handleTrafficSplitChange = (index: number, value: number) => {
    const newSplit = [...trafficSplit];
    newSplit[index] = value;
    
    // Ajustar automaticamente os outros valores para somar 100%
    const total = newSplit.reduce((sum, val) => sum + val, 0);
    if (total !== 100) {
      const diff = 100 - total;
      const otherIndex = index === 0 ? 1 : 0;
      if (newSplit[otherIndex] + diff >= 0) {
        newSplit[otherIndex] += diff;
      }
    }
    
    setTrafficSplit(newSplit);
  };

  const createTest = () => {
    if (!newTest.name || selectedFunnels.length < 2) {
      toast({
        title: "Erro",
        description: "Nome do teste e pelo menos 2 funis são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const testData = {
      name: newTest.name,
      description: newTest.description,
      funnelIds: selectedFunnels,
      trafficSplit: trafficSplit,
      duration: newTest.duration
    };

    createTestMutation.mutate(testData);
  };

  const copyTestUrl = (testId: string) => {
    const url = `${window.location.origin}/quiz/ab-test/${testId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "URL Copiada",
      description: "URL do teste A/B copiada para área de transferência",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'paused': return 'Pausado';
      case 'completed': return 'Concluído';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Teste A/B
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Crie URLs únicas que dividem automaticamente o tráfego entre até 3 funis diferentes
            </p>
          </div>
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Teste A/B
          </Button>
        </div>

        {/* Explicação do Sistema */}
        <Card className="mb-8 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-700 dark:text-blue-300">
              <Split className="w-5 h-5 mr-2" />
              Como Funciona o Teste A/B
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">1. Criação</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Selecione até 3 funis e defina a divisão de tráfego entre eles
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">2. URL Única</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Sistema gera URL única que divide automaticamente visitantes
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">3. Análise</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Compare engajamento e taxa de conclusão entre funis
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal de Criação */}
        {isCreating && (
          <Card className="mb-8 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="text-green-700 dark:text-green-300">
                Criar Novo Teste A/B
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="testName">Nome do Teste</Label>
                  <Input
                    id="testName"
                    value={newTest.name}
                    onChange={(e) => setNewTest({...newTest, name: e.target.value})}
                    placeholder="Ex: Teste Funil Emagrecimento vs Fitness"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duração (dias)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newTest.duration}
                    onChange={(e) => setNewTest({...newTest, duration: parseInt(e.target.value)})}
                    min="1"
                    max="90"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newTest.description}
                  onChange={(e) => setNewTest({...newTest, description: e.target.value})}
                  placeholder="Descreva o objetivo do teste..."
                  rows={3}
                />
              </div>

              {/* Seleção de Funis */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label>Funis para Teste</Label>
                  {selectedFunnels.length < 3 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addFunnel}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Funil
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {selectedFunnels.map((funnelId, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex-1">
                        <Select
                          value={funnelId}
                          onValueChange={(value) => handleFunnelSelection(value, index)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um funil" />
                          </SelectTrigger>
                          <SelectContent>
                            {quizzes.map((quiz) => (
                              <SelectItem key={quiz.id} value={quiz.id}>
                                {quiz.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-20">
                        <Input
                          type="number"
                          value={trafficSplit[index] || 0}
                          onChange={(e) => handleTrafficSplitChange(index, parseInt(e.target.value))}
                          min="0"
                          max="100"
                          className="text-center"
                        />
                      </div>
                      <span className="text-sm text-gray-500">%</span>
                      {selectedFunnels.length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFunnel(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={createTest}
                  disabled={createTestMutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                >
                  {createTestMutation.isPending ? 'Criando...' : 'Criar Teste'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Testes */}
        <div className="grid gap-6">
          {abTests.map((test) => (
            <Card key={test.id} className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {test.name}
                      <Badge className={getStatusColor(test.status)}>
                        {getStatusText(test.status)}
                      </Badge>
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      {test.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyTestUrl(test.id)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleTestMutation.mutate({
                        id: test.id,
                        action: test.status === 'active' ? 'pause' : 'resume'
                      })}
                    >
                      {test.status === 'active' ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTestMutation.mutate(test.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Estatísticas */}
                  <div>
                    <h4 className="font-semibold mb-3">Estatísticas Gerais</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Total de Visualizações:</span>
                        <span className="font-semibold">{test.views}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Conversões:</span>
                        <span className="font-semibold">{test.conversions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Taxa de Conversão:</span>
                        <span className="font-semibold text-green-600">{test.conversionRate}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Divisão de Tráfego */}
                  <div>
                    <h4 className="font-semibold mb-3">Divisão de Tráfego</h4>
                    <div className="space-y-3">
                      {test.funnelNames.map((name, index) => (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{name}</span>
                            <span>{test.trafficSplit[index]}%</span>
                          </div>
                          <Progress value={test.trafficSplit[index]} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* URL do Teste */}
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">URL do Teste:</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 break-all">
                        {window.location.origin}/quiz/ab-test/{test.id}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyTestUrl(test.id)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {abTests.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Split className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nenhum teste A/B criado
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Crie seu primeiro teste A/B para começar a otimizar seus funis
              </p>
              <Button
                onClick={() => setIsCreating(true)}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Teste
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}