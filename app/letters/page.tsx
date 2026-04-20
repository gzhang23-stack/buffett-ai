'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { FileText, Search, ChevronRight, X, Loader2, AlertTriangle } from 'lucide-react'

interface SearchHit {
  year: number
  title: string
  excerpt: string
  score: number
}

// 所有年份分组（有文件的年份由API返回，这里定义两个分组范围）
const PARTNERSHIP_RANGE = { label: '合伙公司致合伙人信', start: 1956, end: 1969 } // 合伙人信：1956-1969
const BERKSHIRE_RANGE = { label: '致伯克希尔股东信', start: 1970, end: 2025 } // 伯克希尔：1970-2024

function LettersInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') ?? ''

  const [availableYears, setAvailableYears] = useState<Set<number>>(new Set())
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [fullText, setFullText] = useState('')
  const [textError, setTextError] = useState('')
  const [loadingText, setLoadingText] = useState(false)
  const [searchQuery, setSearchQuery] = useState(initialQ)
  const [searchResults, setSearchResults] = useState<SearchHit[]>([])
  const [searching, setSearching] = useState(false)
  const [yearsLoading, setYearsLoading] = useState(true)

  // Load year list
  useEffect(() => {
    fetch('/api/search?years=1')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.years)) {
          setAvailableYears(new Set(data.years))
        }
      })
      .catch(() => {})
      .finally(() => setYearsLoading(false))
  }, [])

  // Auto-search if ?q= present
  useEffect(() => {
    if (initialQ) handleSearch(initialQ)
  }, [initialQ]) // eslint-disable-line

  const handleSearch = async (q: string) => {
    const query = q.trim()
    if (!query) { setSearchResults([]); return }
    setSearching(true)
    setSelectedYear(null)
    setFullText('')
    setTextError('')
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setSearchResults(data.results ?? [])
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const loadYear = async (year: number) => {
    if (!availableYears.has(year)) return
    setSelectedYear(year)
    setSearchResults([])
    setSearchQuery('')
    setFullText('')
    setTextError('')
    setLoadingText(true)
    try {
      const res = await fetch(`/api/search?year=${year}`)
      const data = await res.json()
      if (data.error && !data.text) {
        setTextError(data.error)
      } else if (!data.text) {
        setTextError(`${year} 年信件无法加载，请稍后重试。`)
      } else {
        setFullText(data.text)
      }
    } catch {
      setTextError('加载失败，请检查网络后重试。')
    } finally {
      setLoadingText(false)
    }
  }

  // 生成某个范围内的年份按钮列表
  const renderYearGroup = (label: string, start: number, end: number) => {
    const years: number[] = []
    for (let y = start; y <= end; y++) years.push(y)
    const hasAny = years.some((y) => availableYears.has(y))
    if (!hasAny && !yearsLoading) return null

    return (
      <div key={label} className="mb-1">
        <div className="px-4 py-1.5 text-[10px] font-semibold text-stone-600 uppercase tracking-wider border-b border-stone-800/60 bg-stone-900/30">
          {label}
        </div>
        {years.map((year) => {
          const available = availableYears.has(year)
          return (
            <button
              key={year}
              onClick={() => available && loadYear(year)}
              disabled={!available}
              className={`w-full text-left flex items-center justify-between px-4 py-1.5 text-sm transition-colors ${
                selectedYear === year
                  ? 'bg-amber-500/10 text-amber-400 border-r-2 border-amber-500'
                  : available
                  ? 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                  : 'text-stone-700 cursor-not-allowed'
              }`}
            >
              <span>{year}</span>
              {selectedYear === year && <ChevronRight className="h-3 w-3 shrink-0" />}
              {!available && <span className="text-[9px] text-stone-700">—</span>}
            </button>
          )
        })}
      </div>
    )
  }

  const currentTitle = selectedYear
    ? (selectedYear <= 1969
        ? `${selectedYear} 年巴菲特合伙公司致合伙人信`
        : `${selectedYear} 年致伯克希尔·哈撒韦股东信`)
    : ''

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Year list sidebar ── */}
      <aside className="w-44 shrink-0 border-r border-stone-800 bg-[#0a0a0a] flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-400 uppercase tracking-wider">
            <FileText className="h-3.5 w-3.5 text-amber-400" />
            信件列表
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {yearsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-4 w-4 text-stone-600 animate-spin" />
            </div>
          ) : (
            <>
              {renderYearGroup(PARTNERSHIP_RANGE.label, PARTNERSHIP_RANGE.start, PARTNERSHIP_RANGE.end)}
              {renderYearGroup(BERKSHIRE_RANGE.label, BERKSHIRE_RANGE.start, BERKSHIRE_RANGE.end)}
            </>
          )}
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Search bar */}
        <div className="shrink-0 px-6 py-3 border-b border-stone-800 bg-[#0f0f0f]">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSearch(searchQuery)
              if (searchQuery.trim()) router.push(`/letters?q=${encodeURIComponent(searchQuery.trim())}`)
            }}
            className="flex items-center gap-2 max-w-2xl"
          >
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 focus-within:border-amber-500/50 transition-all">
              <Search className="h-4 w-4 text-stone-500 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索信件内容…"
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
          {/* Searching spinner */}
          {searching && (
            <div className="flex items-center gap-2 text-stone-500 py-20 justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
              <span className="text-sm">搜索中…</span>
            </div>
          )}

          {/* Search results */}
          {!searching && searchResults.length > 0 && (
            <div className="px-6 py-6 max-w-3xl space-y-4">
              <p className="text-xs text-stone-500 mb-4">
                找到 <span className="text-amber-400 font-medium">{searchResults.length}</span> 条相关段落
              </p>
              {searchResults.map((hit, i) => (
                <div key={i} className="rounded-xl border border-stone-700/50 bg-stone-900/60 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-stone-700/40">
                    <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-0.5">
                      {hit.year}
                    </span>
                    <span className="text-sm text-stone-300">{hit.title}</span>
                    <span className="ml-auto text-xs text-stone-600 tabular-nums">匹配度 {hit.score}</span>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm text-stone-400 leading-relaxed text-[13px]">
                      &ldquo;{hit.excerpt}&rdquo;
                    </p>
                    <button
                      onClick={() => loadYear(hit.year)}
                      className="mt-2 text-xs text-amber-500 hover:text-amber-300 transition-colors"
                    >
                      阅读全文 →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No search results */}
          {!searching && searchQuery && searchResults.length === 0 && !selectedYear && (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <Search className="h-10 w-10 text-stone-700 mb-3" />
              <p className="text-stone-400 font-medium mb-1">未找到相关内容</p>
              <p className="text-stone-600 text-sm">尝试使用其他关键词，或从左侧选择年份直接阅读</p>
            </div>
          )}

          {/* Loading full text */}
          {loadingText && (
            <div className="flex items-center gap-2 text-stone-500 py-20 justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
              <span className="text-sm">加载信件中…</span>
            </div>
          )}

          {/* Error state */}
          {!loadingText && textError && (
            <div className="px-6 py-6 max-w-2xl">
              <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-300 mb-1">无法加载此年份信件</p>
                  <p className="text-xs text-stone-500 leading-relaxed">{textError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Full letter text */}
          {!loadingText && !textError && fullText && selectedYear && (
            <div className="px-6 py-6 max-w-4xl">
              {/* Header */}
              <div className="mb-6 pb-4 border-b border-stone-800">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1">
                    {selectedYear}
                  </span>
                  <h2 className="text-lg font-semibold text-stone-100">
                    {currentTitle}
                  </h2>
                </div>
                <p className="text-xs text-stone-600 mt-1">
                  中文版 · Warren E. Buffett · {fullText.length.toLocaleString()} 字符
                </p>
              </div>

              {/* Letter content */}
              <div className="text-sm text-stone-300 leading-relaxed whitespace-pre-wrap break-words">
                {fullText}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!searching && !loadingText && !textError && searchResults.length === 0 && !fullText && (
            <div className="flex flex-col items-center justify-center h-full text-center py-24 px-6">
              <div className="w-16 h-16 rounded-2xl bg-stone-800 border border-stone-700 flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-stone-600" />
              </div>
              <p className="text-stone-400 font-medium mb-1">从左侧选择年份阅读信件全文</p>
              <p className="text-stone-600 text-sm">涵盖 1956–2024 年，中文版本</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LettersPage() {
  return (
    <div className="h-full overflow-hidden">
      <Suspense fallback={
        <div className="flex items-center justify-center h-full text-stone-600">
          <Loader2 className="h-5 w-5 animate-spin mr-2 text-amber-400" />
          <span className="text-sm">加载中…</span>
        </div>
      }>
        <LettersInner />
      </Suspense>
    </div>
  )
}
