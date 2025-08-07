import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MessageSquare, CheckCircle, XCircle } from 'lucide-react';

const TesteSMSPage = () => {
  const [phone, setPhone] = useState('11995133932');
  const [message, setMessage] = useState('🧪 TESTE SISTEMA VENDZZ: Formatação automática de números brasileiros funcionando perfeitamente! Sistema ativo e configurado.');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; phone?: string } | null>(null);

  const handleTestSms = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, message }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || 'SMS enviado com sucesso!',
          phone: data.phone
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Erro ao enviar SMS'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Erro de conexão ao enviar SMS'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-500" />
            Teste SMS - Sistema Vendzz
          </CardTitle>
          <CardDescription>
            Teste direto do sistema de SMS com formatação automática para números brasileiros
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Número de Telefone (apenas números)
            </label>
            <Input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="11995133932"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Digite apenas números. Ex: 11995133932 será formatado para +5511995133932
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Mensagem SMS
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem de teste..."
              className="w-full p-3 border rounded-md resize-none h-24"
              maxLength={160}
            />
            <p className="text-xs text-gray-500 mt-1">
              Máximo 160 caracteres. Atual: {message.length}/160
            </p>
          </div>

          <Button 
            onClick={handleTestSms}
            disabled={loading || !phone || !message}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando SMS...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 mr-2" />
                Enviar SMS de Teste
              </>
            )}
          </Button>

          {result && (
            <Alert className={result.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
              <div className="flex items-start gap-2">
                {result.success ? (
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                )}
                <div>
                  <AlertDescription className={result.success ? 'text-green-700' : 'text-red-700'}>
                    <strong>{result.success ? 'Sucesso!' : 'Erro!'}</strong>
                    <br />
                    {result.message}
                    {result.phone && (
                      <>
                        <br />
                        <span className="text-sm">Enviado para: {result.phone}</span>
                      </>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-sm mb-2">📊 Informações do Sistema:</h3>
            <ul className="text-xs space-y-1 text-gray-600">
              <li>• <strong>Twilio Account SID:</strong> ACaa795b9b75f0821fc406b3396f797563</li>
              <li>• <strong>Twilio Phone:</strong> +12344373337</li>
              <li>• <strong>Formatação:</strong> Automática para números brasileiros</li>
              <li>• <strong>Target de teste:</strong> 11995133932 → +5511995133932</li>
              <li>• <strong>Sistema:</strong> SQLite + Twilio integration</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TesteSMSPage;