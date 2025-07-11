'use client'

import { useState } from 'react'
import { TrendingDown, DollarSign, Target, MousePointerClick } from 'lucide-react'
import { CampaignMetrics } from '@/hooks/useFacebookData'
import { isHighPerformance as checkHighPerformance } from '@/config/performanceColors'
import { CampaignActions } from './CampaignActions'

interface CampaignMobileCardProps {
  campaign: CampaignMetrics
  onRefresh?: () => void
}

export function CampaignMobileCard({ campaign, onRefresh }: CampaignMobileCardProps) {
  const [showBudgetModal, setShowBudgetModal] = useState(false)

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

  const getRoasColor = (roas: number) => {
    if (roas >= 2) return 'text-green-400'
    if (roas >= 1 && roas <= 1.99) return 'text-yellow-400'
    return 'text-red-400'
  }

  const isHighPerformanceCampaign = (campaign: CampaignMetrics) => {
    return checkHighPerformance(campaign.lucro, campaign.roas)
  }

  const getCampaignStyle = () => {
    if (isHighPerformanceCampaign(campaign)) {
      return 'bg-gradient-to-br from-green-900/40 via-green-800/30 to-emerald-900/40 border-l-4 border-l-green-400 shadow-lg shadow-green-500/10'
    }
    return 'bg-gray-800/50 border border-gray-700/50'
  }

  const MetricSquare = ({ label, value, color, onClick }: { label: string; value: string; color?: string; onClick?: () => void }) => (
    <div 
      className={`text-center bg-gray-800/30 rounded-md p-2 ${onClick ? 'cursor-pointer hover:bg-gray-700/50' : ''}`}
      onClick={onClick}
    >
      <p className="text-xs text-gray-400 leading-none mb-1">{label}</p>
      <p className={`text-sm font-bold leading-none ${color || 'text-white'}`}>{value}</p>
    </div>
  );

  return (
    <div className={`${getCampaignStyle()} rounded-lg transition-all duration-300 p-2.5`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white leading-snug">
            {campaign.name}
          </h4>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {getStatusBadge(campaign.status)}
          <CampaignActions campaign={campaign} onActionComplete={onRefresh} variant="minimal" />
        </div>
      </div>

      {/* Métricas em Grade */}
      <div className="grid grid-cols-3 gap-2">
        <MetricSquare label="Lucro" value={formatCurrency(campaign.lucro)} color={getProfitColor(campaign.lucro, campaign.roas)} />
        <MetricSquare label="ROAS" value={`${formatNumber(campaign.roas)}x`} color={getRoasColor(campaign.roas)} />
        <MetricSquare label="Comissão" value={formatCurrency(campaign.comissao)} color="text-green-400" />
        
        <MetricSquare label="Gasto" value={formatCurrency(campaign.valorUsado)} color="text-red-400" />
        <MetricSquare label="CPA" value={formatCurrency(campaign.cpa)} />
        <MetricSquare label="CPI" value={formatCurrency(campaign.cpi)} />

        <MetricSquare label="Compras" value={String(campaign.compras)} />
        <MetricSquare label="T. Médio" value={formatCurrency(campaign.ticketMedio)} color="text-blue-400" />
        <MetricSquare label="CPM" value={formatCurrency(campaign.cpm)} />

        <MetricSquare 
          label="Budget" 
          value={formatCurrency(campaign.dailyBudget)} 
          color="text-blue-400"
          onClick={() => setShowBudgetModal(true)}
        />
        {(campaign.upsellCount > 0 || campaign.orderbumpCount > 0) && (
           <MetricSquare label="Upsells" value={String(campaign.upsellCount)} color="text-purple-400" />
        )}
        {(campaign.upsellCount > 0 || campaign.orderbumpCount > 0) && (
           <MetricSquare label="Orderbumps" value={String(campaign.orderbumpCount)} color="text-purple-400" />
        )}
      </div>

      {/* O modal é renderizado aqui, mas invisível até ser ativado */}
      <CampaignActions 
        campaign={campaign} 
        showBudgetModal={showBudgetModal}
        onCloseBudgetModal={() => setShowBudgetModal(false)}
        onActionComplete={onRefresh}
        variant="budget-only"
      />
    </div>
  );
}
