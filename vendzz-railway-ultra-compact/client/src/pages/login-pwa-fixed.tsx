import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import logoVendzz from '@assets/logo-vendzz-white-ezgif.com-crop_1753045147057.png';
import PWAInstallModal from '@/components/PWAInstallModal';

export default function LoginPWA() {
  const { toast } = useToast();

  // Função para solicitar permissão de notificação automaticamente
  const requestNotificationPermission = async () => {
    console.log('🔔 [DEBUG] Iniciando solicitação de notificação');
    console.log('🔔 [DEBUG] User Agent:', navigator.userAgent);
    console.log('🔔 [DEBUG] Platform:', navigator.platform);
    console.log('🔔 [DEBUG] PWA Mode:', window.matchMedia('(display-mode: standalone)').matches);
    
    if (!('Notification' in window)) {
      console.log('🔔 [ERROR] Notificações não suportadas neste dispositivo');
      toast({
        title: "Notificações não suportadas",
        description: "Seu dispositivo não suporta notificações web",
        variant: "destructive"
      });
      return;
    }

    console.log('🔔 [DEBUG] Permissão atual:', Notification.permission);

    if (Notification.permission === 'granted') {
      console.log('🔔 [SUCCESS] Permissão já concedida');
      
      try {
        // Testar notificação
        const notification = new Notification('Vendzz - Notificações Ativas!', {
          body: 'Sistema funcionando perfeitamente.',
          icon: '/vendzz-logo-official.png',
          tag: 'test'
        });
        
        console.log('🔔 [SUCCESS] Notificação de teste enviada');
        
        // Fechar após 3 segundos
        setTimeout(() => {
          notification.close();
        }, 3000);
        
      } catch (notError) {
        console.error('🔔 [ERROR] Erro ao criar notificação de teste:', notError);
      }
      return;
    }

    if (Notification.permission === 'denied') {
      console.log('🔔 [WARNING] Permissão negada pelo usuário anteriormente');
      toast({
        title: "Notificações bloqueadas",
        description: "Permissão foi negada. Ative nas configurações do navegador.",
        variant: "destructive"
      });
      return;
    }

    if (Notification.permission === 'default') {
      console.log('🔔 [DEBUG] Solicitando permissão...');
      
      try {
        let permission: NotificationPermission;
        
        console.log('🔔 [DEBUG] Tipo de requestPermission:', typeof Notification.requestPermission);
        console.log('🔔 [DEBUG] Length de requestPermission:', Notification.requestPermission.length);
        
        // Método específico para iOS Safari/PWA
        if (typeof Notification.requestPermission === 'function') {
          if (Notification.requestPermission.length) {
            console.log('🔔 [DEBUG] Usando método callback (iOS)');
            // Versão callback (iOS Safari)
            permission = await new Promise((resolve) => {
              Notification.requestPermission((result) => {
                console.log('🔔 [DEBUG] Callback result:', result);
                resolve(result);
              });
            });
          } else {
            console.log('🔔 [DEBUG] Usando método Promise (moderno)');
            // Versão Promise (navegadores modernos)
            permission = await Notification.requestPermission();
          }

          console.log('🔔 [DEBUG] Permissão resultado:', permission);

          if (permission === 'granted') {
            console.log('🔔 [SUCCESS] Permissão concedida!');
            
            toast({
              title: "Notificações ativadas!",
              description: "Você receberá atualizações importantes.",
            });
            
            try {
              // Mostrar notificação de boas-vindas
              const welcomeNotification = new Notification('Vendzz - Bem-vindo!', {
                body: 'Notificações ativadas com sucesso. Você receberá updates importantes.',
                icon: '/vendzz-logo-official.png',
                badge: '/vendzz-logo-official.png',
                tag: 'welcome',
                requireInteraction: false
              });
              
              console.log('🔔 [SUCCESS] Notificação de boas-vindas criada');
              
              // Fechar após 5 segundos
              setTimeout(() => {
                welcomeNotification.close();
              }, 5000);
              
            } catch (notError: any) {
              console.error('🔔 [ERROR] Erro ao criar notificação de boas-vindas:', notError);
              toast({
                title: "Erro ao enviar notificação",
                description: `Detalhes: ${notError?.message || 'Erro desconhecido'}`,
                variant: "destructive"
              });
            }
            
          } else if (permission === 'denied') {
            console.log('🔔 [WARNING] Permissão negada pelo usuário');
            toast({
              title: "Notificações negadas",
              description: "Você optou por não receber notificações.",
              variant: "destructive"
            });
          } else {
            console.log('🔔 [WARNING] Permissão padrão mantida');
            toast({
              title: "Notificações não configuradas",
              description: "Permissão não foi concedida.",
              variant: "destructive"
            });
          }
        } else {
          console.error('🔔 [ERROR] Função requestPermission não disponível');
          toast({
            title: "Erro de compatibilidade",
            description: "Função de notificação não está disponível neste navegador.",
            variant: "destructive"
          });
        }
      } catch (error: any) {
        console.error('🔔 [ERROR] Erro ao solicitar permissão:', error);
        console.error('🔔 [ERROR] Stack trace:', error?.stack);
        toast({
          title: "Erro ao ativar notificações",
          description: `Detalhes técnicos: ${error?.message || 'Erro desconhecido'}`,
          variant: "destructive"
        });
      }
    }
  };
  const { isAuthenticated } = useAuth();
  
  // Estados do login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados do cadastro
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estados PWA
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [installPromptShown, setInstallPromptShown] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
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

  // Redirecionar se já autenticado
  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/app-pwa-vendzz';
    }
  }, [isAuthenticated]);

  // Capturar evento beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

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
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Starting login process...');
    
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful');
        
        // Salvar tokens com nomes corretos
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o app...",
        });

        // Solicitar permissão de notificação automaticamente após login bem-sucedido
        console.log('🔔 [LOGIN] Agendando solicitação de notificação em 1 segundo...');
        setTimeout(() => {
          console.log('🔔 [LOGIN] Executando solicitação de notificação...');
          requestNotificationPermission();
        }, 1000);

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
      console.error('Query error:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função de cadastro
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Salvar tokens
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Redirecionando para o app...",
        });

        // Redirecionar para o PWA
        setTimeout(() => {
          window.location.href = '/app-pwa-vendzz';
        }, 1000);
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro no cadastro",
          description: errorData.message || "Erro ao criar conta",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
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
      {/* Modal de Instalação PWA */}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={handleInstallModalClose}
        onInstall={handleInstallFromModal}

        isMobile={isMobile}
      />
      
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

        {/* Card de Login/Cadastro */}
        <Card className="bg-gray-900/50 border-green-500/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-green-400">
              {isRegisterMode ? 'Criar Conta' : 'Entrar no App'}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="space-y-4">
              {/* Campos do cadastro */}
              {isRegisterMode && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-300 text-sm">Nome</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
                      placeholder="Nome"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-300 text-sm">Sobrenome</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
                      placeholder="Sobrenome"
                      required
                    />
                  </div>
                </div>
              )}

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
                    placeholder="Sua senha"
                    className="pl-10 pr-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmar senha (apenas no cadastro) */}
              {isRegisterMode && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-300">Confirmar Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme sua senha"
                      className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Botão de submit */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-green-500/25"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{isRegisterMode ? 'Criando conta...' : 'Entrando...'}</span>
                  </div>
                ) : (
                  isRegisterMode ? 'Criar Conta' : 'Entrar no App'
                )}
              </Button>
            </form>

            {/* Link para alternar entre login/cadastro */}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  // Limpar campos ao trocar de modo
                  setEmail('');
                  setPassword('');
                  setFirstName('');
                  setLastName('');
                  setConfirmPassword('');
                }}
                className="text-green-400 hover:text-green-300 font-medium text-sm transition-colors"
              >
                {isRegisterMode 
                  ? 'Já tem uma conta? Clique aqui para entrar'
                  : 'Não tem conta? Clique aqui para criar'
                }
              </button>
            </div>

            {/* Credenciais de teste */}
            {!isRegisterMode && (
              <div className="mt-4 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                <p className="text-gray-400 text-xs text-center mb-1">Credenciais de teste:</p>
                <p className="text-green-400 text-xs text-center font-mono">admin@vendzz.com / Btts4381!</p>
              </div>
            )}

            {/* Informações PWA */}
            {isMobile && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400 text-xs text-center">
                  💡 Instale o Vendzz em seu celular para uma experiência completa!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-xs">
            © 2025 Vendzz. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}