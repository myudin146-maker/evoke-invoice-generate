import { createBrowserClient } from '@supabase/ssr'

const FALLBACK_URL = 'https://placeholder.supabase.co'
const FALLBACK_KEY = 'placeholder'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return createBrowserClient(
    (!url || url === 'your_supabase_project_url') ? FALLBACK_URL : url,
    (!key || key === 'your_supabase_anon_key') ? FALLBACK_KEY : key
  )
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!(url && url !== 'your_supabase_project_url' && key && key !== 'your_supabase_anon_key')
}
