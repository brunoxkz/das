/**
 * SISTEMA FACELESS VIDEO GENERATOR - VIRAL TIKTOK STYLE
 * Sistema completo de geração de vídeos automatizados para viralização
 * Integração com OpenAI + ElevenLabs + Stable Diffusion + TikTok API
 */

import OpenAI from 'openai';
import fetch from 'node-fetch';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

// Configuração OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Configuração ElevenLabs
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // Bella voice

// Configuração Stable Diffusion
const STABILITY_API_KEY = process.env.STABILITY_API_KEY;

// Configuração TikTok/Social Media
const AYRSHARE_API_KEY = process.env.AYRSHARE_API_KEY;

export interface VideoGenerationRequest {
  topic: string;
  niche: string;
  duration: number; // em segundos (15, 30, 60)
  style: 'viral' | 'educational' | 'storytelling' | 'trending';
  voiceGender: 'male' | 'female';
  language: 'pt-BR' | 'en-US' | 'es-ES';
  platforms: string[]; // ['tiktok', 'instagram', 'youtube']
  userId: string;
}

export interface VideoGenerationResult {
  videoUrl: string;
  thumbnailUrl: string;
  script: string;
  hashtags: string[];
  caption: string;
  duration: number;
  platforms: PlatformOptimization[];
}

export interface PlatformOptimization {
  platform: string;
  videoUrl: string;
  caption: string;
  hashtags: string[];
  aspectRatio: string;
  scheduledTime?: Date;
}

