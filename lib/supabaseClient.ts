import { createClient } from '@supabase/supabase-js'

type AppSupabaseClient = ReturnType<typeof createClient>

let cachedClient: AppSupabaseClient | null | undefined

export function getSupabaseClient(): AppSupabaseClient | null {
  if (cachedClient !== undefined) {
    return cachedClient
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    cachedClient = null
    return cachedClient
  }

  cachedClient = createClient(supabaseUrl, supabaseKey)
  return cachedClient
}
