import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true
  return value.startsWith('REPLACE_WITH_')
}

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !isPlaceholder(supabaseUrl) &&
  !isPlaceholder(supabaseAnonKey),
)

if (!isSupabaseConfigured) {
  console.warn(
    '[supabase] Supabase env values are missing or placeholders. ' +
    'The app should use backend auth fallback until valid keys are configured.',
  )
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')
