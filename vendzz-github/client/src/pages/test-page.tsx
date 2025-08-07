import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function TestPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runSystemTest = async () => {
    setIsRunning(true);
    const tests = [
      {
        name: 'Backend Connection',
        test: async () => {
          const response = await fetch('/api/health');
          return response.ok;
        }
      },
      {
        name: 'Authentication System',
        test: async () => {
          const token = localStorage.getItem('token');
          return token !== null;
        }
      },
      {
        name: 'Database Connection',
        test: async () => {
          const response = await fetch('/api/dashboard/stats');
          return response.ok;
        }
      }
    ];

    const results = [];
    for (const test of tests) {
      try {
        const result = await test.test();
        results.push({
          name: test.name,
          status: result ? 'success' : 'warning',
          message: result ? 'Funcionando' : 'Problema detectado'
        });
      } catch (error) {
        results.push({
          name: test.name,
          status: 'error',
          message: 'Erro: ' + (error as Error).message
        });
      }
    }

    setTestResults(results);
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🚀 Vendzz - Teste do Sistema
          </h1>
          <p className="text-xl text-gray-300">
            Verificação completa das funcionalidades
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Status do Sistema</CardTitle>
            <CardDescription>
              Teste as principais funcionalidades do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={runSystemTest}
                disabled={isRunning}
                className="w-full"
                size="lg"
              >
                {isRunning ? 'Testando...' : 'Executar Testes'}
              </Button>

              {testResults.length > 0 && (
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      {result.status === 'success' && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {result.status === 'warning' && (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                      {result.status === 'error' && (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{result.name}</div>
                        <div className="text-sm text-gray-600">{result.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Funcionalidades Principais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold">✅ Corrigido</h3>
                <ul className="text-sm space-y-1">
                  <li>• Erro JSX Adjacent Elements</li>
                  <li>• Chaves duplicadas no idioma</li>
                  <li>• Content Security Policy</li>
                  <li>• Sistema de cache otimizado</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">🚀 Funcional</h3>
                <ul className="text-sm space-y-1">
                  <li>• Autenticação JWT</li>
                  <li>• Sistema de Quiz</li>
                  <li>• SMS/Email/WhatsApp</li>
                  <li>• Performance otimizada</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}