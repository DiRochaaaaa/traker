'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar, Filter, Search, TrendingUp, ShoppingBag, DollarSign, Eye, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Venda {
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

export function VendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [loading, setLoading] = useState(false)
  const [period, setPeriod] = useState<string>('today')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTipo, setFilterTipo] = useState<string>('all')
  const [stats, setStats] = useState<VendasStats>({ total: 0, faturamento: 0, comissao: 0, vendas_main: 0 })

  const fetchVendas = useCallback(async (selectedPeriod: string) => {
    setLoading(true)
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
      setLoading(false)
    }
  }, [])

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
  }, [period, fetchVendas])

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total de Vendas</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <ShoppingBag className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Vendas Principais</p>
                <p className="text-2xl font-bold text-green-400">{stats.vendas_main}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Comissão Total</p>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(stats.comissao)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Faturamento Total</p>
                <p className="text-2xl font-bold text-blue-400">{formatCurrency(stats.faturamento)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 md:p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Period Filter */}
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-400" />
              <span className="text-sm font-medium text-gray-300">Período:</span>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md text-sm"
              >
                <option value="today">Hoje</option>
                <option value="yesterday">Ontem</option>
                <option value="last_7_days">Últimos 7 dias</option>
                <option value="this_month">Este mês</option>
              </select>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por produto, cliente ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md text-sm placeholder-gray-400"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-400" />
              <span className="text-sm font-medium text-gray-300">Tipo:</span>
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 rounded-md text-sm"
              >
                <option value="all">Todos</option>
                <option value="main">Principal</option>
                <option value="upsell">Upsell</option>
                <option value="orderbump">Order Bump</option>
              </select>
            </div>
          </div>
        </div>

        {/* Vendas Table/Cards */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-base md:text-lg font-semibold text-white">
              Vendas Encontradas ({vendasFiltradas.length})
            </h3>
            {loading && (
              <div className="text-blue-400 text-sm">Carregando...</div>
            )}
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
              <p className="text-gray-400 mt-2">Carregando vendas...</p>
            </div>
          ) : vendasFiltradas.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma venda encontrada para os filtros selecionados</p>
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="block lg:hidden">
                <div className="divide-y divide-gray-700">
                  {vendasFiltradas.map((venda) => (
                    <div key={venda.id} className="p-4 hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium truncate">
                            {venda.produto || 'Produto não informado'}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            {venda.cliente_name || 'Cliente não informado'}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getTipoColor(venda.tipo)}`}>
                          {getTipoLabel(venda.tipo)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                          <span className="text-gray-400 text-xs">Comissão</span>
                          <p className="text-green-400 font-medium">
                            {formatCurrency(parseFloat(venda.comissao || '0'))}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-xs">Faturamento</span>
                          <p className="text-blue-400 font-medium">
                            {formatCurrency(parseFloat(venda.faturamento_bruto || '0'))}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-700/50">
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>{formatDate(venda.created_at)}</span>
                          <span>ID: {venda.purchase_id}</span>
                        </div>
                      </div>
                    </div>
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
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400 font-mono">
                          {venda.campaign_id || '—'}
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