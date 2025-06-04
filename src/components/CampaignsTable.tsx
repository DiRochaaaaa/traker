'use client'

import { useState } from 'react'
import { CampaignMetrics } from '@/hooks/useFacebookData'
import { CampaignActions } from './CampaignActions'
import { SkeletonCard } from './SkeletonCard'
import { SkeletonMobileCard } from './SkeletonMobileCard'
import { CampaignMobileCard } from './CampaignMobileCard'
import { isHighPerformance as checkHighPerformance } from '@/config/performanceColors'

interface CampaignsTableProps {
  campaigns: CampaignMetrics[]
  onRefresh?: () => void
  isLoading?: boolean
}

type SortKey = keyof CampaignMetrics | null
type SortDirection = 'asc' | 'desc'

export function CampaignsTable({ campaigns, onRefresh, isLoading = false }: CampaignsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [budgetModals, setBudgetModals] = useState<Record<string, boolean>>({})

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      ACTIVE: 'bg-green-900/50 text-green-300 border border-green-500/30',
      PAUSED: 'bg-yellow-900/50 text-yellow-300 border border-yellow-500/30',
      ARCHIVED: 'bg-gray-700/50 text-gray-300 border border-gray-500/30',
      DELETED: 'bg-red-900/50 text-red-300 border border-red-500/30'
    }
    
    const statusLabels = {
      ACTIVE: 'ATIVO',
      PAUSED: 'PAUSADO',
      ARCHIVED: 'ARQUIVADO',
      DELETED: 'DELETADO'
    }
    
    return (
      <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${statusColors[status as keyof typeof statusColors] || 'bg-gray-700/50 text-gray-300 border border-gray-500/30'}`}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </span>
    )
  }

  const getProfitColor = (profit: number, roas: number) => {
    if (profit < 0) return 'text-red-400'
    if (roas >= 2) return 'text-green-400'
    if (roas >= 1 && roas <= 1.99) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getProfitBackground = (profit: number, roas: number) => {
    if (profit < 0) return ''
    if (roas >= 2) return 'bg-green-900/30'
    if (roas >= 1 && roas <= 1.99) return 'bg-yellow-900/30'
    return ''
  }

  const getRoasColor = (roas: number) => {
    if (roas >= 2) return 'text-green-400'
    if (roas >= 1 && roas <= 1.99) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getRoasBackground = (roas: number) => {
    if (roas >= 2) return 'bg-green-900/30'
    if (roas >= 1 && roas <= 1.99) return 'bg-yellow-900/30'
    return ''
  }

  const isHighPerformanceCampaign = (campaign: CampaignMetrics) => {
    return checkHighPerformance(campaign.lucro, campaign.roas)
  }

  const getCampaignStyle = (campaign: CampaignMetrics) => {
    if (isHighPerformanceCampaign(campaign)) {
      return {
        desktop: 'bg-gradient-to-r from-green-900/20 via-emerald-900/20 to-green-900/20 border-l-4 border-l-green-400',
        mobile: 'bg-gradient-to-br from-green-900/40 via-green-800/30 to-emerald-900/40 border-l-4 border-l-green-400 shadow-lg shadow-green-500/10',
        glow: 'shadow-lg shadow-green-500/20'
      }
    }
    return {
      desktop: 'hover:bg-gray-700/30',
      mobile: 'bg-gray-800/50 border border-gray-700/50',
      glow: ''
    }
  }

  // Função para alternar modal de orçamento
  const toggleBudgetModal = (campaignId: string, open: boolean) => {
    setBudgetModals(prev => ({
      ...prev,
      [campaignId]: open
    }))
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('desc')
    }
  }

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return '↕️'
    return sortDirection === 'asc' ? '⬆️' : '⬇️'
  }

  const sortedCampaigns = [...campaigns].sort((a, b) => {
    if (!sortKey) return 0
    
    const aValue = a[sortKey]
    const bValue = b[sortKey]
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' 
        ? aValue - bValue
        : bValue - aValue
    }
    
    return 0
  })

  if (isLoading) {
    return (
      <div>
        {/* Mobile: Skeleton List */}
        <div className="block md:hidden">
          <SkeletonMobileCard />
          <SkeletonMobileCard />
          <SkeletonMobileCard />
          <SkeletonMobileCard />
          <SkeletonMobileCard />
        </div>

        {/* Desktop: Skeleton Table */}
        <div className="hidden md:block">
          <SkeletonCard />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      <div className="p-3 md:p-4 border-b border-gray-700">
        <h2 className="text-lg md:text-xl font-semibold text-white">
          📊 Campanhas ({campaigns.length})
        </h2>
      </div>

      {/* Mobile: Campaign Cards */}
      <div className="block md:hidden p-3 space-y-3">
        {campaigns.map((campaign) => (
          <CampaignMobileCard 
            key={campaign.campaign_id} 
            campaign={campaign} 
            onRefresh={onRefresh || (() => {})} 
          />
        ))}
        
        {campaigns.length === 0 && (
          <div className="p-6 text-center text-gray-400">
            Nenhuma campanha encontrada
          </div>
        )}
      </div>

      {/* Desktop: Table */}
      <div className="hidden md:block overflow-x-auto modal-scroll">
        <table className="w-full divide-y divide-gray-700" style={{minWidth: '1300px'}}>
          <thead className="bg-gray-900/50">
            <tr>
              {/* Controle - Nova coluna à esquerda */}
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[6%]">
                Controle
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[20%]">
                <button 
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  Nome {getSortIcon('name')}
                </button>
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[6%]">
                <button 
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  Status {getSortIcon('status')}
                </button>
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[7%]">
                <button 
                  onClick={() => handleSort('dailyBudget')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  Orçamento {getSortIcon('dailyBudget')}
                </button>
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[7%]">
                <button 
                  onClick={() => handleSort('valorUsado')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  Investido {getSortIcon('valorUsado')}
                </button>
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[6%]">
                <button 
                  onClick={() => handleSort('cpm')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  CPM {getSortIcon('cpm')}
                </button>
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[6%]">
                <button 
                  onClick={() => handleSort('compras')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  Compras {getSortIcon('compras')}
                </button>
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[6%]">
                <button 
                  onClick={() => handleSort('cpa')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  CPA {getSortIcon('cpa')}
                </button>
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[7%]">
                <button 
                  onClick={() => handleSort('comissao')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  Comissão {getSortIcon('comissao')}
                </button>
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[7%]">
                <button 
                  onClick={() => handleSort('faturamento')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  Faturamento {getSortIcon('faturamento')}
                </button>
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[7%]">
                <button 
                  onClick={() => handleSort('ticketMedio')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  Ticket {getSortIcon('ticketMedio')}
                </button>
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[5%]">
                <button 
                  onClick={() => handleSort('roas')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  ROAS {getSortIcon('roas')}
                </button>
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[7%]">
                <button 
                  onClick={() => handleSort('lucro')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  Lucro {getSortIcon('lucro')}
                </button>
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[4%]">
                <button 
                  onClick={() => handleSort('upsellCount')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  Ups {getSortIcon('upsellCount')}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {sortedCampaigns.map((campaign) => {
              const style = getCampaignStyle(campaign)
              return (
              <tr key={campaign.campaign_id} className={`${style.desktop} ${style.glow} hover:bg-gray-700/30 transition-all duration-300`}>
                {/* Controle - Primeira coluna */}
                <td className="px-2 py-3">
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-xs text-gray-400 text-center">
                      {campaign.budgetType}
                    </div>
                    <CampaignActions 
                      campaign={campaign} 
                      onActionComplete={onRefresh} 
                      showBudgetModal={budgetModals[campaign.campaign_id] || false}
                      onCloseBudgetModal={() => toggleBudgetModal(campaign.campaign_id, false)}
                    />
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-sm font-medium text-white truncate" title={campaign.name}>
                        {campaign.name}
                      </div>
                      {isHighPerformanceCampaign(campaign) && (
                        <span className="text-green-400 text-sm animate-pulse">🏆</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {campaign.account_id}
                    </div>
                    {isHighPerformanceCampaign(campaign) && (
                      <div className="text-xs text-green-400 font-medium mt-1">
                        Alta Performance
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-2 py-3">
                  {getStatusBadge(campaign.status)}
                </td>
                {/* Orçamento - CLICÁVEL */}
                <td 
                  className="px-2 py-3 text-sm cursor-pointer hover:bg-blue-900/20 transition-colors group"
                  onClick={() => toggleBudgetModal(campaign.campaign_id, true)}
                  title="Clique para alterar o orçamento"
                >
                  <div className="text-blue-400 group-hover:text-blue-300 font-medium">
                    {formatCurrency(campaign.dailyBudget)}
                  </div>
                  <div className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Clique para editar
                  </div>
                </td>
                <td className="px-2 py-3 text-sm text-gray-300">
                  {formatCurrency(campaign.valorUsado)}
                </td>
                <td className="px-2 py-3 text-sm text-gray-300">
                  {formatCurrency(campaign.cpm)}
                </td>
                <td className="px-2 py-3 text-sm text-gray-300 text-center">
                  {campaign.compras}
                </td>
                <td className="px-2 py-3 text-sm text-gray-300">
                  {formatCurrency(campaign.cpa)}
                </td>
                <td className="px-2 py-3 text-sm text-green-400 font-medium">
                  {formatCurrency(campaign.comissao)}
                </td>
                <td className="px-2 py-3 text-sm text-gray-300">
                  {formatCurrency(campaign.faturamento)}
                </td>
                <td className="px-2 py-3 text-sm text-gray-300">
                  {formatCurrency(campaign.ticketMedio)}
                </td>
                <td className="px-2 py-3 text-sm text-center">
                  <span className={`font-medium ${getRoasColor(campaign.roas)} ${
                    isHighPerformanceCampaign(campaign) ? 'bg-green-900/30 px-2 py-1 rounded text-green-300' : 
                    getRoasBackground(campaign.roas) ? `${getRoasBackground(campaign.roas)} px-2 py-1 rounded` : ''
                  }`}>
                    {formatNumber(campaign.roas)}x
                  </span>
                </td>
                <td className="px-2 py-3 text-sm">
                  <span className={`font-medium ${getProfitColor(campaign.lucro, campaign.roas)} ${
                    isHighPerformanceCampaign(campaign) ? 'bg-green-900/30 px-2 py-1 rounded text-green-300' : 
                    getProfitBackground(campaign.lucro, campaign.roas) ? `${getProfitBackground(campaign.lucro, campaign.roas)} px-2 py-1 rounded` : ''
                  }`}>
                    {formatCurrency(campaign.lucro)}
                  </span>
                </td>
                <td className="px-2 py-3 text-sm text-gray-300 text-center">
                  {campaign.upsellCount}
                </td>
              </tr>
              )
            })}
          </tbody>
        </table>
        
        {sortedCampaigns.length === 0 && (
          <div className="p-6 text-center text-gray-400">
            Nenhuma campanha encontrada
          </div>
        )}
      </div>
    </div>
  )
} 
