import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { 
  PlusCircle, 
  BarChart3, 
  Users, 
  MessageSquare, 
  Mail,
  Phone,
  Bot,
  TrendingUp,
  Eye,
  MousePointer,
  Calendar,
  Clock,
  Target,
  Award,
  Zap
} from "lucide-react";

export default function Dashboard() {
  // Buscar dados do usuário
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  // Buscar estatísticas dos quizzes
  const { data: quizStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  // Buscar quizzes recentes
  const { data: recentQuizzes, isLoading: quizzesLoading } = useQuery({
    queryKey: ["/api/quizzes"],
  });

  // Buscar créditos
  const { data: credits } = useQuery({
    queryKey: ["/api/credits"],
  });

  // Tipos seguros
  interface Quiz {
    id: string;
    title: string;
    status: string;
    created_at: string;
  }

  interface Stats {
    totalQuizzes: number;
    totalResponses: number;
    totalViews: number;
    conversionRate: number;
    thisWeekQuizzes: number;
    thisWeekResponses: number;
    thisWeekViews: number;
  }

  interface Credits {
    sms: number;
    email: number;
    whatsapp: number;
    ia: number;
  }

  const safeCredits: Credits = credits || { sms: 0, email: 0, whatsapp: 0, ia: 0 };
  const safeStats: Stats = quizStats || { 
    totalQuizzes: 0, 
    totalResponses: 0, 
    totalViews: 0, 
    conversionRate: 0,
    thisWeekQuizzes: 0,
    thisWeekResponses: 0,
    thisWeekViews: 0
  };
  const safeQuizzes: Quiz[] = recentQuizzes || [];

  if (userLoading || statsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Olá, {userData?.name || userData?.email || 'Usuário'}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo ao seu painel de controle Vendzz
          </p>
        </div>
        <Link href="/quiz-builder">
          <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
            <PlusCircle className="w-4 h-4 mr-2" />
            Criar Quiz
          </Button>
        </Link>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Quizzes</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.totalQuizzes}</div>
            <p className="text-xs text-muted-foreground">
              +{safeStats.thisWeekQuizzes} esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{safeStats.thisWeekViews} esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Respostas</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.totalResponses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{safeStats.thisWeekResponses} esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Taxa média de conclusão
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Créditos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Seus Créditos
          </CardTitle>
          <CardDescription>
            Acompanhe seus créditos disponíveis para campanhas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">SMS</p>
                <p className="text-lg font-bold">{safeCredits.sms}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Mail className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-lg font-bold">{safeCredits.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Phone className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">WhatsApp</p>
                <p className="text-lg font-bold">{safeCredits.whatsapp}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Bot className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">I.A.</p>
                <p className="text-lg font-bold">{safeCredits.ia}</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/credits">
              <Button variant="outline" size="sm">
                Gerenciar Créditos
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recent">Quizzes Recentes</TabsTrigger>
          <TabsTrigger value="actions">Ações Rápidas</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seus Quizzes Recentes</CardTitle>
              <CardDescription>
                Os quizzes que você criou recentemente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {quizzesLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : safeQuizzes.length > 0 ? (
                <div className="space-y-4">
                  {safeQuizzes.slice(0, 5).map((quiz: Quiz) => (
                    <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{quiz.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Criado em {new Date(quiz.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {quiz.status === 'published' ? 'Publicado' : 'Rascunho'}
                        </Badge>
                        <Link href={`/quiz-builder?id=${quiz.id}`}>
                          <Button size="sm" variant="outline">
                            Editar
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Você ainda não criou nenhum quiz
                  </p>
                  <Link href="/quiz-builder">
                    <Button>
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Criar Primeiro Quiz
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quiz I.A.</CardTitle>
                <CardDescription>
                  Crie quizzes usando inteligência artificial
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/quiz-ia-simple">
                  <Button className="w-full">
                    <Bot className="w-4 h-4 mr-2" />
                    Criar com I.A.
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Analytics</CardTitle>
                <CardDescription>
                  Veja estatísticas detalhadas dos seus quizzes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/analytics">
                  <Button className="w-full" variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Ver Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Campanhas</CardTitle>
                <CardDescription>
                  Gerencie suas campanhas de marketing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link href="/sms-campaigns">
                    <Button className="w-full" variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      SMS
                    </Button>
                  </Link>
                  <Link href="/email-marketing">
                    <Button className="w-full" variant="outline" size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}