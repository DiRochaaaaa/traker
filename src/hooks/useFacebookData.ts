import { useState, useEffect, useCallback } from 'react'
import { Venda } from '@/lib/supabase'
import { logger } from '@/lib/logger'

export interface FacebookCampaignData {
  id: string
  name: string
  status: string
  effective_status?: string
  daily_budget?: string
  account_id: string
  bid_strategy?: string
  budget_optimization?: string
  insights: {
    data: Array<{
      spend: string
      cpm: string
      actions?: Array<{
        action_type: string
        value: string
      }>
      cost_per_action_type?: Array<{
        action_type: string
        value: string
      }>
      impressions: string
      clicks: string
    }>
  }
}

export interface CampaignMetrics {
  name: string
  status: string
  dailyBudget: number
  valorUsado: number
  cpm: number
  compras: number
  cpa: number
  cpi: number // Custo por Inicialização de Compra
  faturamento: number
  comissao: number
  ticketMedio: number
  ticketMedioBase: number
  taxaUpsellTicket: number
  roas: number
  lucro: number
  upsellCount: number
  orderbumpCount: number
  campaign_id: string
  account_id: string
  budgetType: 'CBO' | 'ABO' | 'UNKNOWN'
  bidStrategy?: string
  // Novas métricas para o funil
  clicks: number
  impressions: number
  initiateCheckout: number
}

export interface PlataformaMetrics {
  plataforma: string
  vendas: number
  faturamento: number
  comissao: number
  ticketMedio: number
  upsellImpactPercent: number
  orderBumpImpactPercent: number
  totalImpactPercent: number
}

export interface LoadingStates {
  campaigns: boolean
  vendas: boolean
  metrics: boolean
  isInitialLoad: boolean
}

export type DatePeriod = 'today' | 'yesterday' | 'last_7_days' | 'this_month'

