
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth-jwt";
import { Loader2, Mail, Lock, User } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [rememberPassword, setRememberPassword] = useState(false);
  const [registerData, setRegisterData] = useState({ 
    email: "", 
    password: "", 
    firstName: "", 
    lastName: "" 
  });
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login, register } = useAuth();

  // Carregar dados salvos ao montar o componente
  useEffect(() => {
    const savedCredentials = localStorage.getItem('vendzz_saved_credentials');
    if (savedCredentials) {
      try {
        const { email, password, remember } = JSON.parse(savedCredentials);
        if (remember) {
          setLoginData({ email, password });
          setRememberPassword(true);
        }
      } catch (error) {
        console.log('Erro ao carregar credenciais salvas:', error);
      }
    }
  }, []);

  // Limpar credenciais quando o usuário desmarca "Lembrar senha"
  const handleRememberPasswordChange = (checked: boolean | "indeterminate") => {
    const isChecked = checked === true;
    setRememberPassword(isChecked);
    if (!isChecked) {
      localStorage.removeItem('vendzz_saved_credentials');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Starting login process...");
      await login(loginData.email, loginData.password);
      console.log("Login successful");
      
      // Salvar ou limpar credenciais baseado na escolha do usuário
      if (rememberPassword) {
        localStorage.setItem('vendzz_saved_credentials', JSON.stringify({
          email: loginData.email,
          password: loginData.password,
          remember: true
        }));
      } else {
        localStorage.removeItem('vendzz_saved_credentials');
      }
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para dashboard...",
      });
      
      // Redirecionamento agora é feito automaticamente pelo hook de autenticação
      
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Erro no login",
        description: error.message || "Credenciais inválidas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register(registerData);
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Redirecionando para dashboard...",
      });
      
      // Redirecionamento agora é feito automaticamente pelo hook de autenticação
      
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Erro ao criar conta",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            <img 
              src="https://vendzz.com.br/wp-content/uploads/2024/12/logo-vendzz.png" 
              alt="Vendzz" 
              className="h-10 object-contain"
            />
          </CardTitle>
          <CardDescription>
            Entre na sua conta ou crie uma nova
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4" autoComplete="on">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember-password"
                    checked={rememberPassword}
                    onCheckedChange={handleRememberPasswordChange}
                  />
                  <Label htmlFor="remember-password" className="text-sm font-normal">
                    Lembrar senha
                  </Label>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Entrar
                </Button>
                <div className="text-center mt-4">
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline"
                    onClick={() => {
                      const email = prompt('Digite seu email para recuperar a senha:');
                      if (email) {
                        // TODO: Implementar endpoint de recuperação
                        toast({
                          title: "Email enviado",
                          description: "Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.",
                        });
                      }
                    }}
                  >
                    Esqueceu a senha?
                  </button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4" autoComplete="on">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-firstName">Nome</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-firstName"
                        name="firstName"
                        placeholder="João"
                        className="pl-10"
                        value={registerData.firstName}
                        onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                        autoComplete="given-name"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-lastName">Sobrenome</Label>
                    <Input
                      id="register-lastName"
                      name="lastName"
                      placeholder="Silva"
                      value={registerData.lastName}
                      onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                      autoComplete="family-name"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      autoComplete="new-password"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Conta
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
