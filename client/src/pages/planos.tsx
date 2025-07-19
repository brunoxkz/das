import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Star } from "lucide-react";
import { useAuth } from "@/hooks/use-auth-sqlite";
import { useLanguage } from "@/hooks/useLanguage";

export default function Planos() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const userData = user as any;

  const planos = [
    {
      name: "Gratuito",
      price: "R$ 0",
      period: "/mês",
      description: "Ideal para começar",
      icon: <Star className="w-6 h-6 text-gray-500" />,
      color: "border-gray-200",
      current: userData?.plan === "free",
      features: [
        "3 quizzes ativos",
        "100 respostas/mês",
        "Análise básica",
        "Suporte por email",
        "1 campanha SMS/mês",
        "50 créditos SMS grátis"
      ]
    },
    {
      name: "Premium",
      price: "R$ 49",
      period: "/mês",
      description: "Para marketing sério",
      icon: <Zap className="w-6 h-6 text-blue-500" />,
      color: "border-blue-200 bg-blue-50",
      current: userData?.plan === "premium",
      popular: true,
      features: [
        "25 quizzes ativos",
        "2.500 respostas/mês",
        "Análise avançada",
        "Suporte prioritário",
        "Campanhas SMS ilimitadas",
        "500 créditos SMS inclusos",
        "Integração WhatsApp",
        "Email marketing",
        "A/B Testing"
      ]
    },
    {
      name: "Enterprise",
      price: "R$ 149",
      period: "/mês",
      description: "Para grandes volumes",
      icon: <Crown className="w-6 h-6 text-purple-500" />,
      color: "border-purple-200 bg-purple-50",
      current: userData?.plan === "enterprise",
      features: [
        "Quizzes ilimitados",
        "Respostas ilimitadas",
        "Análise completa",
        "Suporte 24/7",
        "Campanhas ilimitadas",
        "2.000 créditos SMS",
        "WhatsApp avançado",
        "Voice calling",
        "API access",
        "Custom branding"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha seu Plano
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Selecione o plano ideal para o seu negócio e comece a gerar mais leads hoje mesmo
          </p>
        </div>

        {/* Current Plan Badge */}
        {userData?.plan && (
          <div className="text-center mb-8">
            <Badge variant="outline" className="text-sm px-4 py-2">
              Plano atual: {userData.plan === 'enterprise' ? 'Enterprise' : 
                            userData.plan === 'premium' ? 'Premium' : 'Gratuito'}
            </Badge>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {planos.map((plano, index) => (
            <Card key={index} className={`relative ${plano.color} ${plano.popular ? 'ring-2 ring-blue-500' : ''}`}>
              {plano.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-4 py-1">
                    Mais Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-2">
                  {plano.icon}
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {plano.name}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {plano.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plano.price}</span>
                  <span className="text-gray-600">{plano.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features */}
                <div className="space-y-3">
                  {plano.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  {plano.current ? (
                    <Button 
                      className="w-full"
                      variant="outline"
                      disabled
                    >
                      Plano Atual
                    </Button>
                  ) : (
                    <Button 
                      className={`w-full ${plano.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                      variant={plano.popular ? "default" : "outline"}
                    >
                      {plano.name === "Gratuito" ? "Começar Grátis" : "Fazer Upgrade"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Recursos Inclusos em Todos os Planos
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">SSL Grátis</h3>
              <p className="text-sm text-gray-600">Certificado SSL incluído</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Crown className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Sem Branding</h3>
              <p className="text-sm text-gray-600">Remova "Powered by"</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Tempo Real</h3>
              <p className="text-sm text-gray-600">Dados em tempo real</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Star className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Suporte</h3>
              <p className="text-sm text-gray-600">Suporte técnico</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-white rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Perguntas Frequentes
          </h2>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Posso mudar de plano a qualquer momento?
              </h3>
              <p className="text-gray-600">
                Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. 
                As mudanças entram em vigor imediatamente.
              </p>
            </div>
            <div className="border-b pb-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Como funcionam os créditos SMS?
              </h3>
              <p className="text-gray-600">
                Cada SMS enviado consome 1 crédito. Créditos não utilizados são acumulados 
                para o próximo mês. Você pode comprar créditos extras a qualquer momento.
              </p>
            </div>
            <div className="border-b pb-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Há taxa de setup ou cancelamento?
              </h3>
              <p className="text-gray-600">
                Não há taxas de setup ou cancelamento. Você pode cancelar sua assinatura 
                a qualquer momento sem custos adicionais.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}