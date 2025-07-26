#!/bin/bash

echo "🚀 Preparando deploy para Railway..."

# Criar .env para Railway
echo "Creating Railway environment variables..."
cat > .env.railway << EOF
NODE_ENV=production
DATABASE_URL=postgresql://postgres:DQTpWPNOZbFcLHzomqRDkzwwYFEVjpol@yamanote.proxy.rlwy.net:56203/railway
JWT_SECRET=vendzz_jwt_secret_key
JWT_REFRESH_SECRET=vendzz_jwt_refresh_secret_key
TWILIO_ACCOUNT_SID=ACaa795b9b75f0821fc406b3396f797563
TWILIO_AUTH_TOKEN=c0151d44e86da2319fbbe8f33b7426bd
TWILIO_PHONE_NUMBER=+12344373337
STRIPE_SECRET_KEY=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
VITE_STRIPE_PUBLIC_KEY=pk_live_51RjvUsH7sCVXv8oaUNglIZFsJszyxqRDs3OHqQPEAxVRjHToXAM4I2c2wvxdqDF32lJ2mhV0RBVvMLTJTIlnNMX3000jRVnYO9
STRIPE_WEBHOOK_SECRET=whsec_sONTMghN2cWLAWYevrpKm4ucZYors6jW
EOF

# Build do projeto
echo "Building project..."
npm run build

echo "✅ Projeto preparado para Railway!"
echo "📋 Próximos passos:"
echo "1. Fazer upload dos arquivos para Railway"
echo "2. Configurar variáveis de ambiente"
echo "3. Iniciar deploy"