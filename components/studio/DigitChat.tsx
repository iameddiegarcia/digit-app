'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
}

interface DigitChatProps {
  context?: Record<string, unknown>
}

export function DigitChat({ context }: DigitChatProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function send() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    const updated: ChatMessage[] = [...messages, { role: 'user', text: userMsg }]
    setMessages(updated)
    setLoading(true)

    try {
      const apiMessages = updated.map((m) => ({ role: m.role, content: m.text }))
      const res = await fetch('/api/studio/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          storyContext: context ?? undefined,
        }),
      })

      if (!res.ok || !res.body) {
        throw new Error('Failed')
      }

      // Consume SSE stream
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''
      setMessages((prev) => [...prev, { role: 'assistant', text: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                assistantText += parsed.text
                setMessages((prev) => {
                  const copy = [...prev]
                  copy[copy.length - 1] = { role: 'assistant', text: assistantText }
                  return copy
                })
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', text: "Ribbit... I couldn't connect. Try again?" }])
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
        🐸
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
              <h3 className="text-sm font-semibold text-green-400">🐸 Froggy</h3>
              <p className="text-[10px] text-slate-500">Your creative helper</p>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-auto p-3 flex flex-col gap-2">
              {messages.length === 0 && (
                <p className="text-xs text-slate-600 text-center mt-8">
                  Hey Kylie! What are you working on? I can help with stories, activities, and puzzles! 🐸
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
              {loading && messages[messages.length - 1]?.role !== 'assistant' && (
                <div className="text-xs text-slate-500 self-start px-3 py-2">Thinking... 🐸</div>
              )}
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); send() }}
              className="p-3 border-t border-slate-800 flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Froggy..."
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
