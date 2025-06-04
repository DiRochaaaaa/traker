import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    
    if (!password) {
      return NextResponse.json({ error: 'Senha é obrigatória' }, { status: 400 })
    }

    const correctPassword = process.env.AUTH_PASSWORD
    
    if (!correctPassword) {
      console.error('AUTH_PASSWORD não configurada na .env')
      return NextResponse.json({ error: 'Configuração de autenticação não encontrada' }, { status: 500 })
    }

    if (password === correctPassword) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })
    }
  } catch (error) {
    console.error('Erro na verificação de senha:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 