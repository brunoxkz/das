#!/usr/bin/env node

/**
 * 🚀 SCRIPT AUTOMÁTICO - PREPARAÇÃO RAILWAY DEPLOY
 * 
 * Este script prepara automaticamente o projeto Vendzz para deploy no Railway:
 * - Cria arquivos de configuração necessários
 * - Gera scripts de build otimizados
 * - Prepara migração PostgreSQL
 * - Valida estrutura do projeto
 */

import fs from 'fs';
import path from 'path';

console.log('🚀 INICIANDO PREPARAÇÃO PARA RAILWAY...\n');

// 1. CRIAR PROCFILE
const procfileContent = `web: npm run railway:start`;

fs.writeFileSync('Procfile', procfileContent);
console.log('✅ Procfile criado');

// 2. CRIAR RAILWAY.TOML
const railwayTomlContent = `[build]
  builder = "NIXPACKS"
  buildCommand = "npm run railway:build"

[deploy]
  startCommand = "npm run railway:start"
  restartPolicyType = "ON_FAILURE"
  restartPolicyMaxRetries = 10

[database]
  name = "vendzz-postgresql"

[environments]
  [environments.production]
    name = "production"
    variables = [
      "NODE_ENV=production",
      "DATABASE_URL",
      "JWT_SECRET",
      "SESSION_SECRET"
    ]
`;

fs.writeFileSync('railway.toml', railwayTomlContent);
console.log('✅ railway.toml criado');

// 3. ATUALIZAR PACKAGE.JSON
let packageJson = {};
try {
  packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
} catch (error) {
  console.error('❌ Erro ao ler package.json:', error.message);
  process.exit(1);
}

// Adicionar scripts necessários
packageJson.scripts = {
  ...packageJson.scripts,
  "start": "node dist/server/index.js",
  "build": "npm run build:client && npm run build:server",
  "build:client": "vite build",
  "build:server": "tsc -p server/tsconfig.json",
  "postbuild": "cp -r public dist/ 2>/dev/null || true",
  "railway:build": "npm install && npm run build",
  "railway:start": "NODE_ENV=production node dist/server/index.js",
  "migrate:postgresql": "node migrate-to-railway.js"
};

// Adicionar engines
packageJson.engines = {
  "node": ">=18.0.0",
  "npm": ">=8.0.0"
};

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('✅ package.json atualizado com scripts Railway');

// 4. CRIAR SCRIPT DE MIGRAÇÃO
const migrationScript = `const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function migrateToPostgreSQL() {
  console.log('🔄 Iniciando migração para PostgreSQL...');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não encontrada!');
    process.exit(1);
  }
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  try {
    // Verificar conexão
    const client = await pool.connect();
    console.log('✅ Conectado ao PostgreSQL');
    
    // Executar schema se existir
    const schemaPath = path.join(__dirname, 'schema-postgresql.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schema);
      console.log('✅ Schema PostgreSQL executado');
    }
    
    // Criar tabelas básicas se não existirem
    await client.query(\`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        password TEXT,
        name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sms_credits INTEGER DEFAULT 0,
        email_credits INTEGER DEFAULT 0,
        whatsapp_credits INTEGER DEFAULT 0,
        ai_credits INTEGER DEFAULT 0,
        video_credits INTEGER DEFAULT 0,
        telegram_credits INTEGER DEFAULT 0
      );
      
      CREATE TABLE IF NOT EXISTS quizzes (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        title TEXT,
        description TEXT,
        status TEXT DEFAULT 'draft',
        config JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes(user_id);
      CREATE INDEX IF NOT EXISTS idx_quizzes_status ON quizzes(status);
    \`);
    
    console.log('✅ Tabelas básicas criadas');
    
    client.release();
    await pool.end();
    
    console.log('🎉 Migração PostgreSQL concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  migrateToPostgreSQL();
}

module.exports = { migrateToPostgreSQL };
`;

fs.writeFileSync('migrate-to-railway.js', migrationScript);
console.log('✅ Script de migração PostgreSQL criado');

