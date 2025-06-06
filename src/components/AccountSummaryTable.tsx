'use client'

import { useMemo } from 'react'

export interface AccountSummary {
  accountId: string
  accountName: string
  faturamento: number
  comissao: number
  valorUsado: number
  lucro: number
  roas: number
  cpa: number
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
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="px-3 py-2 text-left text-gray-300">Conta</th>
              <th className="px-3 py-2 text-right text-gray-300">Faturamento</th>
              <th className="px-3 py-2 text-right text-gray-300">Comissão</th>
              <th className="px-3 py-2 text-right text-gray-300">Valor Usado</th>
              <th className="px-3 py-2 text-right text-gray-300">Lucro</th>
              <th className="px-3 py-2 text-right text-gray-300">ROAS</th>
              <th className="px-3 py-2 text-right text-gray-300">CPA</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {rows.map(row => (
              <tr key={row.accountId}>
                <td className="px-3 py-3 text-white font-medium">
                  {row.accountName}
                  <div className="text-xs text-gray-400">{row.accountId}</div>
                </td>
                <td className="px-3 py-3 text-right text-green-400">{formatCurrency(row.faturamento)}</td>
                <td className="px-3 py-3 text-right text-orange-400">{formatCurrency(row.comissao)}</td>
                <td className="px-3 py-3 text-right text-blue-400">{formatCurrency(row.valorUsado)}</td>
                <td className={`px-3 py-3 text-right ${getProfitColor(row.lucro)}`}>{formatCurrency(row.lucro)}</td>
                <td className={`px-3 py-3 text-right ${getRoasColor(row.roas)}`}>{row.roas.toFixed(2)}</td>
                <td className="px-3 py-3 text-right text-gray-300">{formatCurrency(row.cpa)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
