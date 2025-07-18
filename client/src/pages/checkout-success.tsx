import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Mail, ArrowRight } from 'lucide-react';

export default function CheckoutSuccess() {
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState('');
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    // Pegar session_id da URL
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    
    if (sessionId) {
      setSessionId(sessionId);
      // Aqui você pode fazer uma chamada para verificar o status do pagamento
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardContent className="text-center py-12">
              <div className="mb-8">
                <CheckCircle className="w-24 h-24 text-green-600 mx-auto mb-6" />
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  Pagamento Realizado com Sucesso!
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  Sua assinatura foi ativada e você já pode começar a usar nossa plataforma.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-green-800 mb-4">O que acontece agora?</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">Email de confirmação</p>
                      <p className="text-sm text-green-700">Você receberá um email com os detalhes da sua assinatura</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Download className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">Acesso imediato</p>
                      <p className="text-sm text-green-700">Sua conta foi ativada e você pode começar a usar agora</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">Trial gratuito</p>
                      <p className="text-sm text-green-700">Você tem 3 dias para explorar todas as funcionalidades</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={() => window.location.href = '/login'}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
                >
                  Acessar Plataforma
                </Button>
                
                <p className="text-sm text-gray-500">
                  Tem dúvidas? Entre em contato com nosso suporte
                </p>
              </div>

              {sessionId && (
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">
                    ID da sessão: {sessionId}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}