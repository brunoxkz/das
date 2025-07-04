import { Sidebar } from "@/components/sidebar";
import { useAuth } from "@/hooks/useAuth-jwt";

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export function Layout({ children, showSidebar = true }: LayoutProps) {
  const { isAuthenticated } = useAuth();

  // Se não estiver autenticado ou não deve mostrar sidebar, apenas retorna os children
  if (!isAuthenticated || !showSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}