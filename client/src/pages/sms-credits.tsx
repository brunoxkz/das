
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  CreditCard, 
  Zap, 
  Crown, 
  Star,
  Plus,
  History,
  Smartphone
} from "lucide-react";

const creditPackages = [
  {
    id: 1,
    name: "Iniciante",
    description: "Ideal para testar o sistema",
    credits: 100,
    price: 29.90,
    bonusCredits: 0,
    badge: null,
    icon: <MessageSquare className="w-6 h-6" />,
    color: "from-blue-500 to-blue-600"
  },
  {
    id: 2,
    name: "Profissional",
    description: "Para empresas em crescimento",
    credits: 500,
    price: 129.90,
    bonusCredits: 50,
    badge: "Popular",
    icon: <Zap className="w-6 h-6" />,
    color: "from-green-500 to-green-600"
  },
  {
    id: 3,
    name: "Empresarial",
    description: "Para grandes volumes",
    credits: 1500,
    price: 349.90,
    bonusCredits: 200,
    badge: "Melhor Valor",
    icon: <Crown className="w-6 h-6" />,
    color: "from-purple-500 to-purple-600"
  },
  {
    id: 4,
    name: "Enterprise",
    description: "Volumes ilimitados",
    credits: 5000,
    price: 999.90,
    bonusCredits: 1000,
    badge: "Premium",
    icon: <Star className="w-6 h-6" />,
    color: "from-yellow-500 to-yellow-600"
  }
];

export default function SmsCredits() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePurchase = async (packageId: number) => {
    setLoading(true);
    setSelectedPackage(packageId);

    try {
      // Integração com Stripe para compra de créditos
      const response = await fetch('/api/sms-credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId })
      });

      if (response.ok) {
        const { sessionUrl } = await response.json();
        window.location.href = sessionUrl;
      } else {
        throw new Error('Erro ao processar compra');
      }
    } catch (error) {
      toast({
        title: "Erro na compra",
        description: "Não foi possível processar a compra. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setSelectedPackage(null);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Você precisa estar logado para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Créditos SMS</h1>
        <p className="text-gray-600 mb-6">
          Compre créditos para enviar SMS automático para seus leads
        </p>
        
        {/* Saldo Atual */}
        <Card className="max-w-md mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500 p-2 rounded-full">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Saldo Atual</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {user.smsCredits || 0} créditos
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Custo por SMS</p>
                <p className="text-sm font-semibold text-gray-700">R$ 0,15</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pacotes de Créditos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {creditPackages.map((pkg) => (
          <Card key={pkg.id} className="relative hover:shadow-lg transition-shadow">
            {pkg.badge && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                <Badge className="bg-green-500 text-white">
                  {pkg.badge}
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${pkg.color} flex items-center justify-center mx-auto mb-3`}>
                <div className="text-white">
                  {pkg.icon}
                </div>
              </div>
              <CardTitle className="text-xl">{pkg.name}</CardTitle>
              <CardDescription>{pkg.description}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  R$ {pkg.price.toFixed(2).replace('.', ',')}
                </div>
                <div className="text-sm text-gray-600">
                  {pkg.credits} créditos
                </div>
                {pkg.bonusCredits > 0 && (
                  <div className="text-xs text-green-600 font-semibold mt-1">
                    + {pkg.bonusCredits} bônus
                  </div>
                )}
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2 text-sm text-gray-600 mb-6">
                <div className="flex justify-between">
                  <span>SMS enviados:</span>
                  <span className="font-semibold">{pkg.credits + pkg.bonusCredits}</span>
                </div>
                <div className="flex justify-between">
                  <span>Custo por SMS:</span>
                  <span className="font-semibold">R$ 0,15</span>
                </div>
                <div className="flex justify-between">
                  <span>Economia:</span>
                  <span className="font-semibold text-green-600">
                    {Math.round(((pkg.credits + pkg.bonusCredits) * 0.15 - pkg.price) / pkg.price * 100)}%
                  </span>
                </div>
              </div>
              
              <Button
                className={`w-full bg-gradient-to-r ${pkg.color} hover:opacity-90 transition-opacity`}
                onClick={() => handlePurchase(pkg.id)}
                disabled={loading}
              >
                {loading && selectedPackage === pkg.id ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processando...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Comprar Agora
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Informações Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2 text-blue-500" />
              Como Funciona
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 rounded-full p-1 mt-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
              <div>
                <p className="font-semibold">1. Compre Créditos</p>
                <p className="text-gray-600">Escolha um pacote e efetue o pagamento</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 rounded-full p-1 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <p className="font-semibold">2. Configure SMS</p>
                <p className="text-gray-600">Ative o SMS automático nos seus quizzes</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-purple-100 rounded-full p-1 mt-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              </div>
              <div>
                <p className="font-semibold">3. Envio Automático</p>
                <p className="text-gray-600">SMS enviado automaticamente para seus leads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="w-5 h-5 mr-2 text-green-500" />
              Vantagens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>🚀 Recuperação de leads abandonados</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>⚡ Envio instantâneo e automático</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>🎯 Segmentação inteligente</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>📊 Relatórios detalhados</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>🔄 Campanhas sequenciais</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Termos */}
      <div className="mt-8 text-center">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            • Créditos não expiram • Sem taxa de configuração • Suporte 24/7
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Os créditos são consumidos apenas quando os SMS são efetivamente enviados
          </p>
        </div>
      </div>
    </div>
  );
}
