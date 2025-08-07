import React from 'react'
import Layout from '../components/Layout'
import { BookOpen, Play, FileText, CheckCircle } from 'lucide-react'

export default function Tutoriais() {
  const tutoriais = [
    {
      id: 1,
      titulo: "Como Usar o Sistema",
      descricao: "Aprenda os fundamentos do sistema de controle",
      duracao: "10 min",
      topicos: [
        "Fazendo login no sistema",
        "Navegando pelo dashboard",
        "Criando novos pedidos",
        "Usando os filtros"
      ]
    },
    {
      id: 2,
      titulo: "Gestão de Pedidos",
      descricao: "Domine o fluxo completo de pedidos",
      duracao: "15 min",
      topicos: [
        "Tipos de pedidos: Pago, LOGZZ, After Pay",
        "Status dos pedidos",
        "Agendamento de entregas",
        "Confirmação de pagamentos"
      ]
    },
    {
      id: 3,
      titulo: "Maximizando Suas Comissões",
      descricao: "Estratégias para aumentar suas vendas",
      duracao: "20 min",
      topicos: [
        "Metas diárias e mensais",
        "Como calcular comissões",
        "Técnicas de follow-up",
        "Gestão do tempo"
      ]
    },
    {
      id: 4,
      titulo: "LOGZZ - Sistema de Entregas",
      descricao: "Tudo sobre entregas agendadas",
      duracao: "12 min",
      topicos: [
        "Como funciona o LOGZZ",
        "Agendando entregas",
        "Períodos de entrega",
        "Acompanhamento de status"
      ]
    },
    {
      id: 5,
      titulo: "After Pay - Vendas Pós-Entrega",
      descricao: "Estratégias de cobrança após entrega",
      duracao: "18 min",
      topicos: [
        "Quando usar After Pay",
        "Técnicas de cobrança",
        "Relacionamento com cliente",
        "Conversão de After Pay para Pago"
      ]
    },
    {
      id: 6,
      titulo: "Relatórios e Análises",
      descricao: "Interpretando seus dados de performance",
      duracao: "14 min",
      topicos: [
        "Lendo o dashboard",
        "Analisando tendências",
        "Identificando oportunidades",
        "Planejamento estratégico"
      ]
    }
  ]

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tutoriais</h1>
          <p className="text-gray-600">
            Aprenda a usar o sistema de forma eficiente e maximize suas vendas
          </p>
        </div>

        {/* Estatísticas de Aprendizado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total de Tutoriais</p>
                <p className="text-2xl font-bold text-gray-900">{tutoriais.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Concluídos</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Play className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Tempo Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tutoriais.reduce((acc, t) => acc + parseInt(t.duracao), 0)} min
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Tutoriais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tutoriais.map((tutorial) => (
            <div key={tutorial.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-primary-100 rounded-lg mr-3">
                    <BookOpen className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{tutorial.titulo}</h3>
                    <p className="text-sm text-gray-600">{tutorial.duracao}</p>
                  </div>
                </div>
                <button className="btn btn-primary text-sm flex items-center">
                  <Play className="h-4 w-4 mr-1" />
                  Iniciar
                </button>
              </div>

              <p className="text-gray-700 mb-4">{tutorial.descricao}</p>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">O que você vai aprender:</h4>
                <ul className="space-y-1">
                  {tutorial.topicos.map((topico, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-primary-400 rounded-full mr-2"></div>
                      {topico}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Seção de Dicas Rápidas */}
        <div className="card bg-gradient-to-br from-primary-50 to-blue-50">
          <div className="flex items-start">
            <div className="p-2 bg-primary-600 rounded-lg mr-4">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Dicas Rápidas para Sucesso
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <h4 className="font-medium mb-1">🎯 Foque na Meta Diária</h4>
                  <p>Divida sua meta mensal em objetivos diários alcançáveis</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">📞 Follow-up Constante</h4>
                  <p>Mantenha contato regular com clientes pendentes</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">⏰ Gerencie Seu Tempo</h4>
                  <p>Use o sistema de agendamentos para organizar entregas</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">📊 Analise Seus Dados</h4>
                  <p>Revise regularmente seu dashboard para identificar oportunidades</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Rápido */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Perguntas Frequentes</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">Como funciona o cálculo de comissões?</h4>
              <p className="text-sm text-gray-600 mt-1">
                As comissões são calculadas como 10% do valor da venda apenas para pedidos com status "Pago".
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Qual a diferença entre LOGZZ e After Pay?</h4>
              <p className="text-sm text-gray-600 mt-1">
                LOGZZ são entregas agendadas com pagamento na entrega. After Pay são vendas onde o pagamento acontece após a entrega.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Como posso acompanhar minha performance?</h4>
              <p className="text-sm text-gray-600 mt-1">
                Use o dashboard principal que mostra vendas do dia, mês, comissões e entregas agendadas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}