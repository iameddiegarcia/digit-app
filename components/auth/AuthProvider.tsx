'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'
import type { Session, User, SupabaseClient } from '@supabase/supabase-js'

interface AuthContextValue {
  supabase: SupabaseClient
  session: Session | null
  user: User | null
  role: string | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createBrowserSupabaseClient())
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchRole(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        if (session?.user) {
          fetchRole(session.user.id)
        } else {
          setRole(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  async function fetchRole(userId: string) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    setRole(profile?.role ?? null)
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{
      supabase,
      session,
      user: session?.user ?? null,
      role,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
