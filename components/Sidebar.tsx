'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, MessageSquare, Search, FileText, Lightbulb, Building2, Users, TrendingUp, Menu, X, BookMarked, Mic } from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  { href: '/letters', label: '伯克希尔股东信', icon: FileText, badge: '68' },
  { href: '/unscripted', label: '巴芒年会精选', icon: Mic, badge: '226' },
  { href: '/munger-dao', label: '芒格之道', icon: BookMarked, badge: '25' },
  { href: '/duan-biz', label: '段永平商业逻辑', icon: BookOpen, badge: '40' },
  { href: '/duan-invest', label: '段永平投资逻辑', icon: BookOpen, badge: '30' },
  { href: '/chat', label: 'AI 智能问答', icon: MessageSquare },
  { href: '/concepts', label: '核心概念', icon: Lightbulb, badge: '20' },
  { href: '/people', label: '关键人物', icon: Users, badge: '15' },
]

function NavContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const [searchValue, setSearchValue] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      window.location.href = `/letters?q=${encodeURIComponent(searchValue.trim())}`
      onClose?.()
    }
  }

  return (
    <>
      {/* Search */}
      <form onSubmit={handleSearch} className="px-3 pt-4">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-stone-900 border border-stone-700 focus-within:border-amber-500/50 transition-all">
          <Search className="h-4 w-4 text-stone-500 shrink-0" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="搜索信件内容…"
            className="flex-1 bg-transparent text-sm text-stone-300 placeholder:text-stone-600 outline-none min-w-0"
          />
        </div>
      </form>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-2 px-2.5 py-2.5 rounded-lg text-sm transition-all group ${
                active
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800 border border-transparent'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-amber-400' : 'text-stone-500 group-hover:text-stone-300'}`} />
              <span className="flex-1 font-medium break-words leading-snug">{label}</span>
              {badge && (
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full shrink-0 ${
                  active ? 'bg-amber-500/20 text-amber-400' : 'bg-stone-800 text-stone-500 border border-stone-700'
                }`}>
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-stone-800">
        <p className="text-xs text-stone-600">由 DeepSeek AI 驱动</p>
        <p className="text-xs text-stone-700 mt-0.5">价值投资知识库</p>
      </div>
    </>
  )
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* ── 移动端顶部栏 ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 h-14 border-b border-stone-800 bg-[#0a0a0a]">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-500 flex items-center justify-center shrink-0">
            <BookOpen className="h-3.5 w-3.5 text-stone-900" />
          </div>
          <span className="text-sm font-semibold text-stone-100">价值投资知识库</span>
        </Link>
      </div>

      {/* ── 移动端抽屉遮罩 ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── 移动端抽屉侧边栏 ── */}
      <div className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-64 flex flex-col border-r border-stone-800 bg-[#0a0a0a] transition-transform duration-200 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* 抽屉头部 */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-stone-800">
          <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-stone-900" />
            </div>
            <div>
              <div className="text-sm font-semibold text-stone-100">价值投资知识库</div>
              <div className="text-[10px] text-stone-500">价值投资知识库</div>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-300 hover:bg-stone-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <NavContent onClose={() => setMobileOpen(false)} />
      </div>

      {/* ── 桌面端固定侧边栏 ── */}
      <aside className="hidden md:flex w-52 shrink-0 flex-col border-r border-stone-800 bg-[#0a0a0a]">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 px-4 py-4 border-b border-stone-800 hover:bg-stone-900 transition-colors group"
        >
          <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
            <BookOpen className="h-4 w-4 text-stone-900" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-stone-100 group-hover:text-amber-400 transition-colors">
              价值投资知识库
            </div>
            <div className="text-[10px] text-stone-500">Value Investing</div>
          </div>
        </Link>
        <NavContent />
      </aside>
    </>
  )
}
