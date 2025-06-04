import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function getDateRange(period: string) {
  // Usar fuso horário de Brasília (-3)
  const timezone = 'America/Sao_Paulo'
  const now = new Date()
  
  // Criar data atual no fuso de Brasília
  const brasiliaTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }))
  
  // Pegar apenas a data (YYYY-MM-DD) descartando horas
  const today = brasiliaTime.toISOString().split('T')[0]
  
  const yesterday = new Date(brasiliaTime)
  yesterday.setDate(brasiliaTime.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  
  console.log('🇧🇷 [DATE RANGE] Hoje Brasília:', today)
  console.log('🇧🇷 [DATE RANGE] Ontem Brasília:', yesterdayStr)
  
  switch (period) {
    case 'today':
      return { start: today, end: today }
    case 'yesterday':
      return { start: yesterdayStr, end: yesterdayStr }
    case 'last_7_days':
      const weekAgo = new Date(brasiliaTime)
      weekAgo.setDate(brasiliaTime.getDate() - 7)
      const weekAgoStr = weekAgo.toISOString().split('T')[0]
      return { start: weekAgoStr, end: today }
    case 'this_month':
      const firstDay = new Date(brasiliaTime.getFullYear(), brasiliaTime.getMonth(), 1)
      const firstDayStr = firstDay.toISOString().split('T')[0]
      return { start: firstDayStr, end: today }
    default:
      return { start: today, end: today }
  }
}

export async function GET(request: NextRequest) {
  // Verificar se o Supabase está configurado
  if (!supabase) {
    return NextResponse.json({
      success: false,
      error: 'Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY',
      data: []
    })
  }

  const { searchParams } = new URL(request.url)
  const campaignId = searchParams.get('campaign_id')
  const period = searchParams.get('period')
  const startDate = searchParams.get('start_date')
  const endDate = searchParams.get('end_date')

  console.log('🔍 [VENDAS API] Iniciando busca de vendas...')
  console.log('📊 [VENDAS API] Parâmetros:', { campaignId, period, startDate, endDate })

  try {
    let query = supabase
      .from('vendas')
      .select('*')

    // Filtrar por campaign_id se fornecido
    if (campaignId) {
      query = query.eq('campaign_id', campaignId)
      console.log('🎯 [VENDAS API] Filtrando por campaign_id:', campaignId)
    }

    // Se um período foi especificado, usar as datas do período
    if (period) {
      const dateRange = getDateRange(period)
      console.log('📅 [VENDAS API] Range de datas para período', period, ':', dateRange)
      
      // Usar função do PostgreSQL para converter timezone
      // Filtrar por data convertida para horário de Brasília
      if (dateRange.start === dateRange.end) {
        // Mesmo dia - usar DATE() para comparar apenas a data
        const targetDate = dateRange.start
        console.log('📅 [VENDAS API] Filtrando para data específica:', targetDate)
        
        // Usar a função timezone do PostgreSQL para converter para horário de Brasília
        query = query.gte('created_at', `${targetDate}T00:00:00-03:00`)
                     .lt('created_at', `${targetDate}T23:59:59.999-03:00`)
      } else {
        // Range de datas
        query = query.gte('created_at', `${dateRange.start}T00:00:00-03:00`)
                     .lte('created_at', `${dateRange.end}T23:59:59.999-03:00`)
      }
      
      console.log('🕐 [VENDAS API] Usando timezone -03:00 diretamente na query')
    } else if (startDate && endDate) {
      // Usar datas específicas se fornecidas (também ajustar para Brasília)
      console.log('📅 [VENDAS API] Usando datas específicas:', { startDate, endDate })
      const startDateTime = `${startDate}T03:00:00.000Z` // 00:00 Brasília = 03:00 UTC
      const nextDay = new Date(endDate)
      nextDay.setDate(nextDay.getDate() + 1)
      const nextDayStr = nextDay.getFullYear() + '-' + 
                        String(nextDay.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(nextDay.getDate()).padStart(2, '0')
      const endDateTime = `${nextDayStr}T02:59:59.999Z` // 23:59 Brasília do endDate
      
      query = query
        .gte('created_at', startDateTime)
        .lte('created_at', endDateTime)
    } else if (startDate) {
      console.log('📅 [VENDAS API] Usando data de início:', startDate)
      query = query.gte('created_at', `${startDate}T03:00:00.000Z`) // 00:00 Brasília
    } else if (endDate) {
      console.log('📅 [VENDAS API] Usando data de fim:', endDate)
      const nextDay = new Date(endDate)
      nextDay.setDate(nextDay.getDate() + 1)
      const nextDayStr = nextDay.getFullYear() + '-' + 
                        String(nextDay.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(nextDay.getDate()).padStart(2, '0')
      query = query.lte('created_at', `${nextDayStr}T02:59:59.999Z`) // 23:59 Brasília
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('❌ [VENDAS API] Erro na query:', error)
      throw error
    }

    console.log(`✅ [VENDAS API] Vendas encontradas: ${data?.length || 0}`)
    
    if (data && data.length > 0) {
      console.log('📊 [VENDAS API] Detalhes das vendas:')
      
      // Agrupar por data para mostrar distribuição
      const vendasPorData = data.reduce((acc: Record<string, number>, venda: any) => {
        const data = new Date(venda.created_at).toISOString().split('T')[0]
        acc[data] = (acc[data] || 0) + 1
        return acc
      }, {})
      
      console.log('📅 [VENDAS API] Vendas por data:', vendasPorData)
      
      // Agrupar por campaign_id
      const vendasPorCampanha = data.reduce((acc: Record<string, { count: number, faturamento: number }>, venda: any) => {
        const campaignId = venda.campaign_id || 'sem_campaign_id'
        if (!acc[campaignId]) acc[campaignId] = { count: 0, faturamento: 0 }
        acc[campaignId].count += 1
        
        // Parse do faturamento
        const faturamento = parseFloat(venda.faturamento_bruto || '0')
        acc[campaignId].faturamento += faturamento
        
        return acc
      }, {})
      
      console.log('💰 [VENDAS API] Vendas por campaign_id:', vendasPorCampanha)
      
      // Mostrar tipos de vendas
      const vendasPorTipo = data.reduce((acc: Record<string, number>, venda: any) => {
        const tipo = venda.tipo || 'main'
        acc[tipo] = (acc[tipo] || 0) + 1
        return acc
      }, {})
      
      console.log('🏷️ [VENDAS API] Vendas por tipo:', vendasPorTipo)
      
      // Calcular faturamento total
      const faturamentoTotal = data.reduce((total: number, venda: any) => {
        const valor = parseFloat(venda.faturamento_bruto || '0')
        return total + valor
      }, 0)
      
      console.log(`💵 [VENDAS API] Faturamento total: R$ ${faturamentoTotal.toFixed(2)}`)
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      period: period,
      dateRange: period ? getDateRange(period) : null,
      debug: {
        totalVendas: data?.length || 0,
        parametros: { campaignId, period, startDate, endDate }
      }
    })

  } catch (error) {
    console.error('💥 [VENDAS API] Error fetching vendas:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch vendas',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Verificar se o Supabase está configurado
  if (!supabase) {
    return NextResponse.json({
      success: false,
      error: 'Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    }, { status: 500 })
  }

  try {
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('vendas')
      .insert([body])
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: data[0]
    })

  } catch (error) {
    console.error('Error creating venda:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create venda',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 