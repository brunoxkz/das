#!/bin/bash

echo "🚀 Iniciando Sistema Controle - Atendentes (Porta 3001)"
echo "=================================================="

# Verificar se já está rodando
if lsof -i :3001 >/dev/null 2>&1; then
    echo "⚠️  Sistema já está rodando na porta 3001"
    echo "📊 Acesse: http://localhost:3001"
    echo "👤 Admin: admin@controle.com / admin123"
    exit 0
fi

# Navegar para o diretório
cd "$(dirname "$0")"

# Verificar dependências
if [ ! -d "node_modules" ]; then
    echo "❌ Dependências não encontradas. Execute ./install.sh primeiro"
    exit 1
fi

# Verificar banco de dados
if [ ! -f "database/controle.sqlite" ]; then
    echo "🗄️ Criando banco de dados..."
    sqlite3 database/controle.sqlite < schema.sql
fi

# Iniciar servidor em background
echo "🚀 Iniciando servidor..."
nohup node backend/server.js > logs/sistema-controle.log 2>&1 &

# Aguardar alguns segundos para inicializar
sleep 3

# Verificar se está rodando
if lsof -i :3001 >/dev/null 2>&1; then
    echo "✅ Sistema Controle iniciado com sucesso!"
    echo ""
    echo "📊 ACESSO:"
    echo "   URL: http://localhost:3001"
    echo "   Admin: admin@controle.com / admin123"
    echo ""
    echo "📝 Log: logs/sistema-controle.log"
    echo "⚠️  Para parar: pkill -f 'node backend/server.js'"
else
    echo "❌ Falha ao iniciar o servidor"
    echo "📝 Verifique o log: logs/sistema-controle.log"
    exit 1
fi