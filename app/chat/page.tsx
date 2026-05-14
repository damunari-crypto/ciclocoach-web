'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'coach'
  text: string
  updated?: boolean
}

const QUICK_MESSAGES = [
  'Ho saltato l\'allenamento di oggi',
  'Mi sento molto stanco',
  'Domani non posso allenarmi',
  'Analizza la mia settimana',
  'Posso aumentare i carichi?',
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'coach', text: 'Ciao Davide! Sono il tuo coach AI. Puoi dirmi se hai saltato un allenamento, se hai impegni nei prossimi giorni, o chiedermi un\'analisi della tua settimana.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setMessages(prev => [...prev, {
        role: 'coach',
        text: data.reply,
        updated: data.updated,
      }])
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'coach', text: 'Errore: ' + e.message }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)', background: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>🤖</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Coach AI</div>
            <div style={{ fontSize: 11, color: 'var(--text-2)' }}>Legge Intervals.icu · aggiorna il piano</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '85%',
              background: msg.role === 'user' ? 'var(--orange)' : 'white',
              color: msg.role === 'user' ? 'white' : 'var(--text-1)',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              padding: '10px 14px',
              fontSize: 13,
              lineHeight: 1.6,
              border: msg.role === 'coach' ? '1px solid var(--border)' : 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}>
              {msg.text}
              {msg.updated && (
                <div style={{ marginTop: 6, fontSize: 11, opacity: 0.8, display: 'flex', alignItems: 'center', gap: 4 }}>
                  ✅ Piano aggiornato
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              background: 'white', border: '1px solid var(--border)',
              borderRadius: '18px 18px 18px 4px', padding: '10px 16px',
              fontSize: 18, color: 'var(--text-3)'
            }}>
              ···
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      {messages.length <= 1 && (
        <div style={{ padding: '0 16px 10px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {QUICK_MESSAGES.map(q => (
            <button key={q} onClick={() => sendMessage(q)} style={{
              background: 'var(--orange-lt)', color: 'var(--orange)',
              border: '1px solid var(--orange)', borderRadius: 20,
              padding: '6px 12px', fontSize: 12, fontWeight: 600,
              cursor: 'pointer'
            }}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', background: 'white', display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
          placeholder="Scrivi al coach..."
          disabled={loading}
          style={{
            flex: 1, border: '1px solid var(--border)', borderRadius: 20,
            padding: '10px 16px', fontSize: 13, outline: 'none',
            background: 'var(--bg)',
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          style={{
            background: 'var(--orange)', color: 'white',
            border: 'none', borderRadius: 20,
            padding: '10px 18px', fontSize: 13, fontWeight: 700,
            cursor: loading || !input.trim() ? 'default' : 'pointer',
            opacity: loading || !input.trim() ? 0.5 : 1,
          }}
        >
          Invia
        </button>
      </div>
    </div>
  )
}
