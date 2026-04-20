import Link from 'next/link'
import { Users, ArrowRight, MessageSquare, BookOpen, Quote } from 'lucide-react'

const PEOPLE = [
  {
    name: '沃伦·巴菲特',
    title: '伯克希尔·哈撒韦 董事长兼 CEO',
    born: '1930年8月30日',
    years: '1965–至今',
    origin: '美国内布拉斯加州奥马哈',
    color: 'from-amber-500/10 to-amber-600/5',
    border: 'border-amber-500/20',
    tagColor: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    bio: '沃伦·巴菲特，被誉为"奥马哈先知"，是有史以来最成功的投资者之一。11岁买入第一只股票，14岁报税时申报了40美元的自行车作为商业费用。他将格雷厄姆的定量分析与费雪的定性分析融为一体，创造了独特的价值投资体系。自1965年接管伯克希尔·哈撒韦以来，年化回报约为19.8%，远超标普500指数的10.2%。他以每年一封致股东信著称，这些信件被誉为"商业和投资智慧的教科书"。',
    achievements: [
      '将伯克希尔从濒临倒闭的纺织厂改造为市值超1万亿美元的企业集团',
      '截至2024年，个人资产超1400亿美元，承诺捐出99%以上',
      '致股东信跨越近半个世纪，是投资教育的最宝贵文献',
      '以"能力圈"、"护城河"等概念重塑了全球投资语言',
    ],
    influences: ['本杰明·格雷厄姆', '菲利普·费雪', '查理·芒格'],
    keyQuote: '人生就像滚雪球。重要的是找到湿的雪，和一条很长的山坡。',
    books: ['《聪明的投资者》（格雷厄姆著，巴菲特推荐）', '巴菲特致股东信（1977–2024）'],
  },
  {
    name: '查理·芒格',
    title: '伯克希尔·哈撒韦 副董事长',
    born: '1924年1月1日 — 2023年11月28日',
    years: '1978–2023',
    origin: '美国内布拉斯加州奥马哈',
    color: 'from-blue-500/10 to-blue-600/5',
    border: 'border-blue-500/20',
    tagColor: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    bio: '查理·芒格是巴菲特的黄金搭档，也是现代多元思维框架的先驱。他从物理、心理学、历史、数学等多个学科汲取智慧，形成了独特的"格栅理论"。他对巴菲特最大的影响是推动其从格雷厄姆式的"廉价雪茄烟蒂"策略，进化为"以合理价格买入优秀企业"的理念。See\'s Candies 的收购是这种转变的象征。2023年11月，芒格以99岁高龄辞世，巴菲特称他是"建筑师"，而自己只是"承包商"。',
    achievements: [
      '与巴菲特共同管理伯克希尔超过45年',
      '提出"反向思维"：把问题倒过来想，先想清楚什么会导致失败',
      '创立"多元思维格栅"：从100个心智模型中选择最适合的工具',
      '主导了一系列关键收购决策，包括See\'s Candies、BNSF铁路等',
    ],
    influences: ['本杰明·富兰克林', '查尔斯·达尔文', '本杰明·格雷厄姆'],
    keyQuote: '反过来想，总是反过来想。许多问题如果正向思考，你无法解决；但反向思考，答案就会变得清晰。',
    books: ['《穷查理宝典》', '《查理·芒格的智慧》'],
  },
  {
    name: '格雷格·阿贝尔',
    title: '伯克希尔·哈撒韦 副董事长（非保险业务）',
    born: '1962年',
    years: '2018–至今',
    origin: '加拿大埃德蒙顿',
    color: 'from-emerald-500/10 to-emerald-600/5',
    border: 'border-emerald-500/20',
    tagColor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    bio: '格雷格·阿贝尔被巴菲特公开指定为伯克希尔·哈撒韦的接班人。他于2000年通过收购MidAmerican Energy（现伯克希尔哈撒韦能源）加入伯克希尔体系，以出色的资本配置能力��对伯克希尔文化的深刻理解赢得巴菲特和芒格的信任。他负责监管伯克希尔除保险外的所有业务，包括BNSF铁路、制造业、零售业等。巴菲特表示，阿贝尔"完全理解伯克希尔的文化"，这是比财务技能更重要的传承。',
    achievements: [
      '将伯克希尔哈撒韦能源从小型公司发展为可再生能源领域的巨头',
      '管理伯克希尔超过90个业务子公司，员工总数逾39万',
      '2021年被公开确认为巴菲特的接班人',
      '以低调、勤勉著称，体现了伯克希尔"去中心化管理"的核心文化',
    ],
    influences: ['沃伦·巴菲特', '查理·芒格'],
    keyQuote: '文化比资本更难复制，而伯克希尔的文化是我们最持久的竞争优势。',
    books: ['伯克希尔年度股东信（持续更新）'],
  },
  {
    name: '本杰明·格雷厄姆',
    title: '价值投资之父 · 哥伦比亚商学院教授',
    born: '1894年5月9日 — 1976年9月21日',
    years: '1894–1976',
    origin: '英国伦敦（成长于美国纽约）',
    color: 'from-purple-500/10 to-purple-600/5',
    border: 'border-purple-500/20',
    tagColor: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    bio: '本杰明·格雷厄姆是现代价值投资理论的奠基人，也是巴菲特在哥伦比亚商学院的恩师。他历经1929年大崩盘，从中提炼出"安全边际"理论：永远以低于内在价值的价格买入，用折扣幅度对抗不确定性。他写下的两本书——《证券分析》（1934）和《聪明的投资者》（1949）——至今仍是价值投资的圣经。巴菲特称《聪明的投资者》是他"读过的最好的投资书"，第8章（先生市场）和第20章（安全边际）是"真正重要的章节"。',
    achievements: [
      '提出"先生市场"比喻，解释市场非理性波动的本质',
      '创立"净流动资产价值"分析法，系统化了定量价值投资',
      '培养了巴菲特、沃尔特·施洛斯、欧文·卡恩等一代价值投资大师',
      '在职业生涯中实现年化约20%的复合回报',
    ],
    influences: ['杰西·利弗莫尔（反面案例）', '查尔斯·道'],
    keyQuote: '在短期内，市场是一台投票机；但在长期内，市场是一台称重机。',
    books: ['《证券分析》（1934）', '《聪明的投资者》（1949）'],
  },
  {
    name: '菲利普·费雪',
    title: '成长股投资先驱 · Fisher Investments 创始人',
    born: '1907年9月8日 — 2004年3月11日',
    years: '1907–2004',
    origin: '美国加利福尼亚州旧金山',
    color: 'from-rose-500/10 to-rose-600/5',
    border: 'border-rose-500/20',
    tagColor: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    bio: '菲利普·费雪是定性价值投资的先驱，专注于研究企业的长期成长潜力和管理层质量。他的"闲聊法"（Scuttlebutt Method）——通过与竞争对手、供应商、客户交谈来了解企业真实情况——至今仍是深度研究的标准方法。他在摩托罗拉上的投资持续超过30年，完美诠释了长期持有的力量。巴菲特说自己"85%是格雷厄姆，15%是费雪"——但正是这15%让他不再只是买"便宜股"，而是开始寻找"伟大企业"。',
    achievements: [
      '提出15点选股标准，系统化了成长股投资的定性分析框架',
      '持有摩托罗拉超过30年，证明长期持有优质企业的力量',
      '影响巴菲特从"雪茄烟蒂"进化为寻求"护城河"式优质企业',
      '《怎样选择成长股》（1958）至今被视为成长股投资的经典',
    ],
    influences: ['本杰明·格雷厄姆（间接）', '乔治·斯蒂尔曼'],
    keyQuote: '如果你做了正确的工作，买入时机几乎无关紧要。',
    books: ['《怎样选择成长股》（1958）', '《��守型投资者安枕无忧》（1975）'],
  },
]

