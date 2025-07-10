import { TrendingUp, TrendingDown, DollarSign, Target, Eye, MousePointerClick } from 'lucide-react'
import { HighlightValue } from './HighlightValue'
import { getProfitColors, getROASColors, isHighPerformance as checkHighPerformance, HIGH_PERFORMANCE_CONFIG } from '@/config/performanceColors'

interface MetricsCardProps {
  title: string
  value: string | number
  change?: number
  format?: 'currency' | 'percentage' | 'number'
  icon?: 'revenue' | 'profit' | 'roas' | 'cpm' | 'cpa' | 'purchases'
  isHighPerformance?: boolean
  isLoading?: boolean
  additionalData?: {
    faturamento?: number
    ticketBase?: number
    ticketAtual?: number
  }
}

const iconMap = {
  revenue: DollarSign,
  profit: TrendingUp,
  roas: Target,
  cpm: Eye,
  cpa: MousePointerClick,
  purchases: TrendingUp
}

export function MetricsCard({ title, value, change, format = 'number', icon, isHighPerformance = false, isLoading = false, additionalData }: MetricsCardProps) {
  const IconComponent = icon ? iconMap[icon] : DollarSign

  const formatValue = (val: string | number) => {
    const numVal = typeof val === 'string' ? parseFloat(val) : val
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(numVal)
      case 'percentage':
        return `${numVal.toFixed(2)}%`
      default:
        return numVal.toLocaleString('pt-BR')
    }
  }

  // 🎨 Verificar performance usando configuração centralizada
  const lucroValue = typeof value === 'string' ? parseFloat(value) : value
  
  const isLucroCard = title === 'Lucro Total'
  const isROASCard = title === 'ROAS Médio'
  const isUpsellImpactCard = title === 'Impacto Upsell no Ticket'
  
  // Para ROAS, usar o valor direto. Para lucro, precisamos do ROAS para determinar a cor
  const roasForColors = isROASCard
    ? lucroValue
    : isLucroCard && additionalData?.faturamento
      ? (() => {
          const spend = additionalData.faturamento - lucroValue
          return spend > 0 ? additionalData.faturamento / spend : 0
        })()
      : lucroValue
  
  // 💰 Calcular percentual do lucro (Lucro/Faturamento)
  const getProfitPercentage = () => {
    if (title === 'Lucro Total' && additionalData?.faturamento) {
      const percentual = (lucroValue / additionalData.faturamento) * 100
      return percentual.toFixed(1)
    }
    return null
  }

  // 🎨 Obter cores baseadas na configuração centralizada
  const getColorsForCard = () => {
    if (isLucroCard && additionalData?.faturamento) {
      // Para lucro, usar as cores baseadas no ROAS
      const spend = additionalData.faturamento - lucroValue
      const roasCalculado = spend > 0 ? additionalData.faturamento / spend : 0
      return getProfitColors(lucroValue, roasCalculado)
    }
    if (isROASCard) {
      return getROASColors(lucroValue)
    }
    return { text: 'text-gray-400', background: 'bg-gray-800/30', border: 'border-gray-600/50', shadow: 'shadow-gray-500/20' }
  }

  const colors = getColorsForCard()
  const shouldShowSpecialVisual = (isLucroCard || isROASCard) && colors.background !== 'bg-gray-800/30'
  const isHighPerf = isLucroCard && additionalData?.faturamento ? 
    checkHighPerformance(lucroValue, roasForColors) : isHighPerformance

  // 🎨 Definir estilos baseados na configuração
  const getCardStyle = () => {
    if (isHighPerf) {
      return HIGH_PERFORMANCE_CONFIG.colors.gradient + ` border-2 ${HIGH_PERFORMANCE_CONFIG.colors.border} shadow-xl ${HIGH_PERFORMANCE_CONFIG.colors.shadow}`
    }
    if (shouldShowSpecialVisual) {
      return `bg-gradient-to-br from-gray-800 to-gray-900 border-2 ${colors.border} shadow-lg ${colors.shadow}`
    }
    return "bg-gray-800 border border-gray-700"
  }

  const getTitleColor = () => {
    if (isHighPerf) return HIGH_PERFORMANCE_CONFIG.colors.text
    if (shouldShowSpecialVisual) return colors.text.replace('400', '200')
    return "text-gray-400"
  }

  const getValueColor = () => {
    if (isHighPerf) return HIGH_PERFORMANCE_CONFIG.colors.text
    if (shouldShowSpecialVisual) return colors.text.replace('400', '100')
    return "text-white"
  }
  
  const getIconStyle = () => {
    if (isHighPerf) {
      return `p-3 ${HIGH_PERFORMANCE_CONFIG.colors.background} rounded-full border-2 ${HIGH_PERFORMANCE_CONFIG.colors.border} shadow-lg ${HIGH_PERFORMANCE_CONFIG.colors.shadow}`
    }
    if (shouldShowSpecialVisual) {
      return `p-3 ${colors.background} rounded-full border-2 ${colors.border} shadow-lg ${colors.shadow}`
    }
    return "p-3 bg-blue-900/30 rounded-full border border-blue-500/20"
  }
    
  const getIconColor = () => {
    if (isHighPerf) return HIGH_PERFORMANCE_CONFIG.colors.text
    if (shouldShowSpecialVisual) return colors.text
    return "text-blue-400"
  }

  return (
    <div className={`${getCardStyle()} rounded-lg shadow-xl p-6 transition-all duration-300 ${isLoading ? 'opacity-60' : ''}`}>
      {isHighPerformance && (
        <div className="flex items-center justify-center mb-3">
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full border bg-green-900/50 border-green-500/30">
            <span className="text-green-400 text-xs">🏆</span>
            <span className="text-green-300 text-xs font-medium">Excelente</span>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${getTitleColor()}`}>{title}</p>
          <div className={`text-2xl font-bold mt-1`}>
            {title === 'ROAS Médio' ? (
              <HighlightValue 
                value={typeof value === 'string' ? parseFloat(value) : value}
                format="number"
                isHighPerformance={typeof value === 'string' ? parseFloat(value) > 2 : value > 2}
                className={getValueColor()}
              />
            ) : title === 'Lucro Total' ? (
              <div className="flex flex-col">
                <HighlightValue 
                  value={typeof value === 'string' ? parseFloat(value) : value}
                  format="currency"
                  isHighPerformance={false}
                  className={getValueColor()}
                />
                {getProfitPercentage() && (
                  <span className={`text-sm mt-1 ${
                    shouldShowSpecialVisual ? colors.text.replace('400', '300') : 'text-gray-400'
                  }`}>
                    {getProfitPercentage()}% do faturamento
                  </span>
                )}
              </div>
            ) : isUpsellImpactCard ? (
              <div className="flex flex-col">
                <span className={getValueColor()}>
                  {lucroValue > 0 ? `+${formatValue(value)}` : formatValue(value)}
                </span>
                                 {additionalData?.ticketBase && additionalData?.ticketAtual && (
                   <div className="text-xs text-gray-400 mt-1 space-y-0.5">
                     <div>Base: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(additionalData.ticketBase)}</div>
                     <div>Atual: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(additionalData.ticketAtual)}</div>
                   </div>
                 )}
              </div>
            ) : (
              <span className={getValueColor()}>
                {formatValue(value)}
              </span>
            )}
          </div>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {change > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400 mr-1" />
              )}
              <span className={`text-sm ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {Math.abs(change).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        <div className={getIconStyle()}>
          <IconComponent className={`h-6 w-6 ${getIconColor()}`} />
        </div>
      </div>
    </div>
  )
} 