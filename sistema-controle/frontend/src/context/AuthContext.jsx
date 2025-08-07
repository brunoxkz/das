import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há token salvo
    const token = localStorage.getItem('controle_token')
    const userData = localStorage.getItem('controle_user')
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error)
        localStorage.removeItem('controle_token')
        localStorage.removeItem('controle_user')
      }
    }
    
    setLoading(false)
  }, [])

  const login = async (email, senha) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro no login')
      }

      localStorage.setItem('controle_token', data.token)
      localStorage.setItem('controle_user', JSON.stringify(data.user))
      setUser(data.user)

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('controle_token')
    localStorage.removeItem('controle_user')
    setUser(null)
  }

  const getAuthHeaders = () => {
    const token = localStorage.getItem('controle_token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const value = {
    user,
    login,
    logout,
    loading,
    getAuthHeaders
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}