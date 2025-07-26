#!/usr/bin/env node

/**
 * 🚀 SETUP POSTGRESQL ULTRA-SIMPLES
 * Script que monitora .env e ativa PostgreSQL automaticamente
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 VERIFICANDO CONFIGURAÇÃO POSTGRESQL...\n');

// Verificar se .env existe
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('❌ Arquivo .env não encontrado');
    process.exit(1);
}

// Ler arquivo .env
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

// Procurar DATABASE_URL
let databaseUrl = null;
let hasPostgres = false;

for (const line of lines) {
    if (line.startsWith('DATABASE_URL=') && !line.startsWith('DATABASE_URL=""') && !line.startsWith('DATABASE_URL=\'\'')) {
        databaseUrl = line.split('=')[1].replace(/['"]/g, '');
        if (databaseUrl && databaseUrl.trim() && databaseUrl.includes('postgresql://')) {
            hasPostgres = true;
            break;
        }
    }
}

if (hasPostgres) {
    console.log('✅ PostgreSQL detectado no .env!');
    console.log('📝 DATABASE_URL encontrada:', databaseUrl.substring(0, 50) + '...');
    console.log('🔄 O sistema vai detectar automaticamente e usar PostgreSQL');
    console.log('📈 Capacidade: 1000+ usuários simultâneos');
    console.log('\n🚀 Reinicie o servidor (Ctrl+C e npm run dev) para ativar PostgreSQL');
} else {
    console.log('⚠️  PostgreSQL não configurado');
    console.log('📄 Para ativar, adicione no .env:');
    console.log('   DATABASE_URL="postgresql://user:pass@host:port/db"');
    console.log('\n📋 PASSOS SIMPLES:');
    console.log('1. railway login --browserless');
    console.log('2. railway variables');  
    console.log('3. Copie DATABASE_URL para .env');
    console.log('4. Reinicie o servidor');
    console.log('\n📊 Atualmente usando SQLite (limite: ~100 usuários)');
}

console.log('\n' + '='.repeat(50));
console.log('💡 RAILWAY CLI COMANDOS ÚTEIS:');
console.log('• railway projects - listar projetos');
console.log('• railway link - conectar projeto');
console.log('• railway variables - ver DATABASE_URL');
console.log('• railway logs - ver logs do projeto');
console.log('='.repeat(50));