import React, { useState, useEffect } from 'react';
import { X, Smartphone, Download, Share, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// @ts-ignore
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
    const ios = /iPad|iPhone|iPod/.test(userAgent);
    const android = /Android/.test(userAgent);
    const desktop = !ios && !android;
    
    setIsIOS(ios);
    setIsAndroid(android);
    setIsDesktop(desktop);
  }, []);

  if (!isOpen) return null;

  const renderIOSInstructions = () => (
    <div className="space-y-3">
      <div className="text-center">
        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
          <Smartphone className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-sm font-semibold text-white mb-1">
          Instalar no iPhone
        </h3>
        <p className="text-gray-300 text-xs mb-3">
          Siga os passos da animação
        </p>
      </div>

      {/* Área do GIF - Animação visual */}
      <div className="bg-gray-800 rounded-lg p-2 mb-3">
        <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-600 rounded-lg flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-green-500/10 rounded-lg"></div>
          <div className="text-white text-center z-10">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <Smartphone className="w-6 h-6 animate-pulse" />
              <Share className="w-4 h-4 animate-bounce" />
              <Plus className="w-4 h-4 animate-pulse" />
            </div>
            <p className="text-xs opacity-75">Safari → Compartilhar → Adicionar</p>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
          <span className="text-white">Toque no botão <Share className="w-3 h-3 inline mx-1" /></span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
          <span className="text-white">Selecione "Adicionar à Tela de Início" <Plus className="w-3 h-3 inline mx-1" /></span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
          <span className="text-white">Confirme tocando em "Adicionar"</span>
        </div>
      </div>
    </div>
  );

  const renderAndroidInstructions = () => (
    <div className="space-y-3">
      <div className="text-center">
        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
          <Download className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-sm font-semibold text-white mb-1">
          Instalar no Android
        </h3>
        <p className="text-gray-300 text-xs mb-3">
          Adicione como aplicativo nativo
        </p>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
          <span className="text-white">Menu do navegador (⋮)</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
          <span className="text-white">"Instalar app" ou "Adicionar à tela inicial"</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
          <span className="text-white">Confirme a instalação</span>
        </div>
      </div>
    </div>
  );

  const renderDesktopInstructions = () => (
    <div className="space-y-3">
      <div className="text-center">
        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
          <Smartphone className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-sm font-semibold text-white mb-1">
          Acesse pelo iPhone
        </h3>
        <p className="text-gray-300 text-xs mb-3">
          Para melhor experiência, use o Safari no iPhone
        </p>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
          <span className="text-white">Abra esta página no Safari (iPhone)</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
          <span className="text-white">Toque no botão <Share className="w-3 h-3 inline mx-1" /></span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
          <span className="text-white">Adicionar à Tela de Início <Plus className="w-3 h-3 inline mx-1" /></span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 z-50">
      <Card className="w-full max-w-sm bg-gray-900/95 border-gray-700 relative">
        <CardHeader className="relative pb-2">
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 text-gray-400 hover:text-white hover:bg-gray-800 w-8 h-8"
          >
            <X className="w-3 h-3" />
          </Button>
          <div className="text-center">
            <img 
              src={logoVendzz} 
              alt="Vendzz" 
              className="h-6 w-auto mx-auto mb-2"
            />
            <CardTitle className="text-base text-white">
              Instalar Vendzz
            </CardTitle>
            <p className="text-gray-400 text-xs mt-1">
              Acesso rápido em qualquer lugar
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 pb-4">
          {isIOS && renderIOSInstructions()}
          {isAndroid && renderAndroidInstructions()}
          {isDesktop && renderDesktopInstructions()}
          
          <div className="flex gap-2 mt-4">
            <Button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm py-2"
            >
              Entendi
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}