# 🎯 GUIA DO SISTEMA DUAL DE PAGAMENTO VENDZZ

## 📋 Visão Geral

O Vendzz agora oferece **dois gateways de pagamento** integrados, permitindo que você escolha a melhor opção para seu público:

### 🌍 **Stripe (Internacional)**
- **Ideal para**: Clientes internacionais e empresas globais
- **Países**: Estados Unidos, Canadá, Europa, Brasil, México e mais
- **Moedas**: USD, EUR, BRL e outras moedas principais
- **Recursos**: Cartão de crédito, assinaturas, webhooks, trial periods

### 🇧🇷 **Pagar.me (Brasileiro)**
- **Ideal para**: Mercado brasileiro e pagamentos locais
- **Países**: Brasil (com foco em pagamentos locais)
- **Métodos**: Cartão de crédito, boleto, PIX, cartão de débito
- **Recursos**: Validação CPF, endereço brasileiro, moedas locais

---

## 🚀 Como Configurar

### 1. **Variáveis de Ambiente**

Adicione as seguintes variáveis no seu arquivo `.env`:

```bash
# Stripe (Internacional)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret  
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key

# Pagar.me (Brasileiro)
PAGARME_API_KEY=ak_test_your_pagarme_api_key
PAGARME_PUBLIC_KEY=pk_test_your_pagarme_public_key
PAGARME_WEBHOOK_SECRET=your_pagarme_webhook_secret
```

### 2. **Obter Chaves do Stripe**

