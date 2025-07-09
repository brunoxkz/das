import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Send, Users, Clock, Mail, FileText, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const emailCampaignSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  quizId: z.string().min(1, "Quiz é obrigatório"),
  subject: z.string().min(1, "Assunto é obrigatório"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  fromEmail: z.string().email("Email inválido"),
  targetAudience: z.enum(["all", "completed", "abandoned"]),
  triggerType: z.enum(["immediate", "delayed", "scheduled"]),
  triggerDelay: z.number().min(1).default(10),
  triggerUnit: z.enum(["minutes", "hours", "days"]).default("minutes"),
  scheduledDateTime: z.string().optional()
});

type EmailCampaignForm = z.infer<typeof emailCampaignSchema>;

interface CreateEmailCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign?: any;
  onSuccess: () => void;
}

export function CreateEmailCampaignDialog({ 
  open, 
  onOpenChange, 
  campaign, 
  onSuccess 
}: CreateEmailCampaignDialogProps) {
  const [selectedQuiz, setSelectedQuiz] = useState<string>("");
  const [emailPreview, setEmailPreview] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("basic");
  const { toast } = useToast();

  const { data: quizzes = [] } = useQuery({
    queryKey: ['/api/quizzes'],
    queryFn: () => apiRequest('/api/quizzes')
  });

  const { data: emails = [] } = useQuery({
    queryKey: ['/api/quiz-emails', selectedQuiz],
    queryFn: () => apiRequest(`/api/quiz-emails/${selectedQuiz}?targetAudience=all`),
    enabled: !!selectedQuiz
  });

  const createCampaignMutation = useMutation({
    mutationFn: (data: EmailCampaignForm) => apiRequest('/api/email-campaigns', {
      method: 'POST',
      body: data
    }),
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Campanha de email criada com sucesso",
        variant: "default"
      });
      onSuccess();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar campanha",
        variant: "destructive"
      });
    }
  });

  const form = useForm<EmailCampaignForm>({
    resolver: zodResolver(emailCampaignSchema),
    defaultValues: {
      name: "",
      quizId: "",
      subject: "",
      content: "",
      fromEmail: "noreply@vendzz.com",
      targetAudience: "all",
      triggerType: "immediate",
      triggerDelay: 10,
      triggerUnit: "minutes"
    }
  });

  useEffect(() => {
    if (campaign) {
      form.reset(campaign);
      setSelectedQuiz(campaign.quizId);
    }
  }, [campaign, form]);

  const onSubmit = (data: EmailCampaignForm) => {
    createCampaignMutation.mutate(data);
  };

  const getAudienceText = (audience: string) => {
    switch (audience) {
      case 'completed': return 'Quizzes Completos';
      case 'abandoned': return 'Quizzes Abandonados';
      case 'all': return 'Todos os Leads';
      default: return audience;
    }
  };

  const getTriggerText = (trigger: string) => {
    switch (trigger) {
      case 'immediate': return 'Imediato';
      case 'delayed': return 'Com Delay';
      case 'scheduled': return 'Agendado';
      default: return trigger;
    }
  };

  const previewEmailPersonalization = (content: string) => {
    if (!emails.length) return content;
    
    const sampleLead = emails[0];
    return content
      .replace(/{nome}/g, sampleLead.nome || 'João')
      .replace(/{email}/g, sampleLead.email || 'joao@exemplo.com')
      .replace(/{telefone}/g, sampleLead.telefone || '11999999999')
      .replace(/{idade}/g, sampleLead.idade || '30')
      .replace(/{altura}/g, sampleLead.altura || '1.75')
      .replace(/{peso_atual}/g, sampleLead.peso_atual || '80')
      .replace(/{peso_objetivo}/g, sampleLead.peso_objetivo || '75');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {campaign ? 'Editar Campanha' : 'Nova Campanha de Email'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="audience">Público</TabsTrigger>
            <TabsTrigger value="schedule">Agendamento</TabsTrigger>
          </TabsList>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Informações Básicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome da Campanha</Label>
                      <Input
                        id="name"
                        placeholder="Ex: Boas-vindas novos leads"
                        {...form.register("name")}
                      />
                      {form.formState.errors.name && (
                        <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="subject">Assunto do Email</Label>
                      <Input
                        id="subject"
                        placeholder="Ex: Bem-vindo(a) ao programa!"
                        {...form.register("subject")}
                      />
                      {form.formState.errors.subject && (
                        <p className="text-sm text-red-500">{form.formState.errors.subject.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quizId">Quiz de Origem</Label>
                      <Select
                        value={form.watch("quizId")}
                        onValueChange={(value) => {
                          form.setValue("quizId", value);
                          setSelectedQuiz(value);
                        }}
                      >
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
                      {form.formState.errors.quizId && (
                        <p className="text-sm text-red-500">{form.formState.errors.quizId.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="fromEmail">Email de Origem</Label>
                      <Input
                        id="fromEmail"
                        type="email"
                        placeholder="Ex: noreply@vendzz.com"
                        {...form.register("fromEmail")}
                      />
                      {form.formState.errors.fromEmail && (
                        <p className="text-sm text-red-500">{form.formState.errors.fromEmail.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Conteúdo do Email
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="content">Conteúdo HTML</Label>
                    <Textarea
                      id="content"
                      rows={10}
                      placeholder="Digite o conteúdo do email em HTML..."
                      {...form.register("content")}
                    />
                    {form.formState.errors.content && (
                      <p className="text-sm text-red-500">{form.formState.errors.content.message}</p>
                    )}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Variáveis disponíveis:</strong> {`{nome}`}, {`{email}`}, {`{telefone}`}, {`{idade}`}, {`{altura}`}, {`{peso_atual}`}, {`{peso_objetivo}`}
                    </p>
                    <div className="bg-white p-3 rounded border">
                      <p className="text-sm font-medium mb-2">Preview com dados de exemplo:</p>
                      <div 
                        className="text-sm"
                        dangerouslySetInnerHTML={{ 
                          __html: previewEmailPersonalization(form.watch("content") || "") 
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audience" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Público-alvo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="targetAudience">Tipo de Audiência</Label>
                    <Select
                      value={form.watch("targetAudience")}
                      onValueChange={(value) => form.setValue("targetAudience", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o público-alvo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Leads</SelectItem>
                        <SelectItem value="completed">Quizzes Completos</SelectItem>
                        <SelectItem value="abandoned">Quizzes Abandonados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedQuiz && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Emails Encontrados</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Total de leads com email</p>
                          <p className="text-2xl font-bold text-blue-600">{emails.length}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Público selecionado</p>
                          <Badge className="mt-1">{getAudienceText(form.watch("targetAudience"))}</Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Agendamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="triggerType">Tipo de Envio</Label>
                    <Select
                      value={form.watch("triggerType")}
                      onValueChange={(value) => form.setValue("triggerType", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de envio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Imediato</SelectItem>
                        <SelectItem value="delayed">Com Delay</SelectItem>
                        <SelectItem value="scheduled">Agendado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {form.watch("triggerType") === "delayed" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="triggerDelay">Delay</Label>
                        <Input
                          id="triggerDelay"
                          type="number"
                          min="1"
                          {...form.register("triggerDelay", { valueAsNumber: true })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="triggerUnit">Unidade</Label>
                        <Select
                          value={form.watch("triggerUnit")}
                          onValueChange={(value) => form.setValue("triggerUnit", value as any)}
                        >
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
                  )}

                  {form.watch("triggerType") === "scheduled" && (
                    <div>
                      <Label htmlFor="scheduledDateTime">Data e Hora</Label>
                      <Input
                        id="scheduledDateTime"
                        type="datetime-local"
                        {...form.register("scheduledDateTime")}
                      />
                    </div>
                  )}

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Resumo do Agendamento</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Tipo:</strong> {getTriggerText(form.watch("triggerType"))}</p>
                      {form.watch("triggerType") === "delayed" && (
                        <p><strong>Delay:</strong> {form.watch("triggerDelay")} {form.watch("triggerUnit")}</p>
                      )}
                      {form.watch("triggerType") === "scheduled" && form.watch("scheduledDateTime") && (
                        <p><strong>Data:</strong> {new Date(form.watch("scheduledDateTime")!).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createCampaignMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {createCampaignMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Criando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {campaign ? 'Atualizar' : 'Criar'} Campanha
                  </>
                )}
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}