import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[v0] Supabase environment variables not available. Some features may not work.")
    // Return a mock client that won't break the app
    return {
      auth: {
        signUp: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
        signOut: () => Promise.resolve({ error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }) }) }),
        insert: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
        update: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
        delete: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
      }),
    } as any
  }

  try {
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error("[v0] Failed to create Supabase client:", error)
    // Return the same mock client as fallback
    return {
      auth: {
        signUp: () => Promise.resolve({ data: null, error: { message: "Supabase client error" } }),
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: "Supabase client error" } }),
        signOut: () => Promise.resolve({ error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }) }) }),
        insert: () => Promise.resolve({ data: null, error: { message: "Supabase client error" } }),
        update: () => Promise.resolve({ data: null, error: { message: "Supabase client error" } }),
        delete: () => Promise.resolve({ data: null, error: { message: "Supabase client error" } }),
      }),
    } as any
  }
}
