import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ArrowRight } from "lucide-react";

interface BeforeAfterChartProps {
  title: string;
  beforeLabel: string;
  afterLabel: string;
  beforeValue: number;
  afterValue: number;
  unit?: string;
  color?: string;
  description?: string;
}

export function BeforeAfterChart({
  title,
  beforeLabel,
  afterLabel,
  beforeValue,
  afterValue,
  unit = "",
  color = "bg-primary",
  description
}: BeforeAfterChartProps) {
  const improvement = afterValue > beforeValue 
    ? Math.round(((afterValue - beforeValue) / beforeValue) * 100)
    : 0;

  const maxValue = Math.max(beforeValue, afterValue);
  const beforePercentage = (beforeValue / maxValue) * 100;
  const afterPercentage = (afterValue / maxValue) * 100;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Before and After Bars */}
        <div className="space-y-4">
          {/* Before */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{beforeLabel}</span>
              <span className="text-lg font-bold text-gray-800">
                {beforeValue.toLocaleString()}{unit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gray-400 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${beforePercentage}%` }}
              />
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <ArrowRight className="w-6 h-6 text-primary" />
          </div>

          {/* After */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{afterLabel}</span>
              <span className="text-lg font-bold text-primary">
                {afterValue.toLocaleString()}{unit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`${color} h-3 rounded-full transition-all duration-1000 delay-500`}
                style={{ width: `${afterPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Improvement Badge */}
        {improvement > 0 && (
          <div className="flex justify-center">
            <Badge variant="default" className="text-white bg-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              +{improvement}% de melhoria
            </Badge>
          </div>
        )}

        {/* Summary */}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Potencial de crescimento: <span className="font-bold text-primary">
              {(afterValue - beforeValue).toLocaleString()}{unit}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Component for multiple metrics comparison
interface MetricComparison {
  label: string;
  before: number;
  after: number;
  unit?: string;
}

interface MultiMetricChartProps {
  title: string;
  metrics: MetricComparison[];
  description?: string;
}

export function MultiMetricChart({ title, metrics, description }: MultiMetricChartProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric, index) => {
          const improvement = metric.after > metric.before 
            ? Math.round(((metric.after - metric.before) / metric.before) * 100)
            : 0;

          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{metric.label}</span>
                <Badge variant="outline" className="text-green-600">
                  +{improvement}%
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-gray-100 rounded">
                  <p className="text-xs text-gray-500 mb-1">Atual</p>
                  <p className="text-lg font-bold text-gray-700">
                    {metric.before.toLocaleString()}{metric.unit || ""}
                  </p>
                </div>
                
                <div className="p-3 bg-primary/10 rounded">
                  <p className="text-xs text-primary mb-1">Potencial</p>
                  <p className="text-lg font-bold text-primary">
                    {metric.after.toLocaleString()}{metric.unit || ""}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}