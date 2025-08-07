# B2T Exchange - Site Standalone

Site B2T Exchange independente com banco SQLite próprio para hospedagem externa.

## 🚀 Instalação e Uso

### 1. Instalar dependências
```bash
npm install
```

### 2. Iniciar servidor
```bash
npm start
```

O servidor será iniciado em: http://localhost:3000

## 📡 Endpoints

- **Site Principal**: `GET /`
- **Admin Panel**: `GET /admin`
- **Health Check**: `GET /health`
- **API Conteúdo**: `GET /api/content/:section`
- **Salvar Conteúdo**: `POST /api/content/:section/:field`

## 🎯 Funcionalidades

✅ **Site B2T Exchange 100% Funcional**
- Design idêntico ao B2C2.com original
- Gradientes roxos autênticos
- Carrossel com 12 empresas rotativas
- Sistema de edição inline
- Responsivo mobile-first

✅ **Admin Panel Completo**
- 8 seções categorizadas
- Edição em tempo real
- Sincronização automática
- Sistema localStorage

✅ **Backend SQLite**
- Banco independente (b2t-data.db)
- API REST completa
- Auto-criação de tabelas
- Dados padrão automáticos

## 💾 Banco de Dados

O sistema cria automaticamente:
- Arquivo: `b2t-data.db`
- Tabela: `site_content`
- Dados padrão inseridos na primeira execução

## 🌐 Deploy

### Replit/Railway/Heroku
```bash
git clone <repo>
cd b2t-standalone
npm install
npm start
```

### VPS/Servidor
```bash
# Instalar Node.js 14+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Deploy
git clone <repo>
cd b2t-standalone
npm install
npm start
```

### Docker (Opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 Configuração

### Variáveis de Ambiente
```bash
PORT=3000          # Porta do servidor
NODE_ENV=production # Ambiente
```

### Estrutura de Arquivos
```
b2t-standalone/
├── server.js         # Servidor Express + SQLite
├── package.json      # Dependências
├── README.md         # Documentação
├── public/
│   ├── index.html    # Site principal
│   ├── admin.html    # Admin panel
│   └── images-b2t/   # Imagens
└── b2t-data.db       # Banco SQLite (criado automaticamente)
```

## 📊 Monitoramento

- **Logs**: Console do servidor
- **Health**: `GET /health`
- **Database**: SQLite browser ou Adminer

## 🔒 Segurança

- Sanitização de inputs
- Validação de dados
- CORS configurado
- Headers de segurança

## 🆘 Suporte

Em caso de problemas:
1. Verificar logs do servidor
2. Testar endpoint `/health`
3. Verificar permissões de arquivo
4. Reinstalar dependências: `rm -rf node_modules && npm install`

---

**B2T Exchange** - Digital Asset Pioneer
Versão: 1.0.0 | Node.js 14+ | SQLite 3