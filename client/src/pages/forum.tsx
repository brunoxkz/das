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
  icon: any;
  color: string;
  postCount: number;
  lastPostAt?: string;
  moderators: string[];
  isRestricted: boolean;
}

export default function Forum() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterBy, setFilterBy] = useState("all");
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    categoryId: "",
    tags: ""
  });
  const { toast } = useToast();

  // Categorias do fórum
  const forumCategories: ForumCategory[] = [
    {
      id: "marketing",
      name: "Marketing Digital",
      description: "Estratégias, dicas e discussões sobre marketing digital",
      icon: TrendingUp,
      color: "text-blue-500 border-blue-500 bg-blue-50",
      postCount: 142,
      lastPostAt: "2025-01-20T10:30:00Z",
      moderators: ["admin"],
      isRestricted: false
    },
    {
      id: "automation",
      name: "Automações",
      description: "WhatsApp, SMS, Email e outras automações",
      icon: Zap,
      color: "text-purple-500 border-purple-500 bg-purple-50",
      postCount: 89,
      lastPostAt: "2025-01-20T09:15:00Z",
      moderators: ["admin"],
      isRestricted: false
    },
    {
      id: "quiz-builder",
      name: "Quiz Builder",
      description: "Criação de quizzes, elementos e funcionalidades",
      icon: MessageSquare,
      color: "text-green-500 border-green-500 bg-green-50",
      postCount: 67,
      lastPostAt: "2025-01-20T08:45:00Z",
      moderators: ["admin"],
      isRestricted: false
    },
    {
      id: "payments",
      name: "Pagamentos & Checkout",
      description: "Stripe, Pagar.me e sistemas de pagamento",
      icon: Trophy,
      color: "text-yellow-500 border-yellow-500 bg-yellow-50",
      postCount: 34,
      lastPostAt: "2025-01-20T07:20:00Z",
      moderators: ["admin"],
      isRestricted: false
    },
    {
      id: "support",
      name: "Suporte Técnico",
      description: "Problemas, bugs e solicitações de ajuda",
      icon: Settings,
      color: "text-red-500 border-red-500 bg-red-50",
      postCount: 156,
      lastPostAt: "2025-01-20T11:00:00Z",
      moderators: ["admin", "support"],
      isRestricted: false
    },
    {
      id: "announcements",
      name: "Anúncios",
      description: "Atualizações oficiais e novidades da plataforma",
      icon: Crown,
      color: "text-indigo-500 border-indigo-500 bg-indigo-50",
      postCount: 23,
      lastPostAt: "2025-01-20T06:00:00Z",
      moderators: ["admin"],
      isRestricted: true
    },
    {
      id: "community",
      name: "Comunidade",
      description: "Discussões gerais e networking",
      icon: Users,
      color: "text-pink-500 border-pink-500 bg-pink-50",
      postCount: 298,
      lastPostAt: "2025-01-20T10:45:00Z",
      moderators: ["admin", "moderator1"],
      isRestricted: false
    },
    {
      id: "feedback",
      name: "Feedback & Ideias",
      description: "Sugestões de melhorias e novas funcionalidades",
      icon: Star,
      color: "text-orange-500 border-orange-500 bg-orange-50",
      postCount: 87,
      lastPostAt: "2025-01-20T09:30:00Z",
      moderators: ["admin"],
      isRestricted: false
    }
  ];

  // Posts de exemplo
  const examplePosts: ForumPost[] = [
    {
      id: "1",
      title: "Como configurar webhook do Stripe corretamente?",
      content: "Estou com dificuldades para configurar o webhook do Stripe para receber notificações de pagamento. Alguém pode me ajudar com o processo completo?",
      categoryId: "payments",
      authorId: "user1",
      authorName: "João Silva",
      authorBadge: "Premium",
      createdAt: "2025-01-20T10:30:00Z",
      updatedAt: "2025-01-20T10:30:00Z",
      views: 45,
      likes: 12,
      dislikes: 1,
      replies: 8,
      isPinned: false,
      isLocked: false,
      tags: ["stripe", "webhook", "pagamento"],
      status: "active"
    },
    {
      id: "2",
      title: "📍 FIXADO: Regras da Comunidade e Boas Práticas",
      content: "Este tópico contém as regras oficiais da comunidade e diretrizes para uma boa convivência. Leia antes de postar!",
      categoryId: "announcements",
      authorId: "admin",
      authorName: "Equipe Vendzz",
      authorBadge: "Admin",
      createdAt: "2025-01-15T00:00:00Z",
      updatedAt: "2025-01-20T00:00:00Z",
      views: 892,
      likes: 156,
      dislikes: 3,
      replies: 23,
      isPinned: true,
      isLocked: false,
      tags: ["regras", "comunidade", "importante"],
      status: "active"
    },
    {
      id: "3",
      title: "Integração WhatsApp Business API - Guia Completo",
      content: "Compartilho aqui um guia completo de como integrar a API oficial do WhatsApp Business com a plataforma Vendzz...",
      categoryId: "automation",
      authorId: "user2",
      authorName: "Maria Santos",
      authorBadge: "Expert",
      createdAt: "2025-01-19T15:20:00Z",
      updatedAt: "2025-01-19T15:20:00Z",
      views: 234,
      likes: 78,
      dislikes: 2,
      replies: 34,
      isPinned: false,
      isLocked: false,
      tags: ["whatsapp", "api", "tutorial"],
      status: "resolved"
    },
    {
      id: "4",
      title: "Dúvida sobre elementos personalizados no Quiz Builder",
      content: "Como posso criar elementos personalizados além dos que já existem na plataforma?",
      categoryId: "quiz-builder",
      authorId: "user3",
      authorName: "Pedro Costa",
      createdAt: "2025-01-20T09:15:00Z",
      updatedAt: "2025-01-20T09:15:00Z",
      views: 67,
      likes: 15,
      dislikes: 0,
      replies: 12,
      isPinned: false,
      isLocked: false,
      tags: ["quiz", "elementos", "customização"],
      status: "active"
    },
    {
      id: "5",
      title: "💡 Sugestão: Sistema de Templates Compartilhados",
      content: "Seria interessante ter um sistema onde os usuários pudessem compartilhar templates de quiz entre si...",
      categoryId: "feedback",
      authorId: "user4",
      authorName: "Ana Lima",
      createdAt: "2025-01-20T08:45:00Z",
      updatedAt: "2025-01-20T08:45:00Z",
      views: 123,
      likes: 45,
      dislikes: 3,
      replies: 19,
      isPinned: false,
      isLocked: false,
      tags: ["sugestão", "templates", "compartilhamento"],
      status: "active"
    }
  ];

  useEffect(() => {
    setCategories(forumCategories);
    setPosts(examplePosts);
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === "all" || post.categoryId === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterBy === "all" ||
                         (filterBy === "pinned" && post.isPinned) ||
                         (filterBy === "resolved" && post.status === "resolved") ||
                         (filterBy === "active" && post.status === "active");
    
    return matchesCategory && matchesSearch && matchesFilter;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    switch (sortBy) {
      case "recent":
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case "popular":
        return (b.likes + b.replies) - (a.likes + a.replies);
      case "views":
        return b.views - a.views;
      case "replies":
        return b.replies - a.replies;
      default:
        return 0;
    }
  });

  const createPost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim() || !newPost.categoryId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha título, conteúdo e categoria.",
        variant: "destructive"
      });
      return;
    }

    const post: ForumPost = {
      id: Date.now().toString(),
      title: newPost.title,
      content: newPost.content,
      categoryId: newPost.categoryId,
      authorId: "current-user",
      authorName: "Você",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      likes: 0,
      dislikes: 0,
      replies: 0,
      isPinned: false,
      isLocked: false,
      tags: newPost.tags.split(",").map(tag => tag.trim()).filter(Boolean),
      status: "active"
    };

    setPosts(prev => [post, ...prev]);
    setNewPost({ title: "", content: "", categoryId: "", tags: "" });
    setShowCreatePost(false);

    toast({
      title: "✅ Post criado!",
      description: "Seu tópico foi criado com sucesso."
    });
  };

  const getBadgeColor = (badge?: string) => {
    const badgeColors = {
      "Admin": "bg-red-500 text-white",
      "Moderator": "bg-blue-500 text-white", 
      "Expert": "bg-purple-500 text-white",
      "Premium": "bg-yellow-500 text-black",
      "VIP": "bg-indigo-500 text-white"
    };
    
    return badgeColors[badge] || "bg-gray-500 text-white";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <Badge className="bg-green-500 text-white">✓ Resolvido</Badge>;
      case "closed":
        return <Badge className="bg-gray-500 text-white">Fechado</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Fórum da Comunidade
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Conecte-se, aprenda e compartilhe conhecimentos com outros usuários
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar com Categorias */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Novo Tópico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => setShowCreatePost(!showCreatePost)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Tópico
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Categorias</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "ghost"}
                  className="w-full justify-between"
                  onClick={() => setSelectedCategory("all")}
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Todos os Tópicos
                  </span>
                  <Badge variant="secondary">{posts.length}</Badge>
                </Button>
                
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  const categoryPosts = posts.filter(p => p.categoryId === category.id);
                  
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "ghost"}
                      className="w-full justify-between text-left h-auto py-3"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <div className="flex items-start gap-2">
                        <IconComponent className={`w-4 h-4 ${category.color.split(" ")[0]} mt-0.5`} />
                        <div className="text-left">
                          <div className="font-medium">{category.name}</div>
                          <div className="text-xs text-gray-500 line-clamp-1">
                            {category.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {categoryPosts.length}
                        </Badge>
                        {category.isRestricted && (
                          <Lock className="w-3 h-3 text-yellow-500" />
                        )}
                      </div>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total de tópicos:</span>
                  <Badge>{posts.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Membros online:</span>
                  <Badge className="bg-green-500 text-white">127</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total de respostas:</span>
                  <Badge>{posts.reduce((acc, post) => acc + post.replies, 0)}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tópicos hoje:</span>
                  <Badge className="bg-blue-500 text-white">8</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conteúdo Principal */}
          <div className="lg:col-span-3">
            {/* Formulário de Criação */}
            {showCreatePost && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Criar Novo Tópico</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Input
                      placeholder="Título do tópico..."
                      value={newPost.title}
                      onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Select value={newPost.categoryId} onValueChange={(value) => setNewPost(prev => ({ ...prev, categoryId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Textarea
                      placeholder="Descreva seu tópico em detalhes..."
                      value={newPost.content}
                      onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                      rows={6}
                    />
                  </div>

                  <div>
                    <Input
                      placeholder="Tags (separadas por vírgula): exemplo, tutorial, dúvida"
                      value={newPost.tags}
                      onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={createPost}>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Tópico
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filtros e Busca */}
            <Card className="mb-6">
              <CardContent className="py-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Buscar tópicos, tags ou conteúdo..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Mais Recentes</SelectItem>
                        <SelectItem value="popular">Mais Populares</SelectItem>
                        <SelectItem value="views">Mais Visualizados</SelectItem>
                        <SelectItem value="replies">Mais Comentários</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterBy} onValueChange={setFilterBy}>
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="pinned">Fixados</SelectItem>
                        <SelectItem value="resolved">Resolvidos</SelectItem>
                        <SelectItem value="active">Ativos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Posts */}
            <div className="space-y-4">
              {sortedPosts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {searchQuery ? "Nenhum tópico encontrado com os filtros aplicados" : "Nenhum tópico nesta categoria ainda"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                sortedPosts.map((post) => {
                  const category = categories.find(c => c.categoryId === post.categoryId);
                  const CategoryIcon = category?.icon || MessageSquare;
                  
                  return (
                    <Card key={post.id} className={cn(
                      "hover:shadow-md transition-shadow cursor-pointer",
                      post.isPinned && "border-yellow-300 bg-yellow-50/50"
                    )}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Avatar do autor */}
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={post.authorAvatar} />
                            <AvatarFallback className="bg-purple-100 text-purple-600">
                              {post.authorName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>

                          {/* Conteúdo do post */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {post.isPinned && (
                                    <Pin className="w-4 h-4 text-yellow-500" />
                                  )}
                                  {post.isLocked && (
                                    <Lock className="w-4 h-4 text-gray-500" />
                                  )}
                                  <h3 className="font-semibold text-lg line-clamp-2 hover:text-blue-600">
                                    {post.title}
                                  </h3>
                                </div>
                                
                                <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                                  {post.content}
                                </p>

                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    <span className="font-medium">{post.authorName}</span>
                                    {post.authorBadge && (
                                      <Badge className={`text-xs px-1 py-0 ${getBadgeColor(post.authorBadge)}`}>
                                        {post.authorBadge}
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>
                                      {formatDistanceToNow(new Date(post.createdAt), { 
                                        addSuffix: true, 
                                        locale: ptBR 
                                      })}
                                    </span>
                                  </div>

                                  {category && (
                                    <div className="flex items-center gap-1">
                                      <CategoryIcon className={`w-3 h-3 ${category.color.split(" ")[0]}`} />
                                      <span>{category.name}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Tags */}
                                {post.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {post.tags.map((tag, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        #{tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="ml-4 text-right">
                                {getStatusIcon(post.status)}
                              </div>
                            </div>

                            {/* Estatísticas do post */}
                            <div className="flex items-center justify-between pt-3 border-t">
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Eye className="w-4 h-4" />
                                  <span>{post.views}</span>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <ThumbsUp className="w-4 h-4" />
                                  <span>{post.likes}</span>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="w-4 h-4" />
                                  <span>{post.replies} respostas</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm">
                                  <ThumbsUp className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Bookmark className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Share2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            {/* Paginação */}
            {sortedPosts.length > 0 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Anterior
                  </Button>
                  <Badge className="bg-blue-500 text-white">1</Badge>
                  <Button variant="outline" size="sm">
                    2
                  </Button>
                  <Button variant="outline" size="sm">
                    3
                  </Button>
                  <Button variant="outline" size="sm">
                    Próximo
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}