# 🚀 SISTEMA DE CAMPANHAS CONDICIONAIS "SE > ENTÃO" - TEMPO REAL

## ✅ EXEMPLO PRÁTICO: PESSOA NA PÁGINA 4 COM MÚLTIPLA ESCOLHA

### 🎯 CENÁRIO:
- Pessoa está na **Página 4** do quiz
- Pergunta: "Qual seu objetivo principal?"
- Opções: "Perder peso", "Ganhar massa", "Tonificar", "Manter forma"
- Pessoa escolhe: **"Perder peso"**

### 💾 COMO É SALVO:
```javascript
// Resposta automática capturada:
{
  elementId: "1752558433973",
  elementType: "multiple_choice", 
  elementFieldId: "objetivo_principal", // Campo personalizado
  answer: "Perder peso",
  timestamp: "2025-07-15T06:00:00.000Z",
  pageId: 4,
  pageTitle: "Página 4"
}
```

### 🔥 CAMPANHAS CONDICIONAIS DISPONÍVEIS:

## 1️⃣ CAMPANHA CONDICIONAL BÁSICA
```javascript
// Configuração da campanha:
{
  name: "Campanha Perder Peso",
  campaignType: "conditional",
  conditionalRules: [
    {
      fieldId: "objetivo_principal",
      expectedValue: "Perder peso"
    }
  ],
  message: "🔥 Parabéns! Seu plano de emagrecimento está pronto!",
  triggerType: "immediate" // Enviado IMEDIATAMENTE
}
```

## 2️⃣ CAMPANHA ULTRA PERSONALIZADA
```javascript
// Mensagens diferentes para cada resposta:
{
  campaignType: "ultra_personalized",
  conditionalRules: [
    {
      fieldId: "objetivo_principal",
      messages: {
        "Perder peso": "🔥 Acelere seu metabolismo! Queime gordura 24h/dia!",
        "Ganhar massa": "💪 Construa músculos poderosos! Fórmula exclusiva!",
        "Tonificar": "✨ Corpo definido em 30 dias! Método comprovado!",
        "Manter forma": "🎯 Mantenha resultados para sempre! Sistema único!"
      }
    }
  ]
}
```

## 3️⃣ CAMPANHA COM MÚLTIPLAS CONDIÇÕES
```javascript
// Exemplo: SE objetivo = "Perder peso" E idade = "25-35 anos"
{
  conditionalRules: [
    {
      fieldId: "objetivo_principal",
      expectedValue: "Perder peso"
    },
    {
      fieldId: "faixa_etaria",
      expectedValue: "25-35 anos"
    }
  ],
  message: "🔥 Mulheres de 25-35 anos: Acelere metabolismo pós-gravidez!"
}
```

## 4️⃣ CAMPANHA COM ATRASO/AGENDAMENTO
```javascript
{
  triggerType: "delayed",
  triggerDelay: 2,
  triggerUnit: "hours", // ou "minutes"
  conditionalRules: [
    {
      fieldId: "objetivo_principal", 
      expectedValue: "Perder peso"
    }
  ]
}
```

### 🎯 COMO FUNCIONA EM TEMPO REAL:

1. **CAPTURA AUTOMÁTICA**: Pessoa responde "Perder peso" → Sistema salva com `fieldId: "objetivo_principal"`

2. **FILTRO INTELIGENTE**: Sistema identifica todas as pessoas que responderam "Perder peso"

3. **ENVIO CONDICIONAL**: 
   - SMS: "🔥 Parabéns! Seu plano de emagrecimento está pronto!"
   - Email: Versão completa com receitas
   - WhatsApp: Com áudio personalizado

4. **TEMPO REAL**: Configurável para:
   - ⚡ **Imediato**: Assim que responde
   - ⏱️ **Atrasado**: 30 min, 1h, 2h após resposta
   - 📅 **Agendado**: Data/hora específica

### 🔧 INTERFACE ATUAL:
- ✅ **4 TIPOS DE CAMPANHA** já implementados
- ✅ **ULTRA CUSTOMIZADA** - mensagem única por resposta
- ✅ **CONDICIONAL** - múltiplas condições SE > ENTÃO
- ✅ **TEMPO REAL** - immediate, delayed, scheduled
- ✅ **TODOS OS CANAIS** - SMS, Email, WhatsApp, Voice

### 💡 EXEMPLOS DE USO:
```
SE objetivo = "Perder peso" ENTÃO enviar SMS "Dieta exclusiva!"
SE idade = "18-25" E objetivo = "Ganhar massa" ENTÃO enviar WhatsApp com áudio
SE completou quiz ENTÃO aguardar 1 hora E enviar email follow-up
```

**SISTEMA 100% FUNCIONAL E OPERACIONAL! 🚀**