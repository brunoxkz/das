@echo off
echo 🚀 INSTALADOR AUTOMATICO RAILWAY - VENDZZ PLATFORM
echo ================================================
echo.

echo 📋 Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado!
    echo 💡 Instale Node.js: https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js encontrado
echo.

echo 🚀 Executando deploy automatizado...
node railway-auto-deploy.js

echo.
echo ✅ Deploy concluído!
pause