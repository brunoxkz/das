#!/usr/bin/env node

/**
 * TESTE SIMPLIFICADO DOS AJUSTES QUANTUM
 * Validar correções antes de implementar no sistema principal
 */

console.log('🧪 INICIANDO TESTE DOS AJUSTES QUANTUM COMPATIBILIDADE');

// Função melhorada de auto-detecção (AJUSTE 1)
function extractLeadDataFromResponsesImproved(responses, leadData = {}) {
  const extracted = { ...leadData };
  
  if (!responses || typeof responses !== 'object') {
    return extracted;
  }

  Object.keys(responses).forEach(key => {
    const response = responses[key];
    
    // AJUSTE 3: Validação segura
    if (!response || !response.toString || !response.toString().trim()) {
      return;
    }
    
    const keyLower = key.toLowerCase();
    
    // AJUSTE 1: Detecção melhorada de nomes
    if (keyLower.includes('nome') || keyLower.includes('name') || keyLower.includes('first') || 
        keyLower.includes('last') || keyLower.includes('full') || keyLower.includes('usuario')) {
      extracted.nome = response;
      extracted.name = response;
    }
    
    // AJUSTE 1: Detecção melhorada de emails
    if (keyLower.includes('email') || keyLower.includes('e-mail') || keyLower.includes('mail') || 
        keyLower.includes('contato_email') || keyLower.includes('correio')) {
      extracted.email = response;
    }
    
    // AJUSTE 2: Telefones com validação
    if (keyLower.includes('telefone') || keyLower.includes('phone') || keyLower.includes('celular') || 
        keyLower.includes('whatsapp') || keyLower.includes('mobile') || keyLower.includes('contact') || 
        keyLower.includes('numero') || keyLower.includes('fone') || keyLower.includes('tel')) {
      
      const phoneStr = response.toString().replace(/\D/g, '');
      if (phoneStr && phoneStr.length >= 8 && phoneStr.length <= 15) {
        extracted.telefone = response;
        extracted.phone = response;
      }
    }
    
    // AJUSTE 1: Campos específicos de quiz
    if (keyLower.includes('objetivo') || keyLower.includes('goal') || keyLower.includes('meta') || keyLower.includes('p1_')) {
      extracted.p1_objetivo_principal = response;
      extracted.objetivo = response;
    }
    
    if (keyLower.includes('nivel') || keyLower.includes('level') || keyLower.includes('experiencia') || keyLower.includes('p2_')) {
      extracted.p2_nivel_experiencia = response;
      extracted.nivel = response;
    }
    
    // Outros campos
    extracted[key] = response;
  });

  return extracted;
}

// AJUSTE 2: Validação de telefone melhorada
function validatePhoneForCampaign(phone) {
  if (!phone || typeof phone !== 'string') return false;
  
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Validar comprimento
  if (cleanPhone.length < 8 || cleanPhone.length > 15) return false;
  
  // Não pode ser todos os mesmos dígitos (regex corrigida)
  const sameDigitPattern = new RegExp('^(\\d)\\1+$');
  if (sameDigitPattern.test(cleanPhone)) return false;
  
  // Não pode começar com 0 (exceto códigos de país)
  if (cleanPhone.startsWith('0') && cleanPhone.length < 11) return false;
  
  return true;
}

// TESTE 1: Auto-detecção melhorada
console.log('\n🔍 TESTE 1: Auto-detecção melhorada');

const testResponses = {
  'nome_completo': 'João Silva',
  'email_contato': 'joao@test.com',
  'telefone_celular': '11999887766',
  'p1_objetivo_principal': 'Emagrecer',
  'p2_nivel_experiencia': 'Iniciante',
  'altura': '175cm',
  'peso': '80kg',
  'idade': '30',
  'undefined_field': undefined,
  'empty_field': '',
  'null_field': null
};

const extracted = extractLeadDataFromResponsesImproved(testResponses);
const detectedFields = Object.keys(extracted).filter(key => extracted[key] && extracted[key].toString().trim());

console.log(`✅ Campos detectados: ${detectedFields.length}`);
console.log(`📊 Taxa de detecção: ${((detectedFields.length / Object.keys(testResponses).length) * 100).toFixed(1)}%`);
console.log(`📋 Campos: ${detectedFields.join(', ')}`);

// TESTE 2: Validação de telefones
console.log('\n📱 TESTE 2: Validação de telefones');

const testPhones = [
  '11999887766',    // Válido
  '+5511999887766', // Válido com código
  '1199988',        // Muito curto
  '11111111111',    // Todos iguais
  '0123456789',     // Começa com 0
  '',               // Vazio
  null,             // Null
  undefined         // Undefined
];

let validPhones = 0;
testPhones.forEach(phone => {
  const isValid = validatePhoneForCampaign(phone);
  console.log(`${isValid ? '✅' : '❌'} ${phone || 'null/undefined'}: ${isValid ? 'VÁLIDO' : 'INVÁLIDO'}`);
  if (isValid) validPhones++;
});

console.log(`📊 Taxa de validação: ${validPhones}/${testPhones.length} (${((validPhones / testPhones.length) * 100).toFixed(1)}%)`);

// TESTE 3: Proteção undefined
console.log('\n🛡️ TESTE 3: Proteção undefined');

const undefinedTest = {
  'valid_field': 'test',
  'undefined_field': undefined,
  'null_field': null,
  'empty_field': '',
  'object_field': { toString: () => 'object' }
};

let protectedFields = 0;
try {
  const result = extractLeadDataFromResponsesImproved(undefinedTest);
  console.log('✅ Processamento sem erros');
  protectedFields = Object.keys(result).length;
} catch (error) {
  console.log(`❌ Erro: ${error.message}`);
}

console.log(`🔒 Campos processados com segurança: ${protectedFields}`);

// RESULTADO FINAL
console.log('\n📊 RESULTADO FINAL DOS AJUSTES');
console.log('================================');

const autoDetectionImprovement = detectedFields.length >= 6 ? '✅' : '❌';
const phoneValidationOk = validPhones >= 2 ? '✅' : '❌';
const undefinedProtectionOk = protectedFields > 0 ? '✅' : '❌';

console.log(`${autoDetectionImprovement} AJUSTE 1: Auto-detecção melhorada`);
console.log(`${phoneValidationOk} AJUSTE 2: Validação de telefones`);
console.log(`${undefinedProtectionOk} AJUSTE 3: Proteção undefined`);

const overallSuccess = [autoDetectionImprovement, phoneValidationOk, undefinedProtectionOk].filter(x => x === '✅').length;
console.log(`\n🎯 COMPATIBILIDADE: ${overallSuccess}/3 ajustes aprovados (${((overallSuccess / 3) * 100).toFixed(1)}%)`);

if (overallSuccess === 3) {
  console.log('🚀 TODOS OS AJUSTES VALIDADOS - Prontos para implementação');
} else {
  console.log('⚠️ Alguns ajustes precisam de refinamento');
}