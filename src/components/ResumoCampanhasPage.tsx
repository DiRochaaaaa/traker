'use client'

import { useFacebookData } from '@/hooks/useFacebookData'
import { MetricsCard } from './MetricsCard'
import { DateSelector } from './DateSelector'
import { CampaignsTable } from './CampaignsTable'

export function ResumoCampanhasPage() {
  const {
    processMetrics,
    getTotals,
    selectedPeriod,
    setSelectedPeriod,
    loading
  } = useFacebookData()

  const metrics = processMetrics()
  const totals = getTotals(metrics)

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">Resumo de Campanhas</h1>

        <div className="mb-6 md:mb-8">
          <DateSelector selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <MetricsCard title="Comissão Total" value={totals.comissao} format="currency" />
          <MetricsCard title="Lucro Total" value={totals.lucro} format="currency" additionalData={{ faturamento: totals.faturamento }} />
          <MetricsCard title="ROAS Médio" value={totals.roas} format="number" />
          <MetricsCard title="Compras" value={totals.compras} format="number" />
        </div>

        <CampaignsTable campaigns={metrics} isLoading={loading.campaigns || loading.vendas} />
      </div>
    </div>
  )
}
