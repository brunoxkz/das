import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, User, Lock } from 'lucide-react'

export default function Login() {
  const { user, login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (user) {
    return <Navigate to={user.tipo === 'admin' ? '/admin' : '/dashboard'} replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(formData.email, formData.senha)
    
    if (!result.success) {
      setError(result.error)
    }
    
    setLoading(false)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const quickLogin = (type) => {
    if (type === 'admin') {
      setFormData({
        email: 'admin@controle.com',
        senha: 'admin123'
      })
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-primary-600 rounded-xl flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Sistema Controle
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Acesse sua conta para gerenciar atendimentos
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1 relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="seu@email.com"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <div className="mt-1 relative">
                  <input
                    id="senha"
                    name="senha"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.senha}
                    onChange={handleChange}
                    className="input pl-10 pr-10"
                    placeholder="Digite sua senha"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <div className="border-t border-gray-200 pt-6">
              <p className="text-xs text-gray-500 text-center mb-4">Acesso rápido para desenvolvimento:</p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => quickLogin('admin')}
                  className="w-full btn btn-secondary text-sm"
                >
                  Login Admin (admin@controle.com)
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Info */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800">
          <div className="h-full flex items-center justify-center p-12">
            <div className="text-center text-white">
              <div className="mb-8">
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <User className="h-12 w-12" />
                </div>
                <h3 className="text-3xl font-bold mb-4">
                  Controle Completo
                </h3>
                <p className="text-xl text-primary-100">
                  Gerencie seus atendimentos de forma eficiente
                </p>
              </div>
              
              <div className="space-y-4 text-left">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary-300 rounded-full mr-3"></div>
                  <span>Dashboard individual por atendente</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary-300 rounded-full mr-3"></div>
                  <span>Pedidos: Pago, LOGZZ, After Pay</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary-300 rounded-full mr-3"></div>
                  <span>Filtros de data e categoria</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary-300 rounded-full mr-3"></div>
                  <span>Tutoriais e treinamentos</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary-300 rounded-full mr-3"></div>
                  <span>Visão admin completa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}