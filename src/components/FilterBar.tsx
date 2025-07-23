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

            {/* Filters in one line */}
            <div className="flex flex-row gap-4">
                {/* Period Filter */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-gray-300">Período:</span>
                    </div>
                    
                    <div className="relative">
                        <select
                            value={selectedPeriod}
                            onChange={(e) => onPeriodChange(e.target.value as DatePeriod)}
                            className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                        >
                            {periodOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
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

                {/* Account Filter - Only show if accounts are available */}
                {availableAccounts.length > 0 && (
                    <div className="flex-1">
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

            </div>
        </div>
    )
}