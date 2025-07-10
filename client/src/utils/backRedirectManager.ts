/**
 * SISTEMA BACKREDIRECT UNIVERSAL
 * Compatibilidade total com todos os dispositivos e apps móveis
 * Funciona permanentemente após inserido no quiz publicado
 */

interface BackRedirectConfig {
  enabled: boolean;
  url: string;
  delay: number; // segundos
}

export class BackRedirectManager {
  private static instance: BackRedirectManager | null = null;
  private config: BackRedirectConfig | null = null;
  private hasRedirected = false;
  private redirectTimer: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): BackRedirectManager {
    if (!BackRedirectManager.instance) {
      BackRedirectManager.instance = new BackRedirectManager();
    }
    return BackRedirectManager.instance;
  }

  /**
   * Configura o sistema BackRedirect com dados do quiz
   */
  configure(config: BackRedirectConfig) {
    this.config = config;
    
    // Log para debug (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 BackRedirect configurado:', config);
    }
  }

  /**
   * Executa o redirecionamento quando o quiz é completado
   */
  executeRedirect() {
    if (!this.config || !this.config.enabled || !this.config.url || this.hasRedirected) {
      return;
    }

    // Marcar como redirecionado para evitar múltiplos redirecionamentos
    this.hasRedirected = true;

    // Limpar timer anterior se existir
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer);
    }

    // Aplicar delay se configurado
    const delay = (this.config.delay || 0) * 1000;

    this.redirectTimer = setTimeout(() => {
      this.performUniversalRedirect(this.config!.url);
    }, delay);
  }

  /**
   * Executa redirecionamento universal compatível com todos os dispositivos
   */
  private performUniversalRedirect(url: string) {
    try {
      // Normalizar URL
      const redirectUrl = this.normalizeUrl(url);
      
      // Log para debug
      if (process.env.NODE_ENV === 'development') {
        console.log('🚀 Executando BackRedirect para:', redirectUrl);
      }

      // Método 1: window.location.href (mais compatível)
      if (typeof window !== 'undefined') {
        window.location.href = redirectUrl;
        
        // Método 2: Fallback para casos específicos
        setTimeout(() => {
          if (window.location.href !== redirectUrl) {
            window.location.replace(redirectUrl);
          }
        }, 100);

        // Método 3: Fallback adicional para WebViews
        setTimeout(() => {
          if (window.location.href !== redirectUrl) {
            window.open(redirectUrl, '_self');
          }
        }, 200);

        // Método 4: Fallback para apps sociais (Instagram, Facebook, etc.)
        setTimeout(() => {
          if (window.location.href !== redirectUrl) {
            window.top!.location.href = redirectUrl;
          }
        }, 300);

        // Método 5: Fallback final usando história do navegador
        setTimeout(() => {
          if (window.location.href !== redirectUrl) {
            window.history.pushState(null, '', redirectUrl);
            window.location.reload();
          }
        }, 500);
      }

    } catch (error) {
      console.error('❌ Erro no BackRedirect:', error);
      
      // Fallback de emergência
      if (typeof window !== 'undefined') {
        try {
          window.location.href = url;
        } catch (fallbackError) {
          console.error('❌ Erro no fallback do BackRedirect:', fallbackError);
        }
      }
    }
  }

  /**
   * Normaliza URL para garantir formato correto
   */
  private normalizeUrl(url: string): string {
    // Remover espaços em branco
    url = url.trim();
    
    // Adicionar protocolo se não existir
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    return url;
  }

  /**
   * Detecta se está rodando em WebView de app social
   */
  private isInAppBrowser(): boolean {
    if (typeof window === 'undefined') return false;
    
    const userAgent = window.navigator.userAgent.toLowerCase();
    
    // Detectar WebViews de apps sociais
    const socialApps = [
      'fban',      // Facebook
      'fbav',      // Facebook
      'instagram', // Instagram
      'tiktok',    // TikTok
      'whatsapp',  // WhatsApp
      'line',      // LINE
      'wechat',    // WeChat
      'twitter',   // Twitter
      'telegram',  // Telegram
      'snapchat'   // Snapchat
    ];
    
    return socialApps.some(app => userAgent.includes(app));
  }

  /**
   * Detecta se é dispositivo móvel
   */
  private isMobile(): boolean {
    if (typeof window === 'undefined') return false;
    
    const userAgent = window.navigator.userAgent.toLowerCase();
    
    return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/.test(userAgent);
  }

  /**
   * Reseta o sistema (para testes)
   */
  reset() {
    this.hasRedirected = false;
    this.config = null;
    
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer);
      this.redirectTimer = null;
    }
  }

  /**
   * Verifica se pode executar redirecionamento
   */
  canRedirect(): boolean {
    return !!(this.config && this.config.enabled && this.config.url && !this.hasRedirected);
  }
}

// Exportar instância singleton
export const backRedirectManager = BackRedirectManager.getInstance();

// Tipos para TypeScript
export type { BackRedirectConfig };