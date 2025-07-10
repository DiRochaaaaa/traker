'use client'

import { ShoppingBag, DollarSign, TrendingUp, Receipt, ArrowUpCircle, Target } from 'lucide-react'
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
  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-2.5">
      <div className="mb-2">
        <h4 className="text-sm font-semibold text-white truncate">{platform.plataforma}</h4>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">
            {platform.vendas} {platform.vendas === 1 ? 'venda' : 'vendas'}
          </span>
          {platform.taxaUpsellTicket > 0 && (
            <span className="text-green-400 font-medium">
              {formatPercentage(platform.taxaUpsellTicket)} ↗
            </span>
          )}
        </div>
      </div>
      
      {/* Métricas principais - 2x3 grid */}
      <div className="grid grid-cols-2 gap-1 text-xs mb-2">
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
            {formatCurrency(platform.ticketMedio)}
          </p>
        </div>
      </div>

      {/* Métricas de Upsell */}
      {(platform.upsellCount > 0 || platform.orderbumpCount > 0) && (
        <div className="grid grid-cols-3 gap-1 text-xs border-t border-gray-700/50 pt-2">
          <div className="text-center bg-gray-800/20 rounded p-1">
            <ArrowUpCircle className="h-2.5 w-2.5 text-cyan-400 mx-auto mb-0.5" />
            <p className="text-[9px] text-gray-500 leading-none">Ups</p>
            <p className="text-[10px] font-bold text-cyan-400 leading-none">
              {platform.upsellCount}
            </p>
          </div>
          <div className="text-center bg-gray-800/20 rounded p-1">
            <Target className="h-2.5 w-2.5 text-indigo-400 mx-auto mb-0.5" />
            <p className="text-[9px] text-gray-500 leading-none">Bump</p>
            <p className="text-[10px] font-bold text-indigo-400 leading-none">
              {platform.orderbumpCount}
            </p>
          </div>
          <div className="text-center bg-gray-800/20 rounded p-1">
            <Receipt className="h-2.5 w-2.5 text-yellow-400 mx-auto mb-0.5" />
            <p className="text-[9px] text-gray-500 leading-none">Base</p>
            <p className="text-[10px] font-bold text-yellow-400 leading-none">
              {formatCurrency(platform.ticketMedioBase)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 