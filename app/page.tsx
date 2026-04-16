'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Send, BookOpen, Loader2, RotateCcw, ChevronDown, ChevronUp, Plus } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Source {
  year: number
  title: string
  excerpt: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
  loading?: boolean
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
}

// ─── Constants ───────────────────────────────────────────────────────────────

const EXAMPLE_QUESTIONS = [
  '巴菲特如何看待长期投资？',
  '巴菲特如何评估一家好公司？',
  '巴菲特对市场波动有什么看法？',
  '巴菲特如何看待管理层的质量？',
  '巴菲特如何描述伯克希尔的竞争优势？',
  '巴菲特在信中如何谈论保险业务的作用？',
]

function uid() {
  return Math.random().toString(36).slice(2)
}

function newConversation(): Conversation {
  return { id: uid(), title: '新对话', messages: [], createdAt: Date.now() }
}

// ─── Source Card ─────────────────────────────────────────────────────────────

function SourceCard({ source, index }: { source: Source; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-lg border border-stone-200 bg-white overflow-hidden text-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-stone-50 transition-colors"
      >
        <span className="shrink-0 font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 text-xs">
          {source.year}
        </span>
        <span className="text-stone-600 truncate flex-1">{source.title}</span>
        <span className="text-stone-400 shrink-0">[{index + 1}]</span>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 text-stone-400 shrink-0" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-stone-400 shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1 border-t border-stone-100">
          <p className="text-stone-500 leading-relaxed italic text-xs">
            &ldquo;{source.excerpt}&rdquo;
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  if (msg.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-amber-500 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed">
          {msg.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <div className="shrink-0 w-7 h-7 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center mt-0.5">
        <BookOpen className="h-3.5 w-3.5 text-amber-600" />
      </div>

      <div className="flex-1 min-w-0 space-y-3">
        {/* Answer text */}
        <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-sm px-4 py-3">
          {msg.loading && !msg.content ? (
            <div className="flex items-center gap-2 text-stone-400 text-sm">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>正在检索信件并思考…</span>
            </div>
          ) : (
            <div className="prose prose-sm prose-stone max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              {msg.loading && (
                <span className="inline-block w-1 h-4 bg-amber-500 animate-pulse ml-0.5 rounded-sm" />
              )}
            </div>
          )}
        </div>

        {/* Sources */}
        {msg.sources && msg.sources.length > 0 && !msg.loading && (
          <div className="space-y-1.5">
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wider px-1">
              参考来源
            </p>
            {msg.sources.map((src, i) => (
              <SourceCard key={i} source={src} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([newConversation()])
  const [activeId, setActiveId] = useState<string>(conversations[0].id)
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const activeConv = conversations.find((c) => c.id === activeId)!

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConv.messages])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
  }, [input])

  const updateConv = useCallback(
    (id: string, updater: (c: Conversation) => Conversation) => {
      setConversations((prev) => prev.map((c) => (c.id === id ? updater(c) : c)))
    },
    []
  )

  const handleSubmit = useCallback(
    async (questionOverride?: string) => {
      const question = (questionOverride ?? input).trim()
      if (!question || streaming) return

      setInput('')
      setStreaming(true)

      // Abort previous request if any
      abortRef.current?.abort()
      abortRef.current = new AbortController()

      const userMsgId = uid()
      const assistantMsgId = uid()
      const convId = activeId

      // Add user message
      updateConv(convId, (c) => ({
        ...c,
        title: c.messages.length === 0 ? question.slice(0, 60) : c.title,
        messages: [
          ...c.messages,
          { id: userMsgId, role: 'user', content: question },
          { id: assistantMsgId, role: 'assistant', content: '', loading: true },
        ],
      }))

      // Build history (exclude the loading assistant message)
      const history = activeConv.messages.map((m) => ({ role: m.role, content: m.content }))

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, history }),
          signal: abortRef.current.signal,
        })

        if (!res.ok || !res.body) {
          const err = await res.json().catch(() => ({ error: 'Unknown error' }))
          updateConv(convId, (c) => ({
            ...c,
            messages: c.messages.map((m) =>
              m.id === assistantMsgId
                ? { ...m, content: `错误：${err.error}`, loading: false }
                : m
            ),
          }))
          return
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const raw = line.slice(6).trim()
            if (!raw) continue

            try {
              const event = JSON.parse(raw)

              if (event.type === 'sources') {
                updateConv(convId, (c) => ({
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsgId ? { ...m, sources: event.sources } : m
                  ),
                }))
              } else if (event.type === 'text') {
                updateConv(convId, (c) => ({
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, content: m.content + event.text }
                      : m
                  ),
                }))
              } else if (event.type === 'done') {
                updateConv(convId, (c) => ({
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsgId ? { ...m, loading: false } : m
                  ),
                }))
              } else if (event.type === 'error') {
                updateConv(convId, (c) => ({
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, content: `错误：${event.message}`, loading: false }
                      : m
                  ),
                }))
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return
        updateConv(convId, (c) => ({
          ...c,
          messages: c.messages.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: '网络错误，请重试。', loading: false }
              : m
          ),
        }))
      } finally {
        setStreaming(false)
      }
    },
    [input, streaming, activeId, activeConv.messages, updateConv]
  )

  const startNewConversation = () => {
    const conv = newConversation()
    setConversations((prev) => [conv, ...prev])
    setActiveId(conv.id)
    setInput('')
  }

  const isEmpty = activeConv.messages.length === 0

  return (
    <div className="flex flex-col h-screen bg-stone-50 font-sans">
      <div className="flex flex-1 min-h-0">
      {/* ── Sidebar ── */}
      <aside className="w-60 shrink-0 border-r border-stone-200 bg-stone-100 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-stone-200">
          <div className="w-7 h-7 rounded-md bg-amber-500 flex items-center justify-center shrink-0">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-stone-800">巴菲特信件</div>
            <div className="text-[10px] text-stone-400">1977 – 2024</div>
          </div>
        </div>

        {/* New conversation button */}
        <div className="px-3 pt-3">
          <button
            onClick={startNewConversation}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-stone-600
                       hover:bg-stone-200 transition-colors"
          >
            <Plus className="h-4 w-4" />
            新对话
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveId(conv.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-colors ${
                conv.id === activeId
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
                  : 'text-stone-500 hover:bg-stone-200'
              }`}
            >
              {conv.title}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-stone-200 text-[10px] text-stone-400">
          由 DeepSeek 驱动 · 巴菲特致股东信
        </div>
      </aside>

      {/* ── Main Chat Area ── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-stone-200 bg-white">
          <h2 className="text-sm font-medium text-stone-700 truncate">{activeConv.title}</h2>
          {activeConv.messages.length > 0 && (
            <button
              onClick={startNewConversation}
              className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              新对话
            </button>
          )}
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isEmpty ? (
            /* Welcome screen */
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10">
                <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-2xl font-semibold text-stone-800 mb-2">
                  向巴菲特的信件提问
                </h1>
                <p className="text-stone-500 text-sm max-w-md mx-auto">
                  探索沃伦·巴菲特 1977 至 2024 年致伯克希尔·哈撒韦股东信中的投资智慧。
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {EXAMPLE_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSubmit(q)}
                    className="text-left text-sm px-4 py-3 rounded-xl border border-stone-200 bg-white
                               hover:border-amber-400 hover:bg-amber-50 transition-colors text-stone-600
                               shadow-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-6">
              {activeConv.messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="shrink-0 border-t border-stone-200 bg-white px-6 py-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-end gap-3 bg-stone-50 border border-stone-200 rounded-2xl px-4 py-2.5
                            focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100 transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
                placeholder="向巴菲特的致股东信提问…"
                rows={1}
                className="flex-1 bg-transparent resize-none outline-none text-sm text-stone-800
                           placeholder:text-stone-400 leading-relaxed max-h-40"
              />
              <button
                onClick={() => handleSubmit()}
                disabled={!input.trim() || streaming}
                className="shrink-0 w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40
                           disabled:cursor-not-allowed flex items-center justify-center transition-colors mb-0.5"
              >
                {streaming ? (
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                ) : (
                  <Send className="h-4 w-4 text-white" />
                )}
              </button>
            </div>
            <p className="text-center text-[11px] text-stone-400 mt-2">
              按 Enter 发送 · Shift+Enter 换行
            </p>
          </div>
        </div>
      </main>
      </div>
    </div>
  )
}
