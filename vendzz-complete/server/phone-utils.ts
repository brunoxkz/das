/**
 * SISTEMA DE DETECÇÃO INTERNACIONAL DE TELEFONES
 * Identifica país e código de área para SMS e WhatsApp mundial
 */

interface PhoneInfo {
  phone: string;
  country: string;
  countryCode: string;
  cleanPhone: string;
  isValid: boolean;
}

// Códigos de países principais
const COUNTRY_CODES = {
  // América
  '+1': 'US/CA',   // Estados Unidos/Canadá
  '+55': 'BR',     // Brasil
  '+54': 'AR',     // Argentina
  '+52': 'MX',     // México
  '+56': 'CL',     // Chile
  '+57': 'CO',     // Colômbia
  '+51': 'PE',     // Peru
  '+58': 'VE',     // Venezuela
  '+593': 'EC',    // Equador
  '+595': 'PY',    // Paraguai
  '+598': 'UY',    // Uruguai
  '+591': 'BO',    // Bolívia
  '+507': 'PA',    // Panamá
  '+506': 'CR',    // Costa Rica
  '+503': 'SV',    // El Salvador
  '+504': 'HN',    // Honduras
  '+502': 'GT',    // Guatemala
  '+505': 'NI',    // Nicarágua
  '+53': 'CU',     // Cuba
  '+509': 'HT',    // Haiti
  '+1849': 'DO',   // República Dominicana
  '+1787': 'PR',   // Porto Rico
  
  // Europa
  '+44': 'GB',     // Reino Unido
  '+49': 'DE',     // Alemanha
  '+33': 'FR',     // França
  '+39': 'IT',     // Itália
  '+34': 'ES',     // Espanha
  '+351': 'PT',    // Portugal
  '+31': 'NL',     // Holanda
  '+32': 'BE',     // Bélgica
  '+41': 'CH',     // Suíça
  '+43': 'AT',     // Áustria
  '+45': 'DK',     // Dinamarca
  '+46': 'SE',     // Suécia
  '+47': 'NO',     // Noruega
  '+358': 'FI',    // Finlândia
  '+353': 'IE',    // Irlanda
  '+48': 'PL',     // Polônia
  '+420': 'CZ',    // República Tcheca
  '+36': 'HU',     // Hungria
  '+40': 'RO',     // Romênia
  '+30': 'GR',     // Grécia
  '+90': 'TR',     // Turquia
  '+7': 'RU',      // Rússia
  
  // Ásia
  '+81': 'JP',     // Japão
  '+82': 'KR',     // Coreia do Sul
  '+86': 'CN',     // China
  '+91': 'IN',     // Índia
  '+62': 'ID',     // Indonésia
  '+63': 'PH',     // Filipinas
  '+66': 'TH',     // Tailândia
  '+84': 'VN',     // Vietnã
  '+60': 'MY',     // Malásia
  '+65': 'SG',     // Singapura
  '+852': 'HK',    // Hong Kong
  '+886': 'TW',    // Taiwan
  '+92': 'PK',     // Paquistão
  '+880': 'BD',    // Bangladesh
  '+94': 'LK',     // Sri Lanka
  '+95': 'MM',     // Myanmar
  '+855': 'KH',    // Camboja
  '+856': 'LA',    // Laos
  '+853': 'MO',    // Macau
  
  // África
  '+27': 'ZA',     // África do Sul
  '+20': 'EG',     // Egito
  '+212': 'MA',    // Marrocos
  '+216': 'TN',    // Tunísia
  '+213': 'DZ',    // Argélia
  '+218': 'LY',    // Líbia
  '+234': 'NG',    // Nigéria
  '+233': 'GH',    // Gana
  '+254': 'KE',    // Quênia
  '+255': 'TZ',    // Tanzânia
  '+256': 'UG',    // Uganda
  '+250': 'RW',    // Ruanda
  '+251': 'ET',    // Etiópia
  '+221': 'SN',    // Senegal
  '+225': 'CI',    // Costa do Marfim
  '+223': 'ML',    // Mali
  '+226': 'BF',    // Burkina Faso
  '+227': 'NE',    // Níger
  '+228': 'TG',    // Togo
  '+229': 'BJ',    // Benin
  '+230': 'MU',    // Maurício
  '+231': 'LR',    // Libéria
  '+232': 'SL',    // Serra Leoa
  '+235': 'TD',    // Chade
  '+236': 'CF',    // República Centro-Africana
  '+237': 'CM',    // Camarões
  '+238': 'CV',    // Cabo Verde
  '+239': 'ST',    // São Tomé e Príncipe
  '+240': 'GQ',    // Guiné Equatorial
  '+241': 'GA',    // Gabão
  '+242': 'CG',    // Congo
  '+243': 'CD',    // Congo (RDC)
  '+244': 'AO',    // Angola
  '+245': 'GW',    // Guiné-Bissau
  '+246': 'IO',    // Território Britânico do Oceano Índico
  '+247': 'AC',    // Ilha de Ascensão
  '+248': 'SC',    // Seychelles
  '+249': 'SD',    // Sudão
  '+252': 'SO',    // Somália
  '+253': 'DJ',    // Djibouti
  '+257': 'BI',    // Burundi
  '+258': 'MZ',    // Moçambique
  '+260': 'ZM',    // Zâmbia
  '+261': 'MG',    // Madagascar
  '+262': 'RE',    // Reunião
  '+263': 'ZW',    // Zimbabwe
  '+264': 'NA',    // Namíbia
  '+265': 'MW',    // Malawi
  '+266': 'LS',    // Lesoto
  '+267': 'BW',    // Botswana
  '+268': 'SZ',    // Suazilândia
  '+269': 'KM',    // Comores
  '+290': 'SH',    // Santa Helena
  '+291': 'ER',    // Eritreia
  '+297': 'AW',    // Aruba
  '+298': 'FO',    // Ilhas Faroe
  '+299': 'GL',    // Groenlândia
  
  // Oceania
  '+61': 'AU',     // Austrália
  '+64': 'NZ',     // Nova Zelândia
  '+679': 'FJ',    // Fiji
  '+685': 'WS',    // Samoa
  '+686': 'KI',    // Kiribati
  '+687': 'NC',    // Nova Caledônia
  '+688': 'TV',    // Tuvalu
  '+689': 'PF',    // Polinésia Francesa
  '+690': 'TK',    // Tokelau
  '+691': 'FM',    // Micronésia
  '+692': 'MH',    // Ilhas Marshall
  '+693': 'CK',    // Ilhas Cook
  '+694': 'NU',    // Niue
  '+695': 'NR',    // Nauru
  '+696': 'PN',    // Pitcairn
  '+850': 'KP',    // Coreia do Norte
  
  // Oriente Médio
  '+972': 'IL',    // Israel
  '+970': 'PS',    // Palestina
  '+961': 'LB',    // Líbano
  '+962': 'JO',    // Jordânia
  '+963': 'SY',    // Síria
  '+964': 'IQ',    // Iraque
  '+965': 'KW',    // Kuwait
  '+966': 'SA',    // Arábia Saudita
  '+967': 'YE',    // Iêmen
  '+968': 'OM',    // Omã
  '+971': 'AE',    // Emirados Árabes Unidos
  '+973': 'BH',    // Bahrein
  '+974': 'QA',    // Catar
  '+975': 'BT',    // Butão
  '+976': 'MN',    // Mongólia
  '+977': 'NP',    // Nepal
  '+993': 'TM',    // Turcomenistão
  '+994': 'AZ',    // Azerbaijão
  '+995': 'GE',    // Geórgia
  '+996': 'KG',    // Quirguistão
  '+998': 'UZ',    // Uzbequistão
};

