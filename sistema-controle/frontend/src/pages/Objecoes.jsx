import React, { useState } from 'react'
import Layout from '../components/Layout'
import { MessageSquare, ChevronDown, ChevronRight, Search, Target } from 'lucide-react'

export default function Objecoes() {
  const [searchTerm, setSearchTerm] = useState('')
  const [openSections, setOpenSections] = useState({})

  const objecoes = [
    {
      categoria: "Preço",
      icon: "💰",
      objecoes: [
        {
          objecao: "Está muito caro",
          resposta: "Entendo sua preocupação com o preço. Vamos pensar no valor que você está recebendo: [listar benefícios específicos]. Quando dividimos pelo tempo de uso, fica apenas R$ X por dia. Vale mais a pena investir na qualidade agora do que ter que comprar novamente depois.",
          dicas: "Use a técnica do custo-benefício e divida o valor por uso/tempo"
        },
        {
          objecao: "Não tenho dinheiro agora",
          resposta: "Perfeito! É exatamente por isso que temos opções flexíveis. Podemos fazer [opção de pagamento]. O importante é você não perder essa oportunidade. Qual seria a melhor forma de pagamento para você?",
          dicas: "Sempre ofereça alternativas de pagamento e foque no benefício perdido"
        },
        {
          objecao: "Vou pesquisar preços",
          resposta: "Claro, pesquisar é importante! Só te peço um favor: quando pesquisar, compare não só o preço, mas principalmente a qualidade e o suporte pós-venda. Posso te garantir que nossa proposta já considera o melhor custo-benefício do mercado.",
          dicas: "Direcione a pesquisa para critérios além do preço"
        }
      ]
    },
    {
      categoria: "Confiança",
      icon: "🤝",
      objecoes: [
        {
          objecao: "Não conheço a empresa",
          resposta: "Entendo completamente! A confiança é fundamental. Deixe-me te apresentar nossa empresa: [histórico, clientes satisfeitos, garantias]. Também posso te passar contatos de clientes para você conversar diretamente com eles.",
          dicas: "Use provas sociais, depoimentos e ofereça referências"
        },
        {
          objecao: "Tenho medo de ser enganado",
          resposta: "Seu receio é totalmente válido. Por isso oferecemos [garantias, políticas de devolução]. Você não tem nada a perder e tudo a ganhar. Se não ficar satisfeito, devolvemos seu dinheiro sem perguntas.",
          dicas: "Reforce garantias e remova o risco da decisão"
        },
        {
          objecao: "Preciso falar com meu sócio/esposo(a)",
          resposta: "Perfeito! Decisões importantes devem ser compartilhadas mesmo. Que tal agendarmos uma conversa com vocês dois? Ou posso te dar alguns materiais para você mostrar e depois conversamos novamente.",
          dicas: "Facilite o processo e agende retorno específico"
        }
      ]
    },
    {
      categoria: "Necessidade",
      icon: "🎯",
      objecoes: [
        {
          objecao: "Não preciso disso agora",
          resposta: "Entendo que talvez não seja urgente, mas deixe-me te fazer uma pergunta: [problema que o produto resolve] não está te afetando de alguma forma? O melhor momento para resolver um problema é antes dele se tornar maior.",
          dicas: "Identifique dores não conscientes e crie urgência saudável"
        },
        {
          objecao: "Já tenho algo parecido",
          resposta: "Que bom que você já tem experiência com esse tipo de solução! Isso torna nossa conversa ainda mais rica. Me conta: o que você gostaria que fosse diferente na sua solução atual? [Identifique gaps e posicione diferenciais]",
          dicas: "Use a experiência atual como ponte para mostrar melhorias"
        },
        {
          objecao: "Vou pensar mais tarde",
          resposta: "Pensar é sempre importante! Mas me ajuda a entender: existe alguma informação específica que te ajudaria a decidir melhor? Ou é mais uma questão de timing? Vamos esclarecer suas dúvidas agora para você tomar a melhor decisão.",
          dicas: "Identifique se é falta de informação ou genuína necessidade de tempo"
        }
      ]
    },
    {
      categoria: "Tempo",
      icon: "⏰",
      objecoes: [
        {
          objecao: "Não tenho tempo agora",
          resposta: "Entendo que você está ocupado! Por isso mesmo nossa solução foi pensada para pessoas como você - economiza tempo ao invés de consumir. Que tal agendarmos 10 minutos quando for melhor para você?",
          dicas: "Posicione como economia de tempo e seja flexível com agendamento"
        },
        {
          objecao: "Vou decidir depois",
          resposta: "Claro! Só para eu entender melhor: 'depois' seria em quanto tempo? É para conseguir organizar as informações ou existe algo específico que você precisa resolver antes? Vamos alinhar isso para eu te ajudar melhor.",
          dicas: "Defina prazos específicos e identifique bloqueadores reais"
        }
      ]
    },
    {
      categoria: "Autoridade",
      icon: "👔",
      objecoes: [
        {
          objecao: "Preciso falar com meu chefe",
          resposta: "Perfeito! Seu chefe certamente vai querer ver os números e benefícios. Posso preparar um material executivo para você apresentar? Ou se preferir, posso participar dessa conversa para esclarecer detalhes técnicos.",
          dicas: "Ofereça materiais de apoio e disponibilidade para participar"
        },
        {
          objecao: "Não sou eu quem decide",
          resposta: "Entendo! Me ajuda a entender melhor o processo de decisão? Quem mais participa e quais são os critérios importantes para essa pessoa? Assim posso te dar argumentos sólidos para apresentar.",
          dicas: "Mapeie o processo decisório e prepare argumentos direcionados"
        }
      ]
    }
  ]

  const toggleSection = (categoria) => {
    setOpenSections(prev => ({
      ...prev,
      [categoria]: !prev[categoria]
    }))
  }

  const filteredObjecoes = objecoes.map(cat => ({
    ...cat,
    objecoes: cat.objecoes.filter(obj => 
      obj.objecao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obj.resposta.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.objecoes.length > 0)

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manual de Objeções</h1>
          <p className="text-gray-600">
            Respostas profissionais para as objeções mais comuns em vendas
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total de Objeções</p>
                <p className="text-2xl font-bold text-gray-900">
                  {objecoes.reduce((acc, cat) => acc + cat.objecoes.length, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Categorias</p>
                <p className="text-2xl font-bold text-gray-900">{objecoes.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-gray-900">85%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="card">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar objeção ou resposta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        {/* Objeções por Categoria */}
        <div className="space-y-4">
          {filteredObjecoes.map((categoria) => (
            <div key={categoria.categoria} className="card">
              <button
                onClick={() => toggleSection(categoria.categoria)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{categoria.icon}</span>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {categoria.categoria}
                  </h3>
                  <span className="ml-2 text-sm text-gray-500">
                    ({categoria.objecoes.length} objeções)
                  </span>
                </div>
                {openSections[categoria.categoria] ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </button>

              {openSections[categoria.categoria] && (
                <div className="mt-4 space-y-4">
                  {categoria.objecoes.map((obj, index) => (
                    <div key={index} className="border-l-4 border-primary-500 pl-4 py-2">
                      <div className="mb-3">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          💬 "{obj.objecao}"
                        </h4>
                        <div className="bg-green-50 border-l-4 border-green-400 p-3 mb-3">
                          <p className="text-gray-700">
                            <strong>Resposta:</strong> {obj.resposta}
                          </p>
                        </div>
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
                          <p className="text-sm text-gray-600">
                            <strong>💡 Dica:</strong> {obj.dicas}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Dicas Gerais */}
        <div className="card bg-gradient-to-br from-yellow-50 to-orange-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🏆 Princípios Fundamentais para Lidar com Objeções
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">1. Escute Ativamente</h4>
              <p className="text-gray-700">Deixe o cliente expressar completamente sua objeção antes de responder.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">2. Empatize</h4>
              <p className="text-gray-700">Mostre que entende a preocupação: "Entendo perfeitamente..."</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">3. Faça Perguntas</h4>
              <p className="text-gray-700">Esclareça a objeção antes de responder: "Me ajuda a entender melhor..."</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">4. Responda com Evidências</h4>
              <p className="text-gray-700">Use dados, provas sociais e garantias para sustentar sua resposta.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">5. Confirme a Resolução</h4>
              <p className="text-gray-700">Pergunte se esclareceu a dúvida antes de avançar.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">6. Reforce o Valor</h4>
              <p className="text-gray-700">Sempre conecte sua resposta aos benefícios para o cliente.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}