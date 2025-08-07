# ✅ CHECKLIST - Teste da Extensão WhatsApp

## 📋 PRÉ-TESTE (Copiar/Colar)

### Token de Acesso:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IktqY3ROQ09sTTVqY2FmZ0FfZHJWUSIsImVtYWlsIjoiYWRtaW5AdmVuZHp6LmNvbSIsInJvbGUiOiJhZG1pbiIsInBsYW4iOiJlbnRlcnByaXNlIiwiaWF0IjoxNzUxOTU2OTkyLCJleHAiOjE3NTE5NTc4OTJ9.leZzkorKweav_sw-ENG2Zr7iA3_OWBYnqM78FKvWhps
```

### URL do Servidor:
```
https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev
```

## 🔧 INSTALAÇÃO (5 minutos)

### [ ] 1. Preparar Chrome
- [ ] Abrir Chrome
- [ ] Ir para `chrome://extensions/`
- [ ] Ativar "Modo do desenvolvedor"
- [ ] Clicar "Carregar sem compactação"
- [ ] Selecionar pasta `chrome-extension-v2`

### [ ] 2. Configurar Extensão
- [ ] Clicar no ícone da extensão
- [ ] Colar URL do servidor
- [ ] Colar token de acesso
- [ ] Clicar "Salvar Token"
- [ ] Verificar status "✅ Conectado"

### [ ] 3. Abrir WhatsApp Web
- [ ] Ir para `https://web.whatsapp.com`
- [ ] Fazer login no WhatsApp
- [ ] Aguardar sidebar aparecer à direita

## 🎯 TESTE FUNCIONAL (3 minutos)

### [ ] 4. Conectar Sistema
- [ ] Clicar "🔄 Conectar" na sidebar
- [ ] Aguardar carregamento dos arquivos
- [ ] Selecionar arquivo com telefones
- [ ] Verificar contatos carregados

### [ ] 5. Configurar Automação
- [ ] Ativar "Quiz Completos" ✅
- [ ] Ativar "Quiz Abandonados" ✅
- [ ] Delay: 5 segundos
- [ ] Limite: 10 mensagens
- [ ] Configurar mensagens personalizadas

### [ ] 6. Testar Envio
- [ ] Clicar "🚀 Iniciar Automação"
- [ ] Acompanhar logs em tempo real
- [ ] Verificar mensagens sendo enviadas
- [ ] Observar estatísticas atualizando

## 📊 RESULTADOS ESPERADOS

### ✅ O que deve funcionar:
- [ ] Sidebar fixa no WhatsApp Web
- [ ] 10 arquivos disponíveis no dropdown
- [ ] 2 contatos carregados com dados
- [ ] Mensagens personalizadas:
  - "Olá João Silva! Parabéns..."
  - "Oi Maria Santos! Vimos que você..."
- [ ] Logs mostrando progresso
- [ ] Estatísticas: enviadas/falhas/total

### ❌ Problemas possíveis:
- Sidebar não aparece → Recarregar WhatsApp Web
- Erro de conexão → Verificar token/URL
- Contatos vazios → Selecionar outro arquivo
- Mensagens não enviam → Verificar WhatsApp funcionando

## 🎉 SUCESSO = MENSAGENS AUTOMÁTICAS PERSONALIZADAS

Quando funcionar, você verá mensagens sendo enviadas automaticamente no WhatsApp com os nomes reais dos leads:
- João Silva (quiz completo)
- Maria Santos (quiz abandonado)

---

**🚀 PRONTO PARA COMEÇAR O TESTE!**