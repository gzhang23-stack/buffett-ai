'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { BookOpen, Search, X, Loader2, AlertTriangle, ChevronDown, ChevronRight as ChevronRightIcon, Menu } from 'lucide-react'

interface ArticleMeta {
  slug: string
  index: number
  title_en: string
  title_zh: string
  part_en: string
  part_zh: string
}

interface Entry {
  meeting: string | null
  lines: string[]
}

interface ArticleFull extends ArticleMeta {
  entries: Entry[]
}

interface Part {
  part_en: string
  part_zh: string
  count: number
}

interface SearchResult {
  article: ArticleMeta
  excerpt: string
  score: number
}

// ── 内容渲染 ────────────────────────────────────────────────────────────────

function ArticleContent({ article }: { article: ArticleFull }) {
  return (
    <div className="px-4 md:px-8 py-8 md:py-12 w-full max-w-2xl mx-auto">
      <div className="mb-8 md:mb-12 pb-6 md:pb-8 border-b border-stone-800/60">
        <span className="inline-block text-[11px] font-semibold text-amber-500/80 bg-amber-500/8 border border-amber-500/15 rounded-full px-3 py-1 mb-4 tracking-widest uppercase">
          {article.part_zh}
        </span>
        <h1 className="text-xl md:text-[26px] font-bold text-stone-100 leading-snug mb-2">
          {article.title_zh}
        </h1>
        <p className="text-sm text-stone-500 italic">{article.title_en}</p>
      </div>

      <div className="space-y-10">
        {article.entries.map((entry, i) => (
          <div key={i}>
            {entry.meeting && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[11px] font-semibold text-amber-400/70 bg-amber-500/8 border border-amber-500/15 rounded px-2.5 py-1 tracking-wide">
                  {entry.meeting}
                </span>
              </div>
            )}
            <div className="space-y-5">
              {entry.lines.map((line, j) => {
                const speakerMatch = line.match(/^((?:Warren Buffett|Charlie Munger|WB|CM|巴菲特|芒格)[：:]\s*)(.*)/)
                if (speakerMatch) {
                  const speaker = speakerMatch[1].replace(/[：:].*/, '').trim()
                  const isBuffett = speaker.includes('Buffett') || speaker === 'WB' || speaker.includes('巴菲特')
                  const body = speakerMatch[2]
                  return (
                    <div key={j} className="flex gap-3">
                      <span className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded mt-[3px] h-fit ${
                        isBuffett
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                          : 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                      }`}>
                        {isBuffett ? '巴' : '芒'}
                      </span>
                      <p className="text-stone-300 text-base md:text-[17px] leading-[1.9] md:leading-[2.0] flex-1">{body}</p>
                    </div>
                  )
                }
                return (
                  <p key={j} className="text-stone-300 text-base md:text-[17px] leading-[1.9] md:leading-[2.0]">
                    {line}
                  </p>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Sidebar content ──────────────────────────────────────────────────────────

function SidebarContent({
  sidebarLoading,
  parts,
  articles,
  expandedParts,
  togglePart,
  selectedSlug,
  loadArticle,
  onClose,
}: {
  sidebarLoading: boolean
  parts: Part[]
  articles: ArticleMeta[]
  expandedParts: Set<string>
  togglePart: (part_en: string) => void
  selectedSlug: string | null
  loadArticle: (slug: string) => void
  onClose?: () => void
}) {
  const articlesByPart = (part_en: string) => articles.filter(a => a.part_en === part_en)

  return (
    <div className="flex-1 overflow-y-auto py-1">
      {sidebarLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-4 w-4 text-stone-600 animate-spin" />
        </div>
      ) : (
        parts.map(part => {
          const isExpanded = expandedParts.has(part.part_en)
          const partArticles = articlesByPart(part.part_en)
          return (
            <div key={part.part_en}>
              <button
                onClick={() => togglePart(part.part_en)}
                className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-stone-400 hover:text-stone-200 hover:bg-stone-800/50 transition-colors border-b border-stone-800/40"
              >
                {isExpanded
                  ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-amber-500/60" />
                  : <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-stone-600" />
                }
                <span className="flex-1 truncate leading-snug">{part.part_zh}</span>
                <span className="text-xs text-stone-600">{part.count}</span>
              </button>
              {isExpanded && (
                <div className="bg-stone-900/20">
                  {partArticles.map(article => {
                    const isSelected = selectedSlug === article.slug
                    return (
                      <button
                        key={article.slug}
                        onClick={() => { loadArticle(article.slug); onClose?.() }}
                        className={`w-full text-left flex items-center gap-1 px-5 py-2 text-sm transition-colors ${
                          isSelected
                            ? 'bg-amber-500/10 text-amber-400 border-r-2 border-amber-500'
                            : 'text-stone-500 hover:text-stone-200 hover:bg-stone-800/60'
                        }`}
                      >
                        <span className="leading-snug text-left">{article.title_zh}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

// ── 主组件 ──────────────────────────────────────────────────────────────────

function UnscriptedInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') ?? ''

  const [parts, setParts] = useState<Part[]>([])
  const [articles, setArticles] = useState<ArticleMeta[]>([])
  const [expandedParts, setExpandedParts] = useState<Set<string>>(new Set())
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [articleDetail, setArticleDetail] = useState<ArticleFull | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState(initialQ)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [sidebarLoading, setSidebarLoading] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/unscripted?parts=1').then(r => r.json()),
      fetch('/api/unscripted?articles=1').then(r => r.json()),
    ]).then(([partsData, articlesData]) => {
      if (Array.isArray(partsData.parts)) setParts(partsData.parts)
      if (Array.isArray(articlesData.articles)) setArticles(articlesData.articles)
    }).catch(() => {}).finally(() => setSidebarLoading(false))
  }, [])

  useEffect(() => {
    if (initialQ) handleSearch(initialQ)
  }, [initialQ]) // eslint-disable-line

  const togglePart = (part_en: string) => {
    setExpandedParts(prev => {
      const next = new Set(prev)
      if (next.has(part_en)) next.delete(part_en)
      else next.add(part_en)
      return next
    })
  }

  const handleSearch = async (q: string) => {
    const query = q.trim()
    if (!query) { setSearchResults([]); return }
    setSearching(true)
    setSelectedSlug(null)
    setArticleDetail(null)
    setError('')
    try {
      const res = await fetch(`/api/unscripted?q=${encodeURIComponent(query)}`)
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
    setArticleDetail(null)
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`/api/unscripted?slug=${encodeURIComponent(slug)}`)
      const data = await res.json()
      if (data.error) setError(data.error)
      else setArticleDetail(data.article)
    } catch {
      setError('加载失败，请检查网络')
    } finally {
      setLoading(false)
    }
  }

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
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-stone-300 tracking-wide">
            <BookOpen className="h-4 w-4 text-amber-400" />
            巴芒年会精选
          </div>
          <button onClick={() => setMobileSidebarOpen(false)} className="p-1 text-stone-500 hover:text-stone-300">
            <X className="h-4 w-4" />
          </button>
        </div>
        <SidebarContent
          sidebarLoading={sidebarLoading}
          parts={parts}
          articles={articles}
          expandedParts={expandedParts}
          togglePart={togglePart}
          selectedSlug={selectedSlug}
          loadArticle={loadArticle}
          onClose={() => setMobileSidebarOpen(false)}
        />
      </div>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-52 shrink-0 border-r border-stone-800 bg-[#0a0a0a] flex-col overflow-hidden">
        <div className="px-4 py-3.5 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-stone-300 tracking-wide">
            <BookOpen className="h-4 w-4 text-amber-400" />
            巴芒年会精选
          </div>
          <p className="text-xs text-stone-600 mt-1">Berkshire Annual Meeting Q&amp;A</p>
        </div>
        <SidebarContent
          sidebarLoading={sidebarLoading}
          parts={parts}
          articles={articles}
          expandedParts={expandedParts}
          togglePart={togglePart}
          selectedSlug={selectedSlug}
          loadArticle={loadArticle}
        />
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Floating menu button (mobile only, shown when reading content) */}
        {articleDetail && (
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-900 shadow-xl flex flex-col items-center justify-center transition-all active:scale-95"
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-[9px] font-semibold mt-0.5">目录</span>
          </button>
        )}

        {/* Search bar */}
        <div className="shrink-0 px-3 md:px-4 py-3 border-b border-stone-800 bg-[#0f0f0f]">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSearch(searchQuery)
              if (searchQuery.trim()) router.push(`/unscripted?q=${encodeURIComponent(searchQuery.trim())}`)
            }}
            className="flex items-center gap-2 w-full"
          >
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 focus-within:border-amber-500/50 transition-all">
              <Search className="h-4 w-4 text-stone-500 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索巴菲特、芒格语录…"
                className="flex-1 bg-transparent text-sm text-stone-200 placeholder:text-stone-600 outline-none"
              />
              {searchQuery && (
                <button type="button" onClick={() => { setSearchQuery(''); setSearchResults([]) }} className="text-stone-600 hover:text-stone-400">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button type="submit" className="px-3 md:px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 font-medium text-sm transition-colors shrink-0">
              搜索
            </button>
          </form>
        </div>

        {/* Content */}
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
                找到 <span className="text-amber-400 font-medium">{searchResults.length}</span> 条相关内容
              </p>
              {searchResults.map((hit, i) => (
                <div key={i} className="rounded-xl border border-stone-700/50 bg-stone-900/60 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-stone-700/40">
                    <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-0.5">
                      {hit.article.part_zh}
                    </span>
                    <span className="text-sm text-stone-300">{hit.article.title_zh}</span>
                    <span className="ml-auto text-[10px] text-stone-600 italic">{hit.article.title_en}</span>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm text-stone-400 leading-relaxed text-[13px]">{hit.excerpt}</p>
                    <button onClick={() => loadArticle(hit.article.slug)} className="mt-2 text-xs text-amber-500 hover:text-amber-300 transition-colors">
                      阅读全文 →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-stone-500 py-20 justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
              <span className="text-sm">加载中…</span>
            </div>
          )}

          {!loading && error && (
            <div className="px-4 py-6">
              <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && articleDetail && (
            <ArticleContent article={articleDetail} />
          )}

          {!searching && !loading && !error && searchResults.length === 0 && !articleDetail && (
            <div className="flex flex-col items-center justify-center h-full text-center py-24 px-6">
              <div className="w-16 h-16 rounded-2xl bg-stone-800 border border-stone-700 flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-stone-600" />
              </div>
              <p className="text-stone-400 font-medium mb-1">点击左上角目录选择主题</p>
              <p className="text-stone-600 text-sm">巴菲特与芒格股东大会问答精华，共 226 篇</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function UnscriptedPage() {
  return (
    <div className="h-full overflow-hidden">
      <Suspense fallback={
        <div className="flex items-center justify-center h-full text-stone-600">
          <Loader2 className="h-5 w-5 animate-spin mr-2 text-amber-400" />
          <span className="text-sm">加载中…</span>
        </div>
      }>
        <UnscriptedInner />
      </Suspense>
    </div>
  )
}
