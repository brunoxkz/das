#!/bin/bash

echo "🚀 SETUP AUTOMÁTICO VENDZZ PLATFORM NO CODESPACES"
echo "================================================="

# Verificar se o arquivo ZIP existe
if [ -f "vendzz-download.zip" ]; then
    echo "✅ Arquivo vendzz-download.zip encontrado"
    
    # Fazer backup dos arquivos atuais (se existirem)
    if [ -d "backup-$(date +%Y%m%d)" ]; then
        rm -rf "backup-$(date +%Y%m%d)"
    fi
    
    echo "📦 Fazendo backup dos arquivos atuais..."
    mkdir -p "backup-$(date +%Y%m%d)"
    cp -r * "backup-$(date +%Y%m%d)/" 2>/dev/null || true
    
    # Limpar diretório (manter apenas o ZIP e backup)
    echo "🧹 Limpando diretório atual..."
    find . -maxdepth 1 -type f ! -name "vendzz-download.zip" ! -name "setup-codespaces.sh" -delete
    find . -maxdepth 1 -type d ! -name "." ! -name ".git" ! -name "backup-*" -exec rm -rf {} + 2>/dev/null || true
    
    # Extrair arquivo
    echo "📂 Extraindo vendzz-download.zip..."
    unzip -q vendzz-download.zip
    
    # Verificar se criou uma pasta ou extraiu direto
    if [ -d "vendzz-download" ]; then
        echo "📁 Movendo arquivos da pasta vendzz-download para raiz..."
        cp -r vendzz-download/* . 2>/dev/null || true
        cp -r vendzz-download/.* . 2>/dev/null || true
        rm -rf vendzz-download
    fi
    
    # Remover arquivo ZIP
    rm vendzz-download.zip
    
    echo "✅ Arquivos extraídos com sucesso!"
    
elif [ -f "vendzz-github-clean.zip" ]; then
    echo "✅ Arquivo vendzz-github-clean.zip encontrado"
    
    # Processo similar para o arquivo clean
    echo "📦 Fazendo backup dos arquivos atuais..."
    mkdir -p "backup-$(date +%Y%m%d)"
    cp -r * "backup-$(date +%Y%m%d)/" 2>/dev/null || true
    
    echo "🧹 Limpando diretório atual..."
    find . -maxdepth 1 -type f ! -name "vendzz-github-clean.zip" ! -name "setup-codespaces.sh" -delete
    find . -maxdepth 1 -type d ! -name "." ! -name ".git" ! -name "backup-*" -exec rm -rf {} + 2>/dev/null || true
    
    echo "📂 Extraindo vendzz-github-clean.zip..."
    unzip -q vendzz-github-clean.zip
    
    if [ -d "vendzz-github-clean" ]; then
        echo "📁 Movendo arquivos da pasta para raiz..."
        cp -r vendzz-github-clean/* . 2>/dev/null || true
        cp -r vendzz-github-clean/.* . 2>/dev/null || true
        rm -rf vendzz-github-clean
    fi
    
    rm vendzz-github-clean.zip
    echo "✅ Arquivos extraídos com sucesso!"
    
else
    echo "❌ Nenhum arquivo ZIP do Vendzz encontrado!"
    echo "📋 Arquivos disponíveis:"
    ls -la
    echo ""
    echo "💡 Certifique-se de fazer upload do vendzz-download.zip para o repositório GitHub primeiro."
    exit 1
fi

# Verificar se package.json existe
if [ -f "package.json" ]; then
    echo "📦 Instalando dependências npm..."
    npm install
    
    echo "🗄️ Configurando banco de dados..."
    if [ -f "drizzle.config.ts" ]; then
        npm run db:push
    else
        echo "⚠️ drizzle.config.ts não encontrado, pulando configuração do banco"
    fi
    
    echo "🚀 Iniciando sistema..."
    echo ""
    echo "✅ SETUP COMPLETO!"
    echo "================================================="
    echo "🔑 Login Admin: admin@vendzz.com"
    echo "🔐 Senha Admin: Btts4381!"
    echo "================================================="
    echo ""
    echo "Para iniciar o sistema execute:"
    echo "npm run dev"
    echo ""
    
else
    echo "❌ package.json não encontrado após extração!"
    echo "📋 Conteúdo atual do diretório:"
    ls -la
fi