export default function PeoplePage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium mb-4">
            <Users className="h-3.5 w-3.5" />
            关键人物
          </div>
          <h1 className="text-3xl font-bold text-stone-100 mb-3">塑造投资哲学的人</h1>
          <p className="text-stone-400 text-base max-w-2xl leading-relaxed">
            了解巴菲特及那些深刻影响了他投资理念的人物：他的搭档、导师与精神导师。
          </p>
        </div>

        {/* Person cards */}
        <div className="space-y-6">
          {PEOPLE.map((person) => (
            <div
              key={person.name}
              className={`rounded-2xl border ${person.border} bg-gradient-to-br ${person.color} overflow-hidden`}
            >
              {/* Card header */}
              <div className="p-6 pb-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-stone-800/80 border border-stone-700/50 flex items-center justify-center shrink-0">
                    <Users className="h-7 w-7 text-stone-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-lg font-bold text-stone-100">{person.name}</h3>
                      <span className={`text-[10px] border px-1.5 py-0.5 rounded-full ${person.tagColor}`}>
                        {person.years}
                      </span>
                    </div>
                    <p className="text-sm text-stone-400">{person.title}</p>
                    <p className="text-xs text-stone-600 mt-1">{person.born} · {person.origin}</p>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-sm text-stone-300 leading-relaxed mt-4">{person.bio}</p>

                {/* Quote */}
                <div className="mt-4 p-4 rounded-xl bg-stone-900/50 border border-stone-700/30">
                  <div className="flex gap-2">
                    <Quote className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-stone-300 italic leading-relaxed">{person.keyQuote}</p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="px-6 pb-6 grid sm:grid-cols-3 gap-4 mt-2">
                {/* Achievements */}
                <div className="sm:col-span-2">
                  <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">主要成就</h4>
                  <ul className="space-y-1.5">
                    {person.achievements.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-stone-400">
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500/60 mt-1.5" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Side info */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">影响来源</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {person.influences.map((inf) => (
                        <span key={inf} className="text-[10px] text-stone-500 bg-stone-800/60 border border-stone-700/40 px-2 py-0.5 rounded-full">
                          {inf}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">推荐阅读</h4>
                    <div className="space-y-1">
                      {person.books.map((b) => (
                        <div key={b} className="flex items-start gap-1.5">
                          <BookOpen className="h-3 w-3 text-stone-600 shrink-0 mt-0.5" />
                          <span className="text-[10px] text-stone-500 leading-snug">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer link */}
              <div className="px-6 py-3 border-t border-stone-700/30 flex justify-end">
                <Link
                  href={`/chat?q=${encodeURIComponent(`巴菲特在致股东信中如何评价${person.name}？他对巴菲特的投资理念产生了什么影响？`)}`}
                  className="flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-300 transition-colors"
                >
                  <MessageSquare className="h-3 w-3" />
                  在信件中了解更多
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
