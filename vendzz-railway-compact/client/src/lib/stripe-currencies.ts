// Todas as moedas suportadas pelo Stripe
export const STRIPE_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'Dólar Americano' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'Libra Esterlina' },
  { code: 'BRL', symbol: 'R$', name: 'Real Brasileiro' },
  { code: 'CAD', symbol: 'C$', name: 'Dólar Canadense' },
  { code: 'AUD', symbol: 'A$', name: 'Dólar Australiano' },
  { code: 'JPY', symbol: '¥', name: 'Iene Japonês' },
  { code: 'CNY', symbol: '¥', name: 'Yuan Chinês' },
  { code: 'INR', symbol: '₹', name: 'Rupia Indiana' },
  { code: 'KRW', symbol: '₩', name: 'Won Sul-Coreano' },
  { code: 'MXN', symbol: '$', name: 'Peso Mexicano' },
  { code: 'ARS', symbol: '$', name: 'Peso Argentino' },
  { code: 'CLP', symbol: '$', name: 'Peso Chileno' },
  { code: 'COP', symbol: '$', name: 'Peso Colombiano' },
  { code: 'PEN', symbol: 'S/', name: 'Sol Peruano' },
  { code: 'UYU', symbol: '$', name: 'Peso Uruguaio' },
  { code: 'CHF', symbol: 'CHF', name: 'Franco Suíço' },
  { code: 'NOK', symbol: 'kr', name: 'Coroa Norueguesa' },
  { code: 'SEK', symbol: 'kr', name: 'Coroa Sueca' },
  { code: 'DKK', symbol: 'kr', name: 'Coroa Dinamarquesa' },
  { code: 'PLN', symbol: 'zł', name: 'Zloty Polonês' },
  { code: 'CZK', symbol: 'Kč', name: 'Coroa Tcheca' },
  { code: 'HUF', symbol: 'Ft', name: 'Forint Húngaro' },
  { code: 'RUB', symbol: '₽', name: 'Rublo Russo' },
  { code: 'TRY', symbol: '₺', name: 'Lira Turca' },
  { code: 'ZAR', symbol: 'R', name: 'Rand Sul-Africano' },
  { code: 'SGD', symbol: 'S$', name: 'Dólar de Singapura' },
  { code: 'HKD', symbol: 'HK$', name: 'Dólar de Hong Kong' },
  { code: 'NZD', symbol: 'NZ$', name: 'Dólar Neozelandês' },
  { code: 'THB', symbol: '฿', name: 'Baht Tailandês' },
  { code: 'MYR', symbol: 'RM', name: 'Ringgit Malaio' },
  { code: 'IDR', symbol: 'Rp', name: 'Rupia Indonésia' },
  { code: 'PHP', symbol: '₱', name: 'Peso Filipino' },
  { code: 'VND', symbol: '₫', name: 'Dong Vietnamita' },
  { code: 'EGP', symbol: '£', name: 'Libra Egípcia' },
  { code: 'MAD', symbol: 'MAD', name: 'Dirham Marroquino' },
  { code: 'NGN', symbol: '₦', name: 'Naira Nigeriana' },
  { code: 'KES', symbol: 'KSh', name: 'Xelim Queniano' },
  { code: 'GHS', symbol: 'GH₵', name: 'Cedi Ganês' },
  { code: 'XOF', symbol: 'CFA', name: 'Franco CFA Ocidental' },
  { code: 'XAF', symbol: 'FCFA', name: 'Franco CFA Central' },
  { code: 'ILS', symbol: '₪', name: 'Shekel Israelense' },
  { code: 'SAR', symbol: 'SR', name: 'Riyal Saudita' },
  { code: 'AED', symbol: 'AED', name: 'Dirham dos EAU' },
  { code: 'QAR', symbol: 'QR', name: 'Riyal Catarense' },
  { code: 'KWD', symbol: 'KD', name: 'Dinar Kuwaitiano' },
  { code: 'BHD', symbol: 'BD', name: 'Dinar do Bahrein' },
  { code: 'OMR', symbol: 'OMR', name: 'Rial Omanense' },
  { code: 'JOD', symbol: 'JD', name: 'Dinar Jordaniano' },
  { code: 'LBP', symbol: 'L£', name: 'Libra Libanesa' },
  { code: 'PKR', symbol: 'Rs', name: 'Rupia Paquistanesa' },
  { code: 'BDT', symbol: '৳', name: 'Taka de Bangladesh' },
  { code: 'LKR', symbol: 'Rs', name: 'Rupia do Sri Lanka' },
  { code: 'NPR', symbol: 'Rs', name: 'Rupia Nepalesa' },
  { code: 'AFN', symbol: '؋', name: 'Afghani Afegão' },
  { code: 'MMK', symbol: 'K', name: 'Kyat de Myanmar' },
  { code: 'KHR', symbol: '៛', name: 'Riel Cambojano' },
  { code: 'LAK', symbol: '₭', name: 'Kip Laosiano' },
  { code: 'BND', symbol: 'B$', name: 'Dólar de Brunei' },
  { code: 'FJD', symbol: 'FJ$', name: 'Dólar Fijiano' },
  { code: 'PGK', symbol: 'K', name: 'Kina Papua Nova Guiné' },
  { code: 'TOP', symbol: 'T$', name: 'Paanga Tonganense' },
  { code: 'WST', symbol: 'WS$', name: 'Tala Samoano' },
  { code: 'VUV', symbol: 'VT', name: 'Vatu de Vanuatu' },
  { code: 'SBD', symbol: 'SI$', name: 'Dólar das Ilhas Salomão' },
  { code: 'BSD', symbol: 'B$', name: 'Dólar das Bahamas' },
  { code: 'BBD', symbol: 'Bds$', name: 'Dólar de Barbados' },
  { code: 'BZD', symbol: 'BZ$', name: 'Dólar de Belize' },
  { code: 'JMD', symbol: 'J$', name: 'Dólar Jamaicano' },
  { code: 'TTD', symbol: 'TT$', name: 'Dólar de Trinidad e Tobago' },
  { code: 'XCD', symbol: 'EC$', name: 'Dólar do Caribe Oriental' },
  { code: 'AWG', symbol: 'ƒ', name: 'Florim de Aruba' },
  { code: 'ANG', symbol: 'ƒ', name: 'Florim das Antilhas' },
  { code: 'SRD', symbol: 'Sr$', name: 'Dólar do Suriname' },
  { code: 'GYD', symbol: 'GY$', name: 'Dólar da Guiana' },
  { code: 'HTG', symbol: 'G', name: 'Gourde Haitiano' },
  { code: 'DOP', symbol: 'RD$', name: 'Peso Dominicano' },
  { code: 'CUP', symbol: '$', name: 'Peso Cubano' },
  { code: 'GTQ', symbol: 'Q', name: 'Quetzal Guatemalteco' },
  { code: 'HNL', symbol: 'L', name: 'Lempira Hondurenha' },
  { code: 'NIO', symbol: 'C$', name: 'Córdoba Nicaraguense' },
  { code: 'CRC', symbol: '₡', name: 'Colón Costarriquenho' },
  { code: 'PAB', symbol: 'B/.', name: 'Balboa Panamenho' },
  { code: 'BOB', symbol: 'Bs', name: 'Boliviano' },
  { code: 'PYG', symbol: '₲', name: 'Guarani Paraguaio' },
  { code: 'VES', symbol: 'Bs.S', name: 'Bolívar Venezuelano' },
  { code: 'GGP', symbol: '£', name: 'Libra de Guernsey' },
  { code: 'JEP', symbol: '£', name: 'Libra de Jersey' },
  { code: 'IMP', symbol: '£', name: 'Libra da Ilha de Man' },
  { code: 'SHP', symbol: '£', name: 'Libra de Santa Helena' },
  { code: 'FKP', symbol: '£', name: 'Libra das Malvinas' },
  { code: 'GIP', symbol: '£', name: 'Libra de Gibraltar' },
  { code: 'ISK', symbol: 'kr', name: 'Coroa Islandesa' },
  { code: 'FOK', symbol: 'kr', name: 'Coroa Feroesa' },
  { code: 'BGN', symbol: 'лв', name: 'Lev Búlgaro' },
  { code: 'RON', symbol: 'lei', name: 'Leu Romeno' },
  { code: 'HRK', symbol: 'kn', name: 'Kuna Croata' },
  { code: 'RSD', symbol: 'дин', name: 'Dinar Sérvio' },
  { code: 'BAM', symbol: 'KM', name: 'Marco Bósnio' },
  { code: 'MKD', symbol: 'ден', name: 'Denar Macedônio' },
  { code: 'ALL', symbol: 'L', name: 'Lek Albanês' },
  { code: 'MDL', symbol: 'L', name: 'Leu Moldavo' },
  { code: 'UAH', symbol: '₴', name: 'Hryvnia Ucraniana' },
  { code: 'BYN', symbol: 'Br', name: 'Rublo Bielorrusso' },
  { code: 'GEL', symbol: 'ლ', name: 'Lari Georgiano' },
  { code: 'AMD', symbol: '֏', name: 'Dram Armênio' },
  { code: 'AZN', symbol: '₼', name: 'Manat Azerbaijano' },
  { code: 'KZT', symbol: '₸', name: 'Tenge Cazaque' },
  { code: 'KGS', symbol: 'с', name: 'Som Quirguiz' },
  { code: 'TJS', symbol: 'SM', name: 'Somoni Tajique' },
  { code: 'TMT', symbol: 'T', name: 'Manat Turcomano' },
  { code: 'UZS', symbol: 'soʻm', name: 'Som Uzbeque' },
  { code: 'MNT', symbol: '₮', name: 'Tugrik Mongol' },
  { code: 'BTN', symbol: 'Nu.', name: 'Ngultrum Butanês' },
  { code: 'MVR', symbol: 'Rf', name: 'Rufiyaa Maldiva' }
];

