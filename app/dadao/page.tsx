'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { BookOpen, Search, X, Loader2, AlertTriangle, ChevronDown, ChevronRight as ChevronRightIcon } from 'lucide-react'

interface ArticleMeta {
  slug: string
  index: number
  chapter: string
  section: string
}

interface ArticleFull extends ArticleMeta {
  content: string
}

interface Chapter {
  chapter: string
  count: number
}

interface SearchResult {
  article: ArticleMeta
  excerpt: string
  score: number
}

function ArticleContent({ article }: { article: ArticleFull }) {
  // 按段落分割，保留空行作为段落分隔符
  const rawLines = article.content.split('\n')
  const blocks: string[] = []
  let currentBlock = ''

  for (const line of rawLines) {
    const trimmed = line.trim()
    if (!trimmed) {
      // 空行，结束当前块
      if (currentBlock) {
        blocks.push(currentBlock)
        currentBlock = ''
      }
    } else {
      // 非空行，添加到当前块
      if (currentBlock) currentBlock += '\n'
      currentBlock += trimmed
    }
  }
  if (currentBlock) blocks.push(currentBlock)

  // 渲染每个块
  const renderBlock = (block: string, index: number) => {
    const trimmed = block.trim()

    // 识别"网友："开头的问题
    if (trimmed.startsWith('网友：') || trimmed.startsWith('网友:')) {
      const question = trimmed.replace(/^网友[：:]\s*/, '')
      return (
        <div key={index} className="my-8 pl-5 border-l-3 border-blue-500/40 bg-blue-500/5 py-4 rounded-r-lg">
          <div className="flex items-start gap-3">
            <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
              问
            </span>
            <p className="text-stone-300 text-base md:text-[16px] leading-relaxed flex-1">
              {question}
            </p>
          </div>
        </div>
      )
    }

    // 识别编号列表（如 "1. 基本版"）
    if (/^\d+\.\s+/.test(trimmed)) {
      return (
        <h3 key={index} className="text-lg md:text-xl font-bold text-amber-400 mt-10 mb-5 flex items-center gap-2">
          <span className="w-1 h-6 bg-amber-500 rounded"></span>
          {trimmed}
        </h3>
      )
    }

    // 识别日期标注（如 "(2012-04-05)"）
    if (/^\(\d{4}-\d{2}-\d{2}\)$/.test(trimmed)) {
      return (
        <div key={index} className="text-right my-4">
          <span className="text-xs text-stone-500 bg-stone-800/60 px-3 py-1.5 rounded-full border border-stone-700">
            {trimmed}
          </span>
        </div>
      )
    }

    // 多行块：按句子分段
    const sentences = trimmed.split(/([。！？])/g)
    let paragraph = ''
    const paragraphs: string[] = []

    for (let i = 0; i < sentences.length; i += 2) {
      const sentence = sentences[i] + (sentences[i + 1] || '')
      paragraph += sentence

      // 每3-4句或遇到换行符就分段
      if (paragraph.split(/[。！？]/).length > 3 || sentence.includes('\n')) {
        if (paragraph.trim()) {
          paragraphs.push(paragraph.trim())
          paragraph = ''
        }
      }
    }
    if (paragraph.trim()) paragraphs.push(paragraph.trim())

    // 如果只有一个段落且较短，直接返回
    if (paragraphs.length === 1 && paragraphs[0].length < 200) {
      return (
        <p key={index} className="text-stone-300 text-base md:text-[17px] leading-[1.9] md:leading-[2.0] mb-6">
          {paragraphs[0]}
        </p>
      )
    }

    // 多个段落
    return (
      <div key={index} className="space-y-5 mb-6">
        {paragraphs.map((para, i) => (
          <p key={i} className="text-stone-300 text-base md:text-[17px] leading-[1.9] md:leading-[2.0]">
            {para}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="px-4 md:px-8 py-8 md:py-12 w-full max-w-2xl mx-auto">
      <div className="mb-8 md:mb-12 pb-6 md:pb-8 border-b border-stone-800/60">
        <span className="inline-block text-[11px] font-semibold text-amber-500/80 bg-amber-500/8 border border-amber-500/15 rounded-full px-3 py-1 mb-4 tracking-widest uppercase">
          {article.chapter}
        </span>
        <h1 className="text-xl md:text-[26px] font-bold text-stone-100 leading-snug">
          {article.section}
        </h1>
      </div>
      <div>
        {blocks.map((block, i) => renderBlock(block, i))}
      </div>
    </div>
  )
}

function SidebarContent({
  sidebarLoading,
  chapters,
  articles,
  expandedChapters,
  toggleChapter,
  selectedSlug,
  loadArticle,
  onClose,
}: {
  sidebarLoading: boolean
  chapters: Chapter[]
  articles: ArticleMeta[]
  expandedChapters: Set<string>
  toggleChapter: (chapter: string) => void
  selectedSlug: string | null
  loadArticle: (slug: string) => void
  onClose?: () => void
}) {
  const articlesByChapter = (chapter: string) => articles.filter(a => a.chapter === chapter)

  return (
    <div className="flex-1 overflow-y-auto py-1">
      {sidebarLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-4 w-4 text-stone-600 animate-spin" />
        </div>
      ) : (
        chapters.map(chapter => {
          const isExpanded = expandedChapters.has(chapter.chapter)
          const chapterArticles = articlesByChapter(chapter.chapter)
          return (
            <div key={chapter.chapter}>
              <button
                onClick={() => toggleChapter(chapter.chapter)}
                className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-stone-400 hover:text-stone-200 hover:bg-stone-800/50 transition-colors border-b border-stone-800/40"
              >
                {isExpanded
                  ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-amber-500/60" />
                  : <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-stone-600" />
                }
                <span className="flex-1 leading-snug break-words">{chapter.chapter}</span>
                <span className="text-xs text-stone-600">{chapter.count}</span>
              </button>
              {isExpanded && (
                <div className="bg-stone-900/20">
                  {chapterArticles.map(article => {
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
                        <span className="leading-snug text-left line-clamp-2">{article.section}</span>
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

function DadaoInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') ?? ''

  const [chapters, setChapters] = useState<Chapter[]>([])
  const [articles, setArticles] = useState<ArticleMeta[]>([])
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set())
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
      fetch('/api/dadao?chapters=1').then(r => r.json()),
      fetch('/api/dadao?articles=1').then(r => r.json()),
    ]).then(([chaptersData, articlesData]) => {
      if (Array.isArray(chaptersData.chapters)) {
        setChapters(chaptersData.chapters)
        setExpandedChapters(new Set(chaptersData.chapters.map((c: Chapter) => c.chapter)))
      }
      if (Array.isArray(articlesData.articles)) setArticles(articlesData.articles)
    }).catch(() => {}).finally(() => setSidebarLoading(false))
  }, [])

  useEffect(() => {
    if (initialQ) handleSearch(initialQ)
  }, [initialQ]) // eslint-disable-line

  const toggleChapter = (chapter: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev)
      if (next.has(chapter)) next.delete(chapter)
      else next.add(chapter)
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
      const res = await fetch(`/api/dadao?q=${encodeURIComponent(query)}`)
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
      const res = await fetch(`/api/dadao?slug=${encodeURIComponent(slug)}`)
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
      {mobileSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-64 flex flex-col border-r border-stone-800 bg-[#0a0a0a] transition-transform duration-200 ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-stone-300 tracking-wide">
            <BookOpen className="h-4 w-4 text-amber-400" />
            大道—段永平投资问答录
          </div>
          <button onClick={() => setMobileSidebarOpen(false)} className="p-1 text-stone-500 hover:text-stone-300">
            <X className="h-4 w-4" />
          </button>
        </div>
        <SidebarContent
          sidebarLoading={sidebarLoading}
          chapters={chapters}
          articles={articles}
          expandedChapters={expandedChapters}
          toggleChapter={toggleChapter}
          selectedSlug={selectedSlug}
          loadArticle={loadArticle}
          onClose={() => setMobileSidebarOpen(false)}
        />
      </div>

      <aside className="hidden md:flex w-52 shrink-0 border-r border-stone-800 bg-[#0a0a0a] flex-col overflow-hidden">
        <div className="px-4 py-3.5 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-stone-300 tracking-wide">
            <BookOpen className="h-4 w-4 text-amber-400" />
            大道—段永平投资问答录
          </div>
          <p className="text-xs text-stone-600 mt-1">投资逻辑篇</p>
        </div>
        <SidebarContent
          sidebarLoading={sidebarLoading}
          chapters={chapters}
          articles={articles}
          expandedChapters={expandedChapters}
          toggleChapter={toggleChapter}
          selectedSlug={selectedSlug}
          loadArticle={loadArticle}
        />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="md:hidden fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-900 shadow-xl flex flex-col items-center justify-center transition-all active:scale-95"
        >
          <BookOpen className="h-5 w-5" />
          <span className="text-[9px] font-semibold mt-0.5">目录</span>
        </button>

        <div className="shrink-0 px-3 md:px-4 py-3 border-b border-stone-800 bg-[#0f0f0f]">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSearch(searchQuery)
              if (searchQuery.trim()) router.push(`/dadao?q=${encodeURIComponent(searchQuery.trim())}`)
            }}
            className="flex items-center gap-2 w-full"
          >
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 focus-within:border-amber-500/50 transition-all">
              <Search className="h-4 w-4 text-stone-500 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索投资问答内容…"
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
                    <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-0.5 shrink-0">
                      {hit.article.chapter}
                    </span>
                    <span className="text-sm text-stone-300 truncate">{hit.article.section}</span>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[13px] text-stone-400 leading-relaxed">{hit.excerpt}</p>
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
              <p className="text-stone-400 font-medium mb-1">点击右下角目录选择章节阅读</p>
              <p className="text-stone-600 text-sm">段永平投资智慧精华，共 27 篇</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DadaoPage() {
  return (
    <div className="h-full overflow-hidden">
      <Suspense fallback={
        <div className="flex items-center justify-center h-full text-stone-600">
          <Loader2 className="h-5 w-5 animate-spin mr-2 text-amber-400" />
          <span className="text-sm">加载中…</span>
        </div>
      }>
        <DadaoInner />
      </Suspense>
    </div>
  )
}
