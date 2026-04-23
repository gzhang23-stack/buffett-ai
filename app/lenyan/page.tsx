'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { BookMarked, Search, ChevronRight, X, Loader2, AlertTriangle } from 'lucide-react'

interface LenyanArticle {
  slug: string
  title: string
  date: string
  index: number
}

interface SearchResult {
  article: LenyanArticle
  excerpt: string
  score: number
}

// ── 内容渲染 ──────────────────────────────────────────────────────────────────

// Chinese sentence-ending punctuation — a line ending with these is complete
const SENTENCE_END = /[。！？…」』"'）\)～～]$/

function smartMergeLines(rawLines: string[]): string[] {
  // Merge lines that were broken mid-sentence (book-style line wrapping).
  // A line is "continued" if it does NOT end with sentence-ending punctuation.
  // Blank lines always force a paragraph break.
  const paragraphs: string[] = []
  let buf = ''

  for (const raw of rawLines) {
    const line = raw.trim()
    if (!line) {
      if (buf) { paragraphs.push(buf); buf = '' }
      continue
    }
    if (!buf) {
      buf = line
    } else if (SENTENCE_END.test(buf)) {
      // Previous line was complete — start a new paragraph segment
      paragraphs.push(buf)
      buf = line
    } else {
      // Previous line was cut mid-sentence — glue directly (no space for Chinese)
      buf += line
    }
  }
  if (buf) paragraphs.push(buf)
  return paragraphs
}

function renderContent(text: string): React.ReactNode[] {
  const rawLines = text.split(/\n/).map(l => l.trim())
  const chunks = smartMergeLines(rawLines)
  const nodes: React.ReactNode[] = []

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    if (!chunk) continue

    // Circled number lists ①②③
    if (/[①②③④⑤⑥⑦⑧⑨]/.test(chunk)) {
      const parts = chunk.split(/(?=[①②③④⑤⑥⑦⑧⑨])/)
      const leadText = parts[0].trim()
      const listItems = parts.slice(1)
      if (listItems.length > 0) {
        if (leadText) {
          nodes.push(
            <p key={`${i}-lead`} className="text-stone-300 text-[17px] leading-[2.0] mb-5">
              {leadText}
            </p>
          )
        }
        nodes.push(
          <div key={`${i}-list`} className="my-5 space-y-3 pl-3 border-l-2 border-amber-500/30">
            {listItems.map((item, j) => (
              <div key={j} className="flex gap-3">
                <span className="shrink-0 w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] flex items-center justify-center mt-[4px] font-semibold">
                  {j + 1}
                </span>
                <p className="text-stone-300 text-[17px] leading-[2.0] flex-1">{item.slice(1).trim()}</p>
              </div>
            ))}
          </div>
        )
        continue
      }
    }

    // Short heading: ≤20 chars, no sentence-ending punctuation, no digit start
    const isHeading = chunk.length <= 20 && !SENTENCE_END.test(chunk) && !chunk.endsWith('，') && !chunk.endsWith('、') && !/^\d/.test(chunk)
    if (isHeading) {
      nodes.push(
        <h3 key={i} className="text-[15px] font-semibold text-amber-300/90 mt-10 mb-4 leading-snug tracking-wide">
          {chunk}
        </h3>
      )
      continue
    }

    // Normal paragraph
    nodes.push(
      <p key={i} className="text-stone-300 text-[17px] leading-[2.0] mb-6">
        {chunk}
      </p>
    )
  }

  return nodes
}

function LenyanInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') ?? ''

  const [articles, setArticles] = useState<LenyanArticle[]>([])
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [selectedArticle, setSelectedArticle] = useState<LenyanArticle | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState(initialQ)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [articlesLoading, setArticlesLoading] = useState(true)

  useEffect(() => {
    fetch('/api/lenyan?articles=1')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data.articles)) setArticles(data.articles) })
      .catch(() => {})
      .finally(() => setArticlesLoading(false))
  }, [])

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
      const res = await fetch(`/api/lenyan?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setSearchResults(data.results ?? [])
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const loadArticle = async (slug: string) => {
    setSelectedSlug(slug)
    setSearchResults([])
    setSearchQuery('')
    setContent('')
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`/api/lenyan?slug=${encodeURIComponent(slug)}`)
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else if (!data.content) {
        setError('文章无法加载')
      } else {
        setContent(data.content)
        setSelectedArticle(data.article)
      }
    } catch {
      setError('加载失败，请检查网络')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-40 shrink-0 border-r border-stone-800 bg-[#0a0a0a] flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-400 uppercase tracking-wider">
            <BookMarked className="h-3.5 w-3.5 text-amber-400" />
            冷眼分享集
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {articlesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-4 w-4 text-stone-600 animate-spin" />
            </div>
          ) : (
            <div className="mb-1">
              <div className="px-4 py-1.5 text-[10px] font-semibold text-stone-600 uppercase tracking-wider border-b border-stone-800/60 bg-stone-900/30">
                共 {articles.length} 篇文章
              </div>
              {articles.map((article) => {
                const isSelected = selectedSlug === article.slug
                return (
                  <button
                    key={article.slug}
                    onClick={() => loadArticle(article.slug)}
                    className={`w-full text-left flex items-center justify-between px-4 py-2 text-xs transition-colors ${
                      isSelected
                        ? 'bg-amber-500/10 text-amber-400 border-r-2 border-amber-500'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                    }`}
                  >
                    <span className="truncate leading-snug">{article.title}</span>
                    {isSelected && <ChevronRight className="h-3 w-3 shrink-0 ml-1" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Search bar */}
        <div className="shrink-0 px-4 py-3 border-b border-stone-800 bg-[#0f0f0f]">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSearch(searchQuery)
              if (searchQuery.trim()) router.push(`/lenyan?q=${encodeURIComponent(searchQuery.trim())}`)
            }}
            className="flex items-center gap-2 w-full"
          >
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 focus-within:border-amber-500/50 transition-all">
              <Search className="h-4 w-4 text-stone-500 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索文章内容…"
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
            <div className="px-4 py-6 w-full space-y-4">
              <p className="text-xs text-stone-500 mb-4">
                找到 <span className="text-amber-400 font-medium">{searchResults.length}</span> 条相关文章
              </p>
              {searchResults.map((hit, i) => (
                <div key={i} className="rounded-xl border border-stone-700/50 bg-stone-900/60 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-stone-700/40">
                    <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-0.5">
                      第 {hit.article.index + 1} 篇
                    </span>
                    <span className="text-sm text-stone-300">{hit.article.title}</span>
                    <span className="ml-auto text-xs text-stone-600 tabular-nums">匹配度 {hit.score}</span>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm text-stone-400 leading-relaxed text-[13px]">
                      &ldquo;{hit.excerpt}&rdquo;
                    </p>
                    <button
                      onClick={() => loadArticle(hit.article.slug)}
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
              <p className="text-stone-600 text-sm">尝试其他关键词，或从左侧选择文章阅读</p>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-stone-500 py-20 justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
              <span className="text-sm">加载中…</span>
            </div>
          )}

          {!loading && error && (
            <div className="px-4 py-6 w-full">
              <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-300 mb-1">无法加载此文章</p>
                  <p className="text-xs text-stone-500 leading-relaxed">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && content && selectedSlug && (
            <div className="px-8 py-12 w-full max-w-2xl mx-auto">
              {/* Article header */}
              <div className="mb-12 pb-8 border-b border-stone-800/60">
                <span className="inline-block text-[11px] font-semibold text-amber-500/80 bg-amber-500/8 border border-amber-500/15 rounded-full px-3 py-1 mb-6 tracking-widest uppercase">
                  冷眼分享集 · 第 {(selectedArticle?.index ?? 0) + 1} 篇
                </span>
                <h1 className="text-[26px] font-bold text-stone-100 leading-snug mb-4">
                  {selectedArticle?.title}
                </h1>
                <p className="text-[13px] text-stone-600 tracking-wide">{selectedArticle?.date}</p>
              </div>
              {/* Article body */}
              <div>
                {renderContent(content)}
              </div>
            </div>
          )}

          {!searching && !loading && !error && searchResults.length === 0 && !content && (
            <div className="flex flex-col items-center justify-center h-full text-center py-24 px-6">
              <div className="w-16 h-16 rounded-2xl bg-stone-800 border border-stone-700 flex items-center justify-center mb-4">
                <BookMarked className="h-8 w-8 text-stone-600" />
              </div>
              <p className="text-stone-400 font-medium mb-1">从左侧选择文章阅读</p>
              <p className="text-stone-600 text-sm">冷眼 30 年股票投资分享，共 91 篇</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LenyanPage() {
  return (
    <div className="h-full overflow-hidden">
      <Suspense fallback={
        <div className="flex items-center justify-center h-full text-stone-600">
          <Loader2 className="h-5 w-5 animate-spin mr-2 text-amber-400" />
          <span className="text-sm">加载中…</span>
        </div>
      }>
        <LenyanInner />
      </Suspense>
    </div>
  )
}
