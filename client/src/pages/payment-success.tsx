import { CheckCircle, Download, FileText, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Pagamento Realizado com Sucesso!
          </CardTitle>
          <CardDescription className="text-lg">
            Sua assinatura Vendzz Pro foi ativada
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Status do Pagamento */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-700 mb-2">
              Status do Pagamento
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Cobrança Imediata:</span>
                <Badge variant="outline" className="bg-green-100 text-green-700">
                  R$ 1,00 - Pago ✓
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Trial Gratuito:</span>
                <Badge variant="outline" className="bg-blue-100 text-blue-700">
                  3 dias - Ativo
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Próxima Cobrança:</span>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                  R$ 29,90/mês
                </Badge>
              </div>
            </div>
          </div>

          {/* Próximos Passos */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">
              Próximos Passos
            </h3>
            
            <div className="grid gap-4">
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">
                    Acesse sua conta
                  </p>
                  <p className="text-sm text-blue-600">
                    Faça login em vendzz.com para começar a criar seus quizzes
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                <Download className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium text-purple-800">
                    Baixe nossos materiais
                  </p>
                  <p className="text-sm text-purple-600">
                    Guias, templates e dicas para otimizar suas conversões
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                <Mail className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-800">
                    Suporte dedicado
                  </p>
                  <p className="text-sm text-orange-600">
                    Nossa equipe está pronta para ajudar via email ou WhatsApp
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Informações Importantes */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">
              Informações Importantes
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Você tem 3 dias de trial gratuito para testar todos os recursos</li>
              <li>• Após o trial, será cobrado R$ 29,90/mês automaticamente</li>
              <li>• Você pode cancelar a qualquer momento sem taxa</li>
              <li>• Recibo por email enviado automaticamente</li>
            </ul>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => window.location.href = '/'}
            >
              Acessar Minha Conta
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => window.location.href = '/support'}
            >
              <Phone className="w-4 h-4 mr-2" />
              Suporte
            </Button>
          </div>

          {/* Rodapé */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-500">
              Vendzz - Plataforma de Quiz Marketing
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Transação processada com segurança via Stripe
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}