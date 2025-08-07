#!/bin/bash

echo "🚀 DEPLOY AUTOMÁTICO REPLIT → RAILWAY"
echo "===================================="

# Verificar se está no Replit
if [ -z "$REPLIT_ENVIRONMENT" ]; then
    echo "❌ Este script deve ser executado no Replit"
    exit 1
fi

echo "✅ Ambiente Replit detectado"

# Instalar Railway CLI no Replit
echo "📦 Instalando Railway CLI..."
npm install -g @railway/cli

# Verificar instalação
if ! command -v railway &> /dev/null; then
    echo "❌ Erro ao instalar Railway CLI"
    exit 1
fi

echo "✅ Railway CLI instalado com sucesso"

# Configurar token do Railway (será fornecido pelo usuário)
echo "🔐 Para continuar, você precisa:"
echo "1. Ir para: https://railway.app/account/tokens"
echo "2. Criar um novo token"
echo "3. Copiar o token"
echo ""
echo "Cole seu token do Railway aqui:"
read -s RAILWAY_TOKEN

# Configurar token
export RAILWAY_TOKEN=$RAILWAY_TOKEN

# Testar conexão
echo "🔍 Testando conexão com Railway..."
if ! railway whoami; then
    echo "❌ Token inválido ou erro de conexão"
    exit 1
fi

echo "✅ Conectado ao Railway com sucesso!"

# Criar projeto no Railway
echo "📋 Digite o nome do projeto (ex: vendzz-platform):"
read PROJECT_NAME

echo "🔧 Criando projeto no Railway..."
railway new $PROJECT_NAME --template blank

# Configurar variáveis de ambiente
echo "🔧 Configurando variáveis de ambiente..."

# Variáveis básicas
railway variables set NODE_ENV=production
railway variables set PORT=3000

# Verificar se há arquivo .env local
if [ -f ".env" ]; then
    echo "📋 Arquivo .env encontrado, configurando variáveis..."
    
    # Ler variáveis importantes do .env
    while IFS='=' read -r key value; do
        if [[ $key == "STRIPE_SECRET_KEY" ]]; then
            railway variables set STRIPE_SECRET_KEY="$value"
            echo "✅ STRIPE_SECRET_KEY configurado"
        elif [[ $key == "VITE_STRIPE_PUBLIC_KEY" ]]; then
            railway variables set VITE_STRIPE_PUBLIC_KEY="$value"
            echo "✅ VITE_STRIPE_PUBLIC_KEY configurado"
        elif [[ $key == "OPENAI_API_KEY" ]]; then
            railway variables set OPENAI_API_KEY="$value"
            echo "✅ OPENAI_API_KEY configurado"
        elif [[ $key == "DATABASE_URL" ]]; then
            # Para SQLite, usar path local no Railway
            railway variables set DATABASE_URL="file:./vendzz-database.db"
            echo "✅ DATABASE_URL configurado"
        fi
    done < .env
fi

# Configurar banco PostgreSQL (opcional)
echo "🗄️ Deseja usar PostgreSQL do Railway? (y/N):"
read USE_POSTGRES

if [[ $USE_POSTGRES =~ ^[Yy]$ ]]; then
    echo "🔧 Adicionando PostgreSQL..."
    railway add postgresql
    echo "✅ PostgreSQL adicionado"
fi

# Fazer deploy
echo "🚀 Iniciando deploy..."
railway deploy

# Verificar status
echo "📊 Verificando status do deploy..."
railway status

# Obter URL do projeto
echo "🌐 Obtendo URL do projeto..."
PROJECT_URL=$(railway domain)

echo ""
echo "✅ DEPLOY CONCLUÍDO COM SUCESSO!"
echo "================================="
echo "🌐 URL do projeto: $PROJECT_URL"
echo "🔑 Login: admin@vendzz.com"
echo "🔐 Senha: Btts4381!"
echo ""
echo "📊 Para monitorar:"
echo "railway logs --follow"
echo ""
echo "🔧 Para acessar dashboard:"
echo "railway dashboard"