import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar, CreditCard, Mail, Phone } from 'lucide-react';

export default function CheckoutSuccess() {
  const [location, navigate] = useLocation();
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionIdFromUrl = urlParams.get('session_id');
    if (sessionIdFromUrl) {
      setSessionId(sessionIdFromUrl);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Pagamento Confirmado! 🎉
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Sua assinatura foi criada com sucesso
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Resumo do Plano */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-3">Resumo da Assinatura</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <div>
                  <p className="text-sm opacity-90">Trial Gratuito</p>
                  <p className="font-semibold">3 dias grátis</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <div>
                  <p className="text-sm opacity-90">Após o trial</p>
                  <p className="font-semibold">R$ 29,90/mês</p>
                </div>
              </div>
            </div>
          </div>

          {/* Informações Importantes */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Informações Importantes:</h4>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>• Você tem 3 dias de trial gratuito para testar todas as funcionalidades</li>
              <li>• Após o trial, será cobrado R$ 29,90/mês automaticamente</li>
              <li>• Você pode cancelar a qualquer momento sem taxas</li>
              <li>• Acesso completo a Quiz Builder, SMS, Email e WhatsApp Marketing</li>
            </ul>
          </div>

          {/* Próximos Passos */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">Próximos Passos:</h4>
            <ul className="space-y-1 text-sm text-green-700">
              <li>• Acesse sua conta e comece a criar seus primeiros quizzes</li>
              <li>• Configure suas campanhas de SMS e Email Marketing</li>
              <li>• Explore as funcionalidades avançadas de Analytics</li>
              <li>• Entre em contato com o suporte se precisar de ajuda</li>
            </ul>
          </div>

          {/* Detalhes da Transação */}
          {sessionId && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Detalhes da Transação:</h4>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="font-mono text-xs">
                  ID: {sessionId}
                </Badge>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Guarde este ID para futuras referências
              </p>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              Acessar Dashboard
            </Button>
            <Button 
              onClick={() => navigate('/quiz-builder')}
              variant="outline"
              className="flex-1"
            >
              Criar Primeiro Quiz
            </Button>
          </div>

          {/* Contato */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600 mb-2">
              Precisa de ajuda? Entre em contato:
            </p>
            <div className="flex justify-center space-x-4">
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>suporte@vendzz.com</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>(11) 99999-9999</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}