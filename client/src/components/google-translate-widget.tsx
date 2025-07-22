import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Languages, Globe, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

// Tipos para Google Translate
declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

// Sistema tipo Google Tradutor que NÃO afeta o português da interface
export function GoogleTranslateWidget() {
  const [isTranslationMode, setIsTranslationMode] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("en");

  // Função para inicializar Google Translate
  useEffect(() => {
    if (isTranslationMode && !window.google?.translate) {
      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.head.appendChild(script);

      // Função de callback do Google Translate
      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement({
          pageLanguage: 'pt',
          includedLanguages: 'en,es,fr,it,de,zh,ja,ko,ar,ru',
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
          multilanguagePage: true
        }, 'google_translate_element');
      };
    }
  }, [isTranslationMode]);

  // Ativar tradução do Google
  const activateTranslation = (language: string) => {
    setTargetLanguage(language);
    setIsTranslationMode(true);
    
    setTimeout(() => {
      const googleTranslateCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (googleTranslateCombo) {
        googleTranslateCombo.value = language;
        googleTranslateCombo.dispatchEvent(new Event('change'));
      }
    }, 1000);
  };

  // Resetar para português original
  const resetToPortuguese = () => {
    const googleTranslateCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (googleTranslateCombo) {
      googleTranslateCombo.value = 'pt';
      googleTranslateCombo.dispatchEvent(new Event('change'));
    }
    setIsTranslationMode(false);
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' }
  ];

  return (
    <div className="relative">
      {/* Elemento do Google Translate (oculto) */}
      <div id="google_translate_element" className="hidden"></div>
      
      {/* Interface personalizada */}
      <div className="flex items-center gap-2">
        {!isTranslationMode ? (
          <>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Globe className="w-3 h-3" />
              <span>Traduzir</span>
            </div>
            <div className="flex gap-1">
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs hover:bg-blue-50"
                  onClick={() => activateTranslation(lang.code)}
                >
                  {lang.flag}
                </Button>
              ))}
            </div>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 text-xs bg-blue-50 text-blue-700 border-blue-200"
            onClick={resetToPortuguese}
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Voltar Português
          </Button>
        )}
      </div>

      {/* Indicador de tradução ativa */}
      {isTranslationMode && (
        <div className="absolute -top-8 left-0 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded border border-blue-200">
          Traduzindo para {languages.find(l => l.code === targetLanguage)?.name}
        </div>
      )}

      {/* CSS para ocultar elementos do Google Translate */}
      <style dangerouslySetInnerHTML={{__html: `
        .goog-te-banner-frame { display: none !important; }
        .goog-te-menu-value { display: none !important; }
        .goog-te-gadget { display: none !important; }
        body { top: 0px !important; }
        .skiptranslate { display: none !important; }
      `}} />
    </div>
  );
}

// Hook para detectar se a tradução está ativa
export function useTranslationStatus() {
  const [isTranslated, setIsTranslated] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const translateFrame = document.querySelector('.goog-te-banner-frame');
      setIsTranslated(!!translateFrame);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, []);

  return isTranslated;
}