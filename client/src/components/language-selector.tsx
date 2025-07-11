import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const languages = [
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'es-ES', name: 'Español (España)', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'Français (France)', flag: '🇫🇷' },
  { code: 'de-DE', name: 'Deutsch (Deutschland)', flag: '🇩🇪' },
  { code: 'it-IT', name: 'Italiano (Italia)', flag: '🇮🇹' },
  { code: 'ja-JP', name: '日本語 (日本)', flag: '🇯🇵' },
  { code: 'ko-KR', name: '한국어 (한국)', flag: '🇰🇷' },
  { code: 'zh-CN', name: '中文 (简体)', flag: '🇨🇳' },
  { code: 'ru-RU', name: 'Русский (Россия)', flag: '🇷🇺' },
  { code: 'ar-SA', name: 'العربية (السعودية)', flag: '🇸🇦' },
  { code: 'hi-IN', name: 'हिन्दी (भारत)', flag: '🇮🇳' },
];

interface LanguageSelectorProps {
  collapsed?: boolean;
}

export function LanguageSelector({ collapsed = false }: LanguageSelectorProps) {
  const { currentLanguage, changeLanguage } = useLanguage();
  
  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={collapsed ? "p-1" : "p-2"}
          title={collapsed ? currentLang.name : undefined}
        >
          {collapsed ? (
            <span className="text-sm">{currentLang.flag}</span>
          ) : (
            <>
              <Globe className="w-4 h-4 mr-2" />
              <span className="text-sm">{currentLang.flag} {currentLang.code.split('-')[0].toUpperCase()}</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center">
              <span className="mr-2">{language.flag}</span>
              <span className="text-sm">{language.name}</span>
            </div>
            {currentLanguage === language.code && (
              <Check className="w-4 h-4 text-green-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}