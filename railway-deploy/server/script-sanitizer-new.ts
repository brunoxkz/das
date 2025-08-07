/**
 * SISTEMA DE SANITIZAÇÃO DE SCRIPTS - SEGURANÇA AVANÇADA V2
 * Versão aprimorada com validação rigorosa contra XSS e code injection
 */

interface SanitizationResult {
  sanitizedCode: string;
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

// Funções JavaScript perigosas - lista expandida
const DANGEROUS_FUNCTIONS = [
  'eval', 'Function', 'setTimeout', 'setInterval', 'XMLHttpRequest',
  'fetch', 'import', 'require', 'exec', 'spawn', 'child_process',
  'alert', 'confirm', 'prompt', 'open', 'close', 'print'
];

// Propriedades perigosas do DOM/Window
const DANGEROUS_PROPERTIES = [
  'document.write', 'document.writeln', 'innerHTML', 'outerHTML',
  'document.cookie', 'localStorage', 'sessionStorage', 'indexedDB',
  'window.location', 'location.href', 'location.replace', 'location.assign',
  'history.pushState', 'history.replaceState', 'navigator.sendBeacon',
  'window.open', 'window.close', 'parent.', 'top.', 'opener.'
];

// Padrões críticos de código malicioso (mais restritivos)
const CRITICAL_MALICIOUS_PATTERNS = [
  /eval\s*\(/gi,
  /Function\s*\(/gi,
  /document\.write/gi,
  /innerHTML/gi,
  /outerHTML/gi,
  /document\.cookie/gi,
  /localStorage/gi,
  /sessionStorage/gi,
  /window\.location\s*=/gi,
  /location\.href\s*=/gi,
  /location\.replace/gi,
  /XMLHttpRequest/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /data:.*base64/gi,
  /on\w+\s*=/gi // event handlers como onclick=
];

// Padrões menos críticos (geram warnings)
const WARNING_PATTERNS = [
  /setTimeout\s*\(/gi,
  /setInterval\s*\(/gi,
  /fetch\s*\(/gi,
  /import\s*\(/gi,
  /require\s*\(/gi,
  /alert\s*\(/gi,
  /confirm\s*\(/gi,
  /prompt\s*\(/gi,
  /window\.open/gi,
  /parent\./gi,
  /top\./gi,
  /opener\./gi
];

// URLs suspeitas
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
  /file:/,
  /ftp:/
];

// Domínios confiáveis
const TRUSTED_DOMAINS = [
  'facebook.com', 'fbcdn.net', 'connect.facebook.net',
  'google.com', 'googletagmanager.com', 'google-analytics.com',
  'googlesyndication.com', 'doubleclick.net', 'googleadservices.com',
  'gstatic.com', 'tiktok.com', 'analytics.tiktok.com',
  'snapchat.com', 'sc-static.net', 'pinterest.com', 'pinimg.com',
  'linkedin.com', 'licdn.com', 'taboola.com', 'taboolasyndication.com',
  'outbrain.com', 'outbrainimg.com', 'mgid.com', 'servicer.mgid.com',
  'utmify.com', 'voluum.com', 'redtrack.io', 'clickfunnels.com',
  'leadpages.com', 'unbounce.com', 'hotjar.com', 'fullstory.com',
  'segment.com', 'amplitude.com', 'mixpanel.com'
];

/**
 * Sanitiza código UTM/tracking com validação inteligente
 */
export function sanitizeUTMCode(code: string): SanitizationResult {
  console.log('🔒 SANITIZAÇÃO UTM - Iniciando validação');
  
  const warnings: string[] = [];
  const errors: string[] = [];
  
  if (!code || typeof code !== 'string') {
    return { sanitizedCode: '', isValid: true, warnings, errors };
  }
  
  // Verificar tamanho
  if (code.length > 10000) {
    errors.push('Código UTM muito longo (máximo 10.000 caracteres)');
    return { sanitizedCode: '', isValid: false, warnings, errors };
  }
  
  // Verificar padrões críticos maliciosos
  for (const pattern of CRITICAL_MALICIOUS_PATTERNS) {
    if (pattern.test(code)) {
      errors.push(`Padrão crítico malicioso detectado: ${pattern.source}`);
      console.log('🚨 CÓDIGO MALICIOSO CRÍTICO DETECTADO:', pattern.source);
      return { sanitizedCode: '', isValid: false, warnings, errors };
    }
  }
  
  // Verificar padrões de warning
  for (const pattern of WARNING_PATTERNS) {
    if (pattern.test(code)) {
      warnings.push(`Função potencialmente perigosa detectada: ${pattern.source}`);
      console.log('⚠️ PADRÃO DE WARNING DETECTADO:', pattern.source);
    }
  }
  
  // Verificar URLs suspeitas
  for (const pattern of SUSPICIOUS_URL_PATTERNS) {
    if (pattern.test(code)) {
      errors.push('URL suspeita detectada');
      console.log('🚨 URL SUSPEITA DETECTADA');
      return { sanitizedCode: '', isValid: false, warnings, errors };
    }
  }
  
  // Verificar domínios
  const urlMatches = code.match(/https?:\/\/([^\/\s"']+)/gi);
  if (urlMatches) {
    for (const url of urlMatches) {
      const domain = url.replace(/https?:\/\//, '').split('/')[0];
      const isTrusted = TRUSTED_DOMAINS.some(trusted => 
        domain.includes(trusted) || domain.endsWith('.' + trusted)
      );
      if (!isTrusted) {
        warnings.push(`Domínio não confiável: ${domain}`);
      }
    }
  }
  
  console.log('✅ SANITIZAÇÃO UTM - Código aprovado');
  return { sanitizedCode: code, isValid: true, warnings, errors };
}

/**
 * Sanitiza scripts personalizados com validação inteligente
 */
export function sanitizeCustomScript(code: string): SanitizationResult {
  console.log('🔒 SANITIZAÇÃO SCRIPT - Iniciando validação');
  
  const warnings: string[] = [];
  const errors: string[] = [];
  
  if (!code || typeof code !== 'string') {
    return { sanitizedCode: '', isValid: true, warnings, errors };
  }
  
  // Verificar tamanho
  if (code.length > 10000) {
    errors.push('Script muito longo (máximo 10.000 caracteres)');
    return { sanitizedCode: '', isValid: false, warnings, errors };
  }
  
  // Verificar padrões críticos maliciosos
  for (const pattern of CRITICAL_MALICIOUS_PATTERNS) {
    if (pattern.test(code)) {
      errors.push(`Padrão crítico malicioso detectado: ${pattern.source}`);
      console.log('🚨 CÓDIGO MALICIOSO CRÍTICO DETECTADO:', pattern.source);
      return { sanitizedCode: '', isValid: false, warnings, errors };
    }
  }
  
  // Verificar padrões de warning
  for (const pattern of WARNING_PATTERNS) {
    if (pattern.test(code)) {
      warnings.push(`Função potencialmente perigosa detectada: ${pattern.source}`);
      console.log('⚠️ PADRÃO DE WARNING DETECTADO:', pattern.source);
    }
  }
  
  // Verificar URLs suspeitas
  for (const pattern of SUSPICIOUS_URL_PATTERNS) {
    if (pattern.test(code)) {
      errors.push('URL suspeita detectada');
      console.log('🚨 URL SUSPEITA DETECTADA');
      return { sanitizedCode: '', isValid: false, warnings, errors };
    }
  }
  
  console.log('✅ SANITIZAÇÃO SCRIPT - Código aprovado');
  return { sanitizedCode: code, isValid: true, warnings, errors };
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
  console.log('🔒 SANITIZAÇÃO GERAL - Iniciando');
  
  const allWarnings: string[] = [];
  const allErrors: string[] = [];
  const sanitizedData: any = {};
  
  // Sanitizar UTM tracking code
  if (data.utmTrackingCode) {
    const utmResult = sanitizeUTMCode(data.utmTrackingCode);
    if (!utmResult.isValid) {
      allErrors.push(...utmResult.errors);
      console.log('❌ SANITIZAÇÃO UTM FALHOU');
      return { sanitizedData, isValid: false, warnings: allWarnings, errors: allErrors };
    }
    sanitizedData.utmTrackingCode = utmResult.sanitizedCode;
    allWarnings.push(...utmResult.warnings);
  }
  
  // Sanitizar custom head script
  if (data.customHeadScript) {
    const scriptResult = sanitizeCustomScript(data.customHeadScript);
    if (!scriptResult.isValid) {
      allErrors.push(...scriptResult.errors);
      console.log('❌ SANITIZAÇÃO SCRIPT FALHOU');
      return { sanitizedData, isValid: false, warnings: allWarnings, errors: allErrors };
    }
    sanitizedData.customHeadScript = scriptResult.sanitizedCode;
    allWarnings.push(...scriptResult.warnings);
  }
  
  // Preservar tracking pixels (já validados)
  if (data.trackingPixels) {
    sanitizedData.trackingPixels = data.trackingPixels;
  }
  
  console.log('✅ SANITIZAÇÃO GERAL - Concluída com sucesso');
  return { 
    sanitizedData, 
    isValid: true, 
    warnings: allWarnings, 
    errors: allErrors 
  };
}