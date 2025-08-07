// Sistema de Detecção Automática de PWA para iOS e Android
// Detecta automaticamente se é PWA e redireciona para login apropriado

export interface PWADetectionResult {
  isIOSDevice: boolean;
  isAndroidDevice: boolean;
  isPWAMode: boolean;
  shouldUsePWALogin: boolean;
  deviceType: 'iOS' | 'Android' | 'Desktop';
  recommendedLoginPath: '/login' | '/pwa-login';
}

export class PWADetector {
  
  static detectDevice(): PWADetectionResult {
    const userAgent = navigator.userAgent || '';
    
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) || 
                       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    const isAndroidDevice = /Android/.test(userAgent);
    
    const isPWAMode = this.isPWAMode();
    
    // PWA Mode ou dispositivo mobile deveria usar PWA login por padrão
    const shouldUsePWALogin = isPWAMode || isIOSDevice || isAndroidDevice;
    
    const deviceType: 'iOS' | 'Android' | 'Desktop' = 
      isIOSDevice ? 'iOS' : 
      isAndroidDevice ? 'Android' : 
      'Desktop';
    
    const recommendedLoginPath: '/login' | '/pwa-login' = 
      shouldUsePWALogin ? '/pwa-login' : '/login';
    
    console.log(`📱 PWA DETECTOR: ${deviceType} - PWA Mode: ${isPWAMode} - Recomendado: ${recommendedLoginPath}`);
    
    return {
      isIOSDevice,
      isAndroidDevice,
      isPWAMode,
      shouldUsePWALogin,
      deviceType,
      recommendedLoginPath
    };
  }
  
  static isPWAMode(): boolean {
    // Múltiplas formas de detectar PWA
    return (
      // iOS Safari PWA
      (window.navigator as any).standalone === true ||
      // Android PWA
      window.matchMedia('(display-mode: standalone)').matches ||
      // PWA via manifest
      document.referrer.includes('android-app://') ||
      // Via query params (para debug)
      new URLSearchParams(window.location.search).has('pwa') ||
      // Via localStorage (persistente)
      localStorage.getItem('isPWA') === 'true'
    );
  }
  
  static async autoRegisterServiceWorker(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.log('❌ Service Worker não suportado neste dispositivo');
      return false;
    }
    
    try {
      const detection = this.detectDevice();
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });
      
      console.log(`✅ Service Worker auto-registrado - Dispositivo: ${detection.deviceType}`);
      
      // Configurar para dispositivos PWA
      if (detection.shouldUsePWALogin && registration.active) {
        registration.active.postMessage({
          type: 'AUTO_PWA_SETUP',
          deviceType: detection.deviceType,
          isPWA: detection.isPWAMode
        });
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao auto-registrar Service Worker:', error);
      return false;
    }
  }
  
  static getRecommendedAuthAction(): {
    action: 'redirect' | 'suggest' | 'none';
    path: string;
    message: string;
  } {
    const detection = this.detectDevice();
    
    if (detection.shouldUsePWALogin) {
      return {
        action: 'suggest',
        path: '/pwa-login',
        message: `Dispositivo ${detection.deviceType} detectado - Use PWA Login para tokens de 365 dias!`
      };
    }
    
    return {
      action: 'none',
      path: '/login',
      message: 'Login normal recomendado'
    };
  }
  
  static logDetectionDetails(): void {
    const detection = this.detectDevice();
    
    console.group('🔍 PWA DETECTION DETAILS');
    console.log('Device Type:', detection.deviceType);
    console.log('iOS Device:', detection.isIOSDevice);
    console.log('Android Device:', detection.isAndroidDevice);
    console.log('PWA Mode:', detection.isPWAMode);
    console.log('Should Use PWA Login:', detection.shouldUsePWALogin);
    console.log('Recommended Path:', detection.recommendedLoginPath);
    console.log('User Agent:', navigator.userAgent.substring(0, 100));
    console.log('Standalone:', (window.navigator as any).standalone);
    console.log('Display Mode:', window.matchMedia('(display-mode: standalone)').matches);
    console.groupEnd();
  }
}

// Auto-executar detecção quando script carregar
if (typeof window !== 'undefined') {
  // Aguardar DOM carregar para executar detecção
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      PWADetector.logDetectionDetails();
      PWADetector.autoRegisterServiceWorker();
    });
  } else {
    PWADetector.logDetectionDetails();
    PWADetector.autoRegisterServiceWorker();
  }
}