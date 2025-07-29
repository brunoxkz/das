import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { 
  DollarSign, 
  Package, 
  Clock, 
  TrendingUp, 
  Plus, 
  Filter,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Dashboard() {
  const { user, getAuthHeaders } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNovoPedido, setShowNovoPedido] = useState(false)
  const [filters, setFilters] = useState({
    categoria: '',
    status: '',
    dataInicio: '',
    dataFim: ''
  })

  useEffect(() => {
    loadDashboard()
    loadPedidos()
  }, [])

  useEffect(() => {
    loadPedidos()
  }, [filters])

  const loadDashboard = async () => {
    try {
      const response = await fetch('/api/dashboard', {
        headers: getAuthHeaders()
      })
      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    }
  }

  const loadPedidos = async () => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      
      const response = await fetch(`/api/pedidos?${params}`, {
        headers: getAuthHeaders()
      })
      const data = await response.json()
      setPedidos(data)
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

  const getCategoriaIcon = (categoria) => {
    switch (categoria) {
      case 'pago': return <DollarSign className="h-4 w-4 text-green-600" />
      case 'logzz': return <Clock className="h-4 w-4 text-blue-600" />
      case 'after_pay': return <AlertCircle className="h-4 w-4 text-orange-600" />
      default: return <Package className="h-4 w-4 text-gray-600" />
    }
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
              Olá, {user?.nome}!
            </h1>
            <p className="text-gray-600">
              Acompanhe suas vendas e entregas
            </p>
          </div>
          <button
            onClick={() => setShowNovoPedido(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Novo Pedido
          </button>
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
                  <p className="text-sm text-gray-600">Comissão Mês</p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {dashboardData.comissoesMes.valor.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600" />
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

        {/* Filters */}
        <div className="card">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold">Filtros</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                value={filters.categoria}
                onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
                className="input"
              >
                <option value="">Todas</option>
                <option value="pago">Pago</option>
                <option value="logzz">LOGZZ</option>
                <option value="after_pay">After Pay</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="input"
              >
                <option value="">Todos</option>
                <option value="pendente">Pendente</option>
                <option value="agendado">Agendado</option>
                <option value="em_rota">Em Rota</option>
                <option value="entregue">Entregue</option>
                <option value="pago">Pago</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Início
              </label>
              <input
                type="date"
                value={filters.dataInicio}
                onChange={(e) => setFilters({ ...filters, dataInicio: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Fim
              </label>
              <input
                type="date"
                value={filters.dataFim}
                onChange={(e) => setFilters({ ...filters, dataFim: e.target.value })}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Pedidos List */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Meus Pedidos</h3>
          
          {pedidos.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum pedido encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Cliente</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Produto</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Categoria</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Valor</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((pedido) => (
                    <tr key={pedido.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{pedido.cliente_nome}</p>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <Phone className="h-3 w-3 mr-1" />
                            {pedido.cliente_telefone}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-gray-900">{pedido.produto}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {getCategoriaIcon(pedido.categoria)}
                          <span className="ml-2 capitalize">{pedido.categoria}</span>
                        </div>
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
                        {pedido.data_agendamento && (
                          <p className="text-xs text-gray-600">
                            Agendado: {format(new Date(pedido.data_agendamento), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Novo Pedido */}
      {showNovoPedido && (
        <NovoPedidoModal 
          onClose={() => setShowNovoPedido(false)}
          onSave={() => {
            setShowNovoPedido(false)
            loadPedidos()
            loadDashboard()
          }}
          getAuthHeaders={getAuthHeaders}
        />
      )}
    </Layout>
  )
}

// Componente Modal para Novo Pedido
function NovoPedidoModal({ onClose, onSave, getAuthHeaders }) {
  const [formData, setFormData] = useState({
    cliente_nome: '',
    cliente_telefone: '',
    cliente_email: '',
    produto: '',
    valor_venda: '',
    categoria: 'pago',
    data_agendamento: '',
    periodo_entrega: '',
    observacoes: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onSave()
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao criar pedido')
      }
    } catch (error) {
      alert('Erro ao criar pedido')
    }
    
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Novo Pedido</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Cliente *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cliente_nome}
                  onChange={(e) => setFormData({ ...formData, cliente_nome: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.cliente_telefone}
                  onChange={(e) => setFormData({ ...formData, cliente_telefone: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.cliente_email}
                  onChange={(e) => setFormData({ ...formData, cliente_email: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Produto *
                </label>
                <input
                  type="text"
                  required
                  value={formData.produto}
                  onChange={(e) => setFormData({ ...formData, produto: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor da Venda *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.valor_venda}
                  onChange={(e) => setFormData({ ...formData, valor_venda: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria *
                </label>
                <select
                  required
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="input"
                >
                  <option value="pago">Pago</option>
                  <option value="logzz">LOGZZ</option>
                  <option value="after_pay">After Pay</option>
                </select>
              </div>

              {formData.categoria === 'logzz' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Agendamento
                    </label>
                    <input
                      type="date"
                      value={formData.data_agendamento}
                      onChange={(e) => setFormData({ ...formData, data_agendamento: e.target.value })}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Período Entrega
                    </label>
                    <select
                      value={formData.periodo_entrega}
                      onChange={(e) => setFormData({ ...formData, periodo_entrega: e.target.value })}
                      className="input"
                    >
                      <option value="">Selecione</option>
                      <option value="Manhã (8h-12h)">Manhã (8h-12h)</option>
                      <option value="Tarde (12h-18h)">Tarde (12h-18h)</option>
                      <option value="Noite (18h-22h)">Noite (18h-22h)</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                rows={3}
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                className="input resize-none"
              />
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
                {loading ? 'Salvando...' : 'Salvar Pedido'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}