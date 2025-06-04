interface HighlightValueProps {
  value: number
  format?: 'currency' | 'number' | 'percentage'
  isHighPerformance?: boolean
  className?: string
}

export function HighlightValue({ 
  value, 
  format = 'number', 
  isHighPerformance = false,
  className = '' 
}: HighlightValueProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(val)
      case 'percentage':
        return `${val.toFixed(2)}%`
      default:
        return val.toLocaleString('pt-BR', { 
          minimumFractionDigits: 2,
          maximumFractionDigits: 2 
        })
    }
  }

  if (isHighPerformance) {
    return (
      <span className={`bg-green-900/30 px-2 py-1 rounded text-green-300 font-medium ${className}`}>
        {formatValue(value)}
      </span>
    )
  }

  return (
    <span className={className}>
      {formatValue(value)}
    </span>
  )
} 