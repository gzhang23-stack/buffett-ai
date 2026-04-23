import Link from 'next/link'
import {
  BookOpen,
  MessageSquare,
  FileText,
  Lightbulb,
  Building2,
  Users,
  ArrowRight,
  TrendingUp,
  Calendar,
} from 'lucide-react'

// ─── Static Data ──────────────────────────────────────────────────────────────

const CONCEPTS = [
  '内在价值', '护城河', '复利', '安全边际', '长期持有', '能力圈',
  '先生市场', '价值投资', '浮存金', '品牌溢价', '管理层诚信', '股东权益',
  '资本配置', '留存收益', '集中投资', '耐心等待', '反向思维', '企业文化',
  '定价权', '经济特许权',
]

const COMPANIES = [
  { name: '可口可乐', desc: '消费品护城河典范', since: '1988' },
  { name: '美国运通', desc: '品牌与网络效应', since: '1964' },
  { name: '苹果公司', desc: '最大持仓，消费生态', since: '2016' },
  { name: 'GEICO 保险', desc: '保险浮存金核心', since: '1996' },
  { name: "See's Candies", desc: '定价权教科书案例', since: '1972' },
  { name: '伯灵顿北方铁路', desc: '基础设施护城河', since: '2010' },
]

const PEOPLE = [
  {
    name: '沃伦·巴菲特',
    title: '伯克希尔·哈撒韦 CEO',
    desc: '"奥马哈先知"，价值投资集大成者，管理伯克希尔逾半世纪。',
    years: '1965–至今',
  },
  {
    name: '查理·芒格',
    title: '伯克希尔·哈撒韦 副董事长',
    desc: '多元思维框架的倡导者，巴菲特的长期合作伙伴。',
    years: '1978–2023',
  },
  {
    name: '格雷格·阿贝尔',
    title: '伯克希尔·哈撒韦 接班人',
    desc: '负责管理伯克希尔非保险业务，被巴菲特钦点为继承人。',
    years: '2018–至今',
  },
  {
    name: '本杰明·格雷厄姆',
    title: '价值投资之父',
    desc: '《证券分析》与《聪明的投资者》作者，巴菲特的导师与精神源泉。',
    years: '1894–1976',
  },
]

