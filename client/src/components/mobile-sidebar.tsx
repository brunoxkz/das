import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Home,
  Plus,
  MessageSquare,
  Mail,
  Bot,
  BarChart3,
  Settings,
  Crown,
  Users,
  Phone,
  Send,
  Menu,
  X,
  Download,
  TestTube,
  CreditCard,
  Package,
  Activity,
  Target,
  Bell,
  Globe,
  Code,
  Shield,
  Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const [location] = useLocation();

  // Principais itens de navegação para mobile
  const quickAccess = [
    { href: "/dashboard", icon: Home, title: "Dashboard", active: location === "/dashboard" },
    { href: "/quiz-builder", icon: Plus, title: "Criar Quiz", active: location === "/quiz-builder" },
    { href: "/sms-campaigns", icon: MessageSquare, title: "SMS", active: location === "/sms-campaigns", badge: "5" },
    { href: "/email-marketing", icon: Mail, title: "Email", active: location === "/email-marketing", badge: "100" },
    { href: "/whatsapp-campaigns", icon: Bot, title: "WhatsApp", active: location === "/whatsapp-campaigns" },
    { href: "/analytics", icon: BarChart3, title: "Analytics", active: location === "/analytics" },
  ];

  const additionalFeatures = [
    { href: "/funnel-importer", icon: Download, title: "Importar Funis", active: location === "/funnel-importer" },
    { href: "/ab-test", icon: TestTube, title: "Teste A/B", active: location === "/ab-test" },
    { href: "/checkout-official", icon: CreditCard, title: "Checkout", active: location === "/checkout-official" },
    { href: "/subscription-plans", icon: Crown, title: "Planos", active: location === "/subscription-plans" },
    { href: "/voice-calling", icon: Phone, title: "Voice", active: location === "/voice-calling" },
    { href: "/telegram-campaigns", icon: Send, title: "Telegram", active: location === "/telegram-campaigns" },
  ];

  const management = [
    { href: "/admin-dashboard", icon: Shield, title: "Admin", active: location === "/admin-dashboard" },
    { href: "/integracoes", icon: Zap, title: "Integrações", active: location === "/integracoes" },
    { href: "/settings", icon: Settings, title: "Configurações", active: location === "/settings" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 z-50 transform transition-transform duration-300 ease-in-out md:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="font-bold text-lg">Vendzz</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Acesso Rápido */}
          <div className="mb-6">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 font-semibold">
              Acesso Rápido
            </h3>
            <div className="space-y-1">
              {quickAccess.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div 
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
                      item.active 
                        ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.title}</span>
                    {item.badge && (
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "ml-auto text-xs",
                          item.active ? "bg-white/20 text-white" : ""
                        )}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recursos Adicionais */}
          <div className="mb-6">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 font-semibold">
              Recursos
            </h3>
            <div className="space-y-1">
              {additionalFeatures.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div 
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
                      item.active 
                        ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Gerenciamento */}
          <div className="mb-6">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 font-semibold">
              Gerenciamento
            </h3>
            <div className="space-y-1">
              {management.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div 
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
                      item.active 
                        ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Floating Action Menu para Mobile
export function FloatingMobileMenu() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const floatingItems = [
    { href: "/dashboard", icon: Home, color: "bg-blue-500" },
    { href: "/quiz-builder", icon: Plus, color: "bg-green-500" },
    { href: "/sms-campaigns", icon: MessageSquare, color: "bg-purple-500" },
    { href: "/email-marketing", icon: Mail, color: "bg-red-500" },
    { href: "/whatsapp-campaigns", icon: Bot, color: "bg-green-600" },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50 md:hidden">
      {/* Floating Items */}
      {isMenuOpen && (
        <div className="absolute bottom-16 right-0 flex flex-col-reverse gap-2 animate-in slide-in-from-bottom-2 duration-200">
          {floatingItems.map((item, index) => (
            <Link key={item.href} href={item.href}>
              <div 
                className={cn(
                  "w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transform transition-all duration-300 hover:scale-110",
                  item.color,
                  location === item.href ? "ring-4 ring-white/30" : ""
                )}
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  transform: `translateY(${isMenuOpen ? 0 : 20}px)`,
                  opacity: isMenuOpen ? 1 : 0
                }}
              >
                <item.icon className="w-5 h-5" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={cn(
          "w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all duration-300 transform hover:scale-110",
          isMenuOpen 
            ? "bg-red-500 rotate-45" 
            : "bg-gradient-to-r from-blue-600 to-purple-600"
        )}
      >
        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
    </div>
  );
}