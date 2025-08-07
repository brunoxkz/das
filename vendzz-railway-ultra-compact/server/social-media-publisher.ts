/**
 * SOCIAL MEDIA PUBLISHER - AUTO-POSTING VIRAL
 * Sistema de publicação automática para máxima viralização
 * TikTok + Instagram + YouTube + Twitter + Facebook
 */

import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import { VideoGenerationResult, PlatformOptimization } from './faceless-video-generator';

// Configurações das APIs
const AYRSHARE_API_KEY = process.env.AYRSHARE_API_KEY;
const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export interface PostingSchedule {
  platform: string;
  scheduledTime: Date;
  posted: boolean;
  postId?: string;
  engagement?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
}

export interface ViralMetrics {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  viralScore: number;
  bestPerformingPlatform: string;
  peakEngagementTime: Date;
}

export class SocialMediaPublisher {
  private apiEndpoints = {
    ayrshare: 'https://app.ayrshare.com/api',
    tiktok: 'https://open-api.tiktok.com/share/video/upload/',
    instagram: 'https://graph.facebook.com/v18.0',
    youtube: 'https://www.googleapis.com/youtube/v3',
    twitter: 'https://api.twitter.com/2'
  };

  /**
   * PUBLICAÇÃO AUTOMÁTICA MULTI-PLATAFORMA
   */
  async publishToAllPlatforms(videoResult: VideoGenerationResult, userId: string): Promise<PostingSchedule[]> {
    console.log(`🚀 Iniciando publicação automática para ${videoResult.platforms.length} plataformas`);
    
    const postingSchedules: PostingSchedule[] = [];

    // Publicar simultaneamente em todas as plataformas
    const publishPromises = videoResult.platforms.map(async (optimization) => {
      try {
        const schedule = await this.publishToPlatform(optimization, userId);
        postingSchedules.push(schedule);
        console.log(`✅ Agendado para ${optimization.platform}: ${schedule.scheduledTime}`);
      } catch (error) {
        console.error(`❌ Erro ao publicar no ${optimization.platform}:`, error);
        postingSchedules.push({
          platform: optimization.platform,
          scheduledTime: new Date(),
          posted: false
        });
      }
    });

    await Promise.all(publishPromises);
    
    return postingSchedules;
  }

  /**
   * PUBLICAÇÃO ESPECÍFICA POR PLATAFORMA
   */
  private async publishToPlatform(optimization: PlatformOptimization, userId: string): Promise<PostingSchedule> {
    const { platform, videoUrl, caption, hashtags, scheduledTime } = optimization;

    // Usar Ayrshare como provedor principal (mais confiável)
    if (AYRSHARE_API_KEY) {
      return await this.publishViaAyrshare(optimization, userId);
    }

    // Fallback para APIs nativas
    switch (platform) {
      case 'tiktok':
        return await this.publishToTikTok(optimization, userId);
      case 'instagram':
        return await this.publishToInstagram(optimization, userId);
      case 'youtube':
        return await this.publishToYouTube(optimization, userId);
      case 'twitter':
        return await this.publishToTwitter(optimization, userId);
      default:
        throw new Error(`Plataforma não suportada: ${platform}`);
    }
  }

