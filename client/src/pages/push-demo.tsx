import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Smartphone, Monitor, Globe, Home } from 'lucide-react';

export default function PushDemo() {
  const [currentScenario, setCurrentScenario] = useState(0);

  const scenarios = [
    {
      icon: Home,
      title: "Usuário no Dashboard",
      location: "/dashboard",
      description: "Usuário navegando no painel principal",
      notification: "✅ Notificação aparece na tela de bloqueio!"
    },
    {
      icon: Monitor,
      title: "Usuário criando Quiz",
      location: "/quiz-builder",
      description: "Usuário trabalhando no editor de quiz",
      notification: "✅ Notificação aparece na tela de bloqueio!"
    },
    {
      icon: Globe,
      title: "Usuário em outro site",
      location: "google.com",
      description: "Usuário navegando em sites externos",
      notification: "✅ Notificação aparece na tela de bloqueio!"
    },
    {
      icon: Smartphone,
      title: "Navegador fechado",
      location: "App fechado",
      description: "Usuário com o navegador completamente fechado",
      notification: "✅ Notificação aparece na tela de bloqueio!"
    }
  ];

  const currentScene = scenarios[currentScenario];
  const Icon = currentScene.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Como Funcionam as Push Notifications
          </h1>
          <p className="text-gray-600 text-lg">
            Demonstração: Notificações chegam independente da página
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Cenário Atual */}
          <Card className="border-2 border-green-200">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">{currentScene.title}</CardTitle>
              <CardDescription className="text-lg">
                Localização: <Badge variant="outline">{currentScene.location}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">{currentScene.description}</p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <Bell className="w-6 h-6 mx-auto text-green-600 mb-2" />
                <p className="font-semibold text-green-800">
                  {currentScene.notification}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Simulação da Notificação */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Tela de Bloqueio do iPhone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black rounded-xl p-4 text-white">
                <div className="text-xs text-gray-300 mb-2">9:41</div>
                
                {/* Simulação da notificação */}
                <div className="bg-gray-800 rounded-lg p-3 mb-4 border border-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">V</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">Vendzz</span>
                        <span className="text-xs text-gray-400">agora</span>
                      </div>
                      <p className="text-sm text-gray-200">
                        Nova campanha de quiz publicada! 🎯
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Toque para abrir no app
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-400 text-center">
                  A notificação aparece aqui independentemente da página que o usuário estava
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navegação entre cenários */}
        <div className="mt-8 text-center">
          <div className="flex justify-center gap-2 mb-4">
            {scenarios.map((_, index) => (
              <Button
                key={index}
                variant={currentScenario === index ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentScenario(index)}
                className="w-12 h-12 rounded-full"
              >
                {index + 1}
              </Button>
            ))}
          </div>
          
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => setCurrentScenario(Math.max(0, currentScenario - 1))}
              disabled={currentScenario === 0}
            >
              ← Anterior
            </Button>
            <Button 
              onClick={() => setCurrentScenario(Math.min(scenarios.length - 1, currentScenario + 1))}
              disabled={currentScenario === scenarios.length - 1}
            >
              Próximo →
            </Button>
          </div>
        </div>

        {/* Explicação técnica */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Como isso é possível?</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <div className="space-y-3">
              <p><strong>Service Worker:</strong> Roda em segundo plano mesmo com o app fechado</p>
              <p><strong>Push API:</strong> Sistema nativo do iOS/Android para notificações</p>
              <p><strong>Independência:</strong> Funciona mesmo fora do nosso site</p>
              <p><strong>Tela de bloqueio:</strong> Aparece como notificação nativa do sistema</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}