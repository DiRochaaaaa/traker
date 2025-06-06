'use client'

import { useFacebookData } from '@/hooks/useFacebookData'
import { MetricsCard } from './MetricsCard'
import { CampaignsTable } from './CampaignsTable'
import { AccountSummaryTable, AccountSummary } from './AccountSummaryTable'
import { DateSelector } from './DateSelector'
import { ColorConfigModal } from './ColorConfigModal'
import { RefreshCw, Filter, ShoppingBag, Settings, Megaphone } from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'

interface AccountInfo {
  id: string
  name: string
  accountId: string
}

export function Dashboard() {
  const [colorConfigOpen, setColorConfigOpen] = useState(false)
  const [availableAccounts, setAvailableAccounts] = useState<AccountInfo[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  
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
    forceRefresh
  } = useFacebookData()

  // Buscar contas disponíveis dinamicamente
  useEffect(() => {
    const fetchAvailableAccounts = async () => {
      try {
        const response = await fetch('/api/facebook/test')
        const data = await response.json()
        
        if (data.success && data.accountTests) {
          const accounts: AccountInfo[] = []
          
          // Filtrar apenas os testes de contas (não de campanhas)
          const accountTests = data.accountTests.filter((test: { type?: string }) => !test.type)
          
          accountTests.forEach((test: { success: boolean; data: { name?: string }; accountId: string }, index: number) => {
            if (test.success && test.data) {
              accounts.push({
                id: `account${index + 1}`,
                name: test.data.name || `Conta ${index + 1}`,
                accountId: test.accountId.replace('act_', '')
              })
            }
          })
          
          setAvailableAccounts(accounts)
        }
      } catch (error) {
        console.error('Erro ao buscar contas disponíveis:', error)
      }
    }

    fetchAvailableAccounts()
  }, [])

  const metrics = useMemo(() => processMetrics(), [processMetrics])
  const totals = useMemo(() => getTotals(metrics), [metrics, getTotals])
  const plataformaMetrics = useMemo(() => getPlataformaMetrics(), [getPlataformaMetrics])

  const accountSummaries = useMemo<AccountSummary[]>(() => {
    const map: Record<string, { faturamento: number; comissao: number; valorUsado: number; compras: number }> = {}

    metrics.forEach(metric => {
      const acc = map[metric.account_id] || { faturamento: 0, comissao: 0, valorUsado: 0, compras: 0 }
      acc.faturamento += metric.faturamento
      acc.comissao += metric.comissao
      acc.valorUsado += metric.valorUsado
      acc.compras += metric.compras
      map[metric.account_id] = acc
    })

    return Object.entries(map)
      .map(([accountId, data]) => {
        const accountName = availableAccounts.find(a => a.accountId === accountId)?.name || accountId
        const lucro = data.comissao - data.valorUsado
        const roas = data.valorUsado > 0 ? data.faturamento / data.valorUsado : 0
        const cpa = data.compras > 0 ? data.valorUsado / data.compras : 0
        return { accountId, accountName, faturamento: data.faturamento, comissao: data.comissao, valorUsado: data.valorUsado, lucro, roas, cpa }
      })
      .sort((a, b) => b.lucro - a.lucro)
  }, [metrics, availableAccounts])

  // 🎯 Função para detectar performance geral excelente
  const isExceptionalPerformance = useMemo(() => {
    return totals.lucro > 0 && totals.roas > 2 && totals.compras > 0
  }, [totals])

  // 🏆 Função para obter badge de performance
  const getPerformanceBadge = () => {
    if (isExceptionalPerformance) {
      return (
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-900/50 to-emerald-900/50 px-4 py-2 rounded-full border border-green-500/40 shadow-lg shadow-green-500/10">
          <span className="text-green-400 text-lg animate-pulse">🏆</span>
          <span className="text-green-300 text-sm font-semibold">Performance Excepcional</span>
          <span className="text-green-400 text-lg animate-bounce">🚀</span>
        </div>
      )
    }
    return null
  }

  // Função de refresh melhorada com controle local
  const handleRefresh = async () => {
    if (isRefreshing) {
      console.log('🚫 Refresh já em andamento, ignorando clique')
      return
    }

    console.log('🔄 Iniciando refresh manual do botão')
    setIsRefreshing(true)
    
    try {
      await forceRefresh()
      console.log('✅ Refresh manual concluído')
    } catch (error) {
      console.error('❌ Erro no refresh manual:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 p-6 md:p-8 rounded-lg shadow-xl max-w-md w-full">
          <div className="text-center">
            <h2 className="text-lg md:text-xl font-semibold text-red-400 mb-4">Erro ao carregar dados</h2>
            <p className="text-gray-300 mb-6 text-sm md:text-base">{error}</p>
            <button
              onClick={handleRefresh}
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
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div>
              <div className="flex flex-col lg:flex-row lg:items-center lg:gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard Meta Ads</h1>
                  <p className="text-gray-400 mt-1 text-sm md:text-base">Acompanhe o desempenho das suas campanhas em tempo real</p>
                </div>
                {!loading && getPerformanceBadge() && (
                  <div className="mt-3 lg:mt-0">
                    {getPerformanceBadge()}
                  </div>
                )}
              </div>
            </div>
            {/* Mobile: Grid 2x2 com ícones compactos */}
            <div className="grid grid-cols-2 gap-2 sm:hidden mobile-button-grid">
              <button
                onClick={() => {
                  console.log('🎨 Abrindo configuração de cores...')
                  setColorConfigOpen(true)
                }}
                className="flex flex-col items-center justify-center p-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Settings className="h-4 w-4 mb-1" />
                <span className="text-xs font-medium">Cores</span>
              </button>
              <Link
                href="/vendas"
                className="flex flex-col items-center justify-center p-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <ShoppingBag className="h-4 w-4 mb-1" />
                <span className="text-xs font-medium">Vendas</span>
              </Link>
              <Link
                href="/campanhas"
                className="flex flex-col items-center justify-center p-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Megaphone className="h-4 w-4 mb-1" />
                <span className="text-xs font-medium">Campanhas</span>
              </Link>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex flex-col items-center justify-center p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mb-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="text-xs font-medium">{isRefreshing ? 'Atualizando...' : 'Refresh'}</span>
              </button>
            </div>

            {/* Tablet: Layout horizontal compacto */}
            <div className="hidden sm:flex lg:hidden items-center justify-center space-x-2">
              <button
                onClick={() => {
                  console.log('🎨 Abrindo configuração de cores...')
                  setColorConfigOpen(true)
                }}
                className="flex items-center justify-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                title="Configurar Cores"
              >
                <Settings className="h-4 w-4" />
              </button>
              <Link
                href="/vendas"
                className="flex items-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                title="Ver Vendas"
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="text-sm">Vendas</span>
              </Link>
              <Link
                href="/campanhas"
                className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                title="Resumo de Campanhas"
              >
                <Megaphone className="h-4 w-4" />
                <span className="text-sm">Campanhas</span>
              </Link>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing || loading.isInitialLoad || loading.campaigns || loading.vendas}
                className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={(isRefreshing || loading.isInitialLoad || loading.campaigns || loading.vendas) ? 'Carregando...' : 'Atualizar'}
              >
                <RefreshCw className={`h-4 w-4 ${(isRefreshing || loading.isInitialLoad || loading.campaigns || loading.vendas) ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Desktop: Layout completo */}
            <div className="hidden lg:flex items-center space-x-2 justify-end">
              <button
                onClick={() => {
                  console.log('🎨 Abrindo configuração de cores...')
                  setColorConfigOpen(true)
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                <Settings className="h-4 w-4" />
                <span>Cores</span>
              </button>
              <Link
                href="/vendas"
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Ver Vendas</span>
              </Link>
              <Link
                href="/campanhas"
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Megaphone className="h-4 w-4" />
                <span>Campanhas</span>
              </Link>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing || loading.isInitialLoad || loading.campaigns || loading.vendas}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                <RefreshCw className={`h-4 w-4 ${(isRefreshing || loading.isInitialLoad || loading.campaigns || loading.vendas) ? 'animate-spin' : ''}`} />
                <span>{(isRefreshing || loading.isInitialLoad || loading.campaigns || loading.vendas) ? 'Carregando...' : 'Atualizar'}</span>
              </button>
            </div>
          </div>
        </div>


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
                {availableAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.accountId})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Account Summaries */}
        <AccountSummaryTable summaries={accountSummaries} isLoading={loading.campaigns || loading.vendas} />

        {/* Metrics Cards - Sempre visíveis com loading states */}
        {(loading.isInitialLoad || loading.campaigns || loading.vendas) ? (
          <>
            {/* Loading indicators no topo durante carregamento */}
            <div className="text-center py-4 mb-6">
              <RefreshCw className="h-5 w-5 animate-spin mx-auto text-blue-400 mb-2" />
              <p className="text-gray-400 text-sm">Carregando dados...</p>
            </div>

            {/* Skeleton para Main Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-4 md:p-6 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-4 bg-gray-700 rounded w-24"></div>
                    <div className="h-6 w-6 bg-gray-700 rounded"></div>
                  </div>
                  <div className="h-8 bg-gray-700 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-20"></div>
                </div>
              ))}
            </div>

            {/* Skeleton para Secondary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-4 md:p-6 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-4 bg-gray-700 rounded w-24"></div>
                    <div className="h-6 w-6 bg-gray-700 rounded"></div>
                  </div>
                  <div className="h-8 bg-gray-700 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-20"></div>
                </div>
              ))}
            </div>

            {/* Skeleton para Upsell/Orderbump Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-4 md:p-6 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-4 bg-gray-700 rounded w-24"></div>
                    <div className="h-6 w-6 bg-gray-700 rounded"></div>
                  </div>
                  <div className="h-8 bg-gray-700 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-20"></div>
                </div>
              ))}
            </div>

            {/* Skeleton para tabela de campanhas */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden mb-6">
              <div className="p-3 md:p-4 border-b border-gray-700 animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-48"></div>
              </div>
              
              {/* Mobile skeleton list */}
              <div className="block md:hidden p-3 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-lg animate-pulse">
                    <div className="p-2.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex-1 pr-2">
                          <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-5 bg-gray-700 rounded w-12"></div>
                          <div className="h-3 w-3 bg-gray-700 rounded"></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {Array.from({ length: 4 }).map((_, j) => (
                          <div key={j} className="text-center bg-gray-800/30 rounded p-1">
                            <div className="h-2.5 w-2.5 bg-gray-700 rounded-full mx-auto mb-0.5"></div>
                            <div className="h-2.5 bg-gray-700 rounded w-8 mx-auto mb-0.5"></div>
                            <div className="h-2.5 bg-gray-700 rounded w-10 mx-auto"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop skeleton table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/50">
                    <tr>
                      {Array.from({ length: 10 }).map((_, i) => (
                        <th key={i} className="px-3 py-3">
                          <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="border-b border-gray-700">
                        {Array.from({ length: 10 }).map((_, j) => (
                          <td key={j} className="px-3 py-4">
                            <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <>


            {/* Main Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              <MetricsCard
                title="Comissão Total"
                value={totals.comissao}
                format="currency"
                icon="revenue"
                isHighPerformance={isExceptionalPerformance}
              />
              <MetricsCard
                title="Lucro Total"
                value={totals.lucro}
                format="currency"
                icon="profit"
                isHighPerformance={isExceptionalPerformance}
                additionalData={{ faturamento: totals.faturamento }}
              />
              <MetricsCard
                title="ROAS Médio"
                value={totals.roas}
                format="number"
                icon="roas"
                isHighPerformance={isExceptionalPerformance}
              />
              <MetricsCard
                title="Compras Principais"
                value={totals.compras}
                format="number"
                icon="purchases"
                isHighPerformance={isExceptionalPerformance}
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

      {/* Color Configuration Modal */}
      <ColorConfigModal
        isOpen={colorConfigOpen}
        onClose={() => setColorConfigOpen(false)}
        onSave={(config) => {
          console.log('Novas configurações de cores:', config)
          localStorage.setItem('colorConfig', JSON.stringify(config))
          window.location.reload() // Recarregar para aplicar as novas configurações
        }}
      />
    </div>
  )
} 