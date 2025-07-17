import { CheckCircle, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-700">
            Pagamento Realizado com Sucesso!
          </CardTitle>
          <CardDescription>
            Seu pagamento foi processado com sucesso. Você receberá um email de confirmação em breve.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-gradient-to-r from-green-100 to-blue-100 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Detalhes do Plano</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Plano:</strong> Vendzz Premium</p>
              <p><strong>Taxa de Ativação:</strong> R$ 1,00</p>
              <p><strong>Trial:</strong> 3 dias gratuitos</p>
              <p><strong>Próxima cobrança:</strong> R$ 29,90 em 3 dias</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link href="/dashboard" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                <Home className="w-4 h-4 mr-2" />
                Ir para Dashboard
              </Button>
            </Link>
            <Link href="/stripe-elements" className="flex-1">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}