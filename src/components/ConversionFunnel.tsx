'use client'

import { useState, useEffect, useMemo } from 'react'
import { MousePointer, Eye, ShoppingCart, CheckCircle, ChevronDown } from 'lucide-react'
import { useFacebookData } from '@/hooks/useFacebookData'

interface FunnelStep {
  name: string
  value: number
  globalPercentage: number
  sequentialPercentage: number
  fill: string
  icon: React.ReactNode
}

interface AccountFunnel {
  accountName: string
  accountId: string
  steps: FunnelStep[]
  totalConversion: number
}

interface AccountData {
  accountName: string
  accountId: string
  clicks: number
  impressions: number
  initiateCheckout: number
  purchases: number
}

export function ConversionFunnel() {
  const { processMetrics, selectedPeriod, loading } = useFacebookData()
  const [availableAccounts, setAvailableAccounts] = useState<Array<{ id: string; name: string; accountId: string }>>([])

  // Estado de carregamento
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true)

  // Buscar nomes reais das contas
  useEffect(() => {
    const fetchAccountNames = async () => {
      try {
        const response = await fetch('/api/facebook/test')
        const data = await response.json()

        if (data.success && data.accountTests) {
          const accounts: Array<{ id: string; name: string; accountId: string }> = []

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
        console.error('Erro ao buscar nomes das contas:', error)
      } finally {
        setIsLoadingAccounts(false)
      }
    }

    fetchAccountNames()
  }, [])

  // Agrupar métricas por conta de anúncio (recalcula quando availableAccounts muda)
  const accountsData = useMemo(() => {
    return processMetrics().reduce((acc, campaign) => {
      const accountId = campaign.account_id || 'unknown'
      // Buscar o nome real da conta - tentar diferentes formatos
      let accountInfo = availableAccounts.find(acc => acc.accountId === accountId)

      // Se não encontrou, tentar sem o prefixo "act_"
      if (!accountInfo && accountId.startsWith('act_')) {
        accountInfo = availableAccounts.find(acc => acc.accountId === accountId.replace('act_', ''))
      }

      // Se não encontrou, tentar com o prefixo "act_"
      if (!accountInfo && !accountId.startsWith('act_')) {
        accountInfo = availableAccounts.find(acc => acc.accountId === `act_${accountId}`)
      }

      const accountName = accountInfo?.name || `Conta ${accountId.slice(-4)}`

      if (!acc[accountId]) {
        acc[accountId] = {
          accountName,
          accountId,
          clicks: 0,
          impressions: 0,
          initiateCheckout: 0,
          purchases: 0
        }
      }

      acc[accountId].clicks += campaign.clicks
      acc[accountId].impressions += campaign.impressions
      acc[accountId].initiateCheckout += campaign.initiateCheckout
      acc[accountId].purchases += campaign.compras

      return acc
    }, {} as Record<string, AccountData>)
  }, [processMetrics, availableAccounts])

  // Criar funis para cada conta usando apenas dados do Facebook
  const accountFunnels: AccountFunnel[] = Object.values(accountsData).map((account: AccountData) => {
    const clicks = account.clicks
    const pageViews = Math.round(clicks * 0.85) // Estimativa 85%
    const initiateCheckout = account.initiateCheckout
    const purchases = account.purchases // Usar purchases do Facebook, não vendas do Supabase

    const steps: FunnelStep[] = [
      {
        name: 'Cliques',
        value: clicks,
        globalPercentage: 100,
        sequentialPercentage: 100,
        fill: '#3B82F6',
        icon: <MousePointer className="h-4 w-4" />
      },
      {
        name: 'Visualizações',
        value: pageViews,
        globalPercentage: clicks > 0 ? Number(((pageViews / clicks) * 100).toFixed(1)) : 0,
        sequentialPercentage: 85,
        fill: '#6366F1',
        icon: <Eye className="h-4 w-4" />
      },
      {
        name: 'Iniciações',
        value: initiateCheckout,
        globalPercentage: clicks > 0 ? Number(((initiateCheckout / clicks) * 100).toFixed(1)) : 0,
        sequentialPercentage: pageViews > 0 ? Number(((initiateCheckout / pageViews) * 100).toFixed(1)) : 0,
        fill: '#F59E0B',
        icon: <ShoppingCart className="h-4 w-4" />
      },
      {
        name: 'Vendas',
        value: purchases,
        globalPercentage: clicks > 0 ? Number(((purchases / clicks) * 100).toFixed(1)) : 0,
        sequentialPercentage: initiateCheckout > 0 ? Number(((purchases / initiateCheckout) * 100).toFixed(1)) : 0,
        fill: '#EF4444',
        icon: <CheckCircle className="h-4 w-4" />
      }
    ]

    return {
      accountName: account.accountName,
      accountId: account.accountId,
      steps,
      totalConversion: clicks > 0 ? Number(((purchases / clicks) * 100).toFixed(2)) : 0
    }
  }).filter(funnel => funnel.steps[0].value > 0) // Só mostrar contas com dados

  // Componente Skeleton para carregamento
  const FunnelSkeleton = () => (
    <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-3 lg:p-4 mb-3 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
        <div>
          <div className="h-4 bg-gray-700 rounded w-20 mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-32"></div>
        </div>
        <div className="flex gap-1.5">
          <div className="h-6 bg-gray-700 rounded w-16"></div>
          <div className="h-6 bg-gray-700 rounded w-16"></div>
        </div>
      </div>

      {/* Funil skeleton */}
      <div className="w-full max-w-md mx-auto lg:max-w-none">
        <div className="space-y-1">
          {/* 4 etapas do funil */}
          {[100, 85, 60, 40].map((width, index) => (
            <div key={index} className="relative">
              {/* Segmento skeleton */}
              <div
                className="relative h-12 lg:h-14 bg-gray-700 rounded-lg mx-auto"
                style={{
                  width: `${width}%`,
                  minWidth: '180px'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 animate-pulse rounded-lg"></div>
              </div>

              {/* Transição skeleton */}
              {index < 3 && (
                <div className="flex items-center justify-center py-1.5">
                  <div className="bg-gray-700 rounded-lg px-4 py-2 h-8 w-20"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // Função para renderizar um funil individual
  const renderFunnel = (funnel: AccountFunnel) => (
    <div key={funnel.accountId} className="bg-gray-800/50 border border-gray-600 rounded-lg p-3 lg:p-4 mb-3">
      {/* Header da conta - Compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
        <div>
          <h4 className="text-sm lg:text-base font-semibold text-white">
            {funnel.accountName}
          </h4>
          <p className="text-xs text-gray-400">
            Conversão total: <span className="text-green-400 font-medium">{funnel.totalConversion}%</span>
          </p>
        </div>

        {/* Badge de performance - Compacto */}
        <div className="flex gap-1.5">
          <div className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs">
            {funnel.steps[0].value.toLocaleString('pt-BR')} cliques
          </div>
          <div className="bg-green-600/20 text-green-400 px-2 py-1 rounded text-xs">
            {funnel.steps[3].value.toLocaleString('pt-BR')} vendas
          </div>
        </div>
      </div>

      {/* Funil - Layout responsivo e compacto */}
      <div className="relative">
        {/* Container centralizado para mobile */}
        <div className="w-full max-w-md mx-auto lg:max-w-none">
          <div className="space-y-1">
            {funnel.steps.map((step, stepIndex) => {
              const widthPercentage = stepIndex === 0 ? 100 : Math.max((step.globalPercentage / funnel.steps[0].globalPercentage) * 100, 25)
              const nextStep = funnel.steps[stepIndex + 1]
              const dropRate = nextStep ? 100 - nextStep.sequentialPercentage : 0

              return (
                <div key={stepIndex} className="relative">
                  {/* Segmento do funil - Mais compacto */}
                  <div
                    className="relative h-12 lg:h-14 border border-white/20 hover:border-white/40 
                               transition-all duration-300 hover:scale-[1.01] cursor-pointer
                               flex items-center justify-between text-white font-medium
                               shadow-md hover:shadow-lg rounded-lg overflow-hidden group mx-auto"
                    style={{
                      width: `${widthPercentage}%`,
                      background: `linear-gradient(135deg, ${step.fill}ee, ${step.fill})`,
                      minWidth: '180px',
                      maxWidth: '100%'
                    }}
                  >
                    {/* Conteúdo principal */}
                    <div className="flex items-center gap-2 px-3 flex-1">
                      <div className="bg-white/20 p-1.5 rounded-full">
                        {step.icon}
                      </div>
                      <div>
                        <div className="font-bold text-sm lg:text-base">
                          {step.value.toLocaleString('pt-BR')}
                        </div>
                        <div className="text-xs text-white/90">
                          {step.name}
                        </div>
                      </div>
                    </div>

                    {/* Percentual global dentro do segmento */}
                    <div className="px-3 text-right">
                      <div className="bg-black/40 rounded-lg px-2.5 py-1.5 min-w-[50px]">
                        <div className="font-bold text-sm text-white">{step.globalPercentage}%</div>
                        <div className="text-xs text-white/80 leading-tight">total</div>
                      </div>
                    </div>
                  </div>

                  {/* Transição com percentuais - Mais compacta */}
                  {stepIndex < funnel.steps.length - 1 && (
                    <div className="flex items-center justify-center py-1.5 relative">
                      {/* Linha de conexão */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-px h-full bg-gradient-to-b from-gray-600 to-gray-400"></div>
                      </div>

                      {/* Container dos percentuais - Compacto */}
                      <div className="relative bg-gray-800 border border-gray-600 rounded-lg px-2 py-1.5 flex items-center gap-2 shadow-lg">
                        {/* Seta */}
                        <ChevronDown className="h-3 w-3 text-gray-400" />

                        {/* Percentuais da transição */}
                        <div className="flex items-center gap-2 text-xs">
                          {/* Taxa de conversão sequencial */}
                          <div className="text-center">
                            <div className="font-bold text-green-400">
                              {nextStep?.sequentialPercentage}%
                            </div>
                            <div className="text-gray-400 text-xs">converte</div>
                          </div>

                          {/* Separador */}
                          <div className="w-px h-4 bg-gray-600"></div>

                          {/* Taxa de perda */}
                          <div className="text-center">
                            <div className="font-bold text-red-400">
                              {dropRate.toFixed(1)}%
                            </div>
                            <div className="text-gray-400 text-xs">perda</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Legenda mobile - Mais compacta */}
        <div className="block sm:hidden mt-3 pt-3 border-t border-gray-700">
          <div className="text-xs text-gray-400 mb-2">Legenda:</div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs text-gray-300">% converte</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="text-xs text-gray-300">% perda</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 md:p-6 mb-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
          Funis de Conversão por Conta – Meta Ads ({
            selectedPeriod === 'today' ? 'Hoje' :
              selectedPeriod === 'yesterday' ? 'Ontem' :
                selectedPeriod === 'last_7_days' ? 'Últimos 7 dias' : 'Este mês'
          })
        </h3>
        <p className="text-sm text-gray-400">
          Análise detalhada do funil de conversão para cada conta de anúncio
        </p>
      </div>

      {/* Funis por conta - Layout em grid para PC */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {(loading.campaigns || loading.metrics || isLoadingAccounts) ? (
          // Mostrar skeleton enquanto carrega dados ou nomes das contas
          <>
            <FunnelSkeleton />
            <FunnelSkeleton />
            <FunnelSkeleton />
          </>
        ) : accountFunnels.length > 0 ? (
          accountFunnels.map((funnel) => renderFunnel(funnel))
        ) : (
          <div className="col-span-full text-center py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="text-4xl">📊</div>
              <p className="text-gray-400 text-center">
                Nenhum dado encontrado para o período selecionado
              </p>
              <p className="text-xs text-gray-500 text-center">
                Tente selecionar um período diferente ou verifique se há campanhas ativas
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Resumo geral */}
      {accountFunnels.length > 1 && (
        <div className="mt-8 pt-6 border-t border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">Resumo Geral</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {accountFunnels.reduce((sum, funnel) => sum + funnel.steps[0].value, 0).toLocaleString('pt-BR')}
              </div>
              <div className="text-sm text-gray-400">Total de Cliques</div>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                {accountFunnels.reduce((sum, funnel) => sum + funnel.steps[3].value, 0).toLocaleString('pt-BR')}
              </div>
              <div className="text-sm text-gray-400">Total de Vendas</div>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {(accountFunnels.reduce((sum, funnel) => sum + funnel.totalConversion, 0) / accountFunnels.length).toFixed(2)}%
              </div>
              <div className="text-sm text-gray-400">Conversão Média</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}