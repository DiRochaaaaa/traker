import { useState, useEffect, useCallback } from 'react'
import { Venda } from '@/lib/supabase'

export interface FacebookCampaignData {
  id: string
  name: string
  status: string
  effective_status?: string
  daily_budget?: string
  account_id: string
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
  roas: number
  lucro: number
  campaign_id: string
  account_id: string
}

export type DatePeriod = 'today' | 'yesterday' | 'last_7_days' | 'this_month'

export function useFacebookData() {
  const [campaigns, setCampaigns] = useState<FacebookCampaignData[]>([])
  const [vendas, setVendas] = useState<Venda[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<string>('all')
  const [selectedPeriod, setSelectedPeriod] = useState<DatePeriod>('today')

  const fetchCampaigns = useCallback(async (account: string = 'all', period: DatePeriod = 'today') => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/facebook/campaigns?account=${account}&period=${period}`)
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch campaigns')
      }
      
      setCampaigns(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchVendas = useCallback(async (period: DatePeriod = 'today') => {
    try {
      const response = await fetch(`/api/vendas?period=${period}`)
      const result = await response.json()
      
      if (result.success) {
        setVendas(result.data)
      }
    } catch (err) {
      console.error('Error fetching vendas:', err)
    }
  }, [])

  // Função para extrair valores das actions do Facebook
  const getActionValue = (actions: Array<{action_type: string, value: string}> | undefined, actionType: string): number => {
    if (!actions) return 0
    const action = actions.find(a => a.action_type === actionType)
    return action ? parseInt(action.value) || 0 : 0
  }

  // Função para extrair custo por ação
  const getCostPerAction = (costPerActions: Array<{action_type: string, value: string}> | undefined, actionType: string): number => {
    if (!costPerActions) return 0
    const costAction = costPerActions.find(a => a.action_type === actionType)
    return costAction ? parseFloat(costAction.value) || 0 : 0
  }

  const processMetrics = useCallback((): CampaignMetrics[] => {
    return campaigns.map(campaign => {
      const insights = campaign.insights?.data?.[0]
      const spend = parseFloat(insights?.spend || '0')
      const cpm = parseFloat(insights?.cpm || '0')
      
      // Extrair compras das actions
      // Tipos comuns de conversão: 'purchase', 'app_install', 'lead', 'complete_registration'
      const purchases = getActionValue(insights?.actions, 'purchase') || 
                       getActionValue(insights?.actions, 'app_install') ||
                       getActionValue(insights?.actions, 'lead') ||
                       getActionValue(insights?.actions, 'complete_registration')
      
      // Extrair CPA das cost_per_action_type
      const cpa = getCostPerAction(insights?.cost_per_action_type, 'purchase') ||
                  getCostPerAction(insights?.cost_per_action_type, 'app_install') ||
                  getCostPerAction(insights?.cost_per_action_type, 'lead') ||
                  getCostPerAction(insights?.cost_per_action_type, 'complete_registration')
      
      // Buscar vendas para esta campanha
      const campaignVendas = vendas.filter(venda => venda.campaign_id === campaign.id)
      
      // Calcular faturamento total das vendas
      const faturamento = campaignVendas.reduce((total, venda) => {
        const valor = parseFloat(venda.faturamento_bruto || '0')
        return total + valor
      }, 0)
      
      // Calcular comissões totais
      const comissoes = campaignVendas.reduce((total, venda) => {
        const comissao = parseFloat(venda.comissao || '0')
        return total + comissao
      }, 0)
      
      // Calcular ROAS (Return on Ad Spend)
      const roas = spend > 0 ? faturamento / spend : 0
      
      // Calcular Lucro (Faturamento - Gasto em Ads - Comissões)
      const lucro = faturamento - spend - comissoes
      
      // Calcular CPA alternativo se não estiver disponível
      const finalCpa = cpa || (spend / Math.max(purchases || campaignVendas.length, 1))
      
      return {
        name: campaign.name,
        status: campaign.effective_status || campaign.status,
        dailyBudget: parseFloat(campaign.daily_budget || '0') / 100, // Facebook retorna em centavos
        valorUsado: spend,
        cpm,
        compras: purchases || campaignVendas.length, // Usar dados do FB ou contar vendas
        cpa: finalCpa,
        faturamento,
        roas,
        lucro,
        campaign_id: campaign.id,
        account_id: campaign.account_id
      }
    })
  }, [campaigns, vendas])

  const getTotals = useCallback((metrics: CampaignMetrics[]) => {
    return metrics.reduce((totals, metric) => ({
      dailyBudget: totals.dailyBudget + metric.dailyBudget,
      valorUsado: totals.valorUsado + metric.valorUsado,
      compras: totals.compras + metric.compras,
      faturamento: totals.faturamento + metric.faturamento,
      lucro: totals.lucro + metric.lucro,
      cpm: metrics.length > 0 ? totals.cpm + metric.cpm : 0,
      cpa: metrics.length > 0 ? totals.cpa + metric.cpa : 0,
      roas: 0 // Será calculado depois
    }), {
      dailyBudget: 0,
      valorUsado: 0,
      compras: 0,
      faturamento: 0,
      lucro: 0,
      cpm: 0,
      cpa: 0,
      roas: 0
    })
  }, [])

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
    setSelectedAccount: updateAccount,
    setSelectedPeriod: updatePeriod,
    fetchCampaigns,
    fetchVendas,
    processMetrics,
    getTotals,
    refresh: () => {
      fetchCampaigns(selectedAccount, selectedPeriod)
      fetchVendas(selectedPeriod)
    }
  }
} 