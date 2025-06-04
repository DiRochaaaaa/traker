import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' })
    }

    // Buscar todas as vendas para ver as datas reais
    const { data: allVendas, error } = await supabase
      .from('vendas')
      .select('id, created_at, faturamento_bruto, campaign_id')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json({ error: error.message })
    }

    // Analisar datas
    const hoje = new Date()
    const ontem = new Date(hoje)
    ontem.setDate(hoje.getDate() - 1)

    console.log('📅 Data do servidor:', hoje.toISOString())
    console.log('📅 Data de ontem calculada:', ontem.toISOString())
    
    // Converter datas para formato local
    const vendas = allVendas?.map(venda => ({
      ...venda,
      created_at_local: new Date(venda.created_at).toLocaleString('pt-BR'),
      created_at_date: new Date(venda.created_at).toISOString().split('T')[0],
      faturamento_parsed: parseFloat(venda.faturamento_bruto || '0')
    })) || []

    // Agrupar por data
    const vendasPorData = vendas.reduce((acc: Record<string, any[]>, venda) => {
      const data = venda.created_at_date
      if (!acc[data]) acc[data] = []
      acc[data].push(venda)
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      debug: {
        dataServidor: hoje.toISOString(),
        dataOntem: ontem.toISOString(),
        totalVendas: vendas.length,
        vendasPorData,
        primeiraVenda: vendas[0],
        datasUnicas: [...new Set(vendas.map(v => v.created_at_date))].sort().reverse()
      }
    })

  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' })
  }
} 