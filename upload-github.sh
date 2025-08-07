#!/bin/bash

echo "🚀 Iniciando upload para GitHub..."

# Entra na pasta
cd vendzz-railway-ultra-compact

# Configura usuário git (necessário)
git config user.email "brunoxkz1337@gmail.com"
git config user.name "brunoxkz1337"

# Cria commit
git commit -m "Initial commit: Vendzz Platform Enterprise - Sistema completo 200k+ usuarios"

# Muda para branch main
git branch -M main

# Faz push
git push -u origin main

echo "✅ Upload concluído para https://github.com/brunoxkz1337/v-platform"