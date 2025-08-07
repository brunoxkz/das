import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X, ArrowRight, MessageSquare, Mail, Phone, Volume2, Target, Settings, Save, Play, Pause, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ConditionalRule {
  id: string;
  condition: {
    field: string;
    operator: 'equals' | 'contains' | 'not_equals' | 'greater_than' | 'less_than' | 'in_range';
    value: string;
  };
  action: {
    type: 'sms' | 'email' | 'whatsapp' | 'voice';
    message: string;
    delay: number; // em horas
  };
}

interface ConditionalCampaign {
  id?: string;
  name: string;
  description: string;
  quizId: string;
  type: 'remarketing' | 'remarketing_ultra' | 'live' | 'live_ultra';
  rules: ConditionalRule[];
  status: 'draft' | 'active' | 'paused' | 'completed';
  createdAt?: string;
  updatedAt?: string;
}

// Campos disponíveis para condições baseados no quiz
const AVAILABLE_FIELDS = [
  { value: 'nome_completo', label: 'Nome Completo' },
  { value: 'email_contato', label: 'Email' },
  { value: 'telefone_contato', label: 'Telefone' },
  { value: 'faixa_etaria', label: 'Faixa Etária' },
  { value: 'renda_mensal', label: 'Renda Mensal' },
  { value: 'produto_escolhido', label: 'Produto Escolhido' },
  { value: 'tipo_corpo', label: 'Tipo de Corpo' },
  { value: 'objetivo_fitness', label: 'Objetivo Fitness' },
  { value: 'experiencia_nivel', label: 'Nível de Experiência' },
  { value: 'quiz_score', label: 'Pontuação do Quiz' },
  { value: 'completion_time', label: 'Tempo de Conclusão' },
  { value: 'device_type', label: 'Tipo de Dispositivo' }
];

const OPERATORS = [
  { value: 'equals', label: 'É igual a' },
  { value: 'contains', label: 'Contém' },
  { value: 'not_equals', label: 'Não é igual a' },
  { value: 'greater_than', label: 'Maior que' },
  { value: 'less_than', label: 'Menor que' },
  { value: 'in_range', label: 'Está entre' }
];

const CAMPAIGN_TYPES = [
  {
    value: 'remarketing',
    label: 'CAMPANHA REMARKETING',
    description: 'Para leads antigos, você escolhe quais reativar',
    icon: Target,
    color: 'bg-blue-500'
  },
  {
    value: 'remarketing_ultra',
    label: 'CAMPANHA REMARKETING ULTRA CUSTOMIZADA',
    description: 'Mensagens únicas por resposta específica',
    icon: Settings,
    color: 'bg-purple-500'
  },
  {
    value: 'live',
    label: 'CAMPANHA AO VIVO (TEMPO REAL)',
    description: 'Leads abandonados E completos, você escolhe o tipo',
    icon: Play,
    color: 'bg-green-500'
  },
  {
    value: 'live_ultra',
    label: 'CAMPANHA AO VIVO ULTRA PERSONALIZADA',
    description: 'Filtros de idade e estilo corporal, você escolhe',
    icon: MessageSquare,
    color: 'bg-orange-500'
  }
];

