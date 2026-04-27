'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { BookOpen, Search, X, Loader2, AlertTriangle, ChevronDown, ChevronRight as ChevronRightIcon } from 'lucide-react'

interface ArticleMeta {
  slug: string
  index: number
  part: string
  title: string
}

interface ArticleFull extends ArticleMeta {
  content: string
}

interface PartGroup {
  part: string
  count: number
}

interface SearchResult {
  article: ArticleMeta
  excerpt: string
  score: number
}

function ArticleContent({ article }: { article: ArticleFull }) {
  // 移除文件开头的元数据行（标题：xxx 和 章节：xxx）
  let content = article.content;
  content = content.replace(/^标题：.*\n章节：.*\n\n?/, '');

  // 先合并被截断的行
  const rawLines = content.split('\n');
  const mergedLines: string[] = [];
  let buffer = '';

  for (const line of rawLines) {
    const trimmed = line.trim();

    if (!trimmed) {
      if (buffer) {
        mergedLines.push(buffer);
        buffer = '';
      }
      mergedLines.push('');
      continue;
    }

    // 判断是否需要合并到上一行
    if (buffer) {
      const lastChar = buffer.slice(-1);
      // 只有句号、问号、感叹号才是真正的句子结束
      const isSentenceEnd = ['。', '！', '？'].includes(lastChar);

      // 检查当前行是否是章节标题或小标题
      const isChapterTitle = /^第\d+章$/.test(trimmed);
      const isSubtitle = trimmed.length <= 30 && !trimmed.includes('，') && !trimmed.includes('。') && !trimmed.includes('、');

      // 如果buffer只有1-2个字，强制合并（处理"顾\n沃伦"这种情况）
      const bufferTooShort = buffer.length <= 2;

      // 如果上一行不是句子结束，或buffer太短，且当前行不是标题，则合并
      if ((!isSentenceEnd || bufferTooShort) && !isChapterTitle && !isSubtitle) {
        buffer += trimmed;
        continue;
      }
    }

    if (buffer) mergedLines.push(buffer);
    buffer = trimmed;
  }
  if (buffer) mergedLines.push(buffer);

  // 按段落分割，保留空行作为段落分隔符
  const blocks: string[] = [];
  let currentBlock = '';

  for (const line of mergedLines) {
    if (!line.trim()) {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = '';
      }
    } else {
      if (currentBlock) currentBlock += '\n';
      currentBlock += line;
    }
  }
  if (currentBlock) blocks.push(currentBlock);

  // 渲染每个块
  const renderBlock = (block: string, index: number) => {
    const trimmed = block.trim();

    // 跳过与文章标题重复的章节标题（如文章标题是"第1章"，内容开头也是"第1章"）
    if (index === 0 && /^第\d+章$/.test(trimmed) && trimmed === article.title) {
      return null;
    }

    // 识别章节标题（如 "第10章"）
    if (/^第\d+章$/.test(trimmed)) {
      return (
        <h2 key={index} className="text-2xl md:text-3xl font-bold text-amber-400 mt-12 mb-8 flex items-center gap-3">
          <span className="w-1.5 h-8 bg-amber-500 rounded"></span>
          {trimmed}
        </h2>
      )
    }

    // 识别小标题（如 "兔子都跑哪儿去了？"、"趋利避害的熊蜂"）
    // 条件：长度<=30，不包含逗号、句号、顿号，且不是引言的一部分
    if (trimmed.length <= 30 &&
        !trimmed.includes('，') &&
        !trimmed.includes('。') &&
        !trimmed.includes('、') &&
        !trimmed.includes('查尔斯') &&
        !trimmed.includes('沃伦') &&
        !trimmed.includes('在某些情况下')) {
      return (
        <h3 key={index} className="text-lg md:text-xl font-bold text-stone-200 mt-8 mb-4">
          {trimmed}
        </h3>
      )
    }

    // 识别引用块（达尔文或巴菲特的引言）
    if (trimmed.includes('查尔斯达尔文') || trimmed.includes('沃伦·巴菲特') || trimmed.includes('《物种起源》')) {
      return (
        <div key={index} className="my-6 pl-5 border-l-3 border-amber-500/40 bg-amber-500/5 py-4 rounded-r-lg">
          <p className="text-stone-300 text-base md:text-[16px] leading-relaxed italic">
            {trimmed}
          </p>
        </div>
      )
    }

    // 普通段落
    return (
      <p key={index} className="text-stone-300 text-base md:text-[17px] leading-[1.9] md:leading-[2.0] mb-6">
        {trimmed}
      </p>
    )
  }

  return (
    <div className="px-4 md:px-8 py-8 md:py-12 w-full max-w-2xl mx-auto">
      <div className="mb-8 md:mb-12 pb-6 md:pb-8 border-b border-stone-800/60">
        <span className="inline-block text-[11px] font-semibold text-amber-500/80 bg-amber-500/8 border border-amber-500/15 rounded-full px-3 py-1 mb-4 tracking-widest uppercase">
          {article.part}
        </span>
        <h1 className="text-xl md:text-[26px] font-bold text-stone-100 leading-snug">
          {article.title}
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
  parts,
  articles,
  expandedParts,
  togglePart,
  selectedSlug,
  loadArticle,
  onClose,
}: {
  sidebarLoading: boolean
  parts: PartGroup[]
  articles: ArticleMeta[]
  expandedParts: Set<string>
  togglePart: (part: string) => void
  selectedSlug: string | null
  loadArticle: (slug: string) => void
  onClose?: () => void
}) {
  const articlesByPart = (part: string) => articles.filter(a => a.part === part)

  return (
    <div className="flex-1 overflow-y-auto py-1">
      {sidebarLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-4 w-4 text-stone-600 animate-spin" />
        </div>
      ) : (
        parts.map(partGroup => {
          const isExpanded = expandedParts.has(partGroup.part)
          const partArticles = articlesByPart(partGroup.part)
          return (
            <div key={partGroup.part}>
              <button
                onClick={() => togglePart(partGroup.part)}
                className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-stone-400 hover:text-stone-200 hover:bg-stone-800/50 transition-colors border-b border-stone-800/40"
              >
                {isExpanded
                  ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-amber-500/60" />
                  : <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-stone-600" />
                }
                <span className="flex-1 leading-snug break-words">{partGroup.part}</span>
                <span className="text-xs text-stone-600">{partGroup.count}</span>
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
                        <span className="leading-snug text-left line-clamp-2">{article.title}</span>
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

function DarwinInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') ?? ''

  const [parts, setParts] = useState<PartGroup[]>([])
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
      fetch('/api/darwin?parts=1').then(r => r.json()),
      fetch('/api/darwin?articles=1').then(r => r.json()),
    ]).then(([partsData, articlesData]) => {
      if (Array.isArray(partsData.parts)) {
        setParts(partsData.parts)
        setExpandedParts(new Set(partsData.parts.map((p: PartGroup) => p.part)))
      }
      if (Array.isArray(articlesData.articles)) setArticles(articlesData.articles)
    }).catch(() => {}).finally(() => setSidebarLoading(false))
  }, [])

  useEffect(() => {
    if (initialQ) handleSearch(initialQ)
  }, [initialQ]) // eslint-disable-line

  const togglePart = (part: string) => {
    setExpandedParts(prev => {
      const next = new Set(prev)
      if (next.has(part)) next.delete(part)
      else next.add(part)
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
      const res = await fetch(`/api/darwin?q=${encodeURIComponent(query)}`)
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
      const res = await fetch(`/api/darwin?slug=${encodeURIComponent(slug)}`)
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
            我从达尔文那里学到的投资知识
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

      <aside className="hidden md:flex w-52 shrink-0 border-r border-stone-800 bg-[#0a0a0a] flex-col overflow-hidden">
        <div className="px-4 py-3.5 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-stone-300 tracking-wide">
            <BookOpen className="h-4 w-4 text-amber-400" />
            我从达尔文那里学到的投资知识
          </div>
          <p className="text-xs text-stone-600 mt-1">进化论与投资智慧</p>
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
              if (searchQuery.trim()) router.push(`/darwin?q=${encodeURIComponent(searchQuery.trim())}`)
            }}
            className="flex items-center gap-2 w-full"
          >
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 focus-within:border-amber-500/50 transition-all">
              <Search className="h-4 w-4 text-stone-500 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索达尔文投资智慧…"
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
                      {hit.article.part}
                    </span>
                    <span className="text-sm text-stone-300 truncate">{hit.article.title}</span>
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
              <p className="text-stone-600 text-sm">进化论与投资智慧，共 11 篇</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DarwinPage() {
  return (
    <div className="h-full overflow-hidden">
      <Suspense fallback={
        <div className="flex items-center justify-center h-full text-stone-600">
          <Loader2 className="h-5 w-5 animate-spin mr-2 text-amber-400" />
          <span className="text-sm">加载中…</span>
        </div>
      }>
        <DarwinInner />
      </Suspense>
    </div>
  )
}
