import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  Copy, 
  ExternalLink, 
  BarChart3, 
  TrendingUp, 
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  DollarSign,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Quiz {
  id: string;
  title: string;
  status: 'active' | 'paused' | 'draft';
  views: number;
  leads: number;
  conversions: number;
  revenue: number;
  url: string;
  createdAt: string;
  niche: string;
}

export default function SeusAfiliados() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Buscar quizzes do usuário
  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ["/api/quizzes/user"],
    retry: false,
  });

  const filteredQuizzes = quizzes.filter((quiz: Quiz) => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.niche.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || quiz.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const copyQuizUrl = (url: string, title: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL Copiada!",
      description: `A URL do quiz "${title}" foi copiada para a área de transferência.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'paused': return 'Pausado';
      case 'draft': return 'Rascunho';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-green-600" />
            Seus Quizzes
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie todos os seus quizzes e acompanhe o desempenho
          </p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Criar Novo Quiz
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome ou nicho..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="paused">Pausados</option>
            <option value="draft">Rascunhos</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Quizzes</p>
                <p className="text-2xl font-bold text-gray-900">{quizzes.length}</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Leads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {quizzes.reduce((sum: number, quiz: Quiz) => sum + quiz.leads, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Visualizações</p>
                <p className="text-2xl font-bold text-gray-900">
                  {quizzes.reduce((sum: number, quiz: Quiz) => sum + quiz.views, 0)}
                </p>
              </div>
              <Eye className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {quizzes.reduce((sum: number, quiz: Quiz) => sum + quiz.revenue, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Quizzes */}
      {filteredQuizzes.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {quizzes.length === 0 ? "Nenhum quiz encontrado" : "Nenhum quiz corresponde aos filtros"}
            </h3>
            <p className="text-gray-600 mb-4">
              {quizzes.length === 0 
                ? "Crie seu primeiro quiz com I.A. para começar a gerar leads e vendas."
                : "Tente ajustar os filtros de busca para encontrar seus quizzes."
              }
            </p>
            {quizzes.length === 0 && (
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Quiz
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz: Quiz) => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-gray-900 mb-1">
                      {quiz.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mb-2">{quiz.niche}</p>
                    <Badge className={getStatusColor(quiz.status)}>
                      {getStatusText(quiz.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Métricas */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Visualizações:</span>
                    <span className="font-semibold">{quiz.views}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Leads:</span>
                    <span className="font-semibold">{quiz.leads}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Conversões:</span>
                    <span className="font-semibold">{quiz.conversions}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Receita:</span>
                    <span className="font-semibold">R$ {quiz.revenue}</span>
                  </div>
                </div>

                {/* Taxa de Conversão */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Taxa de Conversão</span>
                    <span className="font-semibold">
                      {quiz.views > 0 ? ((quiz.conversions / quiz.views) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ 
                        width: `${quiz.views > 0 ? (quiz.conversions / quiz.views) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(quiz.url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Ver Quiz
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyQuizUrl(quiz.url, quiz.title)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Data de criação */}
                <p className="text-xs text-gray-500 text-center">
                  Criado em {new Date(quiz.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}