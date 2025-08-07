import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  User, 
  CreditCard, 
  Clock, 
  Shield, 
  Phone, 
  Mail, 
  MessageSquare, 
  Send,
  Plus,
  Minus,
  Calendar,
  Settings,
  History
} from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  whatsapp?: string;
  plan: string;
  role: string;
  planExpiresAt?: string;
  smsCredits: number;
  emailCredits: number;
  whatsappCredits: number;
  telegramCredits: number;
  smsDispatched?: number;
  emailDispatched?: number;
  whatsappDispatched?: number;
  telegramDispatched?: number;
  isBlocked?: boolean;
  blockReason?: string;
  createdAt: string;
}

interface EditUserModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
}

export function EditUserModal({ user, isOpen, onClose, onUserUpdated }: EditUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();

  // Form states
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [whatsapp, setWhatsapp] = useState(user.whatsapp || "");
  const [plan, setPlan] = useState(user.plan);
  const [role, setRole] = useState(user.role);
  const [planExpiresAt, setPlanExpiresAt] = useState(user.planExpiresAt?.split('T')[0] || "");
  const [isBlocked, setIsBlocked] = useState(user.isBlocked || false);
  const [blockReason, setBlockReason] = useState(user.blockReason || "");

  // Credit states
  const [smsCredits, setSmsCredits] = useState(user.smsCredits);
  const [emailCredits, setEmailCredits] = useState(user.emailCredits);
  const [whatsappCredits, setWhatsappCredits] = useState(user.whatsappCredits);
  const [telegramCredits, setTelegramCredits] = useState(user.telegramCredits);

  // Credit operations
  const [creditOperation, setCreditOperation] = useState<'add' | 'subtract' | 'set'>('add');
  const [creditType, setCreditType] = useState<'sms' | 'email' | 'whatsapp' | 'telegram'>('sms');
  const [creditAmount, setCreditAmount] = useState(0);
  const [creditDescription, setCreditDescription] = useState("");

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      const profileData = {
        firstName,
        lastName,
        email,
        whatsapp,
        plan,
        role,
        planExpiresAt: planExpiresAt ? new Date(planExpiresAt).toISOString() : undefined,
        isBlocked,
        blockReason
      };

      await apiRequest("PUT", `/api/admin/users/${user.id}`, profileData);

      toast({
        title: "Usuário atualizado",
        description: "Perfil do usuário foi atualizado com sucesso.",
      });

      onUserUpdated();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar usuário. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreditOperation = async () => {
    try {
      setLoading(true);
      
      const creditData = {
        operation: creditOperation,
        type: creditType,
        amount: creditAmount,
        description: creditDescription || `Admin ${creditOperation}: ${creditAmount} ${creditType} credits`
      };

      await apiRequest("POST", `/api/admin/users/${user.id}/credits`, creditData);

      // Update local state
      const newCredits = { sms: smsCredits, email: emailCredits, whatsapp: whatsappCredits, telegram: telegramCredits };
      
      switch (creditOperation) {
        case 'add':
          newCredits[creditType] += creditAmount;
          break;
        case 'subtract':
          newCredits[creditType] = Math.max(0, newCredits[creditType] - creditAmount);
          break;
        case 'set':
          newCredits[creditType] = creditAmount;
          break;
      }

      setSmsCredits(newCredits.sms);
      setEmailCredits(newCredits.email);
      setWhatsappCredits(newCredits.whatsapp);
      setTelegramCredits(newCredits.telegram);

      setCreditAmount(0);
      setCreditDescription("");

      toast({
        title: "Créditos atualizados",
        description: `Créditos de ${creditType} foram ${creditOperation === 'add' ? 'adicionados' : creditOperation === 'subtract' ? 'subtraídos' : 'definidos'} com sucesso.`,
      });

      onUserUpdated();
    } catch (error) {
      console.error('Erro ao atualizar créditos:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar créditos. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getPlanBadgeColor = (planName: string) => {
    switch (planName) {
      case "free": return "bg-gray-100 text-gray-800";
      case "basic": return "bg-blue-100 text-blue-800";
      case "premium": return "bg-purple-100 text-purple-800";
      case "enterprise": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Editar Usuário: {user.firstName} {user.lastName}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="credits">
              <CreditCard className="h-4 w-4 mr-2" />
              Créditos
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Nome"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Sobrenome</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Sobrenome"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+55 11 99999-9999"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plano e Permissões</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plan">Plano</Label>
                  <Select value={plan} onValueChange={setPlan}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Gratuito</SelectItem>
                      <SelectItem value="basic">Básico</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="planExpiresAt">Data de Expiração</Label>
                  <Input
                    id="planExpiresAt"
                    type="date"
                    value={planExpiresAt}
                    onChange={(e) => setPlanExpiresAt(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-center">
                  <Badge className={getPlanBadgeColor(plan)}>
                    {plan.charAt(0).toUpperCase() + plan.slice(1)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSaveProfile} disabled={loading}>
                {loading ? "Salvando..." : "Salvar Perfil"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="credits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Créditos Atuais vs Disparos Realizados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Phone className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <div className="font-semibold text-lg">{smsCredits}</div>
                    <div className="text-sm text-muted-foreground">SMS Créditos</div>
                    <div className="text-xs text-blue-600">{user.smsDispatched || 0} enviados</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Mail className="h-6 w-6 mx-auto mb-2 text-green-500" />
                    <div className="font-semibold text-lg">{emailCredits}</div>
                    <div className="text-sm text-muted-foreground">Email Créditos</div>
                    <div className="text-xs text-green-600">{user.emailDispatched || 0} enviados</div>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <MessageSquare className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
                    <div className="font-semibold text-lg">{whatsappCredits}</div>
                    <div className="text-sm text-muted-foreground">WhatsApp Créditos</div>
                    <div className="text-xs text-emerald-600">{user.whatsappDispatched || 0} enviados</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Send className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                    <div className="font-semibold text-lg">{telegramCredits}</div>
                    <div className="text-sm text-muted-foreground">Telegram Créditos</div>
                    <div className="text-xs text-purple-600">{user.telegramDispatched || 0} enviados</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Créditos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Crédito</Label>
                    <Select value={creditType} onValueChange={(value) => setCreditType(value as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="telegram">Telegram</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Operação</Label>
                    <Select value={creditOperation} onValueChange={(value) => setCreditOperation(value as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="add">Adicionar</SelectItem>
                        <SelectItem value="subtract">Subtrair</SelectItem>
                        <SelectItem value="set">Definir</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
                    min="0"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição (opcional)</Label>
                  <Textarea
                    value={creditDescription}
                    onChange={(e) => setCreditDescription(e.target.value)}
                    placeholder="Motivo da alteração de créditos..."
                    rows={2}
                  />
                </div>
                <Button onClick={handleCreditOperation} disabled={loading || creditAmount <= 0} className="w-full">
                  {loading ? "Processando..." : `${creditOperation === 'add' ? 'Adicionar' : creditOperation === 'subtract' ? 'Subtrair' : 'Definir'} ${creditAmount} ${creditType} créditos`}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Segurança</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Usuário Bloqueado</Label>
                    <div className="text-sm text-muted-foreground">
                      Impede o usuário de acessar a plataforma
                    </div>
                  </div>
                  <Switch
                    checked={isBlocked}
                    onCheckedChange={setIsBlocked}
                  />
                </div>
                {isBlocked && (
                  <div className="space-y-2">
                    <Label>Motivo do Bloqueio</Label>
                    <Textarea
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      placeholder="Descreva o motivo do bloqueio..."
                      rows={3}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações da Conta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">ID do Usuário:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">{user.id}</code>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Criado em:</span>
                  <span>{formatDate(user.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Plano expira em:</span>
                  <span>{formatDate(user.planExpiresAt)}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSaveProfile} disabled={loading}>
                {loading ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Atividades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Histórico de atividades em desenvolvimento
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Em breve você poderá visualizar todo o histórico de alterações deste usuário
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}