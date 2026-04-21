'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { BookOpen, Search, ChevronRight, X, Loader2, AlertTriangle } from 'lucide-react'

interface MungerChapter {
  slug: string
  year?: number
  title: string
  type: 'intro' | 'wesco' | 'daily-journal' | 'index'
}

interface SearchResult {
  chapter: MungerChapter
  excerpt: string
  score: number
}

function MungerInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') ?? ''

  const [chapters, setChapters] = useState<MungerChapter[]>([])
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState(initialQ)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [chaptersLoading, setChaptersLoading] = useState(true)

  // Load chapters
  useEffect(() => {
    fetch('/api/munger?chapters=1')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data.chapters)) setChapters(data.chapters) })
      .catch(() => {})
      .finally(() => setChaptersLoading(false))
  }, [])

  // Auto-search if ?q= present
  useEffect(() => {
    if (initialQ) handleSearch(initialQ)
  }, [initialQ]) // eslint-disable-line

  const handleSearch = async (q: string) => {
    const query = q.trim()
    if (!query) { setSearchResults([]); return }
    setSearching(true)
    setSelectedSlug(null)
    setContent('')
    setError('')
    try {
      const res = await fetch(`/api/munger?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setSearchResults(data.results ?? [])
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const loadChapter = async (slug: string) => {
    setSelectedSlug(slug)
    setSearchResults([])
    setSearchQuery('')
    setContent('')
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`/api/munger?slug=${encodeURIComponent(slug)}`)
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else if (!data.content) {
        setError('章节无法加载')
      } else {
        setContent(data.content)
      }
    } catch {
      setError('加载失败，请检查网络')
    } finally {
      setLoading(false)
    }
  }

  // Group chapters
  const introChapters = chapters.filter((c) => c.type === 'intro')
  const wescoChapters = chapters.filter((c) => c.type === 'wesco')
  const dailyJournalChapters = chapters.filter((c) => c.type === 'daily-journal')

  const renderGroup = (label: string, items: MungerChapter[]) => {
    if (items.length === 0 && !chaptersLoading) return null
    return (
      <div className="mb-1">
        <div className="px-4 py-1.5 text-[10px] font-semibold text-stone-600 uppercase tracking-wider border-b border-stone-800/60 bg-stone-900/30">
          {label}
        </div>
        {items.map((ch) => {
          const isSelected = selectedSlug === ch.slug
          const displayText = ch.year ? `${ch.year}` : ch.title
          return (
            <button
              key={ch.slug}
              onClick={() => loadChapter(ch.slug)}
              className={`w-full text-left flex items-center justify-between px-4 py-1.5 text-sm transition-colors ${
                isSelected
                  ? 'bg-amber-500/10 text-amber-400 border-r-2 border-amber-500'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <span>{displayText}</span>
              {isSelected && <ChevronRight className="h-3 w-3 shrink-0" />}
            </button>
          )
        })}
      </div>
    )
  }

  const selectedChapter = chapters.find((c) => c.slug === selectedSlug)

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-40 shrink-0 border-r border-stone-800 bg-[#0a0a0a] flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-400 uppercase tracking-wider">
            <BookOpen className="h-3.5 w-3.5 text-amber-400" />
            芒格之道
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {chaptersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-4 w-4 text-stone-600 animate-spin" />
            </div>
          ) : (
            <>
              {renderGroup('前言', introChapters)}
              {renderGroup('西科金融股东会 (1987-2010)', wescoChapters)}
              {renderGroup('每日期刊股东会 (2014-2022)', dailyJournalChapters)}
            </>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Search bar */}
        <div className="shrink-0 px-6 py-3 border-b border-stone-800 bg-[#0f0f0f]">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSearch(searchQuery)
              if (searchQuery.trim()) router.push(`/munger?q=${encodeURIComponent(searchQuery.trim())}`)
            }}
            className="flex items-center gap-2 max-w-4xl"
          >
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 focus-within:border-amber-500/50 transition-all">
              <Search className="h-4 w-4 text-stone-500 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索芒格讲话内容…"
                className="flex-1 bg-transparent text-sm text-stone-200 placeholder:text-stone-600 outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSearchResults([]) }}
                  className="text-stone-600 hover:text-stone-400"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 font-medium text-sm transition-colors"
            >
              搜索
            </button>
          </form>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          {searching && (
            <div className="flex items-center gap-2 text-stone-500 py-20 justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
              <span className="text-sm">搜索中…</span>
            </div>
          )}

          {!searching && searchResults.length > 0 && (
            <div className="px-6 py-6 w-full space-y-4">
              <p className="text-xs text-stone-500 mb-4">
                找到 <span className="text-amber-400 font-medium">{searchResults.length}</span> 条相关内容
              </p>
              {searchResults.map((hit, i) => (
                <div key={i} className="rounded-xl border border-stone-700/50 bg-stone-900/60 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-stone-700/40">
                    {hit.chapter.year && (
                      <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-0.5">
                        {hit.chapter.year}
                      </span>
                    )}
                    <span className="text-sm text-stone-300">{hit.chapter.title}</span>
                    <span className="ml-auto text-xs text-stone-600 tabular-nums">匹配度 {hit.score}</span>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm text-stone-400 leading-relaxed text-[13px]">
                      &ldquo;{hit.excerpt}&rdquo;
                    </p>
                    <button
                      onClick={() => loadChapter(hit.chapter.slug)}
                      className="mt-2 text-xs text-amber-500 hover:text-amber-300 transition-colors"
                    >
                      阅读全文 →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!searching && searchQuery && searchResults.length === 0 && !selectedSlug && (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <Search className="h-10 w-10 text-stone-700 mb-3" />
              <p className="text-stone-400 font-medium mb-1">未找到相关内容</p>
              <p className="text-stone-600 text-sm">尝试使用其他关键词，或从左侧选择章节直接阅读</p>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-stone-500 py-20 justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
              <span className="text-sm">加载中…</span>
            </div>
          )}

          {!loading && error && (
            <div className="px-6 py-6 max-w-full">
              <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-300 mb-1">无法加载此章节</p>
                  <p className="text-xs text-stone-500 leading-relaxed">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && content && selectedSlug && (
            <div className="px-4 py-8 w-full">
              <div className="mb-8">
                <span className="inline-block text-sm font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-3 py-1 mb-4">
                  芒格之道
                </span>
                <div className="flex items-center gap-3 mb-2">
                  {selectedChapter?.year && (
                    <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1">
                      {selectedChapter.year}
                    </span>
                  )}
                  <h1 className="text-3xl font-bold text-stone-100 leading-tight">{selectedChapter?.title}</h1>
                </div>
              </div>
              <div className="text-[16px] text-stone-300 leading-[1.8] whitespace-pre-wrap break-words w-full">
                {content}
              </div>
            </div>
          )}

          {!searching && !loading && !error && searchResults.length === 0 && !content && (
            <div className="flex flex-col items-center justify-center h-full text-center py-24 px-6">
              <div className="w-16 h-16 rounded-2xl bg-stone-800 border border-stone-700 flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-stone-600" />
              </div>
              <p className="text-stone-400 font-medium mb-1">从左侧选择章节阅读</p>
              <p className="text-stone-600 text-sm">查理·芒格股东会讲话 1987—2022</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MungerPage() {
  return (
    <div className="h-full overflow-hidden">
      <Suspense fallback={
        <div className="flex items-center justify-center h-full text-stone-600">
          <Loader2 className="h-5 w-5 animate-spin mr-2 text-amber-400" />
          <span className="text-sm">加载中…</span>
        </div>
      }>
        <MungerInner />
      </Suspense>
    </div>
  )
}