const FEATURE_CARDS = [
  {
    href: '/letters',
    icon: FileText,
    title: '信件浏览',
    desc: '按年份阅读 1956–2024 年全部信件中文版',
    className: 'border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10',
    iconClass: 'text-blue-400',
  },
  {
    href: '/chat',
    icon: MessageSquare,
    title: 'AI 对话',
    desc: '向 AI 提问，基于原文即时检索并生成回答',
    className: 'border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10',
    iconClass: 'text-amber-400',
  },
  {
    href: '/concepts',
    icon: Lightbulb,
    title: '概念速查',
    desc: '20 个核心投资概念，提炼自数十年的智慧',
    className: 'border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10',
    iconClass: 'text-purple-400',
  },
  {
    href: '/companies',
    icon: Building2,
    title: '公司研究',
    desc: '伯克希尔旗下及投资的 12 家关联公司',
    className: 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10',
    iconClass: 'text-emerald-400',
  },
  {
    href: '/people',
    icon: Users,
    title: '人物洞察',
    desc: '巴菲特及影响他的关键人物',
    className: 'border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10',
    iconClass: 'text-rose-400',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="min-h-full px-8 py-10 max-w-5xl mx-auto space-y-14">

        {/* ── Hero ── */}
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
            <BookOpen className="h-3.5 w-3.5" />
            价值投资知识库
          </div>
          <h1 className="text-4xl font-bold text-stone-100 leading-tight">
            探索<span className="text-amber-400">价值投资</span>大师们的<br />投资智慧
          </h1>
          <p className="text-stone-400 text-lg max-w-2xl leading-relaxed">
            收录巴菲特、芒格、格雷厄姆等价值投资大师的经典著作与智慧精华。
            通过 AI 问答、原文浏览、概念速查，深入理解价值投资的核心理念。
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 pt-2">
            {[
              { icon: FileText, label: '年份覆盖', value: '1956–2024' },
              { icon: Calendar, label: '信件数量', value: '约 68 封' },
              { icon: TrendingUp, label: '年化收益', value: '19.8%' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <div className="text-xs text-stone-500">{label}</div>
                  <div className="text-sm font-semibold text-stone-200">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Feature Cards ── */}
        <section>
          <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-4">功能入口</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FEATURE_CARDS.map(({ href, icon: Icon, title, desc, className, iconClass }) => (
              <Link
                key={href}
                href={href}
                className={`group flex flex-col gap-3 p-5 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${className}`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-stone-800/80 flex items-center justify-center">
                    <Icon className={`h-4 w-4 ${iconClass}`} />
                  </div>
                  <ArrowRight className="h-4 w-4 text-stone-600 group-hover:text-stone-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-stone-100">{title}</div>
                  <div className="text-xs text-stone-500 mt-1 leading-relaxed">{desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── AI Chat CTA ── */}
        <section className="relative rounded-2xl border border-amber-500/20 bg-amber-500/5 overflow-hidden p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-1 space-y-2">
              <div className="text-xs text-amber-500 font-medium uppercase tracking-wider">AI 智能问答</div>
              <h3 className="text-xl font-semibold text-stone-100">向价值投资大师提问</h3>
              <p className="text-sm text-stone-400 leading-relaxed max-w-lg">
                AI 助手基于原始文献即时检索相关段落，用大师自己的话回答你的问题。
                支持多轮对话，所有回答均标注文献来源。
              </p>
            </div>
            <Link
              href="/chat"
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold text-sm transition-colors"
            >
              开始对话
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* ── Concept Tag Cloud ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-widest">核心投资概念</h2>
            <Link href="/concepts" className="text-xs text-stone-600 hover:text-amber-400 flex items-center gap-1 transition-colors">
              查看全部 <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {CONCEPTS.map((concept) => (
              <Link
                key={concept}
                href={`/chat?q=${encodeURIComponent(concept)}`}
                className="px-3 py-1.5 rounded-full text-sm border border-stone-700 bg-stone-900/60 text-stone-400
                           hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-300 transition-all"
              >
                {concept}
              </Link>
            ))}
          </div>
        </section>

        {/* ── Company Cards ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-widest">关联公司</h2>
            <Link href="/companies" className="text-xs text-stone-600 hover:text-amber-400 flex items-center gap-1 transition-colors">
              查看全部 <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {COMPANIES.map((co) => (
              <Link
                key={co.name}
                href="/companies"
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-stone-700/50 bg-stone-900/50 hover:bg-stone-800/60 hover:border-stone-600 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center shrink-0">
                  <Building2 className="h-3.5 w-3.5 text-stone-500 group-hover:text-amber-400 transition-colors" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-stone-200 truncate">{co.name}</div>
                  <div className="text-xs text-stone-600 truncate">{co.desc}</div>
                </div>
                <span className="shrink-0 text-[10px] text-stone-700 ml-auto">{co.since}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── People Cards ── */}
        <section className="pb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-widest">关键人物</h2>
            <Link href="/people" className="text-xs text-stone-600 hover:text-amber-400 flex items-center gap-1 transition-colors">
              查看全部 <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {PEOPLE.map((person) => (
              <Link
                key={person.name}
                href="/people"
                className="flex gap-4 p-4 rounded-xl border border-stone-700/50 bg-stone-900/50 hover:bg-stone-800/60 hover:border-stone-600 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Users className="h-4 w-4 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-stone-200">{person.name}</span>
                    <span className="text-[10px] text-stone-600 bg-stone-800 border border-stone-700 px-1.5 py-0.5 rounded">{person.years}</span>
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">{person.title}</div>
                  <p className="text-xs text-stone-600 mt-1.5 leading-relaxed line-clamp-2">{person.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
