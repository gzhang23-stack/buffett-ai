import Link from 'next/link'
import {
  BookOpen,
  MessageSquare,
  FileText,
  Lightbulb,
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
    name: '本杰明·格雷厄姆',
    title: '价值投资之父',
    desc: '《证券分析》与《聪明的投资者》作者，巴菲特的导师与精神源泉。',
    years: '1894–1976',
  },
  {
    name: '菲利普·费雪',
    title: '成长股投资先驱',
    desc: '"闲聊法"创始人，影响巴菲特从廉价股转向优质企业投资。',
    years: '1907–2004',
  },
  {
    name: '彼得·林奇',
    title: '富达麦哲伦基金经理',
    desc: '13年年化29%，"买你了解的"投资哲学践行者。',
    years: '1977–1990',
  },
  {
    name: '李录',
    title: '喜马拉雅资本 创始人',
    desc: '芒格家族资金管理人，将比亚迪引荐给伯克希尔，"中国的巴菲特"。',
    years: '1998–至今',
  },
  {
    name: '冷眼（冯时能）',
    title: '马来西亚股坛宗师',
    desc: '30年实战著成《30年股票投资心得》，华语价值投资第一人。',
    years: '1973–至今',
  },
]

const FEATURE_CARDS = [
  {
    href: '/letters',
    icon: FileText,
    title: '伯克希尔股东信',
    desc: '1956–2024 年巴菲特致股东信 100 封',
    className: 'border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10',
    iconClass: 'text-blue-400',
  },
  {
    href: '/unscripted',
    icon: MessageSquare,
    title: '巴芒年会精选',
    desc: '226 篇股东大会问答精华，原汁原味',
    className: 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10',
    iconClass: 'text-emerald-400',
  },
  {
    href: '/munger-dao',
    icon: Lightbulb,
    title: '芒格之道',
    desc: '25 篇芒格演讲与访谈，多元思维模型',
    className: 'border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10',
    iconClass: 'text-purple-400',
  },
  {
    href: '/dyp',
    icon: BookOpen,
    title: '段永平投资问答录',
    desc: '27 篇投资逻辑问答，本分投资实践',
    className: 'border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10',
    iconClass: 'text-amber-400',
  },
  {
    href: '/dadao',
    icon: BookOpen,
    title: '大道—段永平投资问答录',
    desc: '35 篇段永平投资智慧精选，2006-2025',
    className: 'border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10',
    iconClass: 'text-orange-400',
  },
  {
    href: '/chat',
    icon: MessageSquare,
    title: 'AI 智能问答',
    desc: '基于原文检索，即时生成专业解答',
    className: 'border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10',
    iconClass: 'text-rose-400',
  },
  {
    href: '/concepts',
    icon: Lightbulb,
    title: '核心概念',
    desc: '20+ 个价值投资关键概念速查',
    className: 'border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10',
    iconClass: 'text-cyan-400',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="min-h-full px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 max-w-5xl mx-auto space-y-10 sm:space-y-12 md:space-y-14">

        {/* ── Hero ── */}
        <section className="space-y-4 sm:space-y-5 md:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
            <BookOpen className="h-3.5 w-3.5" />
            价值投资知识库
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-100 leading-tight">
            汇聚<span className="text-amber-400">价值投资</span>大师智慧<br className="hidden sm:block" />
            <span className="sm:hidden"> </span>探索长期投资之道
          </h1>
          <p className="text-stone-400 text-base sm:text-lg max-w-2xl leading-relaxed">
            收录巴菲特股东信、芒格演讲、段永平问答等价值投资经典文献。
            通过 AI 智能问答、原文检索、概念速查，系统学习价值投资理念与实践。
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 sm:gap-6 pt-2">
            {[
              { icon: FileText, label: '文献收录', value: '701+ 篇' },
              { icon: Calendar, label: '时间跨度', value: '1956–2024' },
              { icon: TrendingUp, label: '核心概念', value: '20+ 个' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center">
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400" />
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
        <section className="relative rounded-2xl border border-amber-500/20 bg-amber-500/5 overflow-hidden p-5 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="flex-1 space-y-2">
              <div className="text-xs text-amber-500 font-medium uppercase tracking-wider">AI 智能问答</div>
              <h3 className="text-lg sm:text-xl font-semibold text-stone-100">与价值投资大师对话</h3>
              <p className="text-sm text-stone-400 leading-relaxed max-w-lg">
                基于巴菲特、芒格、段永平等大师的原始文献，AI 助手即时检索相关段落并生成专业解答。
                支持多轮对话，所有回答均标注文献来源。
              </p>
            </div>
            <Link
              href="/chat"
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold text-sm transition-colors w-full sm:w-auto justify-center"
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


        {/* ── People Cards ── */}
        <section className="pb-6 sm:pb-8 md:pb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-widest">关键人物</h2>
            <Link href="/people" className="text-xs text-stone-600 hover:text-amber-400 flex items-center gap-1 transition-colors">
              查看全部 <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PEOPLE.map((person) => (
              <Link
                key={person.name}
                href="/people"
                className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-stone-700/50 bg-stone-900/50 hover:bg-stone-800/60 hover:border-stone-600 transition-all"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400" />
                </div>
                <div className="min-w-0 flex-1">
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
