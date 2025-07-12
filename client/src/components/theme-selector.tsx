import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor,
  Check,
  Sparkles
} from "lucide-react";

export type Theme = 'light' | 'dark' | 'system';

export function ThemeSelector() {
  const [theme, setTheme] = useState<Theme>('light');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('vendzz-theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (selectedTheme: Theme) => {
    const root = document.documentElement;
    
    if (selectedTheme === 'dark') {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else if (selectedTheme === 'light') {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark-theme');
        root.classList.remove('light-theme');
      } else {
        root.classList.add('light-theme');
        root.classList.remove('dark-theme');
      }
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('vendzz-theme', newTheme);
    applyTheme(newTheme);
    setIsOpen(false);
  };

  const themes = [
    {
      id: 'light' as Theme,
      name: 'Padrão',
      description: 'Tema claro tradicional',
      icon: <Sun className="w-4 h-4" />,
      preview: 'bg-gradient-to-br from-blue-50 to-indigo-100'
    },
    {
      id: 'dark' as Theme,
      name: 'Escuro Premium',
      description: 'Tema escuro moderno',
      icon: <Moon className="w-4 h-4" />,
      preview: 'bg-gradient-to-br from-gray-900 to-black',
      badge: 'Premium'
    },
    {
      id: 'system' as Theme,
      name: 'Sistema',
      description: 'Segue configuração do sistema',
      icon: <Monitor className="w-4 h-4" />,
      preview: 'bg-gradient-to-br from-slate-200 to-slate-400'
    }
  ];

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Palette className="w-4 h-4" />
        Tema
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50">
          <Card className="w-80 shadow-lg border-gray-200 dark-theme:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-green-500" />
                <span className="font-semibold text-sm">Escolha seu Tema</span>
              </div>
              
              <div className="space-y-3">
                {themes.map((themeOption) => (
                  <button
                    key={themeOption.id}
                    onClick={() => handleThemeChange(themeOption.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all hover:bg-gray-50 dark-theme:hover:bg-gray-800 ${
                      theme === themeOption.id 
                        ? 'border-green-500 bg-green-50 dark-theme:bg-green-900/20' 
                        : 'border-gray-200 dark-theme:border-gray-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${themeOption.preview} flex items-center justify-center`}>
                      {themeOption.icon}
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{themeOption.name}</span>
                        {themeOption.badge && (
                          <Badge className="bg-green-500/20 text-green-600 text-xs">
                            {themeOption.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark-theme:text-gray-400">
                        {themeOption.description}
                      </p>
                    </div>
                    
                    {theme === themeOption.id && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}