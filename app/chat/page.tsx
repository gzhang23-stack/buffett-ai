'use client'

import { useState, useRef, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Send, BookOpen, Loader2, RotateCcw, ChevronDown, ChevronUp, Plus, Menu, X } from 'lucide-react'

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
    <div className="rounded-lg border border-stone-700/60 bg-stone-900/50 overflow-hidden text-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-stone-800/50 transition-colors"
      >
        <span className="shrink-0 font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-1.5 py-0.5 text-xs">
          {source.year}
        </span>
        <span className="text-stone-400 truncate flex-1">{source.title}</span>
        <span className="text-stone-600 shrink-0">[{index + 1}]</span>
        {open
          ? <ChevronUp className="h-3.5 w-3.5 text-stone-600 shrink-0" />
          : <ChevronDown className="h-3.5 w-3.5 text-stone-600 shrink-0" />}
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1 border-t border-stone-700/40">
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
        <div className="max-w-[80%] bg-amber-500 text-stone-900 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed font-medium">
          {msg.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <div className="shrink-0 w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mt-0.5">
        <BookOpen className="h-3.5 w-3.5 text-amber-400" />
      </div>
      <div className="flex-1 min-w-0 space-y-3">
        <div className="bg-stone-900/80 border border-stone-700/60 rounded-2xl rounded-tl-sm px-4 py-3">
          {msg.loading && !msg.content ? (
            <div className="flex items-center gap-2 text-stone-500 text-sm">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
              <span>正在检索文献并思考…</span>
            </div>
          ) : (
            <div className="prose prose-sm prose-invert max-w-none
              prose-p:text-stone-300 prose-headings:text-stone-100
              prose-strong:text-stone-200 prose-li:text-stone-300
              prose-code:text-amber-300 prose-code:bg-stone-800">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              {msg.loading && (
                <span className="inline-block w-1 h-4 bg-amber-400 animate-pulse ml-0.5 rounded-sm" />
              )}
            </div>
          )}
        </div>
        {msg.sources && msg.sources.length > 0 && !msg.loading && (
          <div className="space-y-1.5">
            <p className="text-xs text-stone-600 font-medium uppercase tracking-wider px-1">参考来源</p>
            {msg.sources.map((src, i) => (
              <SourceCard key={i} source={src} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Chat Inner ───────────────────────────────────────────────────────────────

function ChatInner() {
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') ?? ''

  const [conversations, setConversations] = useState<Conversation[]>([newConversation()])
  const [activeId, setActiveId] = useState<string>(conversations[0].id)
  const [input, setInput] = useState(initialQ)
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const didAutoSubmit = useRef(false)

  const activeConv = conversations.find((c) => c.id === activeId)!

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConv.messages])

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
      abortRef.current?.abort()
      abortRef.current = new AbortController()

      const userMsgId = uid()
      const assistantMsgId = uid()
      const convId = activeId

      updateConv(convId, (c) => ({
        ...c,
        title: c.messages.length === 0 ? question.slice(0, 60) : c.title,
        messages: [
          ...c.messages,
          { id: userMsgId, role: 'user', content: question },
          { id: assistantMsgId, role: 'assistant', content: '', loading: true },
        ],
      }))

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
              m.id === assistantMsgId ? { ...m, content: `错误：${err.error}`, loading: false } : m
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
                    m.id === assistantMsgId ? { ...m, content: m.content + event.text } : m
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
                    m.id === assistantMsgId ? { ...m, content: `错误：${event.message}`, loading: false } : m
                  ),
                }))
              }
            } catch { /* ignore */ }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return
        updateConv(convId, (c) => ({
          ...c,
          messages: c.messages.map((m) =>
            m.id === assistantMsgId ? { ...m, content: '网络错误，请重试。', loading: false } : m
          ),
        }))
      } finally {
        setStreaming(false)
      }
    },
    [input, streaming, activeId, activeConv.messages, updateConv]
  )

  useEffect(() => {
    if (initialQ && !didAutoSubmit.current) {
      didAutoSubmit.current = true
      handleSubmit(initialQ)
    }
  }, [initialQ, handleSubmit])

  const startNew = () => {
    const conv = newConversation()
    setConversations((prev) => [conv, ...prev])
    setActiveId(conv.id)
    setInput('')
  }

  const isEmpty = activeConv.messages.length === 0

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Mobile drawer overlay ── */}
      {mobileSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <div className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-64 flex flex-col border-r border-stone-800 bg-[#0a0a0a] transition-transform duration-200 ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-stone-300">
            <BookOpen className="h-4 w-4 text-amber-400" />
            对话列表
          </div>
          <button onClick={() => setMobileSidebarOpen(false)} className="p-1 text-stone-500 hover:text-stone-300">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-3 py-3 shrink-0">
          <button
            onClick={() => { startNew(); setMobileSidebarOpen(false) }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-stone-500
                       hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            新对话
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-0.5">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => { setActiveId(conv.id); setMobileSidebarOpen(false) }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs truncate transition-colors ${
                conv.id === activeId
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-stone-600 hover:text-stone-300 hover:bg-stone-800'
              }`}
            >
              {conv.title}
            </button>
          ))}
        </div>
      </div>

      {/* ── Desktop conversation list ── */}
      <aside className="hidden md:flex w-40 shrink-0 border-r border-stone-800 bg-[#0a0a0a] flex-col overflow-hidden">
        <div className="px-3 py-3 shrink-0">
          <button
            onClick={startNew}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-stone-500
                       hover:text-stone-200 hover:bg-stone-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            新对话
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-0.5">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveId(conv.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs truncate transition-colors ${
                conv.id === activeId
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-stone-600 hover:text-stone-300 hover:bg-stone-800'
              }`}
            >
              {conv.title}
            </button>
          ))}
        </div>
      </aside>

      {/* ── Chat area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Floating menu button (mobile only, always shown) */}
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="md:hidden fixed bottom-24 right-6 z-30 w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-900 shadow-xl flex flex-col items-center justify-center transition-all active:scale-95"
        >
          <RotateCcw className="h-5 w-5" />
          <span className="text-[9px] font-semibold mt-0.5">对话</span>
        </button>

        {/* Header */}
        <header className="shrink-0 flex items-center justify-between px-4 md:px-6 py-3 border-b border-stone-800 bg-[#0f0f0f]">
          <h2 className="text-sm font-medium text-stone-400 truncate">{activeConv.title}</h2>
          {activeConv.messages.length > 0 && (
            <button
              onClick={startNew}
              className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-300 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              新对话
            </button>
          )}
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
          {isEmpty ? (
            <div className="w-full">
              <div className="text-center mb-10">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-7 w-7 text-amber-400" />
                </div>
                <h1 className="text-2xl font-semibold text-stone-100 mb-2">向价值投资大师提问</h1>
                <p className="text-stone-500 text-sm max-w-md mx-auto">
                  探索巴菲特、芒格等价值投资大师的智慧精华，所有回答均标注原文来源。
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {EXAMPLE_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSubmit(q)}
                    className="text-left text-sm px-4 py-3 rounded-xl border border-stone-700/60 bg-stone-900/50
                               hover:border-amber-500/40 hover:bg-amber-500/5 transition-colors text-stone-400
                               hover:text-stone-200"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full space-y-6">
              {activeConv.messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-stone-800 bg-[#0f0f0f] px-4 md:px-6 py-4">
          <div className="w-full">
            <div className="flex items-end gap-3 bg-stone-900/80 border border-stone-700 rounded-2xl px-4 py-2.5
                            focus-within:border-amber-500/50 transition-all">
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
                className="flex-1 bg-transparent resize-none outline-none text-sm text-stone-200
                           placeholder:text-stone-600 leading-relaxed max-h-40"
              />
              <button
                onClick={() => handleSubmit()}
                disabled={!input.trim() || streaming}
                className="shrink-0 w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30
                           disabled:cursor-not-allowed flex items-center justify-center transition-colors mb-0.5"
              >
                {streaming
                  ? <Loader2 className="h-4 w-4 text-stone-900 animate-spin" />
                  : <Send className="h-4 w-4 text-stone-900" />}
              </button>
            </div>
            <p className="text-center text-[11px] text-stone-700 mt-2">
              按 Enter 发送 · Shift+Enter 换行
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChatPage() {
  return (
    <div className="h-full overflow-hidden">
      <Suspense fallback={
        <div className="flex items-center justify-center h-full text-stone-600">
          <Loader2 className="h-5 w-5 animate-spin mr-2 text-amber-400" />加载中…
        </div>
      }>
        <ChatInner />
      </Suspense>
    </div>
  )
}
