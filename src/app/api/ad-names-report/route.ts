import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  // Verificar se o Supabase está configurado
  if (!supabase) {
    return NextResponse.json({
      success: false,
      error: 'Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY',
      data: []
    })
  }

  // Extrair parâmetros de filtro de data da URL
  const { searchParams } = new URL(request.url)
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')

  console.log('📊 [AD NAMES REPORT] Iniciando busca de relatório de ad_names...')
  console.log('🔍 [AD NAMES REPORT] Filtros de data aplicados:', { dateFrom, dateTo })

  try {
    // Construir query com filtros - incluir campo tipo para filtrar vendas principais
    let query = supabase
      .from('vendas')
      .select('ad_name, comissao, created_at, tipo')
      .not('ad_name', 'is', null)
    
    // Aplicar filtros de data se fornecidos
    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }
    
    const { data, error } = await query.order('ad_name')

    if (error) {
      console.error('❌ [AD NAMES REPORT] Erro na query:', error)
      throw error
    }

    console.log(`✅ [AD NAMES REPORT] Vendas encontradas: ${data?.length || 0}`)

    // Filtrar apenas vendas principais (main) - excluir upsells e order bumps
    const vendasPrincipais = (data || []).filter(venda => {
      const tipo = venda.tipo?.toLowerCase() || ''
      return tipo === 'main' || tipo === '' || (!tipo.includes('upsell') && !tipo.includes('orderbump') && !tipo.includes('bump'))
    })

    console.log(`🎯 [AD NAMES REPORT] Vendas principais filtradas: ${vendasPrincipais.length} de ${data?.length || 0} total`)

    // Agrupar dados por ad_name (apenas vendas principais)
    const adNamesReport = vendasPrincipais.reduce((acc: Record<string, { ad_name: string, vendas: number, comissao_total: number }>, venda: { ad_name: string, comissao: string, created_at: string, tipo: string }) => {
      const adName = venda.ad_name
      const comissao = parseFloat(venda.comissao) || 0

      if (!acc[adName]) {
        acc[adName] = {
          ad_name: adName,
          vendas: 0,
          comissao_total: 0
        }
      }

      acc[adName].vendas += 1
      acc[adName].comissao_total += comissao

      return acc
    }, {})

    // Converter para array e aplicar filtros pós-agrupamento
    let reportArray = Object.values(adNamesReport)
    
    console.log(`📈 [AD NAMES REPORT] Total de ad_names encontrados: ${reportArray.length}`)
    
    // Ordenar por número de vendas (decrescente)
    reportArray = reportArray.sort((a, b) => b.vendas - a.vendas)

    console.log(`📈 [AD NAMES REPORT] Ad names únicos (após filtros): ${reportArray.length}`)
    console.log('🎯 [AD NAMES REPORT] Top 5 ad names por vendas:', 
      reportArray.slice(0, 5).map(item => `${item.ad_name}: ${item.vendas} vendas`))

    return NextResponse.json({
      success: true,
      data: reportArray,
      total_ad_names: reportArray.length,
      total_vendas: reportArray.reduce((sum, item) => sum + item.vendas, 0),
      total_comissao: reportArray.reduce((sum, item) => sum + item.comissao_total, 0)
    })

  } catch (error) {
    console.error('❌ [AD NAMES REPORT] Erro:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
      data: []
    }, { status: 500 })
  }
}