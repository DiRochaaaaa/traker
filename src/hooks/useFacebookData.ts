import { useState, useEffect, useCallback } from 'react'
import { Venda } from '@/lib/supabase'

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
  faturamento: number
  comissao: number
  ticketMedio: number
  roas: number
  lucro: number
  upsellCount: number
  orderbumpCount: number
  campaign_id: string
  account_id: string
  budgetType: 'CBO' | 'ABO' | 'UNKNOWN'
  bidStrategy?: string
}

export interface PlataformaMetrics {
  plataforma: string
  vendas: number
  faturamento: number
  comissao: number
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

  const getCachedData = (key: string) => {
    const cached = cache.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setCacheHit(true)
      return cached.data
    }
    setCacheHit(false)
    return null
  }

  const setCachedData = (key: string, data: unknown) => {
    setCache(prev => new Map(prev.set(key, { data, timestamp: Date.now() })))
  }

  const fetchCampaigns = useCallback(async (account: string = 'all', period: DatePeriod = 'today') => {
    const cacheKey = getCacheKey('campaigns', account, period)
    const cachedData = getCachedData(cacheKey)
    
    if (cachedData) {
      setCampaigns(cachedData as FacebookCampaignData[])
      return
    }

    setLoading(prev => ({ ...prev, campaigns: true }))
    setError(null)
    
    try {
      const response = await fetch(`/api/facebook/campaigns?account=${account}&period=${period}`)
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch campaigns')
      }
      
      setCampaigns(result.data)
      setCachedData(cacheKey, result.data)
      setLastUpdate(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(prev => ({ ...prev, campaigns: false, isInitialLoad: false }))
    }
  }, [cache])

  const fetchVendas = useCallback(async (period: DatePeriod = 'today') => {
    const cacheKey = getCacheKey('vendas', undefined, period)
    const cachedData = getCachedData(cacheKey)
    
    if (cachedData) {
      setVendas(cachedData as Venda[])
      return
    }

    setLoading(prev => ({ ...prev, vendas: true }))
    
    try {
      console.log(`🔍 Buscando vendas para período: ${period}`)
      const response = await fetch(`/api/vendas?period=${period}`)
      const result = await response.json()
      
      if (result.success) {
        console.log(`📊 Vendas encontradas: ${result.data.length} vendas`)
        console.log(`📅 Período: ${period} | Range: ${JSON.stringify(result.dateRange)}`)
        
        // Log detalhado das vendas
        if (result.data.length > 0) {
          const vendasPorCampanha = result.data.reduce((acc: Record<string, Venda[]>, venda: Venda) => {
            const campaignId = venda.campaign_id || 'sem_campaign_id'
            if (!acc[campaignId]) acc[campaignId] = []
            acc[campaignId].push(venda)
            return acc
          }, {})
          
          console.log('📊 Vendas agrupadas por campaign_id:')
          Object.entries(vendasPorCampanha).forEach(([campaignId, vendas]) => {
            const faturamentoTotal = (vendas as Venda[]).reduce((total: number, v: Venda) => total + parseMonetaryValue(v.faturamento_bruto), 0)
            console.log(`  📈 Campaign ${campaignId}: ${(vendas as Venda[]).length} vendas, R$ ${faturamentoTotal.toFixed(2)}`)
          })
          
          const primeiraVenda = result.data[0]
          console.log('🔍 Primeira venda detalhada:', {
            produto: primeiraVenda?.produto,
            faturamento: primeiraVenda?.faturamento_bruto,
            campaign_id: primeiraVenda?.campaign_id,
            created_at: primeiraVenda?.created_at,
            tipo: primeiraVenda?.tipo
          })
          
          // Calcular faturamento total para debug
          const faturamentoTotalGeral = result.data.reduce((total: number, venda: Venda) => {
            return total + parseMonetaryValue(venda.faturamento_bruto)
          }, 0)
          console.log(`💰 FATURAMENTO TOTAL CALCULADO: R$ ${faturamentoTotalGeral.toFixed(2)}`)
        } else {
          console.warn(`⚠️ Nenhuma venda encontrada para o período ${period}`)
        }
        
        setVendas(result.data)
        setCachedData(cacheKey, result.data)
        setLastUpdate(new Date())
      } else {
        console.error('❌ Failed to fetch vendas:', result.error)
        setVendas([]) // Limpar vendas em caso de erro
      }
    } catch (err) {
      console.error('💥 Error fetching vendas:', err)
      setVendas([]) // Limpar vendas em caso de erro
    } finally {
      setLoading(prev => ({ ...prev, vendas: false }))
    }
  }, [cache])

  // Carregamento paralelo e progressivo
  const fetchData = useCallback(async (account: string = 'all', period: DatePeriod = 'today') => {
    setLoading(prev => ({ ...prev, metrics: true }))
    
    // Fetch em paralelo para velocidade máxima
    await Promise.all([
      fetchCampaigns(account, period),
      fetchVendas(period)
    ])
    
    setLoading(prev => ({ ...prev, metrics: false }))
  }, [fetchCampaigns, fetchVendas])

  // Smart refresh que mantém dados enquanto atualiza
  const smartRefresh = useCallback(async () => {
    // Não mostrar loading principal, apenas flags específicas
    await fetchData(selectedAccount, selectedPeriod)
  }, [fetchData, selectedAccount, selectedPeriod])

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

  // 🎯 Removidas funções do Facebook API - agora usamos apenas dados do Supabase

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

  const processMetrics = useCallback((): CampaignMetrics[] => {
    // Função auxiliar para criar métricas de campanha
    const createCampaignMetrics = (campaign: FacebookCampaignData, campaignVendas: Venda[], spend: number, cpm: number): CampaignMetrics => {
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
      
      // Calcular faturamento total (main + orderbump + upsell)
      const faturamentoTotal = campaignVendas.reduce((total, venda) => {
        const valor = parseMonetaryValue(venda.faturamento_bruto || null)
        return total + valor
      }, 0)
      
      // Calcular comissões totais
      const comissoesTotal = campaignVendas.reduce((total, venda) => {
        const comissao = parseMonetaryValue(venda.comissao || null)
        return total + comissao
      }, 0)
      
      // Contar apenas vendas MAIN para conversões e CPA
      const comprasMain = vendasMain.length
      const upsellCount = vendasUpsell.length
      const orderbumpCount = vendasOrderbump.length
      
      // Calcular ROAS (Return on Ad Spend) baseado no faturamento total
      const roas = spend > 0 ? faturamentoTotal / spend : (faturamentoTotal > 0 ? Infinity : 0)
      
      // Calcular Lucro (Comissão - Valor usado)
      const lucro = comissoesTotal - spend
      
      // 🎯 USAR APENAS DADOS DO SUPABASE (tempo real)
      const finalCompras = comprasMain // Vendas principais do Supabase
      const finalCpa = spend > 0 && finalCompras > 0 ? spend / finalCompras : 0
      
      // Ticket médio = faturamento total / vendas main
      const ticketMedio = finalCompras > 0 ? faturamentoTotal / finalCompras : 0
      
      const metrics = {
        name: campaign.name,
        status: campaign.effective_status || campaign.status,
        dailyBudget: parseFloat(campaign.daily_budget || '0') / 100, // Facebook retorna em centavos
        valorUsado: spend,
        cpm,
        compras: finalCompras, // 🎯 SUPABASE: Vendas principais em tempo real
        cpa: finalCpa, // 🎯 SUPABASE: CPA baseado em vendas reais
        faturamento: faturamentoTotal, // Soma de todos os tipos
        comissao: comissoesTotal, // Total de comissões
        ticketMedio, // Faturamento total / vendas main
        roas,
        lucro,
        upsellCount,
        orderbumpCount,
        campaign_id: campaign.id,
        account_id: campaign.account_id,
        budgetType: determineBudgetType(campaign),
        bidStrategy: campaign.bid_strategy
      }
      
      if (campaignVendas.length > 0) {
        console.log(`  📊 Métricas calculadas (SUPABASE): ${finalCompras} compras, ROAS ${roas === Infinity ? '∞' : roas.toFixed(2)}, Lucro R$ ${lucro.toFixed(2)}`)
      }
      
      return metrics
    }

    console.log('🔄 Processando métricas...')
    console.log(`📊 Campanhas do Facebook: ${campaigns.length}`)
    console.log(`💰 Vendas no Supabase: ${vendas.length}`)
    
    // Log dos campaign_ids disponíveis
    const campaignIds = campaigns.map(c => c.id)
    const vendasCampaignIds = [...new Set(vendas.map(v => v.campaign_id).filter((id): id is string => Boolean(id)))]
    
    console.log('🎯 Campaign IDs das campanhas Facebook:', campaignIds)
    console.log('🎯 Campaign IDs das vendas Supabase:', vendasCampaignIds)
    
    // Verificar correlação
    const matches = vendasCampaignIds.filter(id => campaignIds.includes(id))
    const vendaOrfas = vendasCampaignIds.filter(id => !campaignIds.includes(id))
    
    console.log('✅ Matches encontrados:', matches)
    if (vendaOrfas.length > 0) {
      console.log('⚠️ Vendas sem campanha correspondente:', vendaOrfas)
      console.log(`⚠️ ${vendaOrfas.length} campaign_ids de vendas não encontrados nas campanhas do Facebook`)
    }
    
    // Processar campanhas do Facebook
    const facebookCampaignMetrics = campaigns.map(campaign => {
      const insights = campaign.insights?.data?.[0]
      const spend = parseFloat(insights?.spend || '0')
      const cpm = parseFloat(insights?.cpm || '0')
      
      // Buscar vendas para esta campanha
      const campaignVendas = vendas.filter(venda => venda.campaign_id && venda.campaign_id === campaign.id)
      
      // Log detalhado para cada campanha
      if (campaignVendas.length > 0) {
        console.log(`📈 Campanha "${campaign.name}" (${campaign.id}):`)
        console.log(`  💰 Gasto Facebook: R$ ${spend.toFixed(2)}`)
        console.log(`  🛒 Vendas encontradas: ${campaignVendas.length}`)
        
        campaignVendas.forEach((venda, i) => {
          console.log(`    ${i+1}. ${venda.produto} - R$ ${venda.faturamento_bruto} (${venda.tipo || 'main'})`)
        })
      } else if (spend > 0) {
        console.log(`⚠️ Campanha "${campaign.name}" (${campaign.id}): Gasto R$ ${spend.toFixed(2)} mas sem vendas associadas`)
      }
      
      return createCampaignMetrics(campaign, campaignVendas, spend, cpm)
    })
    
    // Processar campanhas órfãs (que têm vendas mas não aparecem no Facebook)
    const orphanCampaignMetrics = vendaOrfas.map(campaignId => {
      const campaignVendas = vendas.filter(venda => venda.campaign_id === campaignId)
      
      console.log(`🔍 Campanha órfã "${campaignId}":`)
      console.log(`  💰 Gasto Facebook: R$ 0.00 (não encontrada na API)`)
      console.log(`  🛒 Vendas encontradas: ${campaignVendas.length}`)
      
      campaignVendas.forEach((venda, i) => {
        console.log(`    ${i+1}. ${venda.produto} - R$ ${venda.faturamento_bruto} (${venda.tipo || 'main'})`)
      })
      
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
      
      return createCampaignMetrics(orphanCampaign, campaignVendas, 0, 0)
    })
    
    const allMetrics = [...facebookCampaignMetrics, ...orphanCampaignMetrics]
    
    // Filtrar apenas campanhas com gasto > 0 OU que tenham vendas
    const filteredMetrics = allMetrics.filter(metric => {
      const hasSpend = metric.valorUsado > 0
      const hasSales = metric.compras > 0 || metric.faturamento > 0
      
      // Manter campanhas que têm gasto OU vendas
      return hasSpend || hasSales
    })
    
    console.log(`📊 Total de métricas processadas: ${allMetrics.length} (${facebookCampaignMetrics.length} Facebook + ${orphanCampaignMetrics.length} órfãs)`)
    console.log(`📊 Métricas após filtro: ${filteredMetrics.length} (removidas: ${allMetrics.length - filteredMetrics.length})`)
    
    return filteredMetrics
  }, [campaigns, vendas])

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
      roas: 0
    })
    
    // Calcular médias corretas
    const campaignCount = metrics.length
    return {
      ...totals,
      cpm: campaignCount > 0 ? totals.cpm / campaignCount : 0,
      cpa: campaignCount > 0 ? totals.cpa / campaignCount : 0,
      ticketMedio: totals.compras > 0 ? totals.faturamento / totals.compras : 0,
      roas: totals.valorUsado > 0 ? totals.faturamento / totals.valorUsado : 0
    }
  }, [])

  const getPlataformaMetrics = useCallback((): PlataformaMetrics[] => {
    // Agrupar vendas por plataforma
    const plataformasMap = vendas.reduce((acc, venda) => {
      const plataforma = venda.plataforma || 'Não informado'
      if (!acc[plataforma]) {
        acc[plataforma] = {
          plataforma,
          vendas: 0,
          faturamento: 0,
          comissao: 0
        }
      }
      
      // Contar apenas vendas main para o número de vendas
      const tipo = venda.tipo?.toLowerCase() || ''
      const isMainSale = tipo === 'main' || tipo === '' || (!tipo.includes('upsell') && !tipo.includes('orderbump') && !tipo.includes('bump'))
      
      if (isMainSale) {
        acc[plataforma].vendas += 1
      }
      
      // Somar todo o faturamento (main + upsell + orderbump)
      acc[plataforma].faturamento += parseMonetaryValue(venda.faturamento_bruto || null)
      acc[plataforma].comissao += parseMonetaryValue(venda.comissao || null)
      
      return acc
    }, {} as Record<string, PlataformaMetrics>)
    
    return Object.values(plataformasMap).sort((a, b) => b.faturamento - a.faturamento)
  }, [vendas])

  const updatePeriod = useCallback((period: DatePeriod) => {
    setSelectedPeriod(period)
    fetchCampaigns(selectedAccount, period)
    fetchVendas(period)
  }, [selectedAccount, fetchCampaigns, fetchVendas])

  const updateAccount = useCallback((account: string) => {
    setSelectedAccount(account)
    fetchCampaigns(account, selectedPeriod)
  }, [selectedPeriod, fetchCampaigns])

  useEffect(() => {
    fetchCampaigns(selectedAccount, selectedPeriod)
    fetchVendas(selectedPeriod)
  }, [selectedAccount, selectedPeriod, fetchCampaigns, fetchVendas])

  return {
    campaigns,
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
    fetchVendas,
    fetchData,
    processMetrics,
    getTotals,
    getPlataformaMetrics,
    refresh: () => {
      fetchData(selectedAccount, selectedPeriod)
    },
    smartRefresh
  }
} 