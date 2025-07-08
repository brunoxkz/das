# Vendzz Events Manager - Plugin WordPress

## 📋 Descrição

Plugin completo para gerenciar eventos do **Events Calendar Pro** no WordPress. Permite ler, editar e republicar eventos com funcionalidade completa de recorrência, acessando diretamente os dados do banco de dados do WordPress.

## 🚀 Recursos Principais

### ✅ Leitura Completa de Eventos
- **Acesso direto ao banco de dados** do WordPress
- **Lê todas as variáveis** criadas pelo Events Calendar Pro
- **Eventos únicos e recorrentes** com metadados completos
- **Filtros avançados** (status, tipo, busca textual)
- **Paginação otimizada** para sites com muitos eventos

### ✅ Edição de Eventos
- **Interface intuitiva** com modal de edição
- **Campos principais**: título, descrição, datas, local, status
- **Validação de dados** em tempo real
- **Preservação de configurações** de recorrência
- **Suporte a venues** (locais) do Events Calendar Pro

### ✅ Republicação de Eventos
- **Duplicação inteligente** com cópia de metadados
- **Preserva configurações** de recorrência
- **Cria novos eventos** baseados nos originais
- **Mantém relacionamentos** com venues e categorias

## 🗄️ Estrutura do Banco de Dados

O plugin acessa as seguintes tabelas do WordPress:

### Tabela Principal: `wp_posts`
```sql
post_type = 'tribe_events'  -- Eventos principais
post_type = 'tribe_venue'   -- Locais dos eventos
```

### Metadados dos Eventos: `wp_postmeta`
```sql
-- Datas e horários
_EventStartDate     -- Data/hora de início
_EventEndDate       -- Data/hora de fim
_EventAllDay        -- Evento o dia todo (true/false)
_EventTimezone      -- Fuso horário

-- Localização
_EventVenueID       -- ID do local
_EventAddress       -- Endereço
_EventCity          -- Cidade
_EventState         -- Estado
_EventZip           -- CEP
_EventCountry       -- País

-- Recorrência (Events Calendar Pro)
_EventRecurrence    -- Configurações de recorrência
_EventStartDateUTC  -- Data de início UTC
_EventEndDateUTC    -- Data de fim UTC

-- Organização
_EventOrganizerID   -- ID do organizador
_EventCost          -- Custo do evento
_EventCurrencySymbol -- Símbolo da moeda
_EventURL           -- URL do evento
```

### Taxonomias
```sql
-- Categorias de eventos
taxonomy = 'tribe_events_cat'

-- Tags de eventos  
taxonomy = 'post_tag'
```

## 🛠️ Instalação

1. **Faça upload** da pasta `wordpress-events-manager` para `/wp-content/plugins/`
2. **Ative o plugin** no painel do WordPress
3. **Verifique** se o Events Calendar Pro está instalado
4. **Acesse** o menu "Eventos Manager" no admin

## 📊 Funcionalidades do Plugin

### 1. **Dashboard de Eventos**
- Lista todos os eventos do site
- Filtros por status (publicado, rascunho, privado)
- Filtros por tipo (únicos, recorrentes)
- Busca textual em títulos e descrições
- Paginação para performance

### 2. **Visualização de Dados**
O plugin lê e exibe:
- **Título e descrição** do evento
- **Status de publicação** (publicado, rascunho, privado)
- **Datas de início e fim** com horários
- **Local/Venue** associado
- **Informações de recorrência** detalhadas
- **Metadados personalizados** do Events Calendar Pro

### 3. **Edição de Eventos**
Modal completo com:
- **Formulário validado** para edição
- **Campos obrigatórios** marcados
- **Validação de datas** (fim > início)
- **Atualização de metadados** automática
- **Preservação de configurações** de recorrência

### 4. **Republicação de Eventos**
- **Cria novo evento** baseado no original
- **Copia todos os metadados** essenciais
- **Preserva configurações** de recorrência
- **Mantém relacionamentos** com venues
- **Adiciona sufixo** "- Republicado" no título

