'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, MessageSquare, Search, FileText, Lightbulb, Building2, Users, TrendingUp, Menu, X } from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  { href: '/', label: '首页总览', icon: TrendingUp },
  { href: '/letters', label: '伯克希尔股东信', icon: FileText, badge: '68' },
  { href: '/munger', label: '芒格之道', icon: BookOpen, badge: '26' },
  { href: '/chat', label: 'AI 智能问答', icon: MessageSquare },
  { href: '/concepts', label: '核心概念', icon: Lightbulb, badge: '20' },
  { href: '/companies', label: '关联公司', icon: Building2, badge: '12' },
  { href: '/people', label: '关键人物', icon: Users, badge: '5' },
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
      <form onSubmit={handleSearch} className="px-3 pt-3">
        <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-stone-50 border border-stone-300 focus-within:border-amber-500/50 transition-all">
          <Search className="h-3.5 w-3.5 text-stone-400 shrink-0" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="搜索信件内容…"
            className="flex-1 bg-transparent text-xs text-stone-700 placeholder:text-stone-400 outline-none min-w-0"
          />
        </div>
      </form>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all group ${
                active
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'text-stone-600 hover:text-stone-800 hover:bg-stone-50 border border-transparent'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-amber-600' : 'text-stone-400 group-hover:text-stone-600'}`} />
              <span className="flex-1 truncate">{label}</span>
              {badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  active ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-500 border border-stone-200'
                }`}>
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-stone-200">
        <p className="text-[10px] text-stone-500">由 DeepSeek AI 驱动</p>
        <p className="text-[10px] text-stone-400 mt-0.5">数据覆盖 1956–2024 年</p>
      </div>
    </>
  )
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* ── 移动端顶部栏 ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 h-14 border-b border-stone-300 bg-white">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-lg text-stone-600 hover:text-stone-800 hover:bg-stone-50 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-500 flex items-center justify-center shrink-0">
            <BookOpen className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-stone-800">巴菲特知识库</span>
        </Link>
      </div>

      {/* ── 移动端抽屉遮罩 ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── 移动端抽屉侧边栏 ── */}
      <div className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-64 flex flex-col border-r border-stone-300 bg-white transition-transform duration-200 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* 抽屉头部 */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-stone-300">
          <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-stone-800">巴菲特知识库</div>
              <div className="text-[10px] text-stone-500">1956 – 2024</div>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-700 hover:bg-stone-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <NavContent onClose={() => setMobileOpen(false)} />
      </div>

      {/* ── 桌面端固定侧边栏 ── */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-stone-300 bg-white">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 px-4 py-4 border-b border-stone-300 hover:bg-stone-50 transition-colors group"
        >
          <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-stone-800 group-hover:text-amber-600 transition-colors">
              巴菲特知识库
            </div>
            <div className="text-[10px] text-stone-500">1956 – 2024</div>
          </div>
        </Link>
        <NavContent />
      </aside>
    </>
  )
}