  /**
   * PUBLICAÇÃO VIA AYRSHARE (PROVEDOR PRINCIPAL)
   */
  private async publishViaAyrshare(optimization: PlatformOptimization, userId: string): Promise<PostingSchedule> {
    const { platform, videoUrl, caption, hashtags, scheduledTime } = optimization;

    // Preparar dados para publicação
    const postData = {
      post: `${caption}\n\n${hashtags.map(h => `#${h}`).join(' ')}`,
      mediaUrls: [videoUrl],
      platforms: [platform],
      scheduleDate: scheduledTime ? scheduledTime.toISOString() : undefined,
      profileKeys: [userId], // Usar userId como profile key
      
      // Otimizações específicas por plataforma
      ...(platform === 'tiktok' && {
        tiktokOptions: {
          duet: false,
          comment: true,
          stitch: false,
          disableDownloads: false
        }
      }),
      
      ...(platform === 'instagram' && {
        instagramOptions: {
          story: false,
          reels: true,
          feed: true
        }
      }),
      
      ...(platform === 'youtube' && {
        youTubeOptions: {
          title: caption.substring(0, 100),
          description: `${caption}\n\n${hashtags.map(h => `#${h}`).join(' ')}`,
          tags: hashtags.slice(0, 10),
          categoryId: '22', // People & Blogs
          privacyStatus: 'public',
          madeForKids: false
        }
      })
    };

    try {
      const response = await fetch(`${this.apiEndpoints.ayrshare}/post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AYRSHARE_API_KEY}`
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        throw new Error(`Ayrshare API error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`✅ Publicado via Ayrshare no ${platform}:`, result);

      return {
        platform,
        scheduledTime: scheduledTime || new Date(),
        posted: true,
        postId: result.id
      };

    } catch (error) {
      console.error(`❌ Erro Ayrshare ${platform}:`, error);
      throw error;
    }
  }

  /**
   * PUBLICAÇÃO DIRETA NO TIKTOK
   */
  private async publishToTikTok(optimization: PlatformOptimization, userId: string): Promise<PostingSchedule> {
    if (!TIKTOK_CLIENT_KEY || !TIKTOK_CLIENT_SECRET) {
      throw new Error('TikTok API credentials not configured');
    }

    const { videoUrl, caption, hashtags } = optimization;

    // Preparar upload do vídeo
    const formData = new FormData();
    formData.append('video', fs.createReadStream(videoUrl));
    formData.append('caption', `${caption}\n\n${hashtags.map(h => `#${h}`).join(' ')}`);
    formData.append('privacy_level', 'PUBLIC_TO_EVERYONE');
    formData.append('disable_duet', 'false');
    formData.append('disable_comment', 'false');
    formData.append('disable_stitch', 'false');

    try {
      const response = await fetch(this.apiEndpoints.tiktok, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TIKTOK_CLIENT_KEY}`,
          'Content-Type': 'multipart/form-data'
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`TikTok API error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Publicado no TikTok:', result);

      return {
        platform: 'tiktok',
        scheduledTime: new Date(),
        posted: true,
        postId: result.share_id
      };

    } catch (error) {
      console.error('❌ Erro TikTok:', error);
      throw error;
    }
  }

  /**
   * PUBLICAÇÃO NO INSTAGRAM
   */
  private async publishToInstagram(optimization: PlatformOptimization, userId: string): Promise<PostingSchedule> {
    if (!INSTAGRAM_ACCESS_TOKEN) {
      throw new Error('Instagram Access Token not configured');
    }

    const { videoUrl, caption, hashtags } = optimization;

    try {
      // 1. Criar container de mídia
      const createResponse = await fetch(`${this.apiEndpoints.instagram}/me/media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          media_type: 'VIDEO',
          video_url: videoUrl,
          caption: `${caption}\n\n${hashtags.map(h => `#${h}`).join(' ')}`,
          access_token: INSTAGRAM_ACCESS_TOKEN
        })
      });

      if (!createResponse.ok) {
        throw new Error(`Instagram create error: ${createResponse.statusText}`);
      }

      const createResult = await createResponse.json();
      const containerId = createResult.id;

