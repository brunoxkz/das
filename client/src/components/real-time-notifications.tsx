import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Users,
  Mail,
  MessageCircle,
  Phone,
  Eye,
  TrendingUp,
  Settings,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth-jwt";

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionType?: 'quiz_view' | 'lead_capture' | 'email_sent' | 'whatsapp_sent' | 'sms_sent' | 'system';
  actionData?: any;
}

export function RealTimeNotifications() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const { data: notificationData, refetch } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/notifications", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    enabled: isAuthenticated,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Mock notifications for demonstration
  const mockNotifications: Notification[] = [
    {
      id: "1",
      type: "success",
      title: "Novo Lead Capturado",
      message: "João Silva completou o Quiz de Vendas",
      timestamp: "2 min atrás",
      read: false,
      actionType: "lead_capture",
      actionData: { leadName: "João Silva", quizTitle: "Quiz de Vendas" }
    },
    {
      id: "2",
      type: "info",
      title: "Quiz Visualizado",
      message: "5 novas visualizações no Quiz de Marketing",
      timestamp: "5 min atrás",
      read: false,
      actionType: "quiz_view",
      actionData: { quizTitle: "Quiz de Marketing", views: 5 }
    },
    {
      id: "3",
      type: "success",
      title: "Email Enviado",
      message: "Campanha promocional enviada para 150 contatos",
      timestamp: "8 min atrás",
      read: true,
      actionType: "email_sent",
      actionData: { campaignName: "Campanha Promocional", count: 150 }
    },
    {
      id: "4",
      type: "warning",
      title: "Limite de SMS",
      message: "Você usou 80% dos seus créditos SMS",
      timestamp: "15 min atrás",
      read: false,
      actionType: "system",
      actionData: { usage: 80 }
    },
    {
      id: "5",
      type: "success",
      title: "WhatsApp Enviado",
      message: "25 mensagens WhatsApp enviadas com sucesso",
      timestamp: "20 min atrás",
      read: true,
      actionType: "whatsapp_sent",
      actionData: { count: 25 }
    }
  ];

  useEffect(() => {
    const currentNotifications = notificationData || mockNotifications;
    setNotifications(currentNotifications);
    setUnreadCount(currentNotifications.filter(n => !n.read).length);
  }, [notificationData]);

  const getNotificationIcon = (type: string, actionType?: string) => {
    if (actionType) {
      switch (actionType) {
        case 'lead_capture': return <Users className="w-4 h-4 text-green-500" />;
        case 'quiz_view': return <Eye className="w-4 h-4 text-blue-500" />;
        case 'email_sent': return <Mail className="w-4 h-4 text-purple-500" />;
        case 'whatsapp_sent': return <MessageCircle className="w-4 h-4 text-green-600" />;
        case 'sms_sent': return <Phone className="w-4 h-4 text-orange-500" />;
        case 'system': return <Settings className="w-4 h-4 text-gray-500" />;
        default: return <Info className="w-4 h-4 text-blue-500" />;
      }
    }

    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-l-green-500 bg-green-50';
      case 'warning': return 'border-l-yellow-500 bg-yellow-50';
      case 'error': return 'border-l-red-500 bg-red-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-hidden shadow-lg border z-50">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notificações</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Marcar todas como lidas
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 border-b border-l-4 hover:bg-gray-50 cursor-pointer transition-colors",
                    getNotificationColor(notification.type),
                    !notification.read && "bg-opacity-100"
                  )}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type, notification.actionType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {notification.title}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearNotification(notification.id);
                          }}
                          className="p-1 h-auto"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">
                          {notification.timestamp}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t bg-gray-50">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to full notifications page
                }}
              >
                Ver todas as notificações
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// Hook para usar notificações
export function useRealTimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50 notifications
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  return {
    notifications,
    addNotification,
    markAsRead,
    clearNotification
  };
}