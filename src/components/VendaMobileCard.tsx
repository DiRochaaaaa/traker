
import { Venda } from './VendasPage'
import {
  Clock,
  User,
  Box,
  Hash,
} from 'lucide-react'

interface VendaMobileCardProps {
  venda: Venda
  formatCurrency: (value: number) => string
  formatDate: (dateString: string) => string
  getTipoColor: (tipo: string | null) => string
  getTipoLabel: (tipo: string | null) => string
  getCampaignIdStyle: (campaign_id: string | null) => string
  getCampaignIdLabel: (campaign_id: string | null) => string
  getPlatformStyle: (plataforma: string | null) => string
  getPlatformLabel: (plataforma: string | null) => string
}

export function VendaMobileCard({
  venda,
  formatCurrency,
  formatDate,
  getTipoColor,
  getTipoLabel,
  getCampaignIdStyle,
  getCampaignIdLabel,
  getPlatformStyle,
  getPlatformLabel,
}: VendaMobileCardProps) {
  const faturamento = parseFloat(venda.faturamento_bruto || '0')
  const comissao = parseFloat(venda.comissao || '0')

  return (
    <div className="p-3.5 bg-gray-800/50 hover:bg-gray-700/50 transition-colors rounded-lg border border-gray-700/80 shadow-md">
      <div className="flex justify-between items-start gap-3">
        {/* Coluna Esquerda: Informações do Produto e Cliente */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 text-xs text-gray-400">
            <span
              className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getPlatformStyle(
                venda.plataforma,
              )}`}
            >
              {getPlatformLabel(venda.plataforma)}
            </span>
            <span
              className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getTipoColor(
                venda.tipo,
              )}`}
            >
              {getTipoLabel(venda.tipo)}
            </span>
          </div>

          <h4 className="text-base font-semibold text-white truncate flex items-center gap-2">
            <Box size={14} className="text-gray-400" />
            {venda.produto || 'Produto não informado'}
          </h4>

          <p className="text-sm text-gray-300 truncate flex items-center gap-2 mt-1">
            <User size={14} className="text-gray-400" />
            {venda.cliente_name || 'Cliente não informado'}
          </p>

          <p className="text-xs text-gray-400 flex items-center gap-2 mt-1.5">
            <Clock size={12} className="text-gray-500" />
            {formatDate(venda.created_at)}
          </p>
        </div>

        {/* Coluna Direita: Valores */}
        <div className="text-right flex-shrink-0">
          <div className="mb-1">
            <span className="text-xs text-blue-400">Faturamento</span>
            <p className="text-lg font-bold text-blue-300">
              {formatCurrency(faturamento)}
            </p>
          </div>
          <div>
            <span className="text-xs text-green-400">Comissão</span>
            <p className="font-semibold text-green-400">
              {formatCurrency(comissao)}
            </p>
          </div>
        </div>
      </div>

      {/* Seção Inferior: IDs e Status */}
      <div className="mt-3 pt-3 border-t border-gray-700/60 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-1.5 font-mono">
          <Hash size={12} className="text-gray-500" />
          ID: {venda.purchase_id || 'N/A'}
        </div>
        <span
          className={`px-2 py-0.5 font-semibold rounded-full border text-xs ${getCampaignIdStyle(
            venda.campaign_id,
          )}`}
        >
          {getCampaignIdLabel(venda.campaign_id)}
        </span>
      </div>
    </div>
  )
} 