      // 2. Publicar mídia
      const publishResponse = await fetch(`${this.apiEndpoints.instagram}/me/media_publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: INSTAGRAM_ACCESS_TOKEN
        })
      });

      if (!publishResponse.ok) {
        throw new Error(`Instagram publish error: ${publishResponse.statusText}`);
      }

      const publishResult = await publishResponse.json();
      console.log('✅ Publicado no Instagram:', publishResult);

      return {
        platform: 'instagram',
        scheduledTime: new Date(),
        posted: true,
        postId: publishResult.id
      };

    } catch (error) {
      console.error('❌ Erro Instagram:', error);
      throw error;
    }
  }

  /**
   * PUBLICAÇÃO NO YOUTUBE
   */
  private async publishToYouTube(optimization: PlatformOptimization, userId: string): Promise<PostingSchedule> {
    if (!YOUTUBE_API_KEY) {
      throw new Error('YouTube API Key not configured');
    }

    const { videoUrl, caption, hashtags } = optimization;

    try {
      const formData = new FormData();
      formData.append('video', fs.createReadStream(videoUrl));
      formData.append('snippet', JSON.stringify({
        title: caption.substring(0, 100),
        description: `${caption}\n\n${hashtags.map(h => `#${h}`).join(' ')}`,
        tags: hashtags.slice(0, 10),
        categoryId: '22'
      }));
      formData.append('status', JSON.stringify({
        privacyStatus: 'public',
        madeForKids: false
      }));

      const response = await fetch(`${this.apiEndpoints.youtube}/videos?uploadType=multipart&part=snippet,status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${YOUTUBE_API_KEY}`,
          'Content-Type': 'multipart/form-data'
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Publicado no YouTube:', result);

      return {
        platform: 'youtube',
        scheduledTime: new Date(),
        posted: true,
        postId: result.id
      };

    } catch (error) {
      console.error('❌ Erro YouTube:', error);
      throw error;
    }
  }

  /**
   * PUBLICAÇÃO NO TWITTER
   */
  private async publishToTwitter(optimization: PlatformOptimization, userId: string): Promise<PostingSchedule> {
    // Implementar usando Ayrshare ou Twitter API v2
    return await this.publishViaAyrshare(optimization, userId);
  }

  /**
   * MONITORAMENTO DE PERFORMANCE VIRAL
   */
  async monitorViralPerformance(postingSchedules: PostingSchedule[]): Promise<ViralMetrics> {
    console.log('📊 Monitorando performance viral...');

    const metrics: ViralMetrics = {
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      viralScore: 0,
      bestPerformingPlatform: '',
      peakEngagementTime: new Date()
    };

    // Monitorar cada plataforma
    for (const schedule of postingSchedules) {
      if (schedule.posted && schedule.postId) {
        try {
          const platformMetrics = await this.getPlatformMetrics(schedule.platform, schedule.postId);
          
          metrics.totalViews += platformMetrics.views;
          metrics.totalLikes += platformMetrics.likes;
          metrics.totalComments += platformMetrics.comments;
          metrics.totalShares += platformMetrics.shares;

          // Atualizar engagement do schedule
          schedule.engagement = platformMetrics;

        } catch (error) {
          console.error(`❌ Erro ao obter métricas do ${schedule.platform}:`, error);
        }
      }
    }

    // Calcular score viral
    metrics.viralScore = this.calculateViralScore(metrics);
    
    // Encontrar melhor plataforma
    const bestPlatform = postingSchedules.reduce((best, current) => {
      const currentEngagement = current.engagement?.views || 0;
      const bestEngagement = best.engagement?.views || 0;
      return currentEngagement > bestEngagement ? current : best;
    });
    
    metrics.bestPerformingPlatform = bestPlatform.platform;

    console.log('📈 Performance viral:', metrics);
    return metrics;
  }

  /**
   * OBTER MÉTRICAS DE PLATAFORMA
   */
  private async getPlatformMetrics(platform: string, postId: string): Promise<{
    views: number;
    likes: number;
    comments: number;
    shares: number;
  }> {
    if (AYRSHARE_API_KEY) {
      try {
        const response = await fetch(`${this.apiEndpoints.ayrshare}/analytics/post/${postId}`, {
          headers: {
            'Authorization': `Bearer ${AYRSHARE_API_KEY}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          return {
            views: data.views || 0,
            likes: data.likes || 0,
            comments: data.comments || 0,
            shares: data.shares || 0
          };
        }
      } catch (error) {
        console.error('Erro ao obter métricas via Ayrshare:', error);
      }
    }

    // Fallback para APIs nativas
    switch (platform) {
      case 'tiktok':
        return await this.getTikTokMetrics(postId);
      case 'instagram':
        return await this.getInstagramMetrics(postId);
      case 'youtube':
        return await this.getYouTubeMetrics(postId);
      default:
        return { views: 0, likes: 0, comments: 0, shares: 0 };
    }
  }

  /**
   * MÉTRICAS DO TIKTOK
   */
  private async getTikTokMetrics(postId: string): Promise<{
    views: number;
    likes: number;
    comments: number;
    shares: number;
  }> {
    // Implementar TikTok Analytics API
    // Por enquanto, retornar valores simulados
    return {
      views: Math.floor(Math.random() * 100000),
      likes: Math.floor(Math.random() * 10000),
      comments: Math.floor(Math.random() * 1000),
      shares: Math.floor(Math.random() * 500)
    };
  }

  /**
   * MÉTRICAS DO INSTAGRAM
   */
  private async getInstagramMetrics(postId: string): Promise<{
    views: number;
    likes: number;
    comments: number;
    shares: number;
  }> {
    if (!INSTAGRAM_ACCESS_TOKEN) {
      return { views: 0, likes: 0, comments: 0, shares: 0 };
    }

    try {
      const response = await fetch(`${this.apiEndpoints.instagram}/${postId}/insights?metric=impressions,reach,likes,comments,shares&access_token=${INSTAGRAM_ACCESS_TOKEN}`);
      
      if (response.ok) {
        const data = await response.json();
        return {
          views: data.impressions || 0,
          likes: data.likes || 0,
          comments: data.comments || 0,
          shares: data.shares || 0
        };
      }
    } catch (error) {
      console.error('Erro métricas Instagram:', error);
    }

    return { views: 0, likes: 0, comments: 0, shares: 0 };
  }

  /**
   * MÉTRICAS DO YOUTUBE
   */
  private async getYouTubeMetrics(postId: string): Promise<{
    views: number;
    likes: number;
    comments: number;
    shares: number;
  }> {
    if (!YOUTUBE_API_KEY) {
      return { views: 0, likes: 0, comments: 0, shares: 0 };
    }

    try {
      const response = await fetch(`${this.apiEndpoints.youtube}/videos?part=statistics&id=${postId}&key=${YOUTUBE_API_KEY}`);
      
      if (response.ok) {
        const data = await response.json();
        const stats = data.items[0]?.statistics || {};
        
        return {
          views: parseInt(stats.viewCount) || 0,
          likes: parseInt(stats.likeCount) || 0,
          comments: parseInt(stats.commentCount) || 0,
          shares: parseInt(stats.shareCount) || 0
        };
      }
    } catch (error) {
      console.error('Erro métricas YouTube:', error);
    }

    return { views: 0, likes: 0, comments: 0, shares: 0 };
  }

  /**
   * CALCULAR SCORE VIRAL
   */
  private calculateViralScore(metrics: ViralMetrics): number {
    const {
      totalViews,
      totalLikes,
      totalComments,
      totalShares
    } = metrics;

    // Fórmula de score viral ponderada
    const score = (
      (totalViews * 0.3) +
      (totalLikes * 0.25) +
      (totalComments * 0.25) +
      (totalShares * 0.2)
    ) / 1000; // Normalizar

    return Math.min(Math.round(score), 100); // Score máximo 100
  }

  /**
   * OTIMIZAÇÃO AUTOMÁTICA BASEADA EM PERFORMANCE
   */
  async optimizeBasedOnPerformance(metrics: ViralMetrics): Promise<{
    recommendations: string[];
    nextPostingTime: Date;
    suggestedPlatforms: string[];
  }> {
    const recommendations: string[] = [];
    const suggestedPlatforms: string[] = [];

    // Análise de performance
    if (metrics.viralScore > 70) {
      recommendations.push('🔥 Conteúdo viral! Duplicar estratégia');
      recommendations.push('📈 Aumentar frequência de posting');
    } else if (metrics.viralScore > 40) {
      recommendations.push('⚡ Performance média. Testar novos hooks');
      recommendations.push('🎯 Focar em plataformas com melhor performance');
    } else {
      recommendations.push('🔄 Revisar estratégia de conteúdo');
      recommendations.push('📊 Analisar horários de melhor engagement');
    }

    // Sugestões de plataforma
    if (metrics.bestPerformingPlatform === 'tiktok') {
      suggestedPlatforms.push('tiktok', 'instagram', 'youtube');
      recommendations.push('🎵 Usar trending sounds do TikTok');
    } else if (metrics.bestPerformingPlatform === 'instagram') {
      suggestedPlatforms.push('instagram', 'tiktok', 'facebook');
      recommendations.push('📸 Focar em conteúdo visual impactante');
    }

    // Próximo horário ótimo
    const nextPostingTime = new Date();
    nextPostingTime.setHours(nextPostingTime.getHours() + 6); // 6 horas após

    return {
      recommendations,
      nextPostingTime,
      suggestedPlatforms
    };
  }

  /**
   * REPOSTAGEM AUTOMÁTICA PARA MAXIMIZAR ALCANCE
   */
  async scheduleRepostingCampaign(videoResult: VideoGenerationResult, metrics: ViralMetrics): Promise<PostingSchedule[]> {
    console.log('🔄 Iniciando campanha de repostagem automática...');

    const repostSchedules: PostingSchedule[] = [];
    const repostTimes = [
      { hours: 6, reason: 'Público matinal' },
      { hours: 12, reason: 'Horário de almoço' },
      { hours: 18, reason: 'Horário nobre' },
      { hours: 21, reason: 'Entretenimento noturno' }
    ];

    for (const timeSlot of repostTimes) {
      const scheduledTime = new Date();
      scheduledTime.setHours(scheduledTime.getHours() + timeSlot.hours);

      // Repostar na plataforma com melhor performance
      const bestPlatform = videoResult.platforms.find(p => p.platform === metrics.bestPerformingPlatform);
      
      if (bestPlatform) {
        const repostOptimization = {
          ...bestPlatform,
          caption: `${bestPlatform.caption} | ${timeSlot.reason}`,
          scheduledTime
        };

        try {
          const schedule = await this.publishToPlatform(repostOptimization, 'repost-campaign');
          repostSchedules.push(schedule);
          console.log(`📅 Repostagem agendada para ${timeSlot.reason}: ${scheduledTime}`);
        } catch (error) {
          console.error(`❌ Erro ao agendar repostagem:`, error);
        }
      }
    }

    return repostSchedules;
  }
}