'use client'

import React from 'react'
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



export function FilterBar({
    selectedPeriod,
    onPeriodChange,
    selectedAccount,
    onAccountChange,
    availableAccounts
}: FilterBarProps) {


    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 mb-4">
            {/* Filters in one line */}
            <div className="flex flex-row gap-3">
                {/* Period Filter */}
                <div className="flex-1">
                    <div className="relative">
                        <select
                            value={selectedPeriod}
                            onChange={(e) => onPeriodChange(e.target.value as DatePeriod)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none cursor-pointer text-sm"
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
                        <div className="relative">
                            <select
                                value={selectedAccount}
                                onChange={(e) => onAccountChange(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none cursor-pointer text-sm"
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