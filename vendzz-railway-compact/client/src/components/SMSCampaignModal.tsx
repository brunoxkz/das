import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, ArrowLeft, Send, MessageSquare, AlertCircle, CheckCircle, Calendar, Users, Target, Phone } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface SMSCampaignModalProps {
  children: React.ReactNode;
  onCampaignCreated?: () => void;
}

export default function SMSCampaignModal({ children, onCampaignCreated }: SMSCampaignModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignData, setCampaignData] = useState({
    name: '',
    message: '',
    quizId: '',
    targetAudience: 'completed',
    triggerType: 'immediate',
    triggerDelay: 0,
    triggerUnit: 'minutes',
    campaignType: 'standard'
  });
  const [isCreating, setIsCreating] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar quizzes do usuário
  const { data: quizzes = [] } = useQuery({
    queryKey: ['/api/quizzes'],
    enabled: isOpen
  });

  // Buscar créditos do usuário
  const { data: userCredits } = useQuery({
    queryKey: ['/api/user/credits'],
    enabled: isOpen
  });

  const smsCredits = userCredits?.breakdown?.sms || 0;

  const createCampaignMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/sms-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Campanha Criada",
        description: "Sua campanha de SMS foi criada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sms-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/credits'] });
      if (onCampaignCreated) onCampaignCreated();
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar campanha",
        variant: "destructive",
      });
    }
  });

  const handleClose = () => {
    setIsOpen(false);
    setCurrentStep(1);
    setCampaignData({
      name: '',
      message: '',
      quizId: '',
      targetAudience: 'completed',
      triggerType: 'immediate',
      triggerDelay: 0,
      triggerUnit: 'minutes',
      campaignType: 'standard'
    });
    setIsCreating(false);
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return campaignData.name.trim() !== '';
      case 2:
        return campaignData.message.trim() !== '';
      case 3:
        return campaignData.quizId !== '';
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleCreateCampaign = async () => {
    // Validar créditos antes de criar
    if (smsCredits <= 0) {
      toast({
        title: "Créditos Insuficientes",
        description: `Você precisa de pelo menos 1 crédito de SMS para publicar uma campanha. Créditos atuais: ${smsCredits}`,
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      await createCampaignMutation.mutateAsync(campaignData);
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="campaign-name">Nome da Campanha</Label>
              <Input
                id="campaign-name"
                placeholder="Ex: Campanha de Follow-up"
                value={campaignData.name}
                onChange={(e) => setCampaignData({...campaignData, name: e.target.value})}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="campaign-message">Mensagem SMS</Label>
              <Textarea
                id="campaign-message"
                placeholder="Olá {nome}! Obrigado por participar do nosso quiz. Aqui está sua oferta especial..."
                value={campaignData.message}
                onChange={(e) => setCampaignData({...campaignData, message: e.target.value})}
                rows={4}
              />
            </div>
            <div className="text-sm text-gray-600">
              <p>Dica: Use variáveis como {'{nome}'}, {'{telefone}'} para personalizar a mensagem.</p>
              <p>Limite: 160 caracteres por SMS.</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="quiz-select">Selecione o Quiz</Label>
              <Select value={campaignData.quizId} onValueChange={(value) => setCampaignData({...campaignData, quizId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um quiz" />
                </SelectTrigger>
                <SelectContent>
                  {quizzes.map((quiz: any) => (
                    <SelectItem key={quiz.id} value={quiz.id}>
                      {quiz.title} {quiz.isPublished ? '(Publicado)' : '(Rascunho)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="target-audience">Audiência Alvo</Label>
              <Select value={campaignData.targetAudience} onValueChange={(value) => setCampaignData({...campaignData, targetAudience: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Quizzes Completos</SelectItem>
                  <SelectItem value="abandoned">Quizzes Abandonados</SelectItem>
                  <SelectItem value="all">Todos os Leads</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="trigger-type">Tipo de Envio</Label>
              <Select value={campaignData.triggerType} onValueChange={(value) => setCampaignData({...campaignData, triggerType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Imediato</SelectItem>
                  <SelectItem value="delayed">Programado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {campaignData.triggerType === 'delayed' && (
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Delay"
                  value={campaignData.triggerDelay}
                  onChange={(e) => setCampaignData({...campaignData, triggerDelay: parseInt(e.target.value) || 0})}
                />
                <Select value={campaignData.triggerUnit} onValueChange={(value) => setCampaignData({...campaignData, triggerUnit: value})}>
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
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Criar Campanha de SMS
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step <= currentStep ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="min-h-[200px]">
            {renderStep()}
          </div>

          {/* Credits Warning */}
          {smsCredits <= 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800 font-medium">Créditos Insuficientes</span>
              </div>
              <p className="text-red-700 text-sm mt-1">
                Você precisa de pelo menos 1 crédito de SMS para publicar uma campanha. Créditos atuais: {smsCredits}
              </p>
            </div>
          )}

          {/* Credits Info */}
          {smsCredits > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">Créditos Disponíveis: {smsCredits}</span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Você pode criar e publicar esta campanha.
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            
            {currentStep < 4 ? (
              <Button 
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceedToNext()}
              >
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleCreateCampaign}
                disabled={isCreating || smsCredits <= 0}
                className="bg-green-600 hover:bg-green-700"
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Criar Campanha
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}