/**
 * Utilitário para formatação de preços multi-moedas
 * Suporta USD, EUR, e BRL com formatação localizada
 */

export interface CurrencyConfig {
  symbol: string;
  code: string;
  locale: string;
  precision: number;
}

export const CURRENCY_CONFIGS: Record<string, CurrencyConfig> = {
  USD: {
    symbol: '$',
    code: 'USD',
    locale: 'en-US',
    precision: 2
  },
  EUR: {
    symbol: '€',
    code: 'EUR',
    locale: 'de-DE',
    precision: 2
  },
  BRL: {
    symbol: 'R$',
    code: 'BRL',
    locale: 'pt-BR',
    precision: 2
  }
};

/**
 * Formata um preço com a moeda especificada
 * @param amount - Valor numérico do preço
 * @param currency - Código da moeda (USD, EUR, BRL)
 * @param showSymbol - Se deve mostrar o símbolo da moeda
 * @returns String formatada com a moeda
 */
export function formatPrice(amount: number, currency: string = 'BRL', showSymbol: boolean = true): string {
  const config = CURRENCY_CONFIGS[currency.toUpperCase()];
  
  if (!config) {
    console.warn(`Moeda não suportada: ${currency}. Usando BRL como padrão.`);
    return formatPrice(amount, 'BRL', showSymbol);
  }

  try {
    // Formatar usando Intl.NumberFormat para localização correta
    const formatter = new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: config.precision,
      maximumFractionDigits: config.precision
    });

    return formatter.format(amount);
  } catch (error) {
    console.error('Erro ao formatar preço:', error);
    
    // Fallback manual caso Intl.NumberFormat falhe
    const formattedAmount = amount.toFixed(config.precision);
    return showSymbol ? `${config.symbol} ${formattedAmount}` : formattedAmount;
  }
}

/**
 * Converte um preço de uma moeda para outra
 * @param amount - Valor a ser convertido
 * @param fromCurrency - Moeda de origem
 * @param toCurrency - Moeda de destino
 * @returns Valor convertido (taxas fixas para demonstração)
 */
export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  // Taxas de conversão fixas para demonstração
  // Em produção, usar API de câmbio em tempo real
  const exchangeRates: Record<string, Record<string, number>> = {
    USD: { USD: 1, EUR: 0.85, BRL: 5.2 },
    EUR: { USD: 1.18, EUR: 1, BRL: 6.1 },
    BRL: { USD: 0.19, EUR: 0.16, BRL: 1 }
  };

  const fromRate = exchangeRates[fromCurrency.toUpperCase()];
  if (!fromRate) {
    console.warn(`Moeda de origem não suportada: ${fromCurrency}`);
    return amount;
  }

  const toRate = fromRate[toCurrency.toUpperCase()];
  if (!toRate) {
    console.warn(`Moeda de destino não suportada: ${toCurrency}`);
    return amount;
  }

  return amount * toRate;
}

/**
 * Valida se uma moeda é suportada
 * @param currency - Código da moeda
 * @returns true se suportada, false caso contrário
 */
export function isSupportedCurrency(currency: string): boolean {
  return currency.toUpperCase() in CURRENCY_CONFIGS;
}

/**
 * Retorna lista de moedas suportadas
 * @returns Array com códigos das moedas
 */
export function getSupportedCurrencies(): string[] {
  return Object.keys(CURRENCY_CONFIGS);
}

/**
 * Retorna configuração de uma moeda específica
 * @param currency - Código da moeda
 * @returns Configuração da moeda ou null se não encontrada
 */
export function getCurrencyConfig(currency: string): CurrencyConfig | null {
  return CURRENCY_CONFIGS[currency.toUpperCase()] || null;
}

/**
 * Formata preço de trial vs recorrente
 * @param trialPrice - Preço do trial
 * @param recurringPrice - Preço recorrente
 * @param currency - Moeda
 * @param trialPeriod - Período do trial
 * @returns String formatada com ambos os preços
 */
export function formatTrialAndRecurringPrice(
  trialPrice: number,
  recurringPrice: number,
  currency: string,
  trialPeriod: string
): string {
  const formattedTrial = formatPrice(trialPrice, currency);
  const formattedRecurring = formatPrice(recurringPrice, currency);
  
  return `${formattedTrial} por ${trialPeriod}, depois ${formattedRecurring}/mês`;
}