export class FacelessVideoGenerator {
  private uploadsDir: string;
  private tempDir: string;

  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'uploads/videos');
    this.tempDir = path.join(process.cwd(), 'temp/video-generation');
    
    // Criar diretórios se não existirem
    this.ensureDirectories();
  }

  private ensureDirectories() {
    [this.uploadsDir, this.tempDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * GERAÇÃO COMPLETA DE VÍDEO VIRAL
   */
  async generateViralVideo(request: VideoGenerationRequest): Promise<VideoGenerationResult> {
    const videoId = nanoid();
    console.log(`🎬 Iniciando geração de vídeo viral: ${videoId}`);

    try {
      // 1. Gerar script viral otimizado
      const script = await this.generateViralScript(request);
      
      // 2. Gerar hashtags trending
      const hashtags = await this.generateTrendingHashtags(request);
      
      // 3. Gerar narração com voz premium
      const audioPath = await this.generatePremiumVoice(script, request);
      
      // 4. Gerar imagens de background
      const backgroundImages = await this.generateBackgroundImages(request);
      
      // 5. Compilar vídeo final
      const videoPath = await this.compileVideo({
        audioPath,
        backgroundImages,
        script,
        duration: request.duration,
        videoId
      });
      
      // 6. Otimizar para cada plataforma
      const platformOptimizations = await this.optimizeForPlatforms(videoPath, request);
      
      // 7. Gerar caption otimizada
      const caption = await this.generateOptimizedCaption(script, hashtags, request);
      
      // 8. Upload para storage
      const videoUrl = await this.uploadVideo(videoPath, videoId);
      const thumbnailUrl = await this.generateThumbnail(videoPath, videoId);

      return {
        videoUrl,
        thumbnailUrl,
        script,
        hashtags,
        caption,
        duration: request.duration,
        platforms: platformOptimizations
      };

    } catch (error) {
      console.error('Erro na geração de vídeo:', error);
      throw new Error(`Falha na geração de vídeo: ${error.message}`);
    }
  }

  /**
   * GERAÇÃO DE SCRIPT VIRAL OTIMIZADO
   */
  private async generateViralScript(request: VideoGenerationRequest): Promise<string> {
    const viralPrompts = {
      viral: `Crie um script EXTREMAMENTE VIRAL para TikTok sobre "${request.topic}". 
      REGRAS OBRIGATÓRIAS:
      - Comece com um HOOK IRRESISTÍVEL nos primeiros 3 segundos
      - Use palavras de gatilho: "VOCÊ NÃO VAI ACREDITAR", "ISSO VAI TE CHOCAR", "SEGREDO REVELADO"
      - Mantenha suspense durante todo o vídeo
      - Use números específicos e estatísticas impactantes
      - Termine com CTA forte para engajamento
      - Máximo ${request.duration} segundos de narração
      - Estilo: Jovem, energético, viciante`,
      
      educational: `Crie um script educativo VICIANTE sobre "${request.topic}".
      FOQUE EM:
      - Fatos surpreendentes que ninguém sabe
      - Explicação simples de conceitos complexos
      - "Você sabia que..." como gancho
      - Dicas práticas e acionáveis
      - Storytelling envolvente`,
      
      storytelling: `Crie uma história EMOCIONANTE sobre "${request.topic}".
      ELEMENTOS:
      - Protagonista relatable
      - Conflito interessante
      - Reviravolta surpreendente
      - Final impactante
      - Conexão emocional forte`,
      
      trending: `Crie um script seguindo TENDÊNCIAS ATUAIS sobre "${request.topic}".
      INCLUA:
      - Referências a memes atuais
      - Linguagem da geração Z
      - Trends do TikTok
      - Challenges populares
      - Sounds virais`
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Modelo mais avançado
      messages: [
        {
          role: "system",
          content: `Você é um especialista em conteúdo viral do TikTok. Crie scripts que garantem milhões de visualizações.
          Foque em: Hook irresistível, ritmo acelerado, linguagem jovem, suspense constante, CTA forte.
          Duração: ${request.duration} segundos. Idioma: ${request.language}.`
        },
        {
          role: "user",
          content: viralPrompts[request.style]
        }
      ],
      max_tokens: 500,
      temperature: 0.9 // Mais criativo
    });

    return response.choices[0].message.content.trim();
  }

  /**
   * GERAÇÃO DE HASHTAGS TRENDING
   */
  private async generateTrendingHashtags(request: VideoGenerationRequest): Promise<string[]> {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Você é um especialista em hashtags virais do TikTok. 
          Gere hashtags que garantem máximo alcance e engagement.
          Misture: hashtags trending atuais + nicho específico + genéricas virais.`
        },
        {
          role: "user",
          content: `Gere 15 hashtags VIRAIS para um vídeo sobre "${request.topic}" no nicho "${request.niche}".
          Inclua: 
          - 5 hashtags trending do TikTok atual
          - 5 hashtags específicas do nicho
          - 5 hashtags genéricas virais (#fyp #viral #trending)
          
          Retorne apenas as hashtags separadas por vírgula, sem explicações.`
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    return response.choices[0].message.content
      .split(',')
      .map(tag => tag.trim().replace('#', ''))
      .filter(tag => tag.length > 0)
      .slice(0, 15);
  }

  /**
   * GERAÇÃO DE VOZ PREMIUM COM ELEVENLABS
   */
  private async generatePremiumVoice(script: string, request: VideoGenerationRequest): Promise<string> {
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not configured');
    }

    // Vozes otimizadas para viral
    const voices = {
      'pt-BR': {
        male: 'pNInz6obpgDQGcFmaJgB', // Adam (português)
        female: 'EXAVITQu4vr4xnSDxMaL' // Bella (português adaptado)
      },
      'en-US': {
        male: 'ErXwobaYiN019PkySvjV', // Antoni
        female: 'EXAVITQu4vr4xnSDxMaL' // Bella
      },
      'es-ES': {
        male: 'VR6AewLTigWG4xSOukaG', // Arnold
        female: 'EXAVITQu4vr4xnSDxMaL' // Bella
      }
    };

    const voiceId = voices[request.language][request.voiceGender];
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: script,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.8, // Mais expressivo
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const audioPath = path.join(this.tempDir, `audio_${nanoid()}.mp3`);
    fs.writeFileSync(audioPath, Buffer.from(audioBuffer));

    return audioPath;
  }

  /**
   * GERAÇÃO DE IMAGENS DE BACKGROUND
   */
  private async generateBackgroundImages(request: VideoGenerationRequest): Promise<string[]> {
    if (!STABILITY_API_KEY) {
      // Fallback para imagens pré-definidas
      return this.getDefaultBackgrounds(request.niche);
    }

    const prompts = [
      `Vibrant, eye-catching background for ${request.topic}, TikTok style, trending colors, modern aesthetic`,
      `Dynamic gradient background, ${request.niche} theme, social media optimized, bright colors`,
      `Abstract geometric patterns, ${request.topic} related, viral video style, energetic mood`
    ];

    const images: string[] = [];

    for (const prompt of prompts) {
      try {
        const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${STABILITY_API_KEY}`
          },
          body: JSON.stringify({
            text_prompts: [{ text: prompt }],
            cfg_scale: 7,
            height: 1920, // Vertical para mobile
            width: 1080,
            steps: 20,
            samples: 1
          })
        });

        if (response.ok) {
          const result = await response.json();
          const imageData = result.artifacts[0].base64;
          const imagePath = path.join(this.tempDir, `bg_${nanoid()}.png`);
          fs.writeFileSync(imagePath, Buffer.from(imageData, 'base64'));
          images.push(imagePath);
        }
      } catch (error) {
        console.error('Erro ao gerar imagem:', error);
      }
    }

    return images.length > 0 ? images : this.getDefaultBackgrounds(request.niche);
  }

  /**
   * BACKGROUNDS PADRÃO POR NICHO
   */
  private getDefaultBackgrounds(niche: string): string[] {
    // Retorna caminhos para imagens padrão baseadas no nicho
    const defaultBgs = [
      'assets/backgrounds/gradient-1.jpg',
      'assets/backgrounds/gradient-2.jpg',
      'assets/backgrounds/gradient-3.jpg'
    ];
    
    return defaultBgs.map(bg => path.join(process.cwd(), bg));
  }

  /**
   * COMPILAÇÃO DE VÍDEO COM FFMPEG
   */
  private async compileVideo(options: {
    audioPath: string;
    backgroundImages: string[];
    script: string;
    duration: number;
    videoId: string;
  }): Promise<string> {
    const { audioPath, backgroundImages, script, duration, videoId } = options;
    const outputPath = path.join(this.tempDir, `video_${videoId}.mp4`);

    return new Promise((resolve, reject) => {
      let command = ffmpeg();

      // Adicionar backgrounds em sequência
      const imageDuration = duration / backgroundImages.length;
      backgroundImages.forEach((imagePath, index) => {
        command = command.input(imagePath).inputOptions([
          '-loop', '1',
          '-t', imageDuration.toString()
        ]);
      });

      // Adicionar áudio
      command = command.input(audioPath);

      // Configurações de output otimizadas para TikTok
      command
        .complexFilter([
          // Concatenar imagens
          backgroundImages.map((_, i) => `[${i}:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setpts=PTS-STARTPTS[v${i}]`).join(';'),
          backgroundImages.map((_, i) => `[v${i}]`).join('') + `concat=n=${backgroundImages.length}:v=1:a=0[v]`,
          // Adicionar texto animado
          `[v]drawtext=text='${script.replace(/'/g, "\\'")}':fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:fontsize=40:fontcolor=white:x=(w-text_w)/2:y=h-100:enable='between(t,0,${duration})'[vout]`
        ])
        .outputOptions([
          '-map', '[vout]',
          '-map', `${backgroundImages.length}:a`,
          '-c:v', 'libx264',
          '-c:a', 'aac',
          '-b:v', '2M',
          '-b:a', '128k',
          '-r', '30',
          '-shortest',
          '-movflags', '+faststart'
        ])
        .format('mp4')
        .on('end', () => {
          console.log(`✅ Vídeo compilado: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('Erro na compilação:', err);
          reject(err);
        })
        .save(outputPath);
    });
  }

  /**
   * OTIMIZAÇÃO PARA PLATAFORMAS
   */
  private async optimizeForPlatforms(videoPath: string, request: VideoGenerationRequest): Promise<PlatformOptimization[]> {
    const optimizations: PlatformOptimization[] = [];

    for (const platform of request.platforms) {
      const platformConfig = this.getPlatformConfig(platform);
      const optimizedPath = await this.optimizeVideoForPlatform(videoPath, platformConfig);
      
      optimizations.push({
        platform,
        videoUrl: optimizedPath,
        caption: await this.generatePlatformCaption(request, platform),
        hashtags: await this.generatePlatformHashtags(request, platform),
        aspectRatio: platformConfig.aspectRatio,
        scheduledTime: this.getOptimalPostingTime(platform)
      });
    }

    return optimizations;
  }

  /**
   * CONFIGURAÇÕES POR PLATAFORMA
   */
  private getPlatformConfig(platform: string) {
    const configs = {
      tiktok: {
        aspectRatio: '9:16',
        resolution: '1080x1920',
        maxDuration: 60,
        format: 'mp4',
        codec: 'h264'
      },
      instagram: {
        aspectRatio: '9:16',
        resolution: '1080x1920',
        maxDuration: 30,
        format: 'mp4',
        codec: 'h264'
      },
      youtube: {
        aspectRatio: '9:16',
        resolution: '1080x1920',
        maxDuration: 60,
        format: 'mp4',
        codec: 'h264'
      },
      twitter: {
        aspectRatio: '16:9',
        resolution: '1280x720',
        maxDuration: 140,
        format: 'mp4',
        codec: 'h264'
      }
    };

    return configs[platform] || configs.tiktok;
  }

  /**
   * OTIMIZAÇÃO DE VÍDEO POR PLATAFORMA
   */
  private async optimizeVideoForPlatform(videoPath: string, config: any): Promise<string> {
    const optimizedPath = path.join(this.tempDir, `optimized_${nanoid()}.mp4`);

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .size(config.resolution)
        .videoCodec(config.codec)
        .outputOptions([
          '-movflags', '+faststart',
          '-preset', 'fast',
          '-crf', '23'
        ])
        .format(config.format)
        .on('end', () => resolve(optimizedPath))
        .on('error', reject)
        .save(optimizedPath);
    });
  }

  /**
   * GERAÇÃO DE CAPTION OTIMIZADA
   */
  private async generateOptimizedCaption(script: string, hashtags: string[], request: VideoGenerationRequest): Promise<string> {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Você é um especialista em captions virais para TikTok.
          Crie captions que maximizam engagement e alcance.
          Inclua: Hook, call-to-action, hashtags estratégicas.`
        },
        {
          role: "user",
          content: `Crie uma caption VIRAL para este vídeo:
          
          Script: "${script}"
          Hashtags: ${hashtags.map(h => `#${h}`).join(' ')}
          
          REGRAS:
          - Máximo 150 caracteres
          - Hook irresistível nos primeiros 10 caracteres
          - CTA forte para comentários/compartilhamentos
          - Inclua 3-5 hashtags mais virais
          - Estilo jovem e envolvente`
        }
      ],
      max_tokens: 100,
      temperature: 0.8
    });

    return response.choices[0].message.content.trim();
  }

  /**
   * UPLOAD DE VÍDEO
   */
  private async uploadVideo(videoPath: string, videoId: string): Promise<string> {
    const finalPath = path.join(this.uploadsDir, `${videoId}.mp4`);
    fs.copyFileSync(videoPath, finalPath);
    
    // Retornar URL relativa
    return `/uploads/videos/${videoId}.mp4`;
  }

  /**
   * GERAÇÃO DE THUMBNAIL
   */
  private async generateThumbnail(videoPath: string, videoId: string): Promise<string> {
    const thumbnailPath = path.join(this.uploadsDir, `${videoId}_thumb.jpg`);

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .seekInput(1) // Pegar frame do segundo 1
        .frames(1)
        .size('540x960') // Metade da resolução
        .format('jpg')
        .on('end', () => resolve(`/uploads/videos/${videoId}_thumb.jpg`))
        .on('error', reject)
        .save(thumbnailPath);
    });
  }

  /**
   * HORÁRIOS ÓTIMOS DE POSTAGEM
   */
  private getOptimalPostingTime(platform: string): Date {
    const now = new Date();
    const optimal = {
      tiktok: { hour: 18, minute: 0 }, // 18:00 - horário de pico
      instagram: { hour: 11, minute: 0 }, // 11:00 - manhã
      youtube: { hour: 14, minute: 0 }, // 14:00 - tarde
      twitter: { hour: 12, minute: 0 } // 12:00 - almoço
    };

    const config = optimal[platform] || optimal.tiktok;
    const scheduledTime = new Date(now);
    scheduledTime.setHours(config.hour, config.minute, 0, 0);

    // Se já passou do horário, agendar para amanhã
    if (scheduledTime < now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    return scheduledTime;
  }

  /**
   * HASHTAGS ESPECÍFICAS POR PLATAFORMA
   */
  private async generatePlatformHashtags(request: VideoGenerationRequest, platform: string): Promise<string[]> {
    const platformHashtags = {
      tiktok: ['fyp', 'viral', 'trending', 'foryou', 'tiktok'],
      instagram: ['reels', 'explore', 'viral', 'trending', 'instagram'],
      youtube: ['shorts', 'viral', 'trending', 'youtube', 'subscribe'],
      twitter: ['viral', 'trending', 'twitter', 'thread', 'rt']
    };

    const baseHashtags = platformHashtags[platform] || platformHashtags.tiktok;
    
    // Combinar com hashtags do nicho
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: `Gere 5 hashtags específicas para ${platform} sobre "${request.topic}" no nicho "${request.niche}".
          Retorne apenas as hashtags separadas por vírgula, sem #.`
        }
      ],
      max_tokens: 50
    });

    const nicheHashtags = response.choices[0].message.content
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    return [...baseHashtags, ...nicheHashtags].slice(0, 10);
  }

  /**
   * CAPTION ESPECÍFICA POR PLATAFORMA
   */
  private async generatePlatformCaption(request: VideoGenerationRequest, platform: string): Promise<string> {
    const platformStyles = {
      tiktok: 'Jovem, viral, com emojis, call-to-action forte',
      instagram: 'Estético, inspiracional, storytelling',
      youtube: 'Informativo, com CTA para inscrição',
      twitter: 'Conciso, impactante, thread-ready'
    };

    const style = platformStyles[platform] || platformStyles.tiktok;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: `Crie uma caption para ${platform} sobre "${request.topic}".
          Estilo: ${style}
          Máximo 100 caracteres.
          Inclua emojis relevantes.`
        }
      ],
      max_tokens: 50
    });

    return response.choices[0].message.content.trim();
  }
}