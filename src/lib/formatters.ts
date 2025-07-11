export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export const formatPercentage = (value: number) => {
  if (value === 0) return '0.0%'
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
} 