// 5. CRIAR .ENV.EXAMPLE
const envExample = `# ===== RAILWAY PRODUCTION VARIABLES =====

# Database (será fornecido automaticamente pelo Railway)
DATABASE_URL=postgresql://postgres:password@host:port/database

# Autenticação (OBRIGATÓRIO - gere chaves seguras)
JWT_SECRET=sua_jwt_secret_super_segura_minimo_32_chars
SESSION_SECRET=sua_session_secret_super_segura_minimo_32_chars

# Environment
NODE_ENV=production
PORT=5000

# ===== INTEGRAÇÕES OPCIONAIS =====

# Stripe (para pagamentos)
STRIPE_SECRET_KEY=sk_live_seu_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=pk_live_seu_stripe_public_key

# OpenAI (para IA)
OPENAI_API_KEY=sk-proj-seu_openai_api_key

# Twilio (para SMS)
TWILIO_ACCOUNT_SID=seu_twilio_account_sid
TWILIO_AUTH_TOKEN=seu_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Brevo (para Email Marketing)
BREVO_API_KEY=sua_brevo_api_key

# WhatsApp (para automação)
WHATSAPP_API_URL=sua_whatsapp_api_url
WHATSAPP_API_KEY=sua_whatsapp_api_key

# Performance (opcional)
NODE_OPTIONS=--max-old-space-size=1024
UV_THREADPOOL_SIZE=16

# Segurança (opcional)
ALLOWED_ORIGINS=https://seu-dominio.railway.app
TRUST_PROXY=true
`;

fs.writeFileSync('.env.example', envExample);
console.log('✅ .env.example criado com todas as variáveis');

// 6. CRIAR TSCONFIG PARA SERVER
const serverTsConfig = {
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "outDir": "../dist/server",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["**/*"],
  "exclude": ["node_modules", "../dist", "../client"]
};

if (!fs.existsSync('server')) {
  fs.mkdirSync('server', { recursive: true });
}

fs.writeFileSync('server/tsconfig.json', JSON.stringify(serverTsConfig, null, 2));
console.log('✅ server/tsconfig.json criado');

// 7. VERIFICAR ESTRUTURA
console.log('\n📋 VERIFICANDO ESTRUTURA DO PROJETO...');

const requiredFiles = [
  'package.json',
  'Procfile',
  'railway.toml',
  '.env.example',
  'migrate-to-railway.js'
];

const requiredDirs = [
  'server',
  'client',
  'shared'
];

let allGood = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - FALTANDO`);
    allGood = false;
  }
});

requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}/`);
  } else {
    console.log(`⚠️  ${dir}/ - RECOMENDADO`);
  }
});

// 8. CRIAR CHECKLIST
const checklistContent = `# 🚀 CHECKLIST DEPLOY RAILWAY

## ✅ PREPARAÇÃO CONCLUÍDA
- [x] Procfile criado
- [x] railway.toml configurado  
- [x] package.json atualizado
- [x] Script migração PostgreSQL
- [x] .env.example com variáveis
- [x] Estrutura verificada

## 📋 PRÓXIMOS PASSOS

### 1. No Railway (railway.app):
- [ ] Criar conta
- [ ] Criar novo projeto
- [ ] Adicionar PostgreSQL database
- [ ] Configurar variáveis de ambiente

### 2. Variáveis obrigatórias no Railway:
\`\`\`
DATABASE_URL=postgresql://... (automático)
JWT_SECRET=sua_chave_jwt_segura
SESSION_SECRET=sua_chave_session_segura
NODE_ENV=production
\`\`\`

### 3. Deploy:
- [ ] Upload dos arquivos OU conectar GitHub
- [ ] Aguardar build
- [ ] Verificar logs
- [ ] Testar aplicação

### 4. Pós-deploy:
- [ ] Executar migração: \`railway run node migrate-to-railway.js\`
- [ ] Configurar domínio personalizado
- [ ] Monitorar métricas
- [ ] Configurar backup

## 🔗 COMANDOS ÚTEIS

\`\`\`bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login e deploy
railway login
railway link
railway up

# Ver logs
railway logs

# Executar comandos
railway shell
railway run node migrate-to-railway.js
\`\`\`

## 📊 CUSTOS ESTIMADOS
- Railway Hobby: $5/mês
- PostgreSQL: $5/mês  
- **Total: ~$10/mês**
`;

fs.writeFileSync('RAILWAY-CHECKLIST.md', checklistContent);
console.log('✅ RAILWAY-CHECKLIST.md criado');

console.log('\n🎉 PREPARAÇÃO CONCLUÍDA!');
console.log('\n📖 Próximos passos:');
console.log('1. Acesse https://railway.app');
console.log('2. Crie novo projeto');
console.log('3. Adicione PostgreSQL');
console.log('4. Configure variáveis (.env.example)');
console.log('5. Faça upload dos arquivos');
console.log('6. Execute: railway run node migrate-to-railway.js');
console.log('\n📋 Consulte RAILWAY-CHECKLIST.md para detalhes!');

if (allGood) {
  console.log('\n✅ PROJETO PRONTO PARA RAILWAY!');
} else {
  console.log('\n⚠️  VERIFIQUE OS ARQUIVOS FALTANDO ACIMA');
}