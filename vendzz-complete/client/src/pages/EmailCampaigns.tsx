import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Send, Edit, Trash2, Eye, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { CreateEmailCampaignDialog } from "@/components/CreateEmailCampaignDialog";
import { EmailCampaignLogs } from "@/components/EmailCampaignLogs";

interface EmailCampaign {
  id: string;
  name: string;
  quizId: string;
  subject: string;
  content: string;
  fromEmail: string;
  targetAudience: string;
  status: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function EmailCampaigns() {
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const queryClient = useQueryClient();

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['/api/email-campaigns'],
    queryFn: () => apiRequest('/api/email-campaigns')
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/email-campaigns/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns'] });
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'draft': return 'Rascunho';
      case 'scheduled': return 'Agendada';
      case 'completed': return 'Concluída';
      default: return status;
    }
  };

  const getAudienceText = (audience: string) => {
    switch (audience) {
      case 'completed': return 'Quizzes Completos';
      case 'abandoned': return 'Quizzes Abandonados';
      case 'all': return 'Todos os Leads';
      default: return audience;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campanhas de Email</h1>
          <p className="text-gray-600 mt-2">Gerencie suas campanhas de email marketing</p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      <div className="grid gap-6">
        {campaigns.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Send className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma campanha encontrada</h3>
              <p className="text-gray-600 text-center mb-4">
                Crie sua primeira campanha de email para começar a converter leads
              </p>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Campanha
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {campaigns.map((campaign: EmailCampaign) => (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{campaign.name}</CardTitle>
                      <Badge className={getStatusColor(campaign.status)}>
                        {getStatusText(campaign.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          setShowLogs(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          setShowCreateDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteCampaignMutation.mutate(campaign.id)}
                        disabled={deleteCampaignMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Assunto</p>
                      <p className="font-medium">{campaign.subject}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Público-alvo</p>
                      <p className="font-medium">{getAudienceText(campaign.targetAudience)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email de Origem</p>
                      <p className="font-medium">{campaign.fromEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Criado em</p>
                      <p className="font-medium">{formatDate(campaign.createdAt)}</p>
                    </div>
                  </div>
                  {campaign.scheduledAt && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-md flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-800">
                        Agendado para: {formatDate(campaign.scheduledAt)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showCreateDialog && (
        <CreateEmailCampaignDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          campaign={selectedCampaign}
          onSuccess={() => {
            setShowCreateDialog(false);
            setSelectedCampaign(null);
            queryClient.invalidateQueries({ queryKey: ['/api/email-campaigns'] });
          }}
        />
      )}

      {showLogs && selectedCampaign && (
        <EmailCampaignLogs
          open={showLogs}
          onOpenChange={setShowLogs}
          campaign={selectedCampaign}
        />
      )}
    </div>
  );
}