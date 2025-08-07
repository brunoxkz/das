import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function LoginDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      language: navigator.language,
      onLine: navigator.onLine,
      location: window.location.href,
      protocol: window.location.protocol,
      host: window.location.host,
      referrer: document.referrer,
      localStorage: typeof Storage !== 'undefined',
      fetch: typeof fetch !== 'undefined',
      serviceWorker: 'serviceWorker' in navigator,
      pwa: window.matchMedia('(display-mode: standalone)').matches
    };
    setDebugInfo(info);
  }, []);

  const testAPI = async () => {
    setTestResult('Testando...');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@vendzz.com',
          password: 'Btts4381!'
        })
      });

      const result = await response.text();
      setTestResult(`Status: ${response.status}\nResponse: ${result.substring(0, 200)}...`);
    } catch (error: any) {
      setTestResult(`Erro: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-green-400">Debug de Conexão - iPhone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(debugInfo).map(([key, value]) => (
                <div key={key} className="bg-gray-700 p-3 rounded">
                  <div className="text-green-300 text-sm font-medium">{key}:</div>
                  <div className="text-white text-sm break-all">
                    {typeof value === 'boolean' ? value.toString() : String(value)}
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              onClick={testAPI}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Testar API de Login
            </Button>
            
            {testResult && (
              <div className="bg-gray-700 p-4 rounded mt-4">
                <div className="text-green-300 text-sm font-medium mb-2">Resultado do Teste:</div>
                <pre className="text-white text-xs whitespace-pre-wrap">{testResult}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}