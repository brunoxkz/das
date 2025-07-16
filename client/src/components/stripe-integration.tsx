import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  STRIPE_CURRENCIES, 
  STRIPE_INTERVALS, 
  STRIPE_INTERVAL_COUNTS,
  STRIPE_BILLING_SCHEMES,
  STRIPE_USAGE_TYPES,
  STRIPE_AGGREGATE_USAGE,
  STRIPE_TRIAL_TYPES,
  STRIPE_ADVANCED_FEATURES,
  getCurrencySymbol,
  formatPrice 
} from '@/lib/stripe-currencies';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Repeat, 
  Clock, 
  Settings, 
  Zap,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

interface StripeProductConfig {
  name: string;
  description: string;
  currency: string;
  paymentMode: 'one_time' | 'recurring';
  price: number;
  
  // Configurações de recorrência
  recurringInterval: 'day' | 'week' | 'month' | 'year';
  recurringIntervalCount: number;
  billingScheme: 'per_unit' | 'tiered';
  usageType: 'licensed' | 'metered';
  aggregateUsage?: 'sum' | 'last_during_period' | 'last_ever' | 'max';
  
  // Trial
  trialType: 'none' | 'days' | 'usage';
  trialPeriodDays?: number;
  trialUsageLimit?: number;
  
  // Configurações avançadas
  taxRates: boolean;
  coupons: boolean;
  invoiceSettings: boolean;
  paymentMethods: string[];
  billingThresholds: boolean;
  proration: boolean;
  cancelAtPeriodEnd: boolean;
  collectionMethod: 'automatic' | 'manual';
  
  // Faturamento escalonado
  tieredPricing?: Array<{
    upTo: number | 'inf';
    unitAmount: number;
    flatAmount?: number;
  }>;
}

interface StripeIntegrationProps {
  initialConfig?: Partial<StripeProductConfig>;
  onConfigChange: (config: StripeProductConfig) => void;
  onSave?: () => void;
}

