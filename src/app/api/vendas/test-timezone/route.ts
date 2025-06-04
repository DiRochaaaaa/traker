import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Simular a função getDateRange com debug
    const timezone = 'America/Sao_Paulo'
    const today = new Date()
    
    console.log('🌍 [DEBUG TZ] Data UTC do servidor:', today.toISOString())
    
    // Converter para horário de Brasília
    const todayBrasilia = new Date(today.toLocaleString('en-US', { timeZone: timezone }))
    console.log('🇧🇷 [DEBUG TZ] Data Brasília:', todayBrasilia.toISOString())
    
    // Formatar data no formato YYYY-MM-DD
    const formatDate = (date: Date): string => {
      return date.getFullYear() + '-' + 
             String(date.getMonth() + 1).padStart(2, '0') + '-' + 
             String(date.getDate()).padStart(2, '0')
    }
    
    const todayStr = formatDate(todayBrasilia)
    console.log('📅 [DEBUG TZ] Data formatada:', todayStr)
    
    // Calcular range UTC para hoje em Brasília
    const startDateTime = `${todayStr}T03:00:00.000Z` // 00:00 Brasília = 03:00 UTC
    const nextDay = new Date(todayStr)
    nextDay.setDate(nextDay.getDate() + 1)
    const nextDayStr = nextDay.getFullYear() + '-' + 
                      String(nextDay.getMonth() + 1).padStart(2, '0') + '-' + 
                      String(nextDay.getDate()).padStart(2, '0')
    const endDateTime = `${nextDayStr}T02:59:59.999Z` // 23:59 Brasília
    
    console.log('🕐 [DEBUG TZ] Range UTC:', { start: startDateTime, end: endDateTime })
    
    // Comparar com as datas das vendas que sabemos que existem
    const vendasExistentes = [
      '2025-06-04T10:16:37.624459-03:00',
      '2025-06-04T07:29:17.484047-03:00',
      '2025-06-03T23:49:14.179104-03:00',
      '2025-06-03T23:38:02.479723-03:00'
    ]
    
    const analiseVendas = vendasExistentes.map(vendaDate => {
      const vendaUTC = new Date(vendaDate).toISOString()
      const vendaLocal = new Date(vendaDate).toLocaleString('pt-BR', { timeZone: timezone })
      const dentroRange = vendaUTC >= startDateTime && vendaUTC <= endDateTime
      
      return {
        original: vendaDate,
        utc: vendaUTC,
        local: vendaLocal,
        dentroDoRangeHoje: dentroRange
      }
    })
    
    return NextResponse.json({
      debug: {
        agora: {
          utc: today.toISOString(),
          brasilia: todayBrasilia.toISOString(),
          brasiliaFormatted: todayStr
        },
        rangeParaHoje: {
          start: startDateTime,
          end: endDateTime
        },
        analiseVendas,
        resumo: {
          vendasQueDeveriamAparecerHoje: analiseVendas.filter(v => v.dentroDoRangeHoje).length,
          totalVendasAnalisadas: analiseVendas.length
        }
      }
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
} 