# 🚀 Instalação do Plugin Vendzz Events Manager

## 📋 Pré-requisitos

Antes de instalar o plugin, certifique-se de que você tem:

- ✅ **WordPress 5.0 ou superior**
- ✅ **PHP 7.4 ou superior**
- ✅ **Events Calendar Pro** (plugin premium) instalado e ativo
- ✅ **MySQL 5.7 ou superior** (ou MariaDB 10.2+)

## 📦 Instalação

### Método 1: Upload via Painel WordPress

1. **Compacte a pasta** `wordpress-events-manager` em um arquivo ZIP
2. **Acesse o painel** WordPress como administrador
3. **Vá para** Plugins → Adicionar novo
4. **Clique em** "Enviar plugin"
5. **Selecione** o arquivo ZIP e clique em "Instalar agora"
6. **Ative** o plugin após a instalação

### Método 2: Upload via FTP

1. **Faça upload** da pasta `wordpress-events-manager` para `/wp-content/plugins/`
2. **Acesse** o painel WordPress como administrador
3. **Vá para** Plugins → Plugins instalados
4. **Encontre** "Vendzz Events Manager" na lista
5. **Clique em** "Ativar"

## ⚙️ Configuração Inicial

### 1. Verificar Dependências

Após a ativação, o plugin verificará automaticamente se:
- O Events Calendar Pro está instalado
- A versão do PHP é compatível
- As permissões necessárias estão disponíveis

### 2. Acessar o Plugin

1. **No painel WordPress**, procure por "Eventos Manager" no menu lateral
2. **Clique** no menu para acessar a interface principal
3. **Verifique** se os eventos do Events Calendar Pro aparecem na lista

## 🔧 Solução de Problemas

### Plugin não ativa

**Problema:** "Não foi possível ativar o plugin porque ele gerou um erro fatal"

**Soluções:**
1. **Verifique** se o Events Calendar Pro está ativo
2. **Confirme** que a versão do PHP é 7.4 ou superior
3. **Teste** executando o arquivo `test-plugin.php` (apenas para desenvolvedores)
4. **Verifique** os logs de erro do WordPress

### Menu não aparece

**Problema:** Menu "Eventos Manager" não aparece no painel

**Soluções:**
1. **Verifique** se você tem permissão de administrador
2. **Confirme** que o plugin está ativo
3. **Desative e reative** o plugin
4. **Limpe** o cache do WordPress se estiver usando

### Eventos não carregam

**Problema:** Lista de eventos aparece vazia

**Soluções:**
1. **Verifique** se existem eventos no Events Calendar Pro
2. **Confirme** que os eventos têm o post_type correto (`tribe_events`)
3. **Teste** os filtros (remova todos os filtros e tente novamente)
4. **Verifique** permissões de banco de dados

## 📊 Funcionalidades Principais

### ✅ O que o plugin faz:
- Lista todos os eventos do Events Calendar Pro
- Permite filtrar por status, tipo e busca textual
- Oferece edição completa de eventos
- Permite republicar eventos (cria cópias)
- Mantém todas as configurações de recorrência
- Interface responsiva e moderna

### ❌ O que o plugin NÃO faz:
- Não substitui o Events Calendar Pro
- Não funciona sem o Events Calendar Pro
- Não cria novos tipos de evento
- Não modifica a funcionalidade original dos eventos

## 🔐 Segurança

O plugin implementa as seguintes medidas de segurança:
- **Nonce verification** em todas as requisições AJAX
- **Verificação de capacidades** do usuário
- **Sanitização** de todos os dados de entrada
- **Escape** de dados de saída
- **Prepared statements** para queries SQL

## 🚨 Suporte

Se você encontrar problemas:

1. **Verifique** os logs de erro do WordPress
2. **Execute** o arquivo `test-plugin.php` (desenvolvedores)
3. **Desative** outros plugins temporariamente para testar conflitos
4. **Entre em contato** com o suporte da Vendzz

## 📞 Contato

- **Email:** suporte@vendzz.com.br
- **Site:** https://vendzz.com.br
- **Telefone:** (11) 99999-9999

---

**Desenvolvido por Vendzz** - Especialistas em WordPress e Marketing Digital