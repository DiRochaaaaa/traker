'use client'

import { ShoppingBag, DollarSign, TrendingUp, Receipt } from 'lucide-react'
import { PlataformaMetrics } from '@/hooks/useFacebookData'

interface PlatformMobileCardProps {
  platform: PlataformaMetrics
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export function PlatformMobileCard({ platform }: PlatformMobileCardProps) {
  const ticketMedio = platform.vendas > 0 ? platform.faturamento / platform.vendas : 0

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-2.5">
      <div className="mb-2">
        <h4 className="text-sm font-semibold text-white truncate">{platform.plataforma}</h4>
        <p className="text-xs text-gray-400">
          {platform.vendas} {platform.vendas === 1 ? 'venda' : 'vendas'}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-1 text-xs">
        <div className="text-center bg-gray-800/30 rounded p-1">
          <ShoppingBag className="h-3 w-3 text-blue-400 mx-auto mb-0.5" />
          <p className="text-[10px] text-gray-400 leading-none">Vendas</p>
          <p className="text-[11px] font-bold text-blue-400 leading-none">
            {platform.vendas}
          </p>
        </div>
        <div className="text-center bg-gray-800/30 rounded p-1">
          <DollarSign className="h-3 w-3 text-green-400 mx-auto mb-0.5" />
          <p className="text-[10px] text-gray-400 leading-none">Fatur.</p>
          <p className="text-[11px] font-bold text-green-400 leading-none">
            {formatCurrency(platform.faturamento)}
          </p>
        </div>
        <div className="text-center bg-gray-800/30 rounded p-1">
          <TrendingUp className="h-3 w-3 text-orange-400 mx-auto mb-0.5" />
          <p className="text-[10px] text-gray-400 leading-none">Comis.</p>
          <p className="text-[11px] font-bold text-orange-400 leading-none">
            {formatCurrency(platform.comissao)}
          </p>
        </div>
        <div className="text-center bg-gray-800/30 rounded p-1">
          <Receipt className="h-3 w-3 text-purple-400 mx-auto mb-0.5" />
          <p className="text-[10px] text-gray-400 leading-none">Ticket</p>
          <p className="text-[11px] font-bold text-purple-400 leading-none">
            {formatCurrency(ticketMedio)}
          </p>
        </div>
      </div>
    </div>
  )
} 