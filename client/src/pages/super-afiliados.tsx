import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth-jwt";
import { queryClient } from "@/lib/queryClient";
import { 
  Crown, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Copy, 
  ExternalLink, 
  BarChart3,
  Target,
  Settings,
  CheckCircle
} from "lucide-react";

interface SuperAffiliateQuiz {
  id: string;
  title: string;
  description: string;
  affiliateUrl: string;
  totalViews: number;
  totalLeads: number;
  conversionRate: number;
  commissionRate: number;
  isAffiliated: boolean;
  affiliateCode?: string;
}

interface AffiliateStats {
  totalViews: number;
  totalLeads: number;
  totalSales: number;
  totalCommission: number;
  conversionRate: number;
}

export default function SuperAfiliadosPage() {
  const { user } = useAuth();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("quizzes");

  // Buscar quizzes de Super Afiliados
  const { data: superQuizzes, isLoading: isLoadingQuizzes } = useQuery({
    queryKey: ["/api/super-affiliates/quizzes"],
  });

  // Buscar estatísticas do usuário
  const { data: affiliateStats } = useQuery<AffiliateStats>({
    queryKey: ["/api/super-affiliates/stats"],
  });

  // Buscar afiliações do usuário
  const { data: myAffiliations } = useQuery({
    queryKey: ["/api/super-affiliates/my-affiliations"],
  });

  // Mutação para se afiliar
  const affiliateMutation = useMutation({
    mutationFn: async (quizId: string) => {
      const response = await fetch("/api/super-affiliates/affiliate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId }),
      });
      if (!response.ok) throw new Error("Erro ao se afiliar");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-affiliates"] });
    },
  });

  const handleAffiliate = async (quizId: string) => {
    try {
      await affiliateMutation.mutateAsync(quizId);
    } catch (error) {
      console.error("Erro ao se afiliar:", error);
    }
  };

  const copyAffiliateLink = (code: string) => {
    const link = `${window.location.origin}/quiz/aff-${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const quizzes: SuperAffiliateQuiz[] = superQuizzes || [];
  const stats: AffiliateStats = affiliateStats || {
    totalViews: 0,
    totalLeads: 0,
    totalSales: 0,
    totalCommission: 0,
    conversionRate: 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Super Afiliados
              </h1>
              <p className="text-gray-600">
                Ganhe comissões promovendo nossos quizzes exclusivos
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            👑 Programa Exclusivo
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Visualizações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
              <p className="text-blue-100 text-sm">Total de visualizações</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeads.toLocaleString()}</div>
              <p className="text-green-100 text-sm">Leads gerados</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4" />
                Conversão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
              <p className="text-purple-100 text-sm">Taxa de conversão</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Comissões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.totalCommission.toFixed(2)}</div>
              <p className="text-orange-100 text-sm">Total em comissões</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quizzes">Quizzes Disponíveis</TabsTrigger>
            <TabsTrigger value="my-affiliations">Minhas Afiliações</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="quizzes" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoadingQuizzes ? (
                <div className="col-span-full text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Carregando quizzes...</p>
                </div>
              ) : quizzes.length > 0 ? (
                quizzes.map((quiz) => (
                  <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{quiz.title}</CardTitle>
                          <p className="text-gray-600 text-sm mt-1">{quiz.description}</p>
                        </div>
                        <Badge 
                          variant={quiz.isAffiliated ? "default" : "secondary"}
                          className={quiz.isAffiliated ? "bg-green-100 text-green-800" : ""}
                        >
                          {quiz.isAffiliated ? "Afiliado" : "Disponível"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">{quiz.totalViews}</div>
                          <div className="text-gray-600">Views</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600">{quiz.totalLeads}</div>
                          <div className="text-gray-600">Leads</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-purple-600">{quiz.conversionRate.toFixed(1)}%</div>
                          <div className="text-gray-600">Conversão</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-yellow-600" />
                          <span className="font-medium">Comissão: {(quiz.commissionRate * 100).toFixed(0)}%</span>
                        </div>
                        <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                          Premium
                        </Badge>
                      </div>

                      {quiz.isAffiliated ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-700">Você está afiliado!</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input 
                              type="text" 
                              value={`${window.location.origin}/quiz/aff-${quiz.affiliateCode}`}
                              readOnly
                              className="flex-1 px-3 py-2 text-sm bg-gray-50 border rounded-md"
                            />
                            <Button
                              size="sm"
                              onClick={() => copyAffiliateLink(quiz.affiliateCode!)}
                              className="flex-shrink-0"
                            >
                              {copiedCode === quiz.affiliateCode ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleAffiliate(quiz.id)}
                          disabled={affiliateMutation.isPending}
                          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                        >
                          {affiliateMutation.isPending ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Afiliando...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Crown className="w-4 h-4" />
                              Quero me Afiliar
                            </div>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum quiz disponível no momento</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="my-affiliations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Minhas Afiliações Ativas</CardTitle>
              </CardHeader>
              <CardContent>
                {myAffiliations && myAffiliations.length > 0 ? (
                  <div className="space-y-4">
                    {myAffiliations.map((affiliation: any) => (
                      <div key={affiliation.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{affiliation.quizTitle}</h4>
                          <p className="text-sm text-gray-600">Código: {affiliation.affiliateCode}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">R$ {affiliation.totalCommission.toFixed(2)}</div>
                          <div className="text-xs text-gray-600">{affiliation.totalLeads} leads</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Você ainda não possui afiliações ativas</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Afiliado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Método de Pagamento</label>
                    <select className="w-full mt-1 px-3 py-2 border rounded-md">
                      <option>PIX</option>
                      <option>Transferência Bancária</option>
                      <option>PayPal</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Dados para Pagamento</label>
                    <textarea 
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      rows={3}
                      placeholder="Insira seus dados para recebimento das comissões"
                    />
                  </div>
                  
                  <Button className="w-full">
                    Salvar Configurações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}