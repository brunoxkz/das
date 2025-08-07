/**
 * ANTI-WEBVIEW GENERATOR
 * Sistema avançado de geração de scripts para detectar WebView e redirecionar para navegador externo
 * Baseado na documentação técnica oficial do projeto Anti-WebView
 */

export interface AntiWebViewConfig {
  enabled: boolean;
  detectInstagram?: boolean;
  detectFacebook?: boolean;
  detectTikTok?: boolean;
  detectOthers?: boolean;
  enableIOS17?: boolean;
  enableOlderIOS?: boolean;
  enableAndroid?: boolean;
  safeMode?: boolean;
  redirectDelay?: number;
  debugMode?: boolean;
}

export class AntiWebViewGenerator {
  /**
   * Gera o script Anti-WebView baseado nas configurações do quiz
   */
  static generateScript(config: AntiWebViewConfig, baseUrl: string): string {
    if (!config.enabled) {
      return '';
    }

    const {
      detectInstagram = true,
      detectFacebook = true,
      detectTikTok = false,
      detectOthers = false,
      enableIOS17 = true,
      enableOlderIOS = true,
      enableAndroid = true,
      safeMode = true,
      redirectDelay = 0,
      debugMode = false
    } = config;

    return `
<script>
(function() {
  const openInBrowser = true;
  const debugMode = ${debugMode};
  const redirectDelay = ${redirectDelay};
  
  function log(message) {
    if (debugMode) {
      console.log('[Anti-WebView]', message);
    }
  }

  function executeRedirect() {
    const ua = navigator.userAgent.toLowerCase();
    const url = new URL(window.location.href);
    const alreadyRedirected = url.searchParams.get('redirected') === '1';
    
    log('User Agent: ' + ua);
    log('Already redirected: ' + alreadyRedirected);
    
    if (alreadyRedirected) {
      log('Redirecionamento já foi executado, parando');
      return;
    }

    // Detecção de WebViews
    const detections = {
      instagram: ${detectInstagram} && ua.includes('instagram'),
      facebook: ${detectFacebook} && (ua.includes('fban') || ua.includes('fbav')),
      tiktok: ${detectTikTok} && ua.includes('tiktok'),
      others: ${detectOthers} && (ua.includes('whatsapp') || ua.includes('linkedin') || ua.includes('twitter'))
    };
    
    const isWebView = detections.instagram || detections.facebook || detections.tiktok || detections.others;
    
    log('Detecções:', detections);
    log('É WebView:', isWebView);
    
    if (!openInBrowser || !isWebView) {
      log('Não é necessário redirecionar');
      return;
    }

    // Detecção de sistema operacional
    const isAndroid = ua.includes('android');
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const iOSVersion = parseInt((ua.match(/os (\\d+)_/i) || [])[1]) || 0;
    
    log('Sistema:', { isAndroid, isIOS, iOSVersion });

    // Verificação de modo seguro para Android antigo
    if (${safeMode} && isAndroid) {
      const androidMatch = ua.match(/android (\\d+)/i);
      const androidVersion = androidMatch ? parseInt(androidMatch[1]) : 0;
      if (androidVersion > 0 && androidVersion < 6) {
        log('Android muito antigo detectado (< 6), pulando redirecionamento por segurança');
        return;
      }
    }

    // Preservar todos os parâmetros UTM e adicionar flag de redirecionamento
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('redirected', '1');
    
    try {
      if (${enableIOS17} && isIOS && iOSVersion >= 17) {
        // iOS 17+ - Usar protocolo x-safari-
        const safariUrl = 'x-safari-' + newUrl.toString();
        log('Redirecionando via x-safari-:', safariUrl);
        window.location.href = safariUrl;
      } else if (${enableOlderIOS} && isIOS && iOSVersion < 17) {
        // iOS < 17 - Usar dummybytes
        const encodedUrl = encodeURIComponent(newUrl.toString());
        const dummyUrl = '${baseUrl}/dummybytes?target=' + encodedUrl;
        log('Redirecionando via dummybytes (iOS < 17):', dummyUrl);
        window.location.href = dummyUrl;
      } else if (${enableAndroid} && isAndroid) {
        // Android - Usar dummybytes
        const encodedUrl = encodeURIComponent(newUrl.toString());
        const dummyUrl = '${baseUrl}/dummybytes?target=' + encodedUrl;
        log('Redirecionando via dummybytes (Android):', dummyUrl);
        window.location.href = dummyUrl;
      } else {
        log('Sistema não suportado ou desabilitado');
      }
    } catch (error) {
      log('Erro durante redirecionamento:', error);
      // Fallback silencioso - continua carregando normalmente
    }
  }

  // Executar redirecionamento após delay configurado
  if (redirectDelay > 0) {
    log('Aguardando ' + redirectDelay + ' segundos antes do redirecionamento');
    setTimeout(executeRedirect, redirectDelay * 1000);
  } else {
    log('Executando redirecionamento imediato');
    executeRedirect();
  }
})();
</script>`.trim();
  }

