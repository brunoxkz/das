import React from 'react';
import { useTheme } from '@/contexts/theme-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Palette, Moon, Sparkles } from 'lucide-react';

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      id: 'default' as const,
      name: 'Padrão',
      description: 'Tema claro padrão Vendzz',
      icon: Palette,
      preview: 'bg-white border-gray-200',
      textColor: 'text-gray-900'
    },
    {
      id: 'dark' as const,
      name: 'Dark',
      description: 'Tema escuro moderno',
      icon: Moon,
      preview: 'bg-gray-900 border-gray-700',
      textColor: 'text-white'
    },
    {
      id: 'future' as const,
      name: 'Future',
      description: 'Tema futurista Huly inspirado',
      icon: Sparkles,
      preview: 'bg-gradient-to-br from-purple-600 to-blue-600 border-purple-400',
      textColor: 'text-white'
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Tema da Interface
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            const isSelected = theme === themeOption.id;
            
            return (
              <button
                key={themeOption.id}
                onClick={() => setTheme(themeOption.id)}
                className={`relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                  isSelected 
                    ? 'border-green-500 ring-2 ring-green-200' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className="space-y-3">
                  <div className={`w-full h-16 rounded-md ${themeOption.preview} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${themeOption.textColor}`} />
                  </div>
                  
                  <div className="text-left">
                    <h3 className="font-semibold text-sm">{themeOption.name}</h3>
                    <p className="text-xs text-gray-600">{themeOption.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        
        <div className="pt-4 border-t">
          <p className="text-sm text-gray-600">
            O tema será aplicado a toda a dashboard instantaneamente.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}