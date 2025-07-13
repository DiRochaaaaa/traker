'use client'

import { DollarSign, TrendingDown, TrendingUp, Target, MousePointerClick, ShoppingBag } from 'lucide-react'
import { AccountSummary } from './AccountSummaryTable'

interface AccountMobileCardProps {
  summary: AccountSummary
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const getProfitColor = (profit: number) => (profit >= 0 ? 'text-green-400' : 'text-red-400')

const getRoasColor = (roas: number) => {
  if (roas >= 2) return 'text-green-400'
  if (roas >= 1) return 'text-yellow-400'
  return 'text-red-400'
}

export function AccountMobileCard({ summary }: AccountMobileCardProps) {
  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-2.5">
      <div className="mb-2">
        <h4 className="text-sm font-semibold text-white truncate">{summary.accountName}</h4>
        <p className="text-xs text-gray-400 truncate">{summary.accountId}</p>
      </div>
      <div className="grid grid-cols-4 gap-1 text-xs">
        <div className="text-center bg-gray-800/30 rounded p-1">
          <ShoppingBag className="h-3 w-3 text-gray-300 mx-auto mb-0.5" />
          <p className="text-[10px] text-gray-400 leading-none">Vendas</p>
          <p className="text-[11px] font-bold text-gray-300 leading-none">
            {summary.compras}
          </p>
        </div>
        <div className="text-center bg-gray-800/30 rounded p-1">
          <DollarSign className="h-3 w-3 text-green-400 mx-auto mb-0.5" />
          <p className="text-[10px] text-gray-400 leading-none">Fat.</p>
          <p className="text-[11px] font-bold text-green-400 leading-none">
            {formatCurrency(summary.faturamento)}
          </p>
        </div>
        <div className="text-center bg-gray-800/30 rounded p-1">
          <DollarSign className="h-3 w-3 text-orange-400 mx-auto mb-0.5" />
          <p className="text-[10px] text-gray-400 leading-none">Com.</p>
          <p className="text-[11px] font-bold text-orange-400 leading-none">
            {formatCurrency(summary.comissao)}
          </p>
        </div>
        <div className="text-center bg-gray-800/30 rounded p-1">
          <TrendingDown className="h-3 w-3 text-blue-400 mx-auto mb-0.5" />
          <p className="text-[10px] text-gray-400 leading-none">Gasto</p>
          <p className="text-[11px] font-bold text-blue-400 leading-none">
            {formatCurrency(summary.valorUsado)}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1 text-xs mt-1">
        <div className="text-center bg-gray-800/30 rounded p-1">
          <TrendingUp className={`h-3 w-3 mx-auto mb-0.5 ${getProfitColor(summary.lucro)}`} />
          <p className="text-[10px] text-gray-400 leading-none">Lucro</p>
          <p className={`text-[11px] font-bold leading-none ${getProfitColor(summary.lucro)}`}>
            {formatCurrency(summary.lucro)}
          </p>
        </div>
        <div className="text-center bg-gray-800/30 rounded p-1">
          <Target className={`h-3 w-3 mx-auto mb-0.5 ${getRoasColor(summary.roas)}`} />
          <p className="text-[10px] text-gray-400 leading-none">ROAS</p>
          <p className={`text-[11px] font-bold leading-none ${getRoasColor(summary.roas)}`}>{summary.roas.toFixed(2)}</p>
        </div>
        <div className="text-center bg-gray-800/30 rounded p-1">
          <MousePointerClick className="h-3 w-3 text-gray-300 mx-auto mb-0.5" />
          <p className="text-[10px] text-gray-400 leading-none">CPA</p>
          <p className="text-[11px] font-bold text-gray-300 leading-none">
            {formatCurrency(summary.cpa)}
          </p>
        </div>
      </div>
    </div>
  )
}
