import { TrendingUp, TrendingDown, DollarSign, Target, Eye, MousePointerClick } from 'lucide-react'

interface MetricsCardProps {
  title: string
  value: string | number
  change?: number
  format?: 'currency' | 'percentage' | 'number'
  icon?: 'revenue' | 'profit' | 'roas' | 'cpm' | 'cpa' | 'purchases'
}

const iconMap = {
  revenue: DollarSign,
  profit: TrendingUp,
  roas: Target,
  cpm: Eye,
  cpa: MousePointerClick,
  purchases: TrendingUp
}

export function MetricsCard({ title, value, change, format = 'number', icon }: MetricsCardProps) {
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

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">
            {formatValue(value)}
          </p>
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
        <div className="p-3 bg-blue-900/30 rounded-full border border-blue-500/20">
          <IconComponent className="h-6 w-6 text-blue-400" />
        </div>
      </div>
    </div>
  )
} 