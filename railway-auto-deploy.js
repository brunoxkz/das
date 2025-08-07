#!/usr/bin/env node

/**
 * 🚀 RAILWAY AUTO DEPLOY - VENDZZ PLATFORM
 * Script automatizado para deploy completo no Railway
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 RAILWAY AUTO DEPLOY - VENDZZ PLATFORM');
console.log('==========================================\n');

// Configurações
const DATABASE_URL = 'postgresql://postgres:DQTpWPNOZbFcLHzomqRDkzwwYFEVjpol@yamanote.proxy.rlwy.net:56203/railway';
const PROJECT_NAME = 'vendzz-platform';

async function checkRailwayCLI() {
    console.log('📋 1. Verificando Railway CLI...');
    try {
        execSync('railway --version', { stdio: 'pipe' });
        console.log('✅ Railway CLI encontrado\n');
        return true;
    } catch (error) {
        console.log('❌ Railway CLI não encontrado');
        console.log('📥 Instalando Railway CLI...\n');
        
        try {
            // Instalar Railway CLI
            if (process.platform === 'win32') {
                execSync('npm install -g @railway/cli', { stdio: 'inherit' });
            } else {
                execSync('curl -fsSL https://railway.app/install.sh | sh', { stdio: 'inherit' });
            }
            console.log('✅ Railway CLI instalado com sucesso\n');
            return true;
        } catch (installError) {
            console.log('❌ Erro ao instalar Railway CLI');
            console.log('💡 Instale manualmente: npm install -g @railway/cli');
            return false;
        }
    }
}

function cleanProject() {
    console.log('🧹 2. Limpando projeto para deploy...');
    
    const foldersToDelete = [
        'node_modules',
        'dist',
        '.git',
        'attached_assets',
        'b2c2-editor',
        'b2c2-fixed-static',
        'b2c2-hospedagem',
        'b2c2-hospedagem-corrigido',
        'b2c2-hospedagem-final',
        'b2c2-hospedagem-novo',
        'b2c2-original-correto',
        'b2c2-standalone-fixed',
        'b2t-standalone',
        'b2t-static',
        'chrome-extension',
        'chrome-extension-rocketzap',
        'chrome-extension-sidebar',
        'chrome-extension-v2',
        'sistema-controle',
        'sistema-vendas',
        'sql-project',
        'quantum-tasks',
        'railway-deploy',
        'vendzz-complete',
        'vendzz-github',
        'wordpress-template',
        'xml-viewer'
    ];
    
    const filesToDelete = [
        '*.db',
        '*.sqlite',
        '*.log',
        'vendzz-*.zip',
        'vendzz-*.tar.gz'
    ];
    
    let cleaned = 0;
    
    // Delete folders
    foldersToDelete.forEach(folder => {
        if (fs.existsSync(folder)) {
            try {
                fs.rmSync(folder, { recursive: true, force: true });
                console.log(`   🗑️  Removido: ${folder}`);
                cleaned++;
            } catch (error) {
                console.log(`   ⚠️  Erro ao remover ${folder}: ${error.message}`);
            }
        }
    });
    
    // Delete files by pattern
    filesToDelete.forEach(pattern => {
        try {
            const files = execSync(`find . -name "${pattern}" -type f 2>/dev/null || true`, { encoding: 'utf8' });
            files.split('\n').filter(file => file.trim()).forEach(file => {
                try {
                    fs.unlinkSync(file.trim());
                    console.log(`   🗑️  Removido: ${file.trim()}`);
                    cleaned++;
                } catch (error) {
                    // Ignore errors
                }
            });
        } catch (error) {
            // Ignore errors
        }
    });
    
    console.log(`✅ Limpeza concluída: ${cleaned} itens removidos\n`);
}

function createProductionEnv() {
    console.log('⚙️  3. Criando configuração de produção...');
    
    const productionEnv = `# ===== RAILWAY PRODUCTION VARIABLES =====

# Database Railway (configurado automaticamente)
DATABASE_URL=${DATABASE_URL}

# Environment
NODE_ENV=production
PORT=5000

# Autenticação (chaves seguras)
JWT_SECRET=vendzz_jwt_super_secret_key_production_2025_railway
SESSION_SECRET=vendzz_session_super_secret_key_production_2025_railway

# Performance
NPM_CONFIG_PRODUCTION=false
NODE_OPTIONS=--max-old-space-size=1024
UV_THREADPOOL_SIZE=16

# Segurança
TRUST_PROXY=true

# ===== INTEGRAÇÕES OPCIONAIS =====
# Descomente e configure conforme necessário:

# STRIPE_SECRET_KEY=sk_live_seu_stripe_secret_key
# VITE_STRIPE_PUBLIC_KEY=pk_live_seu_stripe_public_key
# OPENAI_API_KEY=sk-proj-seu_openai_api_key
# TWILIO_ACCOUNT_SID=seu_twilio_account_sid
# TWILIO_AUTH_TOKEN=seu_twilio_auth_token
# TWILIO_PHONE_NUMBER=+1234567890
`;
    
    fs.writeFileSync('.env.production', productionEnv);
    console.log('✅ Arquivo .env.production criado\n');
}

function verifyProjectStructure() {
    console.log('🔍 4. Verificando estrutura do projeto...');
    
    const requiredFiles = [
        'package.json',
        'Procfile',
        'railway.toml',
        'client',
        'server',
        'shared'
    ];
    
    const missing = [];
    requiredFiles.forEach(file => {
        if (!fs.existsSync(file)) {
            missing.push(file);
        }
    });
    
    if (missing.length > 0) {
        console.log('❌ Arquivos/pastas obrigatórios ausentes:');
        missing.forEach(file => console.log(`   - ${file}`));
        console.log('\n💡 Certifique-se de executar na pasta raiz do projeto');
        process.exit(1);
    }
    
    console.log('✅ Estrutura do projeto verificada\n');
}

async function deployToRailway() {
    console.log('🚀 5. Fazendo deploy no Railway...');
    
    try {
        // Login no Railway (se necessário)
        console.log('🔐 Verificando login Railway...');
        try {
            execSync('railway whoami', { stdio: 'pipe' });
            console.log('✅ Já logado no Railway\n');
        } catch (error) {
            console.log('🔐 Fazendo login no Railway...');
            console.log('👆 Uma janela do navegador será aberta para login\n');
            execSync('railway login', { stdio: 'inherit' });
        }
        
        // Criar novo projeto
        console.log('📦 Criando projeto no Railway...');
        try {
            execSync(`railway init ${PROJECT_NAME} --yes`, { stdio: 'inherit' });
        } catch (error) {
            console.log('📦 Conectando ao projeto existente...');
            execSync('railway link', { stdio: 'inherit' });
        }
        
        // Adicionar variáveis de ambiente
        console.log('⚙️  Configurando variáveis de ambiente...');
        const envVars = [
            `DATABASE_URL="${DATABASE_URL}"`,
            'NODE_ENV=production',
            'JWT_SECRET=vendzz_jwt_super_secret_key_production_2025_railway',
            'SESSION_SECRET=vendzz_session_super_secret_key_production_2025_railway',
            'NPM_CONFIG_PRODUCTION=false',
            'NODE_OPTIONS=--max-old-space-size=1024'
        ];
        
        envVars.forEach(envVar => {
            try {
                execSync(`railway variables set ${envVar}`, { stdio: 'pipe' });
                console.log(`✅ ${envVar.split('=')[0]}`);
            } catch (error) {
                console.log(`⚠️  Erro ao definir ${envVar.split('=')[0]}`);
            }
        });
        
        // Deploy
        console.log('\n🚀 Iniciando deploy...');
        execSync('railway up --yes', { stdio: 'inherit' });
        
        console.log('\n✅ Deploy concluído com sucesso!');
        
        // Obter URL do projeto
        try {
            const url = execSync('railway status --json', { encoding: 'utf8' });
            const status = JSON.parse(url);
            if (status.deployment && status.deployment.url) {
                console.log(`🌐 URL do projeto: ${status.deployment.url}`);
            }
        } catch (error) {
            console.log('🌐 Use "railway status" para ver a URL do projeto');
        }
        
    } catch (error) {
        console.error('❌ Erro no deploy:', error.message);
        console.log('\n💡 Soluções:');
        console.log('   1. Verifique se está logado: railway login');
        console.log('   2. Verifique a conexão com internet');
        console.log('   3. Tente novamente em alguns minutos');
        process.exit(1);
    }
}

async function main() {
    try {
        const hasRailwayCLI = await checkRailwayCLI();
        if (!hasRailwayCLI) {
            console.log('❌ Railway CLI é necessário para continuar');
            process.exit(1);
        }
        
        verifyProjectStructure();
        cleanProject();
        createProductionEnv();
        await deployToRailway();
        
        console.log('\n🎉 DEPLOY CONCLUÍDO COM SUCESSO!');
        console.log('==========================================');
        console.log('💡 Próximos passos:');
        console.log('   1. Acesse o dashboard Railway para monitorar');
        console.log('   2. Configure domínio personalizado (opcional)');
        console.log('   3. Configure integrações adicionais (Stripe, OpenAI, etc.)');
        
    } catch (error) {
        console.error('❌ Erro fatal:', error.message);
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { main };