import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Share, Plus, Download, Smartphone, Monitor } from 'lucide-react';
import logoVendzz from '@assets/logo-vendzz-white_1753041219534.png';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall?: () => void;
}

export default function PWAInstallModal({ isOpen, onClose, onInstall }: PWAInstallModalProps) {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(userAgent);
    const android = /Android/.test(userAgent);
    const desktop = !iOS && !android;

    setIsIOS(iOS);
    setIsAndroid(android);
    setIsDesktop(desktop);
  }, []);

  if (!isOpen) return null;

  const renderIOSInstructions = () => (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Share className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Instalar no iPhone/iPad
        </h3>
        <p className="text-gray-300 text-sm mb-4">
          Siga os passos abaixo para adicionar o Vendzz à sua tela inicial
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            1
          </div>
          <div>
            <p className="text-white font-medium">Toque no botão de compartilhar</p>
            <p className="text-gray-400 text-sm">Encontre o ícone <Share className="w-4 h-4 inline mx-1" /> na parte inferior do Safari</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            2
          </div>
          <div>
            <p className="text-white font-medium">Selecione "Adicionar à Tela de Início"</p>
            <p className="text-gray-400 text-sm">Procure pela opção <Plus className="w-4 h-4 inline mx-1" /> "Adicionar à Tela de Início"</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            3
          </div>
          <div>
            <p className="text-white font-medium">Confirme a instalação</p>
            <p className="text-gray-400 text-sm">Toque em "Adicionar" para finalizar</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAndroidInstructions = () => (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Download className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Instalar no Android
        </h3>
        <p className="text-gray-300 text-sm mb-4">
          Adicione o Vendzz como um aplicativo nativo
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            1
          </div>
          <div>
            <p className="text-white font-medium">Toque no menu do navegador</p>
            <p className="text-gray-400 text-sm">Encontre os três pontos (⋮) no canto superior direito</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            2
          </div>
          <div>
            <p className="text-white font-medium">Selecione "Instalar app" ou "Adicionar à tela inicial"</p>
            <p className="text-gray-400 text-sm">Procure pela opção de instalação no menu</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            3
          </div>
          <div>
            <p className="text-white font-medium">Confirme a instalação</p>
            <p className="text-gray-400 text-sm">Toque em "Instalar" para adicionar o app</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDesktopInstructions = () => (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Monitor className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Instalar no Computador
        </h3>
        <p className="text-gray-300 text-sm mb-4">
          Adicione o Vendzz como aplicativo do desktop
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            1
          </div>
          <div>
            <p className="text-white font-medium">Procure o ícone de instalação</p>
            <p className="text-gray-400 text-sm">Na barra de endereços, procure por <Download className="w-4 h-4 inline mx-1" /> ou ⊕</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            2
          </div>
          <div>
            <p className="text-white font-medium">Clique em "Instalar Vendzz"</p>
            <p className="text-gray-400 text-sm">O navegador mostrará uma opção de instalação</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            3
          </div>
          <div>
            <p className="text-white font-medium">Confirme a instalação</p>
            <p className="text-gray-400 text-sm">O app será adicionado ao seu desktop e menu iniciar</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-green-500/20 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="w-6"></div>
            <img 
              src={logoVendzz} 
              alt="Vendzz" 
              className="h-12 w-auto"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <CardTitle className="text-2xl font-bold text-green-400 mb-2">
            Instalar Aplicativo
          </CardTitle>
          
          <p className="text-gray-300 text-sm">
            Seja Bem-Vindo ao Vendzz!
          </p>
          
          <div className="my-4 p-4 bg-green-600/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-2">
              <Smartphone className="w-4 h-4" />
              O que é melhor em ter um app próprio?
            </div>
            <div className="space-y-2 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Agregar valor aos seus produtos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Diminuir os reembolsos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Produtos bloqueados dentro do App</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Enviar Notificações Push</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Aumentar a conversão da sua oferta</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isIOS && renderIOSInstructions()}
          {isAndroid && renderAndroidInstructions()}
          {isDesktop && renderDesktopInstructions()}

          <div className="space-y-3 pt-4 border-t border-gray-700">
            <Button
              onClick={onInstall || onClose}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3"
            >
              {isIOS ? 'Entendi, vou instalar!' : 'Instalar Agora'}
            </Button>
            
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Continuar no Navegador
            </Button>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              Para melhor experiência, recomendamos instalar o aplicativo
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}