'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { DigitCharacter } from '@/components/digit/DigitCharacter'

type LoginTarget = 'eddie' | 'kylie' | null

export default function LoginPage() {
  const { supabase } = useAuth()
  const router = useRouter()
  const [loginTarget, setLoginTarget] = useState<LoginTarget>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Fetch role to redirect
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'creator') {
        router.push('/studio')
      } else if (profile?.role === 'parent') {
        router.push('/dashboard')
      } else {
        router.push('/')
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-8 bg-slate-950">
      <motion.h1
        className="text-3xl font-bold text-white/90"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Welcome back, Garcia family
      </motion.h1>

      <AnimatePresence mode="wait">
        {!loginTarget ? (
          <motion.div
            key="selector"
            className="flex flex-col items-center gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Eddie - Parent */}
            <motion.button
              onClick={() => setLoginTarget('eddie')}
              className="flex items-center gap-6 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors w-80"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="w-16 h-16 rounded-full bg-amber-500/30 flex items-center justify-center text-3xl">
                🧔
              </div>
              <div className="text-left">
                <div className="text-lg font-semibold text-amber-400">Dad&apos;s Dashboard</div>
                <div className="text-sm text-white/50">Eddie &middot; Parent login</div>
              </div>
            </motion.button>

            {/* Kylie - Creator */}
            <motion.button
              onClick={() => setLoginTarget('kylie')}
              className="flex items-center gap-6 p-6 rounded-2xl bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-colors w-80"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              whileTap={{ scale: 0.97 }}
            >
              <DigitCharacter
                form="round_bot"
                state="idle"
                color="#4ADE80"
                size={64}
              />
              <div className="text-left">
                <div className="text-lg font-semibold text-green-400">Kylie&apos;s Lily Pad</div>
                <div className="text-sm text-white/50">Kylie &middot; Creator login</div>
              </div>
            </motion.button>

            {/* Santi & Emily - Tap to play */}
            <div className="flex gap-6 mt-4">
              <motion.button
                onClick={() => router.push('/play/00000000-0000-0000-0000-000000000010')}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-white/5 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileTap={{ scale: 0.92 }}
              >
                <DigitCharacter
                  form="round_bot"
                  state="idle"
                  color="#60A5FA"
                  size={72}
                />
                <span className="text-sm font-medium text-blue-400">Santi</span>
                <span className="text-xs text-white/30">Tap to play</span>
              </motion.button>

              <motion.button
                onClick={() => router.push('/play/00000000-0000-0000-0000-000000000020')}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-white/5 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileTap={{ scale: 0.92 }}
              >
                <DigitCharacter
                  form="round_bot"
                  state="idle"
                  color="#F9A8D4"
                  size={72}
                />
                <span className="text-sm font-medium text-pink-400">Emily</span>
                <span className="text-xs text-white/30">Tap to play</span>
              </motion.button>
            </div>

            <motion.button
              onClick={() => router.push('/')}
              className="text-sm text-white/30 hover:text-white/50 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Back to home
            </motion.button>
          </motion.div>
        ) : (
          <motion.form
            key="login-form"
            onSubmit={handleLogin}
            className="flex flex-col items-center gap-6 w-80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div
              className="text-lg font-semibold"
              style={{ color: loginTarget === 'eddie' ? '#F59E0B' : '#4ADE80' }}
            >
              {loginTarget === 'eddie' ? "Dad's Dashboard" : "Kylie's Lily Pad"}
            </div>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
              autoFocus
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
            />

            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white transition-colors disabled:opacity-50"
              style={{
                backgroundColor: loginTarget === 'eddie' ? '#F59E0B' : '#4ADE80',
                color: '#0F172A',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginTarget(null)
                setEmail('')
                setPassword('')
                setError('')
              }}
              className="text-sm text-white/40 hover:text-white/60"
            >
              Back
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
