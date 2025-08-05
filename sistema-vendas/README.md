# Sistema de Vendas WhatsApp

## Visão Geral
Sistema completo de gestão de vendas por WhatsApp com controle hierárquico de usuários, acompanhamento de entregas em tempo real e interface otimizada para mobile.

## Características Principais

### 🔐 Sistema de Usuários
- **Admin**: Visão completa de todos os pedidos e vendedores
- **Atendentes**: Acesso apenas aos próprios pedidos

### 📦 Gestão de Pedidos
- **3 Formas de Pagamento**: Logzz, Online, Braip
- **Controle de Status**: Pendente → Preparando → Em Rota → Entregue/Reagendado/Cancelado
- **Confirmação Pós-Entrega**: Sistema de feedback obrigatório

### 🎯 Funcionalidades
- Cadastro rápido de pedidos
- Dashboard em tempo real
- Notificações automáticas
- Relatórios por vendedor
- Timeline de entregas
- Sistema de reagendamento

## Tecnologias
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Database**: SQLite (com migração PostgreSQL preparada)
- **ORM**: Drizzle ORM
- **Auth**: JWT com roles
- **UI**: shadcn/ui + Radix UI

## Estrutura do Banco
- users (admin/atendentes)
- products (catálogo)
- orders (pedidos)
- order_items (itens do pedido)
- order_logs (histórico de status)

## Mobile-First
Interface otimizada para uso em smartphones pelos atendentes em campo.