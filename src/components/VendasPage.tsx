'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar, Filter, Search, TrendingUp, ShoppingBag, DollarSign, Eye, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { SkeletonCard, SkeletonTable } from './SkeletonCard'
import { VendaMobileCard } from './VendaMobileCard'

export interface Venda {
  id: number
  created_at: string
  plataforma: string | null
  purchase_id: string | null
  produto: string | null
  tipo: string | null
  faturamento_bruto: string | null
  comissao: string | null
  campaign_id: string | null
  cliente_name: string | null
  cliente_email: string | null
  source: string | null
}

interface VendasStats {
  total: number
  faturamento: number
  comissao: number
  vendas_main: number
}

interface LoadingStates {
  vendas: boolean
  stats: boolean
  isInitialLoad: boolean
}

export function VendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [campaignIds, setCampaignIds] = useState<string[]>([])
  const [loading, setLoading] = useState<LoadingStates>({
    vendas: false,
    stats: false,
    isInitialLoad: true
  })
  const [period, setPeriod] = useState<string>('today')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTipo, setFilterTipo] = useState<string>('all')
  const [stats, setStats] = useState<VendasStats>({ total: 0, faturamento: 0, comissao: 0, vendas_main: 0 })

  const fetchVendas = useCallback(async (selectedPeriod: string) => {
    setLoading(prev => ({ ...prev, vendas: true, stats: true }))
    try {
      const response = await fetch(`/api/vendas?period=${selectedPeriod}`)
      const result = await response.json()
      
      if (result.success) {
        setVendas(result.data)
        calculateStats(result.data)
      }
    } catch (error) {
      console.error('Erro ao buscar vendas:', error)
    } finally {
      setLoading(prev => ({ ...prev, vendas: false, stats: false, isInitialLoad: false }))
    }
  }, [])

  const fetchCampaignIds = useCallback(async (selectedPeriod: string) => {
    try {
      const response = await fetch(`/api/facebook/campaigns?account=all&period=${selectedPeriod}`)
      const result = await response.json()
      if (result.success) {
        setCampaignIds(result.data.map((c: { id: string }) => c.id))
      } else {
        setCampaignIds([])
      }
    } catch (error) {
      console.error('Erro ao buscar campanhas:', error)
      setCampaignIds([])
    }
  }, [])

  const handleRefresh = useCallback(() => {
    fetchVendas(period)
    fetchCampaignIds(period)
  }, [period, fetchVendas, fetchCampaignIds])

  const calculateStats = (vendasData: Venda[]) => {
    const stats = vendasData.reduce((acc, venda) => {
      const faturamento = parseFloat(venda.faturamento_bruto || '0')
      const comissao = parseFloat(venda.comissao || '0')
      const isMain = !venda.tipo || venda.tipo.toLowerCase() === 'main' || 
                     (!venda.tipo.toLowerCase().includes('upsell') && 
                      !venda.tipo.toLowerCase().includes('orderbump'))
      
      return {
        total: acc.total + 1,
        faturamento: acc.faturamento + faturamento,
        comissao: acc.comissao + comissao,
        vendas_main: acc.vendas_main + (isMain ? 1 : 0)
      }
    }, { total: 0, faturamento: 0, comissao: 0, vendas_main: 0 })
    
    setStats(stats)
  }

  useEffect(() => {
    fetchVendas(period)
    fetchCampaignIds(period)
  }, [period, fetchVendas, fetchCampaignIds])

  // Filtrar vendas baseado na busca e tipo
  const vendasFiltradas = vendas.filter(venda => {
    const matchSearch = !searchTerm || 
      venda.produto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venda.cliente_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venda.purchase_id?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchTipo = filterTipo === 'all' || 
      (filterTipo === 'main' && (!venda.tipo || venda.tipo.toLowerCase() === 'main')) ||
      (filterTipo === 'upsell' && venda.tipo?.toLowerCase().includes('upsell')) ||
      (filterTipo === 'orderbump' && venda.tipo?.toLowerCase().includes('orderbump'))
    
    return matchSearch && matchTipo
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTipoColor = (tipo: string | null) => {
    if (!tipo || tipo.toLowerCase() === 'main') return 'bg-green-900/30 text-green-300 border-green-500/30'
    if (tipo.toLowerCase().includes('upsell')) return 'bg-purple-900/30 text-purple-300 border-purple-500/30'
    if (tipo.toLowerCase().includes('orderbump')) return 'bg-orange-900/30 text-orange-300 border-orange-500/30'
    return 'bg-gray-700/30 text-gray-300 border-gray-500/30'
  }

  const getTipoLabel = (tipo: string | null) => {
    if (!tipo || tipo.toLowerCase() === 'main') return 'Principal'
    if (tipo.toLowerCase().includes('upsell')) return 'Upsell'
    if (tipo.toLowerCase().includes('orderbump')) return 'Order Bump'
    return tipo
  }

  const getCampaignIdStyle = (campaign_id: string | null) => {
    if (!campaign_id) return 'bg-red-900/30 text-red-300 border-red-500/30'
    if (!campaignIds.includes(campaign_id)) {
      return 'bg-yellow-900/30 text-yellow-300 border-yellow-500/30'
    }
    return 'text-gray-400 font-mono'
  }

  const getCampaignIdLabel = (campaign_id: string | null) => {
    if (!campaign_id) return 'Sem campanha'
    if (!campaignIds.includes(campaign_id)) return 'Não vinculado'
    return campaign_id
  }

  const getPlatformStyle = (plataforma: string | null) => {
    if (!plataforma) return 'bg-gray-700/30 text-gray-300 border-gray-500/30'
    switch (plataforma.toLowerCase()) {
      case 'cakto':
        return 'bg-green-900/30 text-green-300 border-green-500/30'
      case 'hotmart':
        return 'bg-orange-900/30 text-orange-300 border-orange-500/30'
      default:
        return 'bg-gray-700/30 text-gray-300 border-gray-500/30'
    }
  }

  const getPlatformLabel = (plataforma: string | null) => {
    if (!plataforma) return 'Desconhecida'
    return plataforma.charAt(0).toUpperCase() + plataforma.slice(1).toLowerCase()
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="text-sm">Voltar ao Dashboard</span>
                </Link>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <ShoppingBag className="h-8 w-8 text-blue-400" />
                Histórico de Vendas
              </h1>
              <p className="text-gray-400 mt-1 text-sm md:text-base">
                Visualize e analise todas as suas vendas em tempo real
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          {loading.stats && loading.isInitialLoad ? (
            // Mostrar skeletons apenas no primeiro carregamento
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs">Total de Vendas</p>
                    <p className={`text-xl font-bold text-white ${loading.stats ? 'opacity-60' : ''}`}>
                      {stats.total}
                    </p>
                  </div>
                  <ShoppingBag className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs">Vendas Principais</p>
                    <p className={`text-xl font-bold text-green-400 ${loading.stats ? 'opacity-60' : ''}`}>
                      {stats.vendas_main}
                    </p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs">Comissão Total</p>
                    <p className={`text-xl font-bold text-green-400 ${loading.stats ? 'opacity-60' : ''}`}>
                      {formatCurrency(stats.comissao)}
                    </p>
                  </div>
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs">Faturamento Total</p>
                    <p className={`text-xl font-bold text-blue-400 ${loading.stats ? 'opacity-60' : ''}`}>
                      {formatCurrency(stats.faturamento)}
                    </p>
                  </div>
                  <DollarSign className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Filters */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 md:p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search Input - first on mobile, middle on desktop */}
            <div className="flex items-center gap-2 flex-1 lg:order-2">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por produto, cliente ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md text-sm placeholder-gray-400"
              />
            </div>
            
            {/* Selects wrapper */}
            <div className="grid grid-cols-2 gap-4 lg:contents">
              {/* Period Filter */}
              <div className="flex items-center gap-2 lg:order-1">
                <Calendar className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md text-sm"
                  aria-label="Filtrar por período"
                >
                  <option value="today">Hoje</option>
                  <option value="yesterday">Ontem</option>
                  <option value="last_7_days">Últimos 7 dias</option>
                  <option value="this_month">Este mês</option>
                </select>
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-2 lg:order-3">
                <Filter className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <select
                  value={filterTipo}
                  onChange={(e) => setFilterTipo(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md text-sm"
                  aria-label="Filtrar por tipo de venda"
                >
                  <option value="all">Todos os tipos</option>
                  <option value="main">Principal</option>
                  <option value="upsell">Upsell</option>
                  <option value="orderbump">Order Bump</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Vendas Table/Cards */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-base md:text-lg font-semibold text-white">
              Vendas Encontradas ({vendasFiltradas.length})
            </h3>
            <button
              onClick={handleRefresh}
              disabled={loading.vendas}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-300 bg-gray-800/80 border border-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading.vendas ? 'animate-spin' : ''}`} />
              {loading.vendas && !loading.isInitialLoad ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>

          {loading.vendas && loading.isInitialLoad ? (
            <SkeletonTable />
          ) : vendasFiltradas.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma venda encontrada para os filtros selecionados</p>
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="block lg:hidden">
                <div className="space-y-3 p-2">
                  {vendasFiltradas.map((venda) => (
                    <VendaMobileCard 
                      key={venda.id}
                      venda={venda}
                      formatCurrency={formatCurrency}
                      formatDate={formatDate}
                      getTipoColor={getTipoColor}
                      getTipoLabel={getTipoLabel}
                      getCampaignIdStyle={getCampaignIdStyle}
                      getCampaignIdLabel={getCampaignIdLabel}
                      getPlatformStyle={getPlatformStyle}
                      getPlatformLabel={getPlatformLabel}
                    />
                  ))}
                </div>
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full divide-y divide-gray-700">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Plataforma
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Produto
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Comissão
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Faturamento
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Purchase ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Campaign ID
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {vendasFiltradas.map((venda) => (
                      <tr key={venda.id} className="hover:bg-gray-700/50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          {formatDate(venda.created_at)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded border ${getPlatformStyle(venda.plataforma)}`}>
                            {getPlatformLabel(venda.plataforma)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-white max-w-xs truncate">
                          {venda.produto || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300 max-w-xs truncate">
                          {venda.cliente_name || '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded border ${getTipoColor(venda.tipo)}`}>
                            {getTipoLabel(venda.tipo)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-400">
                          {formatCurrency(parseFloat(venda.comissao || '0'))}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-400">
                          {formatCurrency(parseFloat(venda.faturamento_bruto || '0'))}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400 font-mono">
                          {venda.purchase_id || '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 text-xs font-medium rounded border ${getCampaignIdStyle(venda.campaign_id)}`}>
                            {getCampaignIdLabel(venda.campaign_id)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 