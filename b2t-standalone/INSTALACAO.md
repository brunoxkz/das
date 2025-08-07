# 🚀 B2T Exchange - Guia de Instalação

## ✅ PROJETO PRONTO PARA PRODUÇÃO

Este é o site B2T Exchange completo e independente, 100% idêntico ao B2C2.com original.

### 📦 O QUE ESTÁ INCLUÍDO

**✅ Site Completo**
- Design 100% idêntico ao B2C2.com
- Gradientes roxos autênticos (#a91fb5 → #8b5aa6 → #6b4895)
- Carrossel com 12 empresas (Goldman, Citadel, Binance, etc.)
- Sistema de edição inline (clique para editar)
- Totalmente responsivo (mobile-first)

**✅ Admin Panel**
- 8 seções categorizadas
- Edição em tempo real
- Sincronização automática
- Interface intuitiva

**✅ Backend SQLite**
- Banco independente (b2t-data.db)
- API REST completa
- Auto-setup de tabelas
- Dados padrão incluídos

---

## 🔧 COMO INSTALAR

### 1️⃣ Instalar Node.js (se não tiver)
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Windows: baixar de https://nodejs.org/
# Mac: brew install node
```

### 2️⃣ Extrair e configurar
```bash
# Extrair o arquivo ZIP
unzip b2t-exchange-standalone.zip
cd b2t-standalone

# Método 1: Script automático (RECOMENDADO)
chmod +x start.sh
./start.sh

# Método 2: Manual
npm install
node setup-db.js
npm start
```

### 3️⃣ Acessar o site
- **Site principal**: http://localhost:3000
- **Admin panel**: http://localhost:3000/admin
- **Health check**: http://localhost:3000/health

---

## 🌐 DEPLOY EM HOSPEDAGEM

### VPS/Servidor (Ubuntu/Debian)
```bash
# 1. Enviar arquivos
scp -r b2t-standalone usuario@servidor.com:/var/www/

# 2. Conectar no servidor
ssh usuario@servidor.com
cd /var/www/b2t-standalone

# 3. Instalar e executar
sudo apt update
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install
node setup-db.js

# 4. Executar com PM2 (recomendado)
sudo npm install -g pm2
pm2 start server.js --name "b2t-exchange"
pm2 startup
pm2 save
```

### Heroku
```bash
# 1. Instalar Heroku CLI
# 2. Na pasta do projeto:
git init
git add .
git commit -m "Initial commit"
heroku create meu-b2t-site
git push heroku main
```

### Railway/Render
1. Fazer upload dos arquivos
2. Configurar comando de start: `npm start`
3. Deploy automático

### Docker
```bash
# Na pasta do projeto
docker build -t b2t-exchange .
docker run -p 3000:3000 b2t-exchange
```

---

## ⚙️ CONFIGURAÇÕES

### Variáveis de Ambiente
```bash
PORT=3000                # Porta do servidor
NODE_ENV=production      # Ambiente
DATABASE_PATH=./b2t-data.db  # Caminho do banco
```

### Domínio Personalizado
Para usar seu próprio domínio, configure o proxy reverso:

**Nginx:**
```nginx
server {
    listen 80;
    server_name meudominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🔧 PROBLEMAS COMUNS

### Erro: "Cannot find module"
```bash
rm -rf node_modules
npm install
```

### Erro: "Port already in use"
```bash
# Mudar porta
PORT=3001 npm start

# Ou matar processo
sudo lsof -ti:3000 | xargs kill -9
```

### Erro: "Database locked"
```bash
rm b2t-data.db
node setup-db.js
```

### Permissões no Linux
```bash
sudo chown -R $USER:$USER .
chmod +x start.sh
```

---

## 📊 MONITORAMENTO

### Logs em Tempo Real
```bash
# Com PM2
pm2 logs b2t-exchange

# Direto
node server.js | tee server.log
```

### Health Check
```bash
curl http://localhost:3000/health
```

### Backup do Banco
```bash
cp b2t-data.db b2t-data-backup-$(date +%Y%m%d).db
```

---

## 🚀 RECURSOS AVANÇADOS

### SSL/HTTPS
Use Cloudflare ou configure Nginx com Let's Encrypt.

### CDN
Configure CloudFlare para acelerar carregamento global.

### Scaling
Para alto tráfego, use load balancer + múltiplas instâncias.

---

## 📞 SUPORTE

✅ **Funcionalidades Testadas:**
- Site responsivo
- Admin panel
- API endpoints
- Sistema de edição
- SQLite database
- Auto-setup
- Docker support

🆘 **Em caso de dúvidas:**
1. Verificar logs do servidor
2. Testar endpoint `/health`
3. Reinstalar dependências
4. Verificar versão do Node.js (14+)

---

**B2T Exchange v1.0.0**  
🚀 Pronto para produção | 💾 SQLite | 🔧 Auto-configuração