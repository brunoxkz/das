import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth-jwt";
import { queryClient } from "@/lib/queryClient";
import { 
  Settings, 
  Shield, 
  Smartphone, 
  QrCode, 
  Key, 
  Check, 
  X, 
  Copy,
  User,
  Mail,
  CreditCard,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ConfiguracoesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Estados para perfil
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Estados para 2FA
  const [twoFACode, setTwoFACode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isSetup2FA, setIsSetup2FA] = useState(false);

  // Buscar dados do usuário
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ["/api/user/profile"],
    enabled: !!user,
  });

  // Buscar status do 2FA
  const { data: twoFAStatus } = useQuery({
    queryKey: ["/api/auth/2fa/status"],
    enabled: !!user,
  });

  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.firstName || "");
      setLastName(userProfile.lastName || "");
      setEmail(userProfile.email || "");
    }
  }, [userProfile]);

  // Mutação para atualizar perfil
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erro ao atualizar perfil");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    },
  });

  // Mutação para alterar senha
  const changePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erro ao alterar senha");
      return response.json();
    },
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso.",
      });
    },
  });

  // Mutação para configurar 2FA
  const setup2FAMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/2fa/setup", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Erro ao configurar 2FA");
      return response.json();
    },
    onSuccess: (data) => {
      setQrCodeUrl(data.qrCodeUrl);
      setBackupCodes(data.backupCodes);
      setIsSetup2FA(true);
    },
  });

  // Mutação para habilitar 2FA
  const enable2FAMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch("/api/auth/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) throw new Error("Código inválido");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/2fa/status"] });
      setIsSetup2FA(false);
      setTwoFACode("");
      toast({
        title: "2FA habilitado",
        description: "Autenticação de dois fatores foi habilitada com sucesso.",
      });
    },
  });

  // Mutação para desabilitar 2FA
  const disable2FAMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) throw new Error("Código inválido");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/2fa/status"] });
      setTwoFACode("");
      toast({
        title: "2FA desabilitado",
        description: "Autenticação de dois fatores foi desabilitada.",
      });
    },
  });

  const handleUpdateProfile = () => {
    updateProfileMutation.mutate({
      firstName,
      lastName,
      email,
    });
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }
    
    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="container mx-auto p-6">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Configurações
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Gerencie suas informações pessoais e configurações de segurança
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="2fa" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              2FA
            </TabsTrigger>
          </TabsList>

          {/* Aba Perfil */}
          <TabsContent value="profile">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações do Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Seu nome"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Seu sobrenome"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Plano: {userProfile?.plan || "Free"}
                  </Badge>
                  <Badge variant="outline">
                    Role: {userProfile?.role || "user"}
                  </Badge>
                </div>

                <Button
                  onClick={handleUpdateProfile}
                  disabled={updateProfileMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateProfileMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Segurança */}
          <TabsContent value="security">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Alterar Senha
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Senha Atual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Digite sua senha atual"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite a nova senha"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme a nova senha"
                  />
                </div>

                <Button
                  onClick={handleChangePassword}
                  disabled={changePasswordMutation.isPending || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600"
                >
                  <Key className="w-4 h-4 mr-2" />
                  {changePasswordMutation.isPending ? "Alterando..." : "Alterar Senha"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba 2FA */}
          <TabsContent value="2fa">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Autenticação de Dois Fatores (2FA)
                  {twoFAStatus?.enabled && (
                    <Badge variant="default" className="ml-2">
                      <Check className="w-3 h-3 mr-1" />
                      Ativo
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!twoFAStatus?.enabled ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Por que habilitar 2FA?
                      </h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        A autenticação de dois fatores adiciona uma camada extra de segurança à sua conta,
                        protegendo-a mesmo se sua senha for comprometida.
                      </p>
                    </div>

                    {!isSetup2FA ? (
                      <Button
                        onClick={() => setup2FAMutation.mutate()}
                        disabled={setup2FAMutation.isPending}
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600"
                      >
                        <Smartphone className="w-4 h-4 mr-2" />
                        {setup2FAMutation.isPending ? "Configurando..." : "Configurar 2FA"}
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-center">
                          <h3 className="font-semibold mb-2">1. Escaneie o QR Code</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Use um app como Google Authenticator ou Authy
                          </p>
                          {qrCodeUrl && (
                            <div className="flex justify-center">
                              <img src={qrCodeUrl} alt="QR Code" className="border rounded-lg" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="twoFACode">2. Digite o código do app</Label>
                          <Input
                            id="twoFACode"
                            value={twoFACode}
                            onChange={(e) => setTwoFACode(e.target.value)}
                            placeholder="000000"
                            maxLength={6}
                          />
                        </div>

                        <Button
                          onClick={() => enable2FAMutation.mutate(twoFACode)}
                          disabled={enable2FAMutation.isPending || twoFACode.length !== 6}
                          className="w-full bg-gradient-to-r from-green-600 to-blue-600"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          {enable2FAMutation.isPending ? "Habilitando..." : "Habilitar 2FA"}
                        </Button>

                        {backupCodes.length > 0 && (
                          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                              Códigos de Backup
                            </h3>
                            <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                              Guarde estes códigos em local seguro. Você pode usá-los se perder acesso ao seu app.
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              {backupCodes.map((code, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-sm">
                                    {code}
                                  </code>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(code)}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                        2FA Habilitado
                      </h3>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        Sua conta está protegida com autenticação de dois fatores.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="disable2FACode">Digite o código para desabilitar</Label>
                      <Input
                        id="disable2FACode"
                        value={twoFACode}
                        onChange={(e) => setTwoFACode(e.target.value)}
                        placeholder="000000"
                        maxLength={6}
                      />
                    </div>

                    <Button
                      onClick={() => disable2FAMutation.mutate(twoFACode)}
                      disabled={disable2FAMutation.isPending || twoFACode.length !== 6}
                      variant="destructive"
                      className="w-full"
                    >
                      <X className="w-4 h-4 mr-2" />
                      {disable2FAMutation.isPending ? "Desabilitando..." : "Desabilitar 2FA"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}