export default function ConditionalCampaignBuilder() {
  const [campaign, setCampaign] = useState<ConditionalCampaign>({
    name: '',
    description: '',
    quizId: '',
    type: 'remarketing',
    rules: [],
    status: 'draft'
  });
  const [selectedRule, setSelectedRule] = useState<ConditionalRule | null>(null);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar quizzes disponíveis
  const { data: quizzes = [] } = useQuery({
    queryKey: ['/api/quizzes'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/quizzes');
      return response.json();
    }
  });

  // Buscar campanhas condicionais existentes
  const { data: campaigns = [] } = useQuery({
    queryKey: ['/api/conditional-campaigns'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/conditional-campaigns');
      return response.json();
    }
  });

  // Mutation para salvar campanha
  const saveCampaignMutation = useMutation({
    mutationFn: async (campaignData: ConditionalCampaign) => {
      const method = campaignData.id ? 'PUT' : 'POST';
      const url = campaignData.id ? `/api/conditional-campaigns/${campaignData.id}` : '/api/conditional-campaigns';
      return apiRequest(method, url, campaignData);
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Campanha condicional salva com sucesso!"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/conditional-campaigns'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar campanha condicional",
        variant: "destructive"
      });
    }
  });

  // Adicionar nova regra
  const addRule = () => {
    const newRule: ConditionalRule = {
      id: Date.now().toString(),
      condition: {
        field: 'faixa_etaria',
        operator: 'equals',
        value: ''
      },
      action: {
        type: 'sms',
        message: '',
        delay: 0
      }
    };
    setSelectedRule(newRule);
    setIsRuleModalOpen(true);
  };

  // Salvar regra
  const saveRule = (rule: ConditionalRule) => {
    if (rule.id && campaign.rules.find(r => r.id === rule.id)) {
      // Atualizar regra existente
      setCampaign(prev => ({
        ...prev,
        rules: prev.rules.map(r => r.id === rule.id ? rule : r)
      }));
    } else {
      // Adicionar nova regra
      setCampaign(prev => ({
        ...prev,
        rules: [...prev.rules, rule]
      }));
    }
    setIsRuleModalOpen(false);
    setSelectedRule(null);
  };

  // Remover regra
  const removeRule = (ruleId: string) => {
    setCampaign(prev => ({
      ...prev,
      rules: prev.rules.filter(r => r.id !== ruleId)
    }));
  };

  // Salvar campanha
  const saveCampaign = () => {
    if (!campaign.name || !campaign.quizId || campaign.rules.length === 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios e adicione pelo menos uma regra",
        variant: "destructive"
      });
      return;
    }
    saveCampaignMutation.mutate(campaign);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
            Campanhas Condicionais "SE → ENTÃO"
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Crie campanhas inteligentes baseadas em condições específicas das respostas
          </p>
        </div>
        <Button onClick={saveCampaign} disabled={saveCampaignMutation.isPending}>
          <Save className="w-4 h-4 mr-2" />
          Salvar Campanha
        </Button>
      </div>

      <Tabs defaultValue="builder" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder">Editor de Campanhas</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas Ativas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          {/* Configurações da Campanha */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações da Campanha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="campaign-name">Nome da Campanha</Label>
                  <Input
                    id="campaign-name"
                    value={campaign.name}
                    onChange={(e) => setCampaign(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Campanha Fitness Personalizada"
                  />
                </div>
                <div>
                  <Label htmlFor="quiz-select">Quiz Associado</Label>
                  <Select value={campaign.quizId} onValueChange={(value) => setCampaign(prev => ({ ...prev, quizId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um quiz" />
                    </SelectTrigger>
                    <SelectContent>
                      {quizzes.map((quiz: any) => (
                        <SelectItem key={quiz.id} value={quiz.id}>
                          {quiz.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="campaign-description">Descrição</Label>
                <Textarea
                  id="campaign-description"
                  value={campaign.description}
                  onChange={(e) => setCampaign(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o objetivo desta campanha..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Tipo de Campanha</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {CAMPAIGN_TYPES.map((type) => (
                    <div
                      key={type.value}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        campaign.type === type.value
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setCampaign(prev => ({ ...prev, type: type.value as any }))}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${type.color} text-white`}>
                          <type.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{type.label}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-300">{type.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Regras Condicionais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Regras Condicionais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaign.rules.map((rule, index) => (
                  <div key={rule.id} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Regra {index + 1}</Badge>
                        <Badge variant="secondary" className="capitalize">
                          {rule.action.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRule(rule);
                            setIsRuleModalOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRule(rule.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">SE</span>
                      <Badge variant="outline">{rule.condition.field}</Badge>
                      <span>{OPERATORS.find(op => op.value === rule.condition.operator)?.label}</span>
                      <Badge variant="outline">{rule.condition.value}</Badge>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">ENTÃO</span>
                      <Badge variant="outline">Enviar {rule.action.type.toUpperCase()}</Badge>
                      {rule.action.delay > 0 && (
                        <Badge variant="outline">em {rule.action.delay}h</Badge>
                      )}
                    </div>
                    
                    <div className="mt-2 p-2 bg-white dark:bg-gray-700 rounded text-sm">
                      <strong>Mensagem:</strong> {rule.action.message || 'Mensagem não definida'}
                    </div>
                  </div>
                ))}

                <Button onClick={addRule} variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Nova Regra
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Campanhas Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma campanha condicional criada ainda
                  </div>
                ) : (
                  campaigns.map((camp: any) => (
                    <div key={camp.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{camp.name}</h3>
                          <p className="text-sm text-gray-600">{camp.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{camp.type}</Badge>
                            <Badge variant={camp.status === 'active' ? 'default' : 'secondary'}>
                              {camp.status}
                            </Badge>
                            <Badge variant="outline">{camp.rules?.length || 0} regras</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Pause className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics das Campanhas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Analytics das campanhas condicionais em desenvolvimento
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal para Editar Regra */}
      {isRuleModalOpen && selectedRule && (
        <RuleEditModal
          rule={selectedRule}
          onSave={saveRule}
          onCancel={() => {
            setIsRuleModalOpen(false);
            setSelectedRule(null);
          }}
        />
      )}
    </div>
  );
}

// Componente Modal para Editar Regra
function RuleEditModal({ 
  rule, 
  onSave, 
  onCancel 
}: { 
  rule: ConditionalRule; 
  onSave: (rule: ConditionalRule) => void; 
  onCancel: () => void; 
}) {
  const [editingRule, setEditingRule] = useState<ConditionalRule>(rule);

  const handleSave = () => {
    if (!editingRule.condition.value || !editingRule.action.message) {
      return;
    }
    onSave(editingRule);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Editar Regra Condicional</h3>
        
        <div className="space-y-4">
          {/* Condição */}
          <div>
            <h4 className="font-medium mb-2">Condição (SE)</h4>
            <div className="grid grid-cols-3 gap-2">
              <Select 
                value={editingRule.condition.field} 
                onValueChange={(value) => setEditingRule(prev => ({
                  ...prev,
                  condition: { ...prev.condition, field: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Campo" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_FIELDS.map(field => (
                    <SelectItem key={field.value} value={field.value}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={editingRule.condition.operator} 
                onValueChange={(value) => setEditingRule(prev => ({
                  ...prev,
                  condition: { ...prev.condition, operator: value as any }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Operador" />
                </SelectTrigger>
                <SelectContent>
                  {OPERATORS.map(op => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                value={editingRule.condition.value}
                onChange={(e) => setEditingRule(prev => ({
                  ...prev,
                  condition: { ...prev.condition, value: e.target.value }
                }))}
                placeholder="Valor"
              />
            </div>
          </div>

          {/* Ação */}
          <div>
            <h4 className="font-medium mb-2">Ação (ENTÃO)</h4>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <Select 
                value={editingRule.action.type} 
                onValueChange={(value) => setEditingRule(prev => ({
                  ...prev,
                  action: { ...prev.action, type: value as any }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de Ação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="voice">Voice</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="number"
                value={editingRule.action.delay}
                onChange={(e) => setEditingRule(prev => ({
                  ...prev,
                  action: { ...prev.action, delay: parseInt(e.target.value) || 0 }
                }))}
                placeholder="Delay (horas)"
              />
            </div>

            <Textarea
              value={editingRule.action.message}
              onChange={(e) => setEditingRule(prev => ({
                ...prev,
                action: { ...prev.action, message: e.target.value }
              }))}
              placeholder="Mensagem a ser enviada..."
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Regra
          </Button>
        </div>
      </div>
    </div>
  );
}