'use client'

import { Calendar, Filter, Building2, Clock } from 'lucide-react'
import { DatePeriod } from '@/hooks/useFacebookData'

interface FilterBarProps {
    selectedPeriod: DatePeriod
    onPeriodChange: (period: DatePeriod) => void
    selectedAccount: string
    onAccountChange: (account: string) => void
    availableAccounts: Array<{ id: string; name: string; accountId: string }>
}

const periodOptions = [
    { value: 'today' as DatePeriod, label: 'Hoje' },
    { value: 'yesterday' as DatePeriod, label: 'Ontem' },
    { value: 'last_7_days' as DatePeriod, label: '7 dias' },
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
            last7Days.setDate(today.getDate() - 6)
            return `${last7Days.toLocaleDateString('pt-BR')} - ${today.toLocaleDateString('pt-BR')}`
        case 'this_month':
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
            return `${firstDayOfMonth.toLocaleDateString('pt-BR')} - ${today.toLocaleDateString('pt-BR')}`
        default:
            return today.toLocaleDateString('pt-BR')
    }
}

export function FilterBar({
    selectedPeriod,
    onPeriodChange,
    selectedAccount,
    onAccountChange,
    availableAccounts
}: FilterBarProps) {
    const selectedAccountName = availableAccounts.find(acc => acc.id === selectedAccount)?.name || 'Todas as Contas'

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Filtros</h3>
                <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>{formatDateRange(selectedPeriod)}</span>
                </div>
            </div>

            <div className="space-y-4">
                {/* Period Filter */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-gray-300">Período:</span>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {periodOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => onPeriodChange(option.value)}
                                className={`flex items-center justify-center gap-2 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 whitespace-nowrap flex-shrink-0 ${selectedPeriod === option.value
                                    ? 'bg-blue-600 text-white border border-blue-500 shadow-lg shadow-blue-500/20'
                                    : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 hover:border-gray-500'
                                    }`}
                            >
                                <span className="font-medium">{option.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Account Filter - Only show if accounts are available */}
                {availableAccounts.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Building2 className="h-4 w-4 text-blue-400" />
                            <span className="text-sm font-medium text-gray-300">Conta de Anúncios:</span>
                        </div>

                        <div className="relative">
                            <select
                                value={selectedAccount}
                                onChange={(e) => onAccountChange(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                            >
                                <option value="all">Todas as Contas</option>
                                {availableAccounts.map((account) => (
                                    <option key={account.id} value={account.id}>
                                        {account.name} ({account.accountId})
                                    </option>
                                ))}
                            </select>

                            {/* Custom dropdown arrow */}
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                )}

                {/* Active Filters Summary */}
                <div className="pt-3 border-t border-gray-700">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-gray-400">Filtros ativos:</span>

                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-900/30 text-blue-300 rounded-md border border-blue-500/30">
                            <Calendar className="h-3 w-3" />
                            {periodOptions.find(p => p.value === selectedPeriod)?.label}
                        </span>

                        {availableAccounts.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-900/30 text-green-300 rounded-md border border-green-500/30">
                                <Building2 className="h-3 w-3" />
                                {selectedAccount === 'all' ? 'Todas' : selectedAccountName}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}