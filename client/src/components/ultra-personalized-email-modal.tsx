import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, ArrowRight, Users, Target, Calendar, Clock, Mail, Plus, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface UltraPersonalizedEmailModalProps {
  open: boolean;
  onClose: () => void;
  quizId: string;
  quizTitle: string;
}

interface ConditionalRule {
  fieldId: string;
  fieldTitle: string;
  fieldType: string;
  messages: { [key: string]: string };
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

export function UltraPersonalizedEmailModal({ open, onClose, quizId, quizTitle }: UltraPersonalizedEmailModalProps) {
  const [campaignName, setCampaignName] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
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
      return apiRequest('POST', '/api/email-campaigns', campaignData);
    },
    onSuccess: () => {
      toast({
        title: "Campanha de email criada com sucesso!",
        description: "Sua campanha ultra personalizada foi configurada.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns'] });
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

  const addConditionalRule = (element: DetectedElement) => {
    const newRule: ConditionalRule = {
      fieldId: element.fieldId,
      fieldTitle: element.title,
      fieldType: element.type,
      messages: {}
    };
    
    // Pré-popular com opções do elemento
    element.options.forEach(option => {
      newRule.messages[option.value] = '';
    });
    
    setConditionalRules(prev => [...prev, newRule]);
  };

  const removeConditionalRule = (index: number) => {
    setConditionalRules(prev => prev.filter((_, i) => i !== index));
  };

  const updateRuleMessage = (ruleIndex: number, optionValue: string, message: string) => {
    setConditionalRules(prev => 
      prev.map((rule, i) => 
        i === ruleIndex 
          ? { ...rule, messages: { ...rule.messages, [optionValue]: message } }
          : rule
      )
    );
  };

  const handleSubmit = () => {
    if (!campaignName || !subject || !content) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, assunto e conteúdo da campanha.",
        variant: "destructive",
      });
      return;
    }

    if (conditionalRules.length === 0) {
      toast({
        title: "Adicione regras de personalização",
        description: "Crie ao menos uma regra condicional.",
        variant: "destructive",
      });
      return;
    }

    // Validar se todas as mensagens foram preenchidas
    const hasEmptyMessages = conditionalRules.some(rule => 
      Object.values(rule.messages).some(msg => !msg.trim())
    );

    if (hasEmptyMessages) {
      toast({
        title: "Mensagens incompletas",
        description: "Preencha todas as mensagens personalizadas.",
        variant: "destructive",
      });
      return;
    }

    const campaignData = {
      name: campaignName,
      subject: subject,
      content: content,
      quizId: quizId,
      targetAudience: 'all',
      triggerType: 'delayed',
      triggerDelay: triggerDelay,
      triggerUnit: triggerUnit,
      campaignType: 'ultra_personalized',
      conditionalRules: conditionalRules
    };

    createCampaignMutation.mutate(campaignData);
  };

  const resetForm = () => {
    setCampaignName('');
    setSubject('');
    setContent('');
    setConditionalRules([]);
    setTriggerDelay(10);
    setTriggerUnit('minutes');
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            Campanha Ultra Personalizada - Email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações da campanha */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Configuração da Campanha
              </CardTitle>
              <CardDescription>
                Quiz selecionado: <Badge variant="secondary">{quizTitle}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="campaignName">Nome da Campanha *</Label>
                  <Input
                    id="campaignName"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Ex: Campanha Idade Personalizada"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Assunto do Email *</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ex: Oferta especial para você, {nome_completo}!"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="content">Conteúdo Base do Email *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Olá {nome_completo}! Temos uma oferta especial baseada no seu perfil..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="triggerDelay">Delay de Envio</Label>
                  <Input
                    id="triggerDelay"
                    type="number"
                    value={triggerDelay}
                    onChange={(e) => setTriggerDelay(Number(e.target.value))}
                    min="1"
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
            </CardContent>
          </Card>

          {/* Elementos detectados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Elementos Detectados para Personalização
              </CardTitle>
              <CardDescription>
                Elementos do quiz que podem ser usados para personalizar emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {detectedElements.map((element) => (
                  <div key={element.fieldId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{element.title}</div>
                      <div className="text-sm text-gray-600">{element.description}</div>
                      <div className="flex gap-1 mt-2">
                        {element.options.map((option) => (
                          <Badge key={option.value} variant="outline" className="text-xs">
                            {option.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={() => addConditionalRule(element)}
                      size="sm"
                      variant="outline"
                      className="ml-3"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar Regra
                    </Button>
                  </div>
                ))}
              </div>

              {detectedElements.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum elemento de personalização encontrado no quiz</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Regras condicionais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="w-5 h-5" />
                Regras Condicionais "SE {'>'}  ENTÃO"
              </CardTitle>
              <CardDescription>
                Configure mensagens personalizadas baseadas nas respostas dos usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conditionalRules.map((rule, ruleIndex) => (
                  <div key={ruleIndex} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">
                        SE {rule.fieldTitle} = [valor] ENTÃO enviar email personalizado
                      </h4>
                      <Button
                        onClick={() => removeConditionalRule(ruleIndex)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {Object.entries(rule.messages).map(([optionValue, message]) => {
                        const element = detectedElements.find(e => e.fieldId === rule.fieldId);
                        const option = element?.options.find(o => o.value === optionValue);
                        
                        return (
                          <div key={optionValue} className="space-y-2">
                            <Label className="text-sm font-medium">
                              SE resposta for: "{option?.label || optionValue}"
                            </Label>
                            <Textarea
                              value={message}
                              onChange={(e) => updateRuleMessage(ruleIndex, optionValue, e.target.value)}
                              placeholder={`Email personalizado para quem respondeu "${option?.label || optionValue}"`}
                              rows={3}
                              className="text-sm"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {conditionalRules.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <ArrowRight className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma regra condicional configurada</p>
                  <p className="text-sm">Adicione elementos acima para criar regras</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botões de ação */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createCampaignMutation.isPending}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              {createCampaignMutation.isPending ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Criar Campanha Ultra Personalizada
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}