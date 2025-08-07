import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Calendar, Clock, Send, Plus, Edit3, Trash2, 
  Instagram, Facebook, Twitter, Linkedin, Youtube,
  Image, Video, FileText, Hash, AtSign,
  TrendingUp, Users, Eye, Heart, MessageCircle,
  CheckCircle, AlertTriangle, Pause, Play
} from "lucide-react";
import { format, addDays, addHours, addMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function SchedulePosts() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [postContent, setPostContent] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoHashtags, setAutoHashtags] = useState(false);
  const { toast } = useToast();

  const platforms = [
    { 
      id: "instagram", 
      name: "Instagram", 
      icon: Instagram, 
      color: "text-pink-500 border-pink-500",
      available: true,
      features: ["image", "video", "story", "reel"]
    },
    { 
      id: "facebook", 
      name: "Facebook", 
      icon: Facebook, 
      color: "text-blue-600 border-blue-600",
      available: true,
      features: ["text", "image", "video", "link"]
    },
    { 
      id: "twitter", 
      name: "Twitter/X", 
      icon: Twitter, 
      color: "text-gray-800 border-gray-800",
      available: true,
      features: ["text", "image", "video", "thread"]
    },
    { 
      id: "linkedin", 
      name: "LinkedIn", 
      icon: Linkedin, 
      color: "text-blue-700 border-blue-700",
      available: true,
      features: ["text", "image", "article", "document"]
    },
    { 
      id: "youtube", 
      name: "YouTube", 
      icon: Youtube, 
      color: "text-red-600 border-red-600",
      available: false,
      features: ["video", "short", "community"]
    }
  ];

  const quickScheduleOptions = [
    { id: "now", label: "Agora", offset: 0 },
    { id: "15min", label: "15 minutos", offset: 15 },
    { id: "1hour", label: "1 hora", offset: 60 },
    { id: "4hours", label: "4 horas", offset: 240 },
    { id: "tomorrow", label: "Amanhã 9h", offset: "tomorrow" },
    { id: "custom", label: "Personalizado", offset: "custom" }
  ];

  const bestTimes = {
    instagram: ["09:00", "12:00", "19:00", "21:00"],
    facebook: ["10:00", "15:00", "20:00"],
    twitter: ["08:00", "12:00", "17:00", "19:00"],
    linkedin: ["08:00", "12:00", "17:00"]
  };

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const generateHashtags = async () => {
    if (!postContent.trim()) {
      toast({
        title: "Conteúdo obrigatório",
        description: "Digite o conteúdo da postagem para gerar hashtags automáticas.",
        variant: "destructive"
      });
      return;
    }

    // Simular geração de hashtags com IA
    const suggestedHashtags = [
      "#marketing", "#digitalmarketing", "#socialmedia",
      "#content", "#engagement", "#growth", "#business",
      "#strategy", "#brand", "#success"
    ];

    const randomHashtags = suggestedHashtags
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 5) + 3)
      .join(" ");

    setHashtags(prev => prev ? `${prev} ${randomHashtags}` : randomHashtags);
    
    toast({
      title: "✅ Hashtags geradas!",
      description: "Hashtags relevantes foram adicionadas automaticamente."
    });
  };

  const schedulePost = async () => {
    if (!postContent.trim()) {
      toast({
        title: "Conteúdo obrigatório",
        description: "Digite o conteúdo da postagem.",
        variant: "destructive"
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "Plataforma obrigatória",
        description: "Selecione pelo menos uma plataforma.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedDate) {
      toast({
        title: "Data obrigatória",
        description: "Selecione uma data para o agendamento.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Simular agendamento
      await new Promise(resolve => setTimeout(resolve, 1500));

      const [hours, minutes] = selectedTime.split(":").map(Number);
      const scheduledDateTime = new Date(selectedDate);
      scheduledDateTime.setHours(hours, minutes, 0, 0);

      const newPost = {
        id: Date.now().toString(),
        title: postTitle || "Postagem sem título",
        content: postContent,
        hashtags: hashtags,
        platforms: selectedPlatforms,
        scheduledFor: scheduledDateTime.toISOString(),
        status: "scheduled",
        createdAt: new Date().toISOString(),
        mediaCount: mediaFiles.length
      };

      setScheduledPosts(prev => [newPost, ...prev]);

      toast({
        title: "✅ Postagem agendada!",
        description: `Será publicada em ${selectedPlatforms.length} plataforma(s) em ${format(scheduledDateTime, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}.`
      });

      // Limpar formulário
      setPostContent("");
      setPostTitle("");
      setHashtags("");
      setSelectedPlatforms([]);
      setMediaFiles([]);
      setSelectedDate(undefined);

    } catch (error) {
      toast({
        title: "Erro no agendamento",
        description: "Não foi possível agendar a postagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { color: "bg-blue-500", text: "Agendado", icon: Clock },
      publishing: { color: "bg-yellow-500", text: "Publicando", icon: Send },
      published: { color: "bg-green-500", text: "Publicado", icon: CheckCircle },
      failed: { color: "bg-red-500", text: "Falhou", icon: AlertTriangle },
      paused: { color: "bg-gray-500", text: "Pausado", icon: Pause }
    };
    
    return statusConfig[status] || statusConfig.scheduled;
  };

  const quickSchedule = (option: any) => {
    const now = new Date();
    
    if (option.id === "custom") {
      return;
    }
    
    if (option.offset === "tomorrow") {
      const tomorrow = addDays(now, 1);
      tomorrow.setHours(9, 0, 0, 0);
      setSelectedDate(tomorrow);
      setSelectedTime("09:00");
    } else if (option.offset === 0) {
      setSelectedDate(now);
      setSelectedTime(format(now, "HH:mm"));
    } else {
      const scheduled = addMinutes(now, option.offset);
      setSelectedDate(scheduled);
      setSelectedTime(format(scheduled, "HH:mm"));
    }
    
    toast({
      title: "⏰ Horário definido",
      description: `Postagem agendada para ${option.label.toLowerCase()}.`
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Agendar Postagens
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Publique automaticamente em múltiplas redes sociais no horário ideal
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Agendar Post
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Agendados ({scheduledPosts.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Agendar Postagem */}
          <TabsContent value="schedule" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Formulário Principal */}
              <div className="md:col-span-2 space-y-6">
                {/* Conteúdo da Postagem */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Edit3 className="w-5 h-5" />
                      Conteúdo da Postagem
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="post-title">Título (opcional)</Label>
                      <Input
                        id="post-title"
                        placeholder="Título da sua postagem..."
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="post-content">Conteúdo *</Label>
                      <Textarea
                        id="post-content"
                        placeholder="O que você quer compartilhar hoje?"
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        rows={6}
                        className="resize-none"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {postContent.length}/2200 caracteres
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="hashtags">Hashtags</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={generateHashtags}
                          className="text-xs"
                        >
                          <Hash className="w-3 h-3 mr-1" />
                          Gerar IA
                        </Button>
                      </div>
                      <Textarea
                        id="hashtags"
                        placeholder="#marketing #socialmedia #content"
                        value={hashtags}
                        onChange={(e) => setHashtags(e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label>Mídias (em desenvolvimento)</Label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                        <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          Arraste imagens ou vídeos aqui
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Suporte: JPG, PNG, MP4, GIF (máx. 50MB)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Seleção de Plataformas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Plataformas de Publicação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {platforms.map((platform) => {
                        const IconComponent = platform.icon;
                        const isSelected = selectedPlatforms.includes(platform.id);
                        
                        return (
                          <div
                            key={platform.id}
                            className={cn(
                              "border-2 rounded-lg p-4 cursor-pointer transition-all",
                              isSelected ? platform.color : "border-gray-200 dark:border-gray-700",
                              !platform.available && "opacity-50 cursor-not-allowed"
                            )}
                            onClick={() => platform.available && handlePlatformToggle(platform.id)}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <IconComponent className={cn(
                                "w-8 h-8",
                                isSelected ? platform.color.split(" ")[0] : "text-gray-400"
                              )} />
                              <span className={cn(
                                "font-medium text-sm",
                                isSelected && "text-primary"
                              )}>
                                {platform.name}
                              </span>
                              {!platform.available && (
                                <Badge variant="secondary" className="text-xs">
                                  Em Breve
                                </Badge>
                              )}
                              {isSelected && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar de Agendamento */}
              <div className="space-y-6">
                {/* Agendamento Rápido */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Agendamento Rápido
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {quickScheduleOptions.map((option) => (
                        <Button
                          key={option.id}
                          variant="outline"
                          size="sm"
                          onClick={() => quickSchedule(option)}
                          className="text-xs"
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Data e Hora */}
                <Card>
                  <CardHeader>
                    <CardTitle>Data e Hora</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Data</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {selectedDate ? (
                              format(selectedDate, "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              "Selecionar data"
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) =>
                              date < new Date() || date < addDays(new Date(), -1)
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label htmlFor="time">Horário</Label>
                      <Input
                        id="time"
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                      />
                    </div>

                    {selectedPlatforms.length > 0 && (
                      <div className="text-xs text-gray-500 space-y-1">
                        <p className="font-medium">💡 Melhores horários:</p>
                        {selectedPlatforms.map((platformId) => {
                          const platform = platforms.find(p => p.id === platformId);
                          const times = bestTimes[platformId] || [];
                          return (
                            <div key={platformId} className="flex justify-between">
                              <span>{platform?.name}:</span>
                              <span>{times.join(", ")}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Resumo e Ação */}
                <Card>
                  <CardHeader>
                    <CardTitle>Resumo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Plataformas:</span>
                        <span className="font-medium">{selectedPlatforms.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Caracteres:</span>
                        <span className="font-medium">{postContent.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Hashtags:</span>
                        <span className="font-medium">
                          {hashtags.split("#").length - 1}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mídias:</span>
                        <span className="font-medium">{mediaFiles.length}</span>
                      </div>
                      {selectedDate && (
                        <div className="flex justify-between">
                          <span>Data:</span>
                          <span className="font-medium">
                            {format(selectedDate, "dd/MM", { locale: ptBR })}
                          </span>
                        </div>
                      )}
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={schedulePost}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Agendando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Agendar Postagem
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Postagens Agendadas */}
          <TabsContent value="scheduled">
            <Card>
              <CardHeader>
                <CardTitle>Postagens Agendadas</CardTitle>
              </CardHeader>
              <CardContent>
                {scheduledPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma postagem agendada</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {scheduledPosts.map((post) => {
                      const status = getStatusBadge(post.status);
                      const StatusIcon = status.icon;
                      
                      return (
                        <div key={post.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium">{post.title}</h3>
                                <Badge className={`${status.color} text-white`}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {status.text}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {post.content}
                              </p>
                              {post.hashtags && (
                                <p className="text-xs text-blue-500 mb-2">
                                  {post.hashtags}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 ml-4">
                              <Button variant="ghost" size="sm">
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {post.platforms.map((platformId) => {
                                const platform = platforms.find(p => p.id === platformId);
                                const IconComponent = platform?.icon || MessageCircle;
                                return (
                                  <div key={platformId} className="flex items-center gap-1">
                                    <IconComponent className={`w-4 h-4 ${platform?.color.split(" ")[0]}`} />
                                  </div>
                                );
                              })}
                            </div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(post.scheduledFor), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Posts Agendados</p>
                      <p className="text-2xl font-bold">{scheduledPosts.length}</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Posts Publicados</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Engajamento Médio</p>
                      <p className="text-2xl font-bold">-</p>
                    </div>
                    <Heart className="w-8 h-8 text-pink-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Alcance Total</p>
                      <p className="text-2xl font-bold">-</p>
                    </div>
                    <Users className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance por Plataforma</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Analytics detalhados aparecerão aqui após as primeiras publicações</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}