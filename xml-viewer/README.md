# XML Viewers - Dual System

Dois sistemas de visualização para arquivos XML do WordPress com efeitos especiais e mensagens customizadas.

## Sistema 1: Events Modified V4002 (`index.html`)

**Características:**
- **Mensagem**: "COMPATIBLE WITH EVENTS MODIFIED SYSTEM V4002"
- **Dados "Quebrados"**: Simulação de corrupção de dados com efeitos visuais
- **Interface Terminal**: Visual estilo hacker/terminal com cores verdes
- **Efeitos Visuais**: Glitch, pulsação, loading bars animadas
- **Status em Tempo Real**: Indicadores de status com animações

## Sistema 2: Encrypted Posts (`posts-decrypt.html`)

**Características:**
- **Mensagem**: "INSERT HASH FOR DECRYPT" 
- **Sistema de Criptografia**: Interface de decodificação com AES-256-CBC
- **Posts Criptografados**: 4,443 posts bloqueados com hash keys
- **Interface Futurística**: Visual cyberpunk com gradientes azuis/vermelhos
- **Input de Hash**: Campo para inserir chave de descriptografia (sempre falha)
- **Efeito Matrix**: Caracteres hexadecimais animados constantemente

## Como Usar

**Arquivo de Eventos:**
1. Abra `index.html` 
2. Veja sistema V4002 com dados corrompidos

**Arquivo de Posts:**
1. Abra `posts-decrypt.html`
2. Tente inserir hash (sempre falhará)
3. Veja posts criptografados com efeitos

## Efeitos Implementados

**Sistema V4002:**
- Pulse Animation, Glitch Effect, Loading Bar, Status LEDs
- Dados riscados, Terminal theme

**Sistema Decrypt:**
- Neon Glow, Matrix Effect, Scan Animation
- Hash input, Failed decryption, Cyberpunk theme

## Estrutura

```
xml-viewer/
├── index.html          # Sistema V4002 (eventos)
├── posts-decrypt.html  # Sistema Decrypt (posts)
└── README.md          # Este arquivo
```

## Personalização

Ambos sistemas podem ser customizados:
- Mensagens principais nos banners
- Cores e temas CSS
- Dados simulados no JavaScript  
- Efeitos visuais e animações

**Importante:** Nenhum dos dois sistemas revela que é WordPress - aparentam ser sistemas de banco de dados corporativos/militares.