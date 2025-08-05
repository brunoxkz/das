# XML Event System Viewer V4002

Sistema de visualização para arquivo XML do WordPress com efeitos de "dados corrompidos" e mensagem de compatibilidade.

## Características

- **Mensagem de Compatibilidade**: "COMPATIBLE WITH EVENTS MODIFIED SYSTEM V4002"
- **Dados "Quebrados"**: Simulação de corrupção de dados com efeitos visuais
- **Interface Terminal**: Visual estilo hacker/terminal com cores verdes
- **Efeitos Visuais**: Glitch, pulsação, loading bars animadas
- **Status em Tempo Real**: Indicadores de status com animações

## Como Usar

1. Abra o arquivo `index.html` em qualquer navegador
2. O sistema carregará automaticamente com a mensagem de compatibilidade
3. Os dados do XML serão exibidos com efeitos de "corrupção"

## Efeitos Implementados

- **Pulse Animation**: Banner de compatibilidade piscando
- **Glitch Effect**: Dados corrompidos com efeito de tremulação
- **Loading Bar**: Barra de progresso infinita
- **Status Indicators**: LEDs coloridos piscando
- **Broken Data**: Texto riscado e colorido indicando corrupção
- **Terminal Theme**: Interface estilo linha de comando

## Estrutura

```
xml-viewer/
├── index.html          # Arquivo principal
└── README.md          # Este arquivo
```

## Personalização

Você pode modificar:
- Mensagem de compatibilidade na linha 106
- Cores do tema nas variáveis CSS
- Dados dos eventos no array JavaScript (linha 163)
- Efeitos visuais nos keyframes CSS

O sistema foi criado para dar a impressão de que está processando um arquivo XML corrompido com sistema de eventos modificado V4002.