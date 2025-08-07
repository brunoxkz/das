#!/bin/bash

echo "🚀 Iniciando B2T Exchange Standalone..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js 14+ primeiro."
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Instale Node.js com npm primeiro."
    exit 1
fi

echo "✅ Node.js $(node --version) detectado"
echo "✅ npm $(npm --version) detectado"

# Instalar dependências se não existirem
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Erro ao instalar dependências"
        exit 1
    fi
else
    echo "✅ Dependências já instaladas"
fi

# Setup do banco se não existir
if [ ! -f "b2t-data.db" ]; then
    echo "💾 Configurando banco de dados SQLite..."
    node setup-db.js
    if [ $? -ne 0 ]; then
        echo "❌ Erro ao configurar banco"
        exit 1
    fi
else
    echo "✅ Banco de dados já configurado"
fi

echo "🔥 Iniciando servidor..."
npm start