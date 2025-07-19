import { useState } from "react";
import { useAuth } from "@/hooks/useAuth-jwt";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Download,
  Trash2,
  Mail,
  Phone,
  Globe,
  Eye,
  EyeOff,
  LogOut,
  Key,
  Smartphone,
  QrCode,
  Copy,
  CheckCircle
} from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();
  const userData = user as any;
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false,
    analytics: true
  });
  const [showApiKey, setShowApiKey] = useState(false);
  
  // Estados para alteração de senha
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // Estados para 2FA
  const [twoFactorData, setTwoFactorData] = useState({
    isEnabled: false,
    secret: '',
    qrCodeUrl: '',
    verificationCode: ''
  });
  const [showQrCode, setShowQrCode] = useState(false);
  
  // Estados de loading
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // Função para alterar senha
  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await apiRequest('POST', '/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso",
        variant: "default"
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao alterar senha",
        variant: "destructive"
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Função para gerar QR Code do 2FA
  const handleEnable2FA = async () => {
    setIsEnabling2FA(true);
    try {
      const response = await apiRequest('POST', '/api/auth/enable-2fa');
      setTwoFactorData({
        ...twoFactorData,
        secret: response.secret,
        qrCodeUrl: response.qrCodeUrl
      });
      setShowQrCode(true);
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao configurar 2FA",
        variant: "destructive"
      });
    } finally {
      setIsEnabling2FA(false);
    }
  };

  // Função para verificar e ativar 2FA
  const handleVerify2FA = async () => {
    if (!twoFactorData.verificationCode) {
      toast({
        title: "Erro",
        description: "Digite o código de verificação",
        variant: "destructive"
      });
      return;
    }

    try {
      await apiRequest('POST', '/api/auth/verify-2fa', {
        secret: twoFactorData.secret,
        token: twoFactorData.verificationCode
      });

      toast({
        title: "Sucesso",
        description: "2FA ativado com sucesso",
        variant: "default"
      });

      setTwoFactorData({
        ...twoFactorData,
        isEnabled: true
      });
      setShowQrCode(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message || "Código inválido",
        variant: "destructive"
      });
    }
  };

  // Função para desabilitar 2FA
  const handleDisable2FA = async () => {
    setIsDisabling2FA(true);
    try {
      await apiRequest('POST', '/api/auth/disable-2fa');
      
      toast({
        title: "Sucesso",
        description: "2FA desabilitado",
        variant: "default"
      });

      setTwoFactorData({
        isEnabled: false,
        secret: '',
        qrCodeUrl: '',
        verificationCode: ''
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao desabilitar 2FA",
        variant: "destructive"
      });
    } finally {
      setIsDisabling2FA(false);
    }
  };

  // Função para copiar código secreto
  const handleCopySecret = () => {
    navigator.clipboard.writeText(twoFactorData.secret);
    toast({
      title: "Copiado",
      description: "Código secreto copiado para área de transferência",
      variant: "default"
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">Gerencie suas preferências e configurações da conta</p>
        </div>
      </div>

      {/* Profile Section */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-green-600" />
            Perfil
          </CardTitle>
          <CardDescription>
            Informações básicas da sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={userData?.profileImageUrl || ""} alt="Profile" />
              <AvatarFallback className="text-lg bg-green-100 text-green-700">
                {userData?.firstName?.[0] || userData?.email?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">
                {userData?.firstName && userData?.lastName 
                  ? `${userData.firstName} ${userData.lastName}` 
                  : userData?.email
                }
              </h3>
              <p className="text-gray-600">{userData?.email}</p>
              <Badge variant="outline" className="mt-2">
                <CreditCard className="w-3 h-3 mr-1" />
                Plano Gratuito
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Nome</Label>
              <Input 
                id="firstName" 
                defaultValue={userData?.firstName || ""} 
                placeholder="Seu nome"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Sobrenome</Label>
              <Input 
                id="lastName" 
                defaultValue={userData?.lastName || ""} 
                placeholder="Seu sobrenome"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              defaultValue={userData?.email || ""} 
              placeholder="seu@email.com"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">
              O email não pode ser alterado
            </p>
          </div>

          <Button className="bg-green-600 hover:bg-green-700">
            Salvar Alterações
          </Button>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Notificações
          </CardTitle>
          <CardDescription>
            Configure quando e como você deseja receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificações por email</Label>
              <p className="text-sm text-gray-600">
                Receba updates sobre seus quizzes e leads
              </p>
            </div>
            <Switch 
              checked={notifications.email}
              onCheckedChange={(value) => handleNotificationChange('email', value)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificações push</Label>
              <p className="text-sm text-gray-600">
                Receba notificações no navegador
              </p>
            </div>
            <Switch 
              checked={notifications.push}
              onCheckedChange={(value) => handleNotificationChange('push', value)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Relatórios de analytics</Label>
              <p className="text-sm text-gray-600">
                Relatórios semanais sobre performance
              </p>
            </div>
            <Switch 
              checked={notifications.analytics}
              onCheckedChange={(value) => handleNotificationChange('analytics', value)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Marketing e novidades</Label>
              <p className="text-sm text-gray-600">
                Receba dicas e novidades sobre a plataforma
              </p>
            </div>
            <Switch 
              checked={notifications.marketing}
              onCheckedChange={(value) => handleNotificationChange('marketing', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Password Change Section */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-red-600" />
            Alterar Senha
          </CardTitle>
          <CardDescription>
            Altere sua senha atual para uma nova
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Senha Atual</Label>
            <div className="flex items-center space-x-2 mt-1">
              <Input 
                id="currentPassword" 
                type={showPasswords.current ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Digite sua senha atual"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
              >
                {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="newPassword">Nova Senha</Label>
            <div className="flex items-center space-x-2 mt-1">
              <Input 
                id="newPassword" 
                type={showPasswords.new ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Digite uma nova senha"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
              >
                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <div className="flex items-center space-x-2 mt-1">
              <Input 
                id="confirmPassword" 
                type={showPasswords.confirm ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirme a nova senha"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
              >
                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <Button 
            onClick={handleChangePassword} 
            disabled={isChangingPassword}
            className="bg-red-600 hover:bg-red-700"
          >
            {isChangingPassword ? "Alterando..." : "Alterar Senha"}
          </Button>

          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <p><strong>Dicas para uma senha segura:</strong></p>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• Pelo menos 8 caracteres</li>
              <li>• Misture letras maiúsculas e minúsculas</li>
              <li>• Inclua números e símbolos</li>
              <li>• Evite informações pessoais</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 2FA Section */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-orange-600" />
            Autenticação de Dois Fatores (2FA)
          </CardTitle>
          <CardDescription>
            Adicione uma camada extra de segurança à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!twoFactorData.isEnabled ? (
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-semibold text-orange-800 mb-2">2FA Desabilitado</h4>
                <p className="text-sm text-orange-700 mb-4">
                  Sua conta não está protegida por autenticação de dois fatores. Recomendamos ativar para maior segurança.
                </p>
                <Button 
                  onClick={handleEnable2FA} 
                  disabled={isEnabling2FA}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isEnabling2FA ? "Configurando..." : "Habilitar 2FA"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  2FA Ativado
                </h4>
                <p className="text-sm text-green-700 mb-4">
                  Sua conta está protegida por autenticação de dois fatores.
                </p>
                <Button 
                  onClick={handleDisable2FA} 
                  disabled={isDisabling2FA}
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  {isDisabling2FA ? "Desabilitando..." : "Desabilitar 2FA"}
                </Button>
              </div>
            </div>
          )}

          {showQrCode && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Configurar Aplicativo Autenticador</h4>
                <p className="text-sm text-blue-700 mb-4">
                  1. Abra um app autenticador (Google Authenticator, Authy, etc.)
                </p>
                <p className="text-sm text-blue-700 mb-4">
                  2. Escaneie o código QR abaixo ou digite o código manualmente
                </p>
                
                {twoFactorData.qrCodeUrl && (
                  <div className="flex justify-center mb-4">
                    <img src={twoFactorData.qrCodeUrl} alt="QR Code" className="border rounded-lg" />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Código Manual (caso não consiga escanear)</Label>
                  <div className="flex items-center space-x-2">
                    <Input 
                      value={twoFactorData.secret}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCopySecret}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="verificationCode">Código de Verificação</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input 
                      id="verificationCode" 
                      value={twoFactorData.verificationCode}
                      onChange={(e) => setTwoFactorData(prev => ({ ...prev, verificationCode: e.target.value }))}
                      placeholder="Digite o código de 6 dígitos"
                      maxLength={6}
                    />
                    <Button 
                      onClick={handleVerify2FA}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Verificar
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Digite o código gerado pelo seu aplicativo autenticador
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <p><strong>Aplicativos Recomendados:</strong></p>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• Google Authenticator</li>
              <li>• Microsoft Authenticator</li>
              <li>• Authy</li>
              <li>• 1Password</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* API Section */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            API e Integrações
          </CardTitle>
          <CardDescription>
            Configure integrações externas e acesso à API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="apiKey">Chave da API</Label>
            <div className="flex items-center space-x-2 mt-1">
              <Input 
                id="apiKey" 
                type={showApiKey ? "text" : "password"}
                value="vz_sk_live_********************************"
                disabled
                className="font-mono"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Use esta chave para integrar com sistemas externos
            </p>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              Gerar Nova Chave
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Documentação
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600">
            <Shield className="w-5 h-5" />
            Sessão e Segurança
          </CardTitle>
          <CardDescription>
            Gerencie sua sessão atual e configurações de segurança
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Sair da Conta</h4>
            <p className="text-sm text-blue-700 mb-4">
              Encerrar sua sessão atual e fazer logout do sistema com segurança.
            </p>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-blue-600 border-blue-600 hover:bg-blue-50">
              <LogOut className="w-4 h-4 mr-2" />
              Sair do Sistema
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            Zona de Perigo
          </CardTitle>
          <CardDescription>
            Ações irreversíveis que afetam permanentemente sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">Excluir Conta</h4>
            <p className="text-sm text-red-700 mb-4">
              Esta ação não pode ser desfeita. Todos os seus quizzes, leads e dados serão permanentemente excluídos.
            </p>
            <Button variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Conta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}