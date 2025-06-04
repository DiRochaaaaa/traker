import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { campaignId, newBudget, budgetType } = await request.json()
    // budgetType: 'CBO' | 'ABO'
    // newBudget: valor em centavos (ex: 5000 = R$ 50,00)
    
    console.log(`🔐 Verificando token de acesso...`)
    console.log(`🔐 FB_TOKEN exists: ${!!process.env.FB_TOKEN}`)
    
    const accessToken = process.env.FB_TOKEN
    if (!accessToken) {
      console.error('❌ Token FB_TOKEN não encontrado nas variáveis de ambiente')
      return NextResponse.json(
        { success: false, error: 'Token de acesso não configurado. Verifique a variável FB_TOKEN.' },
        { status: 500 }
      )
    }

    console.log(`💰 Alterando orçamento da campanha ${campaignId}:`)
    console.log(`  - Tipo: ${budgetType}`)
    console.log(`  - Novo orçamento: R$ ${(newBudget / 100).toFixed(2)}`)

    let updateData: Record<string, unknown> = {}
    let endpoint = ''

    if (budgetType === 'CBO') {
      // Para campanhas CBO, alterar orçamento da campanha
      endpoint = `https://graph.facebook.com/v21.0/${campaignId}`
      updateData = {
        daily_budget: newBudget,
        access_token: accessToken
      }
    } else {
      // Para campanhas ABO, precisamos alterar os ad sets
      // Primeiro, buscar os ad sets da campanha
      const adSetsResponse = await fetch(
        `https://graph.facebook.com/v21.0/${campaignId}/adsets?fields=id,name,daily_budget&access_token=${accessToken}`
      )
      
      const adSetsData = await adSetsResponse.json()
      
      if (!adSetsResponse.ok) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Erro ao buscar ad sets da campanha',
            details: adSetsData.error?.message || 'Erro desconhecido'
          },
          { status: adSetsResponse.status }
        )
      }

      // Atualizar todos os ad sets (distribuindo o orçamento igualmente)
      const adSets = adSetsData.data || []
      const budgetPerAdSet = Math.floor(newBudget / adSets.length)
      
      const updatePromises = adSets.map((adSet: { id: string }) => 
        fetch(`https://graph.facebook.com/v21.0/${adSet.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            daily_budget: budgetPerAdSet,
            access_token: accessToken
          })
        })
      )

      const results = await Promise.all(updatePromises)
      const errors = []
      
      for (let i = 0; i < results.length; i++) {
        if (!results[i].ok) {
          const errorData = await results[i].json()
          errors.push(`Ad Set ${adSets[i].id}: ${errorData.error?.message || 'Erro desconhecido'}`)
        }
      }

      if (errors.length > 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Erro ao atualizar alguns ad sets',
            details: errors.join(', ')
          },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        message: `Orçamento ABO atualizado com sucesso`,
        campaignId,
        budgetType: 'ABO',
        newBudget,
        updatedAdSets: adSets.length,
        budgetPerAdSet
      })
    }

    // Para campanhas CBO
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao alterar orçamento da campanha',
          details: data.error?.message || 'Erro desconhecido'
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Orçamento ${budgetType} atualizado com sucesso`,
      campaignId,
      budgetType,
      newBudget: newBudget,
      data
    })

  } catch (error) {
    console.error('❌ Erro ao alterar orçamento da campanha:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
} 