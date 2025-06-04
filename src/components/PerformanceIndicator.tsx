'use client'

import { useState, useEffect } from 'react'
import { Wifi, WifiOff, Clock, CheckCircle } from 'lucide-react'

interface PerformanceIndicatorProps {
  isLoading: boolean
  lastUpdate?: Date
  cacheHit?: boolean
}

export function PerformanceIndicator({ isLoading, lastUpdate, cacheHit }: PerformanceIndicatorProps) {
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('online')

  useEffect(() => {
    const handleOnline = () => setConnectionStatus('online')
    const handleOffline = () => setConnectionStatus('offline')

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    
    if (seconds < 60) return `${seconds}s atrás`
    if (minutes < 60) return `${minutes}m atrás`
    return `${Math.floor(minutes / 60)}h atrás`
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-lg px-3 py-2 shadow-xl">
        <div className="flex items-center gap-2 text-xs">
          {/* Status de conexão */}
          {connectionStatus === 'online' ? (
            <Wifi className="h-3 w-3 text-green-400" />
          ) : (
            <WifiOff className="h-3 w-3 text-red-400" />
          )}
          
          {/* Status de carregamento */}
          {isLoading ? (
            <div className="flex items-center gap-1 text-blue-400">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>Carregando...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-green-400">
              <CheckCircle className="h-3 w-3" />
              <span>Atualizado</span>
            </div>
          )}
          
          {/* Cache indicator */}
          {cacheHit && (
            <div className="flex items-center gap-1 text-yellow-400">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span>Cache</span>
            </div>
          )}
          
          {/* Última atualização */}
          {lastUpdate && (
            <div className="flex items-center gap-1 text-gray-400">
              <Clock className="h-3 w-3" />
              <span>{getTimeAgo(lastUpdate)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 