1. Acesse [Stripe Dashboard](https://dashboard.stripe.com/)
2. Vá em **Developers** > **API Keys**
3. Copie a **Secret Key** (sk_test_...) para `STRIPE_SECRET_KEY`
4. Copie a **Publishable Key** (pk_test_...) para `VITE_STRIPE_PUBLIC_KEY`
5. Configure webhook em **Developers** > **Webhooks**

### 3. **Obter Chaves do Pagar.me**

1. Acesse [Pagar.me Dashboard](https://dashboard.pagar.me/)
2. Vá em **Configurações** > **Chaves API**
3. Copie a **API Key** (ak_test_...) para `PAGARME_API_KEY`
4. Copie a **Public Key** (pk_test_...) para `PAGARME_PUBLIC_KEY`
5. Configure webhook em **Configurações** > **Webhooks**

---

## 🎨 Como Usar

### 1. **Página de Checkout Unificado**

Acesse: `https://seudominio.com/checkout-unificado`

**Fluxo do usuário:**
1. **Seleção de Gateway** - Escolher entre Stripe ou Pagar.me
2. **Dados Pessoais** - Preencher informações básicas
3. **Pagamento** - Inserir dados do cartão
4. **Confirmação** - Assinatura criada com sucesso

### 2. **Integração via API**

```javascript
// Listar gateways disponíveis
const gateways = await fetch('/api/payment-gateways');

// Criar assinatura unificada
const subscription = await fetch('/api/assinatura-unificada', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    gateway: 'stripe', // ou 'pagarme'
    customerData: { ... },
    paymentData: { ... }
  })
});

// Criar assinatura específica do Stripe
const stripeSubscription = await fetch('/api/assinatura-paga', {
  method: 'POST',
  body: JSON.stringify({ ... })
});

// Criar assinatura específica do Pagar.me
const pagarmeSubscription = await fetch('/api/assinatura-pagarme', {
  method: 'POST',
  body: JSON.stringify({ 
    customerData: { ... },
    cardData: { ... }
  })
});
```

---

## 🔧 Endpoints Disponíveis

### **GET /api/payment-gateways**
Lista todos os gateways disponíveis e configurados.

**Resposta:**
```json
{
  "success": true,
  "gateways": [
    {
      "id": "stripe",
      "name": "Stripe",
      "enabled": true,
      "countries": ["US", "BR", "EU"],
      "features": ["credit_card", "subscriptions"],
      "pricing": {
        "setup_fee": 100,
        "monthly_fee": 2990,
        "trial_days": 7
      }
    },
    {
      "id": "pagarme",
      "name": "Pagar.me",
      "enabled": true,
      "countries": ["BR"],
      "features": ["credit_card", "boleto", "pix"],
      "pricing": {
        "setup_fee": 100,
        "monthly_fee": 2990,
        "trial_days": 7
      }
    }
  ]
}
```

### **POST /api/assinatura-unificada**
Cria assinatura com gateway selecionado.

**Parâmetros:**
```json
{
  "gateway": "stripe|pagarme",
  "customerData": { ... },
  "paymentData": { ... }
}
```

### **POST /api/assinatura-pagarme**
Cria assinatura diretamente no Pagar.me.

**Parâmetros:**
```json
{
  "customerData": {
    "name": "João Silva",
    "email": "joao@email.com",
    "document": "12345678901",
    "phone": "11999999999",
    "address": { ... }
  },
  "cardData": {
    "number": "4111111111111111",
    "holder_name": "João Silva",
    "exp_month": "12",
    "exp_year": "2025",
    "cvv": "123"
  }
}
```

### **POST /api/webhooks/pagarme**
Webhook para receber notificações do Pagar.me.

### **POST /api/webhooks/stripe**
Webhook para receber notificações do Stripe.

---

## 💰 Modelo de Preços

### **Ambos os Gateways**
- **Taxa de Ativação**: R$ 1,00 (cobrança única)
- **Mensalidade**: R$ 29,90/mês
- **Trial Gratuito**: 7 dias
- **Renovação**: Automática

### **Diferenças por Gateway**

| Recurso | Stripe | Pagar.me |
|---------|--------|----------|
| Cartão de Crédito | ✅ | ✅ |
| Cartão de Débito | ❌ | ✅ |
| Boleto | ❌ | ✅ |
| PIX | ❌ | ✅ |
| Validação CPF | ❌ | ✅ |
| Endereço Brasileiro | ❌ | ✅ |
| Moedas Internacionais | ✅ | ❌ |

---

## 🔒 Segurança

### **Stripe**
- PCI DSS Compliant
- Criptografia TLS 1.2+
- Tokens seguros
- Webhooks assinados

### **Pagar.me**
- PCI DSS Compliant
- Criptografia SSL/TLS
- Tokenização de cartão
- Webhooks autenticados

---

## 🐛 Troubleshooting

### **Problema**: Gateway não aparece na lista
**Solução**: Verifique se as chaves de API estão corretas no `.env`

### **Problema**: Erro na criação de assinatura
**Solução**: Verifique os logs do servidor e se os dados estão no formato correto

### **Problema**: Webhook não funcionando
**Solução**: Configure a URL correta no dashboard do gateway:
- Stripe: `https://seudominio.com/api/webhooks/stripe`
- Pagar.me: `https://seudominio.com/api/webhooks/pagarme`

### **Problema**: Pagamento não processado
**Solução**: Verifique se está usando chaves de produção (não teste) em ambiente de produção

---

## 📞 Suporte

Para problemas técnicos:
1. Verifique os logs do servidor
2. Confirme as configurações de ambiente
3. Teste com dados de cartão válidos
4. Verifique se os webhooks estão configurados corretamente

**Logs importantes:**
- `✅ Stripe inicializado com sucesso`
- `✅ Pagar.me inicializado com sucesso`
- `❌ Erro ao processar pagamento`
- `🔔 Webhook recebido`

---

## 🎯 Próximos Passos

1. **Configurar ambos os gateways** para máxima flexibilidade
2. **Testar com dados de teste** antes de ir para produção
3. **Configurar webhooks** para sincronização automática
4. **Monitorar logs** para identificar problemas rapidamente
5. **Personalizar interface** conforme necessário

---

✨ **Agora você tem um sistema completo de pagamento dual que atende tanto o mercado brasileiro quanto o internacional!**