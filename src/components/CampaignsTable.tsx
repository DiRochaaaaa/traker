import { useState, useMemo } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { CampaignMetrics } from '@/hooks/useFacebookData'
import { isHighPerformance as checkHighPerformance } from '@/config/performanceColors'

interface CampaignsTableProps {
  campaigns: CampaignMetrics[]
}

type SortKey = keyof CampaignMetrics | null
type SortDirection = 'asc' | 'desc'

export function CampaignsTable({ campaigns }: CampaignsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

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
    return 'text-green-400' // Lucro positivo mas ROAS baixo
  }

  // 🎨 Função para obter background do lucro baseado na performance
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

  // 🎨 Função para obter background do ROAS baseado na performance
  const getRoasBackground = (roas: number) => {
    if (roas >= 2) return 'bg-green-900/30'
    if (roas >= 1 && roas <= 1.99) return 'bg-yellow-900/30'
    return ''
  }

  // 🎯 Função para identificar campanhas de alta performance (usando configuração centralizada)
  const isHighPerformanceCampaign = (campaign: CampaignMetrics) => {
    return checkHighPerformance(campaign.lucro, campaign.roas)
  }

  // 🎨 Função para definir o estilo visual da campanha
  const getCampaignStyle = (campaign: CampaignMetrics) => {
    if (isHighPerformanceCampaign(campaign)) {
      return {
        mobile: `bg-gradient-to-br from-green-900/40 via-green-800/30 to-emerald-900/40 border-2 border-green-500/50 shadow-lg shadow-green-500/20`,
        desktop: `bg-gradient-to-r from-green-900/30 to-emerald-900/20 border-l-4 border-l-green-400`,
        glow: `shadow-lg shadow-green-500/10`
      }
    }
    return {
      mobile: `bg-gray-900/50 border border-gray-600/50`,
      desktop: `hover:bg-gray-700/50`,
      glow: ``
    }
  }

  // 🏆 Função para obter ícone de performance
  const getPerformanceIcon = (campaign: CampaignMetrics) => {
    if (isHighPerformanceCampaign(campaign)) {
      return (
        <div className="flex items-center gap-1 text-green-400">
          <span className="text-lg">🏆</span>
          <span className="text-xs font-medium">Alta Performance</span>
        </div>
      )
    }
    return null
  }

  // 📊 Função para ordenar campanhas
  const sortedCampaigns = useMemo(() => {
    if (!sortKey) return campaigns

    const sorted = [...campaigns].sort((a, b) => {
      let aValue = a[sortKey]
      let bValue = b[sortKey]

      // Converter para número se necessário
      if (typeof aValue === 'string' && !isNaN(Number(aValue))) {
        aValue = Number(aValue)
      }
      if (typeof bValue === 'string' && !isNaN(Number(bValue))) {
        bValue = Number(bValue)
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [campaigns, sortKey, sortDirection])

  // 🔄 Função para lidar com clique no header da coluna
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('desc') // Começar sempre com maior primeiro
    }
  }

  // 🎯 Função para obter ícone de ordenação
  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="h-4 w-4 text-gray-500" />
    }
    
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-blue-400" />
      : <ArrowDown className="h-4 w-4 text-blue-400" />
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden performance-scroll">
      <div className="px-4 md:px-6 py-4 border-b border-gray-700">
        <h3 className="text-base md:text-lg font-semibold text-white">Campanhas Detalhadas</h3>
      </div>
      
      {/* Mobile Card View */}
      <div className="block md:hidden">
        {campaigns.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            Nenhuma campanha encontrada
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {sortedCampaigns.map((campaign) => {
              const style = getCampaignStyle(campaign)
              return (
              <div key={campaign.campaign_id} className={`${style.mobile} ${style.glow} rounded-xl p-5 space-y-4 shadow-lg transition-all duration-300`}>
                {/* Header da Campanha */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-base font-semibold text-white leading-tight" style={{ lineHeight: '1.3' }}>
                        {campaign.name}
                      </h4>
                      {isHighPerformanceCampaign(campaign) && (
                        <span className="text-green-400 text-lg animate-pulse">🏆</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded inline-block">
                      ID: {campaign.account_id}
                    </p>
                    {isHighPerformanceCampaign(campaign) && (
                      <div className="mt-2">
                        {getPerformanceIcon(campaign)}
                      </div>
                    )}
                  </div>
                  <div className="ml-2 mt-1">
                    {getStatusBadge(campaign.status)}
                  </div>
                </div>

                {/* Métricas Principais - Destaque */}
                <div className={`${
                  isHighPerformanceCampaign(campaign) 
                    ? 'bg-gradient-to-br from-green-800/40 to-emerald-800/30 border border-green-500/30' 
                    : 'bg-gray-800/60'
                } rounded-lg p-4 mb-4`}>
                  {isHighPerformanceCampaign(campaign) && (
                    <div className="text-center mb-3">
                      <div className="inline-flex items-center gap-2 bg-green-900/50 px-3 py-1 rounded-full border border-green-500/30">
                        <span className="text-green-400 text-sm">🚀</span>
                        <span className="text-green-300 text-sm font-medium">Performance Excepcional</span>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <span className="text-xs text-gray-400 block mb-1">Comissão</span>
                      <p className={`text-lg font-bold ${
                        isHighPerformanceCampaign(campaign) ? 'text-green-300' : 'text-green-400'
                      }`}>{formatCurrency(campaign.comissao)}</p>
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-gray-400 block mb-1">Faturamento</span>
                      <p className={`text-lg font-bold ${
                        isHighPerformanceCampaign(campaign) ? 'text-emerald-300' : 'text-blue-400'
                      }`}>{formatCurrency(campaign.faturamento)}</p>
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-gray-400 block mb-1">Lucro</span>
                      <p className={`text-lg font-bold ${
                        isHighPerformanceCampaign(campaign) 
                          ? 'text-green-300 bg-green-900/40 px-2 py-1 rounded' 
                          : getProfitColor(campaign.lucro, campaign.roas)
                      } ${
                        !isHighPerformanceCampaign(campaign) && getProfitBackground(campaign.lucro, campaign.roas) 
                          ? `${getProfitBackground(campaign.lucro, campaign.roas)} px-2 py-1 rounded` 
                          : ''
                      }`}>
                        {formatCurrency(campaign.lucro)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Métricas de Performance */}
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-gray-300 border-b border-gray-700 pb-1">📊 Performance</h5>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <span className="text-xs text-gray-400 block mb-1">Compras</span>
                      <p className="text-sm font-semibold text-white">{campaign.compras}</p>
                    </div>
                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <span className="text-xs text-gray-400 block mb-1">CPA</span>
                      <p className="text-sm font-semibold text-white">{formatCurrency(campaign.cpa)}</p>
                    </div>
                    <div className={`${
                      isHighPerformanceCampaign(campaign) ? 'bg-green-900/30 border border-green-500/30' : 
                      getRoasBackground(campaign.roas) || 'bg-gray-800/30'
                    } rounded-lg p-3`}>
                      <span className="text-xs text-gray-400 block mb-1">ROAS</span>
                      <p className={`text-sm font-semibold ${
                        isHighPerformanceCampaign(campaign) 
                          ? 'text-green-300 bg-green-900/40 px-2 py-1 rounded' 
                          : getRoasColor(campaign.roas)
                      }`}>
                        {formatNumber(campaign.roas)}x
                      </p>
                    </div>
                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <span className="text-xs text-gray-400 block mb-1">Ticket Médio</span>
                      <p className="text-sm font-semibold text-blue-400">{formatCurrency(campaign.ticketMedio)}</p>
                    </div>
                  </div>
                </div>

                {/* Métricas de Investimento */}
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-gray-300 border-b border-gray-700 pb-1">💰 Investimento</h5>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <span className="text-xs text-gray-400 block mb-1">Budget Diário</span>
                      <p className="text-sm font-semibold text-white">{formatCurrency(campaign.dailyBudget)}</p>
                    </div>
                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <span className="text-xs text-gray-400 block mb-1">Valor Usado</span>
                      <p className="text-sm font-semibold text-white">{formatCurrency(campaign.valorUsado)}</p>
                    </div>
                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <span className="text-xs text-gray-400 block mb-1">CPM</span>
                      <p className="text-sm font-semibold text-white">{formatCurrency(campaign.cpm)}</p>
                    </div>
                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <span className="text-xs text-gray-400 block mb-1">Upsells + Bumps</span>
                      <p className="text-sm font-semibold text-purple-400">
                        {campaign.upsellCount + campaign.orderbumpCount}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Detalhes de Upsell/Orderbump se houver */}
                {(campaign.upsellCount > 0 || campaign.orderbumpCount > 0) && (
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-gray-300 border-b border-gray-700 pb-1">🎯 Conversões Extras</h5>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <div className="bg-gray-800/30 rounded-lg p-3">
                        <span className="text-xs text-gray-400 block mb-1">Upsells</span>
                        <p className="text-sm font-semibold text-purple-400">{campaign.upsellCount}</p>
                        <span className="text-xs text-gray-500">
                          {campaign.compras > 0 ? `${((campaign.upsellCount / campaign.compras) * 100).toFixed(1)}%` : '0%'}
                        </span>
                      </div>
                      <div className="bg-gray-800/30 rounded-lg p-3">
                        <span className="text-xs text-gray-400 block mb-1">Orderbumps</span>
                        <p className="text-sm font-semibold text-purple-400">{campaign.orderbumpCount}</p>
                        <span className="text-xs text-gray-500">
                          {campaign.compras > 0 ? `${((campaign.orderbumpCount / campaign.compras) * 100).toFixed(1)}%` : '0%'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto modal-scroll">
        <table className="w-full divide-y divide-gray-700" style={{minWidth: '1500px'}}>
          <thead className="bg-gray-900/50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[18%]">
                <button 
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  Nome {getSortIcon('name')}
                </button>
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[5%]">
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
                  Budget {getSortIcon('dailyBudget')}
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
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[5%]">
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
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[5%]">
                <button 
                  onClick={() => handleSort('upsellCount')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  Upsells {getSortIcon('upsellCount')}
                </button>
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[5%]">
                <button 
                  onClick={() => handleSort('orderbumpCount')}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  Bumps {getSortIcon('orderbumpCount')}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {sortedCampaigns.map((campaign) => {
              const style = getCampaignStyle(campaign)
              return (
              <tr key={campaign.campaign_id} className={`${style.desktop} ${style.glow} hover:bg-gray-700/30 transition-all duration-300`}>
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
                <td className="px-2 py-3 text-sm text-gray-300">
                  {formatCurrency(campaign.dailyBudget)}
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
                <td className="px-2 py-3 text-sm text-gray-300 text-center">
                  {campaign.orderbumpCount}
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