export function useFacebookData() {
  const [campaigns, setCampaigns] = useState<FacebookCampaignData[]>([])
  const [allCampaigns, setAllCampaigns] = useState<FacebookCampaignData[]>([])
  const [vendas, setVendas] = useState<Venda[]>([])
  const [loading, setLoading] = useState<LoadingStates>({
    campaigns: false,
    vendas: false,
    metrics: false,
    isInitialLoad: true
  })
  const [error, setError] = useState<string | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<string>('all')
  const [selectedPeriod, setSelectedPeriod] = useState<DatePeriod>('today')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [cacheHit, setCacheHit] = useState(false)
  
  // Cache para evitar requests desnecessários
  const [cache, setCache] = useState<Map<string, { data: unknown; timestamp: number }>>(new Map())
  const CACHE_DURATION = 60000 // 1 minuto para melhor performance

  const getCacheKey = (type: 'campaigns' | 'vendas', account?: string, period?: DatePeriod) => {
    return `${type}_${account || 'all'}_${period || 'today'}`
  }

  const getCachedData = useCallback((key: string) => {
    const cached = cache.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setCacheHit(true)
      return cached.data
    }
    setCacheHit(false)
    return null
  }, [cache])

  const setCachedData = (key: string, data: unknown) => {
    setCache(prev => new Map(prev.set(key, { data, timestamp: Date.now() })))
  }

  const fetchCampaigns = useCallback(async (account: string = 'all', period: DatePeriod = 'today') => {
    const cacheKey = getCacheKey('campaigns', account, period)
    
    // ⚡ CACHE HIT - Retorno imediato sem loading
    const cachedData = getCachedData(cacheKey)
    if (cachedData) {
      setCampaigns(cachedData as FacebookCampaignData[])
      logger.cache(`Cache HIT: Campanhas ${account} ${period}`)
      return
    }

    setLoading(prev => ({ ...prev, campaigns: true }))
    setError(null)
    
    try {
      logger.api('facebook/campaigns', `Fetching campaigns ${account} ${period}`)
      const response = await fetch(`/api/facebook/campaigns?account=${account}&period=${period}`)
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch campaigns')
      }
      
      setCampaigns(result.data)
      setCachedData(cacheKey, result.data)
      setLastUpdate(new Date())
      logger.info('CAMPAIGNS', `Loaded ${result.data.length} campaigns`)
    } catch (err) {
      logger.error('CAMPAIGNS', 'Failed to fetch campaigns', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(prev => ({ ...prev, campaigns: false, isInitialLoad: false }))
    }
  }, [getCachedData])

  const fetchCampaignsAll = useCallback(async (period: DatePeriod = 'today') => {
    const cacheKey = getCacheKey('campaigns', 'all', period)

    const cachedData = getCachedData(cacheKey)
    if (cachedData) {
      setAllCampaigns(cachedData as FacebookCampaignData[])
      return
    }

    try {
      const response = await fetch(`/api/facebook/campaigns?account=all&period=${period}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch campaigns')
      }

      setAllCampaigns(result.data)
      setCachedData(cacheKey, result.data)
    } catch (err) {
      console.error('Erro ao buscar todas as campanhas:', err)
    }
  }, [getCachedData])

  const fetchVendas = useCallback(async (period: DatePeriod = 'today') => {
    const cacheKey = getCacheKey('vendas', undefined, period)
    
    const cachedData = getCachedData(cacheKey)
    if (cachedData) {
      setVendas(cachedData as Venda[])
      logger.cache(`Cache HIT: Vendas ${period}`)
      return
    }

    setLoading(prev => ({ ...prev, vendas: true }))
    
    try {
      logger.api('vendas', `Fetching vendas ${period}`)
      const response = await fetch(`/api/vendas?period=${period}`)
      const result = await response.json()
      
      if (result.success) {
        setVendas(result.data)
        setCachedData(cacheKey, result.data)
        setLastUpdate(new Date())
        logger.info('VENDAS', `Loaded ${result.data.length} vendas`)
      } else {
        logger.error('VENDAS', 'Failed to fetch vendas', result.error)
        setVendas([])
      }
    } catch (err) {
      logger.error('VENDAS', 'Error fetching vendas', err)
      setVendas([])
    } finally {
      setLoading(prev => ({ ...prev, vendas: false, isInitialLoad: false }))
    }
  }, [getCachedData])

  // 🚀 CARREGAMENTO PARALELO ULTRA-RÁPIDO
  const fetchAllData = useCallback(async (account: string = 'all', period: DatePeriod = 'today') => {
    setLoading(prev => ({ ...prev, metrics: true }))

    const startTime = Date.now()

    // ⚡ Execução paralela para velocidade máxima
    await Promise.all([
      fetchCampaigns(account, period),
      fetchVendas(period),
      fetchCampaignsAll(period)
    ])
    
    const duration = Date.now() - startTime
    logger.performance('DATA_FETCH', duration, { account, period, cacheHit })
    setLoading(prev => ({ ...prev, metrics: false }))
  }, [fetchCampaigns, fetchVendas, fetchCampaignsAll, cacheHit])

  // 🔄 FORCE REFRESH - Limpa cache e força carregamento
  const forceRefresh = useCallback(async () => {
    logger.info('REFRESH', 'Force refresh initiated')
    
    // Limpar todo o cache para garantir dados frescos
    setCache(new Map())
    
    // Resetar estados
    setError(null)
    setCacheHit(false)
    
    // Força carregamento mesmo se já estiver carregando
    setLoading(() => ({ 
      campaigns: true, 
      vendas: true, 
      metrics: true, 
      isInitialLoad: false 
    }))
    
    try {
      const startTime = Date.now()
      
      // Força busca direta nas APIs (cache limpo garante que não há cache hit)
      await Promise.all([
        fetchCampaigns(selectedAccount, selectedPeriod),
        fetchVendas(selectedPeriod),
        fetchCampaignsAll(selectedPeriod)
      ])
      
      const duration = Date.now() - startTime
      logger.performance('FORCE_REFRESH', duration)
      setLastUpdate(new Date())
    } catch (error) {
      logger.error('REFRESH', 'Force refresh failed', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setLoading(() => ({ 
        campaigns: false, 
        vendas: false, 
        metrics: false, 
        isInitialLoad: false 
      }))
    }
  }, [fetchCampaigns, fetchVendas, fetchCampaignsAll, selectedAccount, selectedPeriod])

  // 🎯 REFRESH INTELIGENTE (sem loading principal para UX melhor)
  const smartRefresh = useCallback(async () => {
    logger.info('REFRESH', 'Smart refresh initiated')
    
    // Não mostrar loading principal, manter dados atuais visíveis
    await Promise.all([
      fetchCampaigns(selectedAccount, selectedPeriod),
      fetchVendas(selectedPeriod),
      fetchCampaignsAll(selectedPeriod)
    ])
    
    logger.info('REFRESH', 'Smart refresh completed')
  }, [fetchCampaigns, fetchVendas, fetchCampaignsAll, selectedAccount, selectedPeriod])

  // Função para normalizar valores monetários (aceita tanto 10.00 quanto 10,00)
  const parseMonetaryValue = (value: string | null | number): number => {
    if (!value && value !== 0) {
      return 0
    }
    
    // Se já é um número, retorna direto
    if (typeof value === 'number') {
      return value
    }
    
    // Converte para string e limpa
    const cleanValue = value?.toString().trim() || ''
    
    if (!cleanValue) {
      return 0
    }
    
    // Remove símbolos de moeda (R$, $, etc.)
    let processedValue = cleanValue.replace(/[R$\s]/g, '')
    
    // Se está vazio após limpeza, retorna 0
    if (!processedValue) {
      return 0
    }
    
    // Trata casos com vírgula como separador decimal (formato brasileiro)
    // Se tem vírgula E ponto, assume que vírgula é separador decimal
    if (processedValue.includes(',') && processedValue.includes('.')) {
      // Exemplo: 1.234,56 -> remove pontos, troca vírgula por ponto
      processedValue = processedValue.replace(/\./g, '').replace(',', '.')
    } else if (processedValue.includes(',')) {
      // Apenas vírgula, assume que é separador decimal
      processedValue = processedValue.replace(',', '.')
    }
    
    const result = parseFloat(processedValue)
    
    // Log apenas se houver problema no parsing
    if (isNaN(result)) {
      console.warn(`⚠️ Erro ao fazer parse do valor monetário: "${value}" -> "${processedValue}"`)
      return 0
    }
    
    return result
  }

  // 🎯 Métricas de vendas vêm do Supabase; gastos e status ainda são obtidos do Facebook API

  // Função para determinar se a campanha é CBO ou ABO
  const determineBudgetType = (campaign: FacebookCampaignData): 'CBO' | 'ABO' | 'UNKNOWN' => {
    try {
      // Se budget_optimization está definido, usar essa informação primeiro
      if (campaign.budget_optimization) {
        const budgetOpt = campaign.budget_optimization.toUpperCase()
        if (budgetOpt === 'CBO' || budgetOpt.includes('CAMPAIGN')) {
          return 'CBO'
        }
        if (budgetOpt === 'ABO' || budgetOpt.includes('ADSET')) {
          return 'ABO'
        }
      }
      
      // Se a campanha tem daily_budget definido e > 0, provavelmente é CBO
      if (campaign.daily_budget && parseFloat(campaign.daily_budget) > 0) {
        return 'CBO'
      }
      
      // Por padrão, assumir ABO (mais comum)
      return 'ABO'
    } catch (error) {
      console.warn('⚠️ Erro ao determinar tipo de budget:', error)
      return 'UNKNOWN'
    }
  }

  const processMetricsFor = useCallback((sourceCampaigns: FacebookCampaignData[]): CampaignMetrics[] => {
    // Função auxiliar para criar métricas de campanha
    const createCampaignMetrics = (campaign: FacebookCampaignData, campaignVendas: Venda[], spend: number, cpm: number, clicks: number, impressions: number, initiateCheckout: number): CampaignMetrics => {
      // Separar vendas por tipo
      const vendasMain = campaignVendas.filter(venda => {
        const tipo = venda.tipo?.toLowerCase() || ''
        return tipo === 'main' || tipo === '' || !tipo.includes('upsell') && !tipo.includes('orderbump') && !tipo.includes('bump')
      })
      
      const vendasUpsell = campaignVendas.filter(venda => {
        const tipo = venda.tipo?.toLowerCase() || ''
        return tipo.includes('upsell')
      })
      
      const vendasOrderbump = campaignVendas.filter(venda => {
        const tipo = venda.tipo?.toLowerCase() || ''
        return tipo.includes('orderbump') || tipo.includes('order-bump') || tipo.includes('bump')
      })
      
      // Calcular faturamentos separados por tipo
      const faturamentoMain = vendasMain.reduce((total, venda) => {
        const valor = parseMonetaryValue(venda.faturamento_bruto || null)
        return total + valor
      }, 0)
      
      const faturamentoUpsell = vendasUpsell.reduce((total, venda) => {
        const valor = parseMonetaryValue(venda.faturamento_bruto || null)
        return total + valor
      }, 0)
      
      const faturamentoOrderbump = vendasOrderbump.reduce((total, venda) => {
        const valor = parseMonetaryValue(venda.faturamento_bruto || null)
        return total + valor
      }, 0)
      
      // Calcular faturamento total (main + orderbump + upsell)
      const faturamentoTotal = faturamentoMain + faturamentoUpsell + faturamentoOrderbump
      
      // Calcular comissões totais
      const comissoesTotal = campaignVendas.reduce((total, venda) => {
        const comissao = parseMonetaryValue(venda.comissao || null)
        return total + comissao
      }, 0)
      
      // Contar apenas vendas MAIN para conversões e CPA
      const comprasMain = vendasMain.length
      const upsellCount = vendasUpsell.length
      const orderbumpCount = vendasOrderbump.length
      
      // Calcular ROAS (Return on Ad Spend) baseado na COMISSÃO
      const roas = spend > 0 ? comissoesTotal / spend : (comissoesTotal > 0 ? Infinity : 0)
      
      // Calcular Lucro (Comissão - Valor usado)
      const lucro = comissoesTotal - spend
      
      // 🎯 USAR APENAS DADOS DO SUPABASE (tempo real)
      const finalCompras = comprasMain // Vendas principais do Supabase
      const finalCpa = spend > 0 && finalCompras > 0 ? spend / finalCompras : 0
      
      // Calcular tickets médios
      const ticketMedioBase = finalCompras > 0 ? faturamentoMain / finalCompras : 0
      const ticketMedio = finalCompras > 0 ? faturamentoTotal / finalCompras : 0
      
      // Calcular taxa de upsell no ticket médio
      const taxaUpsellTicket = ticketMedioBase > 0 
        ? ((ticketMedio - ticketMedioBase) / ticketMedioBase) * 100 
        : 0
      
      // Calcula o Custo por Inicialização de Compra (CPI)
      const costPerInitiateCheckout = campaign.insights?.data?.[0]?.cost_per_action_type?.find(
        (a) => a.action_type === 'initiate_checkout'
      )
      const cpi = costPerInitiateCheckout ? parseFloat(costPerInitiateCheckout.value) : 0

      const metrics = {
        name: campaign.name,
        status: campaign.effective_status || campaign.status,
        dailyBudget: parseFloat(campaign.daily_budget || '0') / 100, // Facebook retorna em centavos
        valorUsado: spend,
        cpm,
        compras: finalCompras, // 🎯 SUPABASE: Vendas principais em tempo real
        cpa: finalCpa, // 🎯 SUPABASE: CPA baseado em vendas reais
        cpi, // Adicionado
        faturamento: faturamentoTotal, // Soma de todos os tipos
        comissao: comissoesTotal, // Total de comissões
        ticketMedio, // Faturamento total / vendas main
        ticketMedioBase, // Faturamento main / vendas main
        taxaUpsellTicket, // Taxa de aumento do ticket médio por upsells
        roas,
        lucro,
        upsellCount,
        orderbumpCount,
        campaign_id: campaign.id,
        account_id: campaign.account_id,
        budgetType: determineBudgetType(campaign),
        bidStrategy: campaign.bid_strategy,
        // Novas métricas para o funil
        clicks,
        impressions,
        initiateCheckout
      }
      
      // Log apenas em debug mode
      if (campaignVendas.length > 0) {
        logger.debug('METRICS', `Campaign ${campaign.name}: ${finalCompras} purchases, ROAS ${roas === Infinity ? '∞' : roas.toFixed(2)}, Profit R$ ${lucro.toFixed(2)}`)
      }
      
      return metrics
    }

    logger.info('METRICS', `Processing metrics: ${sourceCampaigns.length} campaigns, ${vendas.length} sales`)

    // Log dos campaign_ids disponíveis
    const campaignIds = sourceCampaigns.map(c => c.id)
    const vendasCampaignIds = [
      ...new Set(
        vendas
          .map(v => v.campaign_id !== null && v.campaign_id !== undefined ? String(v.campaign_id) : null)
          .filter((id): id is string => Boolean(id))
      )
    ]

    // Verificar correlação
    const matches = vendasCampaignIds.filter(id => campaignIds.includes(id))
    const vendaOrfas = vendasCampaignIds.filter(id => !campaignIds.includes(id))

    logger.debug('METRICS', `Campaign matches: ${matches.length}, orphan sales: ${vendaOrfas.length}`)
    if (vendaOrfas.length > 0) {
      logger.warn('METRICS', `${vendaOrfas.length} sales without corresponding Facebook campaigns`, vendaOrfas)
    }

    // Processar campanhas do Facebook
    const facebookCampaignMetrics = sourceCampaigns.map(campaign => {
      const insights = campaign.insights?.data?.[0]
      const spend = parseFloat(insights?.spend || '0')
      const cpm = parseFloat(insights?.cpm || '0')
      const clicks = parseFloat(insights?.clicks || '0')
      const impressions = parseFloat(insights?.impressions || '0')
      
      // Buscar initiate_checkout nas actions
      const initiateCheckoutAction = insights?.actions?.find(
        (action) => action.action_type === 'initiate_checkout'
      )
      const initiateCheckout = initiateCheckoutAction ? parseFloat(initiateCheckoutAction.value) : 0

      // Buscar vendas para esta campanha
      const campaignVendas = vendas.filter(
        venda => venda.campaign_id && String(venda.campaign_id) === campaign.id
      )

      // Log apenas campanhas com problemas em debug mode
      if (campaignVendas.length > 0) {
        logger.debug('CAMPAIGN_MATCH', `${campaign.name}: R$ ${spend.toFixed(2)} spend, ${campaignVendas.length} sales`)
      } else if (spend > 0) {
        logger.warn('CAMPAIGN_ORPHAN', `${campaign.name}: R$ ${spend.toFixed(2)} spend but no sales found`)
      }

      return createCampaignMetrics(campaign, campaignVendas, spend, cpm, clicks, impressions, initiateCheckout)
    })

    // Processar campanhas órfãs (que têm vendas mas não aparecem no Facebook)
    const orphanCampaignMetrics = vendaOrfas.map(campaignId => {
      const campaignVendas = vendas.filter(venda => String(venda.campaign_id) === campaignId)

      logger.warn('ORPHAN_CAMPAIGN', `Campaign ${campaignId}: ${campaignVendas.length} sales but not found in Facebook API`)

      // Criar campanha fictícia para as vendas órfãs
      const orphanCampaign = {
        id: campaignId,
        name: `Campanha ${campaignId} (Órfã)`,
        status: 'UNKNOWN',
        effective_status: 'UNKNOWN',
        daily_budget: '0',
        account_id: 'unknown',
        insights: { data: [] }
      }

      return createCampaignMetrics(orphanCampaign, campaignVendas, 0, 0, 0, 0, 0)
    })

    const allMetrics = [...facebookCampaignMetrics]

    // Filtrar apenas campanhas com gasto > 0 OU que tenham vendas
    const filteredMetrics = allMetrics.filter(metric => {
      const hasSpend = metric.valorUsado > 0
      const hasSales = metric.compras > 0 || metric.faturamento > 0

      // Manter campanhas que têm gasto OU vendas
      return hasSpend || hasSales
    })

    // 💰 ORDENAR POR MAIOR LUCRO (padrão sempre)
    const sortedMetrics = filteredMetrics.sort((a, b) => b.lucro - a.lucro)

    console.log(
      `📊 Total de métricas processadas: ${allMetrics.length} (${facebookCampaignMetrics.length} Facebook + ${orphanCampaignMetrics.length} órfãs)`
    )
    console.log(
      `📊 Métricas após filtro: ${filteredMetrics.length} (removidas: ${allMetrics.length - filteredMetrics.length})`
    )
    console.log('💰 Métricas ordenadas por MAIOR LUCRO automaticamente')

    return sortedMetrics
  }, [vendas])

  const processMetrics = useCallback(() => processMetricsFor(campaigns), [processMetricsFor, campaigns])
  const processAllMetrics = useCallback(() => processMetricsFor(allCampaigns), [processMetricsFor, allCampaigns])

  const getTotals = useCallback((metrics: CampaignMetrics[]) => {
    const totals = metrics.reduce((acc, metric) => ({
      dailyBudget: acc.dailyBudget + metric.dailyBudget,
      valorUsado: acc.valorUsado + metric.valorUsado,
      compras: acc.compras + metric.compras,
      faturamento: acc.faturamento + metric.faturamento,
      comissao: acc.comissao + metric.comissao,
      lucro: acc.lucro + metric.lucro,
      upsellCount: acc.upsellCount + metric.upsellCount,
      orderbumpCount: acc.orderbumpCount + metric.orderbumpCount,
      cpm: acc.cpm + metric.cpm,
      cpa: acc.cpa + metric.cpa,
      ticketMedio: acc.ticketMedio + metric.ticketMedio,
      ticketMedioBase: acc.ticketMedioBase + metric.ticketMedioBase,
      taxaUpsellTicket: acc.taxaUpsellTicket + metric.taxaUpsellTicket,
      roas: 0 // Será calculado depois
    }), {
      dailyBudget: 0,
      valorUsado: 0,
      compras: 0,
      faturamento: 0,
      comissao: 0,
      lucro: 0,
      upsellCount: 0,
      orderbumpCount: 0,
      cpm: 0,
      cpa: 0,
      ticketMedio: 0,
      ticketMedioBase: 0,
      taxaUpsellTicket: 0,
      roas: 0
    })
    
    // Calcular médias corretas
    const campaignCount = metrics.length
    
    // Calcular faturamento base real (somar faturamento das vendas principais de cada campanha)
    const faturamentoBase = metrics.reduce((acc, metric) => {
      // Para cada campanha, calcular o faturamento base: ticketMedioBase * compras
      return acc + (metric.ticketMedioBase * metric.compras)
    }, 0)
    
    const taxaUpsellConsolidada = faturamentoBase > 0 
      ? ((totals.faturamento - faturamentoBase) / faturamentoBase) * 100 
      : 0
    
    return {
      ...totals,
      cpm: campaignCount > 0 ? totals.cpm / campaignCount : 0,
      cpa: campaignCount > 0 ? totals.cpa / campaignCount : 0,
      ticketMedio: totals.compras > 0 ? totals.faturamento / totals.compras : 0,
      ticketMedioBase: totals.compras > 0 ? (faturamentoBase / totals.compras) : 0,
      taxaUpsellTicket: taxaUpsellConsolidada, // Taxa consolidada baseada nos totais
      roas: totals.valorUsado > 0 ? totals.comissao / totals.valorUsado : 0
    }
  }, [])

  const getPlataformaMetrics = useCallback((): PlataformaMetrics[] => {
    // Agrupar vendas por plataforma
    const plataformasMap = vendas.reduce(
      (acc, venda) => {
        const plataforma = venda.plataforma || 'Não informado'
        if (!acc[plataforma]) {
          acc[plataforma] = {
            vendas: 0,
            faturamentoTotal: 0,
            faturamentoBase: 0,
            faturamentoUpsell: 0,
            faturamentoOrderBump: 0,
            comissao: 0,
          }
        }

        const tipo = venda.tipo?.toLowerCase() || ''
        const isUpsell = tipo.includes('upsell')
        const isOrderBump = tipo.includes('orderbump') || tipo.includes('order-bump') || tipo.includes('bump')
        const isMainSale = !isUpsell && !isOrderBump

        const faturamentoBruto = parseMonetaryValue(venda.faturamento_bruto || null)

        if (isMainSale) {
          acc[plataforma].vendas += 1
          acc[plataforma].faturamentoBase += faturamentoBruto
        } else if (isUpsell) {
          acc[plataforma].faturamentoUpsell += faturamentoBruto
        } else if (isOrderBump) {
          acc[plataforma].faturamentoOrderBump += faturamentoBruto
        }

        acc[plataforma].faturamentoTotal += faturamentoBruto
        acc[plataforma].comissao += parseMonetaryValue(venda.comissao || null)

        return acc
      },
      {} as Record<
        string,
        {
          vendas: number
          faturamentoTotal: number
          faturamentoBase: number
          faturamentoUpsell: number
          faturamentoOrderBump: number
          comissao: number
        }
      >,
    )

    return Object.entries(plataformasMap)
      .map(([plataforma, data]) => {
        const ticketMedioFinal = data.vendas > 0 ? data.faturamentoTotal / data.vendas : 0

        const upsellImpactPercent =
          data.faturamentoBase > 0 ? (data.faturamentoUpsell / data.faturamentoBase) * 100 : 0
        const orderBumpImpactPercent =
          data.faturamentoBase > 0 ? (data.faturamentoOrderBump / data.faturamentoBase) * 100 : 0
        const totalImpactPercent =
          data.faturamentoBase > 0
            ? ((data.faturamentoUpsell + data.faturamentoOrderBump) / data.faturamentoBase) * 100
            : 0

        return {
          plataforma,
          vendas: data.vendas,
          faturamento: data.faturamentoTotal,
          comissao: data.comissao,
          ticketMedio: ticketMedioFinal,
          upsellImpactPercent,
          orderBumpImpactPercent,
          totalImpactPercent,
        }
      })
      .sort((a, b) => b.faturamento - a.faturamento)
  }, [vendas])

  const getPlataformaTotals = useCallback(() => {
    const platformMetrics = getPlataformaMetrics()
    const totals = platformMetrics.reduce(
      (acc, metric) => {
        const faturamentoTotal = metric.faturamento
        const totalImpactRatio = 1 + metric.totalImpactPercent / 100
        const faturamentoBase = totalImpactRatio > 0 ? faturamentoTotal / totalImpactRatio : faturamentoTotal
        
        const faturamentoUpsell = faturamentoBase * (metric.upsellImpactPercent / 100)
        
        const faturamentoOrderBump = faturamentoBase * (metric.orderBumpImpactPercent / 100)

        acc.faturamento += faturamentoTotal
        acc.comissao += metric.comissao
        acc.vendas += metric.vendas
        acc.faturamentoBase += faturamentoBase
        acc.faturamentoUpsell += faturamentoUpsell
        acc.faturamentoOrderBump += faturamentoOrderBump
        return acc
      },
      {
        faturamento: 0,
        comissao: 0,
        vendas: 0,
        faturamentoBase: 0,
        faturamentoUpsell: 0,
        faturamentoOrderBump: 0,
      },
    )

    const ticketMedioFinal = totals.vendas > 0 ? totals.faturamento / totals.vendas : 0
    
    return {
      faturamento: totals.faturamento,
      comissao: totals.comissao,
      vendas: totals.vendas,
      ticketMedio: ticketMedioFinal,
      upsellImpactPercent:
        totals.faturamentoBase > 0 ? (totals.faturamentoUpsell / totals.faturamentoBase) * 100 : 0,
      orderBumpImpactPercent:
        totals.faturamentoBase > 0 ? (totals.faturamentoOrderBump / totals.faturamentoBase) * 100 : 0,
      totalImpactPercent:
        totals.faturamentoBase > 0
          ? ((totals.faturamentoUpsell + totals.faturamentoOrderBump) / totals.faturamentoBase) * 100
          : 0,
    }
  }, [getPlataformaMetrics])

  const updatePeriod = useCallback((period: DatePeriod) => {
    setSelectedPeriod(period)
    // As funções fetch serão chamadas pelo useEffect quando selectedPeriod mudar
  }, [])

  const updateAccount = useCallback((account: string) => {
    setSelectedAccount(account)
    // As funções fetch serão chamadas pelo useEffect quando selectedAccount mudar
  }, [])

  useEffect(() => {
    console.log(`🔄 useEffect triggered: ${selectedAccount} ${selectedPeriod}`)
    fetchAllData(selectedAccount, selectedPeriod)
  }, [selectedAccount, selectedPeriod, fetchAllData])

  return {
    campaigns,
    allCampaigns,
    vendas,
    loading,
    error,
    selectedAccount,
    selectedPeriod,
    lastUpdate,
    cacheHit,
    setSelectedAccount: updateAccount,
    setSelectedPeriod: updatePeriod,
    fetchCampaigns,
    fetchCampaignsAll,
    fetchVendas,
    fetchAllData,
    processMetrics,
    processAllMetrics,
    getTotals,
    getPlataformaMetrics,
    getPlataformaTotals,
    refresh: forceRefresh,
    smartRefresh,
    forceRefresh
  }
} 