  /**
   * Gera uma análise das configurações para preview
   */
  static analyzeConfig(config: AntiWebViewConfig): {
    platforms: string[];
    systems: string[];
    features: string[];
    warnings: string[];
  } {
    const platforms: string[] = [];
    const systems: string[] = [];
    const features: string[] = [];
    const warnings: string[] = [];

    if (!config.enabled) {
      warnings.push('Sistema Anti-WebView está desabilitado');
      return { platforms, systems, features, warnings };
    }

    // Análise de plataformas
    if (config.detectInstagram !== false) platforms.push('Instagram');
    if (config.detectFacebook !== false) platforms.push('Facebook');
    if (config.detectTikTok) platforms.push('TikTok');
    if (config.detectOthers) platforms.push('WhatsApp, LinkedIn, Twitter');

    if (platforms.length === 0) {
      warnings.push('Nenhuma plataforma de WebView selecionada');
    }

    // Análise de sistemas
    if (config.enableIOS17 !== false) systems.push('iOS 17+ (x-safari-)');
    if (config.enableOlderIOS !== false) systems.push('iOS < 17 (dummybytes)');
    if (config.enableAndroid !== false) systems.push('Android 10+ (dummybytes)');

    if (systems.length === 0) {
      warnings.push('Nenhum sistema operacional habilitado');
    }

    // Análise de recursos
    if (config.safeMode !== false) features.push('Modo Seguro (evita Android < 6)');
    if (config.debugMode) features.push('Logs de Debug');
    if (config.redirectDelay && config.redirectDelay > 0) {
      features.push(`Delay de ${config.redirectDelay}s`);
    } else {
      features.push('Redirecionamento Imediato');
    }

    return { platforms, systems, features, warnings };
  }

  /**
   * Gera estatísticas de compatibilidade
   */
  static getCompatibilityStats(config: AntiWebViewConfig): {
    coverage: number;
    riskLevel: 'low' | 'medium' | 'high';
    description: string;
  } {
    if (!config.enabled) {
      return {
        coverage: 0,
        riskLevel: 'high',
        description: 'Sistema desabilitado - nenhuma proteção ativa'
      };
    }

    let coverage = 0;
    let riskFactors = 0;

    // Cobertura de plataformas (40% do score)
    const platformCount = [
      config.detectInstagram !== false,
      config.detectFacebook !== false,
      config.detectTikTok,
      config.detectOthers
    ].filter(Boolean).length;
    coverage += (platformCount / 4) * 40;

    // Cobertura de sistemas (40% do score)
    const systemCount = [
      config.enableIOS17 !== false,
      config.enableOlderIOS !== false,
      config.enableAndroid !== false
    ].filter(Boolean).length;
    coverage += (systemCount / 3) * 40;

    // Recursos de segurança (20% do score)
    if (config.safeMode !== false) coverage += 20;

    // Fatores de risco
    if (!config.safeMode) riskFactors++;
    if (config.enableAndroid && config.enableOlderIOS) riskFactors++; // Risco mínimo para compatibilidade

    const riskLevel: 'low' | 'medium' | 'high' = 
      riskFactors === 0 ? 'low' : 
      riskFactors === 1 ? 'medium' : 'high';

    let description = '';
    if (coverage >= 80) {
      description = 'Cobertura excelente - máxima proteção e ROI';
    } else if (coverage >= 60) {
      description = 'Cobertura boa - proteção adequada';
    } else if (coverage >= 40) {
      description = 'Cobertura básica - funcional mas limitada';
    } else {
      description = 'Cobertura insuficiente - recomenda-se ativar mais opções';
    }

    return { coverage: Math.round(coverage), riskLevel, description };
  }
}

/**
 * Interface de configuração compatível com as props do quiz
 */
export interface QuizAntiWebViewData {
  antiWebViewEnabled?: boolean;
  detectInstagram?: boolean;
  detectFacebook?: boolean;
  detectTikTok?: boolean;
  detectOthers?: boolean;
  enableIOS17?: boolean;
  enableOlderIOS?: boolean;
  enableAndroid?: boolean;
  safeMode?: boolean;
  redirectDelay?: number;
  debugMode?: boolean;
}

/**
 * Converte dados do quiz para configuração do Anti-WebView
 */
export function convertQuizDataToConfig(quizData: QuizAntiWebViewData): AntiWebViewConfig {
  return {
    enabled: quizData.antiWebViewEnabled || false,
    detectInstagram: quizData.detectInstagram !== false,
    detectFacebook: quizData.detectFacebook !== false,
    detectTikTok: quizData.detectTikTok || false,
    detectOthers: quizData.detectOthers || false,
    enableIOS17: quizData.enableIOS17 !== false,
    enableOlderIOS: quizData.enableOlderIOS !== false,
    enableAndroid: quizData.enableAndroid !== false,
    safeMode: quizData.safeMode !== false,
    redirectDelay: quizData.redirectDelay || 0,
    debugMode: quizData.debugMode || false
  };
}