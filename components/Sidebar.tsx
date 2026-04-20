'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, MessageSquare, Search, FileText, Lightbulb, Building2, Users, TrendingUp } from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  { href: '/', label: '首页总览', icon: TrendingUp },
  { href: '/letters', label: '伯克希尔股东信', icon: FileText, badge: '67' },
  { href: '/chat', label: 'AI 智能问答', icon: MessageSquare },
  { href: '/concepts', label: '核心概念', icon: Lightbulb, badge: '20' },
  { href: '/companies', label: '关联公司', icon: Building2, badge: '12' },
  { href: '/people', label: '关键人物', icon: Users, badge: '5' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [searchValue, setSearchValue] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      window.location.href = `/letters?q=${encodeURIComponent(searchValue.trim())}`
    }
  }

  return (
    <aside className="w-56 shrink-0 flex flex-col border-r border-stone-800 bg-[#0a0a0a]">
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
            巴菲特知识库
          </div>
          <div className="text-[10px] text-stone-500">1977 – 2024</div>
        </div>
      </Link>

      {/* Search */}
      <form onSubmit={handleSearch} className="px-3 pt-3">
        <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-stone-900 border border-stone-700 focus-within:border-amber-500/50 transition-all">
          <Search className="h-3.5 w-3.5 text-stone-500 shrink-0" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="搜索信件内容…"
            className="flex-1 bg-transparent text-xs text-stone-300 placeholder:text-stone-600 outline-none min-w-0"
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
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all group ${
                active
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-stone-500 hover:text-stone-200 hover:bg-stone-800 border border-transparent'
              }`}
            >
              <Icon
                className={`h-3.5 w-3.5 shrink-0 ${
                  active ? 'text-amber-400' : 'text-stone-600 group-hover:text-stone-400'
                }`}
              />
              <span className="flex-1 truncate">{label}</span>
              {badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    active
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-stone-800 text-stone-600 border border-stone-700'
                  }`}
                >
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-stone-800">
        <p className="text-[10px] text-stone-600">由 DeepSeek AI 驱动</p>
        <p className="text-[10px] text-stone-700 mt-0.5">数据覆盖 1956–2024 年</p>
      </div>
    </aside>
  )
}