## 🔧 Configuração Técnica

### Hooks e Filtros Utilizados
```php
// Hooks principais
add_action('init', 'init');
add_action('admin_menu', 'add_admin_menu');
add_action('admin_enqueue_scripts', 'admin_enqueue_scripts');

// AJAX endpoints
add_action('wp_ajax_vendzz_get_events', 'ajax_get_events');
add_action('wp_ajax_vendzz_update_event', 'ajax_update_event');
add_action('wp_ajax_vendzz_republish_event', 'ajax_republish_event');
add_action('wp_ajax_vendzz_get_event_details', 'ajax_get_event_details');
```

### Queries Utilizadas
```php
// Buscar eventos
$args = array(
    'post_type' => 'tribe_events',
    'posts_per_page' => 20,
    'meta_query' => array(
        array(
            'key' => '_EventStartDate',
            'value' => date('Y-m-d H:i:s'),
            'compare' => '>='
        )
    ),
    'orderby' => 'meta_value',
    'meta_key' => '_EventStartDate',
    'order' => 'ASC'
);
```

## 🎯 Casos de Uso

### 1. **Gestão de Eventos Corporativos**
- Visualizar todos os eventos da empresa
- Editar informações rapidamente
- Republicar eventos recorrentes

### 2. **Eventos com Recorrência**
- Gerenciar eventos semanais/mensais
- Editar série de eventos
- Republicar com novas datas

### 3. **Migração de Eventos**
- Republicar eventos antigos
- Atualizar informações em lote
- Manter histórico de eventos

## 📱 Interface do Usuário

### Filtros Disponíveis
- **Busca textual**: Por título ou descrição
- **Status**: Publicado, Rascunho, Privado
- **Tipo**: Únicos, Recorrentes, Todos

### Ações por Evento
- **✏️ Editar**: Abrir modal de edição
- **🔄 Republicar**: Criar cópia do evento
- **👁️ Ver**: Visualizar no frontend

### Informações Exibidas
- **Título** e ID do evento
- **Status** com indicador visual
- **Datas** de início e fim formatadas
- **Local/Venue** quando disponível
- **Tipo de recorrência** com detalhes

## 🔒 Segurança

### Validações Implementadas
- **Nonce verification** em todas as requisições AJAX
- **Capability checks** para 'manage_options'
- **Data sanitization** em todos os inputs
- **SQL injection protection** via WordPress APIs

### Logs de Atividade
O plugin cria uma tabela de logs para rastrear:
- **Ações realizadas** (edição, republicação)
- **Usuário** que realizou a ação
- **Data e hora** da ação
- **Detalhes** da modificação

## 🚨 Requisitos

### Obrigatórios
- **WordPress 5.0+**
- **PHP 7.4+**
- **Events Calendar Pro** (plugin premium)

### Recomendados
- **MySQL 5.7+** ou **MariaDB 10.2+**
- **PHP 8.0+** para melhor performance
- **Servidor com pelo menos 512MB RAM**

## 🐛 Solução de Problemas

### Plugin não aparece no menu
1. Verificar se o Events Calendar Pro está ativo
2. Verificar permissões do usuário (capability 'manage_options')
3. Verificar logs de erro do WordPress

### Eventos não aparecem
1. Verificar se existem eventos no banco
2. Verificar filtros aplicados
3. Verificar se o post_type 'tribe_events' existe

### Erro ao editar eventos
1. Verificar permissões de escrita no banco
2. Verificar se os metadados existem
3. Verificar validação de datas

## 📞 Suporte

Para suporte técnico:
- **Email**: suporte@vendzz.com.br
- **Site**: https://vendzz.com.br
- **Documentação**: Incluída no plugin

## 📄 Licença

Este plugin é licenciado sob GPL v2 ou superior.

---

**Desenvolvido por Vendzz** - Soluções completas para WordPress e marketing digital.