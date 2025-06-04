import { NextRequest, NextResponse } from 'next/server'

const FB_TOKEN = process.env.FB_TOKEN
const FB_AD_ACCOUNT_1 = process.env.FB_AD_ACCOUNT_1
const FB_AD_ACCOUNT_2 = process.env.FB_AD_ACCOUNT_2

export async function GET(request: NextRequest) {
  console.log('🧪 Testing Facebook API connectivity...')
  
  if (!FB_TOKEN) {
    return NextResponse.json({
      success: false,
      error: 'FB_TOKEN not configured'
    })
  }

  try {
    // Teste 1: Verificar se o token é válido
    console.log('🔍 Testing token validity...')
    const tokenUrl = `https://graph.facebook.com/v23.0/me`
    const tokenParams = new URLSearchParams({
      access_token: FB_TOKEN,
      fields: 'id,name'
    })

    const tokenResponse = await fetch(`${tokenUrl}?${tokenParams}`)
    const tokenData = await tokenResponse.json()

    console.log('Token test response:', tokenData)

    if (!tokenResponse.ok) {
      return NextResponse.json({
        success: false,
        error: 'Token validation failed',
        details: tokenData
      })
    }

    // Teste 2: Verificar acesso às contas de anúncio
    const accountTests = []
    
    for (const accountId of [FB_AD_ACCOUNT_1, FB_AD_ACCOUNT_2]) {
      if (!accountId) continue
      
      try {
        console.log(`🔍 Testing access to account: ${accountId}`)
        const accountUrl = `https://graph.facebook.com/v23.0/${accountId}`
        const accountParams = new URLSearchParams({
          access_token: FB_TOKEN,
          fields: 'id,name,account_status,disable_reason'
        })

        const accountResponse = await fetch(`${accountUrl}?${accountParams}`)
        const accountData = await accountResponse.json()

        accountTests.push({
          accountId,
          success: accountResponse.ok,
          status: accountResponse.status,
          data: accountData
        })

        console.log(`Account ${accountId} test:`, accountData)
      } catch (error) {
        accountTests.push({
          accountId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Teste 3: Verificar se há campanhas
    const campaignTests = []
    
    for (const accountId of [FB_AD_ACCOUNT_1, FB_AD_ACCOUNT_2]) {
      if (!accountId) continue
      
      try {
        console.log(`🔍 Testing campaigns for account: ${accountId}`)
        const campaignsUrl = `https://graph.facebook.com/v23.0/${accountId}/campaigns`
        const campaignsParams = new URLSearchParams({
          access_token: FB_TOKEN,
          fields: 'id,name,status',
          limit: '5'
        })

        const campaignsResponse = await fetch(`${campaignsUrl}?${campaignsParams}`)
        const campaignsData = await campaignsResponse.json()

        campaignTests.push({
          accountId,
          success: campaignsResponse.ok,
          status: campaignsResponse.status,
          campaignCount: campaignsData.data?.length || 0,
          data: campaignsData
        })

        console.log(`Campaigns for ${accountId}:`, campaignsData)
      } catch (error) {
        campaignTests.push({
          accountId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      tokenTest: {
        valid: true,
        user: tokenData
      },
      accountTests,
      campaignTests,
      summary: {
        tokenValid: true,
        accountsAccessible: accountTests.filter(t => t.success).length,
        totalAccounts: accountTests.length,
        campaignsFound: campaignTests.reduce((sum, t) => sum + (t.campaignCount || 0), 0)
      }
    })

  } catch (error) {
    console.error('🚨 Facebook API test failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Facebook API test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 