// Intervalos de recorrência suportados pelo Stripe
export const STRIPE_INTERVALS = [
  { value: 'day', label: 'Diário', description: 'Cobrança diária' },
  { value: 'week', label: 'Semanal', description: 'Cobrança semanal' },
  { value: 'month', label: 'Mensal', description: 'Cobrança mensal' },
  { value: 'year', label: 'Anual', description: 'Cobrança anual' }
];

// Opções de intervalos personalizados
export const STRIPE_INTERVAL_COUNTS = {
  day: { min: 1, max: 365, label: 'dias' },
  week: { min: 1, max: 52, label: 'semanas' },
  month: { min: 1, max: 12, label: 'meses' },
  year: { min: 1, max: 3, label: 'anos' }
};

// Tipos de cobrança
export const STRIPE_BILLING_SCHEMES = [
  { value: 'per_unit', label: 'Por Unidade', description: 'Cobrança por quantidade' },
  { value: 'tiered', label: 'Escalonada', description: 'Preços por faixas' }
];

// Opções de agregação de uso
export const STRIPE_USAGE_TYPES = [
  { value: 'licensed', label: 'Licenciado', description: 'Preço fixo por período' },
  { value: 'metered', label: 'Medido', description: 'Baseado no uso' }
];

// Agregação de medição
export const STRIPE_AGGREGATE_USAGE = [
  { value: 'sum', label: 'Soma', description: 'Soma todos os usos' },
  { value: 'last_during_period', label: 'Último no Período', description: 'Último valor do período' },
  { value: 'last_ever', label: 'Último Sempre', description: 'Último valor registrado' },
  { value: 'max', label: 'Máximo', description: 'Valor máximo do período' }
];

