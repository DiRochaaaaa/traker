import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔍 Testando acesso direto à tabela vendas...')
    
    if (!supabase) {
      return NextResponse.json({ 
        error: 'Supabase not configured',
        env: {
          url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
      })
    }

    // Teste 1: Verificar se a tabela existe e temos permissão
    console.log('📋 Teste 1: Verificando tabela...')
    const { data: tableTest, error: tableError } = await supabase
      .from('vendas')
      .select('count')
      .limit(1)
      .maybeSingle()

    console.log('📋 Resultado teste tabela:', { data: tableTest, error: tableError })

    // Teste 2: Tentar buscar qualquer registro
    console.log('📋 Teste 2: Buscando registros...')
    const { data: anyRecord, error: anyError } = await supabase
      .from('vendas')
      .select('*')
      .limit(1)

    console.log('📋 Resultado busca registros:', { count: anyRecord?.length, error: anyError })

    // Teste 3: Verificar esquema da tabela
    console.log('📋 Teste 3: Verificando esquema...')
    const { data: schemaTest, error: schemaError } = await supabase.rpc('version')
    
    console.log('📋 Resultado teste esquema:', { data: schemaTest, error: schemaError })

    return NextResponse.json({
      success: true,
      tests: {
        table: { data: tableTest, error: tableError },
        records: { count: anyRecord?.length || 0, data: anyRecord, error: anyError },
        schema: { data: schemaTest, error: schemaError }
      },
      environment: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30),
      }
    })

  } catch (error) {
    console.error('💥 Erro no teste raw:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
  }
} 