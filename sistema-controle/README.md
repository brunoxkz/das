# Sistema Controle - Atendentes

Sistema completo e independente para gerenciamento de atendentes e operações cash-on-delivery.

## 🚀 Características

- **100% Independente**: Sistema separado do SaaS principal
- **Dual Access**: Dashboard individual para atendentes + Painel admin completo
- **Sistema de Pedidos**: Pago, LOGZZ, After Pay com filtros avançados
- **Autenticação Simples**: Login básico sem complexidade (uso interno)
- **Menu Educacional**: Tutoriais, objeções e aulas para atendentes
- **Dashboard Admin**: Visão completa de todos os atendentes e negócio

## 📦 Estrutura

```
sistema-controle/
├── backend/
│   ├── server.js          # Servidor Express principal
│   └── database.js        # Conexão SQLite e statements
├── frontend/
│   ├── src/
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── components/    # Componentes reutilizáveis
│   │   └── context/       # Context de autenticação
│   └── dist/              # Build de produção
├── database/
│   └── controle.sqlite    # Banco SQLite independente
├── schema.sql             # Schema do banco
└── package.json           # Dependências do projeto
```

## 🛠 Instalação

### 1. Instalar Dependências

```bash
cd sistema-controle
npm run install-all
```

### 2. Inicializar Banco

O banco SQLite será criado automaticamente na primeira execução.

### 3. Executar Sistema

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

## 🔑 Acesso Padrão

**Admin:**
- Email: admin@controle.com
- Senha: admin123

## 📱 Funcionalidades

### Dashboard Atendente
- Vendas do dia e mês
- Comissões calculadas automaticamente
- Lista de pedidos com filtros
- Criação de novos pedidos
- Status: Pendente, Agendado, Em Rota, Entregue, Pago, Cancelado

### Dashboard Admin
- Visão geral de todos os atendentes
- Performance individual por atendente
- Criação de novos atendentes
- Métricas consolidadas do negócio
- Filtro por atendente específico

### Categorias de Pedidos
- **Pago**: Pedidos já pagos
- **LOGZZ**: Entregas agendadas com pagamento na entrega
- **After Pay**: Vendas com pagamento após entrega

### Menu Educacional
- **Tutoriais**: Guias do sistema e estratégias
- **Objeções**: Manual completo de respostas para objeções
- **Aulas**: Academia de vendas com módulos estruturados

## 🔧 Configurações

### Banco de Dados
- SQLite local: `database/controle.sqlite`
- Auto-inicialização na primeira execução
- Tabelas: usuarios, pedidos, logs_sistema

### Autenticação
- JWT simples para uso interno
- Senhas criptografadas com bcrypt
- Tipos de usuário: admin, atendente

### Performance
- Indices otimizados
- WAL mode para melhor concorrência
- Statements preparados

## 📊 Especificações do Negócio

- **3 atendentes** por padrão
- **~50 leads/dia** processados
- **3-4 vendas diárias** em média
- **10% comissão** sobre vendas pagas
- **Workflow**: Criação → Agendamento → Lembretes → Confirmação

## 🔒 Segurança

- Autenticação JWT
- Senhas criptografadas
- Logs de auditoria
- Validação de dados
- Sanitização de inputs

## 🚀 Deploy

1. Build do frontend: `npm run build`
2. Configurar servidor Node.js
3. Variáveis de ambiente opcionais
4. Executar: `npm start`

## 📝 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Criar atendente (admin only)

### Dashboard
- `GET /api/dashboard/:atendenteId?` - Métricas

### Pedidos
- `GET /api/pedidos/:atendenteId?` - Listar pedidos
- `POST /api/pedidos` - Criar pedido
- `PUT /api/pedidos/:id` - Atualizar status

### Admin
- `GET /api/atendentes` - Listar atendentes (admin only)

## 🔄 Workflow de Pedidos

1. **Criação**: Atendente cria pedido no sistema
2. **Categorização**: Pago, LOGZZ ou After Pay
3. **Agendamento**: Para LOGZZ, define data/período
4. **Acompanhamento**: Status updates conforme progresso
5. **Finalização**: Pagamento confirmado

## 📈 Métricas Rastreadas

- Vendas por dia/mês
- Comissões calculadas
- Entregas agendadas
- Performance por atendente
- Taxa de conversão por categoria

## 🎯 Objetivos

- Gestão eficiente de atendentes
- Controle completo de pedidos
- Educação e treinamento contínuo
- Visão administrativa abrangente
- Simplicidade de uso

---

**Sistema desenvolvido para operações cash-on-delivery com foco em simplicidade e eficiência.**