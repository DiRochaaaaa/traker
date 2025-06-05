'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, TrendingDown, DollarSign, Target, MousePointerClick } from 'lucide-react'
import { CampaignMetrics } from '@/hooks/useFacebookData'
import { isHighPerformance as checkHighPerformance } from '@/config/performanceColors'
import { CampaignActions } from './CampaignActions'

interface CampaignMobileCardProps {
  campaign: CampaignMetrics
  onRefresh?: () => void
}

export function CampaignMobileCard({ campaign, onRefresh }: CampaignMobileCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
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

  return (
    <div className={`${getCampaignStyle()} rounded-lg transition-all duration-300`}>
      {/* Header Compacto - Sempre Visível */}
      <div 
        className="p-2.5 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2">
                             <h4 className="text-xs font-semibold text-white truncate leading-tight">
                 {campaign.name}
               </h4>
              {isHighPerformanceCampaign(campaign) && (
                <span className="text-green-400 text-sm">🏆</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(campaign.status)}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>

        {/* Métricas Principais - Mobile: Comissão, Gasto, Lucro, ROAS */}
         <div className="grid grid-cols-4 gap-1">
           {/* 1. Comissão */}
           <div className="text-center bg-gray-800/30 rounded p-1">
             <DollarSign className="h-2.5 w-2.5 text-green-400 mx-auto mb-0.5" />
             <p className="text-xs text-gray-400 mb-0.5 leading-none">Com.</p>
             <p className="text-xs font-bold text-green-400 leading-none">{formatCurrency(campaign.comissao)}</p>
           </div>
           
           {/* 2. Gasto */}
           <div className="text-center bg-gray-800/30 rounded p-1">
             <TrendingDown className="h-2.5 w-2.5 text-red-400 mx-auto mb-0.5" />
             <p className="text-xs text-gray-400 mb-0.5 leading-none">Gasto</p>
             <p className="text-xs font-bold text-red-400 leading-none">{formatCurrency(campaign.valorUsado)}</p>
           </div>
           
           {/* 3. Lucro */}
           <div className="text-center bg-gray-800/30 rounded p-1">
             <Target className="h-2.5 w-2.5 text-purple-400 mx-auto mb-0.5" />
             <p className="text-xs text-gray-400 mb-0.5 leading-none">Lucro</p>
             <p className={`text-xs font-bold leading-none ${getProfitColor(campaign.lucro, campaign.roas)}`}>
               {formatCurrency(campaign.lucro)}
             </p>
           </div>
           
           {/* 4. ROAS */}
           <div className="text-center bg-gray-800/30 rounded p-1">
             <MousePointerClick className="h-2.5 w-2.5 text-orange-400 mx-auto mb-0.5" />
             <p className="text-xs text-gray-400 mb-0.5 leading-none">ROAS</p>
             <p className={`text-xs font-bold leading-none ${getRoasColor(campaign.roas)}`}>
               {formatNumber(campaign.roas)}x
             </p>
           </div>
         </div>
      </div>

              {/* Detalhes Expandidos */}
        {isExpanded && (
          <div className="border-t border-gray-700/50 p-2.5 space-y-2.5">
          {/* Performance Detalhada */}
          <div>
            <h6 className="text-xs font-medium text-gray-300 mb-2 flex items-center gap-1">
              📊 Performance Detalhada
            </h6>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-800/30 rounded p-2">
                <p className="text-xs text-gray-400">Compras</p>
                <p className="text-sm font-semibold text-white">{campaign.compras}</p>
              </div>
              <div className="bg-gray-800/30 rounded p-2">
                <p className="text-xs text-gray-400">CPA</p>
                <p className="text-sm font-semibold text-white">{formatCurrency(campaign.cpa)}</p>
              </div>
              <div className="bg-gray-800/30 rounded p-2">
                <p className="text-xs text-gray-400">Ticket Médio</p>
                <p className="text-sm font-semibold text-blue-400">{formatCurrency(campaign.ticketMedio)}</p>
              </div>
              <div className="bg-gray-800/30 rounded p-2">
                <p className="text-xs text-gray-400">CPM</p>
                <p className="text-sm font-semibold text-white">{formatCurrency(campaign.cpm)}</p>
              </div>
            </div>
          </div>

          {/* Investimento */}
          <div>
            <h6 className="text-xs font-medium text-gray-300 mb-2 flex items-center gap-1">
              💰 Investimento
            </h6>
            <div className="grid grid-cols-2 gap-2">
              {/* Budget Diário - CLICÁVEL */}
              <div 
                className="bg-gray-800/30 rounded p-2 cursor-pointer hover:bg-blue-900/20 transition-colors border border-transparent hover:border-blue-500/30"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowBudgetModal(true)
                }}
                title="Clique para alterar o orçamento"
              >
                <div className="flex items-center gap-1">
                  <p className="text-xs text-gray-400">Budget Diário</p>
                  <DollarSign className="h-3 w-3 text-blue-400" />
                </div>
                <p className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                  {formatCurrency(campaign.dailyBudget)}
                </p>
                <p className="text-xs text-blue-600 mt-0.5">Clique para editar</p>
              </div>
              <div className="bg-gray-800/30 rounded p-2">
                <p className="text-xs text-gray-400">Valor Usado</p>
                <p className="text-sm font-semibold text-white">{formatCurrency(campaign.valorUsado)}</p>
              </div>
            </div>
          </div>

          {/* Upsells/Orderbumps se existirem */}
          {(campaign.upsellCount > 0 || campaign.orderbumpCount > 0) && (
            <div>
              <h6 className="text-xs font-medium text-gray-300 mb-2 flex items-center gap-1">
                🎯 Extras
              </h6>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-800/30 rounded p-2">
                  <p className="text-xs text-gray-400">Upsells</p>
                  <p className="text-sm font-semibold text-purple-400">{campaign.upsellCount}</p>
                </div>
                <div className="bg-gray-800/30 rounded p-2">
                  <p className="text-xs text-gray-400">Orderbumps</p>
                  <p className="text-sm font-semibold text-purple-400">{campaign.orderbumpCount}</p>
                </div>
              </div>
            </div>
          )}

          {/* Ações */}
          <div>
            <h6 className="text-xs font-medium text-gray-300 mb-2 flex items-center gap-1">
              ⚙️ Ações
            </h6>
            <div className="bg-gray-800/30 rounded p-2">
              <div className="text-xs text-gray-400 mb-2">
                Tipo: <span className="text-white font-medium">{campaign.budgetType}</span>
              </div>
              <CampaignActions 
                campaign={campaign} 
                onActionComplete={onRefresh}
                showBudgetModal={showBudgetModal}
                onCloseBudgetModal={() => setShowBudgetModal(false)}
              />
            </div>
          </div>

          {/* Info IDs */}
          <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-700/30 space-y-0.5">
            <div>Account: {campaign.account_id}</div>
            <div>Campanha: {campaign.campaign_id}</div>
          </div>
        </div>
      )}
    </div>
  )
}

