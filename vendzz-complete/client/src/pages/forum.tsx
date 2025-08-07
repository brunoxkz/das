import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, MessageSquare, Plus, Search, Filter, Bookmark,
  ThumbsUp, ThumbsDown, MessageCircle, Eye, Clock,
  Pin, Lock, Trash2, Edit3, Flag, Share2, 
  Star, Trophy, Crown, Zap, Heart, Award,
  TrendingUp, Calendar, User, Settings, Shield
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ForumPost {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorBadge?: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  dislikes: number;
  replies: number;
  isPinned: boolean;
  isLocked: boolean;
  tags: string[];
  status: "active" | "closed" | "resolved";
}

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  topicCount: number;
  memberCount: number;
  moderators: string[];
  isRestricted: boolean;
  createdAt: number;
}

export default function Forum() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterBy, setFilterBy] = useState("all");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    categoryId: "",
    tags: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar categorias do fórum
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/forum/categories"],
    retry: false,
  });

  // Buscar tópicos recentes do fórum
  const { data: recentTopics = [], isLoading: topicsLoading } = useQuery({
    queryKey: ["/api/forum/recent"],
    retry: false,
  });

  // Buscar estatísticas do fórum
  const { data: forumStats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/forum/stats"],
    retry: false,
  });

  // Mutation para criar novo tópico
  const createTopicMutation = useMutation({
    mutationFn: async (topicData: any) => {
      const response = await apiRequest('POST', '/api/forum/topics', topicData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Tópico criado com sucesso",
      });
      setShowCreatePost(false);
      setNewPost({ title: "", content: "", categoryId: "", tags: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/forum/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/forum/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar tópico",
        variant: "destructive",
      });
    },
  });

  const handleCreatePost = () => {
    if (!newPost.title || !newPost.content || !newPost.categoryId) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const tags = newPost.tags ? newPost.tags.split(',').map(tag => tag.trim()) : [];
    
    createTopicMutation.mutate({
      title: newPost.title,
      content: newPost.content,
      categoryId: newPost.categoryId,
      tags: tags
    });
  };

  const formatDate = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch {
      return "há alguns momentos";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header do Fórum */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Fórum da Comunidade
            </h1>
            <p className="text-gray-400">
              Conecte-se, compartilhe conhecimento e cresça junto com nossa comunidade
            </p>
          </div>
          <Button 
            onClick={() => setShowCreatePost(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Discussão
          </Button>
        </div>

        {/* Estatísticas do Fórum */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400">Total de Tópicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {statsLoading ? "..." : forumStats.totalTopics || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400">Total de Respostas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {statsLoading ? "..." : forumStats.totalReplies || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400">Visualizações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {statsLoading ? "..." : forumStats.totalViews || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400">Total de Curtidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {statsLoading ? "..." : forumStats.totalLikes || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar - Categorias */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Categorias</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "ghost"}
                  onClick={() => setSelectedCategory("all")}
                  className="w-full justify-start text-left text-white hover:bg-gray-800"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Todas as Discussões
                </Button>
                
                {categoriesLoading ? (
                  <div className="text-gray-400 text-sm">Carregando categorias...</div>
                ) : (
                  categories.map((category: ForumCategory) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "ghost"}
                      onClick={() => setSelectedCategory(category.id)}
                      className="w-full justify-start text-left text-white hover:bg-gray-800"
                    >
                      <span className="w-4 h-4 mr-2">{category.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium">{category.name}</div>
                        <div className="text-xs text-gray-400">
                          {category.topicCount} tópicos
                        </div>
                      </div>
                    </Button>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Conteúdo Principal */}
          <div className="lg:col-span-9">
            {/* Filtros e Busca */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Buscar discussões..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px] bg-gray-900 border-gray-700 text-white">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="recent">Mais Recentes</SelectItem>
                  <SelectItem value="popular">Mais Populares</SelectItem>
                  <SelectItem value="oldest">Mais Antigos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Lista de Tópicos */}
            <div className="space-y-4">
              {topicsLoading ? (
                <div className="text-center py-8 text-gray-400">
                  Carregando discussões...
                </div>
              ) : recentTopics.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  Nenhuma discussão encontrada. Seja o primeiro a iniciar uma conversa!
                </div>
              ) : (
                recentTopics.map((topic: any) => (
                  <Card key={topic.id} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-white hover:text-green-400 cursor-pointer">
                              {topic.title}
                            </h3>
                            {topic.isPinned && (
                              <Pin className="w-4 h-4 text-yellow-500" />
                            )}
                            {topic.isLocked && (
                              <Lock className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          
                          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                            {topic.content.slice(0, 150)}...
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {topic.author?.firstName} {topic.author?.lastName}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(topic.createdAt)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {topic.views}
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              {topic.replyCount || 0}
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="w-4 h-4" />
                              {topic.likes}
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                            {topic.category?.name}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal para Criar Novo Tópico */}
        {showCreatePost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-4">Criar Nova Discussão</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Título *
                  </label>
                  <Input
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="Digite o título da discussão"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Categoria *
                  </label>
                  <Select 
                    value={newPost.categoryId} 
                    onValueChange={(value) => setNewPost({ ...newPost, categoryId: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      {categories.map((category: ForumCategory) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Conteúdo *
                  </label>
                  <Textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="Escreva o conteúdo da sua discussão..."
                    rows={6}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Tags (separadas por vírgula)
                  </label>
                  <Input
                    value={newPost.tags}
                    onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                    placeholder="quiz, marketing, conversão"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowCreatePost(false)}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreatePost}
                  disabled={createTopicMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {createTopicMutation.isPending ? "Criando..." : "Criar Discussão"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}