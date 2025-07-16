import { Sidebar } from "@/components/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useSidebar } from "@/hooks/useSidebar";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export function Layout({ children, showSidebar = true }: LayoutProps) {
  const { isAuthenticated } = useAuth();
  const { isCollapsed } = useSidebar();

  // Se não estiver autenticado ou não deve mostrar sidebar, apenas retorna os children
  if (!isAuthenticated || !showSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="app-container bg-gray-50">
      <Sidebar />
      <main className={cn(
        "main-content",
        isCollapsed ? "sidebar-collapsed" : ""
      )}>
        {children}
      </main>
    </div>
  );
}