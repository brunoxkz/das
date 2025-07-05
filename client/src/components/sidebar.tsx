import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth-jwt";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Plus, 
  Palette, 
  TrendingUp,
  Settings,
  Crown,
  ChevronLeft,
  ChevronRight,
  Vote,
  Home,
  FileText,
  Users,
  Zap,
  Shield,
  Trophy,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();
  const userData = user as any;

  // Buscar dados dos quizzes em tempo real
  const { data: quizzes } = useQuery({
    queryKey: ["/api/quizzes"],
  });

  const { data: responses } = useQuery({
    queryKey: ["/api/quiz-responses"],
  });

  const quizzesList = Array.isArray(quizzes) ? quizzes : [];
  const responsesList = Array.isArray(responses) ? responses : [];
  const totalQuizzes = quizzesList.length;
  const newLeadsCount = responsesList.filter((response: any) => {
    const today = new Date();
    const responseDate = new Date(response.createdAt);
    return responseDate.toDateString() === today.toDateString();
  }).length;

  // Auto-collapse when entering quiz builder
  useEffect(() => {
    if (location.includes('/quiz-builder') || location.includes('/quizzes') && location.includes('/edit')) {
      setIsCollapsed(true);
    }
  }, [location]);

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home className="w-4 h-4" />,
      active: location === "/" || location === "/dashboard"
    },
    ...(userData?.role === "admin" ? [{
      title: "Admin",
      href: "/admin",
      icon: <Shield className="w-4 h-4" />,
      active: location === "/admin",
      className: "text-red-600 border-red-200 bg-red-50 hover:bg-red-100",
      badge: "⚡"
    }] : []),
    {
      title: "Meus Quizzes",
      href: "/quizzes",
      icon: <BarChart3 className="w-4 h-4" />,
      active: location.startsWith("/quizzes"),
      badge: totalQuizzes > 0 ? totalQuizzes.toString() : undefined
    },
    {
      title: "Templates",
      href: "/templates",
      icon: <Palette className="w-4 h-4" />,
      active: location === "/templates"
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: <TrendingUp className="w-4 h-4" />,
      active: location === "/analytics"
    },
    {
      title: "Leads",
      href: "/leads",
      icon: <Users className="w-4 h-4" />,
      active: location === "/leads",
      badge: newLeadsCount > 0 ? "New" : undefined
    },
    {
      title: "Premiações",
      href: "/premiacoes",
      icon: <Trophy className="w-4 h-4" />,
      active: location === "/premiacoes",
      badge: "🏆"
    },
    {
      title: "Tutoriais",
      href: "/tutoriais",
      icon: <BookOpen className="w-4 h-4" />,
      active: location === "/tutoriais"
    }
  ];

  const bottomItems = [
    {
      title: "Upgrade",
      href: "/subscribe",
      icon: <Crown className="w-4 h-4" />,
      active: location === "/subscribe",
      className: "text-primary border-primary/20 bg-primary/5 hover:bg-primary/10"
    },
    {
      title: "Configurações",
      href: "/settings",
      icon: <Settings className="w-4 h-4" />,
      active: location === "/settings"
    }
  ];

  return (
    <div className={cn(
      "vendzz-sidebar flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-center">
          {!isCollapsed && (
            <span className="font-bold text-2xl text-gray-900">QuizMaster</span>
          )}
          {isCollapsed && (
            <span className="font-bold text-xl text-gray-900">Q</span>
          )}
        </div>
      </div>

      {/* Create Button */}
      <div className="p-4 border-b border-gray-200">
        <Link href="/quizzes/new">
          <Button className={cn(
            "w-full",
            isCollapsed ? "px-0" : "px-4"
          )}>
            <Plus className="w-4 h-4" />
            {!isCollapsed && <span className="ml-2">Criar Quiz</span>}
          </Button>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={item.active ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isCollapsed ? "px-0" : "px-3",
                  item.className,
                  item.active && !item.className && "bg-primary/10 text-primary"
                )}
              >
                {item.icon}
                {!isCollapsed && (
                  <>
                    <span className="ml-2 flex-1 text-left">{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom Items */}
      <div className="p-4 border-t border-gray-200">
        <div className="space-y-1">
          {bottomItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={item.active ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isCollapsed ? "px-0" : "px-3",
                  item.className,
                  item.active && !item.className && "bg-primary/10 text-primary"
                )}
              >
                {item.icon}
                {!isCollapsed && (
                  <span className="ml-2">{item.title}</span>
                )}
              </Button>
            </Link>
          ))}
        </div>

        {/* User Plan Info */}
        {!isCollapsed && userData && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">Plano Atual</span>
              <Badge variant="outline" className="text-xs capitalize">
                {userData.plan === 'enterprise' ? 'Enterprise' : userData.plan === 'premium' ? 'Premium' : 'Free'}
              </Badge>
            </div>
            {userData.plan === 'enterprise' ? (
              <div className="text-xs text-gray-600">
                {totalQuizzes} quizzes criados (ilimitado)
              </div>
            ) : (
              <>
                <div className="text-xs text-gray-600 mb-2">
                  {totalQuizzes} de {userData.plan === 'premium' ? '25' : '3'} quizzes utilizados
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full" style={{ 
                    width: `${Math.min((totalQuizzes / (userData.plan === 'premium' ? 25 : 3)) * 100, 100)}%` 
                  }}></div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}