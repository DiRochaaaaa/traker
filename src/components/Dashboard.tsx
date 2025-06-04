'use client'

import { useFacebookData } from '@/hooks/useFacebookData'
import { MetricsCard } from './MetricsCard'
import { CampaignsTable } from './CampaignsTable'
import { DateSelector } from './DateSelector'
import { RefreshCw, Filter, TestTube, ShoppingBag } from 'lucide-react'
import { useMemo, useState } from 'react'
import Link from 'next/link'

export function Dashboard() {
  const [testResults, setTestResults] = useState<{
    success: boolean
    error?: string
    details?: string
    tokenTest?: { user?: { name?: string } }
    summary?: { accountsAccessible: number; totalAccounts: number; campaignsFound: number }
  } | null>(null)
  const [testLoading, setTestLoading] = useState(false)
  
  const {
    loading,
    error,
    selectedAccount,
    selectedPeriod,
    setSelectedAccount,
    setSelectedPeriod,
    processMetrics,
    getTotals,
    getPlataformaMetrics,
    refresh
  } = useFacebookData()

  const testConnectivity = async () => {
    setTestLoading(true)
    try {
      const response = await fetch('/api/facebook/test')
      const data = await response.json()
      setTestResults(data)
    } catch (error) {
      setTestResults({
        success: false,
        error: 'Erro ao testar conectividade',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setTestLoading(false)
    }
  }

  const metrics = useMemo(() => processMetrics(), [processMetrics])
  const totals = useMemo(() => getTotals(metrics), [metrics, getTotals])
  const plataformaMetrics = useMemo(() => getPlataformaMetrics(), [getPlataformaMetrics])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 p-6 md:p-8 rounded-lg shadow-xl max-w-md w-full">
          <div className="text-center">
            <h2 className="text-lg md:text-xl font-semibold text-red-400 mb-4">Erro ao carregar dados</h2>
            <p className="text-gray-300 mb-6 text-sm md:text-base">{error}</p>
            <button
              onClick={refresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard Meta Ads</h1>
              <p className="text-gray-400 mt-1 text-sm md:text-base">Acompanhe o desempenho das suas campanhas em tempo real</p>
            </div>
            <div className="flex items-center space-x-2 justify-center md:justify-end">
              <Link
                href="/vendas"
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm md:text-base"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Ver Vendas</span>
              </Link>
              <button
                onClick={testConnectivity}
                disabled={testLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
              >
                <TestTube className={`h-4 w-4 ${testLoading ? 'animate-spin' : ''}`} />
                <span>Testar API</span>
              </button>
              <button
                onClick={refresh}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="mb-4 md:mb-6">
            <div className={`border rounded-lg p-4 ${testResults.success ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-sm font-medium ${testResults.success ? 'text-green-300' : 'text-red-300'}`}>
                  Teste de Conectividade - {testResults.success ? 'Sucesso' : 'Falha'}
                </h3>
                <button
                  onClick={() => setTestResults(null)}
                  className="text-gray-400 hover:text-gray-300 text-sm"
                >
                  ✕
                </button>
              </div>
              <div className="text-xs text-gray-300 space-y-1">
                {testResults.success ? (
                  <>
                    <p>✅ Token válido: {testResults.tokenTest?.user?.name || 'Usuário'}</p>
                    <p>✅ Contas acessíveis: {testResults.summary?.accountsAccessible}/{testResults.summary?.totalAccounts}</p>
                    <p>✅ Campanhas encontradas: {testResults.summary?.campaignsFound}</p>
                  </>
                ) : (
                  <p>❌ {testResults.error}: {testResults.details}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Date Selector */}
        <div className="mb-4 md:mb-6">
          <DateSelector
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
        </div>



        {/* Account Filter */}
        <div className="mb-4 md:mb-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-y-0 md:space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-blue-400" />
                <span className="text-sm font-medium text-gray-300">Conta de Anúncios:</span>
              </div>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="block w-full md:w-auto px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
              >
                <option value="all">Todas as Contas</option>
                <option value="account1">Conta 1 (283711871364526)</option>
                <option value="account2">Conta 2 (1398807304184031)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8 md:py-12">
            <RefreshCw className="h-6 w-6 md:h-8 md:w-8 animate-spin mx-auto text-blue-400 mb-4" />
            <p className="text-gray-400 text-sm md:text-base">Carregando dados...</p>
          </div>
        )}

        {/* Metrics Cards */}
        {!loading && (
          <>
            {/* Summary Stats */}
            <div className="mb-4 md:mb-6 bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="text-base md:text-lg font-semibold text-white mb-2">Resumo</h3>
              <div className="text-sm text-gray-300 space-y-1">
                <div><span className="font-medium">{metrics.length}</span> campanhas com gasto maior que R$ 0,00</div>
                <div className="text-xs text-gray-400">
                  • <strong>Compras:</strong> Apenas vendas principais (main)<br/>
                  • <strong>Faturamento:</strong> Soma total (main + orderbump + upsell)<br/>
                  • <strong>Ticket Médio:</strong> Faturamento total ÷ vendas main<br/>
                  • <strong>CPA:</strong> Baseado em conversões reais (vendas main)
                </div>
              </div>
            </div>

            {/* Main Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              <MetricsCard
                title="Comissão Total"
                value={totals.comissao}
                format="currency"
                icon="revenue"
              />
              <MetricsCard
                title="Lucro Total"
                value={totals.lucro}
                format="currency"
                icon="profit"
              />
              <MetricsCard
                title="ROAS Médio"
                value={totals.roas}
                format="number"
                icon="roas"
              />
              <MetricsCard
                title="Compras Principais"
                value={totals.compras}
                format="number"
                icon="purchases"
              />
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              <MetricsCard
                title="Faturamento Total"
                value={totals.faturamento}
                format="currency"
                icon="revenue"
              />
              <MetricsCard
                title="Valor Investido"
                value={totals.valorUsado}
                format="currency"
                icon="revenue"
              />
              <MetricsCard
                title="Ticket Médio"
                value={totals.ticketMedio}
                format="currency"
                icon="revenue"
              />
              <MetricsCard
                title="CPA Médio"
                value={totals.cpa}
                format="currency"
                icon="cpa"
              />
            </div>

            {/* Upsell/Orderbump Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              <MetricsCard
                title="Total Upsells"
                value={totals.upsellCount}
                format="number"
                icon="purchases"
              />
              <MetricsCard
                title="Total Orderbumps"
                value={totals.orderbumpCount}
                format="number"
                icon="purchases"
              />
              <MetricsCard
                title="Taxa de Upsell"
                value={totals.compras > 0 ? (totals.upsellCount / totals.compras) * 100 : 0}
                format="percentage"
                icon="roas"
              />
              <MetricsCard
                title="Taxa de Orderbump"
                value={totals.compras > 0 ? (totals.orderbumpCount / totals.compras) * 100 : 0}
                format="percentage"
                icon="roas"
              />
            </div>

            {/* Platform Metrics */}
            {plataformaMetrics.length > 0 && (
              <div className="mb-6 md:mb-8">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-semibold text-white mb-4">Vendas por Plataforma</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left text-gray-300 py-3 px-2">Plataforma</th>
                          <th className="text-right text-gray-300 py-3 px-2">Vendas</th>
                          <th className="text-right text-gray-300 py-3 px-2">Faturamento</th>
                          <th className="text-right text-gray-300 py-3 px-2">Comissão</th>
                          <th className="text-right text-gray-300 py-3 px-2">Ticket Médio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plataformaMetrics.map((plataforma, index) => (
                          <tr key={index} className="border-b border-gray-700/50">
                            <td className="py-3 px-2 text-white font-medium">{plataforma.plataforma}</td>
                            <td className="py-3 px-2 text-right text-gray-300">{plataforma.vendas}</td>
                            <td className="py-3 px-2 text-right text-green-400 font-medium">
                              {new Intl.NumberFormat('pt-BR', { 
                                style: 'currency', 
                                currency: 'BRL' 
                              }).format(plataforma.faturamento)}
                            </td>
                            <td className="py-3 px-2 text-right text-orange-400">
                              {new Intl.NumberFormat('pt-BR', { 
                                style: 'currency', 
                                currency: 'BRL' 
                              }).format(plataforma.comissao)}
                            </td>
                            <td className="py-3 px-2 text-right text-blue-400">
                              {plataforma.vendas > 0 
                                ? new Intl.NumberFormat('pt-BR', { 
                                    style: 'currency', 
                                    currency: 'BRL' 
                                  }).format(plataforma.faturamento / plataforma.vendas)
                                : 'R$ 0,00'
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Campaigns Table */}
            <CampaignsTable campaigns={metrics} />
          </>
        )}
      </div>
    </div>
  )
} 