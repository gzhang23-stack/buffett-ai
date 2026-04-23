'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { FileText, Search, ChevronRight, X, Loader2, AlertTriangle, Menu } from 'lucide-react'

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

  const maxCols = lines.reduce((m, l) => {
    if (!l.includes('|')) return m
    return Math.max(m, l.split('|').length)
  }, 1)

  let headerEnd = 1
  if (lines.length > 0 && lines[0].includes('|')) {
    if (lines.length > 1 && lines[1].includes('|')) {
      const secondRow = lines[1]
      const cells = secondRow.split('|').map(c => c.trim())
      const uniqueCells = new Set(cells)
      const hasRepeats = uniqueCells.size < cells.length * 0.7
      const hasUnits = /^\(.*\)|^（.*）/.test(cells[0])
      if (hasRepeats || hasUnits) {
        headerEnd = 2
        if (lines.length > 2 && lines[2].includes('|')) {
          const thirdCells = lines[2].split('|').map(c => c.trim())
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
    <div className="overflow-x-auto my-6 rounded-lg border border-stone-700">
      <table className="w-full text-sm border-collapse">
        <thead>
          {headerRows.map((row, ri) => (
            <tr key={ri} className="bg-stone-800 border-b border-stone-600">
              {row.split('|').map((cell, ci) => (
                <th key={ci} className="px-4 py-2.5 text-left font-semibold text-amber-300 whitespace-nowrap">
                  {cell.trim()}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {bodyRows.map((row, ri) => {
            if (!row.includes('|')) {
              return (
                <tr key={ri} className="bg-stone-800/70 border-b border-stone-700">
                  <td colSpan={maxCols} className="px-4 py-2 text-xs font-semibold text-amber-400/80 uppercase tracking-wide">
                    {row.trim()}
                  </td>
                </tr>
              )
            }
            return (
              <tr key={ri} className={`border-b border-stone-800 ${ri % 2 === 0 ? 'bg-stone-900/40' : 'bg-stone-900/10'} hover:bg-stone-800/60 transition-colors`}>
                {row.split('|').map((cell, ci) => (
                  <td key={ci} className="px-4 py-2.5 text-stone-300 whitespace-nowrap">{cell.trim()}</td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function renderLetterContent(text: string): React.ReactNode[] {
  const TABLE_START = '<<<TABLE>>>'
  const TABLE_END = '<<<ENDTABLE>>>'
  const segments: React.ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    const startIdx = remaining.indexOf(TABLE_START)
    if (startIdx === -1) {
      if (remaining.trim()) {
        remaining.split('\n\n').filter(p => p.trim()).forEach(para => {
          segments.push(<p key={key++} className="break-words mb-6">{para.replace(/\n/g, ' ')}</p>)
        })
      }
      break
    }
    if (startIdx > 0) {
      const before = remaining.slice(0, startIdx)
      if (before.trim()) {
        before.split('\n\n').filter(p => p.trim()).forEach(para => {
          segments.push(<p key={key++} className="break-words mb-6">{para.replace(/\n/g, ' ')}</p>)
        })
      }
    }
    const endIdx = remaining.indexOf(TABLE_END, startIdx)
    if (endIdx === -1) {
      remaining.slice(startIdx).split('\n\n').filter(p => p.trim()).forEach(para => {
        segments.push(<p key={key++} className="break-words mb-6">{para.replace(/\n/g, ' ')}</p>)
      })
      break
    }
    segments.push(<LetterTable key={key++} raw={remaining.slice(startIdx + TABLE_START.length, endIdx)} />)
    remaining = remaining.slice(endIdx + TABLE_END.length)
  }

  return segments
}

// ── Sidebar content (shared between desktop and mobile drawer) ────────────────

function SidebarContent({
  metasLoading,
  partnershipMetas,
  berkshireMetas,
  selectedSlug,
  loadSlug,
  onClose,
}: {
  metasLoading: boolean
  partnershipMetas: LetterMeta[]
  berkshireMetas: LetterMeta[]
  selectedSlug: string | null
  loadSlug: (slug: string) => void
  onClose?: () => void
}) {
  const renderGroup = (label: string, items: LetterMeta[]) => {
    if (items.length === 0 && !metasLoading) return null
    return (
      <div className="mb-1">
        <div className="px-4 py-1.5 text-[10px] font-semibold text-stone-600 uppercase tracking-wider border-b border-stone-800/60 bg-stone-900/30">
          {label}
        </div>
        {items.map((meta) => {
          const isSelected = selectedSlug === meta.slug
          const displayYear = meta.label === '年度信' ? `${meta.year}` : `${meta.year} ${meta.label}`
          return (
            <button
              key={meta.slug}
              onClick={() => { loadSlug(meta.slug); onClose?.() }}
              className={`w-full text-left flex items-center justify-between px-4 py-1.5 text-sm transition-colors ${
                isSelected
                  ? 'bg-amber-500/10 text-amber-400 border-r-2 border-amber-500'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
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

  return (
    <div className="flex-1 overflow-y-auto py-1">
      {metasLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-4 w-4 text-stone-600 animate-spin" />
        </div>
      ) : (
        <>
          {renderGroup('合伙公司致合伙人信', partnershipMetas)}
          {renderGroup('致伯克希尔股东信', berkshireMetas)}
        </>
      )}
    </div>
  )
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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    fetch('/api/search?metas=1')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data.metas)) setMetas(data.metas) })
      .catch(() => {})
      .finally(() => setMetasLoading(false))
  }, [])

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

  const partnershipMetas = metas.filter((m) => m.type === 'partnership')
  const berkshireMetas = metas.filter((m) => m.type === 'berkshire')
  const selectedMeta = metas.find((m) => m.slug === selectedSlug)
  const currentTitle = selectedMeta
    ? (selectedMeta.type === 'partnership'
        ? `${selectedMeta.year} 年巴菲特合伙公司致合伙人信${selectedMeta.label !== '年度信' ? `（${selectedMeta.label}）` : ''}`
        : `${selectedMeta.year} 年致伯克希尔·哈撒韦股东信`)
    : ''

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
            <FileText className="h-4 w-4 text-amber-400" />
            信件列表
          </div>
          <button onClick={() => setMobileSidebarOpen(false)} className="p-1 text-stone-500 hover:text-stone-300">
            <X className="h-4 w-4" />
          </button>
        </div>
        <SidebarContent
          metasLoading={metasLoading}
          partnershipMetas={partnershipMetas}
          berkshireMetas={berkshireMetas}
          selectedSlug={selectedSlug}
          loadSlug={loadSlug}
          onClose={() => setMobileSidebarOpen(false)}
        />
      </div>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-40 shrink-0 border-r border-stone-800 bg-[#0a0a0a] flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-400 uppercase tracking-wider">
            <FileText className="h-3.5 w-3.5 text-amber-400" />
            信件列表
          </div>
        </div>
        <SidebarContent
          metasLoading={metasLoading}
          partnershipMetas={partnershipMetas}
          berkshireMetas={berkshireMetas}
          selectedSlug={selectedSlug}
          loadSlug={loadSlug}
        />
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Floating menu button (mobile only, always shown) */}
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="md:hidden fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-900 shadow-xl flex flex-col items-center justify-center transition-all active:scale-95"
        >
          <FileText className="h-5 w-5" />
          <span className="text-[9px] font-semibold mt-0.5">目录</span>
        </button>

        {/* Search bar */}
        <div className="shrink-0 px-3 md:px-4 py-3 border-b border-stone-800 bg-[#0f0f0f]">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSearch(searchQuery)
              if (searchQuery.trim()) router.push(`/letters?q=${encodeURIComponent(searchQuery.trim())}`)
            }}
            className="flex items-center gap-2 w-full"
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
                    <p className="text-sm text-stone-400 leading-relaxed text-[13px]">&ldquo;{hit.excerpt}&rdquo;</p>
                    <button onClick={() => loadSlug(String(hit.year))} className="mt-2 text-xs text-amber-500 hover:text-amber-300 transition-colors">
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
              <p className="text-stone-600 text-sm">尝试使用其他关键词，或点击目录选择年份直接阅读</p>
            </div>
          )}

          {loadingText && (
            <div className="flex items-center gap-2 text-stone-500 py-20 justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
              <span className="text-sm">加载信件中…</span>
            </div>
          )}

          {!loadingText && textError && (
            <div className="px-4 md:px-6 py-6 max-w-full">
              <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-300 mb-1">无法加载此信件</p>
                  <p className="text-xs text-stone-500 leading-relaxed">{textError}</p>
                </div>
              </div>
            </div>
          )}

          {!loadingText && !textError && fullText && selectedSlug && (
            <div className="px-4 md:px-8 py-8 md:py-12 w-full max-w-2xl mx-auto">
              <div className="mb-8 md:mb-12 pb-6 md:pb-8 border-b border-stone-800/60">
                <span className="inline-block text-[11px] font-semibold text-amber-500/80 bg-amber-500/8 border border-amber-500/15 rounded-full px-3 py-1 mb-4 tracking-widest uppercase">
                  {selectedMeta?.type === 'partnership' ? '巴菲特合伙公司' : '伯克希尔·哈撒韦'}
                </span>
                <h1 className="text-xl md:text-[26px] font-bold text-stone-100 leading-snug mb-3">
                  {currentTitle}
                </h1>
              </div>
              <div className="text-base md:text-[17px] text-stone-300 leading-[1.9] md:leading-[2.0]">
                {renderLetterContent(fullText)}
              </div>
            </div>
          )}

          {!searching && !loadingText && !textError && searchResults.length === 0 && !fullText && (
            <div className="flex flex-col items-center justify-center h-full text-center py-24 px-6">
              <div className="w-16 h-16 rounded-2xl bg-stone-800 border border-stone-700 flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-stone-600" />
              </div>
              <p className="text-stone-400 font-medium mb-1">点击右下角目录选择信件</p>
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
