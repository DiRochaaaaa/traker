'use client'

import { useState, useEffect } from 'react'
import { LoginForm } from './LoginForm'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // Verifica se está autenticado no localStorage
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const isAuth = localStorage.getItem('tracker_authenticated')
        setIsAuthenticated(isAuth === 'true')
      }
    }

    checkAuth()
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    )
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  // Show app if authenticated
  return <>{children}</>
} 