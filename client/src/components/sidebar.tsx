import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth-jwt";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationSystem } from "@/components/notification-system";
// import { LanguageSelector } from "@/components/language-selector"; // Removido - usando World Icon
import { ThemeToggle } from "@/components/theme-toggle";
// import { useLanguage } from "@/hooks/useLanguage";
import { useSidebar } from "@/hooks/useSidebar";
import { useState, useEffect, useRef } from "react";
import { MobileSidebar, FloatingMobileMenu } from "@/components/mobile-sidebar";

import { 
  BarChart3, 
  Plus, 
  Palette, 
  TrendingUp,
  Settings,
  Crown,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
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
  X,
  Webhook,
  Plug,
  Phone,
  Bot,
  Coins,
  ShoppingCart,
  Code,
  CheckCircle,
  CreditCard,
  Send,
  GraduationCap,
  Copy,
  Play,
  Download,
  Calendar,
  MessageCircle,
  Languages
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const userData = user as any;

  const { isCollapsed, toggleSidebar } = useSidebar();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["Principal"]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("pt-BR");
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const [forumMode, setForumMode] = useState(false);
  const [isCompactForced, setIsCompactForced] = useState(false);

  // Escutar eventos de modo fórum
  useEffect(() => {
    const handleForumModeToggle = (event: CustomEvent) => {
      setForumMode(event.detail.forumMode);
      setIsCompactForced(event.detail.compactSidebar);
    };

    window.addEventListener('toggleForumMode', handleForumModeToggle as EventListener);
    
    return () => {
      window.removeEventListener('toggleForumMode', handleForumModeToggle as EventListener);
    };
  }, []);

  // Buscar dados dos quizzes em tempo real
  const { data: quizzes } = useQuery({
    queryKey: ["/api/quizzes"],
  });

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // Função para alternar expansão de categorias
  const toggleCategory = (categoryTitle: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryTitle) 
        ? prev.filter(cat => cat !== categoryTitle)
        : [...prev, categoryTitle]
    );
  };

  // Standalone items
  const dashboardItem = {
    title: "DASHBOARD",
    href: "/dashboard",
    icon: <Home className="w-4 h-4" />,
    active: location === "/" || location === "/dashboard"
  };

  const tutorialsItem = {
    title: "TUTORIAIS",
    href: "/tutoriais",
    icon: <BookOpen className="w-4 h-4" />,
    active: location === "/tutoriais"
  };

  const planosItem = {
    title: "PLANOS",
    href: "/planos",
    icon: <Crown className="w-4 h-4" />,
    active: location === "/planos"
  };

  const creditosItem = {
    title: "CRÉDITOS",
    href: "/credits",
    icon: <Coins className="w-4 h-4" />,
    active: location === "/credits"
  };





  const navCategories = [
    {
      title: "CRIAÇÃO",
      icon: <Plus className="w-3 h-3" />,
      items: [
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
          title: "Teste A/B",
          href: "/teste-ab",
          icon: <BarChart className="w-4 h-4" />,
          active: location === "/teste-ab"
        },
        {
          title: "Quiz I.A.",
          href: "/quiz-ia",
          icon: <Sparkles className="w-4 h-4" />,
          active: location === "/quiz-ia",
          badge: "NEW"
        },


      ]
    },
    {
      title: "ANALYTICS",
      icon: <TrendingUp className="w-3 h-3" />,
      items: [
        {
          title: "Analytics",
          href: "/analytics",
          icon: <TrendingUp className="w-4 h-4" />,
          active: location === "/analytics"
        },
      ]
    },
    {
      title: "CAMPANHAS",
      icon: <Target className="w-3 h-3" />,
      items: [
        {
          title: "SMS",
          href: "/sms-campaigns-advanced",
          icon: <MessageSquare className="w-4 h-4" />,
          active: location === "/sms-campaigns-advanced" || location === "/sms-credits"
        },
        {
          title: "EMAIL",
          href: "/email-marketing",
          icon: <Mail className="w-4 h-4" />,
          active: location === "/email-marketing"
        },
        {
          title: "WHATSAPP",
          href: "/campanhas-whatsapp",
          icon: <Bot className="w-4 h-4" />,
          active: location === "/campanhas-whatsapp",
          badge: <span className="text-xs text-green-500 font-medium">GRÁTIS</span>
        },
        {
          title: "TELEGRAM",
          href: "/telegram-campaigns",
          icon: <Send className="w-4 h-4" />,
          active: location === "/telegram-campaigns",
          badge: <span className="text-xs text-blue-500 font-medium">API oficial</span>
        },
        {
          title: "LIGAÇÃO/VOZ",
          href: "/voice-calling",
          icon: <Phone className="w-4 h-4" />,
          active: location === "/voice-calling"
        },
        {
          title: "Super Afiliados",
          href: "/super-afiliados",
          icon: <Crown className="w-4 h-4" />,
          active: location === "/super-afiliados"
        },
        {
          title: "Campanhas Condicionais",
          href: "/conditional-campaigns",
          icon: <Target className="w-4 h-4" />,
          active: location === "/conditional-campaigns",
          badge: <span className="text-xs text-orange-500 font-medium">SE → ENTÃO</span>
        },

      ]
    },
    {
      title: "SOCIAL MEDIA",
      icon: <Users className="w-3 h-3" />,
      items: [
        {
          title: "Comprar Comentários",
          href: "/buy-comments",
          icon: <MessageCircle className="w-4 h-4" />,
          active: location === "/buy-comments",
          badge: <span className="text-xs text-green-500 font-medium">BOOST</span>
        },
        {
          title: "Agendar Postagens",
          href: "/schedule-posts",
          icon: <Calendar className="w-4 h-4" />,
          active: location === "/schedule-posts",
          badge: <span className="text-xs text-blue-500 font-medium">AUTO</span>
        },
        {
          title: "Fórum",
          href: "/forum",
          icon: <Users className="w-4 h-4" />,
          active: location === "/forum",
          badge: <span className="text-xs text-purple-500 font-medium">COMUNIDADE</span>
        },
      ]
    },
    {
      title: "INTEGRAÇÕES",
      icon: <Plug className="w-3 h-3" />,
      items: [

        {
          title: "Webhooks",
          href: "/webhooks",
          icon: <Webhook className="w-4 h-4" />,
          active: location === "/webhooks"
        },
        {
          title: "Integrações",
          href: "/integracoes",
          icon: <Plug className="w-4 h-4" />,
          active: location === "/integracoes"
        },
        {
          title: "Extensões",
          href: "/extensoes",
          icon: <Package className="w-4 h-4" />,
          active: location === "/extensoes"
        },
      ]
    },
    {
      title: "AVANÇADO",
      icon: <Shield className="w-3 h-3" />,
      items: [
        {
          title: "Cloaker",
          href: "/cloaker",
          icon: <Shield className="w-4 h-4" />,
          active: location === "/cloaker"
        },
      ]
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
      title: "Adm Push",
      href: "/admin/push",
      icon: <Bell className="w-4 h-4" />,
      active: location === "/admin/push",
      className: "text-blue-600 border-blue-600/20 bg-blue-600/5 hover:bg-blue-600/10"
    },
    {
      title: "Configurações",
      href: "/settings",
      icon: <Settings className="w-4 h-4" />,
      active: location === "/settings"
    },

    {
      title: "Admin Área",
      href: "/members-admin",
      icon: <Shield className="w-4 h-4" />,
      active: location === "/members-admin",
      className: "text-red-600 border-red-600/20 bg-red-600/5 hover:bg-red-600/10"
    },
    {
      title: "Admin",
      href: "/admin-dashboard",
      icon: <Users className="w-4 h-4" />,
      active: location === "/admin-dashboard",
      className: "text-red-500 border-red-500/20 bg-red-500/5 hover:bg-red-500/10"
    },
    {
      title: "Config Push",
      href: "/admin/bulk-push-messaging",
      icon: <Bell className="w-4 h-4" />,
      active: location === "/admin/bulk-push-messaging",
      className: "text-purple-600 border-purple-600/20 bg-purple-600/5 hover:bg-purple-600/10"
    }
  ];

  return (
    <aside className={cn(
      "vendzz-sidebar flex flex-col bg-background dark:bg-gray-900 text-foreground dark:text-white border-r border-border dark:border-gray-700",
      isCollapsed ? "collapsed" : "expanded"
    )}>
      {/* Logo and Notifications */}
      <div className="p-4 border-b border-border dark:border-gray-700">
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
            className="h-8 w-8 p-0 hover:bg-accent dark:hover:bg-accent"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Language and Notification Icons (moved below) */}
        {!isCollapsed && (
          <div className="flex items-center justify-center space-x-2 mt-3">
            {/* Language Selector - World Icon with Dropdown */}
            <div className="relative" ref={languageDropdownRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="flex items-center gap-2 h-8 px-2 hover:bg-muted"
              >
                <Globe className="w-4 h-4" />
                <span className="text-xs">{currentLanguage === "pt-BR" ? "PT-BR" : "EN-US"}</span>
                <ChevronDown className="w-3 h-3" />
              </Button>
              
              {showLanguageDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 min-w-[120px]">
                  <div className="py-1">
                    <button
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                      onClick={() => {
                        setCurrentLanguage("pt-BR");
                        setShowLanguageDropdown(false);
                      }}
                    >
                      🇧🇷 Português
                    </button>
                    <button
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                      onClick={() => {
                        setCurrentLanguage("en-US");
                        setShowLanguageDropdown(false);
                      }}
                    >
                      🇺🇸 English
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Theme Toggle - DESATIVADO TEMPORARIAMENTE */}
            {/* <ThemeToggle /> */}
            
            {/* Notification Bell */}
            <NotificationSystem />
          </div>
        )}

        {isCollapsed && (
          <div className="flex flex-col items-center space-y-1 mt-3">
            {/* Language Selector - World Icon Only */}
            <div className="relative" ref={languageDropdownRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="flex items-center justify-center w-8 h-8 p-0 hover:bg-muted"
              >
                <Globe className="w-4 h-4" />
              </Button>
              
              {showLanguageDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 min-w-[120px]">
                  <div className="py-1">
                    <button
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                      onClick={() => {
                        setCurrentLanguage("pt-BR");
                        setShowLanguageDropdown(false);
                      }}
                    >
                      🇧🇷 Português
                    </button>
                    <button
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                      onClick={() => {
                        setCurrentLanguage("en-US");
                        setShowLanguageDropdown(false);
                      }}
                    >
                      🇺🇸 English
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Theme Toggle - DESATIVADO TEMPORARIAMENTE */}
            {/* <ThemeToggle /> */}
            
            {/* Notification Bell - Collapsed */}
            <NotificationSystem />
          </div>
        )}
      </div>

      {/* Create Button */}
      <div className={cn("border-b border-border dark:border-gray-700", isCollapsed ? "p-2" : "p-4")}>
        <div className={cn("space-y-3", isCollapsed && "flex flex-col items-center space-y-3")}>
          <div className="mb-3">
            <Link href="/quizzes/new">
              <Button className={cn(
                "w-full justify-center bg-green-600 hover:bg-green-700 text-white shock-green shadow-lg",
                isCollapsed ? "w-10 h-10 p-0" : "px-4",
                !isCollapsed && "justify-start"
              )}>
                <Plus className="w-4 h-4" />
                {!isCollapsed && <span className="ml-2">Criar Quiz</span>}
              </Button>
            </Link>
          </div>
          
          <div className="mb-3">
            <Link href="/funnel-importer">
              <Button className={cn(
                "w-full bg-blue-600 hover:bg-blue-700 text-white justify-center",
                isCollapsed ? "w-10 h-10 p-0" : "px-4",
                !isCollapsed && "justify-start"
              )}>
                <Copy className="w-4 h-4" />
                {!isCollapsed && <span className="ml-2">Clonar Quiz</span>}
              </Button>
            </Link>
          </div>
          
          <div>
            <Link href="/vsl-to-quiz">
              <Button className={cn(
                "w-full bg-purple-600 hover:bg-purple-700 text-white justify-center",
                isCollapsed ? "w-10 h-10 p-0" : "px-4",
                !isCollapsed && "justify-start"
              )}>
                <Play className="w-4 h-4" />
                {!isCollapsed && <span className="ml-2">Converter VSL → Quiz</span>}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {/* Dashboard - Standalone */}
          <Link href={dashboardItem.href}>
            <Button
              variant="ghost"
              className={cn(
                "nav-item w-full text-foreground hover:bg-accent hover:text-accent-foreground",
                isCollapsed 
                  ? "w-10 h-10 p-0 justify-center" 
                  : "justify-start px-3",
                dashboardItem.active && (isCollapsed 
                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-2 border-green-500 rounded-md"
                  : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-l-4 border-green-500"
                )
              )}
              title={isCollapsed ? dashboardItem.title : undefined}
            >
              {dashboardItem.icon}
              {!isCollapsed && (
                <span className="ml-2 flex-1 text-left text-foreground">{dashboardItem.title}</span>
              )}
            </Button>
          </Link>

          {/* Categories */}
          {isCollapsed ? (
            // Modo Collapsed - Mostra apenas os ícones dos itens individuais
            <div className="space-y-1 flex flex-col items-center">
              {navCategories.flatMap((category) => 
                category.items.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-10 h-10 p-0 justify-center text-foreground hover:bg-accent hover:text-accent-foreground",
                        item.active && "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-2 border-green-500 rounded-md"
                      )}
                      title={item.title} // Tooltip para mostrar o nome
                    >
                      {item.icon}
                    </Button>
                  </Link>
                ))
              )}
            </div>
          ) : (
            // Modo Expandido - Mostra categorias com itens
            navCategories.map((category) => (
              <div key={category.title} className="space-y-1">
                {/* Category Header Button */}
                <Button
                  variant="ghost"
                  onClick={() => toggleCategory(category.title)}
                  className={cn(
                    "category-header w-full justify-start text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer",
                    "px-3 py-2"
                  )}
                >
                  {category.icon}
                  <span className="ml-2 flex-1 text-left text-foreground">{category.title}</span>
                  {expandedCategories.includes(category.title) ? (
                    <ChevronDown className="w-3 h-3 ml-auto text-foreground" />
                  ) : (
                    <ChevronUp className="w-3 h-3 ml-auto text-foreground" />
                  )}
                </Button>
                
                {/* Category Items */}
                {expandedCategories.includes(category.title) && (
                  <div className="category-items space-y-1 pl-2">
                    {category.items.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "nav-item w-full justify-start text-foreground hover:bg-accent hover:text-accent-foreground px-3",
                            item.active && "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-l-4 border-green-500"
                          )}
                        >
                          {item.icon}
                          <span className="ml-2 flex-1 text-left text-foreground">{item.title}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="ml-auto">
                              {item.badge}
                            </Badge>
                          )}
                        </Button>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}

          {/* Itens Standalone */}
          {isCollapsed ? (
            <div className="flex flex-col items-center space-y-1">
              {/* Tutoriais - Collapsed */}
              <Link href={tutorialsItem.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-10 h-10 p-0 justify-center text-foreground hover:bg-accent hover:text-accent-foreground",
                    tutorialsItem.active && "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-2 border-green-500 rounded-md"
                  )}
                  title={tutorialsItem.title}
                >
                  {tutorialsItem.icon}
                </Button>
              </Link>

              {/* Planos - Collapsed */}
              <Link href={planosItem.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-10 h-10 p-0 justify-center text-foreground hover:bg-accent hover:text-accent-foreground",
                    planosItem.active && "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-2 border-green-500 rounded-md"
                  )}
                  title={planosItem.title}
                >
                  {planosItem.icon}
                </Button>
              </Link>

              {/* Créditos - Collapsed */}
              <Link href={creditosItem.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-10 h-10 p-0 justify-center text-foreground hover:bg-accent hover:text-accent-foreground",
                    creditosItem.active && "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-2 border-green-500 rounded-md"
                  )}
                  title={creditosItem.title}
                >
                  {creditosItem.icon}
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Tutoriais - Expanded */}
              <Link href={tutorialsItem.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "nav-item w-full justify-start text-foreground hover:bg-accent hover:text-accent-foreground px-3",
                    tutorialsItem.active && "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-l-4 border-green-500"
                  )}
                >
                  {tutorialsItem.icon}
                  <span className="ml-2 flex-1 text-left text-foreground">{tutorialsItem.title}</span>
                </Button>
              </Link>

              {/* Planos - Expanded */}
              <Link href={planosItem.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "nav-item w-full justify-start text-foreground hover:bg-accent hover:text-accent-foreground px-3",
                    planosItem.active && "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-l-4 border-green-500"
                  )}
                >
                  {planosItem.icon}
                  <span className="ml-2 flex-1 text-left text-foreground">{planosItem.title}</span>
                </Button>
              </Link>

              {/* Créditos - Expanded */}
              <Link href={creditosItem.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "nav-item w-full justify-start text-foreground hover:bg-accent hover:text-accent-foreground px-3",
                    creditosItem.active && "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-l-4 border-green-500"
                  )}
                >
                  {creditosItem.icon}
                  <span className="ml-2 flex-1 text-left text-foreground">{creditosItem.title}</span>
                </Button>
              </Link>
            </>
          )}


        </div>
      </nav>

      {/* Bottom Items */}
      <div className={cn("border-t border-border dark:border-gray-700", isCollapsed ? "p-2" : "p-4")}>
        <div className={cn("space-y-1", isCollapsed && "flex flex-col items-center space-y-2")}>
          {bottomItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "text-foreground hover:bg-accent hover:text-accent-foreground",
                  isCollapsed 
                    ? "w-10 h-10 p-0 justify-center" 
                    : "w-full justify-start px-3",
                  item.active && (isCollapsed
                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-2 border-green-500 rounded-md"
                    : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-l-4 border-green-500"
                  ),
                  // Aplicar classes específicas apenas quando NÃO estiver ativo
                  !item.active && item.className
                )}
                title={isCollapsed ? item.title : undefined}
              >
                {item.icon}
                {!isCollapsed && (
                  <span className="ml-2 text-foreground">{item.title}</span>
                )}
              </Button>
            </Link>
          ))}
        </div>



        {/* User Plan Info */}
        {!isCollapsed && userData && (
          <div className="mt-4 p-3 bg-muted dark:bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground dark:text-foreground">Plano Atual</span>
              <Badge variant="outline" className="text-xs capitalize">
                {userData.plan === 'enterprise' ? 'Enterprise' : userData.plan === 'premium' ? 'Premium' : 'Free'}
              </Badge>
            </div>
            {userData.plan === 'enterprise' ? (
              <div className="text-xs text-muted-foreground dark:text-muted-foreground">
                {totalQuizzes} quizzes criados (ilimitado)
              </div>
            ) : (
              <>
                <div className="text-xs text-muted-foreground dark:text-muted-foreground mb-2">
                  {totalQuizzes} de {userData.plan === 'premium' ? '25' : '3'} quizzes usados
                </div>
                <div className="w-full bg-muted dark:bg-muted rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full" style={{ 
                    width: `${Math.min((totalQuizzes / (userData.plan === 'premium' ? 25 : 3)) * 100, 100)}%` 
                  }}></div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Mobile Components */}
      <MobileSidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)} 
      />
      <FloatingMobileMenu />
      
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        className="fixed top-4 left-4 z-50 bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 rounded-lg shadow-lg md:hidden hover:from-green-600 hover:to-blue-600 transition-all duration-200"
      >
        <Menu className="w-5 h-5" />
      </button>
    </aside>
  );
}