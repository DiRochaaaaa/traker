'use client'

import { useState } from 'react'
import { CampaignMetrics } from '../hooks/useFacebookData'
import { CampaignActions } from './CampaignActions'
import { ChevronDown, ChevronUp } from 'lucide-react'

// Funções de formatação locais
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
const formatNumber = (value: number) => {
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}

interface CampaignMobileCardMinimizedProps {
  campaign: CampaignMetrics
  onRefresh?: () => void
}

export function CampaignMobileCardMinimized({ campaign, onRefresh }: CampaignMobileCardMinimizedProps) {
  const [isExpanded, setIsExpanded] = useState(false)

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

  const getCampaignStyle = () => {
    const isHighPerformance = campaign.lucro > 0 && campaign.roas > 2
    if (isHighPerformance) {
      return 'bg-gradient-to-br from-green-900/40 via-green-800/30 to-emerald-900/40 border-l-4 border-l-green-400 shadow-lg shadow-green-500/10'
    }
    return 'bg-gray-800/50 border border-gray-700/50'
  }

  const MetricSquare = ({ label, value, color }: { label: string; value: string; color?: string }) => (
    <div className="text-center bg-gray-800/30 rounded-md p-1.5">
      <p className="text-xs text-gray-400 leading-none mb-0.5">{label}</p>
      <p className={`text-xs font-bold leading-none ${color || 'text-white'}`}>{value}</p>
    </div>
  )

  return (
    <div className={`${getCampaignStyle()} rounded-lg transition-all duration-300 p-2`}>
      {/* Header minimizado - sempre visível */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold text-white leading-tight truncate">
            {campaign.name}
          </h4>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {getStatusBadge(campaign.status)}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Métricas principais - sempre visíveis */}
      <div className="grid grid-cols-4 gap-1.5 mb-2">
        <MetricSquare 
          label="Lucro" 
          value={formatCurrency(campaign.lucro)} 
          color={getProfitColor(campaign.lucro, campaign.roas)} 
        />
        <MetricSquare 
          label="ROAS" 
          value={`${formatNumber(campaign.roas)}x`} 
          color={getRoasColor(campaign.roas)} 
        />
        <MetricSquare 
          label="Gasto" 
          value={formatCurrency(campaign.valorUsado)} 
          color="text-red-400" 
        />
        <MetricSquare 
          label="Compras" 
          value={String(campaign.compras)} 
        />
      </div>

      {/* Seção expandida - só aparece quando expandido */}
      {isExpanded && (
        <div className="space-y-2 border-t border-gray-700/50 pt-2">
          {/* Métricas secundárias */}
          <div className="grid grid-cols-3 gap-1.5">
            <MetricSquare 
              label="Comissão" 
              value={formatCurrency(campaign.comissao)} 
              color="text-green-400" 
            />
            <MetricSquare 
              label="CPA" 
              value={formatCurrency(campaign.cpa)} 
            />
            <MetricSquare 
              label="CPI" 
              value={formatCurrency(campaign.cpi)} 
            />
            <MetricSquare 
              label="T. Médio" 
              value={formatCurrency(campaign.ticketMedio)} 
              color="text-blue-400" 
            />
            <MetricSquare 
              label="CPM" 
              value={formatCurrency(campaign.cpm)} 
            />
            <MetricSquare 
              label="Budget" 
              value={formatCurrency(campaign.dailyBudget)} 
              color="text-blue-400" 
            />
          </div>

          {/* Ações */}
          <div className="flex justify-center pt-1">
            <CampaignActions 
              campaign={campaign} 
              onActionComplete={onRefresh} 
              variant="minimal" 
            />
          </div>
        </div>
      )}
    </div>
  )
}