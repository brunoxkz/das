#!/bin/bash

echo "🚀 Iniciando SAAS COBRAN..."

# Verificar se o diretório existe
if [ ! -d "../saas-cobran" ]; then
    echo "❌ Diretório saas-cobran não encontrado"
    exit 1
fi

# Navegar para o diretório
cd ../saas-cobran

# Instalar dependências se não existirem
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Configurar banco de dados
echo "🗄️  Configurando banco de dados..."
npx prisma generate
npx prisma db push

# Iniciar servidor
echo "🚀 Iniciando servidor..."
npm run dev