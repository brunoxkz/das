import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, CreditCard, Calendar, Mail, Phone, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Pagamento Confirmado!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Sua assinatura foi processada com sucesso.
            </p>
            
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <CreditCard className="w-5 h-5 mr-2" />
                <span className="font-semibold">Plano Ativo</span>
              </div>
              <div className="text-sm opacity-90">
                <div className="flex items-center justify-center mb-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>3 dias de trial gratuito</span>
                </div>
                <div>
                  Depois: R$ 29,90/mês
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              Próximos Passos:
            </h4>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Mail className="w-4 h-4 mr-2" />
                <span>Verifique seu email para confirmação</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Phone className="w-4 h-4 mr-2" />
                <span>Suporte 24/7 disponível</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/dashboard">
              <Button className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                Acessar Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            
            <Link href="/checkout-public">
              <Button variant="outline" className="w-full">
                Ver Outros Produtos
              </Button>
            </Link>
          </div>

          <div className="text-center text-xs text-gray-500 dark:text-gray-400">
            <p>
              Dúvidas? Entre em contato com nosso suporte.
            </p>
            <p className="mt-1">
              Cancele a qualquer momento sem taxas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}