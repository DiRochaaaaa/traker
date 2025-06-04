import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { campaignId, action } = await request.json() // action: 'pause' | 'resume'
    
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

    // Definir o status baseado na ação
    const status = action === 'pause' ? 'PAUSED' : 'ACTIVE'
    
    console.log(`🎯 ${action === 'pause' ? 'Pausando' : 'Ativando'} campanha: ${campaignId}`)
    
    // Fazer requisição para a API do Facebook
    const response = await fetch(`https://graph.facebook.com/v21.0/${campaignId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: status,
        access_token: accessToken
      })
    })

    console.log(`📡 Facebook API Response Status: ${response.status}`)

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao alterar status da campanha',
          details: data.error?.message || 'Erro desconhecido'
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Campanha ${action === 'pause' ? 'pausada' : 'reativada'} com sucesso`,
      campaignId,
      newStatus: status,
      data
    })

  } catch (error) {
    console.error('❌ Erro ao alterar status da campanha:', error)
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