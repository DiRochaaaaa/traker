'use client'

import { useFacebookData } from '@/hooks/useFacebookData'
import { MetricsCard } from './MetricsCard'
import { Logo } from './Logo'
import { CampaignsTable } from './CampaignsTable'
import { AccountSummaryTable, AccountSummary } from './AccountSummaryTable'
import { FilterBar } from './FilterBar'
import { ConversionFunnel } from './ConversionFunnel'
import { ColorConfigModal } from './ColorConfigModal'
import { RefreshCw, ShoppingBag, Settings, Megaphone, ArrowUp, ChevronDown, ChevronUp } from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import BillingInfoCard from './BillingInfoCard'

interface AccountInfo {
  id: string
  name: string
  accountId: string
}

export function Dashboard() {
  const [colorConfigOpen, setColorConfigOpen] = useState(false)
  const [availableAccounts, setAvailableAccounts] = useState<AccountInfo[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [campaignsMinimized, setCampaignsMinimized] = useState(true) // Minimizado por padrão no mobile
  
  const {
    loading,
    error,
    selectedAccount,
    selectedPeriod,
    setSelectedAccount,
    setSelectedPeriod,
    processMetrics,
    processAllMetrics,
    getTotals,
    getPlataformaMetrics,
    getPlataformaTotals,
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
  const allMetrics = useMemo(() => processAllMetrics(), [processAllMetrics])
  const totals = useMemo(() => getTotals(metrics), [metrics, getTotals])
  const plataformaMetrics = useMemo(() => getPlataformaMetrics(), [getPlataformaMetrics])
  const plataformaTotals = useMemo(() => getPlataformaTotals(), [getPlataformaTotals])

  const accountSummaries = useMemo<AccountSummary[]>(() => {
    const map: Record<string, { faturamento: number; comissao: number; valorUsado: number; compras: number }> = {}

    allMetrics.forEach(metric => {
      const id = metric.account_id.replace('act_', '')

      const acc = map[id] || { faturamento: 0, comissao: 0, valorUsado: 0, compras: 0 }
      acc.faturamento += metric.faturamento
      acc.comissao += metric.comissao
      acc.valorUsado += metric.valorUsado
      acc.compras += metric.compras
      map[id] = acc
    })

    return Object.entries(map)
      .map(([id, data]) => {
        const accountName = availableAccounts.find(a => a.accountId === id)?.name || id
        const lucro = data.comissao - data.valorUsado
        const roas = data.valorUsado > 0 ? data.comissao / data.valorUsado : 0
        const cpa = data.compras > 0 ? data.valorUsado / data.compras : 0
        return {
          accountId: id,
          accountName,
          faturamento: data.faturamento,
          comissao: data.comissao,
          valorUsado: data.valorUsado,
          lucro,
          roas,
          cpa,
          compras: data.compras,
        }
      })
      .sort((a, b) => b.lucro - a.lucro)
  }, [allMetrics, availableAccounts])


  const getPlatformColor = (platformName: string) => {
    const name = platformName.toLowerCase()
    if (name.includes('cakto')) {
      return 'text-green-400'
    }
    if (name.includes('perfectpay')) {
      return 'text-teal-400'
    }
    return 'text-white'
  }

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
            <div className="w-full lg:w-auto">
              <div className="flex flex-col lg:flex-row items-center lg:items-center gap-4">
                <div className="w-full lg:w-auto">
                  <Logo />
                </div>
                <p className="text-gray-400 text-center lg:text-left text-base md:text-lg lg:ml-6">
                  Acompanhe o desempenho das suas campanhas em tempo real
                </p>
              </div>
            </div>
            {!loading.isInitialLoad && getPerformanceBadge() && (
              <div className="mt-3 lg:mt-0">
                {getPerformanceBadge()}
              </div>
            )}
            {/* Mobile: Botões em linha única */}
            <div className="flex items-center justify-between gap-2 sm:hidden px-1 touch-manipulation">
              <button
                onClick={() => {
                  console.log('🎨 Abrindo configuração de cores...')
                  setColorConfigOpen(true)
                }}
                className="flex-1 flex items-center justify-center px-4 py-2.5 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 transition-colors select-none touch-manipulation"
              >
                <Settings className="h-5 w-5 pointer-events-none" />
              </button>
              
              <Link
                href="/vendas"
                className="flex-1 flex items-center justify-center px-4 py-2.5 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 transition-colors select-none touch-manipulation"
              >
                <ShoppingBag className="h-5 w-5 pointer-events-none" />
              </Link>

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex-1 flex items-center justify-center px-4 py-2.5 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors select-none touch-manipulation"
              >
                <RefreshCw className={`h-5 w-5 pointer-events-none ${isRefreshing ? 'animate-spin' : ''}`} />
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

            {/* Desktop: Layout clean e consistente */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => {
                  console.log('🎨 Abrindo configuração de cores...')
                  setColorConfigOpen(true)
                }}
                className="flex items-center justify-center px-4 py-2.5 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
              
              <Link
                href="/vendas"
                className="flex items-center justify-center px-4 py-2.5 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ShoppingBag className="h-5 w-5" />
              </Link>

              <button
                onClick={handleRefresh}
                disabled={isRefreshing || loading.isInitialLoad || loading.campaigns || loading.vendas}
                className="flex items-center justify-center px-4 py-2.5 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={(isRefreshing || loading.isInitialLoad || loading.campaigns || loading.vendas) ? 'Carregando...' : 'Atualizar'}
              >
                <RefreshCw className={`h-5 w-5 ${(isRefreshing || loading.isInitialLoad || loading.campaigns || loading.vendas) ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Billing Info */}
        <BillingInfoCard accounts={availableAccounts.map(a => ({ id: `act_${a.accountId}`, name: a.name }))} />

        {/* Unified Filter Bar */}
        <FilterBar
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          selectedAccount={selectedAccount}
          onAccountChange={setSelectedAccount}
          availableAccounts={availableAccounts}
        />

        {/* Metrics Cards - Sempre visíveis com loading states */}
        {(loading.isInitialLoad || loading.campaigns || loading.vendas) ? (
          <>
            {/* Loading indicators no topo durante carregamento */}
            <div className="text-center py-4 mb-6">
              <RefreshCw className="h-5 w-5 animate-spin mx-auto text-blue-400 mb-2" />
              <p className="text-gray-400 text-sm">Carregando dados...</p>
            </div>

            {/* Skeleton para Main Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-3 md:p-4 animate-pulse">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-3 bg-gray-700 rounded w-20"></div>
                    <div className="h-5 w-5 bg-gray-700 rounded"></div>
                  </div>
                  <div className="h-6 bg-gray-700 rounded w-24 mb-1.5"></div>
                  <div className="h-2.5 bg-gray-700 rounded w-16"></div>
                </div>
              ))}
            </div>

            {/* Skeleton para Secondary Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-3 md:p-4 animate-pulse">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-3 bg-gray-700 rounded w-20"></div>
                    <div className="h-5 w-5 bg-gray-700 rounded"></div>
                  </div>
                  <div className="h-6 bg-gray-700 rounded w-24 mb-1.5"></div>
                  <div className="h-2.5 bg-gray-700 rounded w-16"></div>
                </div>
              ))}
            </div>

            {/* Skeleton para Upsell/Orderbump Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                 <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-3 md:p-4 animate-pulse">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-3 bg-gray-700 rounded w-20"></div>
                    <div className="h-5 w-5 bg-gray-700 rounded"></div>
                  </div>
                  <div className="h-6 bg-gray-700 rounded w-24 mb-1.5"></div>
                  <div className="h-2.5 bg-gray-700 rounded w-16"></div>
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
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4 mb-4 md:mb-6">
              <MetricsCard
                title="Faturamento Total"
                value={totals.faturamento}
                format="currency"
              />
               <MetricsCard
                title="Comissão Total"
                value={totals.comissao}
                format="currency"
                isHighPerformance={isExceptionalPerformance}
              />
              <MetricsCard
                title="Valor Investido"
                value={totals.valorUsado}
                format="currency"
              />
              <MetricsCard
                title="Lucro Total"
                value={totals.lucro}
                format="currency"
                isHighPerformance={isExceptionalPerformance}
                additionalData={{ faturamento: totals.faturamento, roas: totals.roas }}
              />
              <MetricsCard
                title="ROAS Médio (Comissão)"
                value={totals.roas}
                format="number"
                isHighPerformance={isExceptionalPerformance}
              />
              <MetricsCard
                title="CPA Médio"
                value={totals.cpa}
                format="currency"
              />
              <MetricsCard
                title="Compras Principais"
                value={totals.compras}
                format="number"
                isHighPerformance={isExceptionalPerformance}
              />
              <MetricsCard
                title="Ticket Médio"
                value={totals.ticketMedio}
                format="currency"
              />
              <MetricsCard
                title="Total Upsells"
                value={totals.upsellCount}
                format="number"
              />
              <MetricsCard
                title="Total Orderbumps"
                value={totals.orderbumpCount}
                format="number"
              />
              <MetricsCard
                title="Taxa de Upsell"
                value={totals.compras > 0 ? (totals.upsellCount / totals.compras) * 100 : 0}
                format="percentage"
              />
              <MetricsCard
                title="Impacto Upsell no Ticket"
                value={totals.taxaUpsellTicket}
                format="percentage"
                additionalData={{
                  ticketBase: totals.ticketMedioBase,
                  ticketAtual: totals.ticketMedio
                }}
              />
            </div>

            {/* Campaigns Table */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
              {/* Header com botão de minimizar (apenas mobile) */}
              <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">📊 Campanhas ({metrics.length})</h3>
                <button
                  onClick={() => setCampaignsMinimized(!campaignsMinimized)}
                  className="flex items-center justify-center p-2 text-gray-400 hover:text-white transition-colors"
                >
                  {campaignsMinimized ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronUp className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              {/* Header para desktop */}
              <div className="hidden md:block p-3 md:p-4 border-b border-gray-700">
                <h2 className="text-lg md:text-xl font-semibold text-white">
                  📊 Campanhas ({metrics.length})
                </h2>
              </div>
              
              {/* Conteúdo da tabela */}
              <div className={`${campaignsMinimized ? 'hidden md:block' : 'block'}`}>
                <CampaignsTable campaigns={metrics} />
              </div>
            </div>
          </>
        )}

        {/* Quebra de linha */}
        <br></br>

        {/* Account Summaries */}
        <AccountSummaryTable summaries={accountSummaries} isLoading={loading.campaigns || loading.vendas} />

        {/* Platform Metrics */}
        <div className="mb-6 md:mb-8">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-semibold text-white mb-4">Vendas por Plataforma</h3>

            {/* --- Layout de Tabela para Desktop --- */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-700">
                    <th className="text-left font-semibold text-gray-300 py-3 px-2">Plataforma</th>
                    <th className="text-right font-semibold text-gray-300 py-3 px-2">Vendas</th>
                    <th className="text-right font-semibold text-gray-300 py-3 px-2">Faturamento</th>
                    <th className="text-right font-semibold text-gray-300 py-3 px-2">Comissão</th>
                    <th className="text-right font-semibold text-gray-300 py-3 px-2">Ticket Médio</th>
                    <th className="text-right font-semibold text-gray-300 py-3 px-2">Impacto Total</th>
                    </tr>
                </thead>
                <tbody>
                    {plataformaMetrics.map((p, index) => (
                    <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                        <td className={`py-3 px-2 font-medium capitalize ${getPlatformColor(p.plataforma)}`}>{p.plataforma}</td>
                        <td className="py-3 px-2 text-right text-gray-300">{p.vendas}</td>
                        <td className="py-3 px-2 text-right text-green-400 font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.faturamento)}</td>
                        <td className="py-3 px-2 text-right text-orange-400">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.comissao)}</td>
                        <td className="py-3 px-2 text-right text-blue-400 font-semibold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.ticketMedio)}</td>
                        <td className="text-right py-3 px-2">
                          <div className="flex flex-col items-end">
                            <div
                              className={`flex items-center justify-end gap-1 font-semibold text-base ${
                                p.totalImpactPercent > 0
                                  ? 'text-purple-400'
                                  : p.totalImpactPercent < 0
                                  ? 'text-red-400'
                                  : 'text-gray-400'
                              }`}
                            >
                              {p.totalImpactPercent > 0 && <ArrowUp className="h-3.5 w-3.5" />}
                              <span>{`${p.totalImpactPercent >= 0 ? '+' : ''}${p.totalImpactPercent.toFixed(
                                1,
                              )}%`}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              <span>Up: {p.upsellImpactPercent.toFixed(1)}%</span>
                              <span className="mx-1">/</span>
                              <span>Bump: {p.orderBumpImpactPercent.toFixed(1)}%</span>
                            </div>
                          </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                {plataformaMetrics.length > 0 && (
                    <tfoot className="bg-gray-900/30">
                    <tr className="border-t-2 border-gray-600">
                        <td className="py-3 px-2 text-white font-bold">Total</td>
                        <td className="py-3 px-2 text-right text-gray-300 font-bold">{plataformaTotals.vendas}</td>
                        <td className="py-3 px-2 text-right text-green-400 font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plataformaTotals.faturamento)}</td>
                        <td className="py-3 px-2 text-right text-orange-400 font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plataformaTotals.comissao)}</td>
                        <td className="py-3 px-2 text-right text-blue-400 font-bold">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plataformaTotals.ticketMedio)}
                        </td>
                        <td className="text-right py-4 px-2">
                          <div className="flex flex-col items-end">
                            <div
                              className={`flex items-center justify-end gap-1 font-bold text-base ${
                                plataformaTotals.totalImpactPercent > 0
                                  ? 'text-purple-400'
                                  : plataformaTotals.totalImpactPercent < 0
                                  ? 'text-red-400'
                                  : 'text-gray-400'
                              }`}
                            >
                              {plataformaTotals.totalImpactPercent > 0 && <ArrowUp className="h-3.5 w-3.5" />}
                              <span>{`${
                                plataformaTotals.totalImpactPercent >= 0 ? '+' : ''
                              }${plataformaTotals.totalImpactPercent.toFixed(1)}%`}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              <span>Up: {plataformaTotals.upsellImpactPercent.toFixed(1)}%</span>
                              <span className="mx-1">/</span>
                              <span>Bump: {plataformaTotals.orderBumpImpactPercent.toFixed(1)}%</span>
                            </div>
                          </div>
                        </td>
                    </tr>
                    </tfoot>
                )}
                </table>
            </div>

            {/* --- Layout de Cards para Mobile --- */}
            <div className="block md:hidden space-y-3">
                {plataformaMetrics.map((p, index) => (
                <div key={index} className="bg-gray-700/50 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                    <span className={`font-semibold capitalize ${getPlatformColor(p.plataforma)}`}>{p.plataforma}</span>
                    <span className="text-sm text-gray-300">{p.vendas} vendas</span>
                    </div>
                    <div className="space-y-1 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">Faturamento</span>
                        <span className="font-medium text-green-400">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.faturamento)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">Comissão</span>
                        <span className="font-medium text-orange-400">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.comissao)}</span>
                    </div>
                    <div className="flex justify-between items-start border-t border-gray-600/50 pt-1 mt-1">
                        <span className="text-gray-400">Ticket Médio</span>
                        <span className="font-semibold text-blue-400">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.ticketMedio)}</span>
                    </div>
                    <div className="flex justify-between items-start border-t border-gray-600/50 pt-1 mt-1">
                        <span className="text-gray-400">Impacto Total</span>
                        <div className="flex flex-col items-end">
                          <span className="font-semibold text-purple-400 flex items-center gap-1">
                            {p.totalImpactPercent > 0 && <ArrowUp className="h-3.5 w-3.5" />}
                            {`${p.totalImpactPercent >= 0 ? '+' : ''}${p.totalImpactPercent.toFixed(1)}%`}
                          </span>
                          <div className="text-xs text-gray-500 mt-0.5">
                            <span>Up: {p.upsellImpactPercent.toFixed(1)}%</span>
                            <span className="mx-1">/</span>
                            <span>Bump: {p.orderBumpImpactPercent.toFixed(1)}%</span>
                          </div>
                        </div>
                    </div>
                    </div>
                </div>
                ))}
                {/* --- Totais Mobile --- */}
                {plataformaMetrics.length > 0 && (
                <div className="border-t-2 border-gray-600 pt-3 mt-3 space-y-2 text-base">
                    <div className="flex justify-between items-center">
                    <span className="font-semibold text-white">Faturamento Total</span>
                    <span className="font-bold text-green-400">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plataformaTotals.faturamento)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                    <span className="font-semibold text-white">Comissão Total</span>
                    <span className="font-bold text-orange-400">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plataformaTotals.comissao)}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-600/50 pt-2 mt-2">
                    <span className="font-semibold text-white">Ticket Médio (Total)</span>
                    <span className="font-bold text-blue-400">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plataformaTotals.ticketMedio)}</span>
                    </div>
                    <div className="flex justify-between items-start border-t border-gray-600/50 pt-2 mt-2">
                        <span className="font-semibold text-white">Impacto Total</span>
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-purple-400 flex items-center gap-1">
                              {plataformaTotals.totalImpactPercent > 0 && <ArrowUp className="h-4 w-4" />}
                              {`${plataformaTotals.totalImpactPercent >= 0 ? '+' : ''}${plataformaTotals.totalImpactPercent.toFixed(1)}%`}
                          </span>
                           <div className="text-xs text-gray-500 mt-0.5">
                              <span>Up: {plataformaTotals.upsellImpactPercent.toFixed(1)}%</span>
                              <span className="mx-1">/</span>
                              <span>Bump: {plataformaTotals.orderBumpImpactPercent.toFixed(1)}%</span>
                          </div>
                        </div>
                    </div>
                </div>
                )}
            </div>

            {plataformaMetrics.length === 0 && !loading.vendas && (
                <p className="text-gray-400 text-center py-8">Nenhuma venda registrada no período.</p>
            )}
            </div>
        </div>



        {/* Conversion Funnel */}
        <ConversionFunnel />

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