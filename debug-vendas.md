# Debug: Vendas de Ontem Não Calculadas

## 🔍 Problema Identificado

As vendas de ontem não estão sendo calculadas porque:

1. **Campanhas órfãs**: Existem vendas no Supabase com `campaign_id` que não aparecem na busca do Facebook API
2. **Filtro de período**: O Facebook API pode não retornar campanhas que não tiveram gasto no período, mesmo tendo vendas
3. **Correlação incompleta**: O sistema só calcula métricas para campanhas que retornam do Facebook

## 📊 Dados do Supabase (Vendas)

Baseado na imagem fornecida, temos vendas com:
- `campaign_id`: 120226404695680504, 120226404695710556, etc.
- `faturamento_bruto`: 247.99, 17.99, 147.99, etc.
- `created_at`: Datas das vendas

## 🔧 Solução Implementada

1. **Logs detalhados**: Adicionei logs para rastrear:
   - Quantas vendas são encontradas por período
   - Quais campaign_ids existem nas vendas vs campanhas
   - Correlação entre vendas e campanhas

2. **Campanhas órfãs**: Criado sistema para incluir campanhas que:
   - Têm vendas no Supabase
   - Não aparecem na busca do Facebook
   - São tratadas como campanhas com gasto R$ 0,00

3. **ROAS infinito**: Para campanhas órfãs com faturamento mas sem gasto

## 🧪 Como Testar

1. Abrir o console do navegador
2. Selecionar período "Yesterday"
3. Verificar logs:
   - `🔍 Buscando vendas para período: yesterday`
   - `📊 Vendas encontradas: X vendas`
   - `🎯 Campaign IDs das vendas Supabase: [...]`
   - `⚠️ Vendas sem campanha correspondente: [...]`

## 📈 Métricas Esperadas

Com a solução, devemos ver:
- Campanhas do Facebook (com gasto > 0)
- Campanhas órfãs (com vendas mas sem gasto)
- ROAS calculado corretamente para ambos os casos
- Lucro = Faturamento - Gasto - Comissões

## 🚀 Próximos Passos

Se ainda houver problemas:
1. Verificar se as datas estão corretas no Supabase
2. Confirmar formato dos campaign_ids
3. Testar com dados de hoje vs ontem 