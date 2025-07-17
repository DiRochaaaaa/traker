import { Zap } from 'lucide-react'
import {
  getProfitColors,
  getROASColors,
  isHighPerformance as checkHighPerformance,
  HIGH_PERFORMANCE_CONFIG,
  COLOR_SCHEME,
} from '@/config/performanceColors'

interface MetricsCardProps {
  title: string
  value: string | number
  format?: 'currency' | 'percentage' | 'number'
  icon?:
    | 'revenue'
    | 'profit'
    | 'roas'
    | 'cpm'
    | 'cpa'
    | 'purchases'
    | 'ticket'
    | 'investment'
  isHighPerformance?: boolean
  isLoading?: boolean
  additionalData?: {
    faturamento?: number
    ticketBase?: number
    ticketAtual?: number
    roas?: number
  }
}

export function MetricsCard({
  title,
  value,
  format = 'number',
  isHighPerformance = false,
  isLoading = false,
  additionalData,
}: MetricsCardProps) {

  const formatValue = (val: string | number) => {
    const numVal = typeof val === 'string' ? parseFloat(val) : val
    if (isNaN(numVal)) {
      return 'N/A'
    }

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(numVal)
      case 'percentage':
        return `${numVal.toFixed(1)}%`
      case 'number':
        // Adiciona . no milhar e formata com 3 casas decimais se for ROAS
        if (title.toLowerCase().includes('roas')) {
          return `${numVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}x`
        }
        return numVal.toLocaleString('pt-BR')
      default:
        return numVal.toLocaleString('pt-BR')
    }
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value
  const isLucroCard = title === 'Lucro Total'
  const isROASCard = title.toLowerCase().includes('roas')
  const isUpsellImpactCard = title === 'Impacto Upsell no Ticket'
  const isValorInvestidoCard = title === 'Valor Investido'

  const getProfitPercentage = () => {
    if (isLucroCard && additionalData?.faturamento && additionalData.faturamento > 0) {
      const percentual = (numValue / additionalData.faturamento) * 100
      return percentual.toFixed(1)
    }
    return null
  }

  const profitPercentage = getProfitPercentage()

  const {
    cardClass,
    titleColor,
    valueColor,
    secondaryTextColor,
  } = (() => {
    const isHighPerf = isLucroCard && additionalData?.roas
        ? checkHighPerformance(numValue, additionalData.roas)
        : isHighPerformance

    if (isHighPerf) {
      return {
        cardClass: `${HIGH_PERFORMANCE_CONFIG.colors.gradient} border ${HIGH_PERFORMANCE_CONFIG.colors.border} shadow-lg ${HIGH_PERFORMANCE_CONFIG.colors.shadow}`,
        titleColor: HIGH_PERFORMANCE_CONFIG.colors.text,
        valueColor: HIGH_PERFORMANCE_CONFIG.colors.text,
        secondaryTextColor: HIGH_PERFORMANCE_CONFIG.colors.text.replace('100', '300'),
      }
    }

    if (isValorInvestidoCard) {
      const colors = COLOR_SCHEME.poor
      return {
        cardClass: `bg-gradient-to-br from-gray-800 to-gray-800/70 border ${colors.border} shadow-md ${colors.shadow}`,
        titleColor: 'text-gray-300',
        valueColor: colors.text,
        secondaryTextColor: 'text-gray-400',
      }
    }

    if (isROASCard) {
      const colors = getROASColors(numValue)
      return {
        cardClass: `bg-gradient-to-br from-gray-800 to-gray-800/70 border ${colors.border} shadow-md ${colors.shadow}`,
        titleColor: 'text-gray-300',
        valueColor: colors.text,
        secondaryTextColor: 'text-gray-400',
      }
    }
    if (isLucroCard && additionalData?.roas) {
      const colors = getProfitColors(numValue, additionalData.roas)
       return {
        cardClass: `bg-gradient-to-br from-gray-800 to-gray-800/70 border ${colors.border} shadow-md ${colors.shadow}`,
        titleColor: 'text-gray-300',
        valueColor: colors.text,
        secondaryTextColor: 'text-gray-400',
      }
    }

    return {
      cardClass: 'bg-gray-800 border border-gray-700/80 shadow-md',
      titleColor: 'text-gray-400',
      valueColor: 'text-white',
      secondaryTextColor: 'text-gray-400',
    }
  })()

  return (
    <div
      className={`rounded-xl p-4 flex flex-col justify-between h-full transition-all duration-300 ${cardClass} ${
        isLoading ? 'opacity-60 animate-pulse' : ''
      }`}
    >
      {isHighPerformance && (
        <div className="flex justify-start mb-2">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border bg-green-900/60 border-green-500/40">
            <span className="text-green-400">
              <Zap size={10} />
            </span>
            <span className="text-green-300 text-xs font-medium">Excelente</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <p className={`text-sm font-medium ${titleColor}`}>{title}</p>
          
          {profitPercentage ? (
            <>
              {/* Desktop: valor e percentual na mesma linha */}
              <div className="hidden md:flex items-baseline gap-x-2 mt-1">
                <p className={`text-2xl lg:text-3xl font-bold ${valueColor}`}>
                  {formatValue(value)}
                </p>
                <span
                  className={`inline-block px-1.5 py-0.5 text-xs font-bold rounded-md bg-black/20 border border-white/10`}
                >
                  {profitPercentage}%
                </span>
              </div>
              
              {/* Mobile: valor e percentual em linhas separadas */}
              <div className="md:hidden mt-1">
                <p className={`text-2xl font-bold ${valueColor}`}>
                  {formatValue(value)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-block px-1.5 py-0.5 text-xs font-bold rounded-md bg-black/20 border border-white/10`}
                  >
                    {profitPercentage}%
                  </span>
                  <span className={`text-xs opacity-70 ${secondaryTextColor}`}>
                    do faturamento
                  </span>
                </div>
              </div>
              
              {/* Desktop: texto "do faturamento" */}
              <p className={`hidden md:block text-xs mt-0.5 opacity-70 ${secondaryTextColor}`}>
                do faturamento
              </p>
            </>
          ) : (
            <p className={`text-2xl lg:text-3xl font-bold mt-1 ${valueColor}`}>
              {formatValue(value)}
            </p>
          )}

          {isUpsellImpactCard && additionalData?.ticketBase !== undefined && additionalData?.ticketAtual !== undefined && (
              <div className={`text-xs mt-1 ${secondaryTextColor} space-y-0.5`}>
              <span>Base: {formatValue(additionalData.ticketBase)}</span>
              <span className="px-1">-&gt;</span>
              <span>Atual: {formatValue(additionalData.ticketAtual)}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  )
} 