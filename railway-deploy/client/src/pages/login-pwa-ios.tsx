import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth-jwt";
import { Loader2, Mail, Lock, Smartphone, Bell } from "lucide-react";

export default function LoginPWAiOS() {
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(loginData.email, loginData.password);
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para notificações PWA...",
      });
      
      // Sempre redirecionar para notificações PWA no iOS
      setTimeout(() => setLocation('/pwa-push-notifications'), 100);
      
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Erro no login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header PWA */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-green-600 rounded-xl mx-auto flex items-center justify-center shadow-lg">
            <Bell className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vendzz PWA</h1>
            <p className="text-gray-600">Notificações Push para iOS</p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center">Entrar no PWA</CardTitle>
            <CardDescription className="text-center">
              Faça login para ativar notificações push
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <Smartphone className="mr-2 h-4 w-4" />
                    Entrar no PWA
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* iOS PWA Info */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <Bell className="h-6 w-6 text-green-600 mx-auto" />
              <p className="text-sm text-green-800 font-medium">
                Login PWA para iOS
              </p>
              <p className="text-xs text-green-700">
                Após o login, você poderá ativar notificações push que funcionam mesmo com o app fechado
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Credenciais de teste */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Teste: admin@vendzz.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
}