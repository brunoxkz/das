import { useQuery } from "@tanstack/react-query";
import { CheckCircle, XCircle, Clock, Mail, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";

interface EmailCampaignLogsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: {
    id: string;
    name: string;
    subject: string;
  };
}

export function EmailCampaignLogs({ open, onOpenChange, campaign }: EmailCampaignLogsProps) {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['/api/email-campaigns', campaign.id, 'logs'],
    queryFn: () => apiRequest(`/api/email-campaigns/${campaign.id}/logs`),
    enabled: open && !!campaign.id
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent':
        return 'Enviado';
      case 'delivered':
        return 'Entregue';
      case 'failed':
        return 'Falhou';
      case 'pending':
        return 'Pendente';
      case 'scheduled':
        return 'Agendado';
      default:
        return status;
    }
  };

  const getStats = () => {
    const total = logs.length;
    const sent = logs.filter((log: any) => log.status === 'sent').length;
    const delivered = logs.filter((log: any) => log.status === 'delivered').length;
    const failed = logs.filter((log: any) => log.status === 'failed').length;
    const pending = logs.filter((log: any) => log.status === 'pending').length;
    const scheduled = logs.filter((log: any) => log.status === 'scheduled').length;

    return { total, sent, delivered, failed, pending, scheduled };
  };

  const stats = getStats();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Logs da Campanha: {campaign.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
                <div className="text-sm text-gray-600">Enviados</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-700">{stats.delivered}</div>
                <div className="text-sm text-gray-600">Entregues</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                <div className="text-sm text-gray-600">Falhas</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pendentes</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
                <div className="text-sm text-gray-600">Agendados</div>
              </CardContent>
            </Card>
          </div>

          {/* Success Rate */}
          {stats.total > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Taxa de Sucesso</span>
                  <span className="text-2xl font-bold text-green-600">
                    {(((stats.sent + stats.delivered) / stats.total) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${((stats.sent + stats.delivered) / stats.total) * 100}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Logs List */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Envios</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                  </div>
                ) : logs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum log encontrado para esta campanha
                  </div>
                ) : (
                  <div className="space-y-3">
                    {logs.map((log: any) => (
                      <div 
                        key={log.id} 
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(log.status)}
                          <div>
                            <div className="font-medium">{log.recipientEmail}</div>
                            <div className="text-sm text-gray-600">
                              {formatDate(log.createdAt)}
                              {log.scheduledAt && (
                                <span className="ml-2 text-blue-600">
                                  (Agendado para {formatDate(log.scheduledAt)})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(log.status)}>
                            {getStatusText(log.status)}
                          </Badge>
                          {log.messageId && (
                            <span className="text-xs text-gray-500">
                              ID: {log.messageId}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}