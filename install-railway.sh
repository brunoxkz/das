#!/bin/bash

echo "🚀 INSTALADOR AUTOMATICO RAILWAY - VENDZZ PLATFORM"
echo "================================================"
echo ""

# Verificar Node.js
echo "📋 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado!"
    echo "💡 Instale Node.js: https://nodejs.org"
    exit 1
fi
echo "✅ Node.js encontrado"
echo ""

# Tornar executável
chmod +x railway-auto-deploy.js

# Executar deploy
echo "🚀 Executando deploy automatizado..."
node railway-auto-deploy.js

echo ""
echo "✅ Deploy concluído!"