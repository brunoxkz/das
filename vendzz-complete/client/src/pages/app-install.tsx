import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Smartphone, Download, ArrowRight, CheckCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth-jwt';

export default function AppInstall() {
  const [, setLocation] = useLocation();
  const [showInstallPrompt, setShowInstallPrompt] = useState(true);
  const [installStep, setInstallStep] = useState(1);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const { isAuthenticated } = useAuth();

  // Se já estiver autenticado, redirecionar para PWA dashboard
  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/pwa');
    }
  }, [isAuthenticated, setLocation]);

  // Detectar se pode instalar como PWA
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallStep(2);
        setTimeout(() => setInstallStep(3), 1500);
      }
      setDeferredPrompt(null);
    } else {
      // Para iOS Safari ou outros browsers
      setInstallStep(2);
      setTimeout(() => setInstallStep(3), 2000);
    }
  };

  const getInstallInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isChrome = /chrome/.test(userAgent);

    if (isIOS && isSafari) {
      return {
        icon: '🍎',
        title: 'iPhone/iPad (Safari)',
        steps: [
          'Toque no botão "Compartilhar" (quadrado com seta)',
          'Role para baixo e toque em "Adicionar à Tela de Início"',
          'Confirme tocando em "Adicionar"'
        ]
      };
    } else if (isAndroid && isChrome) {
      return {
        icon: '🤖',
        title: 'Android (Chrome)',
        steps: [
          'Toque no menu (três pontos) no canto superior direito',
          'Selecione "Instalar app" ou "Adicionar à tela inicial"',
          'Confirme a instalação'
        ]
      };
    } else {
      return {
        icon: '💻',
        title: 'Desktop/Outros',
        steps: [
          'Clique no ícone de instalação na barra de endereços',
          'Ou acesse Menu > Instalar Vendzz',
          'Confirme a instalação'
        ]
      };
    }
  };

  const instructions = getInstallInstructions();

  if (installStep === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center animate-fadeIn">
          <CardContent className="p-8">
            <div className="animate-bounce mb-6">
              <CheckCircle className="w-16 h-16 mx-auto text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              ✅ App Instalado!
            </h1>
            
            <p className="text-gray-600 mb-6">
              Vendzz foi adicionado à sua tela inicial. Agora faça login para acessar suas campanhas e receber notificações em tempo real.
            </p>

            <Button 
              onClick={() => setLocation('/login')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Fazer Login <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (installStep === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center animate-pulse">
          <CardContent className="p-8">
            <div className="animate-spin mb-6">
              <Smartphone className="w-16 h-16 mx-auto text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Instalando...
            </h1>
            
            <div className="space-y-3 text-left">
              <h3 className="font-semibold text-gray-700 flex items-center">
                <span className="mr-2">{instructions.icon}</span>
                {instructions.title}
              </h3>
              
              <div className="space-y-2">
                {instructions.steps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-gray-600 text-sm">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center animate-fadeIn">
        <CardContent className="p-8">
          <div className="animate-bounce mb-6">
            <Smartphone className="w-16 h-16 mx-auto text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Bem-vindo ao Vendzz
          </h1>
          
          <p className="text-green-100 mb-8">
            Instale nosso app para receber notificações em tempo real sobre seus leads e campanhas
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-3 text-white">
              <CheckCircle className="w-5 h-5 text-green-200" />
              <span>📱 Notificações push em tempo real</span>
            </div>
            
            <div className="flex items-center space-x-3 text-white">
              <CheckCircle className="w-5 h-5 text-green-200" />
              <span>⚡ Acesso rápido offline</span>
            </div>
            
            <div className="flex items-center space-x-3 text-white">
              <CheckCircle className="w-5 h-5 text-green-200" />
              <span>🚀 Performance otimizada</span>
            </div>
          </div>

          <div className="space-y-3">
            {isInstallable && (
              <Button 
                onClick={handleInstallClick}
                className="w-full bg-white text-green-600 hover:bg-green-50 font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                <Download className="mr-2 w-5 h-5" />
                Instalar App
              </Button>
            )}
            
            <Button 
              onClick={() => setLocation('/login')}
              variant="outline"
              className="w-full border-2 border-white text-white hover:bg-white hover:text-green-600 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Continuar no Navegador
            </Button>
          </div>
          
          <p className="text-green-100 text-xs mt-6">
            Ao instalar, você aceita receber notificações sobre seus funis
          </p>
        </CardContent>
      </Card>
    </div>
  );
}