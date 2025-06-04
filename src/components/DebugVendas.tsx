'use client'

import { useState, useEffect } from 'react'

interface VendaDebug {
  id: number
  created_at: string
  campaign_id: string | null
  faturamento_bruto: string | null
  tipo: string | null
  produto: string | null
}

export function DebugVendas() {
  const [vendas, setVendas] = useState<VendaDebug[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<string>('today')

  const fetchVendas = async (selectedPeriod: string) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log(`🔍 [DEBUG] Buscando vendas para: ${selectedPeriod}`)
      const response = await fetch(`/api/vendas?period=${selectedPeriod}`)
      const result = await response.json()
      
      console.log(`📊 [DEBUG] Resposta da API:`, result)
      
      if (result.success) {
        setVendas(result.data)
        console.log(`✅ [DEBUG] ${result.data.length} vendas carregadas`)
      } else {
        setError(result.error)
        console.error(`❌ [DEBUG] Erro:`, result.error)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      console.error(`💥 [DEBUG] Exceção:`, err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVendas(period)
  }, [period])

  const calcularFaturamento = () => {
    return vendas.reduce((total, venda) => {
      const valor = parseFloat(venda.faturamento_bruto || '0')
      return total + valor
    }, 0)
  }

  const contarVendas = () => {
    return vendas.filter(venda => {
      const tipo = venda.tipo?.toLowerCase() || ''
      return tipo === 'main' || tipo === '' || (!tipo.includes('upsell') && !tipo.includes('orderbump'))
    }).length
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-white mb-4">🔍 Debug de Vendas</h3>
      
      {/* Seletor de Período */}
      <div className="mb-4">
        <label className="block text-sm text-gray-300 mb-2">Período:</label>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md"
        >
          <option value="today">Hoje</option>
          <option value="yesterday">Ontem</option>
          <option value="last_7_days">Últimos 7 dias</option>
          <option value="this_month">Este mês</option>
        </select>
        <button
          onClick={() => fetchVendas(period)}
          disabled={loading}
          className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Carregando...' : 'Recarregar'}
        </button>
      </div>

      {/* Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-900 p-3 rounded">
          <p className="text-gray-400 text-sm">Total de Vendas</p>
          <p className="text-xl font-bold text-white">{vendas.length}</p>
        </div>
        <div className="bg-gray-900 p-3 rounded">
          <p className="text-gray-400 text-sm">Vendas Principais</p>
          <p className="text-xl font-bold text-green-400">{contarVendas()}</p>
        </div>
        <div className="bg-gray-900 p-3 rounded">
          <p className="text-gray-400 text-sm">Faturamento Total</p>
          <p className="text-xl font-bold text-blue-400">
            {new Intl.NumberFormat('pt-BR', { 
              style: 'currency', 
              currency: 'BRL' 
            }).format(calcularFaturamento())}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 p-3 rounded mb-4">
          <p className="text-red-300">❌ Erro: {error}</p>
        </div>
      )}

      {/* Lista de Vendas */}
      {vendas.length > 0 && (
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-800">
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 text-gray-300">Data</th>
                <th className="text-left py-2 text-gray-300">Produto</th>
                <th className="text-left py-2 text-gray-300">Tipo</th>
                <th className="text-right py-2 text-gray-300">Valor</th>
                <th className="text-left py-2 text-gray-300">Campaign ID</th>
              </tr>
            </thead>
            <tbody>
              {vendas.map((venda) => (
                <tr key={venda.id} className="border-b border-gray-700/50">
                  <td className="py-1 text-gray-300">
                    {new Date(venda.created_at).toLocaleString('pt-BR')}
                  </td>
                  <td className="py-1 text-white">{venda.produto || '—'}</td>
                  <td className="py-1 text-yellow-400">{venda.tipo || 'main'}</td>
                  <td className="py-1 text-right text-green-400">
                    R$ {parseFloat(venda.faturamento_bruto || '0').toFixed(2)}
                  </td>
                  <td className="py-1 text-blue-400 font-mono text-xs">
                    {venda.campaign_id || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {vendas.length === 0 && !loading && !error && (
        <div className="text-center py-8 text-gray-400">
          Nenhuma venda encontrada para o período selecionado
        </div>
      )}
    </div>
  )
} 