import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import logoVendzz from '@assets/logo-vendzz-white_1753041219534.png';
import PWAInstallModal from '@/components/PWAInstallModal';

export default function LoginPWA() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  // Estados do login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados PWA
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [installPromptShown, setInstallPromptShown] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se é mobile e mostrar modal primeiro
  useEffect(() => {
    // Detectar mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent;
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      setIsMobile(mobile);
      return mobile;
    };

    const mobile = checkMobile();
    
    // Verificar se o modal já foi mostrado nesta sessão
    const hasShownInstallPrompt = sessionStorage.getItem('vendzz_install_prompt_shown');
    
    if (mobile && !hasShownInstallPrompt && !installPromptShown) {
      // Mostrar modal após 1 segundo para dispositivos móveis
      setTimeout(() => {
        setShowInstallModal(true);
        setInstallPromptShown(true);
      }, 1000);
    }
  }, [installPromptShown]);

  // Capturar evento beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Redirecionar se já autenticado
  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/app-pwa-vendzz';
    }
  }, [isAuthenticated]);

  // Funções do Modal de Instalação
  const handleInstallModalClose = () => {
    setShowInstallModal(false);
    sessionStorage.setItem('vendzz_install_prompt_shown', 'true');
  };

  const handleInstallFromModal = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        toast({
          title: "App Instalado!",
          description: "Vendzz foi adicionado à sua tela inicial.",
        });
      }
    }
    handleInstallModalClose();
  };

  // Função de login
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiRequest('POST', '/api/auth/login', {
        email,
        password
      });

      if (response.ok) {
        const data = await response.json();
        
        // Salvar tokens
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o app...",
        });

        // Redirecionar para o PWA
        setTimeout(() => {
          window.location.href = '/app-pwa-vendzz';
        }, 1000);
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro no login",
          description: errorData.message || "Credenciais inválidas",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src={logoVendzz} 
            alt="Vendzz" 
            className="h-16 w-auto mx-auto mb-4"
          />
          <p className="text-gray-400 text-sm">
            {isMobile ? 'Acesso Mobile' : 'Plataforma de Quiz e Marketing'}
          </p>
        </div>

        {/* Card de Login */}
        <Card className="bg-gray-900/50 border-green-500/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-green-400">
              Entrar no App
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
                    required
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Botão de Login */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3"
              >
                {isLoading ? 'Entrando...' : 'Entrar no App'}
              </Button>
            </form>

            {/* Links */}
            <div className="mt-6 text-center space-y-2">
              <button className="text-green-400 hover:text-green-300 text-sm">
                Esqueci minha senha
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Indicador Mobile */}
        {isMobile && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-xs font-medium">
                Versão Mobile Detectada
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Modal PWA Install */}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={handleInstallModalClose}
        onInstall={handleInstallFromModal}
      />
    </div>
  );
}