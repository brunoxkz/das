import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, ArrowRight, Users, Target, Calendar, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface UltraPersonalizedCampaignModalProps {
  open: boolean;
  onClose: () => void;
  quizId: string;
  quizTitle: string;
}

interface ConditionalRule {
  fieldId: string;
  fieldTitle: string;
  expectedValue: string;
  expectedLabel: string;
  message: string;
}

interface DetectedElement {
  fieldId: string;
  type: string;
  title: string;
  description: string;
  options: Array<{
    value: string;
    label: string;
    description: string;
  }>;
}

export function UltraPersonalizedCampaignModal({ open, onClose, quizId, quizTitle }: UltraPersonalizedCampaignModalProps) {
  const [campaignName, setCampaignName] = useState('');
  const [conditionalRules, setConditionalRules] = useState<ConditionalRule[]>([]);
  const [triggerDelay, setTriggerDelay] = useState(10);
  const [triggerUnit, setTriggerUnit] = useState('minutes');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Detectar elementos de ultra personalização disponíveis
  const { data: elementsData } = useQuery({
    queryKey: [`/api/quiz/${quizId}/ultra-personalization-elements`],
    enabled: open && !!quizId,
  });

  const detectedElements = elementsData?.elements || [];

  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      return apiRequest('POST', '/api/sms-campaigns', campaignData);
    },
    onSuccess: () => {
      toast({
        title: "Campanha criada com sucesso!",
        description: "Sua campanha ultra personalizada foi configurada.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sms-campaigns'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar campanha",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const addConditionalRule = (element: DetectedElement, option: any) => {
    const newRule: ConditionalRule = {
      fieldId: element.fieldId,
      fieldTitle: element.title,
      expectedValue: option.value,
      expectedLabel: option.label,
      message: `Olá! Identificamos que você se enquadra no perfil: ${option.label}. ${option.description}. Preparamos uma estratégia personalizada para você! 🎯`
    };
    setConditionalRules([...conditionalRules, newRule]);
  };

  const removeConditionalRule = (index: number) => {
    setConditionalRules(conditionalRules.filter((_, i) => i !== index));
  };

  const updateRuleMessage = (index: number, message: string) => {
    const updatedRules = [...conditionalRules];
    updatedRules[index].message = message;
    setConditionalRules(updatedRules);
  };

  const handleSubmit = () => {
    if (!campaignName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite um nome para sua campanha.",
        variant: "destructive",
      });
      return;
    }

    if (conditionalRules.length === 0) {
      toast({
        title: "Regras obrigatórias",
        description: "Adicione pelo menos uma regra condicional.",
        variant: "destructive",
      });
      return;
    }

    const campaignData = {
      name: campaignName,
      quizId,
      message: 'Mensagem personalizada baseada no perfil', // Placeholder
      campaignType: 'ultra_personalized',
      conditionalRules,
      triggerType: 'delayed',
      triggerDelay,
      triggerUnit,
      targetAudience: 'completed',
    };

    createCampaignMutation.mutate(campaignData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Campanha Ultra Personalizada
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5" />
                Quiz: {quizTitle}
              </CardTitle>
              <CardDescription>
                Crie campanhas que se adaptam automaticamente ao perfil de cada lead baseado nas respostas dele
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Configurações Básicas */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="campaignName">Nome da Campanha</Label>
              <Input
                id="campaignName"
                placeholder="Ex: Estratégias por Tipo de Corpo"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="triggerDelay">Delay de Envio</Label>
                <Input
                  id="triggerDelay"
                  type="number"
                  value={triggerDelay}
                  onChange={(e) => setTriggerDelay(parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="triggerUnit">Unidade</Label>
                <Select value={triggerUnit} onValueChange={setTriggerUnit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">Minutos</SelectItem>
                    <SelectItem value="hours">Horas</SelectItem>
                    <SelectItem value="days">Dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Elementos Detectados */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Elementos Detectados no Quiz
            </h3>
            
            {detectedElements.length === 0 ? (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <p className="text-orange-800">
                    ⚠️ Nenhum elemento de ultra personalização encontrado neste quiz.
                    Adicione elementos como "Classificador de Tipo de Corpo", "Faixa Etária", etc. no editor do quiz.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {detectedElements.map((element, index) => (
                  <Card key={index} className="border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        {element.title}
                      </CardTitle>
                      <CardDescription>{element.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        Opções disponíveis para criar regras:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {element.options.map((option, optIndex) => (
                          <Button
                            key={optIndex}
                            variant="outline"
                            size="sm"
                            onClick={() => addConditionalRule(element, option)}
                            className="h-auto p-2 hover:bg-blue-50"
                          >
                            <div className="text-center">
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-gray-500">{option.description}</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Regras Condicionais Configuradas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ArrowRight className="w-5 h-5" />
              Regras Configuradas ({conditionalRules.length})
            </h3>
            
            {conditionalRules.map((rule, index) => (
              <Card key={index} className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">SE</Badge>
                      <span>{rule.fieldTitle}</span>
                      <Badge variant="outline">é</Badge>
                      <span className="text-blue-600">{rule.expectedLabel}</span>
                      <Badge variant="secondary">ENTÃO</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeConditionalRule(index)}
                    >
                      ✕
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Label htmlFor={`message-${index}`}>Mensagem personalizada:</Label>
                  <Textarea
                    id={`message-${index}`}
                    value={rule.message}
                    onChange={(e) => updateRuleMessage(index, e.target.value)}
                    className="mt-2"
                    rows={3}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createCampaignMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {createCampaignMutation.isPending ? 'Criando...' : 'Criar Campanha'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}