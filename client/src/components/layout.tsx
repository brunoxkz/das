import { Sidebar } from "@/components/sidebar";
import { useAuth } from "@/hooks/use-auth-hybrid";
import { useTheme } from "@/contexts/theme-context";

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export function Layout({ children, showSidebar = true }: LayoutProps) {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();

  // Se não estiver autenticado ou não deve mostrar sidebar, apenas retorna os children
  if (!isAuthenticated || !showSidebar) {
    return <>{children}</>;
  }

  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-900';
      case 'future':
        return 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div className={`flex h-screen ${getThemeClasses()}`}>
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}