/**
 * Detecta informações do telefone baseado em padrões internacionais
 */
export function detectPhoneInfo(phone: string): PhoneInfo {
  // Limpar telefone removendo caracteres especiais
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // Verificar se já tem código internacional
  if (cleanPhone.startsWith('+')) {
    return analyzeInternationalPhone(cleanPhone);
  }
  
  // Verificar se é brasileiro (padrão brasileiro sem +55)
  if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
    return {
      phone: cleanPhone,
      country: 'BR',
      countryCode: '+55',
      cleanPhone: `+55${cleanPhone}`,
      isValid: true
    };
  }
  
  // Verificar se é brasileiro (padrão brasileiro com 0 na frente)
  if (cleanPhone.length === 12 && cleanPhone.startsWith('0')) {
    const withoutZero = cleanPhone.substring(1);
    return {
      phone: cleanPhone,
      country: 'BR',
      countryCode: '+55',
      cleanPhone: `+55${withoutZero}`,
      isValid: true
    };
  }
  
  // Verificar se é americano (10 dígitos)
  if (cleanPhone.length === 10) {
    return {
      phone: cleanPhone,
      country: 'US',
      countryCode: '+1',
      cleanPhone: `+1${cleanPhone}`,
      isValid: true
    };
  }
  
  // Verificar se é brasileiro (apenas 10 dígitos - formato antigo)
  if (cleanPhone.length === 10) {
    return {
      phone: cleanPhone,
      country: 'BR',
      countryCode: '+55',
      cleanPhone: `+55${cleanPhone}`,
      isValid: true
    };
  }
  
  // Tentar detectar por tamanho e padrões
  return analyzePhoneByPattern(cleanPhone);
}

