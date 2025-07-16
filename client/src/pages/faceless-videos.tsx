import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Video, 
  Download, 
  Sparkles, 
  Clock, 
  TrendingUp, 
  Play, 
  Pause, 
  RotateCcw, 
  Coins,
  Zap,
  Star,
  Target,
  Users,
  Eye,
  Heart,
  Share2,
  Upload,
  Mic,
  Image,
  Film,
  Wand2,
  Rocket,
  Crown,
  Gift,
  CheckCircle,
  AlertCircle,
  X
} from "lucide-react";

interface VideoProject {
  id: string;
  title: string;
  topic: string;
  duration: number;
  style: string;
  voice: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  progress: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  createdAt: number;
  generationTime?: number;
  estimatedTime?: number;
  views?: number;
  likes?: number;
  shares?: number;
}

interface UserCredits {
  videoCredits: number;
  aiCredits: number;
  totalCredits: number;
}

export default function FacelessVideosPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState(30);
  const [style, setStyle] = useState("viral");
  const [voice, setVoice] = useState("masculina");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentProject, setCurrentProject] = useState<VideoProject | null>(null);

  // Função para download de vídeo
  const downloadVideo = async (videoId: string, title: string) => {
    try {
      const response = await fetch(`/api/faceless-videos/download/${videoId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Erro no download');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}-viral-video.mp4`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download iniciado!",
        description: "O vídeo está sendo baixado.",
      });
    } catch (error) {
      console.error('Erro no download:', error);
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o vídeo.",
        variant: "destructive",
      });
    }
  };

  // Buscar projetos de vídeo
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["/api/faceless-videos/projects"],
    refetchInterval: 30000, // Atualiza a cada 30 segundos (reduzido loop)
    retry: 1,
    retryDelay: 1000,
  });

  // Buscar créditos do usuário
  const { data: credits } = useQuery<UserCredits>({
    queryKey: ["/api/faceless-videos/credits"],
    refetchInterval: 60000, // Atualiza a cada 60 segundos
    retry: 1,
    retryDelay: 1000,
  });

  // Mutação para criar vídeo
  const createVideoMutation = useMutation({
    mutationFn: async (videoData: {
      title: string;
      topic: string;
      duration: number;
      style: string;
      voice: string;
    }) => {
      try {
        const response = await apiRequest("POST", "/api/faceless-videos/generate", videoData);
        return response;
      } catch (error) {
        console.error('Erro na mutação:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Vídeo em processamento!",
        description: "Seu vídeo viral está sendo gerado. Aguarde...",
      });
      setCurrentProject(data.project);
      setIsGenerating(true);
      setGenerationProgress(0);
      
      // Resetar formulário
      setTitle("");
      setTopic("");
      setDuration(30);
      setStyle("viral");
      setVoice("masculina");
      
      // Atualizar créditos
      queryClient.invalidateQueries({ queryKey: ["/api/faceless-videos/credits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/faceless-videos/projects"] });
    },
    onError: (error: any) => {
      console.error('Erro na criação do vídeo:', error);
      toast({
        title: "Erro ao gerar vídeo",
        description: error?.message || "Ocorreu um erro ao processar seu vídeo",
        variant: "destructive",
      });
    },
  });

  // Simulação de progresso de geração
  useEffect(() => {
    if (isGenerating && currentProject) {
      const interval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 100) {
            setIsGenerating(false);
            setCurrentProject(null);
            queryClient.invalidateQueries({ queryKey: ["/api/faceless-videos/projects"] });
            toast({
              title: "Vídeo concluído!",
              description: "Seu vídeo viral está pronto para download!",
            });
            return 100;
          }
          return prev + Math.random() * 15; // Progresso variável
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isGenerating, currentProject, queryClient, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !topic) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o título e o tópico do vídeo",
        variant: "destructive",
      });
      return;
    }

    if (!credits || credits.videoCredits < 1) {
      toast({
        title: "Créditos insuficientes",
        description: "Você precisa de pelo menos 1 crédito de vídeo para gerar um vídeo",
        variant: "destructive",
      });
      return;
    }

    createVideoMutation.mutate({
      title,
      topic,
      duration,
      style,
      voice,
    });
  };



  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStyleIcon = (style: string) => {
    switch (style) {
      case 'viral': return <TrendingUp className="w-4 h-4" />;
      case 'educational': return <Target className="w-4 h-4" />;
      case 'entertainment': return <Heart className="w-4 h-4" />;
      case 'motivational': return <Zap className="w-4 h-4" />;
      default: return <Video className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'generating': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
              <Video className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Vídeos Faceless
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Gere vídeos virais automaticamente com IA avançada
          </p>
        </div>

        {/* Créditos */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5" />
                Créditos de Vídeo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{credits?.videoCredits || 0}</div>
              <p className="text-green-100">Disponíveis</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Créditos IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{credits?.aiCredits || 0}</div>
              <p className="text-blue-100">Disponíveis</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Total de Créditos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{credits?.totalCredits || 0}</div>
              <p className="text-purple-100">Disponíveis</p>
            </CardContent>
          </Card>
        </div>

        {/* Formulário de Geração */}
        <Card className="mb-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-600" />
              Gerar Vídeo Viral
            </CardTitle>
            <CardDescription>
              Preencha os dados para gerar um vídeo faceless automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Vídeo</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: 3 Segredos para Ganhar Dinheiro Online"
                    className="bg-white/90 dark:bg-gray-800/90"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duração (segundos)</Label>
                  <Select value={duration.toString()} onValueChange={(value) => setDuration(Number(value))}>
                    <SelectTrigger className="bg-white/90 dark:bg-gray-800/90">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 segundos</SelectItem>
                      <SelectItem value="30">30 segundos</SelectItem>
                      <SelectItem value="60">1 minuto</SelectItem>
                      <SelectItem value="120">2 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Tópico/Nicho</Label>
                <Textarea
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Descreva o tópico do seu vídeo: marketing digital, fitness, receitas, motivação, etc."
                  className="bg-white/90 dark:bg-gray-800/90"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="style">Estilo do Vídeo</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger className="bg-white/90 dark:bg-gray-800/90">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viral">🔥 Viral (TikTok/Instagram)</SelectItem>
                      <SelectItem value="educational">🎓 Educacional</SelectItem>
                      <SelectItem value="entertainment">🎭 Entretenimento</SelectItem>
                      <SelectItem value="motivational">💪 Motivacional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voice">Voz</Label>
                  <Select value={voice} onValueChange={setVoice}>
                    <SelectTrigger className="bg-white/90 dark:bg-gray-800/90">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculina">🎤 Masculina</SelectItem>
                      <SelectItem value="feminina">🎤 Feminina</SelectItem>
                      <SelectItem value="infantil">👶 Infantil</SelectItem>
                      <SelectItem value="robotica">🤖 Robótica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-6 text-lg"
                disabled={createVideoMutation.isPending || isGenerating || (credits?.videoCredits || 0) < 1}
              >
                {createVideoMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Rocket className="w-5 h-5" />
                    Gerar Vídeo Viral (1 crédito)
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Progress Bar de Geração */}
        {isGenerating && currentProject && (
          <Card className="mb-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Gerando: {currentProject.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={generationProgress} className="h-3" />
                <div className="flex justify-between text-sm">
                  <span>Progresso: {Math.round(generationProgress)}%</span>
                  <span>Tempo estimado: {Math.round((100 - generationProgress) * 0.8)}s</span>
                </div>
                <div className="text-center text-white/90">
                  {generationProgress < 20 && "🎬 Analisando conteúdo..."}
                  {generationProgress >= 20 && generationProgress < 40 && "🎨 Criando roteiro..."}
                  {generationProgress >= 40 && generationProgress < 60 && "🎵 Gerando áudio..."}
                  {generationProgress >= 60 && generationProgress < 80 && "🎞️ Criando vídeo..."}
                  {generationProgress >= 80 && generationProgress < 100 && "✨ Finalizando..."}
                  {generationProgress >= 100 && "🎉 Concluído!"}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Projetos */}
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Film className="w-5 h-5 text-purple-600" />
              Seus Vídeos
            </CardTitle>
            <CardDescription>
              Gerencie e baixe seus vídeos criados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-300">Carregando projetos...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  Nenhum vídeo criado ainda
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Comece criando seu primeiro vídeo viral!
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project: VideoProject) => (
                  <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 flex items-center justify-center">
                      {project.thumbnailUrl ? (
                        <img 
                          src={project.thumbnailUrl} 
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center">
                          <div className="p-4 bg-white/20 rounded-full">
                            <Video className="w-8 h-8 text-purple-600" />
                          </div>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />
                          {project.status === 'completed' && 'Concluído'}
                          {project.status === 'generating' && 'Gerando...'}
                          {project.status === 'failed' && 'Falhou'}
                          {project.status === 'pending' && 'Pendente'}
                        </Badge>
                        <span className="text-sm text-gray-500">{formatTime(project.duration)}</span>
                      </div>
                      
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">{project.title}</h3>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        {getStyleIcon(project.style)}
                        <span className="capitalize">{project.style}</span>
                        <span>•</span>
                        <span>{project.voice}</span>
                      </div>

                      {project.status === 'completed' && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <Eye className="w-3 h-3" />
                          <span>{project.views || 0}</span>
                          <Heart className="w-3 h-3" />
                          <span>{project.likes || 0}</span>
                          <Share2 className="w-3 h-3" />
                          <span>{project.shares || 0}</span>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {project.status === 'completed' && (
                          <Button 
                            size="sm" 
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                            onClick={() => downloadVideo(project.id, project.title)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Baixar
                          </Button>
                        )}
                        {project.status === 'generating' && (
                          <Button size="sm" className="flex-1" disabled>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            {project.progress || 0}%
                          </Button>
                        )}
                        {project.status === 'failed' && (
                          <Button size="sm" className="flex-1" variant="destructive">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Falhou
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}