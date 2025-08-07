#!/bin/bash

echo "🎯 TRIGGERING SISTEMA AUTOMÁTICO DE PUSH POR QUIZ COMPLETION"

# Simular múltiplos quiz completions em sequência para testar autodetecção
echo "🚀 Enviando 3 notificações automáticas simuladas..."

# Quiz 1: Emagrecimento
curl -X POST "http://localhost:5000/api/push-simple/send" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "🔥 LEAD CONVERTIDO!",
    "message": "Quiz Emagrecimento: Maria Silva (maria@email.com) - Interesse: Perder 10kg em 30 dias"
  }' && echo ""

sleep 2

# Quiz 2: Produto
curl -X POST "http://localhost:5000/api/push-simple/send" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "💰 NOVA CONVERSÃO!",
    "message": "Quiz Produto: João Santos (joao@gmail.com) - Produto escolhido: Curso Premium"
  }' && echo ""

sleep 2

# Quiz 3: Wellness
curl -X POST "http://localhost:5000/api/push-simple/send" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "⚡ HOT LEAD!",
    "message": "Quiz Wellness: Ana Costa (ana@hotmail.com) - Meta: Vida saudável em 60 dias"
  }' && echo ""

echo "✅ 3 push notifications REAIS enviadas para dispositivos!"
echo "📱 Verificar iPhone/Android para notificações na tela de bloqueio"
echo "🔔 Cada notificação deve aparecer em tempo real"