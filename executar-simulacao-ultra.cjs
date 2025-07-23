#!/usr/bin/env node

/**
 * EXECUTAR SIMULAÇÃO ULTRA AVANÇADA - AUTOMÁTICO
 * Executa simulação ultra sem interação do usuário
 * Data: 22/07/2025
 */

const { spawn } = require('child_process');

async function executarSimulacao() {
  console.log('🚀 EXECUTANDO SIMULAÇÃO ULTRA AVANÇADA - MODO AUTOMÁTICO');
  console.log('=' .repeat(80));
  
  const child = spawn('node', ['simulacao-ultra-avancada.cjs'], {
    cwd: process.cwd(),
    stdio: 'pipe'
  });

  // Enviar respostas automáticas
  child.stdin.write('2\n'); // Usar quiz existente
  child.stdin.write('RdAUwmQgTthxbZLA0HJWu\n'); // Quiz ID
  child.stdin.write('50\n'); // Quantidade de leads
  child.stdin.end();

  let output = '';
  child.stdout.on('data', (data) => {
    const text = data.toString();
    process.stdout.write(text);
    output += text;
  });

  child.stderr.on('data', (data) => {
    process.stderr.write(data);
  });

  return new Promise((resolve, reject) => {
    child.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ SIMULAÇÃO ULTRA CONCLUÍDA COM SUCESSO!');
        resolve(output);
      } else {
        console.error(`\n❌ Simulação falhou com código: ${code}`);
        reject(new Error(`Process exited with code ${code}`));
      }
    });

    child.on('error', (error) => {
      console.error('❌ Erro ao executar simulação:', error);
      reject(error);
    });
  });
}

if (require.main === module) {
  executarSimulacao().catch(console.error);
}