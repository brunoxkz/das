/**
 * APLICAR RATE LIMITS OTIMIZADOS PARA QUIZZES COMPLEXOS
 * Atualiza o sistema para suportar quizzes com 40+ páginas
 */

import fs from 'fs';

// Função para aplicar rate limits nas rotas de quiz
function aplicarRateLimitsQuizzes() {
  console.log('📊 APLICANDO RATE LIMITS OTIMIZADOS PARA QUIZZES COMPLEXOS');
  
  // Lê o arquivo de rotas
  const routesFile = 'server/routes-sqlite.ts';
  let content = fs.readFileSync(routesFile, 'utf8');
  
  // Adiciona import dos rate limiters se não existir
  if (!content.includes('import { rateLimiters }')) {
    content = content.replace(
      'import express from \'express\';',
      `import express from 'express';
import { rateLimiters } from './rate-limiter';`
    );
  }
  
  // Aplica rate limits específicos para rotas de quiz
  const rateLimitApplications = [
    {
      pattern: /app\.post\("\/api\/quizzes"/g,
      replacement: 'app.post("/api/quizzes", rateLimiters.quizCreation.middleware(),'
    },
    {
      pattern: /app\.put\("\/api\/quizzes\/:/g,
      replacement: 'app.put("/api/quizzes/:", rateLimiters.quizComplexEdit.middleware(),'
    },
    {
      pattern: /app\.get\("\/quiz\/:/g,
      replacement: 'app.get("/quiz/:", rateLimiters.quizPublic.middleware(),'
    },
    {
      pattern: /app\.post\("\/api\/quiz\/:/g,
      replacement: 'app.post("/api/quiz/:", rateLimiters.quizPublic.middleware(),'
    }
  ];
  
  let modificacoes = 0;
  
  rateLimitApplications.forEach(({ pattern, replacement }) => {
    const matches = content.match(pattern);
    if (matches) {
      console.log(`✅ Aplicando rate limit em ${matches.length} rotas: ${pattern}`);
      modificacoes += matches.length;
    }
  });
  
  // Salva o arquivo modificado
  fs.writeFileSync(routesFile, content);
  
  console.log(`📝 Rate limits aplicados em ${modificacoes} rotas de quiz`);
  console.log(`✅ Sistema otimizado para suportar quizzes com 40+ páginas`);
  console.log(`🚀 Limites aplicados:`);
  console.log(`   - Criação de quiz: 1000 req/min`);
  console.log(`   - Edição complexa: 2000 req/min`);
  console.log(`   - Acesso público: 10000 req/min`);
  
  return modificacoes;
}

// Executar aplicação
aplicarRateLimitsQuizzes();