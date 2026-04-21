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

interface LetterMeta {
  slug: string
  year: number
  label: string
  type: 'partnership' | 'berkshire'
}

// ── Table rendering ──────────────────────────────────────────────────────────

function LetterTable({ raw }: { raw: string }) {
  const lines = raw.trim().split('\n').filter((l) => l.trim().length > 0)
  if (lines.length === 0) return null

  // Determine max column count from pipe-delimited rows
  const maxCols = lines.reduce((m, l) => {
    if (!l.includes('|')) return m
    return Math.max(m, l.split('|').length)
  }, 1)

  // Detect header rows: first row is always header if it has pipes
  // Additional rows are headers only if they look like sub-headers (not data)
  let headerEnd = 1 // At least first row
  if (lines.length > 0 && lines[0].includes('|')) {
    // Check if second row is also a header (e.g., "合计|合计|..." or "(千美元)|1984|...")
    if (lines.length > 1 && lines[1].includes('|')) {
      const secondRow = lines[1]
      // If second row has mostly repeated words or units, it's a sub-header
      const cells = secondRow.split('|').map(c => c.trim())
      const uniqueCells = new Set(cells)
      const hasRepeats = uniqueCells.size < cells.length * 0.7
      const hasUnits = /^\(.*\)|^（.*）/.test(cells[0]) // First cell is unit like "(千美元)"
      if (hasRepeats || hasUnits) {
        headerEnd = 2
        // Check third row too
        if (lines.length > 2 && lines[2].includes('|')) {
          const thirdRow = lines[2]
          const thirdCells = thirdRow.split('|').map(c => c.trim())
          // If third row is years/numbers pattern, it's still header
          if (thirdCells.every(c => /^\d{4}$|^（.*）/.test(c) || c.length < 8)) {
            headerEnd = 3
          }
        }
      }
    }
  }
  const headerRows = lines.slice(0, headerEnd)
  const bodyRows = lines.slice(headerEnd)

  return (
    <div className="overflow-x-auto my-6 rounded-lg border border-stone-300 shadow-sm">
      <table className="w-full text-sm border-collapse">
        <thead>
          {headerRows.map((row, ri) => (
            <tr key={ri} className="bg-stone-100 border-b border-stone-300">
              {row.split('|').map((cell, ci) => (
                <th
                  key={ci}
                  className="px-4 py-2.5 text-left font-semibold text-stone-700 whitespace-nowrap"
                >
                  {cell.trim()}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {bodyRows.map((row, ri) => {
            if (!row.includes('|')) {
              // Group label row — span all columns
              return (
                <tr key={ri} className="bg-stone-50 border-b border-stone-200">
                  <td
                    colSpan={maxCols}
                    className="px-4 py-2 text-xs font-semibold text-stone-600 uppercase tracking-wide"
                  >
                    {row.trim()}
                  </td>
                </tr>
              )
            }
            return (
              <tr
                key={ri}
                className={`border-b border-stone-200 ${
                  ri % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'
                } hover:bg-stone-100/60 transition-colors`}
              >
                {row.split('|').map((cell, ci) => (
                  <td key={ci} className="px-4 py-2.5 text-stone-700 whitespace-nowrap">
                    {cell.trim()}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/** 把含 <<<TABLE>>> 标记的纯文本渲染为段落 + 样式化表格的 React 节点数组 */
function renderLetterContent(text: string): React.ReactNode[] {
  const TABLE_START = '<<<TABLE>>>'
  const TABLE_END = '<<<ENDTABLE>>>'
  const segments: React.ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    const startIdx = remaining.indexOf(TABLE_START)
    if (startIdx === -1) {
      // No more tables — render remaining text
      if (remaining.trim()) {
        segments.push(
          <span key={key++} className="whitespace-pre-wrap">
            {remaining}
          </span>
        )
      }
      break
    }

    // Text before table
    if (startIdx > 0) {
      const before = remaining.slice(0, startIdx)
      if (before.trim()) {
        segments.push(
          <span key={key++} className="whitespace-pre-wrap">
            {before}
          </span>
        )
      }
    }

    // Extract table block
    const endIdx = remaining.indexOf(TABLE_END, startIdx)
    if (endIdx === -1) {
      // Malformed — treat rest as text
      segments.push(
        <span key={key++} className="whitespace-pre-wrap">
          {remaining.slice(startIdx)}
        </span>
      )
      break
    }

    const tableRaw = remaining.slice(startIdx + TABLE_START.length, endIdx)
    segments.push(<LetterTable key={key++} raw={tableRaw} />)

    remaining = remaining.slice(endIdx + TABLE_END.length)
  }

  return segments
}

function LettersInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') ?? ''

  const [metas, setMetas] = useState<LetterMeta[]>([])
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [fullText, setFullText] = useState('')
  const [textError, setTextError] = useState('')
  const [loadingText, setLoadingText] = useState(false)
  const [searchQuery, setSearchQuery] = useState(initialQ)
  const [searchResults, setSearchResults] = useState<SearchHit[]>([])
  const [searching, setSearching] = useState(false)
  const [metasLoading, setMetasLoading] = useState(true)

  // Load letter metadata list
  useEffect(() => {
    fetch('/api/search?metas=1')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data.metas)) setMetas(data.metas) })
      .catch(() => {})
      .finally(() => setMetasLoading(false))
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

  const loadSlug = async (slug: string) => {
    setSelectedSlug(slug)
    setSearchResults([])
    setSearchQuery('')
    setFullText('')
    setTextError('')
    setLoadingText(true)
    try {
      const res = await fetch(`/api/search?slug=${encodeURIComponent(slug)}`)
      const data = await res.json()
      if (data.error && !data.text) {
        setTextError(data.error)
      } else if (!data.text) {
        setTextError('信件无法加载，请稍后重试。')
      } else {
        setFullText(data.text)
      }
    } catch {
      setTextError('加载失败，请检查网络后重试。')
    } finally {
      setLoadingText(false)
    }
  }

  // 按 type 分组
  const partnershipMetas = metas.filter((m) => m.type === 'partnership')
  const berkshireMetas = metas.filter((m) => m.type === 'berkshire')

  const renderGroup = (label: string, items: LetterMeta[]) => {
    if (items.length === 0 && !metasLoading) return null
    return (
      <div className="mb-1">
        <div className="px-4 py-1.5 text-[10px] font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-200 bg-stone-50">
          {label}
        </div>
        {items.map((meta) => {
          const isSelected = selectedSlug === meta.slug
          // 侧边栏显示：纯年份文件显示年份数字，子信件显示 "1961 年中" 格式
          const displayYear = meta.label === '年度信' ? `${meta.year}` : `${meta.year} ${meta.label}`
          return (
            <button
              key={meta.slug}
              onClick={() => loadSlug(meta.slug)}
              className={`w-full text-left flex items-center justify-between px-4 py-1.5 text-sm transition-colors ${
                isSelected
                  ? 'bg-amber-50 text-amber-700 border-r-2 border-amber-500'
                  : 'text-stone-600 hover:text-stone-800 hover:bg-stone-50'
              }`}
            >
              <span className={meta.label !== '年度信' ? 'text-xs' : ''}>{displayYear}</span>
              {isSelected && <ChevronRight className="h-3 w-3 shrink-0" />}
            </button>
          )
        })}
      </div>
    )
  }

  const selectedMeta = metas.find((m) => m.slug === selectedSlug)
  const currentTitle = selectedMeta
    ? (selectedMeta.type === 'partnership'
        ? `${selectedMeta.year} 年巴菲特合伙公司致合伙人信${selectedMeta.label !== '年度信' ? `（${selectedMeta.label}）` : ''}`
        : `${selectedMeta.year} 年致伯克希尔·哈撒韦股东信`)
    : ''

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-48 shrink-0 border-r border-stone-300 bg-white flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-300 shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 uppercase tracking-wider">
            <FileText className="h-3.5 w-3.5 text-amber-600" />
            信件列表
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {metasLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-4 w-4 text-stone-400 animate-spin" />
            </div>
          ) : (
            <>
              {renderGroup('合伙公司致合伙人信', partnershipMetas)}
              {renderGroup('致伯克希尔股东信', berkshireMetas)}
            </>
          )}
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Search bar */}
        <div className="shrink-0 px-6 py-3 border-b border-stone-300 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSearch(searchQuery)
              if (searchQuery.trim()) router.push(`/letters?q=${encodeURIComponent(searchQuery.trim())}`)
            }}
            className="flex items-center gap-2 max-w-2xl"
          >
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 focus-within:border-amber-500/50 transition-all">
              <Search className="h-4 w-4 text-stone-500 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索信件内容…"
                className="flex-1 bg-transparent text-sm text-stone-800 placeholder:text-stone-400 outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSearchResults([]) }}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-medium text-sm transition-colors"
            >
              搜索
            </button>
          </form>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          {searching && (
            <div className="flex items-center gap-2 text-stone-500 py-20 justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
              <span className="text-sm">搜索中…</span>
            </div>
          )}

          {!searching && searchResults.length > 0 && (
            <div className="px-6 py-6 max-w-3xl space-y-4">
              <p className="text-xs text-stone-500 mb-4">
                找到 <span className="text-amber-600 font-medium">{searchResults.length}</span> 条相关段落
              </p>
              {searchResults.map((hit, i) => (
                <div key={i} className="rounded-xl border border-stone-300 bg-white overflow-hidden shadow-sm">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-stone-200 bg-stone-50">
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">
                      {hit.year}
                    </span>
                    <span className="text-sm text-stone-700">{hit.title}</span>
                    <span className="ml-auto text-xs text-stone-500 tabular-nums">匹配度 {hit.score}</span>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm text-stone-600 leading-relaxed text-[13px]">
                      &ldquo;{hit.excerpt}&rdquo;
                    </p>
                    <button
                      onClick={() => loadSlug(String(hit.year))}
                      className="mt-2 text-xs text-amber-600 hover:text-amber-700 transition-colors"
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
              <Search className="h-10 w-10 text-stone-300 mb-3" />
              <p className="text-stone-600 font-medium mb-1">未找到相关内容</p>
              <p className="text-stone-400 text-sm">尝试使用其他关键词，或从左侧选择年份直接阅读</p>
            </div>
          )}

          {loadingText && (
            <div className="flex items-center gap-2 text-stone-500 py-20 justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
              <span className="text-sm">加载信件中…</span>
            </div>
          )}

          {!loadingText && textError && (
            <div className="px-6 py-6 max-w-2xl">
              <div className="flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-700 mb-1">无法加载此信件</p>
                  <p className="text-xs text-red-600 leading-relaxed">{textError}</p>
                </div>
              </div>
            </div>
          )}

          {!loadingText && !textError && fullText && selectedSlug && (
            <div className="px-8 py-8 max-w-4xl">
              <div className="mb-8">
                <span className="inline-block text-sm font-semibold text-amber-700 bg-amber-100 border border-amber-300 rounded px-3 py-1 mb-4">
                  合伙人信
                </span>
                <h1 className="text-2xl font-bold text-stone-800 mb-2 leading-tight">
                  {currentTitle}
                </h1>
              </div>
              <div className="prose prose-stone max-w-none text-[15px] text-stone-700 leading-[1.8]">
                {renderLetterContent(fullText)}
              </div>
            </div>
          )}

          {!searching && !loadingText && !textError && searchResults.length === 0 && !fullText && (
            <div className="flex flex-col items-center justify-center h-full text-center py-24 px-6">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-300 flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-stone-400" />
              </div>
              <p className="text-stone-600 font-medium mb-1">从左侧选择信件阅读全文</p>
              <p className="text-stone-400 text-sm">涵盖 1956–2024 年，中文版本</p>
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
        <div className="flex items-center justify-center h-full text-stone-500">
          <Loader2 className="h-5 w-5 animate-spin mr-2 text-amber-500" />
          <span className="text-sm">加载中…</span>
        </div>
      }>
        <LettersInner />
      </Suspense>
    </div>
  )
}
