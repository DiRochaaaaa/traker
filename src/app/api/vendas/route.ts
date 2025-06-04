import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function getDateRange(period: string) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  
  switch (period) {
    case 'today':
      return {
        start: today.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      }
    case 'yesterday':
      return {
        start: yesterday.toISOString().split('T')[0],
        end: yesterday.toISOString().split('T')[0]
      }
    case 'last_7_days':
      const last7Days = new Date(today)
      last7Days.setDate(today.getDate() - 7)
      return {
        start: last7Days.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      }
    case 'this_month':
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      return {
        start: firstDayOfMonth.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      }
    default:
      return {
        start: today.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      }
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

  try {
    let query = supabase
      .from('vendas')
      .select('*')

    // Filtrar por campaign_id se fornecido
    if (campaignId) {
      query = query.eq('campaign_id', campaignId)
    }

    // Se um período foi especificado, usar as datas do período
    if (period) {
      const dateRange = getDateRange(period)
      query = query
        .gte('created_at', `${dateRange.start}T00:00:00`)
        .lte('created_at', `${dateRange.end}T23:59:59`)
    } else if (startDate && endDate) {
      // Usar datas específicas se fornecidas
      query = query
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`)
    } else if (startDate) {
      query = query.gte('created_at', `${startDate}T00:00:00`)
    } else if (endDate) {
      query = query.lte('created_at', `${endDate}T23:59:59`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      period: period,
      dateRange: period ? getDateRange(period) : null
    })

  } catch (error) {
    console.error('Error fetching vendas:', error)
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