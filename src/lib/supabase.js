import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

function createMockQuery(result = { data: [], error: null, count: 0 }) {
  const builder = {
    select: () => builder,
    insert: () => builder,
    update: () => builder,
    delete: () => builder,
    eq: () => builder,
    order: () => builder,
    limit: () => builder,
    single: () => ({ data: null, error: null }),
    then: (resolve) => Promise.resolve(result).then(resolve),
  }
  return builder
}

function createMockClient() {
  console.warn('Supabase disabled: missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.')
  return {
    from: () => createMockQuery(),
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: async () => ({ data: null, error: { message: 'Supabase disabled.' } }),
      signInWithPassword: async () => ({ data: null, error: { message: 'Supabase disabled.' } }),
      signOut: async () => ({ error: null }),
    },
    storage: {
      from: () => ({
        upload: async () => ({ error: null }),
        createSignedUrl: async () => ({ data: { signedUrl: '' }, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  }
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
  : createMockClient()
