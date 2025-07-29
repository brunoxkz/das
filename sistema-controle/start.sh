#!/bin/bash

echo "🚀 Iniciando Sistema Controle - Atendentes"
echo "========================================="

# Verificar se as dependências foram instaladas
if [ ! -d "node_modules" ]; then
    echo "❌ Dependências não encontradas. Execute ./install.sh primeiro"
    exit 1
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "❌ Dependências do frontend não encontradas. Execute ./install.sh primeiro"
    exit 1
fi

# Verificar se o build do frontend existe
if [ ! -d "frontend/dist" ]; then
    echo "🔨 Build do frontend não encontrado. Criando..."
    cd frontend
    npm run build
    cd ..
fi

echo "✅ Iniciando servidor na porta 3001..."
echo "📱 Acesse: http://localhost:3001"
echo "👤 Admin: admin@controle.com / admin123"
echo ""

# Iniciar o servidor
npm start