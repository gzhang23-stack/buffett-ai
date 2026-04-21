import Link from 'next/link'
import { Building2, ArrowRight, MessageSquare, TrendingUp, Calendar } from 'lucide-react'

const COMPANIES = [
  {
    name: '可口可乐',
    ticker: 'KO',
    since: '1988',
    sector: '消费品',
    desc: '巴菲特最著名的长期持仓之一。强大的品牌护城河、全球分销网络和定价权使其成为价值投资教科书案例。伯克希尔持有约 9.3% 股份。',
    moat: '品牌 · 全球分销 · 定价权',
    lesson: '品牌是最持久的护城河，无需大量资本就能维持高利润。',
    color: 'from-red-500/10 to-red-600/5',
    border: 'border-red-500/20',
    dot: 'bg-red-400',
  },
  {
    name: '苹果公司',
    ticker: 'AAPL',
    since: '2016',
    sector: '科技/消费',
    desc: '伯克希尔最大持仓（约占组合40%）。巴菲特将其视为消费品公司而非科技公司，核心吸引力在于生态系统粘性和用户忠诚度。',
    moat: '生态系统 · 品牌 · 转换成本',
    lesson: '最好的科技投资是那些让人们"无法想象没有它"的产品。',
    color: 'from-blue-500/10 to-blue-600/5',
    border: 'border-blue-500/20',
    dot: 'bg-blue-400',
  },
  {
    name: '美国运通',
    ticker: 'AXP',
    since: '1964',
    sector: '金融服务',
    desc: '持有逾 60 年的长期投资，起初源于1963年色拉油丑闻。品牌、高消费人群网络和会员生态构成强大护城河。',
    moat: '品牌 · 网络效应 · 高端定位',
    lesson: '危机中买入伟大企业，往往是一生中最好的投资机会。',
    color: 'from-sky-500/10 to-sky-600/5',
    border: 'border-sky-500/20',
    dot: 'bg-sky-400',
  },
  {
    name: 'GEICO 保险',
    ticker: 'BRK.A',
    since: '1996',
    sector: '保险',
    desc: '美国第二大汽车保险公司，1996年被伯克希尔全资收购。低成本直销模式是其核心优势，同时产生大量可用于投资的保险浮存金。',
    moat: '成本优势 · 规模 · 直销模式',
    lesson: '低成本是最可持续的竞争优势之一，任何人都无法轻易复制。',
    color: 'from-green-500/10 to-green-600/5',
    border: 'border-green-500/20',
    dot: 'bg-green-400',
  },
  {
    name: "See's Candies",
    ticker: 'BRK.A',
    since: '1972',
    sector: '消费品',
    desc: '1972年以2500万美元收购，已产生超过20亿美元利润。改变了巴菲特从"廉价股"到"优质企业"的投资理念，是他最爱引用的案例。',
    moat: '品牌 · 情感价值 · 节日消费',
    lesson: '一家能不断提价而不失去客户的企业，比任何便宜股票都更有价值。',
    color: 'from-amber-500/10 to-amber-600/5',
    border: 'border-amber-500/20',
    dot: 'bg-amber-400',
  },
  {
    name: '伯灵顿北方铁路',
    ticker: 'BNSF',
    since: '2010',
    sector: '交通运输',
    desc: '2010年以440亿美元全资收购，是伯克希尔历史上最大的单笔收购。连接美国西部的铁路网络构成真正的基础设施护城河。',
    moat: '基础设施 · 垄断路线 · 高资本壁垒',
    lesson: '真正的护城河是别人永远无法重新建造的东西——比如一条横贯大陆的铁路。',
    color: 'from-orange-500/10 to-orange-600/5',
    border: 'border-orange-500/20',
    dot: 'bg-orange-400',
  },
  {
    name: '西方石油',
    ticker: 'OXY',
    since: '2019',
    sector: '能源',
    desc: '近年重仓买入，持股比例超过25%。巴菲特欣赏其资本配置纪律和CEO维基·霍勒布的管理能力，并持有大量认股权证。',
    moat: '低成本资产 · 管理层素质',
    lesson: '在大宗商品行业，管理层的资本配置能力比任何技术优势都更重要。',
    color: 'from-stone-500/10 to-stone-600/5',
    border: 'border-stone-500/20',
    dot: 'bg-stone-400',
  },
  {
    name: '穆迪公司',
    ticker: 'MCO',
    since: '2000',
    sector: '金融/数据',
    desc: '全球两大信用评级机构之一，拥有典型的"收费站"式商业模式。发债人不得不付费，监管壁垒极高，几乎无竞争。',
    moat: '监管特许 · 双寡头 · 信息垄断',
    lesson: '最好的商业模式是别人必须付钱给你，即使他们不喜欢你。',
    color: 'from-cyan-500/10 to-cyan-600/5',
    border: 'border-cyan-500/20',
    dot: 'bg-cyan-400',
  },
  {
    name: '卡夫亨氏',
    ticker: 'KHC',
    since: '2015',
    sector: '消费品',
    desc: '与3G资本联合打造的食品巨头，但品牌老化和消费趋势转变导致2019年大幅减值。巴菲特坦承这是一次失误，付出了惨重代价。',
    moat: '品牌（已衰退）',
    lesson: '品牌护城河需要持续维护和再投资，忽视消费趋势变化会让护城河消失。',
    color: 'from-yellow-500/10 to-yellow-600/5',
    border: 'border-yellow-500/20',
    dot: 'bg-yellow-400',
  },
  {
    name: '富国银行',
    ticker: 'WFC',
    since: '1989',
    sector: '金融银行',
    desc: '曾是伯克希尔最大持仓之一，持有近30年。2016年虚假账户丑闻后巴菲特逐步减持直至清仓，是管理层诚信至关重要的典型案例。',
    moat: '低成本融资 · 零售网络（已退出）',
    lesson: '管理层的诚信是不可谈判的底线。一旦破坏，再好的企业也必须离开。',
    color: 'from-red-500/10 to-red-600/5',
    border: 'border-red-500/20',
    dot: 'bg-red-400',
  },
  {
    name: '比亚迪',
    ticker: 'BYDDF',
    since: '2008',
    sector: '新能源',
    desc: '2008年以2.32亿美元买入10%股份，高峰时账面盈利超70倍。2022年起逐步减持，但仍是罕见的新兴市场投资案例。',
    moat: '电池技术 · 垂直整合 · 规模',
    lesson: '当一位世界级管理者遇上一个快速发展的行业，奇迹是可能发生的。',
    color: 'from-teal-500/10 to-teal-600/5',
    border: 'border-teal-500/20',
    dot: 'bg-teal-400',
  },
  {
    name: 'Pilot 飞行中心',
    ticker: 'BRK.A',
    since: '2017',
    sector: '零售/服务',
    desc: '美国最大的卡车休息站网络运营商，2023年完成全资收购。覆盖全美高速公路节点的网络构成强大的地理护城河。',
    moat: '地理垄断 · 网络规模 · 转换成本',
    lesson: '物理地理优势与数字护城河同样强大——卡车司机需要加油，而加油站无处不在。',
    color: 'from-indigo-500/10 to-indigo-600/5',
    border: 'border-indigo-500/20',
    dot: 'bg-indigo-400',
  },
]

