'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function DigitChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function send() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          childName: 'Kylie',
          digitForm: 'froggy_designer',
          context: 'creator_studio',
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessages((prev) => [...prev, { role: 'assistant', text: data.response }])
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', text: "Hmm, I couldn't connect. Try again?" }])
    }
    setLoading(false)
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 w-12 h-12 rounded-full bg-green-500 text-slate-950 flex items-center justify-center text-lg font-bold shadow-lg hover:bg-green-400 transition-colors z-50"
      >
        D
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-4 w-80 h-96 bg-slate-900 border border-slate-700 rounded-2xl flex flex-col overflow-hidden shadow-2xl z-50"
          >
            <div className="px-4 py-3 bg-green-500/10 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-green-400">Digit</h3>
              <p className="text-[10px] text-slate-500">Your creative helper</p>
            </div>

            <div className="flex-1 overflow-auto p-3 flex flex-col gap-2">
              {messages.length === 0 && (
                <p className="text-xs text-slate-600 text-center mt-8">
                  Ask me anything about your project!
                </p>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`text-xs px-3 py-2 rounded-xl max-w-[85%] ${
                    m.role === 'user'
                      ? 'bg-green-500/15 text-green-300 self-end'
                      : 'bg-slate-800 text-slate-300 self-start'
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {loading && (
                <div className="text-xs text-slate-500 self-start px-3 py-2">Thinking...</div>
              )}
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); send() }}
              className="p-3 border-t border-slate-800 flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Digit..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-600 outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-3 py-1.5 bg-green-500 text-slate-950 rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
