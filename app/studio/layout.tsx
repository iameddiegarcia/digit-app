'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { StudioSidebar } from '@/components/studio/StudioSidebar'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export default function StudioLayout({ children }: { children: ReactNode }) {
  const { user, supabase, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <StudioSidebar onSignOut={handleSignOut} signingOut={signingOut} />

      <main className="flex-1 overflow-auto p-6">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}
