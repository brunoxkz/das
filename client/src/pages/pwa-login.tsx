import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { PWADetector } from '@/utils/pwa-detector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Smartphone, Bell, Shield, Clock } from 'lucide-react';

export default function PWALogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const [detectionResult, setDetectionResult] = useState<any>(null);
  const { toast } = useToast();

  // Auto-detectar dispositivo ao carregar página
  useEffect(() => {
    const detection = PWADetector.detectDevice();
    setDetectionResult(detection);
    
    // Registrar Service Worker automaticamente
    PWADetector.autoRegisterServiceWorker();
    
    console.log('🔍 PWA Login - Detecção automática:', detection);
  }, []);

  const handlePWALogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Usar detecção avançada
      const detection = detectionResult || PWADetector.detectDevice();
      const deviceType = detection.deviceType;
      
      console.log(`📱 PWA LOGIN: Dispositivo ${deviceType} - PWA Mode: ${detection.isPWAMode}`);

      const response = await fetch('/api/auth/pwa-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PWA-Mode': 'true',
          'X-Device-Type': deviceType,
          'X-Requested-With': 'PWA',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Armazenar token PWA de longa duração
        localStorage.setItem('authToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isPWA', 'true');
        localStorage.setItem('tokenExpiry', data.tokenExpiry);

        // Registrar Service Worker PERSISTENTE automaticamente após login PWA
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
              scope: '/',
              updateViaCache: 'none' // Sempre verificar atualizações
            });
            
            console.log('✅ Service Worker PERSISTENTE registrado após PWA login:', registration);
            
            // Configurar para sempre ficar ativo
            if (registration.active) {
              registration.active.postMessage({
                type: 'ENABLE_PERSISTENT_MODE',
                deviceType: deviceType,
                isPWA: true
              });
            }
            
            // Monitorar estado do Service Worker
            registration.addEventListener('updatefound', () => {
              console.log('🔄 Nova versão do Service Worker disponível');
            });
            
          } catch (swError) {
            console.error('❌ Erro ao registrar Service Worker:', swError);
          }
        }

        toast({
          title: `🎉 Login PWA Realizado! (${deviceType})`,
          description: `Token válido por ${data.tokenExpiry} - Notificações sempre ativas!`,
        });

        console.log('🔒 PWA LOGIN SUCCESS:', {
          isPWA: data.isPWA,
          tokenExpiry: data.tokenExpiry,
          notificationSupport: data.notificationSupport
        });

        // Redirecionar para dashboard
        setLocation('/dashboard');
      } else {
        throw new Error(data.message || 'Falha no login PWA');
      }
    } catch (error) {
      console.error('PWA Login error:', error);
      toast({
        title: "❌ Erro no Login PWA",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-2 border-green-200 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-800 dark:text-green-200">
              🚀 Login PWA Vendzz
            </CardTitle>
            <CardDescription className="text-center space-y-2">
              <p>Acesso especial para Progressive Web App com detecção automática</p>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-green-800 dark:text-green-200">
                    Sistema Inteligente {detectionResult && `(${detectionResult.deviceType})`}:
                  </span>
                </div>
                <ul className="text-left space-y-1 text-green-700 dark:text-green-300">
                  <li className="flex items-center gap-2">
                    <Smartphone className="w-3 h-3" />
                    {detectionResult?.isPWAMode ? '✅ PWA Mode Ativo' : '📱 Detecta iOS/Android automaticamente'}
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Token válido por 365 dias
                  </li>
                  <li className="flex items-center gap-2">
                    <Bell className="w-3 h-3" />
                    Service Worker sempre em segundo plano
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="w-3 h-3" />
                    Notificações funcionam mesmo após restart
                  </li>
                </ul>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePWALogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Entrando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Fazer Login PWA
                  </div>
                )}
              </Button>
            </form>
            
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => setLocation('/login')}
                  className="text-sm"
                >
                  Login Normal (15 min)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}