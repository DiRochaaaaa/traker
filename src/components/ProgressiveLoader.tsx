'use client'

import { useState, useEffect } from 'react'
import { CampaignMetrics } from '@/hooks/useFacebookData'
import { SkeletonCard } from './SkeletonCard'

interface ProgressiveLoaderProps {
  campaigns: CampaignMetrics[]
  isLoading: boolean
  children: (visibleCampaigns: CampaignMetrics[]) => React.ReactNode
  batchSize?: number
  delay?: number
}

export function ProgressiveLoader({ 
  campaigns, 
  isLoading, 
  children, 
  batchSize = 3, 
  delay = 200 
}: ProgressiveLoaderProps) {
  const [visibleCount, setVisibleCount] = useState(0)
  const [isProgressive, setIsProgressive] = useState(false)

  useEffect(() => {
    if (campaigns.length === 0 || isLoading) {
      setVisibleCount(0)
      setIsProgressive(false)
      return
    }

    // Se é o primeiro carregamento ou mudança significativa, usar carregamento progressivo
    const shouldStartProgressive = visibleCount === 0
    if (shouldStartProgressive) {
      setIsProgressive(true)
      
      const loadBatch = (currentCount: number) => {
        if (currentCount >= campaigns.length) {
          setIsProgressive(false)
          return
        }
        
        const nextCount = Math.min(currentCount + batchSize, campaigns.length)
        setVisibleCount(nextCount)
        
        if (nextCount < campaigns.length) {
          setTimeout(() => loadBatch(nextCount), delay)
        } else {
          setIsProgressive(false)
        }
      }
      
      // Começar com o primeiro batch
      setTimeout(() => loadBatch(0), 100)
    } else {
      // Se já temos campanhas visíveis, mostrar todas imediatamente
      setVisibleCount(campaigns.length)
      setIsProgressive(false)
    }
  }, [campaigns.length, batchSize, delay, isLoading]) // visibleCount é controlado internamente pelo efeito

  // Se está carregando dados iniciais, mostrar skeleton
  if (isLoading && campaigns.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  const visibleCampaigns = campaigns.slice(0, visibleCount)
  
  return (
    <div className="space-y-4">
      {children(visibleCampaigns)}
      
      {/* Mostrar skeleton para campanhas que ainda estão carregando */}
      {isProgressive && visibleCount < campaigns.length && (
        <div className="space-y-4">
          {Array.from({ length: Math.min(batchSize, campaigns.length - visibleCount) }).map((_, i) => (
            <div key={`loading-${i}`} className="animate-pulse">
              <SkeletonCard />
            </div>
          ))}
        </div>
      )}
      
      {/* Indicador de carregamento suave */}
      {isProgressive && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-blue-400 text-sm">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            Carregando campanhas... ({visibleCount}/{campaigns.length})
          </div>
        </div>
      )}
    </div>
  )
} 