// Tipos de trial
export const STRIPE_TRIAL_TYPES = [
  { value: 'none', label: 'Sem Trial', description: 'Cobrança imediata' },
  { value: 'days', label: 'Dias Grátis', description: 'Período gratuito em dias' },
  { value: 'usage', label: 'Uso Grátis', description: 'Quantidade gratuita' }
];

// Funcionalidades avançadas do Stripe
export const STRIPE_ADVANCED_FEATURES = [
  { id: 'tax_rates', label: 'Taxas de Imposto', description: 'Aplicar taxas automáticas' },
  { id: 'coupons', label: 'Cupons de Desconto', description: 'Sistema de cupons' },
  { id: 'invoice_settings', label: 'Configurações da Fatura', description: 'Personalizar faturas' },
  { id: 'payment_methods', label: 'Métodos de Pagamento', description: 'Múltiplos métodos' },
  { id: 'billing_thresholds', label: 'Limites de Cobrança', description: 'Cobrança por limite' },
  { id: 'proration', label: 'Rateio', description: 'Ajuste proporcional' },
  { id: 'cancel_at_period_end', label: 'Cancelar no Final', description: 'Cancelamento automático' },
  { id: 'collection_method', label: 'Método de Cobrança', description: 'Automático ou manual' }
];

// Países suportados pelo Stripe
export const STRIPE_COUNTRIES = [
  'AD', 'AE', 'AT', 'AU', 'BE', 'BG', 'BR', 'CA', 'CH', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 
  'FR', 'GB', 'GI', 'GR', 'HK', 'HR', 'HU', 'IE', 'IN', 'IS', 'IT', 'JP', 'LI', 'LT', 'LU', 'LV', 
  'MT', 'MX', 'MY', 'NL', 'NO', 'NZ', 'PH', 'PL', 'PT', 'RO', 'SE', 'SG', 'SI', 'SK', 'TH', 'TT', 
  'UA', 'US', 'VN'
];

// Função para obter símbolo da moeda
export function getCurrencySymbol(currencyCode: string): string {
  const currency = STRIPE_CURRENCIES.find(c => c.code === currencyCode);
  return currency?.symbol || currencyCode;
}

// Função para formatar preço
export function formatPrice(amount: number, currency: string): string {
  const symbol = getCurrencySymbol(currency);
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  });
  
  try {
    return formatter.format(amount);
  } catch {
    return `${symbol} ${amount.toFixed(2)}`;
  }
}

// Função para validar moeda
export function isValidCurrency(currency: string): boolean {
  return STRIPE_CURRENCIES.some(c => c.code === currency);
}