# Vendzz Pomodoro Timer - Chrome Extension

Uma extensão Chrome completa para gerenciamento de tempo usando a técnica Pomodoro.

## Recursos

- ⏰ Timer Pomodoro configurável
- 🔔 Notificações desktop
- 📊 Estatísticas de produtividade
- 🎯 Três modos: Trabalho, Pausa Curta, Pausa Longa
- 💾 Sincronização de dados via Chrome Storage
- 🌟 Interface moderna com design Vendzz

## Instalação

1. Baixe todos os arquivos desta pasta
2. Abra o Chrome e vá para `chrome://extensions/`
3. Ative o "Modo do desenvolvedor" no canto superior direito
4. Clique em "Carregar sem compactação"
5. Selecione esta pasta
6. A extensão será instalada e aparecerá na barra de ferramentas

## Como Usar

1. Clique no ícone da extensão na barra de ferramentas
2. Configure os tempos (padrão: 25min trabalho, 5min pausa, 15min pausa longa)
3. Selecione o modo desejado
4. Clique em "Iniciar"
5. Trabalhe ou descanse conforme o timer
6. Receba notificações quando completar cada sessão

## Funcionalidades

### Timer
- Contagem regressiva visual
- Controles de iniciar/pausar/resetar
- Mudança automática entre modos

### Configurações
- Tempo de trabalho personalizável (1-60 minutos)
- Tempo de pausa personalizável (1-30 minutos)
- Tempo de pausa longa personalizável (1-60 minutos)

### Estatísticas
- Pomodoros concluídos hoje
- Total de pomodoros
- Tempo total focado
- Reset automático diário

### Notificações
- Notificações desktop quando timer completa
- Mensagens motivacionais
- Clique na notificação para abrir a extensão

## Tecnologias

- Chrome Extension Manifest V3
- JavaScript ES6+
- Chrome Storage API
- Chrome Notifications API
- Chrome Alarms API

## Arquivos

- `manifest.json` - Configuração da extensão
- `popup.html` - Interface do usuário
- `popup.js` - Lógica do timer e UI
- `background.js` - Script de segundo plano
- `README.md` - Documentação

## Permissões

- `storage` - Para salvar configurações e estatísticas
- `notifications` - Para exibir notificações
- `activeTab` - Para funcionalidade básica da extensão

## Suporte

Esta extensão é parte do ecossistema Vendzz para produtividade e marketing digital.

---
© 2025 Vendzz - Todos os direitos reservados