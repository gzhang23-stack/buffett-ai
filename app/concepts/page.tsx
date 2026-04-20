import Link from 'next/link'
import { Lightbulb, ArrowRight, MessageSquare } from 'lucide-react'

const CONCEPTS = [
  {
    name: '内在价值',
    en: 'Intrinsic Value',
    desc: '一家企业在其余下的寿命中可以产生的现金流量的折现值。巴菲特认为这是衡量投资价值的根本标准，而非股价。',
    quote: '价格是你支付的，价值是你得到的。',
    year: '1992',
    color: 'from-amber-500/10 to-amber-600/5',
    border: 'border-amber-500/20',
    tag: 'tag-amber',
  },
  {
    name: '护城河',
    en: 'Economic Moat',
    desc: '企业拥有的持久竞争优势，能够长期保护其超额利润免受竞争侵蚀。包括品牌、网络效应、成本优势、转换成本等。',
    quote: '我们寻找那些有着宽广和持久护城河的企业。',
    year: '1995',
    color: 'from-blue-500/10 to-blue-600/5',
    border: 'border-blue-500/20',
    tag: 'tag-blue',
  },
  {
    name: '复利',
    en: 'Compounding',
    desc: '巴菲特称之为"雪球效应"。将收益不断再投资，使本金随时间呈指数级增长。时间是复利的朋友。',
    quote: '生活就像滚雪球，重要的是找到很湿的雪和很长的山坡。',
    year: '2008',
    color: 'from-emerald-500/10 to-emerald-600/5',
    border: 'border-emerald-500/20',
    tag: 'tag-emerald',
  },
  {
    name: '安全边际',
    en: 'Margin of Safety',
    desc: '以远低于内在价值的价格买入，为判断失误或市场不确定性提供缓冲保护。这是格雷厄姆价值投资的核心原则。',
    quote: '规则一：永远不要亏损。规则二：永远不要忘记规则一。',
    year: '1977',
    color: 'from-rose-500/10 to-rose-600/5',
    border: 'border-rose-500/20',
    tag: 'tag-rose',
  },
  {
    name: '长期持有',
    en: 'Long-term Holding',
    desc: '买入并长期持有优质企业，让时间发挥复利效应。巴菲特最喜欢的持有期限是"永远"。',
    quote: '如果你不愿意拥有一只股票十年，就不要考虑拥有它十分钟。',
    year: '1996',
    color: 'from-purple-500/10 to-purple-600/5',
    border: 'border-purple-500/20',
    tag: 'tag-purple',
  },
  {
    name: '能力圈',
    en: 'Circle of Competence',
    desc: '只投资自己真正理解的业务领域。了解自己能力边界比扩大边界更重要，在能力圈内做决策可大幅降低风险。',
    quote: '投资成功的关键不在于你知道多少，而在于你能否清醒地认识到自己不知道什么。',
    year: '1996',
    color: 'from-cyan-500/10 to-cyan-600/5',
    border: 'border-cyan-500/20',
    tag: 'tag-cyan',
  },
  {
    name: '先生市场',
    en: 'Mr. Market',
    desc: '格雷厄姆提出的比喻：市场每天报价，情绪极端波动。聪明的投资者利用市场的非理性，而非被其主导。',
    quote: '在别人贪婪时恐惧，在别人恐惧时贪婪。',
    year: '1987',
    color: 'from-orange-500/10 to-orange-600/5',
    border: 'border-orange-500/20',
    tag: 'tag-orange',
  },
  {
    name: '浮存金',
    en: 'Float',
    desc: '保险公司收取的保费与理赔支出之间的时间差产生的资金。伯克希尔利用这笔"免费资金"进行长期投资，是其商业模式的核心。',
    quote: '保险浮存金是我们最宝贵的资产之一。',
    year: '2001',
    color: 'from-indigo-500/10 to-indigo-600/5',
    border: 'border-indigo-500/20',
    tag: 'tag-indigo',
  },
  {
    name: '资本配置',
    en: 'Capital Allocation',
    desc: '将企业产生的现金流最优化地分配给留存再投资、收购、分红或回购。巴菲特认为 CEO 最重要的职责就是资本配置。',
    quote: '时间是优秀企业的朋友���却是平庸企业的敌人。',
    year: '1985',
    color: 'from-teal-500/10 to-teal-600/5',
    border: 'border-teal-500/20',
    tag: 'tag-teal',
  },
  {
    name: '管理层诚信',
    en: 'Management Integrity',
    desc: '巴菲特只与他信任、尊重和欣赏的人合作。管理层的诚信和能力是他评估企业的首要因素，远比财务报表重要。',
    quote: '我们在寻找三种特质：诚信、智慧和活力。如果缺少诚信，后两者会让你倾家荡产。',
    year: '1989',
    color: 'from-lime-500/10 to-lime-600/5',
    border: 'border-lime-500/20',
    tag: 'tag-lime',
  },
  {
    name: '价值投资',
    en: 'Value Investing',
    desc: '以低于内在价值的价格买入资产的投资方法。由本杰明·格雷厄姆创立，被巴菲特发扬光大，注重基本面分析而非市场情绪。',
    quote: '价值投资的核心是：以合理价格买入优秀企业，优于以低价买入普通企业。',
    year: '1992',
    color: 'from-amber-500/10 to-amber-600/5',
    border: 'border-amber-500/20',
    tag: 'tag-amber',
  },
  {
    name: '品牌溢价',
    en: 'Brand Premium',
    desc: '强大的品牌赋予企业定价权，允许其不断提价而不失去客户。可口可乐、See\'s Candies 是巴菲特最爱引用的案例。',
    quote: '真正好的企业不需要一直改变，它只需要一直做好同一件事。',
    year: '1983',
    color: 'from-red-500/10 to-red-600/5',
    border: 'border-red-500/20',
    tag: 'tag-red',
  },
  {
    name: '股东权益',
    en: 'Shareholder Equity',
    desc: '巴菲特将自己视为股东的受托人，始终以长期股东利益为决策基准。他拒绝盈利管理和短期主义，坚持透明诚实的信息披露。',
    quote: '我们把股东当作合伙人，而不是投机者。',
    year: '1979',
    color: 'from-sky-500/10 to-sky-600/5',
    border: 'border-sky-500/20',
    tag: 'tag-sky',
  },
  {
    name: '留存收益',
    en: 'Retained Earnings',
    desc: '企业将利润留存再投资而非分红，前提是每留存一美元能创造超过一美元的市值增长。巴菲特认为这是检验企业价值创造能力的关键。',
    quote: '留存收益的价值，取决于管理层再投资的能力。',
    year: '1984',
    color: 'from-violet-500/10 to-violet-600/5',
    border: 'border-violet-500/20',
    tag: 'tag-violet',
  },
  {
    name: '集中投资',
    en: 'Concentrated Portfolio',
    desc: '把大量资金集中投入少数最有把握的机会，而非分散持有。巴菲特曾将大部分资金押注在单一股票上，他认为过度分散是无知的对冲。',
    quote: '分散投资是对无知的保护。对于知道自己在做什么的人来说，分散毫无意义。',
    year: '1993',
    color: 'from-fuchsia-500/10 to-fuchsia-600/5',
    border: 'border-fuchsia-500/20',
    tag: 'tag-fuchsia',
  },
  {
    name: '耐心等待',
    en: 'Patient Waiting',
    desc: '投资需要极大耐心，等待真正好的机会出现。巴菲特用棒球比喻：不需要挥每一棒，只等最佳球来临再出击。',
    quote: '我们不需要比别人聪明，只需要比别人更有纪律。',
    year: '1997',
    color: 'from-stone-500/10 to-stone-600/5',
    border: 'border-stone-500/20',
    tag: 'tag-stone',
  },
  {
    name: '定价权',
    en: 'Pricing Power',
    desc: '企业提高产品价格而不损失客户的能力，是护城河最直接的体现。巴菲特将定价权视为判断企业质量的最重要测试。',
    quote: '评估一家企业最重要的一个因素，是其定价权。',
    year: '2011',
    color: 'from-yellow-500/10 to-yellow-600/5',
    border: 'border-yellow-500/20',
    tag: 'tag-yellow',
  },
  {
    name: '企业文化',
    en: 'Corporate Culture',
    desc: '伯克希尔独特的去中心化管理文化：总部极度���简，子公司高度自治，以诚信和绩效为基础。巴菲特认为文化是最持久的竞争优势。',
    quote: '文化比规则更有力量。',
    year: '2014',
    color: 'from-green-500/10 to-green-600/5',
    border: 'border-green-500/20',
    tag: 'tag-green',
  },
  {
    name: '反向思维',
    en: 'Contrarian Thinking',
    desc: '在市场极度恐慌时买入，在市场狂热时保持冷静。巴菲特最成功的投资往往发生在市场崩溃期间，如2008年金融危机。',
    quote: '别人贪婪时我恐惧，别人恐惧时我贪婪。',
    year: '2008',
    color: 'from-pink-500/10 to-pink-600/5',
    border: 'border-pink-500/20',
    tag: 'tag-pink',
  },
  {
    name: '经济特许权',
    en: 'Economic Franchise',
    desc: '企业提供的产品或服务被客户需要、无可替代、不受价格管制，且可以持续提价。这是巴菲特理想投资标的的三个核心条件。',
    quote: '最好的企业是那些你不需要做任何事，钱就会自动滚进来的。',
    year: '1991',
    color: 'from-cyan-500/10 to-cyan-600/5',
    border: 'border-cyan-500/20',
    tag: 'tag-cyan',
  },
]