export default function CompaniesPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
            <Building2 className="h-3.5 w-3.5" />
            关联公司
          </div>
          <h1 className="text-3xl font-bold text-stone-100 mb-3">伯克希尔投资组合</h1>
          <p className="text-stone-400 text-base max-w-2xl leading-relaxed">
            伯克希尔旗下或长期持股的 12 家关键企业，每家都承载着巴菲特具体的投资逻辑与人生智慧。
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-6 mb-10 p-5 rounded-xl border border-stone-700/40 bg-stone-900/40">
          {[
            { icon: Building2, label: '关联企业', value: '60+' },
            { icon: TrendingUp, label: '市值（2024）', value: '$1.1T' },
            { icon: Calendar, label: '最早持仓', value: '1964年' },
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

        {/* Company cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          {COMPANIES.map((co) => (
            <div
              key={co.name}
              className={`rounded-xl border ${co.border} bg-gradient-to-br ${co.color} p-5 flex flex-col gap-3`}
            >
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-800/80 border border-stone-700/50 flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-stone-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-stone-100">{co.name}</h3>
                    <span className="text-[10px] font-mono text-stone-500 bg-stone-800/60 border border-stone-700/40 px-1.5 py-0.5 rounded">
                      {co.ticker}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-stone-500">{co.sector}</span>
                    <span className="text-stone-700">·</span>
                    <span className="text-xs text-stone-600">持仓自 {co.since} 年</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-stone-400 leading-relaxed">{co.desc}</p>

              {/* Moat */}
              <div className="flex items-start gap-2">
                <span className="text-xs text-stone-600 shrink-0 mt-0.5">护城河</span>
                <span className="text-xs text-stone-400">{co.moat}</span>
              </div>

              {/* Lesson */}
              <blockquote className="border-l-2 border-amber-500/40 pl-3">
                <p className="text-xs text-stone-500 italic leading-relaxed">{co.lesson}</p>
              </blockquote>

              {/* AI Link */}
              <Link
                href={`/chat?q=${encodeURIComponent(`巴菲特为什么投资${co.name}？从股东信原文来看，他如何评价这家公司？`)}`}
                className="self-start flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-300 transition-colors mt-1"
              >
                <MessageSquare className="h-3 w-3" />
                AI 解读投资逻辑
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
