import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { toast } = useToast();

  const authMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; name?: string }) => {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const response = await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
      return response;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      toast({
        title: isRegister ? "Conta criada com sucesso!" : "Login realizado!",
        description: isRegister ? "Sua conta foi criada. Bem-vindo ao Vendzz!" : "Bem-vindo de volta!"
      });
      window.location.href = "/dashboard";
    },
    onError: (error: any) => {
      toast({
        title: "Erro na autenticação",
        description: error.message || "Verifique suas credenciais e tente novamente.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      authMutation.mutate({ email, password, name });
    } else {
      authMutation.mutate({ email, password });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            {isRegister ? "Criar conta" : "Entrar no Vendzz"}
          </CardTitle>
          <CardDescription className="text-center">
            {isRegister 
              ? "Crie sua conta e comece a criar quizzes incríveis"
              : "Entre na sua conta para acessar seus quizzes"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isRegister}
                />
              </div>
            )}
            
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
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              disabled={authMutation.isPending}
            >
              {authMutation.isPending ? (
                "Processando..."
              ) : isRegister ? (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Criar conta
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            {isRegister ? (
              <>
                Já tem uma conta?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto text-green-600 hover:text-green-700"
                  onClick={() => setIsRegister(false)}
                >
                  Faça login
                </Button>
              </>
            ) : (
              <>
                Não tem uma conta?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto text-green-600 hover:text-green-700"
                  onClick={() => setIsRegister(true)}
                >
                  Criar conta
                </Button>
              </>
            )}
          </div>

          <div className="mt-6 text-center">
            <Link href="/">
              <Button variant="ghost" size="sm">
                ← Voltar ao início
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}