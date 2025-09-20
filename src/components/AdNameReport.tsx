'use client'

import { useState, useEffect, useCallback } from 'react'
import { BarChart3, RefreshCw, Filter, Calendar } from 'lucide-react'

interface AdNameData {
  ad_name: string
  vendas: number
  comissao_total: number
}

interface AdNameReportResponse {
  success: boolean
  data: AdNameData[]
  total_ad_names: number
  total_vendas: number
  total_comissao: number
  error?: string
}

interface FilterState {
  dateFrom: string
  dateTo: string
}

export function AdNameReport() {
  const [data, setData] = useState<AdNameData[]>([])
  const [filteredData, setFilteredData] = useState<AdNameData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // const [totals, setTotals] = useState({ ad_names: 0, vendas: 0, comissao: 0 })
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: '',
    dateTo: ''
  })

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Construir URL com parâmetros de filtro de data
      const params = new URLSearchParams()
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.append('dateTo', filters.dateTo)
      
      const url = `/api/ad-names-report${params.toString() ? '?' + params.toString() : ''}`
      const response = await fetch(url)
      const result: AdNameReportResponse = await response.json()
      
      if (result.success) {
        setData(result.data)
        setFilteredData(result.data)
        // setTotals({
        //   ad_names: result.total_ad_names,
        //   vendas: result.total_vendas,
        //   comissao: result.total_comissao
        // })
      } else {
        setError(result.error || 'Erro ao carregar dados')
      }
    } catch (err) {
      setError('Erro ao conectar com a API')
      console.error('Erro ao buscar relatório de ad names:', err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Os filtros de data são aplicados na API, então apenas mantemos os dados sincronizados
  const applyFilters = useCallback(() => {
    setFilteredData(data)
  }, [data])
  
  const resetFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: ''
    })
  }
  
  // Função para obter data no fuso horário de Brasília
  const getBrazilDate = (date: Date) => {
    // Criar data no fuso horário de Brasília (UTC-3)
    const brazilOffset = -3 * 60 // -3 horas em minutos
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000)
    const brazilTime = new Date(utc + (brazilOffset * 60000))
    
    // Retornar no formato YYYY-MM-DD
    const year = brazilTime.getFullYear()
    const month = String(brazilTime.getMonth() + 1).padStart(2, '0')
    const day = String(brazilTime.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  }

  // Função para definir período pré-definido
  const setDatePeriod = (period: string) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    
    switch (period) {
      case 'today':
        const todayStr = getBrazilDate(today)
        setFilters({ dateFrom: todayStr, dateTo: todayStr })
        break
      case 'yesterday':
        const yesterdayStr = getBrazilDate(yesterday)
        setFilters({ dateFrom: yesterdayStr, dateTo: yesterdayStr })
        break
      case 'last_7_days':
        const last7Days = new Date(today)
        last7Days.setDate(today.getDate() - 6)
        setFilters({ 
          dateFrom: getBrazilDate(last7Days), 
          dateTo: getBrazilDate(today) 
        })
        break
      case 'this_month':
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        setFilters({ 
          dateFrom: getBrazilDate(firstDayOfMonth), 
          dateTo: getBrazilDate(today) 
        })
        break
      default:
        resetFilters()
    }
  }
  
  useEffect(() => {
    fetchData()
  }, [fetchData])
  
  useEffect(() => {
    applyFilters()
  }, [filters, data, applyFilters])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Relatório de Ad Names</h2>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-300 font-medium">Carregando relatório...</p>
            <p className="text-gray-500 text-sm mt-1">Analisando dados de ad names</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Relatório de Ad Names</h2>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar Novamente
          </button>
        </div>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-900/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">⚠</span>
          </div>
          <div className="text-red-400 font-medium mb-2">Erro ao carregar dados</div>
          <div className="text-gray-400 text-sm">{error}</div>
          <div className="text-gray-500 text-xs mt-2">Erro interno do servidor</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Relatório de Ad Names</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
              showFilters 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filtros
          </button>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-gray-700/50 rounded-lg p-4 mb-6 border border-gray-600">
          {/* Períodos Pré-definidos */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Períodos Rápidos
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setDatePeriod('today')}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Hoje
              </button>
              <button
                onClick={() => setDatePeriod('yesterday')}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Ontem
              </button>
              <button
                onClick={() => setDatePeriod('last_7_days')}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Últimos 7 dias
              </button>
              <button
                onClick={() => setDatePeriod('this_month')}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Este mês
              </button>
            </div>
          </div>

          {/* Seleção Manual de Datas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtro de Data Inicial */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Data Inicial
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtro de Data Final */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Data Final
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Botões de Ação dos Filtros */}
          <div className="flex items-center justify-end gap-2 mt-4">
            <button
              onClick={resetFilters}
              className="px-3 py-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              Limpar Filtros
            </button>
            <button
              onClick={fetchData}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}

      {/* Table - Desktop */}
      {filteredData.length === 0 ? (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <div className="text-gray-500">Nenhum ad name encontrado</div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full divide-y divide-gray-700">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ad Name</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Vendas</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Comissão Total</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Ticket Médio</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredData.map((item) => (
                  <tr key={item.ad_name} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-white truncate max-w-xs" title={item.ad_name}>
                        {item.ad_name}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-300 border border-green-700">
                        {item.vendas}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-white">
                      {formatCurrency(item.comissao_total)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-gray-300">
                      {formatCurrency(item.comissao_total / item.vendas)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {filteredData.map((item) => (
              <div key={item.ad_name} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-300 border border-green-700">
                        {item.vendas} vendas
                      </span>
                    </div>
                    <h3 className="font-medium text-white text-sm leading-tight" title={item.ad_name}>
                      {item.ad_name}
                    </h3>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400 block">Comissão Total</span>
                    <span className="font-semibold text-white">{formatCurrency(item.comissao_total)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Ticket Médio</span>
                    <span className="font-semibold text-white">{formatCurrency(item.comissao_total / item.vendas)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}