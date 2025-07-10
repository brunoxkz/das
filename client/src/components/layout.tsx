import { Sidebar } from "@/components/sidebar";
import { useAuth } from "@/hooks/useAuth-jwt";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export function Layout({ children, showSidebar = true }: LayoutProps) {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-collapse when entering quiz builder
  useEffect(() => {
    if (location.includes('/quiz-builder') || location.includes('/quizzes') && location.includes('/edit')) {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }
  }, [location]);

  // Se não estiver autenticado ou não deve mostrar sidebar, apenas retorna os children
  if (!isAuthenticated || !showSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className={`min-h-screen transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        {children}
      </main>
    </div>
  );
}