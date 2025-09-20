import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  // Verificar se o Supabase está configurado
  if (!supabase) {
    return NextResponse.json({
      success: false,
      error: 'Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY',
      data: []
    })
  }

  console.log('📦 [PRODUTOS] Buscando lista de produtos únicos...')

  try {
    // Buscar produtos únicos que não sejam nulos
    const { data, error } = await supabase
      .from('vendas')
      .select('produto')
      .not('produto', 'is', null)
      .not('produto', 'eq', '')

    if (error) {
      console.error('❌ [PRODUTOS] Erro na query:', error)
      throw error
    }

    // Extrair produtos únicos e ordenar
    const produtosUnicos = [...new Set(data?.map(item => item.produto) || [])]
      .filter(produto => produto && produto.trim() !== '')
      .sort()

    console.log(`✅ [PRODUTOS] Produtos únicos encontrados: ${produtosUnicos.length}`)

    return NextResponse.json({
      success: true,
      data: produtosUnicos
    })

  } catch (error) {
    console.error('❌ [PRODUTOS] Erro ao buscar produtos:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch produtos',
      data: []
    })
  }
}