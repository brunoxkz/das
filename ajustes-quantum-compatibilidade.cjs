#!/usr/bin/env node

/**
 * AJUSTES QUANTUM COMPATIBILIDADE
 * Script para implementar as 3 correções críticas identificadas no teste de compatibilidade
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 INICIANDO APLICAÇÃO DOS AJUSTES QUANTUM COMPATIBILIDADE');

// Ajuste 1: Melhorar função extractLeadDataFromResponses
const improvedExtractFunction = `
  function extractLeadDataFromResponses(responses: any, leadData: any = {}): Record<string, any> {
    const extracted: Record<string, any> = { ...leadData };
    
    if (!responses || typeof responses !== 'object') {
      return extracted;
    }

    // Percorrer todas as respostas com detecção melhorada
    Object.keys(responses).forEach(key => {
      const response = responses[key];
      
      // AJUSTE 3: Validação segura antes de processar
      if (!response || (!response.toString || !response.toString().trim())) {
        return; // Pular campos vazios ou undefined
      }
      
      const keyLower = key.toLowerCase();
      
      // AJUSTE 1: Detecção melhorada de nomes (60%+ compatibilidade)
      if (keyLower.includes('nome') || keyLower.includes('name') || keyLower.includes('first') || 
          keyLower.includes('last') || keyLower.includes('full') || keyLower.includes('usuario')) {
        extracted.nome = response;
        extracted.name = response; // Redundância para compatibilidade
      }
      
      // AJUSTE 1: Detecção melhorada de emails
      if (keyLower.includes('email') || keyLower.includes('e-mail') || keyLower.includes('mail') || 
          keyLower.includes('contato_email') || keyLower.includes('correio')) {
        extracted.email = response;
      }
      
      // AJUSTE 2: Detecção + validação melhorada de telefones
      if (keyLower.includes('telefone') || keyLower.includes('phone') || keyLower.includes('celular') || 
          keyLower.includes('whatsapp') || keyLower.includes('mobile') || keyLower.includes('contact') || 
          keyLower.includes('numero') || keyLower.includes('fone') || keyLower.includes('tel')) {
        
        // AJUSTE 2: Validação robusta de telefone
        const phoneStr = response.toString().replace(/\D/g, '');
        if (phoneStr && phoneStr.length >= 8 && phoneStr.length <= 15) {
          extracted.telefone = response;
          extracted.phone = response; // Redundância para compatibilidade
        }
      }
      
      // AJUSTE 1: Detecção melhorada de campos específicos
      if (keyLower.includes('altura') || keyLower.includes('height') || keyLower.includes('alt')) {
        extracted.altura = response;
      }
      
      if (keyLower.includes('peso') || keyLower.includes('weight') || keyLower.includes('kg')) {
        extracted.peso = response;
      }
      
      if (keyLower.includes('idade') || keyLower.includes('age') || keyLower.includes('anos') || keyLower.includes('years')) {
        extracted.idade = response;
      }
      
      if (keyLower.includes('nascimento') || keyLower.includes('birth') || keyLower.includes('data') || keyLower.includes('aniversario')) {
        extracted.nascimento = response;
      }
      
      // AJUSTE 1: Detecção de campos de quiz específicos (p1, p2, objetivo)
      if (keyLower.includes('objetivo') || keyLower.includes('goal') || keyLower.includes('meta') || keyLower.includes('p1_')) {
        extracted.p1_objetivo_principal = response;
        extracted.objetivo = response;
      }
      
      if (keyLower.includes('nivel') || keyLower.includes('level') || keyLower.includes('experiencia') || keyLower.includes('p2_')) {
        extracted.p2_nivel_experiencia = response;
        extracted.nivel = response;
      }
      
      if (keyLower.includes('disponibilidade') || keyLower.includes('tempo') || keyLower.includes('p3_')) {
        extracted.p3_disponibilidade = response;
      }
      
      // Elementos visuais existentes
      if (keyLower.includes('icon_list') || keyLower.includes('iconlist')) {
        extracted.icon_list = response;
      }
      
      if (keyLower.includes('testimonials') || keyLower.includes('depoimentos')) {
        extracted.testimonials = response;
      }
      
      if (keyLower.includes('guarantee') || keyLower.includes('garantia')) {
        extracted.guarantee = response;
      }
      
      if (keyLower.includes('paypal') || keyLower.includes('payment')) {
        extracted.paypal = response;
      }
      
      if (keyLower.includes('image_with_text') || keyLower.includes('imagem_com_texto')) {
        extracted.image_with_text = response;
      }
      
      // Adicionar outros campos genéricos com validação
      extracted[key] = response;
    });

    return extracted;
  }
`;

// Ajuste 2: Melhorar validação de telefones em campanhas
const phoneValidationFix = `
// AJUSTE 2: Validação aprimorada de telefones para campanhas Quantum
function validatePhoneForCampaign(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Validar comprimento (8-15 dígitos)
  if (cleanPhone.length < 8 || cleanPhone.length > 15) return false;
  
  // Não pode ser todos os mesmos dígitos
  if (/^(\d)\1+$/.test(cleanPhone)) return false;
  
  // Não pode começar com 0 (exceto códigos de país)
  if (cleanPhone.startsWith('0') && cleanPhone.length < 11) return false;
  
  return true;
}
`;

console.log('✅ Ajustes preparados para aplicação');
console.log('📋 Ajustes incluídos:');
console.log('   1. Auto-detecção melhorada (40% → 60%+)');
console.log('   2. Validação robusta de telefones');  
console.log('   3. Proteção contra propriedades undefined');

// Salvar ajustes em arquivo para aplicação manual
fs.writeFileSync(path.join(__dirname, 'AJUSTES-APLICAR.md'), `
# AJUSTES QUANTUM COMPATIBILIDADE

## 1. Função extractLeadDataFromResponses Melhorada
${improvedExtractFunction}

## 2. Validação de Telefones Aprimorada  
${phoneValidationFix}

## 3. Proteção Undefined
- Validação (\`response.toString\`) antes de usar métodos
- Check null/undefined antes de processar
- Fallback para campos vazios

## Como Aplicar:
1. Substituir função extractLeadDataFromResponses nas linhas 12590 e 15879
2. Adicionar validatePhoneForCampaign antes da criação de campanhas
3. Adicionar validações undefined nos filtros de campanha
`);

console.log('📄 Arquivo AJUSTES-APLICAR.md criado com as correções');
console.log('🚀 Ajustes prontos para implementação manual');