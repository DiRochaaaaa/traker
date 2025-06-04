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
          <div className="p-6 text-center text-gray-400">
            Nenhuma campanha encontrada
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {campaigns.map((campaign) => (
              <div key={campaign.campaign_id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">
                      {campaign.name}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {campaign.account_id}
                    </p>
                  </div>
                  <div className="ml-2">
                    {getStatusBadge(campaign.status)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400">Budget Diário:</span>
                    <p className="text-white font-medium">{formatCurrency(campaign.dailyBudget)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Valor Usado:</span>
                    <p className="text-white font-medium">{formatCurrency(campaign.valorUsado)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Compras:</span>
                    <p className="text-white font-medium">{campaign.compras}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">CPA:</span>
                    <p className="text-white font-medium">{formatCurrency(campaign.cpa)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Faturamento:</span>
                    <p className="text-white font-medium">{formatCurrency(campaign.faturamento)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">ROAS:</span>
                    <p className={`font-medium ${getRoasColor(campaign.roas)}`}>
                      {formatNumber(campaign.roas)}x
                    </p>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Lucro:</span>
                    <span className={`text-sm font-medium ${getProfitColor(campaign.lucro)}`}>
                      {formatCurrency(campaign.lucro)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full divide-y divide-gray-700" style={{minWidth: '1200px'}}>
          <thead className="bg-gray-900/50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[25%]">
                Nome
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[8%]">
                Status
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[10%]">
                Budget Diário
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[10%]">
                Valor Usado
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[8%]">
                CPM
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[7%]">
                Compras
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[8%]">
                CPA
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[10%]">
                Faturamento
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[7%]">
                ROAS
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[10%]">
                Lucro
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
                <td className="px-2 py-3 text-sm text-gray-300">
                  {formatCurrency(campaign.faturamento)}
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