export default function ConceptsPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-4">
            <Lightbulb className="h-3.5 w-3.5" />
            核心投资概念
          </div>
          <h1 className="text-3xl font-bold text-stone-100 mb-3">巴菲特投资哲学精要</h1>
          <p className="text-stone-400 text-base max-w-2xl leading-relaxed">
            从数十年的致股东信中提炼的 20 个核心投资概念，每一条都有原文引用支撑。
            点击「AI 深入解读」可与 AI 展开详细对话。
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {CONCEPTS.map((concept) => (
            <div
              key={concept.name}
              className={`rounded-xl border ${concept.border} bg-gradient-to-br ${concept.color} p-5 flex flex-col gap-3`}
            >
              {/* Title row */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-stone-100">{concept.name}</h3>
                  <p className="text-xs text-stone-500 mt-0.5">{concept.en}</p>
                </div>
                <span className="shrink-0 text-[10px] text-stone-600 bg-stone-800/60 border border-stone-700/50 px-1.5 py-0.5 rounded mt-0.5">
                  {concept.year}年
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-stone-400 leading-relaxed">{concept.desc}</p>

              {/* Quote */}
              <blockquote className="border-l-2 border-amber-500/40 pl-3">
                <p className="text-xs text-stone-500 italic leading-relaxed">&ldquo;{concept.quote}&rdquo;</p>
              </blockquote>

              {/* CTA */}
              <Link
                href={`/chat?q=${encodeURIComponent(`巴菲特如何理解${concept.name}？请结合信件原文举例说明。`)}`}
                className="self-start flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-300 transition-colors mt-1"
              >
                <MessageSquare className="h-3 w-3" />
                AI 深入解读
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
