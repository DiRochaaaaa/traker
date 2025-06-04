'use client'

import { useEffect } from 'react'
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react'

export interface ToastProps {
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
  duration?: number
  onClose: () => void
}

export function Toast({ type, title, message, duration = 4000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-400" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-400" />
    }
  }

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-900/90 border-green-500/50 shadow-green-500/20'
      case 'error':
        return 'bg-red-900/90 border-red-500/50 shadow-red-500/20'
      case 'warning':
        return 'bg-yellow-900/90 border-yellow-500/50 shadow-yellow-500/20'
      case 'info':
        return 'bg-blue-900/90 border-blue-500/50 shadow-blue-500/20'
    }
  }

  return (
    <div className={`
      fixed top-4 right-4 z-50 min-w-80 max-w-96 p-4 rounded-lg border backdrop-blur-sm
      ${getColors()}
      animate-in slide-in-from-top-2 fade-in duration-300
      shadow-xl
    `}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white">
            {title}
          </div>
          {message && (
            <div className="text-xs text-gray-300 mt-1">
              {message}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors ml-2"
        >
          ✕
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-b-lg overflow-hidden">
        <div 
          className="h-full bg-white/30 rounded-b-lg animate-toast-progress"
          style={{ animationDuration: `${duration}ms` }}
        />
      </div>
    </div>
  )
} 