#!/bin/bash

echo "🚀 Instalando Sistema Controle - Atendentes"
echo "==========================================="

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js primeiro."
    exit 1
fi

# Instalar dependências do backend
echo "📦 Instalando dependências do backend..."
npm install

# Navegar para o frontend e instalar dependências
echo "📦 Instalando dependências do frontend..."
cd frontend
npm install

# Voltar para o diretório raiz
cd ..

# Criar build do frontend
echo "🔨 Criando build do frontend..."
cd frontend
npm run build
cd ..

# Verificar se o banco SQLite foi criado
echo "🗄️ Verificando banco de dados..."
if [ ! -f "database/controle.sqlite" ]; then
    echo "📝 Banco de dados será criado automaticamente na primeira execução"
fi

echo ""
echo "✅ Instalação concluída com sucesso!"
echo ""
echo "🚀 Para executar o sistema:"
echo "   npm start (produção)"
echo "   npm run dev (desenvolvimento)"
echo ""
echo "📱 Acesso padrão:"
echo "   URL: http://localhost:3001"
echo "   Admin: admin@controle.com / admin123"
echo ""
echo "📖 Consulte o README.md para mais informações"