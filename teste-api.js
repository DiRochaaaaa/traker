// Teste simples da API de vendas
const testAPI = async () => {
  try {
    console.log('🔍 Testando API de vendas...')
    
    // Teste para hoje
    const responseToday = await fetch('http://localhost:3000/api/vendas?period=today')
    const dataToday = await responseToday.json()
    console.log('📊 Vendas HOJE:', dataToday)
    
    // Teste para ontem
    const responseYesterday = await fetch('http://localhost:3000/api/vendas?period=yesterday')
    const dataYesterday = await responseYesterday.json()
    console.log('📊 Vendas ONTEM:', dataYesterday)
    
    // Teste para últimos 7 dias
    const response7Days = await fetch('http://localhost:3000/api/vendas?period=last_7_days')
    const data7Days = await response7Days.json()
    console.log('📊 Vendas ÚLTIMOS 7 DIAS:', data7Days)
    
    // Teste sem filtro de período
    const responseAll = await fetch('http://localhost:3000/api/vendas')
    const dataAll = await responseAll.json()
    console.log('📊 Vendas SEM FILTRO:', dataAll)
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

testAPI() 