import { CampaignMetrics } from '@/hooks/useFacebookData'

interface CampaignsTableProps {
  campaigns: CampaignMetrics[]
}

export function CampaignsTable({ campaigns }: CampaignsTableProps) {
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

  const getProfitColor = (profit: number) => {
    return profit >= 0 ? 'text-green-400' : 'text-red-400'
  }

  const getRoasColor = (roas: number) => {
    if (roas >= 3) return 'text-green-400'
    if (roas >= 2) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
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
            {campaigns.map((campaign) => (
              <div key={campaign.campaign_id} className="bg-gray-900/50 border border-gray-600/50 rounded-xl p-5 space-y-4 shadow-lg">
                {/* Header da Campanha */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0 pr-3">
                    <h4 className="text-base font-semibold text-white leading-tight mb-2" style={{ lineHeight: '1.3' }}>
                      {campaign.name}
                    </h4>
                    <p className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded inline-block">
                      ID: {campaign.account_id}
                    </p>
                  </div>
                  <div className="ml-2 mt-1">
                    {getStatusBadge(campaign.status)}
                  </div>
                </div>

                {/* Métricas Principais - Destaque */}
                <div className="bg-gray-800/60 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <span className="text-xs text-gray-400 block mb-1">Comissão</span>
                      <p className="text-lg font-bold text-green-400">{formatCurrency(campaign.comissao)}</p>
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-gray-400 block mb-1">Faturamento</span>
                      <p className="text-lg font-bold text-blue-400">{formatCurrency(campaign.faturamento)}</p>
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-gray-400 block mb-1">Lucro</span>
                      <p className={`text-lg font-bold ${getProfitColor(campaign.lucro)}`}>
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
                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <span className="text-xs text-gray-400 block mb-1">ROAS</span>
                      <p className={`text-sm font-semibold ${getRoasColor(campaign.roas)}`}>
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
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full divide-y divide-gray-700" style={{minWidth: '1500px'}}>
          <thead className="bg-gray-900/50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[18%]">
                Nome
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[5%]">
                Status
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[7%]">
                Budget Diário
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[7%]">
                Valor Usado
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[5%]">
                CPM
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[6%]">
                Compras
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[6%]">
                CPA
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[7%]">
                Comissão
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[7%]">
                Faturamento
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[7%]">
                Ticket Médio
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[5%]">
                ROAS
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[7%]">
                Lucro
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[5%]">
                Upsells
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[5%]">
                Bumps
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {campaigns.map((campaign) => (
              <tr key={campaign.campaign_id} className="hover:bg-gray-700/50 transition-colors">
                <td className="px-3 py-3">
                  <div>
                    <div className="text-sm font-medium text-white truncate" title={campaign.name}>
                      {campaign.name}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {campaign.account_id}
                    </div>
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
                  <span className={`font-medium ${getRoasColor(campaign.roas)}`}>
                    {formatNumber(campaign.roas)}x
                  </span>
                </td>
                <td className="px-2 py-3 text-sm">
                  <span className={`font-medium ${getProfitColor(campaign.lucro)}`}>
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
            ))}
          </tbody>
        </table>
        
        {campaigns.length === 0 && (
          <div className="p-6 text-center text-gray-400">
            Nenhuma campanha encontrada
          </div>
        )}
      </div>
    </div>
  )
} 