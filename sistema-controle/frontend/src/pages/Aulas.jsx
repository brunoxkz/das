import React, { useState } from 'react'
import Layout from '../components/Layout'
import { Play, Clock, Star, BookOpen, Award, Users } from 'lucide-react'

export default function Aulas() {
  const [selectedModule, setSelectedModule] = useState(null)

  const modules = [
    {
      id: 1,
      titulo: "Fundamentos de Vendas",
      descricao: "Base sólida para qualquer vendedor de sucesso",
      duracao: "2h 30min",
      aulas: 8,
      nivel: "Iniciante",
      rating: 4.9,
      concluidas: 0,
      aulas_detalhes: [
        { titulo: "Mindset do Vendedor", duracao: "20min" },
        { titulo: "Conhecendo seu Cliente", duracao: "25min" },
        { titulo: "Técnicas de Abordagem", duracao: "30min" },
        { titulo: "Criando Rapport", duracao: "20min" },
        { titulo: "Identificando Necessidades", duracao: "25min" },
        { titulo: "Apresentação de Soluções", duracao: "20min" },
        { titulo: "Fechamento de Vendas", duracao: "25min" },
        { titulo: "Pós-venda e Fidelização", duracao: "15min" }
      ]
    },
    {
      id: 2,
      titulo: "Vendas Consultivas",
      descricao: "Torne-se um consultor, não apenas um vendedor",
      duracao: "3h 15min",
      aulas: 10,
      nivel: "Intermediário",
      rating: 4.8,
      concluidas: 0,
      aulas_detalhes: [
        { titulo: "O que é Venda Consultiva", duracao: "18min" },
        { titulo: "Fazendo as Perguntas Certas", duracao: "22min" },
        { titulo: "Escuta Ativa Avançada", duracao: "20min" },
        { titulo: "Mapeamento de Stakeholders", duracao: "25min" },
        { titulo: "Apresentações Personalizadas", duracao: "30min" },
        { titulo: "ROI e Análise de Valor", duracao: "28min" },
        { titulo: "Negociação Win-Win", duracao: "25min" },
        { titulo: "Gestão de Ciclo de Vendas", duracao: "20min" },
        { titulo: "Follow-up Estratégico", duracao: "15min" },
        { titulo: "Cases de Sucesso", duracao: "12min" }
      ]
    },
    {
      id: 3,
      titulo: "Psicologia da Venda",
      descricao: "Entenda a mente do cliente e venda mais",
      duracao: "2h 45min",
      aulas: 9,
      nivel: "Avançado",
      rating: 4.9,
      concluidas: 0,
      aulas_detalhes: [
        { titulo: "Gatilhos Mentais Fundamentais", duracao: "25min" },
        { titulo: "Escassez e Urgência", duracao: "20min" },
        { titulo: "Prova Social e Autoridade", duracao: "22min" },
        { titulo: "Reciprocidade em Vendas", duracao: "18min" },
        { titulo: "Ancoragem de Preços", duracao: "20min" },
        { titulo: "Aversão à Perda", duracao: "15min" },
        { titulo: "Storytelling Persuasivo", duracao: "25min" },
        { titulo: "Linguagem Corporal", duracao: "20min" },
        { titulo: "Ética na Persuasão", duracao: "20min" }
      ]
    },
    {
      id: 4,
      titulo: "Vendas por Telefone/WhatsApp",
      descricao: "Domine as vendas remotas e digitais",
      duracao: "2h 00min",
      aulas: 7,
      nivel: "Intermediário",
      rating: 4.7,
      concluidas: 0,
      aulas_detalhes: [
        { titulo: "Preparação para Ligações", duracao: "20min" },
        { titulo: "Abertura Eficaz por Telefone", duracao: "18min" },
        { titulo: "Vendas via WhatsApp", duracao: "25min" },
        { titulo: "Superando a Distância", duracao: "15min" },
        { titulo: "Fechamento Remoto", duracao: "20min" },
        { titulo: "Follow-up Digital", duracao: "12min" },
        { titulo: "Ferramentas e Apps", duracao: "10min" }
      ]
    },
    {
      id: 5,
      titulo: "Gestão de Performance",
      descricao: "Organize sua rotina e maximize resultados",
      duracao: "1h 50min",
      aulas: 6,
      nivel: "Iniciante",
      rating: 4.6,
      concluidas: 0,
      aulas_detalhes: [
        { titulo: "Definindo Metas SMART", duracao: "20min" },
        { titulo: "Planejamento de Atividades", duracao: "18min" },
        { titulo: "Gestão de Pipeline", duracao: "22min" },
        { titulo: "Análise de Métricas", duracao: "20min" },
        { titulo: "Motivação e Disciplina", duracao: "15min" },
        { titulo: "Evolução Contínua", duracao: "15min" }
      ]
    },
    {
      id: 6,
      titulo: "Atendimento ao Cliente",
      descricao: "Excelência no relacionamento e pós-venda",
      duracao: "2h 20min",
      aulas: 8,
      nivel: "Iniciante",
      rating: 4.8,
      concluidas: 0,
      aulas_detalhes: [
        { titulo: "Princípios do Bom Atendimento", duracao: "18min" },
        { titulo: "Comunicação Empática", duracao: "20min" },
        { titulo: "Resolvendo Problemas", duracao: "25min" },
        { titulo: "Lidando com Reclamações", duracao: "22min" },
        { titulo: "Fidelização de Clientes", duracao: "20min" },
        { titulo: "Upsell e Cross-sell", duracao: "18min" },
        { titulo: "Indicações e Referências", duracao: "12min" },
        { titulo: "Métricas de Satisfação", duracao: "15min" }
      ]
    }
  ]

  const getNivelColor = (nivel) => {
    switch (nivel) {
      case 'Iniciante': return 'bg-green-100 text-green-800'
      case 'Intermediário': return 'bg-yellow-100 text-yellow-800'
      case 'Avançado': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalAulas = modules.reduce((acc, mod) => acc + mod.aulas, 0)
  const totalDuracao = modules.reduce((acc, mod) => {
    const horas = parseInt(mod.duracao.split('h')[0])
    const minutos = parseInt(mod.duracao.split('h')[1]?.replace('min', '') || 0)
    return acc + (horas * 60) + minutos
  }, 0)

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academia de Vendas</h1>
          <p className="text-gray-600">
            Desenvolva suas habilidades com nossos cursos especializados
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Módulos</p>
                <p className="text-2xl font-bold text-gray-900">{modules.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Play className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Aulas</p>
                <p className="text-2xl font-bold text-gray-900">{totalAulas}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Duração Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.floor(totalDuracao / 60)}h {totalDuracao % 60}min
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Progresso</p>
                <p className="text-2xl font-bold text-gray-900">0%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Módulos de Treinamento */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {modules.map((modulo) => (
            <div key={modulo.id} className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{modulo.titulo}</h3>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getNivelColor(modulo.nivel)}`}>
                      {modulo.nivel}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{modulo.descricao}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                      <Play className="h-4 w-4 mr-1" />
                      {modulo.aulas} aulas
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {modulo.duracao}
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-400" />
                      {modulo.rating}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${(modulo.concluidas / modulo.aulas) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {modulo.concluidas}/{modulo.aulas} concluídas
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedModule(modulo)}
                      className="btn btn-primary text-sm flex items-center"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Ver Aulas
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trilha de Aprendizado Recomendada */}
        <div className="card bg-gradient-to-br from-primary-50 to-blue-50">
          <div className="flex items-start">
            <div className="p-2 bg-primary-600 rounded-lg mr-4">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Trilha de Aprendizado Recomendada
              </h3>
              <p className="text-gray-700 mb-4">
                Para maximizar seu desenvolvimento, recomendamos seguir esta sequência:
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs mr-3">1</span>
                  <span>Fundamentos de Vendas</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs mr-3">2</span>
                  <span>Atendimento ao Cliente</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs mr-3">3</span>
                  <span>Gestão de Performance</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs mr-3">4</span>
                  <span>Vendas por Telefone/WhatsApp</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs mr-3">5</span>
                  <span>Vendas Consultivas</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs mr-3">6</span>
                  <span>Psicologia da Venda</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes do Módulo */}
      {selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{selectedModule.titulo}</h2>
                <button
                  onClick={() => setSelectedModule(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                <span className={`px-2 py-1 rounded-full ${getNivelColor(selectedModule.nivel)}`}>
                  {selectedModule.nivel}
                </span>
                <span className="flex items-center">
                  <Play className="h-4 w-4 mr-1" />
                  {selectedModule.aulas} aulas
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {selectedModule.duracao}
                </span>
                <span className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-400" />
                  {selectedModule.rating}
                </span>
              </div>

              <p className="text-gray-700 mb-6">{selectedModule.descricao}</p>

              <h3 className="text-lg font-semibold mb-4">Lista de Aulas</h3>
              <div className="space-y-3">
                {selectedModule.aulas_detalhes.map((aula, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-primary-700">{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{aula.titulo}</h4>
                        <p className="text-sm text-gray-500">{aula.duracao}</p>
                      </div>
                    </div>
                    <button className="btn btn-primary text-sm flex items-center">
                      <Play className="h-4 w-4 mr-1" />
                      Assistir
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedModule(null)}
                  className="w-full btn btn-primary"
                >
                  Começar Módulo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}