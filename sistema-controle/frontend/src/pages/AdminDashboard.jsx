import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Package, 
  Plus, 
  Eye, 
  UserPlus,
  BarChart3,
  Calendar
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function AdminDashboard() {
  const { user, getAuthHeaders } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [atendentes, setAtendentes] = useState([])
  const [selectedAtendente, setSelectedAtendente] = useState('')
  const [pedidosGerais, setPedidosGerais] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNovoAtendente, setShowNovoAtendente] = useState(false)

  useEffect(() => {
    loadDashboard()
    loadAtendentes()
    loadPedidosGerais()
  }, [])

  useEffect(() => {
    loadDashboard()
    loadPedidosGerais()
  }, [selectedAtendente])

  const loadDashboard = async () => {
    try {
      const url = selectedAtendente ? `/api/dashboard/${selectedAtendente}` : '/api/dashboard'
      const response = await fetch(url, {
        headers: getAuthHeaders()
      })
      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    }
  }

  const loadAtendentes = async () => {
    try {
      const response = await fetch('/api/atendentes', {
        headers: getAuthHeaders()
      })
      const data = await response.json()
      setAtendentes(data)
    } catch (error) {
      console.error('Erro ao carregar atendentes:', error)
    }
  }

  const loadPedidosGerais = async () => {
    try {
      const url = selectedAtendente ? `/api/pedidos/${selectedAtendente}` : '/api/pedidos'
      const response = await fetch(url, {
        headers: getAuthHeaders()
      })
      const data = await response.json()
      setPedidosGerais(data)
      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      'pendente': 'badge badge-warning',
      'agendado': 'badge badge-info',
      'em_rota': 'badge badge-warning',
      'entregue': 'badge badge-success',
      'pago': 'badge badge-success',
      'cancelado': 'badge badge-danger'
    }
    
    const labels = {
      'pendente': 'Pendente',
      'agendado': 'Agendado',
      'em_rota': 'Em Rota',
      'entregue': 'Entregue',
      'pago': 'Pago',
      'cancelado': 'Cancelado'
    }
    
    return (
      <span className={badges[status] || 'badge'}>
        {labels[status] || status}
      </span>
    )
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Painel Administrativo
            </h1>
            <p className="text-gray-600">
              Visão geral completa do negócio e atendentes
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowNovoAtendente(true)}
              className="btn btn-primary flex items-center"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Novo Atendente
            </button>
          </div>
        </div>

        {/* Filtro por Atendente */}
        <div className="card">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Filtrar por Atendente</h3>
            <div className="flex items-center space-x-4">
              <select
                value={selectedAtendente}
                onChange={(e) => setSelectedAtendente(e.target.value)}
                className="input w-64"
              >
                <option value="">Todos os Atendentes</option>
                {atendentes.map(atendente => (
                  <option key={atendente.id} value={atendente.id}>
                    {atendente.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Vendas Hoje</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.vendasHoje.count}
                  </p>
                  <p className="text-sm text-green-600">
                    R$ {dashboardData.vendasHoje.valor.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Vendas Mês</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.vendasMes.count}
                  </p>
                  <p className="text-sm text-blue-600">
                    R$ {dashboardData.vendasMes.valor.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Comissões Mês</p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {dashboardData.comissoesMes.valor.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Package className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Entregas Hoje</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.entregasHoje.count}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance dos Atendentes */}
        {dashboardData?.performanceAtendentes && dashboardData.performanceAtendentes.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Performance dos Atendentes</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Atendente</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Vendas Mês</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Comissão Mês</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Valor Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.performanceAtendentes.map((atendente) => (
                    <tr key={atendente.nome} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{atendente.nome}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-gray-900">{atendente.vendas_mes}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-green-600">
                          R$ {atendente.comissao_mes.toFixed(2)}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">
                          R$ {atendente.valor_total_mes.toFixed(2)}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Lista de Atendentes */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Atendentes Cadastrados</h3>
          
          {atendentes.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum atendente cadastrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {atendentes.map((atendente) => (
                <div key={atendente.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{atendente.nome}</h4>
                    <button
                      onClick={() => setSelectedAtendente(atendente.id)}
                      className="p-1 text-gray-400 hover:text-primary-600"
                      title="Ver dados deste atendente"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>📧 {atendente.email}</p>
                    {atendente.telefone && <p>📞 {atendente.telefone}</p>}
                    <p>🎯 Meta: {atendente.meta_vendas_diaria} vendas/dia</p>
                    <p>💰 Comissão: {atendente.comissao_percentual}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Todos os Pedidos */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            {selectedAtendente ? 'Pedidos do Atendente Selecionado' : 'Todos os Pedidos'}
          </h3>
          
          {pedidosGerais.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum pedido encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Atendente</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Cliente</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Produto</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Categoria</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Valor</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidosGerais.slice(0, 50).map((pedido) => (
                    <tr key={pedido.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{pedido.atendente_nome}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{pedido.cliente_nome}</p>
                          <p className="text-sm text-gray-600">{pedido.cliente_telefone}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-gray-900">{pedido.produto}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize text-gray-700">{pedido.categoria}</span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">
                          R$ {pedido.valor_venda.toFixed(2)}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(pedido.status)}
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-gray-900">
                          {format(new Date(pedido.data_pedido), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Novo Atendente */}
      {showNovoAtendente && (
        <NovoAtendenteModal 
          onClose={() => setShowNovoAtendente(false)}
          onSave={() => {
            setShowNovoAtendente(false)
            loadAtendentes()
          }}
          getAuthHeaders={getAuthHeaders}
        />
      )}
    </Layout>
  )
}

// Componente Modal para Novo Atendente
function NovoAtendenteModal({ onClose, onSave, getAuthHeaders }) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    meta_vendas_diaria: 10,
    comissao_percentual: 10
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onSave()
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao criar atendente')
      }
    } catch (error) {
      alert('Erro ao criar atendente')
    }
    
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Novo Atendente</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha *
              </label>
              <input
                type="password"
                required
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className="input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Vendas/Dia
                </label>
                <input
                  type="number"
                  value={formData.meta_vendas_diaria}
                  onChange={(e) => setFormData({ ...formData, meta_vendas_diaria: Number(e.target.value) })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comissão (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.comissao_percentual}
                  onChange={(e) => setFormData({ ...formData, comissao_percentual: Number(e.target.value) })}
                  className="input"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary disabled:opacity-50"
              >
                {loading ? 'Criando...' : 'Criar Atendente'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}