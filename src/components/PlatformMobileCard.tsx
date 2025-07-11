'use client'

import { PlataformaMetrics } from '@/hooks/useFacebookData'
import { ArrowUpCircle } from 'lucide-react'

// Funções de formatação locais para evitar problemas de importação
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

interface PlatformMobileCardProps {
  platform: PlataformaMetrics
}

export const PlatformMobileCard = ({ platform }: PlatformMobileCardProps) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white">{platform.plataforma}</h3>
        <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
          {platform.vendas} {platform.vendas === 1 ? 'venda' : 'vendas'}
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Faturamento</span>
          <span className="font-medium text-green-400">{formatCurrency(platform.faturamento)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Comissão</span>
          <span className="font-medium text-orange-400">{formatCurrency(platform.comissao)}</span>
        </div>
        <div className="flex justify-between items-center border-t border-gray-700/60 pt-2 mt-2">
          <span className="text-gray-400">Ticket Médio</span>
          <span className="font-semibold text-blue-400">{formatCurrency(platform.ticketMedio)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Impacto Upsell</span>
          <span className={`font-semibold flex items-center gap-1 ${platform.upsellImpactPercent > 0 ? 'text-purple-400' : 'text-gray-500'}`}>
            {platform.upsellImpactPercent > 0 ? (
              <>
                <ArrowUpCircle className="h-3.5 w-3.5" />
                +{platform.upsellImpactPercent.toFixed(1)}%
              </>
            ) : (
              '-'
            )}
          </span>
        </div>
      </div>
    </div>
  )
} 