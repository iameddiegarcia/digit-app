import { createBrowserClient } from '@supabase/ssr'

export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key || url === 'your_supabase_url') {
    // Return a dummy client during build/SSG when env vars aren't available
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder-key'
    )
  }

  return createBrowserClient(url, key)
}
