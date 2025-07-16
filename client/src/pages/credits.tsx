import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Zap, 
  ShoppingCart, 
  History, 
  TrendingUp,
  Coins,
  Plus,
  Package
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";

export default function Credits() {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  // Buscar créditos do usuário
  const { data: creditsData, isLoading } = useQuery({
    queryKey: ["/api/user/credits"],
  });

  const pacoteCreditos = [
    {
      nome: "Pacote Básico",
      sms: 100,
      email: 500,
      voice: 50,
      price: "R$ 19",
      popular: false,
      description: "Ideal para pequenos negócios"
    },
    {
      nome: "Pacote Profissional",
      sms: 500,
      email: 2000,
      voice: 200,
      price: "R$ 79",
      popular: true,
      description: "Para empresas em crescimento"
    },
    {
      nome: "Pacote Enterprise",
      sms: 1500,
      email: 5000,
      voice: 500,
      price: "R$ 199",
      popular: false,
      description: "Para grandes volumes"
    }
  ];

  const creditosAvulsos = [
    {
      tipo: "SMS",
      icon: <MessageSquare className="w-5 h-5" />,
      preco: "R$ 0,12",
      unidade: "por SMS",
      color: "bg-blue-500",
      description: "Envio de SMS marketing"
    },
    {
      tipo: "Email",
      icon: <Mail className="w-5 h-5" />,
      preco: "R$ 0,05",
      unidade: "por email",
      color: "bg-green-500",
      description: "Envio de email marketing"
    },
    {
      tipo: "Voice",
      icon: <Phone className="w-5 h-5" />,
      preco: "R$ 0,25",
      unidade: "por chamada",
      color: "bg-purple-500",
      description: "Chamadas de voz automatizadas"
    },
    {
      tipo: "I.A.",
      icon: <Zap className="w-5 h-5" />,
      preco: "R$ 2,50",
      unidade: "por vídeo",
      color: "bg-orange-500",
      description: "Vídeos personalizados com IA"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Gerenciar Créditos
          </h1>
          <p className="text-xl text-gray-600">
            Controle seus créditos para SMS, email, voz e IA
          </p>
        </div>

        {/* Current Credits Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                SMS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {creditsData?.breakdown?.sms || 0}
              </div>
              <p className="text-sm text-gray-600 mt-1">créditos disponíveis</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="w-5 h-5 text-green-600" />
                Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {creditsData?.breakdown?.email || 0}
              </div>
              <p className="text-sm text-gray-600 mt-1">créditos disponíveis</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Phone className="w-5 h-5 text-purple-600" />
                Voice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {creditsData?.breakdown?.voice || 0}
              </div>
              <p className="text-sm text-gray-600 mt-1">créditos disponíveis</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-5 h-5 text-orange-600" />
                I.A.
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {creditsData?.breakdown?.ia || 0}
              </div>
              <p className="text-sm text-gray-600 mt-1">créditos disponíveis</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs para Pacotes e Créditos Avulsos */}
        <Tabs defaultValue="pacotes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pacotes">Pacotes</TabsTrigger>
            <TabsTrigger value="avulsos">Créditos Avulsos</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>

          {/* Pacotes de Créditos */}
          <TabsContent value="pacotes" className="mt-6">
            <div className="grid md:grid-cols-3 gap-6">
              {pacoteCreditos.map((pacote, index) => (
                <Card key={index} className={`relative ${pacote.popular ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'}`}>
                  {pacote.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500 text-white px-4 py-1">
                        Mais Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      {pacote.nome}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {pacote.description}
                    </CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">{pacote.price}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                          SMS
                        </span>
                        <span className="font-semibold">{pacote.sms}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-green-600" />
                          Email
                        </span>
                        <span className="font-semibold">{pacote.email}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-purple-600" />
                          Voice
                        </span>
                        <span className="font-semibold">{pacote.voice}</span>
                      </div>
                    </div>

                    <Button 
                      className={`w-full ${pacote.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                      variant={pacote.popular ? "default" : "outline"}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Comprar Pacote
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Créditos Avulsos */}
          <TabsContent value="avulsos" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {creditosAvulsos.map((credito, index) => (
                <Card key={index} className="bg-white">
                  <CardHeader className="text-center pb-3">
                    <div className={`w-12 h-12 rounded-full ${credito.color} flex items-center justify-center mx-auto mb-2`}>
                      <div className="text-white">
                        {credito.icon}
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {credito.tipo}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {credito.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="text-center">
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-gray-900">{credito.preco}</span>
                      <span className="text-sm text-gray-600 block">{credito.unidade}</span>
                    </div>
                    
                    <Button className="w-full" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Comprar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Histórico de Transações */}
          <TabsContent value="historico" className="mt-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Histórico de Transações
                </CardTitle>
                <CardDescription>
                  Visualize suas compras e uso de créditos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Exemplo de transações */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Plus className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Pacote Profissional</p>
                        <p className="text-sm text-gray-600">12 Jan 2025, 14:30</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">+2.700 créditos</p>
                      <p className="text-sm text-gray-600">R$ 79,00</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Campanha SMS</p>
                        <p className="text-sm text-gray-600">11 Jan 2025, 09:15</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">-45 SMS</p>
                      <p className="text-sm text-gray-600">Campanha "Promoção"</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <Mail className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Email Marketing</p>
                        <p className="text-sm text-gray-600">10 Jan 2025, 16:20</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">-128 emails</p>
                      <p className="text-sm text-gray-600">Newsletter semanal</p>
                    </div>
                  </div>

                  <div className="text-center mt-6">
                    <Button variant="outline">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Ver Histórico Completo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Informações Adicionais */}
        <div className="mt-12 bg-white rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Como Funcionam os Créditos
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Sistema de Créditos
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <Coins className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span>Cada ação consome 1 crédito específico</span>
                </li>
                <li className="flex items-start gap-2">
                  <Coins className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span>Créditos não utilizados são acumulados</span>
                </li>
                <li className="flex items-start gap-2">
                  <Coins className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span>Validade de 12 meses para créditos comprados</span>
                </li>
                <li className="flex items-start gap-2">
                  <Coins className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span>Débito automático apenas quando enviado com sucesso</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Vantagens dos Pacotes
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <Package className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>Até 40% de desconto vs. compra avulsa</span>
                </li>
                <li className="flex items-start gap-2">
                  <Package className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>Mix de créditos para diferentes canais</span>
                </li>
                <li className="flex items-start gap-2">
                  <Package className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>Recarga automática disponível</span>
                </li>
                <li className="flex items-start gap-2">
                  <Package className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>Suporte prioritário incluído</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}