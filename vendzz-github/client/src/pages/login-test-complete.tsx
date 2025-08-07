import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function LoginTestComplete() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [tests, setTests] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Detectar informações do dispositivo
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
      isAndroid: /Android/.test(navigator.userAgent),
      cookieEnabled: navigator.cookieEnabled,
      language: navigator.language,
      onLine: navigator.onLine,
      currentURL: window.location.href,
      protocol: window.location.protocol,
      host: window.location.host,
      port: window.location.port,
      pathname: window.location.pathname,
      referrer: document.referrer,
      localStorage: typeof Storage !== 'undefined',
      fetch: typeof fetch !== 'undefined',
      serviceWorker: 'serviceWorker' in navigator,
      pwa: window.matchMedia('(display-mode: standalone)').matches,
      connection: (navigator as any).connection ? {
        effectiveType: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
        rtt: (navigator as any).connection.rtt
      } : 'N/A'
    };
    setDebugInfo(info);
  }, []);

  const runCompleteTest = async () => {
    setIsRunning(true);
    const testResults = [];

    // Test 1: Basic connectivity
    try {
      const start = Date.now();
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const time = Date.now() - start;
      testResults.push({
        name: 'Basic Connectivity',
        status: response.status === 401 ? 'SUCCESS' : 'FAIL',
        details: `Status: ${response.status}, Time: ${time}ms`,
        time
      });
    } catch (error: any) {
      testResults.push({
        name: 'Basic Connectivity',
        status: 'ERROR',
        details: `Error: ${error.message}`,
        time: 0
      });
    }

    // Test 2: Login with localhost URL
    try {
      const start = Date.now();
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@vendzz.com',
          password: 'Btts4381!'
        })
      });
      const time = Date.now() - start;
      const data = await response.text();
      testResults.push({
        name: 'Login (localhost URL)',
        status: response.ok ? 'SUCCESS' : 'FAIL',
        details: `Status: ${response.status}, Response: ${data.substring(0, 100)}...`,
        time
      });
    } catch (error: any) {
      testResults.push({
        name: 'Login (localhost URL)',
        status: 'ERROR',
        details: `Error: ${error.message}`,
        time: 0
      });
    }

    // Test 3: Login with relative URL
    try {
      const start = Date.now();
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@vendzz.com',
          password: 'Btts4381!'
        })
      });
      const time = Date.now() - start;
      const data = await response.text();
      testResults.push({
        name: 'Login (relative URL)',
        status: response.ok ? 'SUCCESS' : 'FAIL',
        details: `Status: ${response.status}, Response: ${data.substring(0, 100)}...`,
        time
      });
    } catch (error: any) {
      testResults.push({
        name: 'Login (relative URL)',
        status: 'ERROR',
        details: `Error: ${error.message}`,
        time: 0
      });
    }

    // Test 4: Login with public URL
    try {
      const publicURL = window.location.origin;
      const start = Date.now();
      const response = await fetch(`${publicURL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@vendzz.com',
          password: 'Btts4381!'
        })
      });
      const time = Date.now() - start;
      const data = await response.text();
      testResults.push({
        name: 'Login (public URL)',
        status: response.ok ? 'SUCCESS' : 'FAIL',
        details: `URL: ${publicURL}, Status: ${response.status}, Response: ${data.substring(0, 100)}...`,
        time
      });
    } catch (error: any) {
      testResults.push({
        name: 'Login (public URL)',
        status: 'ERROR',
        details: `Error: ${error.message}`,
        time: 0
      });
    }

    // Test 5: Test CORS headers
    try {
      const start = Date.now();
      const response = await fetch('/api/auth/login', {
        method: 'OPTIONS'
      });
      const time = Date.now() - start;
      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
      };
      testResults.push({
        name: 'CORS Headers',
        status: response.ok ? 'SUCCESS' : 'FAIL',
        details: `Headers: ${JSON.stringify(corsHeaders)}`,
        time
      });
    } catch (error: any) {
      testResults.push({
        name: 'CORS Headers',
        status: 'ERROR',
        details: `Error: ${error.message}`,
        time: 0
      });
    }

    // Test 6: Network timing
    try {
      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(
          fetch('/api/auth/verify').then(r => ({ status: r.status, time: Date.now() }))
        );
      }
      const results = await Promise.all(promises);
      const avgTime = results.reduce((sum, r) => sum + (r.time - Date.now()), 0) / 3;
      testResults.push({
        name: 'Network Performance',
        status: 'SUCCESS',
        details: `3 requests avg time: ${Math.abs(avgTime).toFixed(2)}ms`,
        time: Math.abs(avgTime)
      });
    } catch (error: any) {
      testResults.push({
        name: 'Network Performance',
        status: 'ERROR',
        details: `Error: ${error.message}`,
        time: 0
      });
    }

    setTests(testResults);
    setIsRunning(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'bg-green-500';
      case 'FAIL': return 'bg-red-500';
      case 'ERROR': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gray-800/50 border-green-500/20">
          <CardHeader>
            <CardTitle className="text-green-400 text-center">
              🔍 TESTE COMPLETO DE LOGIN - iPhone/iOS Debug
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Device Info */}
        <Card className="bg-gray-800/50 border-gray-600">
          <CardHeader>
            <CardTitle className="text-blue-400">Informações do Dispositivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(debugInfo).map(([key, value]) => (
                <div key={key} className="bg-gray-700/50 p-3 rounded-lg">
                  <div className="text-blue-300 text-sm font-medium capitalize">{key}:</div>
                  <div className="text-white text-sm break-all mt-1">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card className="bg-gray-800/50 border-gray-600">
          <CardContent className="pt-6">
            <Button 
              onClick={runCompleteTest}
              disabled={isRunning}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3"
            >
              {isRunning ? 'Executando Testes...' : 'Executar Todos os Testes'}
            </Button>
          </CardContent>
        </Card>

        {/* Test Results */}
        {tests.length > 0 && (
          <Card className="bg-gray-800/50 border-gray-600">
            <CardHeader>
              <CardTitle className="text-yellow-400">Resultados dos Testes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tests.map((test, index) => (
                  <div key={index} className="bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-medium">{test.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(test.status)} text-white`}>
                          {test.status}
                        </Badge>
                        {test.time > 0 && (
                          <Badge variant="outline" className="text-gray-300">
                            {test.time}ms
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-gray-300 text-sm">
                      {test.details}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
                <h3 className="text-green-400 font-medium mb-2">Resumo:</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-green-400 text-lg font-bold">
                      {tests.filter(t => t.status === 'SUCCESS').length}
                    </div>
                    <div className="text-gray-400 text-sm">Sucessos</div>
                  </div>
                  <div>
                    <div className="text-red-400 text-lg font-bold">
                      {tests.filter(t => t.status === 'FAIL').length}
                    </div>
                    <div className="text-gray-400 text-sm">Falhas</div>
                  </div>
                  <div>
                    <div className="text-orange-400 text-lg font-bold">
                      {tests.filter(t => t.status === 'ERROR').length}
                    </div>
                    <div className="text-gray-400 text-sm">Erros</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-gray-800/50 border-yellow-500/20">
          <CardContent className="pt-6">
            <div className="text-yellow-400 text-sm">
              <p className="mb-2"><strong>Instruções:</strong></p>
              <ul className="space-y-1 text-gray-300">
                <li>• Acesse esta página no iPhone: <code className="bg-gray-700 px-1 rounded">/login-test-complete</code></li>
                <li>• Execute os testes e envie screenshot dos resultados</li>
                <li>• Especial atenção ao teste "Login (relative URL)" vs "Login (localhost URL)"</li>
                <li>• Verifique se há diferenças entre WiFi e dados móveis</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}