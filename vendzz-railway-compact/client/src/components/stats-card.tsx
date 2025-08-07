import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  description?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  color, 
  change, 
  changeType = "neutral",
  description 
}: StatsCardProps) {
  const getChangeIcon = () => {
    if (changeType === "positive") {
      return <TrendingUp className="w-3 h-3" />;
    }
    if (changeType === "negative") {
      return <TrendingDown className="w-3 h-3" />;
    }
    return null;
  };

  const getChangeColor = () => {
    switch (changeType) {
      case "positive":
        return "text-green-600 bg-green-50";
      case "negative":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">{title}</h3>
              <div className={cn("p-2 rounded-lg", color.replace("text-", "bg-").replace("600", "100"))}>
                <div className={color}>
                  {icon}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              
              {change && (
                <div className="flex items-center space-x-1">
                  <Badge variant="secondary" className={cn("text-xs", getChangeColor())}>
                    {getChangeIcon()}
                    <span className="ml-1">{change}</span>
                  </Badge>
                  <span className="text-xs text-gray-500">vs. mês anterior</span>
                </div>
              )}
              
              {description && (
                <p className="text-xs text-gray-500">{description}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
