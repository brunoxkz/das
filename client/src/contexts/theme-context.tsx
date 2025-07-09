import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'default' | 'dark' | 'future';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  getThemeClasses: () => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('vendzz-theme');
    return (saved as Theme) || 'default';
  });

  useEffect(() => {
    localStorage.setItem('vendzz-theme', theme);
    
    // Remove all theme classes
    document.documentElement.classList.remove('theme-default', 'theme-dark', 'theme-future');
    
    // Add current theme class
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-900 text-white';
      case 'future':
        return 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white';
      default:
        return 'bg-white text-black';
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, getThemeClasses }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}