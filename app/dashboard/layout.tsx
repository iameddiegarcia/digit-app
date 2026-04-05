'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

const CHILDREN = [
  { id: '00000000-0000-0000-0000-000000000010', name: 'Santi', color: '#60A5FA' },
  { id: '00000000-0000-0000-0000-000000000020', name: 'Emily', color: '#F9A8D4' },
  { id: '00000000-0000-0000-0000-000000000030', name: 'Kylie', color: '#4ADE80' },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
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
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  const activeChildId = pathname.includes('/child/')
    ? pathname.split('/child/')[1]?.split('/')[0]
    : null

  return (
    <div className="min-h-screen bg-slate-950 overflow-auto">
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold text-amber-500 tracking-tight">Dad&apos;s Dashboard</h1>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800"
          >
            {signingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </header>

      <nav className="bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 flex gap-1 py-2">
          <button
            onClick={() => router.push('/dashboard')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/dashboard' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Overview
          </button>
          {CHILDREN.map((child) => (
            <button
              key={child.id}
              onClick={() => router.push(`/dashboard/child/${child.id}`)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeChildId === child.id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: child.color }} />
              {child.name}
            </button>
          ))}
          <button
            onClick={() => router.push('/dashboard/weekly-report')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ml-auto ${
              pathname === '/dashboard/weekly-report' ? 'bg-violet-500/20 text-violet-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => router.push('/dashboard/review')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/dashboard/review' ? 'bg-green-500/20 text-green-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Review
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <motion.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {children}
        </motion.div>
      </main>
    </div>
  )
}
