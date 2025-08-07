import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, CreditCard, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

export default function PaymentIntentExplanation() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
              O que é Payment Intent?
            </h1>
            <p className="text-xl text-gray-600">
              Entenda como funciona o sistema de pagamentos do Stripe
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Info className="w-5 h-5" />
                  O que é?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-green-700">
                <p className="mb-4">
                  <strong>Payment Intent</strong> é um objeto oficial do Stripe que representa uma "intenção de pagamento". 
                  É como uma transação que está sendo preparada para ser processada.
                </p>
                <ul className="space-y-2 text-sm">
                  <li>• Representa um pagamento específico (ex: R$ 1,00)</li>
                  <li>• Gerencia todo o ciclo de vida da transação</li>
                  <li>• Suporta múltiplos métodos de pagamento</li>
                  <li>• É 100% funcional e seguro</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <CreditCard className="w-5 h-5" />
                  Como funciona?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-blue-700">
                <p className="mb-4">
                  O sistema funciona em 3 etapas principais:
                </p>
                <ol className="space-y-2 text-sm">
                  <li><strong>1. Criação:</strong> Sistema cria Payment Intent de R$ 1,00</li>
                  <li><strong>2. Processamento:</strong> Cliente preenche dados do cartão</li>
                  <li><strong>3. Confirmação:</strong> Stripe processa pagamento real</li>
                </ol>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                No Sistema Vendzz
              </CardTitle>
              <CardDescription>
                Como usamos Payment Intent para o plano Premium
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-green-100 to-blue-100 p-6 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-800 mb-4">Fluxo do Pagamento:</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">1</div>
                    <p className="text-sm font-medium">Taxa de Ativação</p>
                    <p className="text-xs text-gray-600">R$ 1,00 imediato</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">2</div>
                    <p className="text-sm font-medium">Trial Grátis</p>
                    <p className="text-xs text-gray-600">3 dias completos</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">3</div>
                    <p className="text-sm font-medium">Assinatura</p>
                    <p className="text-xs text-gray-600">R$ 29,90/mês</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">4</div>
                    <p className="text-sm font-medium">Cancelamento</p>
                    <p className="text-xs text-gray-600">Livre quando quiser</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">✅ Sistema Real</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Processa pagamentos reais</li>
                    <li>• Integração oficial com Stripe</li>
                    <li>• Certificado SSL e criptografia</li>
                    <li>• Logs detalhados de transações</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">🔒 Segurança</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Dados do cartão não passam pelo servidor</li>
                    <li>• Compliance PCI DSS</li>
                    <li>• Tokenização segura</li>
                    <li>• Auditoria completa</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="w-5 h-5" />
                Importante Saber
              </CardTitle>
            </CardHeader>
            <CardContent className="text-yellow-700">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">💳 Cartões de Teste</h4>
                  <p className="text-sm">Use o cartão 4242 4242 4242 4242 para testes. Qualquer data futura e CVC.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">🔄 Ambiente de Desenvolvimento</h4>
                  <p className="text-sm">Estamos usando chaves de teste do Stripe. Nenhum valor real é cobrado.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">📊 Logs Detalhados</h4>
                  <p className="text-sm">Todos os Payment Intents são logados com ID único para rastreamento.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <Link href="/stripe-payment-intent-demo">
              <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                Testar Payment Intent
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}