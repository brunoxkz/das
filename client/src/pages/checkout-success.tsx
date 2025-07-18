import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar, CreditCard, Mail, Phone, ArrowRight } from 'lucide-react';

export default function CheckoutSuccess() {
  const [, navigate] = useLocation();
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      // Simular dados da sessão (em produção, buscar do Stripe)
      setTimeout(() => {
        setSessionData({
          id: sessionId,
          customerName: 'João Silva',
          customerEmail: 'joao@exemplo.com',
          planName: 'Plano Básico',
          planPrice: 29.90,
          trialDays: 3,
          nextBillingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
          status: 'active'
        });
        setLoading(false);
      }, 1000);
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-white">Verificando seu pagamento...</p>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700 max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-white text-xl mb-4">Sessão não encontrada</h2>
            <p className="text-gray-300 mb-6">
              Não foi possível verificar seu pagamento. Entre em contato com o suporte.
            </p>
            <Button 
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header de Sucesso */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Pagamento Confirmado!
          </h1>
          <p className="text-gray-300 text-lg">
            Sua assinatura foi ativada com sucesso. Bem-vindo à Vendzz!
          </p>
        </div>

        {/* Resumo da Assinatura */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Detalhes da Assinatura
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Plano:</span>
                <Badge className="bg-green-600">{sessionData.planName}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Valor:</span>
                <span className="text-white font-semibold">
                  R$ {sessionData.planPrice.toFixed(2).replace('.', ',')}/mês
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Trial Gratuito:</span>
                <span className="text-green-400 font-semibold">
                  {sessionData.trialDays} dias
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Próxima Cobrança:</span>
                <span className="text-white">
                  {sessionData.nextBillingDate}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Status:</span>
                <Badge className="bg-green-600">Ativo</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Dados do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Nome:</span>
                <span className="text-white">{sessionData.customerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Email:</span>
                <span className="text-white">{sessionData.customerEmail}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">ID da Sessão:</span>
                <span className="text-gray-400 text-sm font-mono">
                  {sessionData.id.substring(0, 20)}...
                </span>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <p className="text-green-800 dark:text-green-200 text-sm">
                  <strong>Importante:</strong> Você receberá um email de confirmação com os detalhes da sua assinatura.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Próximos Passos */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Próximos Passos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Acesse sua Conta</h3>
                <p className="text-gray-300 text-sm">
                  Faça login na plataforma e explore todas as funcionalidades disponíveis.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-600 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Crie seu Primeiro Quiz</h3>
                <p className="text-gray-300 text-sm">
                  Use nosso builder intuitivo para criar quizzes engajantes e capturar leads.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-600 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Configure Campanhas</h3>
                <p className="text-gray-300 text-sm">
                  Ative SMS, Email e WhatsApp para maximizar suas conversões.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => window.location.href = '/login'}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-8"
          >
            <div className="flex items-center gap-2">
              <span>Acessar Plataforma</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Button>
          <Button 
            onClick={() => navigate('/planos')}
            variant="outline"
            className="border-slate-600 text-white hover:bg-slate-700 py-3 px-8"
          >
            Ver Outros Planos
          </Button>
        </div>

        {/* Suporte */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            Precisa de ajuda? Entre em contato com nosso suporte:{' '}
            <a href="mailto:suporte@vendzz.com" className="text-blue-400 hover:text-blue-300">
              suporte@vendzz.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}