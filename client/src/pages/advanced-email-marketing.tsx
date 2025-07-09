import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  Send, 
  Calendar, 
  Users, 
  BarChart3, 
  TrendingUp,
  Eye,
  MousePointer,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Filter,
  Download,
  Sparkles,
  Target,
  Zap
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth-hybrid";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sent' | 'active';
  quizId: string;
  quizTitle: string;
  emailCount: number;
  sentCount: number;
  openRate: number;
  clickRate: number;
  createdAt: string;
  sentAt?: string;
  scheduledAt?: string;
}

interface EmailAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  bounceRate: number;
  unsubscribeRate: number;
  avgOpenRate: number;
  avgClickRate: number;
  topPerformingCampaigns: Array<{
    name: string;
    openRate: number;
    clickRate: number;
  }>;
  recentActivity: Array<{
    type: 'sent' | 'opened' | 'clicked';
    email: string;
    campaignName: string;
    timestamp: string;
  }>;
}

export default function AdvancedEmailMarketing() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("campaigns");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch email campaigns
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ["/api/email-campaigns"],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/email-campaigns", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Fetch email analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/email-analytics"],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/email-analytics", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Filter campaigns based on status and search
  const filteredCampaigns = campaigns.filter((campaign: EmailCampaign) => {
    const matchesStatus = filterStatus === "all" || campaign.status === filterStatus;
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Real-time stats calculations
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter((c: EmailCampaign) => c.status === 'active').length;
  const totalEmailsSent = campaigns.reduce((sum: number, c: EmailCampaign) => sum + (c.sentCount || 0), 0);
  const avgOpenRate = campaigns.length > 0 ? 
    Math.round(campaigns.reduce((sum: number, c: EmailCampaign) => sum + (c.openRate || 0), 0) / campaigns.length) : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'sent': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email Marketing Avançado</h1>
            <p className="text-gray-600">Campanhas inteligentes com analytics detalhados</p>
          </div>
          <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
            <Mail className="w-4 h-4 mr-2" />
            Nova Campanha
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Campanhas</p>
                  <p className="text-2xl font-bold text-blue-900">{totalCampaigns}</p>
                </div>
                <div className="bg-blue-500 p-3 rounded-full">
                  <Mail className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Campanhas Ativas</p>
                  <p className="text-2xl font-bold text-purple-900">{activeCampaigns}</p>
                </div>
                <div className="bg-purple-500 p-3 rounded-full">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Emails Enviados</p>
                  <p className="text-2xl font-bold text-green-900">{totalEmailsSent.toLocaleString()}</p>
                </div>
                <div className="bg-green-500 p-3 rounded-full">
                  <Send className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Taxa de Abertura</p>
                  <p className="text-2xl font-bold text-orange-900">{avgOpenRate}%</p>
                </div>
                <div className="bg-orange-500 p-3 rounded-full">
                  <Eye className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Buscar campanhas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="scheduled">Agendado</SelectItem>
                <SelectItem value="sent">Enviado</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campaigns List */}
          <div className="space-y-4">
            {campaignsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-green-500" />
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <Card className="p-12 text-center">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma campanha encontrada</h3>
                <p className="text-gray-600">Crie sua primeira campanha de email marketing.</p>
              </Card>
            ) : (
              filteredCampaigns.map((campaign: EmailCampaign) => (
                <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                          <Badge className={getStatusColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Assunto:</strong> {campaign.subject}
                        </p>
                        <p className="text-sm text-gray-600 mb-3">
                          <strong>Quiz:</strong> {campaign.quizTitle}
                        </p>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {campaign.emailCount} emails
                          </div>
                          <div className="flex items-center gap-1">
                            <Send className="w-4 h-4" />
                            {campaign.sentCount} enviados
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {campaign.openRate}% abertura
                          </div>
                          <div className="flex items-center gap-1">
                            <MousePointer className="w-4 h-4" />
                            {campaign.clickRate}% cliques
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-2">
                          Criado em {formatDate(campaign.createdAt)}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                          <Button size="sm" variant="outline">
                            <BarChart3 className="w-4 h-4 mr-1" />
                            Analytics
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {analyticsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Performance Geral
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Emails Enviados</span>
                      <span className="font-semibold">{analytics?.totalSent?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Taxa de Entrega</span>
                      <span className="font-semibold text-green-600">
                        {analytics?.totalSent > 0 ? 
                          Math.round((analytics?.totalDelivered / analytics?.totalSent) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Taxa de Abertura</span>
                      <span className="font-semibold text-blue-600">{analytics?.avgOpenRate || 0}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Taxa de Cliques</span>
                      <span className="font-semibold text-purple-600">{analytics?.avgClickRate || 0}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Campanhas Top
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics?.topPerformingCampaigns?.map((campaign, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{campaign.name}</p>
                          <p className="text-xs text-gray-600">
                            {campaign.openRate}% abertura • {campaign.clickRate}% cliques
                          </p>
                        </div>
                        <Badge variant="secondary">#{index + 1}</Badge>
                      </div>
                    )) || (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Nenhuma campanha encontrada
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Template cards would go here */}
            <Card className="p-6 text-center">
              <Sparkles className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Templates Inteligentes</h3>
              <p className="text-gray-600 mb-4">
                Biblioteca de templates otimizados para conversão
              </p>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                Explorar Templates
              </Button>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}