function analyzeInternationalPhone(phone: string): PhoneInfo {
  // Procurar por códigos de país conhecidos
  for (const [code, country] of Object.entries(COUNTRY_CODES)) {
    if (phone.startsWith(code)) {
      return {
        phone: phone,
        country: country,
        countryCode: code,
        cleanPhone: phone,
        isValid: isValidPhoneLength(phone, code)
      };
    }
  }
  
  // Se não encontrou, assumir inválido
  return {
    phone: phone,
    country: 'UNKNOWN',
    countryCode: 'UNKNOWN',
    cleanPhone: phone,
    isValid: false
  };
}

function analyzePhoneByPattern(phone: string): PhoneInfo {
  // Padrões baseados em tamanho
  const length = phone.length;
  
  if (length >= 8 && length <= 15) {
    // Assumir brasileiro por padrão se não conseguir detectar
    return {
      phone: phone,
      country: 'BR',
      countryCode: '+55',
      cleanPhone: `+55${phone}`,
      isValid: length >= 10
    };
  }
  
  return {
    phone: phone,
    country: 'UNKNOWN',
    countryCode: 'UNKNOWN',
    cleanPhone: phone,
    isValid: false
  };
}

function isValidPhoneLength(phone: string, countryCode: string): boolean {
  const phoneWithoutCode = phone.replace(countryCode, '');
  const length = phoneWithoutCode.length;
  
  // Regras gerais de validação por país
  switch (countryCode) {
    case '+55': // Brasil
      return length === 10 || length === 11;
    case '+1': // EUA/Canadá
      return length === 10;
    case '+44': // Reino Unido
      return length >= 10 && length <= 11;
    case '+49': // Alemanha
      return length >= 10 && length <= 12;
    case '+33': // França
      return length === 9 || length === 10;
    case '+39': // Itália
      return length >= 9 && length <= 11;
    case '+34': // Espanha
      return length === 9;
    case '+351': // Portugal
      return length === 9;
    default:
      return length >= 8 && length <= 15;
  }
}

/**
 * Extrai telefones de respostas de quiz com detecção internacional
 */
export function extractPhonesFromResponses(responses: any[]): PhoneInfo[] {
  const phones: PhoneInfo[] = [];
  
  responses.forEach(response => {
    const responseData = typeof response.responses === 'string' ? 
      JSON.parse(response.responses) : response.responses;
    
    Object.values(responseData).forEach((value: any) => {
      if (typeof value === 'string' && value.trim()) {
        const phoneInfo = detectPhoneInfo(value);
        if (phoneInfo.isValid) {
          phones.push({
            ...phoneInfo,
            // Adicionar informações extras da resposta
            phone: value // Manter o formato original também
          });
        }
      }
    });
  });
  
  return phones;
}

/**
 * Filtra telefones únicos com prioridade por país
 */
export function deduplicatePhones(phones: PhoneInfo[]): PhoneInfo[] {
  const phoneMap = new Map<string, PhoneInfo>();
  
  phones.forEach(phone => {
    const key = phone.cleanPhone;
    
    if (!phoneMap.has(key)) {
      phoneMap.set(key, phone);
    }
  });
  
  return Array.from(phoneMap.values());
}

/**
 * Formatar telefone para display
 */
export function formatPhoneForDisplay(phoneInfo: PhoneInfo): string {
  return `${phoneInfo.cleanPhone} (${phoneInfo.country})`;
}

/**
 * Verificar se telefone é válido para WhatsApp
 */
export function isValidForWhatsApp(phoneInfo: PhoneInfo): boolean {
  return phoneInfo.isValid && phoneInfo.countryCode !== 'UNKNOWN';
}

/**
 * Verificar se telefone é válido para SMS
 */
export function isValidForSMS(phoneInfo: PhoneInfo): boolean {
  return phoneInfo.isValid && phoneInfo.countryCode !== 'UNKNOWN';
}