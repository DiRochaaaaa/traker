import { NextRequest, NextResponse } from 'next/server'

const FB_TOKEN = process.env.FB_TOKEN
const FB_AD_ACCOUNT_1 = process.env.FB_AD_ACCOUNT_1
const FB_AD_ACCOUNT_2 = process.env.FB_AD_ACCOUNT_2



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
  console.log('🚀 Starting Facebook API request...')
  
  // Verificar se as credenciais do Facebook estão configuradas
  if (!FB_TOKEN || !FB_AD_ACCOUNT_1 || !FB_AD_ACCOUNT_2) {
    console.error('❌ Missing Facebook credentials')
    return NextResponse.json({
      success: false,
      error: 'Facebook credentials not configured. Please set FB_TOKEN, FB_AD_ACCOUNT_1, and FB_AD_ACCOUNT_2',
      data: []
    })
  }

  const { searchParams } = new URL(request.url)
  const account = searchParams.get('account') || 'all'
  const period = searchParams.get('period') || 'today'

  console.log(`📊 API called with period: ${period}, account: ${account}`)

  try {
    let accounts = []
    
    if (account === 'all') {
      accounts = [FB_AD_ACCOUNT_1, FB_AD_ACCOUNT_2]
    } else if (account === 'account1') {
      accounts = [FB_AD_ACCOUNT_1]
    } else if (account === 'account2') {
      accounts = [FB_AD_ACCOUNT_2]
    } else {
      accounts = [FB_AD_ACCOUNT_1, FB_AD_ACCOUNT_2]
    }

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

    // Filtrar apenas campanhas com gasto > 0
    const campaignsWithSpend = allResults.filter(campaign => {
      const insights = campaign.insights?.data?.[0]
      const spend = parseFloat(insights?.spend || '0')
      console.log(`💰 Campaign ${campaign.name} spend: ${spend}`)
      return spend > 0
    })

    console.log(`✅ Campaigns with spend > 0: ${campaignsWithSpend.length}`)

    return NextResponse.json({
      success: true,
      data: campaignsWithSpend,
      period: period,
      datePreset: datePreset,
      totalCampaigns: allResults.length,
      campaignsWithSpend: campaignsWithSpend.length,
      debug: {
        accountsProcessed: accounts.length,
        rawResults: allResults.length
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