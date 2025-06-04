import { Calendar } from 'lucide-react'
import { DatePeriod } from '@/hooks/useFacebookData'

interface DateSelectorProps {
  selectedPeriod: DatePeriod
  onPeriodChange: (period: DatePeriod) => void
}

const periodOptions = [
  { value: 'today' as DatePeriod, label: 'Hoje' },
  { value: 'yesterday' as DatePeriod, label: 'Ontem' },
  { value: 'last_7_days' as DatePeriod, label: 'Últimos 7 dias' },
  { value: 'this_month' as DatePeriod, label: 'Este mês' }
]

function formatDateRange(period: DatePeriod): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  switch (period) {
    case 'today':
      return today.toLocaleDateString('pt-BR')
    case 'yesterday':
      return yesterday.toLocaleDateString('pt-BR')
    case 'last_7_days':
      const last7Days = new Date(today)
      last7Days.setDate(today.getDate() - 7)
      return `${last7Days.toLocaleDateString('pt-BR')} - ${today.toLocaleDateString('pt-BR')}`
    case 'this_month':
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      return `${firstDayOfMonth.toLocaleDateString('pt-BR')} - ${today.toLocaleDateString('pt-BR')}`
    default:
      return today.toLocaleDateString('pt-BR')
  }
}

export function DateSelector({ selectedPeriod, onPeriodChange }: DateSelectorProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center space-x-4 mb-3">
        <Calendar className="h-5 w-5 text-blue-400" />
        <span className="text-sm font-medium text-gray-300">Período:</span>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {periodOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onPeriodChange(option.value)}
            className={`px-3 py-2 text-xs sm:text-sm rounded-md transition-colors text-center ${
              selectedPeriod === option.value
                ? 'bg-blue-600 text-white border border-blue-500'
                : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      
      <div className="mt-3 text-xs text-gray-400">
        <span className="font-medium">Período selecionado:</span>{' '}
        <span className="break-all">{formatDateRange(selectedPeriod)}</span>
      </div>
    </div>
  )
} 