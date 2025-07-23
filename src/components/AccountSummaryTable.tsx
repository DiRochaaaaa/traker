'use client'

import { useMemo } from 'react'

import { DollarSign, TrendingDown, TrendingUp, Target, MousePointerClick, ShoppingBag } from 'lucide-react'
import { AccountMobileCard } from './AccountMobileCard'

        

export interface AccountSummary {
  accountId: string
  accountName: string
  faturamento: number
  comissao: number
  valorUsado: number
  lucro: number
  roas: number
  cpa: number
  compras: number
}

interface AccountSummaryTableProps {
  summaries: AccountSummary[]
  isLoading?: boolean
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export function AccountSummaryTable({ summaries, isLoading = false }: AccountSummaryTableProps) {
  const rows = useMemo(() => summaries, [summaries])

  // Calcular totais
  const totals = useMemo(() => {
    if (rows.length === 0) return null
    
    const totalCompras = rows.reduce((sum, row) => sum + row.compras, 0)
    const totalFaturamento = rows.reduce((sum, row) => sum + row.faturamento, 0)
    const totalComissao = rows.reduce((sum, row) => sum + row.comissao, 0)
    const totalValorUsado = rows.reduce((sum, row) => sum + row.valorUsado, 0)
    const totalLucro = rows.reduce((sum, row) => sum + row.lucro, 0)
    const totalRoas = totalValorUsado > 0 ? totalFaturamento / totalValorUsado : 0
    const totalCpa = totalCompras > 0 ? totalValorUsado / totalCompras : 0
    
    return {
      compras: totalCompras,
      faturamento: totalFaturamento,
      comissao: totalComissao,
      valorUsado: totalValorUsado,
      lucro: totalLucro,
      roas: totalRoas,
      cpa: totalCpa
    }
  }, [rows])

  if (isLoading) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 animate-pulse mb-6">
        <div className="h-5 bg-gray-700 rounded w-40 mb-4"></div>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-8 bg-gray-700 rounded w-full mb-2"></div>
        ))}
      </div>
    )
  }

  if (rows.length === 0) return null

  const getProfitColor = (profit: number) => (profit >= 0 ? 'text-green-400' : 'text-red-400')

  const getRoasColor = (roas: number) => {
    if (roas >= 2) return 'text-green-400'
    if (roas >= 1) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden mb-6">
      <div className="p-3 md:p-4 border-b border-gray-700">
        <h2 className="text-lg md:text-xl font-semibold text-white">Resumo por Conta</h2>
      </div>


      {/* Mobile cards */}
      <div className="block md:hidden p-3 space-y-3">
        {rows.map(row => (
          <AccountMobileCard key={row.accountId} summary={row} />
        ))}
        
        {/* Total card for mobile */}
        {totals && (
          <div className="bg-gray-700/50 border-2 border-blue-500/30 rounded-lg p-2.5 mt-3">
            <div className="mb-2">
              <h4 className="text-sm font-bold text-blue-300">TOTAL GERAL</h4>
            </div>
            <div className="grid grid-cols-4 gap-1 text-xs">
              <div className="text-center bg-gray-800/30 rounded p-1">
                <div className="text-gray-400">Vendas</div>
                <div className="text-white font-medium">{totals.compras}</div>
              </div>
              <div className="text-center bg-gray-800/30 rounded p-1">
                <div className="text-gray-400">Fatur.</div>
                <div className="text-green-400 font-medium text-[10px]">{formatCurrency(totals.faturamento)}</div>
              </div>
              <div className="text-center bg-gray-800/30 rounded p-1">
                <div className="text-gray-400">Lucro</div>
                <div className={`font-medium text-[10px] ${getProfitColor(totals.lucro)}`}>{formatCurrency(totals.lucro)}</div>
              </div>
              <div className="text-center bg-gray-800/30 rounded p-1">
                <div className="text-gray-400">ROAS</div>
                <div className={`font-medium ${getRoasColor(totals.roas)}`}>{totals.roas.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">

        <table className="min-w-full text-sm">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="px-3 py-2 text-left text-gray-300">Conta</th>
              <th className="px-3 py-2 text-right text-gray-300"><div className="inline-flex items-center gap-1"><ShoppingBag className="h-3 w-3" />Vendas</div></th>
              <th className="px-3 py-2 text-right text-gray-300"><div className="inline-flex items-center gap-1"><DollarSign className="h-3 w-3" />Faturamento</div></th>
              <th className="px-3 py-2 text-right text-gray-300"><div className="inline-flex items-center gap-1"><DollarSign className="h-3 w-3" />Comissão</div></th>
              <th className="px-3 py-2 text-right text-gray-300"><div className="inline-flex items-center gap-1"><TrendingDown className="h-3 w-3" />Valor Usado</div></th>
              <th className="px-3 py-2 text-right text-gray-300"><div className="inline-flex items-center gap-1"><TrendingUp className="h-3 w-3" />Lucro</div></th>
              <th className="px-3 py-2 text-right text-gray-300"><div className="inline-flex items-center gap-1"><Target className="h-3 w-3" />ROAS</div></th>
              <th className="px-3 py-2 text-right text-gray-300"><div className="inline-flex items-center gap-1"><MousePointerClick className="h-3 w-3" />CPA</div></th>

            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {rows.map(row => (
              <tr key={row.accountId}>
                <td className="px-3 py-3 text-white font-medium">
                  {row.accountName}
                  <div className="text-xs text-gray-400">{row.accountId}</div>
                </td>
                <td className="px-3 py-3 text-right text-gray-300">{row.compras}</td>
                <td className="px-3 py-3 text-right text-green-400">{formatCurrency(row.faturamento)}</td>
                <td className="px-3 py-3 text-right text-orange-400">{formatCurrency(row.comissao)}</td>
                <td className="px-3 py-3 text-right text-blue-400">{formatCurrency(row.valorUsado)}</td>
                <td className={`px-3 py-3 text-right ${getProfitColor(row.lucro)}`}>{formatCurrency(row.lucro)}</td>
                <td className={`px-3 py-3 text-right ${getRoasColor(row.roas)}`}>{row.roas.toFixed(2)}</td>
                <td className="px-3 py-3 text-right text-gray-300">{formatCurrency(row.cpa)}</td>
              </tr>
            ))}
            
            {/* Total row */}
            {totals && (
              <tr className="bg-gray-700/50 border-t-2 border-blue-500/30">
                <td className="px-3 py-3 text-blue-300 font-bold">
                  TOTAL GERAL
                </td>
                <td className="px-3 py-3 text-right text-white font-bold">{totals.compras}</td>
                <td className="px-3 py-3 text-right text-green-400 font-bold">{formatCurrency(totals.faturamento)}</td>
                <td className="px-3 py-3 text-right text-orange-400 font-bold">{formatCurrency(totals.comissao)}</td>
                <td className="px-3 py-3 text-right text-blue-400 font-bold">{formatCurrency(totals.valorUsado)}</td>
                <td className={`px-3 py-3 text-right font-bold ${getProfitColor(totals.lucro)}`}>{formatCurrency(totals.lucro)}</td>
                <td className={`px-3 py-3 text-right font-bold ${getRoasColor(totals.roas)}`}>{totals.roas.toFixed(2)}</td>
                <td className="px-3 py-3 text-right text-white font-bold">{formatCurrency(totals.cpa)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
