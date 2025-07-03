import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
  buttonVariant?: "default" | "outline" | "secondary";
  onSelect?: () => void;
  className?: string;
}

export function PricingCard({
  name,
  price,
  period,
  features,
  popular = false,
  buttonText,
  buttonVariant = "default",
  onSelect,
  className
}: PricingCardProps) {
  return (
    <Card className={cn(
      "relative transition-all duration-200 hover:shadow-lg",
      popular && "ring-2 ring-primary shadow-lg scale-105",
      className
    )}>
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-white px-4 py-1 flex items-center gap-1">
            <Star className="w-3 h-3" />
            Mais Popular
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-8 pt-8">
        <div className="flex items-center justify-center mb-4">
          {popular && <Crown className="w-6 h-6 text-primary mr-2" />}
          <CardTitle className="text-xl">{name}</CardTitle>
        </div>
        
        <div className="space-y-2">
          <div className="text-4xl font-bold text-primary">{price}</div>
          <div className="text-gray-600">{period}</div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="text-accent mr-3 w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        <Button 
          className={cn(
            "w-full",
            popular && buttonVariant === "default" && "bg-primary hover:bg-primary/90"
          )} 
          variant={buttonVariant}
          size="lg"
          onClick={onSelect}
        >
          {buttonText}
        </Button>

        {popular && (
          <div className="text-center">
            <Badge variant="outline" className="text-xs text-primary border-primary">
              Recomendado para a maioria dos usuários
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