export default function StripeIntegration({ 
  initialConfig = {}, 
  onConfigChange, 
  onSave 
}: StripeIntegrationProps) {
  const [config, setConfig] = useState<StripeProductConfig>({
    name: '',
    description: '',
    currency: 'BRL',
    paymentMode: 'one_time',
    price: 0,
    recurringInterval: 'month',
    recurringIntervalCount: 1,
    billingScheme: 'per_unit',
    usageType: 'licensed',
    trialType: 'none',
    taxRates: false,
    coupons: false,
    invoiceSettings: false,
    paymentMethods: ['card'],
    billingThresholds: false,
    proration: true,
    cancelAtPeriodEnd: false,
    collectionMethod: 'automatic',
    ...initialConfig
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Atualizar configuração
  const updateConfig = (updates: Partial<StripeProductConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  // Validar configuração
  const validateConfig = () => {
    const errors: string[] = [];
    
    if (!config.name.trim()) errors.push('Nome do produto é obrigatório');
    if (!config.description.trim()) errors.push('Descrição é obrigatória');
    if (config.price <= 0) errors.push('Preço deve ser maior que zero');
    if (!config.currency) errors.push('Moeda é obrigatória');
    
    if (config.paymentMode === 'recurring') {
      if (config.recurringIntervalCount < 1) errors.push('Intervalo de recorrência inválido');
      if (config.trialType === 'days' && (!config.trialPeriodDays || config.trialPeriodDays < 1)) {
        errors.push('Período de trial inválido');
      }
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Salvar configuração
  const handleSave = () => {
    if (validateConfig()) {
      onSave?.();
    }
  };

  // Calcular preço total para recorrência
  const calculateTotalPrice = () => {
    if (config.paymentMode === 'one_time') return config.price;
    
    const multiplier = config.recurringIntervalCount;
    return config.price * multiplier;
  };

  // Obter label do intervalo
  const getIntervalLabel = () => {
    const intervalData = STRIPE_INTERVAL_COUNTS[config.recurringInterval];
    const count = config.recurringIntervalCount;
    return `${count} ${intervalData.label}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Configuração Stripe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="pricing">Preços</TabsTrigger>
              <TabsTrigger value="recurring">Recorrência</TabsTrigger>
              <TabsTrigger value="advanced">Avançado</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product-name">Nome do Produto</Label>
                  <Input
                    id="product-name"
                    value={config.name}
                    onChange={(e) => updateConfig({ name: e.target.value })}
                    placeholder="Digite o nome do produto"
                  />
                </div>

                <div>
                  <Label htmlFor="currency">Moeda</Label>
                  <Select value={config.currency} onValueChange={(value) => updateConfig({ currency: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a moeda" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] overflow-y-auto">
                      {STRIPE_CURRENCIES.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono">{currency.symbol}</span>
                            <span>{currency.code}</span>
                            <span className="text-sm text-muted-foreground">
                              {currency.name}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={config.description}
                    onChange={(e) => updateConfig({ description: e.target.value })}
                    placeholder="Descreva o produto"
                  />
                </div>

                <div>
                  <Label htmlFor="price">Preço ({getCurrencySymbol(config.currency)})</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={config.price}
                    onChange={(e) => updateConfig({ price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label>Modo de Pagamento</Label>
                  <Select value={config.paymentMode} onValueChange={(value: 'one_time' | 'recurring') => updateConfig({ paymentMode: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one_time">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span>Pagamento Único</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="recurring">
                        <div className="flex items-center gap-2">
                          <Repeat className="h-4 w-4" />
                          <span>Recorrente</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {config.paymentMode === 'recurring' && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Configuração de Recorrência</span>
                  </div>
                  <p className="text-sm text-blue-800">
                    Cobrança: {formatPrice(calculateTotalPrice(), config.currency)} a cada {getIntervalLabel()}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Esquema de Cobrança</Label>
                  <Select value={config.billingScheme} onValueChange={(value: 'per_unit' | 'tiered') => updateConfig({ billingScheme: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STRIPE_BILLING_SCHEMES.map((scheme) => (
                        <SelectItem key={scheme.value} value={scheme.value}>
                          <div>
                            <div className="font-medium">{scheme.label}</div>
                            <div className="text-sm text-muted-foreground">{scheme.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tipo de Uso</Label>
                  <Select value={config.usageType} onValueChange={(value: 'licensed' | 'metered') => updateConfig({ usageType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STRIPE_USAGE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-muted-foreground">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {config.usageType === 'metered' && (
                  <div>
                    <Label>Agregação de Uso</Label>
                    <Select value={config.aggregateUsage} onValueChange={(value: any) => updateConfig({ aggregateUsage: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STRIPE_AGGREGATE_USAGE.map((agg) => (
                          <SelectItem key={agg.value} value={agg.value}>
                            <div>
                              <div className="font-medium">{agg.label}</div>
                              <div className="text-sm text-muted-foreground">{agg.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {config.billingScheme === 'tiered' && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Label className="text-sm font-medium">Preços Escalonados</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Configure diferentes preços para diferentes faixas de quantidade
                    </p>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurar Faixas
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="recurring" className="space-y-4">
              {config.paymentMode === 'recurring' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Intervalo de Recorrência</Label>
                      <Select value={config.recurringInterval} onValueChange={(value: any) => updateConfig({ recurringInterval: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STRIPE_INTERVALS.map((interval) => (
                            <SelectItem key={interval.value} value={interval.value}>
                              <div>
                                <div className="font-medium">{interval.label}</div>
                                <div className="text-sm text-muted-foreground">{interval.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Quantidade de Intervalos</Label>
                      <Input
                        type="number"
                        min={STRIPE_INTERVAL_COUNTS[config.recurringInterval].min}
                        max={STRIPE_INTERVAL_COUNTS[config.recurringInterval].max}
                        value={config.recurringIntervalCount}
                        onChange={(e) => updateConfig({ recurringIntervalCount: parseInt(e.target.value) || 1 })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Entre {STRIPE_INTERVAL_COUNTS[config.recurringInterval].min} e {STRIPE_INTERVAL_COUNTS[config.recurringInterval].max} {STRIPE_INTERVAL_COUNTS[config.recurringInterval].label}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label>Período de Trial</Label>
                    <Select value={config.trialType} onValueChange={(value: any) => updateConfig({ trialType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STRIPE_TRIAL_TYPES.map((trial) => (
                          <SelectItem key={trial.value} value={trial.value}>
                            <div>
                              <div className="font-medium">{trial.label}</div>
                              <div className="text-sm text-muted-foreground">{trial.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {config.trialType === 'days' && (
                    <div>
                      <Label>Dias de Trial Gratuito</Label>
                      <Input
                        type="number"
                        min="1"
                        max="365"
                        value={config.trialPeriodDays || ''}
                        onChange={(e) => updateConfig({ trialPeriodDays: parseInt(e.target.value) || undefined })}
                        placeholder="Ex: 7, 14, 30"
                      />
                    </div>
                  )}

                  {config.trialType === 'usage' && (
                    <div>
                      <Label>Limite de Uso Gratuito</Label>
                      <Input
                        type="number"
                        min="1"
                        value={config.trialUsageLimit || ''}
                        onChange={(e) => updateConfig({ trialUsageLimit: parseInt(e.target.value) || undefined })}
                        placeholder="Ex: 100, 1000"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Configurações de recorrência disponíveis apenas para pagamentos recorrentes</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Método de Cobrança</Label>
                  <Select value={config.collectionMethod} onValueChange={(value: 'automatic' | 'manual') => updateConfig({ collectionMethod: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automatic">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          <span>Automático</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="manual">
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          <span>Manual</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-medium">Funcionalidades Avançadas</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    {STRIPE_ADVANCED_FEATURES.map((feature) => (
                      <div key={feature.id} className="flex items-start space-x-3">
                        <Switch
                          id={feature.id}
                          checked={config[feature.id as keyof StripeProductConfig] as boolean}
                          onCheckedChange={(checked) => updateConfig({ [feature.id]: checked })}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor={feature.id} className="text-sm font-medium">
                            {feature.label}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {validationErrors.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-900">Erros de Validação</span>
              </div>
              <ul className="text-sm text-red-800 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {config.paymentMode === 'one_time' ? 'Pagamento Único' : 'Recorrente'}
              </Badge>
              <Badge variant="outline">
                {getCurrencySymbol(config.currency)} {config.currency}
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => validateConfig()}>
                Validar
              </Button>
              <Button onClick={handleSave} disabled={validationErrors.length > 0}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Salvar Configuração
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}