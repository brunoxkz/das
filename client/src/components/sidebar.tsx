import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth-jwt";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationSystem } from "@/components/notification-system";
import { LanguageSelector } from "@/components/language-selector";
import { useLanguage } from "@/hooks/useLanguage";
import { useSidebar } from "@/hooks/useSidebar";

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
  BookOpen,
  Package,
  MessageSquare,
  Mail,
  Activity,
  Sparkles,
  BarChart,
  Target,
  Bell,
  Globe,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const userData = user as any;
  const { t } = useLanguage();
  const { isCollapsed, toggleSidebar } = useSidebar();

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

  // State is now managed by useSidebar hook

  const navItems = [
    {
      title: t("dashboard"),
      href: "/dashboard",
      icon: <Home className="w-4 h-4" />,
      active: location === "/" || location === "/dashboard"
    },
    ...(userData?.role === "admin" ? [{
      title: t("admin"),
      href: "/admin",
      icon: <Shield className="w-4 h-4" />,
      active: location === "/admin",
      className: "text-red-600 border-red-200 bg-red-50 hover:bg-red-100",
      badge: "⚡"
    }] : []),
    {
      title: t("my_quizzes"),
      href: "/quizzes",
      icon: <BarChart3 className="w-4 h-4" />,
      active: location.startsWith("/quizzes"),
      badge: totalQuizzes > 0 ? totalQuizzes.toString() : undefined
    },
    {
      title: t("templates"),
      href: "/templates",
      icon: <Palette className="w-4 h-4" />,
      active: location === "/templates"
    },
    {
      title: t("analytics"),
      href: "/analytics",
      icon: <TrendingUp className="w-4 h-4" />,
      active: location === "/analytics"
    },

    {
      title: t("tutorials"),
      href: "/tutoriais",
      icon: <BookOpen className="w-4 h-4" />,
      active: location === "/tutoriais"
    },
    {
      title: t("remarketing_sms"),
      href: "/sms-credits",
      icon: <MessageSquare className="w-4 h-4" />,
      active: location === "/sms-credits"
    },
    {
      title: t("email_marketing"),
      href: "/email-marketing",
      icon: <Mail className="w-4 h-4" />,
      active: location === "/email-marketing",
      badge: "📧"
    },
    // Hidden temporarily
    // {
    //   title: "I.A. CONVERSION +",
    //   href: "/ai-conversion",
    //   icon: <Sparkles className="w-4 h-4" />,
    //   active: location === "/ai-conversion",
    //   badge: "🤖",
    //   className: "text-purple-600 border-purple-200 bg-purple-50 hover:bg-purple-100"
    // },
    // {
    //   title: "LIVEGRAM UGC",
    //   href: "/livegram-ugc",
    //   icon: <Users className="w-4 h-4" />,
    //   active: location === "/livegram-ugc",
    //   badge: "📸",
    //   className: "text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
    // },
    {
      title: t("whatsapp_automation"),
      href: "/campanhas-whatsapp",
      icon: <FileText className="w-4 h-4" />,
      active: location === "/campanhas-whatsapp",
      badge: "🤖"
    },
    {
      title: t("cloaker"),
      href: "/cloaker",
      icon: <Shield className="w-4 h-4" />,
      active: location === "/cloaker"
    }
  ];

  const bottomItems = [
    {
      title: t("upgrade"),
      href: "/subscribe",
      icon: <Crown className="w-4 h-4" />,
      active: location === "/subscribe",
      className: "text-primary border-primary/20 bg-primary/5 hover:bg-primary/10"
    },
    {
      title: t("settings"),
      href: "/settings",
      icon: <Settings className="w-4 h-4" />,
      active: location === "/settings"
    }
  ];

  return (
    <aside className={cn(
      "vendzz-sidebar flex flex-col",
      isCollapsed ? "collapsed" : "expanded"
    )}>
      {/* Logo and Notifications */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {!isCollapsed && (
              <img 
                src="https://vendzz.com.br/wp-content/uploads/2024/12/logo-vendzz.png" 
                alt="Vendzz" 
                className="h-12 w-auto"
              />
            )}
            {isCollapsed && (
              <img 
                src="https://vendzz.com.br/wp-content/uploads/2024/12/logo-vendzz.png" 
                alt="Vendzz" 
                className="h-8 w-auto"
              />
            )}
          </div>

          {/* Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Language and Notification Icons (moved below) */}
        {!isCollapsed && (
          <div className="flex items-center justify-center space-x-2 mt-3">
            {/* Language Selector */}
            <LanguageSelector />
            
            {/* Notification Bell */}
            <NotificationSystem />
          </div>
        )}

        {isCollapsed && (
          <div className="flex flex-col items-center space-y-1 mt-3">
            {/* Language Selector - Collapsed */}
            <LanguageSelector collapsed={true} />
            
            {/* Notification Bell - Collapsed */}
            <NotificationSystem />
          </div>
        )}
      </div>

      {/* Create Button */}
      <div className="p-4 border-b border-gray-200">
        <Link href="/quizzes/new">
          <Button className={cn(
            "w-full",
            isCollapsed ? "px-0" : "px-4"
          )}>
            <Plus className="w-4 h-4" />
            {!isCollapsed && <span className="ml-2">{t("create_quiz_btn")}</span>}
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
              <span className="text-sm font-medium text-gray-900">{t("current_plan")}</span>
              <Badge variant="outline" className="text-xs capitalize">
                {userData.plan === 'enterprise' ? 'Enterprise' : userData.plan === 'premium' ? 'Premium' : 'Free'}
              </Badge>
            </div>
            {userData.plan === 'enterprise' ? (
              <div className="text-xs text-gray-600">
                {totalQuizzes} {t("quizzes_created")} ({t("unlimited")})
              </div>
            ) : (
              <>
                <div className="text-xs text-gray-600 mb-2">
                  {totalQuizzes} de {userData.plan === 'premium' ? '25' : '3'} {t("quizzes_used")}
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
    </aside>
  );
}