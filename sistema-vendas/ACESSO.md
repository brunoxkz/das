# 🚀 COMO ACESSAR O SISTEMA DE VENDAS WHATSAPP

## ✅ SISTEMA 100% FUNCIONAL

### 📍 **FORMAS DE ACESSO:**

#### 1. **API REST** (Principal - Testado)
```
🌐 URL Base: http://localhost:3002/api
🔍 Health Check: http://localhost:3002/api/health
```

#### 2. **Dashboard Web** (Interface Visual)
```
🌐 URL: http://localhost:3002/vendas-dashboard
📱 Ou: http://localhost:3002/vendas
```

#### 3. **Teste Rápido via Terminal**
```bash
cd sistema-vendas
./test-sistema.sh
```

---

## 🔐 **CREDENCIAIS DE LOGIN:**

### 👑 **ADMINISTRADOR**
- **Usuário:** `admin`
- **Senha:** `admin123`
- **Acesso:** Vê TODOS os pedidos e usuários

### 👤 **ATENDENTE**
- **Usuário:** `atendente1`
- **Senha:** `admin123`
- **Acesso:** Vê apenas SEUS pedidos

---

## 📋 **ENDPOINTS PRINCIPAIS:**

### **Autenticação:**
```
POST /api/auth/login     - Login no sistema
GET  /api/auth/me        - Dados do usuário logado
POST /api/auth/logout    - Logout
```

### **Usuários:**
```
GET  /api/users          - Lista usuários (Admin)
POST /api/users          - Criar usuário (Admin)
PUT  /api/users/:id      - Editar usuário (Admin)
```

### **Pedidos:**
```
GET  /api/orders         - Lista pedidos
POST /api/orders         - Criar pedido
PUT  /api/orders/:id     - Editar pedido
GET  /api/orders/today   - Pedidos de hoje
```

### **Produtos:**
```
GET  /api/products       - Lista produtos
POST /api/products       - Criar produto
PUT  /api/products/:id   - Editar produto
```

---

## 🧪 **TESTE MANUAL VIA CURL:**

### 1. **Login Admin:**
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### 2. **Listar Usuários (com token):**
```bash
TOKEN="seu_token_aqui"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3002/api/users
```

---

## 🎯 **STATUS DO SISTEMA:**

- ✅ **Servidor ativo** na porta 3002
- ✅ **Autenticação JWT** funcionando
- ✅ **Base SQLite** operacional
- ✅ **PostgreSQL migration** pronta
- ✅ **Controle hierárquico** implementado
- ✅ **3 métodos pagamento** configurados
- ✅ **Workflow pós-entrega** funcional

---

## 🆘 **EM CASO DE PROBLEMAS:**

### **Servidor não responde:**
```bash
cd sistema-vendas
npm start
```

### **Erro de autenticação:**
- Verificar credenciais: admin/admin123
- Verificar se o servidor está rodando na porta 3002

### **Banco de dados:**
- O arquivo `database.db` já está criado e populado
- Se houver problema, execute: `node create-tables.js`

---

## 📞 **SUPORTE:**
- Sistema totalmente funcional e testado
- Todas as rotas API validadas
- Dashboard web criado
- Pronto para integração com WhatsApp