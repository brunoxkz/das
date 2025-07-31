# 📝 Sidebar To-Do Manager - Extensão Chrome/Opera

**Extensão simples e eficiente para gerenciar to-do lists em colunas na sidebar permanente do navegador.**

## 🎯 **Características Principais**

### ✅ **Sidebar Permanente**
- Fica sempre visível quando ativada
- Funciona em todas as abas e sites
- Interface otimizada para sidebar estreita
- Não interfere na navegação

### ⏰ **Sistema Pomodoro Integrado**
- Timer 25min foco + 5min pausa curta (4x)
- Pausa longa de 20min com mensagem "ELEVE SUA ENERGIA"
- Progress visual com dots indicadores
- Ultra-otimizado - consumo mínimo de RAM
- Sons ambientais gerados proceduralmente

### 🎵 **Sons Ambientais (Tipo Noisli)**
- Chuva, Oceano, Floresta, Café, Ruído Branco
- Geração por Web Audio API (sem arquivos)
- Zero consumo de RAM adicional
- Ativação/desativação instantânea

### ✅ **Sistema de Colunas**
- Organização em colunas personalizáveis
- Colunas padrão: "A Fazer", "Fazendo", "Concluído"
- Adicionar/editar/excluir colunas facilmente
- Interface limpa e minimalista

### ✅ **Gestão de Tarefas**
- Adicionar tarefas rapidamente
- Editar tarefas existentes
- Excluir tarefas com confirmação
- Armazenamento local automático

---

## 📦 **INSTALAÇÃO**

### **Passo 1: Preparar os Arquivos**
```bash
1. Baixar todos os arquivos da pasta 'chrome-extension-sidebar'
2. Colocar em uma pasta local (ex: C:\minha-extensao\)
```

### **Passo 2: Carregar no Chrome/Opera**
```bash
1. Abrir Chrome/Opera
2. Ir para chrome://extensions/ (ou opera://extensions/)
3. Ativar "Modo desenvolvedor" (Developer mode)
4. Clicar em "Carregar sem compactação" (Load unpacked)
5. Selecionar a pasta onde estão os arquivos
6. A extensão será carregada e aparecerá na lista
```

### **Passo 3: Ativar a Sidebar**
```bash
1. Clicar no ícone da extensão na barra de ferramentas
2. Clicar em "Abrir Sidebar"
3. A sidebar aparecerá do lado direito
4. Pronto para usar!
```

---

## 🛠 **COMO USAR**

### **Sistema Pomodoro:**
- **Iniciar/Pausar:** Botão ▶️/⏸️ no timer
- **Reset:** Botão ⏹️ para reiniciar ciclo
- **Sons Ambientais:** Botão 🔊 para ativar seletor
- **Ciclos:** 4 dots mostram progresso (25min foco + 5min pausa)
- **Pausa Longa:** Após 4 ciclos = 20min com mensagem energia

### **Gerenciar Colunas:**
- **Adicionar:** Clique em "+ Nova Coluna"
- **Editar:** Click no ícone ✏️ ao lado do título da coluna
- **Excluir:** Click no ícone 🗑️ (com confirmação)

### **Gerenciar Tarefas:**
- **Adicionar:** Clique em "+ Adicionar tarefa" na coluna desejada
- **Editar:** Hover sobre a tarefa e clique no ícone ✏️
- **Excluir:** Hover sobre a tarefa e clique no ícone 🗑️

### **Navegação:**
- A sidebar permanece aberta enquanto navega
- Dados são salvos automaticamente
- Funciona offline

---

## 📁 **ESTRUTURA DE ARQUIVOS**

```
chrome-extension-sidebar/
├── manifest.json          # Configuração da extensão
├── sidebar.html           # Interface principal da sidebar
├── sidebar.js             # Lógica do to-do manager
├── styles.css             # Estilos da interface
├── background.js          # Service worker
├── content.js             # Script de conteúdo
├── popup.html             # Interface do popup
├── popup.js               # Lógica do popup
└── README.md              # Este arquivo
```

---

## 🎨 **FUNCIONALIDADES**

### **Interface Responsiva:**
- Otimizada para sidebar (300px de largura)
- Scroll vertical e horizontal automático
- Animações suaves
- Design limpo e moderno

### **Armazenamento Local:**
- Dados salvos no navegador
- Não requer conta ou login
- Backup automático
- Funciona offline

### **Compatibilidade:**
- ✅ Chrome 88+
- ✅ Opera 74+
- ✅ Edge Chromium
- ✅ Brave Browser

---

## ⚙️ **PERSONALIZAÇÃO**

### **Modificar Colunas Padrão:**
Edite o arquivo `sidebar.js`, função `getDefaultColumns()`:

```javascript
getDefaultColumns() {
    return [
        {
            id: 'backlog',
            title: 'Backlog',
            tasks: []
        },
        {
            id: 'todo',
            title: 'A Fazer',
            tasks: []
        },
        // Adicione mais colunas aqui
    ];
}
```

### **Modificar Estilos:**
Edite o arquivo `styles.css` para personalizar:
- Cores da interface
- Tamanhos de fonte
- Espaçamentos
- Animações

---

## 🐛 **TROUBLESHOOTING**

### **Sidebar não abre:**
- Verifique se a extensão está ativada
- Recarregue a extensão em chrome://extensions/
- Tente fechar e abrir o navegador

### **Dados não são salvos:**
- Verifique se há espaço de armazenamento
- Limpe dados antigos em chrome://settings/content/all
- Reinstale a extensão se necessário

### **Interface quebrada:**
- Recarregue a página da sidebar
- Verifique se todos os arquivos estão presentes
- Tente desativar outras extensões

---

## 🔧 **DESENVOLVIMENTO**

### **Para Desenvolvedores:**
```javascript
// Debug no console da sidebar
// Abrir DevTools: F12 > Sources > chrome-extension://[id]

// Verificar dados salvos
chrome.storage.local.get(['todoColumns'], console.log);

// Limpar dados
chrome.storage.local.clear();
```

### **Modificações:**
- Todos os arquivos são editáveis
- Recarregar extensão após mudanças
- Testar em modo desenvolvedor primeiro

---

## 📋 **FUNCIONALIDADES FUTURAS**

### **Possíveis Melhorias:**
- [ ] Drag & drop entre colunas
- [ ] Categorias coloridas
- [ ] Filtros e busca
- [ ] Exportar/importar dados
- [ ] Sincronização em nuvem
- [ ] Atalhos de teclado
- [ ] Notificações
- [ ] Temas personalizados

---

## ⚖️ **LICENÇA**

Extensão de uso livre para projetos pessoais e comerciais.

### **Uso Permitido:**
- ✅ Uso pessoal ilimitado
- ✅ Modificações permitidas
- ✅ Distribuição permitida
- ✅ Uso comercial permitido

---

## 🎯 **CONCLUSÃO**

Esta extensão oferece uma solução **simples e eficiente** para gerenciar tarefas diretamente na sidebar do navegador. Com **interface minimalista** e **funcionalidade completa**, é ideal para produtividade pessoal e profissional.

**Desenvolvido por:** Vendzz Development  
**Data:** Janeiro 2025  
**Versão:** 1.0  
**Compatível:** Chrome, Opera, Edge, Brave