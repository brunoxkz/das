/**
 * SISTEMA BACKREDIRECT UNIVERSAL
 * Intercepta o botão voltar do navegador e redireciona para URL configurada
 * Compatibilidade total com todos os dispositivos móveis e apps sociais
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
  private isActive = false;
  private historyManipulated = false;
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
   * O sistema só é ativado se enabled for true
   */
  configure(config: BackRedirectConfig) {
    this.config = config;
    
    // Log para debug (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 BackRedirect configurado:', config);
    }

    // Só ativar se habilitado pelo usuário
    if (config.enabled && config.url) {
      this.activate();
    } else {
      this.deactivate();
    }
  }

  /**
   * Ativa o sistema de interceptação do botão voltar
   */
  private activate() {
    if (this.isActive) return;
    
    this.isActive = true;
    
    // Configurar interceptação do botão voltar
    this.setupBackButtonInterception();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 BackRedirect ativado - interceptando botão voltar');
    }
  }

  /**
   * Desativa o sistema de interceptação
   */
  private deactivate() {
    if (!this.isActive) return;
    
    this.isActive = false;
    this.removeAllListeners();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 BackRedirect desativado');
    }
  }

  /**
   * Configura interceptação do botão voltar para todos os navegadores móveis
   */
  private setupBackButtonInterception() {
    // Método 1: Manipulação do histórico (funciona na maioria dos casos)
    this.addHistoryEntry();
    
    // Método 2: Listener para popstate (iOS Safari, Chrome móvel)
    window.addEventListener('popstate', this.handleBackButton.bind(this), false);
    
    // Método 3: Listener para beforeunload (Android WebView)
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this), false);
    
    // Método 4: Listener para pagehide (iOS Safari específico)
    window.addEventListener('pagehide', this.handlePageHide.bind(this), false);
    
    // Método 5: Interceptação via hash change (fallback para navegadores antigos)
    window.addEventListener('hashchange', this.handleHashChange.bind(this), false);
    
    // Método 6: Interceptação via visibilitychange (apps sociais)
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this), false);
  }

  /**
   * Adiciona entrada no histórico para interceptar botão voltar
   */
  private addHistoryEntry() {
    if (!this.historyManipulated && typeof window !== 'undefined') {
      try {
        // Adicionar entrada no histórico
        history.pushState(null, '', window.location.href);
        this.historyManipulated = true;
        
        // Para navegadores que requerem múltiplas entradas (iOS Safari)
        setTimeout(() => {
          if (this.isActive) {
            history.pushState(null, '', window.location.href);
          }
        }, 100);
      } catch (error) {
        console.error('Erro ao manipular histórico:', error);
      }
    }
  }

  /**
   * Manipula evento de voltar do navegador
   */
  private handleBackButton(event: PopStateEvent) {
    if (!this.isActive || !this.config || !this.config.enabled) return;
    
    console.log('🔄 Botão voltar detectado - executando BackRedirect');
    
    // Prevenir navegação padrão
    event.preventDefault();
    event.stopPropagation();
    
    // Adicionar nova entrada no histórico para "prender" o usuário
    this.addHistoryEntry();
    
    // Executar redirecionamento
    this.executeRedirect();
  }

  /**
   * Manipula evento beforeunload (Android WebView)
   */
  private handleBeforeUnload(event: BeforeUnloadEvent) {
    if (!this.isActive || !this.config || !this.config.enabled) return;
    
    console.log('🔄 BeforeUnload detectado - executando BackRedirect');
    
    // Executar redirecionamento imediatamente
    this.executeRedirect();
    
    // Prevenir navegação padrão
    event.preventDefault();
    event.returnValue = '';
  }

  /**
   * Manipula evento pagehide (iOS Safari)
   */
  private handlePageHide(event: PageTransitionEvent) {
    if (!this.isActive || !this.config || !this.config.enabled) return;
    
    console.log('🔄 PageHide detectado - executando BackRedirect');
    
    // Executar redirecionamento
    this.executeRedirect();
  }

  /**
   * Manipula mudança de hash (fallback)
   */
  private handleHashChange(event: HashChangeEvent) {
    if (!this.isActive || !this.config || !this.config.enabled) return;
    
    console.log('🔄 HashChange detectado - executando BackRedirect');
    
    // Executar redirecionamento
    this.executeRedirect();
  }

  /**
   * Manipula mudança de visibilidade (apps sociais)
   */
  private handleVisibilityChange() {
    if (!this.isActive || !this.config || !this.config.enabled) return;
    
    if (document.hidden) {
      console.log('🔄 Página oculta detectada - executando BackRedirect');
      
      // Executar redirecionamento
      this.executeRedirect();
    }
  }

  /**
   * Executa o redirecionamento
   */
  private executeRedirect() {
    if (!this.config || !this.config.url) return;

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
          if (window.location.href !== redirectUrl && window.top) {
            window.top.location.href = redirectUrl;
          }
        }, 300);

        // Método 5: Método específico para iOS Safari
        setTimeout(() => {
          if (window.location.href !== redirectUrl) {
            if (this.isIOS()) {
              window.location.assign(redirectUrl);
            } else {
              window.location.href = redirectUrl;
            }
          }
        }, 400);

        // Método 6: Fallback final usando form submission
        setTimeout(() => {
          if (window.location.href !== redirectUrl) {
            try {
              const form = document.createElement('form');
              form.method = 'GET';
              form.action = redirectUrl;
              form.style.display = 'none';
              document.body.appendChild(form);
              form.submit();
              document.body.removeChild(form);
            } catch (error) {
              console.error('Erro no fallback form:', error);
            }
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
   * Detecta se está rodando no iOS
   */
  private isIOS(): boolean {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(window.navigator.userAgent);
  }

  /**
   * Detecta se está rodando no Android
   */
  private isAndroid(): boolean {
    if (typeof window === 'undefined') return false;
    return /Android/.test(window.navigator.userAgent);
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
   * Remove todos os listeners
   */
  private removeAllListeners() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('popstate', this.handleBackButton.bind(this), false);
      window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this), false);
      window.removeEventListener('pagehide', this.handlePageHide.bind(this), false);
      window.removeEventListener('hashchange', this.handleHashChange.bind(this), false);
    }
    
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this), false);
    }
  }

  /**
   * Reseta o sistema (para testes)
   */
  reset() {
    this.deactivate();
    this.config = null;
    this.historyManipulated = false;
    
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer);
      this.redirectTimer = null;
    }
  }

  /**
   * Verifica se pode executar redirecionamento
   */
  canRedirect(): boolean {
    return !!(this.config && this.config.enabled && this.config.url && this.isActive);
  }
}

// Exportar instância singleton
export const backRedirectManager = BackRedirectManager.getInstance();

// Tipos para TypeScript
export type { BackRedirectConfig };