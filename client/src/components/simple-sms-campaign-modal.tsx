import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageSquare,
  Send,
  FileQuestion,
  Eye,
  Users,
  CheckCircle,
  Upload,
  Info,
  Smartphone
} from 'lucide-react';

export type CampaignStyle = 'remarketing' | 'remarketing_ultra_customizado' | 'ao_vivo_tempo_real' | 'ao_vivo_ultra_customizada' | 'disparo_massa';

interface SimpleSMSCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onCreateCampaign: (campaignData: any) => void;
  quizzes: any[];
  isCreating: boolean;
  selectedStyle?: CampaignStyle;
}

export function SimpleSMSCampaignModal({
  open,
  onClose,
  onCreateCampaign,
  quizzes,
  isCreating,
  selectedStyle: initialSelectedStyle
}: SimpleSMSCampaignModalProps) {
  const [campaignType, setCampaignType] = useState<'quiz' | 'massa'>('quiz');
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    message: '',
    quizId: '',
    targetAudience: 'completed' as 'completed' | 'abandoned' | 'all',
    contactsFile: null as File | null,
    contactsList: [] as Array<{phone?: string, email?: string, name?: string}>
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCampaignForm(prev => ({ ...prev, contactsFile: file }));

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      const contacts = lines.map(line => {
        const parts = line.split(',').map(part => part.trim());
        return {
          phone: parts[0] || '',
          name: parts[1] || '',
          email: parts[2] || ''
        };
      }).filter(contact => contact.phone);

      setCampaignForm(prev => ({ ...prev, contactsList: contacts }));
    };
    reader.readAsText(file);
  };

  const handleCreateCampaign = () => {
    if (!campaignForm.message) return;
    
    if (campaignType === 'massa') {
      if (campaignForm.contactsList.length === 0) return;
    } else {
      if (!campaignForm.quizId) return;
    }

    const selectedQuiz = quizzes.find(q => q.id === campaignForm.quizId);
    const finalName = campaignForm.name || (campaignType === 'massa' ? 'Campanha Disparo em Massa' : `Campanha ${selectedQuiz?.title || 'SMS'}`);

    onCreateCampaign({
      ...campaignForm,
      name: finalName,
      campaignType: campaignType === 'massa' ? 'disparo_massa' : 'ao_vivo_tempo_real'
    });
  };

  const resetForm = () => {
    setCampaignForm({
      name: '',
      message: '',
      quizId: '',
      targetAudience: 'completed',
      contactsFile: null,
      contactsList: []
    });
  };

  const handleTypeChange = (type: 'quiz' | 'massa') => {
    setCampaignType(type);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Nova Campanha SMS</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seletor de Tipo */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Tipo de Campanha</Label>
            <div className="grid grid-cols-2 gap-3">
              <Card 
                className={`cursor-pointer transition-all ${
                  campaignType === 'quiz' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleTypeChange('quiz')}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="w-5 h-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-sm">Baseada em Quiz</CardTitle>
                      <CardDescription className="text-xs">
                        Envia SMS para quem respondeu seu quiz
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${
                  campaignType === 'massa' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleTypeChange('massa')}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <Upload className="w-5 h-5 text-purple-600" />
                    <div>
                      <CardTitle className="text-sm">Disparo em Massa</CardTitle>
                      <CardDescription className="text-xs">
                        Envie para sua própria lista de contatos
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* Formulário */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Nome da Campanha</Label>
              <Input
                id="campaign-name"
                placeholder="Ex: Black Friday SMS"
                value={campaignForm.name}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            {/* Seleção de Quiz */}
            {campaignType === 'quiz' && (
              <div className="space-y-3">
                <Label>Selecionar Quiz</Label>
                <div className="grid gap-2 max-h-48 overflow-y-auto">
                  {quizzes.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <FileQuestion className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Nenhum quiz encontrado</p>
                    </div>
                  ) : (
                    quizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          campaignForm.quizId === quiz.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => setCampaignForm(prev => ({ ...prev, quizId: quiz.id }))}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{quiz.title}</h4>
                            <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                              <span className="flex items-center">
                                <Eye className="w-3 h-3 mr-1" />
                                {quiz.views || 0}
                              </span>
                              <span className="flex items-center">
                                <Users className="w-3 h-3 mr-1" />
                                {quiz.responses || 0}
                              </span>
                            </div>
                          </div>
                          {campaignForm.quizId === quiz.id && (
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {campaignType === 'quiz' && campaignForm.quizId && (
                  <div className="space-y-2">
                    <Label>Público-Alvo</Label>
                    <Select value={campaignForm.targetAudience} onValueChange={(value: any) => setCampaignForm(prev => ({ ...prev, targetAudience: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Quem completou o quiz</SelectItem>
                        <SelectItem value="abandoned">Quem abandonou o quiz</SelectItem>
                        <SelectItem value="all">Todos os leads</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            {/* Upload de Lista */}
            {campaignType === 'massa' && (
              <div className="space-y-3">
                <Label>Lista de Contatos</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <Input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="mb-2"
                  />
                  <p className="text-xs text-gray-500 mb-1">
                    Formatos: CSV, TXT
                  </p>
                  <p className="text-xs text-gray-400">
                    Formato: telefone,nome,email
                  </p>
                </div>
                {campaignForm.contactsList.length > 0 && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      ✅ {campaignForm.contactsList.length} contatos carregados
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="message">Mensagem SMS</Label>
              <Textarea
                id="message"
                placeholder="Digite sua mensagem..."
                value={campaignForm.message}
                onChange={(e) => setCampaignForm(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
              />
              <p className="text-xs text-gray-500">
                Use: {'{nome_completo}'}, {'{telefone_contato}'}, {'{email_contato}'}
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateCampaign}
              disabled={
                !campaignForm.message || 
                isCreating ||
                (campaignType === 'massa' ? campaignForm.contactsList.length === 0 : !campaignForm.quizId)
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Criando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Criar Campanha
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}