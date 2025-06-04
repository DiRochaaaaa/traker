import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.')
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export type Venda = {
  id: number
  created_at: string
  plataforma: string | null
  purchase_id: string | null
  product_id: string | null
  cliente_name: string | null
  cliente_email: string | null
  cliente_number: string | null
  produto: string | null
  tipo: string | null
  faturamento_bruto: string | null
  comissao: string | null
  campaign_id: string | null
  adset_id: string | null
  ad_id: string | null
  source: string | null
} 