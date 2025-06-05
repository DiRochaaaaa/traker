// Teste final da correção de timezone
const testarVendasHoje = async () => {
  try {
    console.log('🔍 Testando vendas para HOJE...')
    
    const response = await fetch('http://localhost:3000/api/vendas?period=today')
    const data = await response.json()
    
    console.log('📊 Total de vendas hoje:', data.debug.totalVendas)
    console.log('💰 Período:', data.period)
    console.log('📅 Range:', data.dateRange)
    
    if (data.data.length > 0) {
      console.log('\n📋 Vendas encontradas:')
      data.data.forEach((venda, i) => {
        console.log(`${i+1}. ${venda.produto} - R$ ${venda.faturamento_bruto} (${venda.tipo || 'main'})`)
        console.log(`   Data: ${new Date(venda.created_at).toLocaleString('pt-BR')}`)
      })
      
      // Calcular totais
      const vendasMain = data.data.filter(v => {
        const tipo = v.tipo?.toLowerCase() || ''
        return tipo === 'main' || tipo === '' || (!tipo.includes('upsell') && !tipo.includes('orderbump'))
      })
      
      const faturamentoTotal = data.data.reduce((total, venda) => {
        return total + parseFloat(venda.faturamento_bruto || '0')
      }, 0)
      
      console.log('\n📊 RESUMO:')
      console.log('🛒 Vendas Principais:', vendasMain.length)
      console.log('💰 Faturamento Total: R$', faturamentoTotal.toFixed(2))
    } else {
      console.log('⚠️ Nenhuma venda encontrada para hoje')
    }
    
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

testarVendasHoje() 