
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
// import { useLanguage } from "@/hooks/useLanguage";
import { Loader2, Mail, Lock, User, Phone, Shield } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [rememberPassword, setRememberPassword] = useState(false);
  const [registerData, setRegisterData] = useState({ 
    email: "", 
    password: "", 
    confirmPassword: "",
    firstName: "", 
    lastName: "",
    whatsapp: ""
  });
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState({ question: "", answer: 0 });
  const [isHuman, setIsHuman] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login, register } = useAuth();
  // const { t } = useLanguage();

  // Login normal - sem redirecionamentos automáticos para PWA
  // Removido o redirecionamento automático para permitir login normal em todos os dispositivos

  // Gerar captcha simples
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let answer;
    switch (operation) {
      case '+': answer = num1 + num2; break;
      case '-': answer = num1 - num2; break;
      case '*': answer = num1 * num2; break;
      default: answer = num1 + num2;
    }
    
    setCaptchaQuestion({
      question: `${num1} ${operation} ${num2} = ?`,
      answer: answer
    });
    setCaptchaAnswer("");
  };

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
    
    // Gerar captcha inicial
    generateCaptcha();
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
        description: "Redirecionando...",
      });
      
      // Verificar se há redirecionamento salvo
      const redirectUrl = localStorage.getItem('loginRedirect');
      if (redirectUrl) {
        localStorage.removeItem('loginRedirect');
        setTimeout(() => setLocation(redirectUrl), 100);
      } else {
        setTimeout(() => setLocation('/dashboard'), 100);
      }
      
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Erro no login",
        description: error.message || "Erro no login",
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
      // Validações front-end
      if (registerData.password !== registerData.confirmPassword) {
        toast({
          title: "Erro no registro",
          description: "As senhas não coincidem",
          variant: "destructive",
        });
        return;
      }

      if (registerData.password.length < 6) {
        toast({
          title: "Erro de validação",
          description: "A senha deve ter pelo menos 6 caracteres",
          variant: "destructive",
        });
        return;
      }

      if (parseInt(captchaAnswer) !== captchaQuestion.answer) {
        toast({
          title: "Erro no registro",
          description: "Resposta do captcha incorreta",
          variant: "destructive",
        });
        generateCaptcha(); // Gerar nova pergunta
        return;
      }

      if (!isHuman) {
        toast({
          title: "Erro de validação",
          description: "Por favor, confirme que você não é um robô",
          variant: "destructive",
        });
        return;
      }

      // Remover confirmPassword antes de enviar
      const { confirmPassword, ...dataToSend } = registerData;
      await register(dataToSend);
      
      toast({
        title: "Registro realizado com sucesso!",
        description: "Redirecionando para dashboard...",
      });
      
      // Redirecionamento agora é feito automaticamente pelo hook de autenticação
      
    } catch (error: any) {
      toast({
        title: "Erro no registro",
        description: error.message || "Erro no registro",
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
          <div className="flex justify-center mb-4">
            <img 
              src="https://vendzz.com.br/wp-content/uploads/2024/12/logo-vendzz.png" 
              alt="Vendzz" 
              className="h-16 w-auto"
            />
          </div>
          <CardDescription>
            Plataforma de Quiz Marketing para Captação de Leads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Criar Conta</TabsTrigger>
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
                    Esqueci minha senha
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
                  <Label htmlFor="register-whatsapp">WhatsApp</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-whatsapp"
                      name="whatsapp"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      className="pl-10"
                      value={registerData.whatsapp}
                      onChange={(e) => setRegisterData({ ...registerData, whatsapp: e.target.value })}
                      autoComplete="tel"
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
                <div className="space-y-2">
                  <Label htmlFor="register-confirmPassword">Confirmar Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      autoComplete="new-password"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                
                {/* Sistema Anti-Bot */}
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="human-check"
                      checked={isHuman}
                      onCheckedChange={(checked) => setIsHuman(checked === true)}
                    />
                    <Label htmlFor="human-check" className="text-sm font-medium">
                      Não sou um robô
                    </Label>
                    <Shield className="h-4 w-4 text-green-500" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="captcha" className="text-sm font-medium">
                      Resolva esta operação para continuar:
                    </Label>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold bg-blue-100 px-3 py-1 rounded">
                        {captchaQuestion.question}
                      </span>
                      <Input
                        id="captcha"
                        type="number"
                        placeholder="Resposta"
                        className="w-24"
                        value={captchaAnswer}
                        onChange={(e) => setCaptchaAnswer(e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateCaptcha}
                      >
                        Nova
                      </Button>
                    </div>
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
