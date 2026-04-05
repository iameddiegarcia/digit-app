import { createServerSupabaseClient } from './supabase-server'

export type UserRole = 'parent' | 'creator' | 'child'

export async function getSession() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUserRole(userId: string): Promise<UserRole | null> {
  const supabase = await createServerSupabaseClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  return (profile?.role as UserRole) ?? null
}

export async function getSessionWithRole() {
  const session = await getSession()
  if (!session) return { session: null, role: null }

  const role = await getUserRole(session.user.id)
  return { session, role }
}
