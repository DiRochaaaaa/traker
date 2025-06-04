import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const FB_TOKEN = process.env.FB_TOKEN
    
    if (!FB_TOKEN) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'FB_TOKEN não encontrado nas variáveis de ambiente' 
        },
        { status: 500 }
      )
    }

    // Testar token fazendo uma chamada simples para a API do Facebook
    const response = await fetch(`https://graph.facebook.com/me?access_token=${FB_TOKEN}`)
    const data = await response.json()

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Token válido!',
        user: data
      })
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Token inválido ou expirado',
          details: data.error?.message || 'Erro desconhecido'
        },
        { status: 401 }
      )
    }

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao validar token',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
} 