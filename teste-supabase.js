// Teste direto da conexão Supabase
const testSupabase = async () => {
  try {
    console.log('🔍 Testando conexão Supabase...')
    
    // Testar busca direta na API sem parâmetros
    const response = await fetch('http://localhost:3000/api/vendas')
    const data = await response.json()
    
    console.log('📊 Resposta completa da API:', JSON.stringify(data, null, 2))
    
    // Se a API está retornando array vazio, vamos testar a query diretamente
    if (data.success && data.data.length === 0) {
      console.log('⚠️ Nenhuma venda encontrada - possíveis causas:')
      console.log('1. Tabela vendas está vazia')
      console.log('2. Problema de credenciais Supabase')
      console.log('3. Problema de timezone nas datas')
      console.log('4. Nome da tabela incorreto')
    }
    
  } catch (error) {
    console.error('❌ Erro no teste Supabase:', error)
  }
}

testSupabase() 