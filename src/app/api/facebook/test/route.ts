import { NextResponse } from 'next/server'

// Função para obter todas as contas dinamicamente
interface AccountInfo {
  id: string
  envName?: string
}

function getAllFacebookAccounts(): AccountInfo[] {
  const accounts: AccountInfo[] = []

  Object.keys(process.env).forEach(key => {
    const match = key.match(/^FB_AD_ACCOUNT_(\d+)$/)
    if (match && process.env[key]) {
      const idx = match[1]
      const id = process.env[key]!
      const envName = process.env[`FB_AD_ACCOUNT_NAME_${idx}`]
      accounts.push({ id, envName })
    }
  })

  return accounts
}

export async function GET() {
  try {
    console.log('🧪 Testing Facebook API access...')
    
    const FB_TOKEN = process.env.FB_TOKEN
    const accounts = getAllFacebookAccounts()
    const allAccounts = accounts.map(a => a.id)

    console.log(`🔐 FB_TOKEN exists: ${!!FB_TOKEN}`)
    console.log(`🏢 Found ${accounts.length} configured accounts`)
    
    if (!FB_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'FB_TOKEN not found in environment variables'
      })
    }

    if (allAccounts.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No FB_AD_ACCOUNT_* variables found in environment'
      })
    }

    // Test basic API access
    console.log('🔍 Testing basic API access...')
    const meResponse = await fetch(`https://graph.facebook.com/v23.0/me?access_token=${FB_TOKEN}`)
    const meData = await meResponse.json()
    
    console.log('👤 Me API Response:', meData)

    if (!meResponse.ok) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired token',
        details: meData
      })
    }

    // Test account access
    console.log('🏢 Testing account access...')
    const accountTests = []

    for (const account of accounts) {
      const accountId = account.id
      console.log(`🔍 Testing access to account: ${accountId}`)
      const accountUrl = `https://graph.facebook.com/v23.0/${accountId}`
      const accountParams = new URLSearchParams({
        access_token: FB_TOKEN,
        fields: 'id,name,account_status,disable_reason'
      })

      const accountResponse = await fetch(`${accountUrl}?${accountParams}`)
      const accountData = await accountResponse.json()
      if (account.envName && !accountData.name) {
        accountData.name = account.envName
      }

      accountTests.push({
        accountId,
        success: accountResponse.ok,
        status: accountResponse.status,
        data: accountData
      })

      console.log(`Account ${accountId} test:`, accountData)
    }

    // Test campaigns access
    console.log('📊 Testing campaigns access...')
    
    for (const account of accounts) {
      const accountId = account.id
      console.log(`🔍 Testing campaigns for account: ${accountId}`)
      const campaignsUrl = `https://graph.facebook.com/v23.0/${accountId}/campaigns`
      const campaignsParams = new URLSearchParams({
        access_token: FB_TOKEN,
        fields: 'id,name,status',
        limit: '5'
      })

      const campaignsResponse = await fetch(`${campaignsUrl}?${campaignsParams}`)
      const campaignsData = await campaignsResponse.json()

      accountTests.push({
        accountId,
        success: campaignsResponse.ok,
        status: campaignsResponse.status,
        data: campaignsData,
        type: 'campaigns'
      })

      console.log(`Campaigns for ${accountId}:`, campaignsData)
    }

    return NextResponse.json({
      success: true,
      message: 'Facebook API tests completed',
      user: meData,
      accountTests,
      summary: {
        totalAccounts: allAccounts.length,
        accountsAccessible: accountTests.filter(t => t.success && !t.type).length,
        accounts: allAccounts
      }
    })

  } catch (error) {
    console.error('❌ Error testing Facebook API:', error)
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
