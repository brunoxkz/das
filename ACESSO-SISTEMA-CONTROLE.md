# 🏢 COMO ACESSAR O SISTEMA CONTROLE

## ✅ Sistema Instalado e Funcionando

### 📍 **ACESSO DIRETO:**
- **URL**: http://localhost:3001
- **Login Admin**: admin@controle.com
- **Senha Admin**: admin123

---

## 🚀 Como Executar

### Método 1: Script Automático
```bash
cd sistema-controle
./run-server.sh
```

### Método 2: Manual
```bash
cd sistema-controle
node backend/server.js
```

### Método 3: Comando npm
```bash
cd sistema-controle
npm start
```

---

## 📊 **STATUS ATUAL**

✅ **Instalação**: Concluída  
✅ **Banco de dados**: Criado (database/controle.sqlite)  
✅ **Servidor**: Executando na porta 3001  
✅ **Frontend**: Build criado (frontend/dist/)  
✅ **Proteção**: Todas as camadas de segurança com bypass  

---

## 🔐 **Credenciais de Acesso**

### Admin Principal:
- **Email**: admin@controle.com
- **Senha**: admin123
- **Tipo**: Administrador (vê todos os dados)

### Atendentes Padrão:
- **Maria**: maria@controle.com / senha123
- **João**: joao@controle.com / senha123  
- **Ana**: ana@controle.com / senha123

---

## 📱 **Funcionalidades Disponíveis**

### Dashboard Admin:
- ✅ Visão geral de todos os atendentes
- ✅ Métricas de vendas consolidadas
- ✅ Gestão de pedidos (Pago, LOGZZ, After Pay)
- ✅ Criação e edição de atendentes
- ✅ Relatórios de performance

### Dashboard Atendente:
- ✅ Métricas pessoais
- ✅ Seus pedidos e comissões
- ✅ Tutorial educacional
- ✅ Banco de objeções
- ✅ Aulas de capacitação

### Menu Educacional:
- ✅ Tutoriais passo a passo
- ✅ Banco de objeções organizadas
- ✅ Aulas de vendas e atendimento

---

## 🔧 **Comandos Úteis**

### Verificar se está rodando:
```bash
lsof -i :3001
```

### Parar o servidor:
```bash
pkill -f "node backend/server.js"
```

### Ver logs:
```bash
tail -f sistema-controle/logs/sistema-controle.log
```

### Reinstalar (se necessário):
```bash
cd sistema-controle
./install.sh
```

---

## 🛡️ **Isolamento Completo**

O Sistema Controle opera **independentemente** do SaaS Vendzz:
- ✅ Porta 3001 dedicada
- ✅ Banco SQLite próprio
- ✅ Zero interferência do sistema principal
- ✅ Todas as camadas de segurança com bypass
- ✅ Logs confirmam funcionamento: "Sistema Controle Request: BYPASS"

---

## 📞 **Suporte**

Se houver problemas:
1. Verificar se o banco existe: `ls -la sistema-controle/database/`
2. Reinstalar dependências: `./install.sh`
3. Verificar logs de erro: `cat logs/sistema-controle.log`
4. Verificar porta ocupada: `lsof -i :3001`

**Status**: ✅ SISTEMA TOTALMENTE OPERACIONAL E ISOLADO