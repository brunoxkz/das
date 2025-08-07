/**
 * SISTEMA DE SANITIZAÇÃO DE SCRIPTS - SEGURANÇA AVANÇADA
 * Protege contra XSS, injection attacks e código malicioso
 */

interface SanitizationResult {
  sanitizedCode: string;
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

// Palavras-chave perigosas que devem ser bloqueadas
const DANGEROUS_KEYWORDS = [
  'eval(',
  'Function(',
  'setTimeout(',
  'setInterval(',
  'document.write',
  'innerHTML',
  'outerHTML',
  'document.cookie',
  'localStorage',
  'sessionStorage',
  'window.location',
  'location.href',
  'location.replace',
  'location.assign',
  'XMLHttpRequest',
  'fetch(',
  'import(',
  'require(',
  'process.',
  'child_process',
  'fs.',
  'path.',
  'os.',
  'crypto.',
  'buffer.',
  'stream.',
  'net.',
  'http.',
  'https.',
  'url.',
  'querystring.',
  'util.',
  'events.',
  'cluster.',
  'worker_threads',
  'performance.',
  'navigator.',
  'history.',
  'screen.',
  'frames',
  'parent.',
  'top.',
  'self.',
  'opener.',
  'closed.',
  'name.',
  'status.',
  'defaultStatus.',
  'toolbar.',
  'menubar.',
  'scrollbars.',
  'statusbar.',
  'directories.',
  'personalbar.',
  'locationbar.',
  'alert(',
  'confirm(',
  'prompt(',
  'open(',
  'close(',
  'print(',
  'focus(',
  'blur(',
  'moveBy(',
  'moveTo(',
  'resizeBy(',
  'resizeTo(',
  'scroll(',
  'scrollBy(',
  'scrollTo(',
  'clearInterval(',
  'clearTimeout('
];

// Padrões de URLs suspeitas
const SUSPICIOUS_URL_PATTERNS = [
  /https?:\/\/(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/,
  /https?:\/\/localhost/,
  /https?:\/\/127\.0\.0\.1/,
  /https?:\/\/0\.0\.0\.0/,
  /https?:\/\/.*\.onion/,
  /https?:\/\/.*\.tk/,
  /https?:\/\/.*\.ml/,
  /https?:\/\/.*\.ga/,
  /https?:\/\/.*\.cf/,
  /data:.*base64/,
  /javascript:/,
  /vbscript:/,
  /file:/,
  /ftp:/
];

// Domínios confiáveis para pixels e tracking
const TRUSTED_DOMAINS = [
  'facebook.com',
  'fbcdn.net',
  'connect.facebook.net',
  'google.com',
  'googletagmanager.com',
  'google-analytics.com',
  'googlesyndication.com',
  'doubleclick.net',
  'googleadservices.com',
  'gstatic.com',
  'tiktok.com',
  'analytics.tiktok.com',
  'ads.tiktok.com',
  'snapchat.com',
  'sc-static.net',
  'pinterest.com',
  'pinimg.com',
  'linkedin.com',
  'licdn.com',
  'taboola.com',
  'taboolasyndication.com',
  'outbrain.com',
  'outbrainimg.com',
  'mgid.com',
  'servicer.mgid.com',
  'utmify.com',
  'voluum.com',
  'redtrack.io',
  'clickfunnels.com',
  'leadpages.com',
  'unbounce.com',
  'hotjar.com',
  'fullstory.com',
  'segment.com',
  'amplitude.com',
  'mixpanel.com',
  'intercom.io',
  'zendesk.com',
  'drift.com',
  'hubspot.com',
  'mailchimp.com',
  'convertkit.com',
  'activecampaign.com',
  'getdrip.com',
  'klaviyo.com',
  'sendgrid.com',
  'mailgun.com',
  'postmark.com',
  'mandrill.com',
  'sparkpost.com',
  'stripe.com',
  'paypal.com',
  'razorpay.com',
  'pagseguro.com',
  'mercadopago.com',
  'cielo.com.br',
  'pagarme.com.br',
  'iugu.com',
  'wirecard.com.br',
  'gerencianet.com.br',
  'pagar.me',
  'stone.com.br',
  'moderninha.com.br',
  'picpay.com',
  'nubank.com.br',
  'itau.com.br',
  'bradesco.com.br',
  'bb.com.br',
  'santander.com.br',
  'caixa.gov.br'
];

/**
 * Sanitiza código UTM/tracking removendo elementos perigosos
 */
export function sanitizeUTMCode(code: string): SanitizationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  let sanitizedCode = code;

  // Verificar se o código está vazio
  if (!code || code.trim().length === 0) {
    return {
      sanitizedCode: '',
      isValid: true,
      warnings: [],
      errors: []
    };
  }

  // Verificar limite de tamanho
  if (code.length > 5000) {
    errors.push('Código UTM excede o limite de 5000 caracteres');
    return {
      sanitizedCode: '',
      isValid: false,
      warnings,
      errors
    };
  }

  // Verificar palavras-chave perigosas
  const dangerousFound = DANGEROUS_KEYWORDS.filter(keyword => 
    code.toLowerCase().includes(keyword.toLowerCase())
  );
  
  if (dangerousFound.length > 0) {
    errors.push(`Palavras-chave perigosas encontradas: ${dangerousFound.join(', ')}`);
    return {
      sanitizedCode: '',
      isValid: false,
      warnings,
      errors
    };
  }

  // Verificar URLs suspeitas
  const suspiciousUrls = SUSPICIOUS_URL_PATTERNS.filter(pattern => 
    pattern.test(code)
  );
  
  if (suspiciousUrls.length > 0) {
    errors.push('URLs suspeitas ou não autorizadas encontradas');
    return {
      sanitizedCode: '',
      isValid: false,
      warnings,
      errors
    };
  }

  // Verificar se contém apenas domínios confiáveis
  const urlRegex = /https?:\/\/([^\/\s]+)/gi;
  const urls = code.match(urlRegex);
  
  if (urls) {
    const untrustedUrls = urls.filter(url => {
      const domain = url.replace(/https?:\/\//, '').split('/')[0];
      return !TRUSTED_DOMAINS.some(trusted => 
        domain.includes(trusted) || domain.endsWith('.' + trusted)
      );
    });
    
    if (untrustedUrls.length > 0) {
      warnings.push(`Domínios não verificados encontrados: ${untrustedUrls.join(', ')}`);
    }
  }

  // Remover comentários maliciosos
  sanitizedCode = sanitizedCode.replace(/\/\*[\s\S]*?\*\//g, '');
  sanitizedCode = sanitizedCode.replace(/\/\/.*$/gm, '');

  // Remover espaços em branco excessivos
  sanitizedCode = sanitizedCode.replace(/\s+/g, ' ').trim();

  return {
    sanitizedCode,
    isValid: true,
    warnings,
    errors
  };
}

/**
 * Sanitiza scripts personalizados com validação mais rigorosa
 */
export function sanitizeCustomScript(code: string): SanitizationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  let sanitizedCode = code;

  // Verificar se o código está vazio
  if (!code || code.trim().length === 0) {
    return {
      sanitizedCode: '',
      isValid: true,
      warnings: [],
      errors: []
    };
  }

  // Verificar limite de tamanho
  if (code.length > 10000) {
    errors.push('Script personalizado excede o limite de 10000 caracteres');
    return {
      sanitizedCode: '',
      isValid: false,
      warnings,
      errors
    };
  }

  // Verificar palavras-chave perigosas
  const dangerousFound = DANGEROUS_KEYWORDS.filter(keyword => 
    code.toLowerCase().includes(keyword.toLowerCase())
  );
  
  if (dangerousFound.length > 0) {
    errors.push(`Palavras-chave perigosas encontradas: ${dangerousFound.join(', ')}`);
    return {
      sanitizedCode: '',
      isValid: false,
      warnings,
      errors
    };
  }

  // Verificar estrutura HTML básica
  const scriptTagRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  const hasScript = scriptTagRegex.test(code);
  
  if (hasScript) {
    // Verificar se scripts têm type definido
    const scriptTags = code.match(scriptTagRegex);
    if (scriptTags) {
      scriptTags.forEach(tag => {
        if (!tag.includes('type=') && !tag.includes('src=')) {
          warnings.push('Script sem type definido encontrado');
        }
      });
    }
  }

  // Verificar URLs suspeitas
  const suspiciousUrls = SUSPICIOUS_URL_PATTERNS.filter(pattern => 
    pattern.test(code)
  );
  
  if (suspiciousUrls.length > 0) {
    errors.push('URLs suspeitas ou não autorizadas encontradas');
    return {
      sanitizedCode: '',
      isValid: false,
      warnings,
      errors
    };
  }

  // Verificar se contém apenas domínios confiáveis
  const urlRegex = /https?:\/\/([^\/\s"']+)/gi;
  const urls = code.match(urlRegex);
  
  if (urls) {
    const untrustedUrls = urls.filter(url => {
      const domain = url.replace(/https?:\/\//, '').split('/')[0];
      return !TRUSTED_DOMAINS.some(trusted => 
        domain.includes(trusted) || domain.endsWith('.' + trusted)
      );
    });
    
    if (untrustedUrls.length > 0) {
      warnings.push(`Domínios não verificados encontrados: ${untrustedUrls.join(', ')}`);
    }
  }

  // Validar estrutura HTML
  const htmlErrors = validateHTMLStructure(code);
  if (htmlErrors.length > 0) {
    errors.push(...htmlErrors);
    return {
      sanitizedCode: '',
      isValid: false,
      warnings,
      errors
    };
  }

  return {
    sanitizedCode,
    isValid: true,
    warnings,
    errors
  };
}

/**
 * Valida estrutura HTML básica
 */
function validateHTMLStructure(code: string): string[] {
  const errors: string[] = [];
  
  // Verificar tags abertas sem fechamento
  const openTags = code.match(/<([a-zA-Z][^>]*[^\/])>/g);
  const closeTags = code.match(/<\/([a-zA-Z][^>]*)>/g);
  
  if (openTags && closeTags) {
    const openTagNames = openTags.map(tag => tag.match(/<([a-zA-Z]+)/)?.[1]).filter(Boolean);
    const closeTagNames = closeTags.map(tag => tag.match(/<\/([a-zA-Z]+)/)?.[1]).filter(Boolean);
    
    const unmatched = openTagNames.filter(tag => !closeTagNames.includes(tag));
    if (unmatched.length > 0) {
      errors.push(`Tags não fechadas encontradas: ${unmatched.join(', ')}`);
    }
  }

  // Verificar atributos perigosos
  const dangerousAttributes = [
    'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange',
    'onsubmit', 'onreset', 'onselect', 'onunload', 'onresize', 'onscroll',
    'onerror', 'onabort', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup',
    'onmousedown', 'onmouseup', 'onmousemove', 'onmouseout'
  ];
  
  const foundDangerousAttrs = dangerousAttributes.filter(attr => 
    code.toLowerCase().includes(attr.toLowerCase())
  );
  
  if (foundDangerousAttrs.length > 0) {
    errors.push(`Atributos perigosos encontrados: ${foundDangerousAttrs.join(', ')}`);
  }

  return errors;
}

/**
 * Valida se o código contém apenas pixels de rastreamento legítimos
 */
export function validateTrackingPixels(code: string): SanitizationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Verificar se é um pixel de rastreamento legítimo
  const pixelPatterns = [
    /facebook\.com\/tr\?/,
    /google-analytics\.com/,
    /googletagmanager\.com/,
    /tiktok\.com\/.*pixel/,
    /snapchat\.com\/.*pixel/,
    /pinterest\.com\/.*pixel/,
    /linkedin\.com\/.*pixel/,
    /taboola\.com/,
    /outbrain\.com/,
    /mgid\.com/,
    /utmify\.com/,
    /voluum\.com/,
    /redtrack\.io/
  ];

  const isLegitimatePixel = pixelPatterns.some(pattern => pattern.test(code));
  
  if (!isLegitimatePixel && code.includes('http')) {
    warnings.push('Código não reconhecido como pixel de rastreamento padrão');
  }

  return {
    sanitizedCode: code,
    isValid: true,
    warnings,
    errors
  };
}

/**
 * Função principal de sanitização
 */
export function sanitizeAllScripts(data: {
  utmTrackingCode?: string;
  customHeadScript?: string;
  trackingPixels?: any[];
}): {
  sanitizedData: any;
  isValid: boolean;
  warnings: string[];
  errors: string[];
} {
  const allWarnings: string[] = [];
  const allErrors: string[] = [];
  const sanitizedData: any = {};

  // Sanitizar UTM tracking code
  if (data.utmTrackingCode) {
    const utmResult = sanitizeUTMCode(data.utmTrackingCode);
    sanitizedData.utmTrackingCode = utmResult.sanitizedCode;
    allWarnings.push(...utmResult.warnings);
    allErrors.push(...utmResult.errors);
  }

  // Sanitizar custom head script
  if (data.customHeadScript) {
    const scriptResult = sanitizeCustomScript(data.customHeadScript);
    sanitizedData.customHeadScript = scriptResult.sanitizedCode;
    allWarnings.push(...scriptResult.warnings);
    allErrors.push(...scriptResult.errors);
  }

  // Validar tracking pixels
  if (data.trackingPixels && Array.isArray(data.trackingPixels)) {
    sanitizedData.trackingPixels = data.trackingPixels.filter(pixel => {
      if (pixel.value && pixel.value.includes('http')) {
        const pixelResult = validateTrackingPixels(pixel.value);
        allWarnings.push(...pixelResult.warnings);
        allErrors.push(...pixelResult.errors);
        return pixelResult.isValid;
      }
      return true;
    });
  }

  return {
    sanitizedData,
    isValid: allErrors.length === 0,
    warnings: allWarnings,
    errors: allErrors
  };
}