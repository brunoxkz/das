import { useState, useEffect } from "react";

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Check if theme is stored in localStorage
    const stored = localStorage.getItem('theme');
    if (stored) {
      return stored as 'light' | 'dark';
    }
    
    // Default to light theme (Vendzz padrão)
    return 'light';
  });

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Store theme in localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return { theme, setTheme, toggleTheme };
}