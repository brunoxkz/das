/**
 * FACELESS VIDEOS - INTERFACE COMPLETA
 * Sistema completo de geração de vídeos virais automatizados
 * Interface moderna com preview, customização e auto-posting
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Pause, 
  Upload, 
  Download, 
  Share2, 
  Eye, 
  Heart, 
  MessageCircle, 
  TrendingUp,
  Video,
  Sparkles,
  Clock,
  Target,
  Zap,
  Settings,
  PlayCircle,
  PauseCircle
} from 'lucide-react';

interface VideoGenerationRequest {
  topic: string;
  niche: string;
  duration: number;
  style: 'viral' | 'educational' | 'storytelling' | 'trending';
  voiceGender: 'male' | 'female';
  language: 'pt-BR' | 'en-US' | 'es-ES';
  platforms: string[];
  userId: string;
}

interface VideoProject {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  script: string;
  hashtags: string[];
  caption: string;
  duration: number;
  status: 'generating' | 'ready' | 'published' | 'viral';
  createdAt: Date;
  platforms: PlatformOptimization[];
  viralMetrics?: ViralMetrics;
}

interface PlatformOptimization {
  platform: string;
  videoUrl: string;
  caption: string;
  hashtags: string[];
  aspectRatio: string;
  posted: boolean;
  postId?: string;
  engagement?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
}

interface ViralMetrics {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  viralScore: number;
  bestPerformingPlatform: string;
}

export default function FacelessVideos() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estados do formulário
  const [formData, setFormData] = useState<VideoGenerationRequest>({
    topic: '',
    niche: '',
    duration: 30,
    style: 'viral',
    voiceGender: 'female',
    language: 'pt-BR',
    platforms: ['tiktok', 'instagram'],
    userId: user?.id || ''
  });

  const [activeTab, setActiveTab] = useState('generator');
  const [selectedVideo, setSelectedVideo] = useState<VideoProject | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Consultas
  const { data: videoProjects, isLoading: loadingProjects } = useQuery({
    queryKey: ['faceless-videos', user?.id],
    queryFn: () => apiRequest('GET', `/api/faceless-videos/projects/${user?.id}`),
    enabled: !!user?.id
  });

  const { data: userCredits } = useQuery({
    queryKey: ['video-credits', user?.id],
    queryFn: () => apiRequest('GET', `/api/video-credits/${user?.id}`),
    enabled: !!user?.id
  });

  // Mutações
  const generateVideoMutation = useMutation({
    mutationFn: (data: VideoGenerationRequest) => 
      apiRequest('POST', '/api/faceless-videos/generate', data),
    onSuccess: (result) => {
      toast({
        title: "🎬 Vídeo em Geração!",
        description: "Seu vídeo viral está sendo criado. Aguarde alguns minutos.",
      });
      queryClient.invalidateQueries({ queryKey: ['faceless-videos'] });
    },
    onError: (error) => {
      toast({
        title: "❌ Erro na Geração",
        description: error.message || "Falha ao gerar vídeo. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const publishVideoMutation = useMutation({
    mutationFn: (videoId: string) => 
      apiRequest('POST', `/api/faceless-videos/publish/${videoId}`),
    onSuccess: () => {
      toast({
        title: "🚀 Vídeo Publicado!",
        description: "Seu vídeo foi publicado em todas as plataformas selecionadas.",
      });
      queryClient.invalidateQueries({ queryKey: ['faceless-videos'] });
    },
    onError: (error) => {
      toast({
        title: "❌ Erro na Publicação",
        description: error.message || "Falha ao publicar vídeo.",
        variant: "destructive",
      });
    }
  });

  // Handlers
  const handleGenerateVideo = () => {
    if (!formData.topic.trim()) {
      toast({
        title: "⚠️ Tópico Obrigatório",
        description: "Informe o tópico do vídeo para continuar.",
        variant: "destructive",
      });
      return;
    }

    if (!userCredits?.videoCredits || userCredits.videoCredits < 1) {
      toast({
        title: "⚠️ Créditos Insuficientes",
        description: "Você precisa de pelo menos 1 crédito de vídeo.",
        variant: "destructive",
      });
      return;
    }

    generateVideoMutation.mutate({ ...formData, userId: user?.id || '' });
  };

  const handlePublishVideo = (videoId: string) => {
    publishVideoMutation.mutate(videoId);
  };

  const handlePlatformToggle = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generating': return 'bg-yellow-500';
      case 'ready': return 'bg-green-500';
      case 'published': return 'bg-blue-500';
      case 'viral': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'generating': return 'Gerando...';
      case 'ready': return 'Pronto';
      case 'published': return 'Publicado';
      case 'viral': return 'Viral! 🔥';
      default: return status;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          <Video className="inline mr-3" />
          Faceless Videos
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Crie vídeos virais automatizados com IA e publique em todas as plataformas
        </p>
      </div>

      {/* Barra de Créditos */}
      <Card className="mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="h-6 w-6" />
              <div>
                <p className="font-semibold">Créditos de Vídeo</p>
                <p className="text-sm opacity-90">
                  {userCredits?.videoCredits || 0} créditos disponíveis
                </p>
              </div>
            </div>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => window.location.href = '/pricing'}
            >
              Comprar Créditos
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generator">
            <Zap className="mr-2 h-4 w-4" />
            Gerador
          </TabsTrigger>
          <TabsTrigger value="library">
            <Video className="mr-2 h-4 w-4" />
            Biblioteca
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* TAB: GERADOR */}
        <TabsContent value="generator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulário de Geração */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-purple-500" />
                  Criar Vídeo Viral
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="topic">Tópico do Vídeo *</Label>
                  <Input
                    id="topic"
                    value={formData.topic}
                    onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="Ex: Como ganhar dinheiro online"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="niche">Nicho</Label>
                  <Select value={formData.niche} onValueChange={(value) => setFormData(prev => ({ ...prev, niche: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o nicho" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dinheiro">💰 Dinheiro/Negócios</SelectItem>
                      <SelectItem value="saude">🏥 Saúde/Fitness</SelectItem>
                      <SelectItem value="relacionamento">❤️ Relacionamentos</SelectItem>
                      <SelectItem value="tecnologia">💻 Tecnologia</SelectItem>
                      <SelectItem value="curiosidades">🤔 Curiosidades</SelectItem>
                      <SelectItem value="motivacao">🚀 Motivação</SelectItem>
                      <SelectItem value="humor">😂 Humor</SelectItem>
                      <SelectItem value="educacao">📚 Educação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Duração</Label>
                    <Select value={formData.duration.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 segundos</SelectItem>
                        <SelectItem value="30">30 segundos</SelectItem>
                        <SelectItem value="60">60 segundos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="style">Estilo</Label>
                    <Select value={formData.style} onValueChange={(value: any) => setFormData(prev => ({ ...prev, style: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viral">🔥 Viral</SelectItem>
                        <SelectItem value="educational">📚 Educacional</SelectItem>
                        <SelectItem value="storytelling">📖 Storytelling</SelectItem>
                        <SelectItem value="trending">📈 Trending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="voice">Voz</Label>
                    <Select value={formData.voiceGender} onValueChange={(value: any) => setFormData(prev => ({ ...prev, voiceGender: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female">👩 Feminina</SelectItem>
                        <SelectItem value="male">👨 Masculina</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="language">Idioma</Label>
                    <Select value={formData.language} onValueChange={(value: any) => setFormData(prev => ({ ...prev, language: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">🇧🇷 Português</SelectItem>
                        <SelectItem value="en-US">🇺🇸 Inglês</SelectItem>
                        <SelectItem value="es-ES">🇪🇸 Espanhol</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Plataformas de Publicação</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {[
                      { id: 'tiktok', name: 'TikTok', icon: '🎵' },
                      { id: 'instagram', name: 'Instagram', icon: '📸' },
                      { id: 'youtube', name: 'YouTube', icon: '📹' },
                      { id: 'twitter', name: 'Twitter', icon: '🐦' }
                    ].map(platform => (
                      <div key={platform.id} className="flex items-center space-x-2">
                        <Switch
                          id={platform.id}
                          checked={formData.platforms.includes(platform.id)}
                          onCheckedChange={() => handlePlatformToggle(platform.id)}
                        />
                        <Label htmlFor={platform.id} className="text-sm">
                          {platform.icon} {platform.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleGenerateVideo}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  disabled={generateVideoMutation.isPending}
                >
                  {generateVideoMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Gerando Vídeo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Gerar Vídeo Viral
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Preview/Instruções */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5 text-green-500" />
                  Dicas para Vídeos Virais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                      🎯 Tópicos que Viralizam
                    </h4>
                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                      <li>• "Você não vai acreditar..."</li>
                      <li>• "Segredo que ninguém conta"</li>
                      <li>• "Como ganhar R$ 1000 por dia"</li>
                      <li>• "Isso mudou minha vida"</li>
                      <li>• "Truque simples que funciona"</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      📱 Melhores Horários
                    </h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• TikTok: 18h - 21h</li>
                      <li>• Instagram: 11h - 14h</li>
                      <li>• YouTube: 14h - 17h</li>
                      <li>• Twitter: 12h - 13h</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                      🚀 Estratégias Avançadas
                    </h4>
                    <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <li>• Use números específicos</li>
                      <li>• Crie suspense até o final</li>
                      <li>• Inclua call-to-action forte</li>
                      <li>• Teste diferentes thumbnails</li>
                      <li>• Monitore trending hashtags</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB: BIBLIOTECA */}
        <TabsContent value="library" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingProjects ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))
            ) : videoProjects?.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Nenhum vídeo criado ainda
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Crie seu primeiro vídeo viral na aba "Gerador"
                </p>
                <Button onClick={() => setActiveTab('generator')}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Criar Primeiro Vídeo
                </Button>
              </div>
            ) : (
              videoProjects?.map((video: VideoProject) => (
                <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title}
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className={`${getStatusColor(video.status)} text-white`}>
                        {getStatusText(video.status)}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => setSelectedVideo(video)}
                      >
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                      {video.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {video.duration}s
                      </span>
                      <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    {video.viralMetrics && (
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div className="flex items-center">
                          <Eye className="mr-1 h-3 w-3 text-blue-500" />
                          {video.viralMetrics.totalViews.toLocaleString()}
                        </div>
                        <div className="flex items-center">
                          <Heart className="mr-1 h-3 w-3 text-red-500" />
                          {video.viralMetrics.totalLikes.toLocaleString()}
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="mr-1 h-3 w-3 text-green-500" />
                          {video.viralMetrics.totalComments.toLocaleString()}
                        </div>
                        <div className="flex items-center">
                          <Share2 className="mr-1 h-3 w-3 text-purple-500" />
                          {video.viralMetrics.totalShares.toLocaleString()}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex space-x-1">
                        {video.platforms.map(platform => (
                          <Badge key={platform.platform} variant="outline" className="text-xs">
                            {platform.platform}
                          </Badge>
                        ))}
                      </div>
                      
                      {video.status === 'ready' && (
                        <Button 
                          size="sm" 
                          onClick={() => handlePublishVideo(video.id)}
                          disabled={publishVideoMutation.isPending}
                          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                        >
                          <Upload className="mr-1 h-3 w-3" />
                          Publicar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* TAB: ANALYTICS */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total de Vídeos</p>
                    <p className="text-2xl font-bold">{videoProjects?.length || 0}</p>
                  </div>
                  <Video className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Visualizações</p>
                    <p className="text-2xl font-bold">
                      {videoProjects?.reduce((acc: number, video: VideoProject) => 
                        acc + (video.viralMetrics?.totalViews || 0), 0
                      ).toLocaleString() || '0'}
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Curtidas</p>
                    <p className="text-2xl font-bold">
                      {videoProjects?.reduce((acc: number, video: VideoProject) => 
                        acc + (video.viralMetrics?.totalLikes || 0), 0
                      ).toLocaleString() || '0'}
                    </p>
                  </div>
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Score Viral</p>
                    <p className="text-2xl font-bold">
                      {Math.round(videoProjects?.reduce((acc: number, video: VideoProject) => 
                        acc + (video.viralMetrics?.viralScore || 0), 0
                      ) / (videoProjects?.length || 1)) || 0}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Performance dos Vídeos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {videoProjects?.filter((video: VideoProject) => video.viralMetrics).map((video: VideoProject) => (
                  <div key={video.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title}
                        className="w-16 h-9 object-cover rounded"
                      />
                      <div>
                        <p className="font-semibold text-sm">{video.title}</p>
                        <p className="text-xs text-gray-500">
                          {video.viralMetrics?.bestPerformingPlatform} • {video.duration}s
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <p className="font-semibold">{video.viralMetrics?.totalViews.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">views</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{video.viralMetrics?.totalLikes.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">likes</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{video.viralMetrics?.viralScore}</p>
                        <p className="text-xs text-gray-500">score</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}