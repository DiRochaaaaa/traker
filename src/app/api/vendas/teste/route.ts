import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  console.log('🧪 [TESTE] Iniciando teste de conexão Supabase...')
  
  try {
    // Verificar se o Supabase está configurado
    if (!supabase) {
      console.log('❌ [TESTE] Supabase não configurado')
      return NextResponse.json({
        success: false,
        error: 'Supabase not configured',
        details: {
          url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
      })
    }

    console.log('✅ [TESTE] Supabase configurado, testando conexão...')

    // Teste 1: Contar total de registros
    const { count, error: countError } = await supabase
      .from('vendas')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('❌ [TESTE] Erro ao contar registros:', countError)
      return NextResponse.json({
        success: false,
        error: 'Error counting records',
        details: countError
      })
    }

    console.log(`📊 [TESTE] Total de registros na tabela: ${count}`)

    if (count === 0) {
      return NextResponse.json({
        success: true,
        message: 'Conexão OK, mas tabela está vazia',
        totalRecords: count
      })
    }

    // Teste 2: Buscar alguns registros recentes
    const { data, error } = await supabase
      .from('vendas')
      .select('id, created_at, faturamento_bruto, campaign_id, tipo')
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('❌ [TESTE] Erro ao buscar registros:', error)
      return NextResponse.json({
        success: false,
        error: 'Error fetching records',
        details: error
      })
    }

    console.log('✅ [TESTE] Registros encontrados:', data?.length)
    if (data && data.length > 0) {
      console.log('📝 [TESTE] Primeira venda:', data[0])
    }

    return NextResponse.json({
      success: true,
      message: 'Conexão OK e dados encontrados',
      totalRecords: count,
      sampleData: data,
      recentDates: data?.map(v => v.created_at).slice(0, 3)
    })

  } catch (error) {
    console.error('💥 [TESTE] Erro inesperado:', error)
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 