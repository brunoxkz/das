# 🚀 Guia de Instalação - Extensão Chrome WhatsApp Automação

## 📋 Pré-requisitos
- Google Chrome instalado
- WhatsApp Web funcionando
- Token de acesso (será gerado abaixo)

## 🔧 Instalação da Extensão

### Passo 1: Preparar a Extensão
1. Abra o Chrome
2. Digite `chrome://extensions/` na barra de endereços
3. Ative o "Modo do desenvolvedor" (canto superior direito)
4. Clique em "Carregar sem compactação"
5. Selecione a pasta `chrome-extension-v2` do projeto

### Passo 2: Configurar Token de Acesso
1. Clique no ícone da extensão na barra do Chrome
2. Cole o token de acesso gerado (veja seção abaixo)
3. URL do servidor: `https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev`
4. Clique em "Salvar Token"

### Passo 3: Usar no WhatsApp Web
1. Abra https://web.whatsapp.com
2. Faça login normalmente
3. A sidebar da automação aparecerá automaticamente
4. Clique em "🔄 Conectar" para sincronizar
5. Selecione um arquivo de automação
6. Configure as mensagens personalizadas
7. Clique em "🚀 Iniciar Automação"

## 🎯 Funcionalidades Disponíveis

### ✅ Personalização de Mensagens
- Use `{nome}` para inserir o nome do lead
- Use `{email}` para inserir o email
- Use `{idade}` para inserir a idade
- Use `{altura}` para inserir a altura
- Use `{peso}` para inserir o peso

### ✅ Segmentação Inteligente
- **Quiz Completos**: Leads que finalizaram o quiz
- **Quiz Abandonados**: Leads que começaram mas não terminaram
- **Filtro por Data**: Enviar apenas para leads após data específica

### ✅ Controles de Automação
- **Iniciar/Pausar**: Controle total sobre a automação
- **Delay entre Mensagens**: 1-60 segundos (evita spam)
- **Limite Diário**: Máximo de mensagens por dia
- **Estatísticas**: Acompanhe enviadas, falhas e total

## 🎨 Exemplo de Mensagens

### Para Quiz Completos:
```
Olá {nome}! 🎉 

Parabéns por completar nosso quiz! 
Baseado nas suas respostas, temos a solução perfeita para você.

Vamos conversar?
```

### Para Quiz Abandonados:
```
Oi {nome}! 😊

Vimos que você começou nosso quiz mas não finalizou.
Que tal terminar? Leva só 2 minutos!

Te esperamos: [link do quiz]
```

## 📊 Monitoramento
- Logs em tempo real na sidebar
- Estatísticas de envio
- Status de cada mensagem
- Detecção automática de novos leads

## 🔒 Segurança
- Autenticação JWT obrigatória
- Dados isolados por usuário
- Validação de permissões
- Proteção contra spam

## ⚠️ Dicas Importantes
1. Teste primeiro com poucos contatos
2. Use delays maiores para evitar bloqueios
3. Monitore as estatísticas constantemente
4. Mantenha mensagens profissionais
5. Respeite os limites diários do WhatsApp

## 🆘 Solução de Problemas
- **Sidebar não aparece**: Recarregue a página do WhatsApp
- **Erro de conexão**: Verifique o token e URL do servidor
- **Mensagens não enviam**: Verifique se o WhatsApp está funcionando
- **Contatos vazios**: Selecione um arquivo com dados válidos

---

⚡ **Sistema pronto para uso em produção!** ⚡