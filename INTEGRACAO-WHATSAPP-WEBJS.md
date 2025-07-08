# Integração WhatsApp Web.js - Guia Completo

## 🎯 Arquitetura Atualizada

### Sistema Principal (localhost:5000)
- **Dashboard Vendzz**: Gera tokens de autenticação para extensão
- **Página WhatsApp Extension**: Interface dedicada para geração de token
- **API Backend**: Endpoints específicos para comunicação com extensão
- **Sistema JWT**: Autenticação segura com tokens de 30 dias

### Chrome Extension
- **Criação de Campanhas**: Todas as campanhas são criadas DENTRO da extensão
- **Automação WhatsApp**: Executa no WhatsApp Web com sidebar fixa
- **Sincronização**: Conecta com localhost:5000 via JWT token
- **Segurança**: Intervalos anti-spam e configurações de segurança

## 🚀 Como Conectar Tudo

### Passo 1: Sistema Principal
```bash
# Sistema já rodando em:
http://localhost:5000

# Verificar funcionamento:
curl http://localhost:5000/api/whatsapp/extension-status
```

### Passo 2: Gerar Token de Conexão
1. **Fazer login** no Vendzz (admin@vendzz.com / admin123)
2. **Acessar menu lateral** → "WhatsApp Extension"
3. **Clicar "Gerar Novo Token"**
4. **Copiar token gerado** (válido por 30 dias)

### Passo 3: Instalar Chrome Extension
1. **Abrir Chrome** → `chrome://extensions/`
2. **Ativar "Modo desenvolvedor"**
3. **"Carregar sem compactação"** 
4. **Selecionar pasta** `chrome-extension-webjs/`
5. **Extensão instalada** ✅

### Passo 4: Configurar Extensão
1. **Abrir WhatsApp Web** (web.whatsapp.com)
2. **Fazer login no WhatsApp**
3. **Sidebar aparece automaticamente**
4. **Configurar token** na extensão
5. **Verificar conexão** ✅

### Passo 5: Criar Primeira Campanha
1. **Na sidebar da extensão** → "Nova Campanha"
2. **Selecionar quiz** disponível
3. **Configurar mensagens** (4+ rotativas)
4. **Ajustar timing** (7-10 segundos)
5. **Ativar campanha** ✅

## 📋 Endpoints da API

### Autenticação
```bash
POST /api/auth/login
Content-Type: application/json
{
  "email": "admin@vendzz.com",
  "password": "admin123"
}
```

### Gerar Token da Extensão
```bash
POST /api/whatsapp/extension-token
Authorization: Bearer <jwt_token>
Content-Type: application/json
{
  "purpose": "chrome_extension"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresAt": "2025-08-07T...",
  "createdAt": "2025-07-08T...",
  "purpose": "chrome_extension",
  "userId": "..."
}
```

### Status da Extensão
```bash
GET /api/whatsapp/extension-status
Authorization: Bearer <extension_token>

Response:
{
  "isConnected": true,
  "isActive": true,
  "phoneCount": 156,
  "lastSync": "2025-07-08T04:21:00.000Z"
}
```

### Dados dos Quizzes para Extensão
```bash
POST /api/extension/quiz-data
Authorization: Bearer <extension_token>
Content-Type: application/json
{
  "quizId": "Qm4wxpfPgkMrwoMhDFNLZ",
  "targetAudience": "all",
  "dateFilter": "2025-07-01"
}
```

## 🛡️ Configurações de Segurança

### Intervalos Recomendados
- **Mínimo**: 7 segundos entre mensagens
- **Máximo**: 10 segundos + aleatorização
- **Total**: 7-10s com variação de 0-3s

### Horários Seguros
- **Início**: 09:00 (horário comercial)
- **Fim**: 18:00 (evitar mensagens noturnas)
- **Pausas**: Fins de semana opcionais

### Limites Diários
- **Máximo**: 100 mensagens/dia
- **Recomendado**: 50-80 mensagens/dia
- **Monitoramento**: Logs em tempo real

### Anti-Spam
- **Mensagens**: Mínimo 4 diferentes
- **Rotação**: Automática entre mensagens
- **Variáveis**: {nome}, {telefone}, {quiz_titulo}

## 🎮 Fluxo de Trabalho

### 1. Preparação (Vendzz)
```
Dashboard → WhatsApp Extension → Gerar Token → Copiar
```

### 2. Instalação (Chrome)
```
Extensions → Dev Mode → Load Unpacked → chrome-extension-webjs/
```

### 3. Conexão (WhatsApp Web)
```
web.whatsapp.com → Login → Sidebar aparece → Configurar token
```

### 4. Campanhas (Extensão)
```
Nova Campanha → Quiz → Mensagens → Timing → Ativar
```

### 5. Monitoramento (Tempo Real)
```
Status: ✅ Conexão ativa
Mensagens: 15 enviadas / 45 agendadas
Próxima: em 7 segundos
```

## 📊 Dados de Teste Disponíveis

### Quizzes Ativos
- **"novo 1 min"** - 3 telefones disponíveis
- **"Quiz Automático 100K"** - Pronto para automação
- **"Quiz de Emagrecimento Rápido"** - Campanhas ativas
- **"Quiz de Produtos Digitais"** - Leads segmentados
- **"Quiz de Investimentos"** - Audiência qualificada

### Telefones de Teste
```javascript
[
  { phone: '11996595909', status: 'abandoned', submittedAt: '2025-07-07T20:57:00.000Z' },
  { phone: '113232333232', status: 'abandoned', submittedAt: '2025-07-07T20:56:37.000Z' },
  { phone: '11995133932', status: 'abandoned', submittedAt: '2025-07-07T20:47:09.000Z' }
]
```

## 🔧 Solução de Problemas

### Extensão Não Conecta
1. **Verificar token** - Gerar novo se expirado
2. **Confirmar URL** - localhost:5000 ativo
3. **Checar console** - Erros de CORS ou auth
4. **Recarregar extensão** - Reboot se necessário

### Mensagens Não Enviam
1. **WhatsApp logado** - Verificar sessão ativa
2. **Números válidos** - 10-15 dígitos apenas
3. **Intervalos corretos** - 7-10s configurados
4. **Sandbox mode** - Desativar se ativo

### Performance Lenta
1. **Cache local** - Limpar dados antigos
2. **Muitas abas** - Fechar WhatsApp Web extras
3. **Memória RAM** - Reiniciar navegador
4. **Conexão** - Verificar internet estável

## ✅ Status Final

### Sistema Principal
- ✅ Backend rodando localhost:5000
- ✅ Frontend com página WhatsApp Extension
- ✅ JWT authentication funcionando
- ✅ Token generation operacional
- ✅ API endpoints respondem corretamente

### Chrome Extension
- ✅ Arquivos preparados em chrome-extension-webjs/
- ✅ Manifest.json configurado
- ✅ Background script operacional
- ✅ Content script para WhatsApp Web
- ✅ Sidebar fixa implementada

### Integração
- ✅ localhost:5000 ↔ Chrome Extension
- ✅ JWT tokens de 30 dias
- ✅ Sincronização bidirecional
- ✅ Status monitoring em tempo real
- ✅ Logs de atividade completos

## 🎯 Próximos Passos

1. **Instalar extensão** Chrome
2. **Gerar primeiro token** no Vendzz
3. **Conectar no WhatsApp Web**
4. **Criar primeira campanha**
5. **Monitorar resultados**

**Sistema 100% pronto para uso em produção!** 🚀