import { NextRequest, NextResponse } from 'next/server'

// Função para obter todas as contas dinamicamente
function getAllFacebookAccounts(): string[] {
  const accounts: string[] = []
  
  // Buscar todas as variáveis FB_AD_ACCOUNT_*
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('FB_AD_ACCOUNT_') && process.env[key]) {
      accounts.push(process.env[key]!)
    }
  })
  
  return accounts
}

function getDatePreset(period: string) {
  switch (period) {
    case 'today':
      return 'today'
    case 'yesterday':
      return 'yesterday'
    case 'last_7_days':
      return 'last_7_days'
    case 'this_month':
      return 'this_month'
    default:
      return 'today'
  }
}

export async function GET(request: NextRequest) {
  const FB_TOKEN = process.env.FB_TOKEN
  const allAccounts = getAllFacebookAccounts()

  if (!FB_TOKEN) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Facebook credentials not configured. Please set FB_TOKEN'
      },
      { status: 500 }
    )
  }

  if (allAccounts.length === 0) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'No Facebook ad accounts configured. Please set FB_AD_ACCOUNT_1, FB_AD_ACCOUNT_2, etc.'
      },
      { status: 500 }
    )
  }

  const { searchParams } = new URL(request.url)
  const account = searchParams.get('account') || 'all'
  const period = searchParams.get('period') || 'today'

  console.log(`📊 API called with period: ${period}, account: ${account}`)
  console.log(`🏢 Available accounts: ${allAccounts.length} found`)

  try {
    let accounts = []
    
    if (account === 'all') {
      accounts = allAccounts
    } else if (account.startsWith('account') && account.length > 7) {
      // account1, account2, account3, etc.
      const accountNumber = parseInt(account.replace('account', ''))
      if (accountNumber > 0 && accountNumber <= allAccounts.length) {
        accounts = [allAccounts[accountNumber - 1]]
      } else {
        accounts = allAccounts
      }
    } else {
      // Se for um ID específico
      if (allAccounts.includes(account)) {
        accounts = [account]
      } else {
        accounts = allAccounts
      }
    }

    console.log(`🎯 Processing ${accounts.length} account(s)`)

    const datePreset = getDatePreset(period)
    console.log(`📅 Date preset: ${datePreset}`)

    const allResults = []

    for (const accountId of accounts) {
      console.log(`\n🔍 Processing account: ${accountId}`)
      
      try {
        // Método 1: Tentar buscar insights direto da conta de anúncios
        const insightsUrl = `https://graph.facebook.com/v23.0/${accountId}/insights`
        const insightsParams = new URLSearchParams({
          access_token: FB_TOKEN!,
          level: 'campaign',
          fields: 'campaign_id,campaign_name,spend,cpm,actions,cost_per_action_type,impressions,clicks',
          date_preset: datePreset,
          limit: '100'
        })

        console.log(`🌐 Insights URL: ${insightsUrl}?${insightsParams.toString()}`)

        const insightsResponse = await fetch(`${insightsUrl}?${insightsParams}`)
        const insightsData = await insightsResponse.json()

        console.log(`📈 Insights Response Status: ${insightsResponse.status}`)
        console.log(`📈 Insights Response:`, JSON.stringify(insightsData, null, 2))

        if (!insightsResponse.ok) {
          console.error(`❌ Facebook API error for insights ${accountId}:`, insightsData)
          
          // Se falhar, tentar método alternativo: buscar campanhas primeiro
          console.log(`🔄 Trying alternative method for account ${accountId}`)
          
          const campaignsUrl = `https://graph.facebook.com/v23.0/${accountId}/campaigns`
          const campaignsParams = new URLSearchParams({
            access_token: FB_TOKEN!,
            fields: 'id,name,status,daily_budget,effective_status',
            limit: '100'
          })

          console.log(`🌐 Campaigns URL: ${campaignsUrl}?${campaignsParams.toString()}`)

          const campaignsResponse = await fetch(`${campaignsUrl}?${campaignsParams}`)
          const campaignsData = await campaignsResponse.json()

          console.log(`📋 Campaigns Response Status: ${campaignsResponse.status}`)
          console.log(`📋 Campaigns Response:`, JSON.stringify(campaignsData, null, 2))

          if (!campaignsResponse.ok) {
            console.error(`❌ Facebook API error for campaigns ${accountId}:`, campaignsData)
            continue // Pular para próxima conta
          }

          // Buscar insights para cada campanha individual
          const campaignsWithInsights = []
          
          for (const campaign of (campaignsData.data || [])) {
            try {
              const campaignInsightsUrl = `https://graph.facebook.com/v23.0/${campaign.id}/insights`
              const campaignInsightsParams = new URLSearchParams({
                access_token: FB_TOKEN!,
                fields: 'spend,cpm,actions,cost_per_action_type,impressions,clicks',
                date_preset: datePreset
              })

              const campaignInsightsResponse = await fetch(`${campaignInsightsUrl}?${campaignInsightsParams}`)
              const campaignInsightsData = await campaignInsightsResponse.json()

              console.log(`📊 Campaign ${campaign.name} insights:`, campaignInsightsData)

              campaignsWithInsights.push({
                id: campaign.id,
                name: campaign.name,
                status: campaign.status,
                effective_status: campaign.effective_status,
                daily_budget: campaign.daily_budget,
                bid_strategy: campaign.bid_strategy || null,
                budget_optimization: campaign.budget_optimization || null,
                account_id: accountId,
                insights: campaignInsightsData
              })
            } catch (error) {
              console.error(`❌ Error fetching insights for campaign ${campaign.id}:`, error)
            }
          }

          allResults.push(...campaignsWithInsights)
          
        } else {
          // Método 1 funcionou - processar insights diretos
          const campaignIds = (insightsData.data || []).map((insight: { campaign_id: string }) => insight.campaign_id).filter(Boolean)
          
          if (campaignIds.length === 0) {
            console.log(`⚠️ No campaigns with data found for account ${accountId}`)
            continue
          }

          // Buscar detalhes das campanhas
          for (const campaignId of campaignIds) {
            try {
              const campaignUrl = `https://graph.facebook.com/v23.0/${campaignId}`
              const campaignParams = new URLSearchParams({
                access_token: FB_TOKEN!,
                fields: 'id,name,status,daily_budget,effective_status'
              })

              const campaignResponse = await fetch(`${campaignUrl}?${campaignParams}`)
              const campaignData = await campaignResponse.json()

              if (campaignResponse.ok) {
                const campaignInsights = insightsData.data.filter((insight: { campaign_id: string }) => insight.campaign_id === campaignId)

                allResults.push({
                  id: campaignData.id,
                  name: campaignData.name,
                  status: campaignData.status,
                  effective_status: campaignData.effective_status,
                  daily_budget: campaignData.daily_budget,
                  bid_strategy: campaignData.bid_strategy || null,
                  budget_optimization: campaignData.budget_optimization || null,
                  account_id: accountId,
                  insights: {
                    data: campaignInsights
                  }
                })
              }
            } catch (error) {
              console.error(`❌ Error fetching campaign details for ${campaignId}:`, error)
            }
          }
        }

      } catch (error) {
        console.error(`❌ Error processing account ${accountId}:`, error)
        continue
      }
    }

    console.log(`\n📊 Total campaigns before filtering: ${allResults.length}`)

    // Log de todas as campanhas para debug
    console.log(`\n📊 Total campaigns found: ${allResults.length}`)
    
    // Analisar insights de cada campanha
    allResults.forEach(campaign => {
      const insights = campaign.insights?.data?.[0]
      const spend = parseFloat(insights?.spend || '0')
      console.log(`💰 Campaign "${campaign.name}" (${campaign.id}):`)
      console.log(`  - Spend: R$ ${spend}`)
      console.log(`  - Status: ${campaign.status}`)
      console.log(`  - Insights:`, insights ? 'Found' : 'Not found')
    })

    // Retornar TODAS as campanhas (não filtrar por spend)
    // O filtro por spend será feito no frontend
    return NextResponse.json({
      success: true,
      data: allResults, // Removido o filtro
      period: period,
      datePreset: datePreset,
      totalCampaigns: allResults.length,
      accountsProcessed: accounts.length,
      availableAccounts: allAccounts.length,
      debug: {
        accountsProcessed: accounts.length,
        rawResults: allResults.length,
        allAccounts: allAccounts
      }
    })

  } catch (error) {
    console.error('💥 Error fetching Facebook campaigns:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch campaigns',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 