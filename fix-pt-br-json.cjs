const fs = require('fs');

try {
  // Ler o arquivo corrompido
  let content = fs.readFileSync('client/src/i18n/locales/pt-BR.json', 'utf8');
  
  // Estratégia: encontrar onde começou a corrupção
  let stack = [];
  let validEnd = 0;
  let inString = false;
  let escaped = false;
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    
    if (escaped) {
      escaped = false;
      continue;
    }
    
    if (char === '\\') {
      escaped = true;
      continue;
    }
    
    if (char === '"' && !escaped) {
      inString = !inString;
      continue;
    }
    
    if (!inString) {
      if (char === '{' || char === '[') {
        stack.push(char);
      } else if (char === '}' || char === ']') {
        if (stack.length > 0) {
          stack.pop();
          if (stack.length === 0) {
            validEnd = i + 1;
          }
        }
      }
    }
  }
  
  // Cortar no último ponto válido
  const validContent = content.substring(0, validEnd);
  
  // Tentar fazer o parse
  const data = JSON.parse(validContent);
  
  // Escrever o JSON limpo
  fs.writeFileSync('client/src/i18n/locales/pt-BR.json', JSON.stringify(data, null, 2));
  
  console.log('✅ JSON pt-BR.json corrigido com sucesso!');
  console.log(`Tamanho original: ${content.length} chars`);
  console.log(`Tamanho válido: ${validEnd} chars`);
  
} catch (error) {
  console.log('❌ Erro ao corrigir JSON:', error.message);
}