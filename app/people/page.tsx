import Link from 'next/link'
import { Users, ArrowRight, MessageSquare, BookOpen, Quote, Globe, MapPin } from 'lucide-react'

const FOREIGN_PEOPLE = [
  {
    name: '沃伦·巴菲特',
    title: '伯克希尔·哈撒韦 董事长兼 CEO',
    born: '1930年8月30日',
    years: '1965–至今',
    origin: '美国，奥马哈',
    color: 'from-amber-500/10 to-amber-600/5',
    border: 'border-amber-500/20',
    tagColor: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    bio: '沃伦·巴菲特，被誉为"奥马哈先知"，是有史以来最成功的投资者之一。11岁买入第一只股票，将格雷厄姆的定量分析与费雪的定性分析融为一体，创造了独特的价值投资体系。自1965年接管伯克希尔·哈撒韦以来，年化回报约为19.8%，远超标普500指数的10.2%。每年致股东信被誉为"商业和投资智慧的教科书"。',
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
    origin: '美国，奥马哈',
    color: 'from-blue-500/10 to-blue-600/5',
    border: 'border-blue-500/20',
    tagColor: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    bio: '查理·芒格是巴菲特的黄金搭档，也是现代多元思维框架的先驱。他从物理、心理学、历史、数学等多个学科汲取智慧，形成了独特的"格栅理论"。他对巴菲特最大的影响是推动其从格雷厄姆式的"廉价雪茄烟蒂"策略，进化为"以合理价格买入优秀企业"的理念。2023年11月，芒格以99岁高龄辞世。',
    achievements: [
      '与巴菲特共同管理伯克希尔超过45年',
      '提出"反向思维"：把问题倒过来想，先想清楚什么会导致失败',
      '创立"多元思维格栅"：从100个心智模型中选择最适合的工具',
      "主导了一系列关键收购决策，包括See's Candies、BNSF铁路等",
    ],
    influences: ['本杰明·富兰克林', '查尔斯·达尔文', '本杰明·格雷厄姆'],
    keyQuote: '反过来想，总是反过来想。许多问题如果正向思考，你无法解决；但反向思考，答案就会变得清晰。',
    books: ['《穷查理宝典》', '《查理·芒格的智慧》'],
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
    bio: '本杰明·格雷厄姆是现代价值投资理论的奠��人，也是巴菲特在哥伦比亚商学院的恩师。他历经1929年大崩盘，从中提炼出"安全边际"理论。他写下的两本书——《证券分析》（1934）和《聪明的投资者》（1949）——至今仍是价值投资的圣经。巴菲特称《聪明的投资者》是他"读过的最好的投资书"。',
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
    origin: '美国，旧金山',
    color: 'from-rose-500/10 to-rose-600/5',
    border: 'border-rose-500/20',
    tagColor: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    bio: '菲利普·费雪是定性价值投资的先驱，专注于研究企业的长期成长潜力和管理层质量。他的"闲聊法"（Scuttlebutt）——通过与竞争对手、供应商、客户交谈了解企业——至今仍是深度研究的标准方法。他在摩托罗拉上的投资持续超过30年。巴菲特说自己"85%是格雷厄姆，15%是费雪"。',
    achievements: [
      '提出15点选股标准，系统化了成长股投资的定性分析框架',
      '持有摩托罗拉超过30年，证明长期持有优质企业的力量',
      '影响巴菲特从"雪茄烟蒂"进化为寻求"护城河"式优质企业',
      '《怎样选择成长股》（1958）至今被视为成长股投资的经典',
    ],
    influences: ['本杰明·格雷厄姆（间接）', '乔治·斯蒂尔曼'],
    keyQuote: '如果你做了正确的工作，买入时机几乎无关紧要。',
    books: ['《怎样选择成长股》（1958）', '《保守型投资者安枕无忧》（1975）'],
  },
  {
    name: '彼得·林奇',
    title: '富达麦哲伦基金 前基金经理',
    born: '1944年1月19日',
    years: '1977–1990',
    origin: '美国，波士顿',
    color: 'from-emerald-500/10 to-emerald-600/5',
    border: 'border-emerald-500/20',
    tagColor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    bio: '彼得·林奇在管理麦哲伦基金的13年间，将资产从1800万美元增长至140亿美元，年化回报率29%。他倡导"买你了解的"投资哲学，鼓励普通投资者利用生活观察发现投资机会。他将股票分为六类（缓慢增长型、稳定型、快速增长型、周期型、困境反转型、隐蔽资产型），建立了系统的个人选股框架。',
    achievements: [
      '13年任期内年化回报29%，超过标普500指数两倍以上',
      '麦哲伦基金成为当时全球规模最大的股票基金',
      '提出PEG指标（市盈率/增长率），简化成长股估值',
      '《彼得·林奇的成功投资》成为个人投资者的必读圣经',
    ],
    influences: ['乔治·苏利文', '本杰明·格雷厄姆'],
    keyQuote: '在这个行业，如果你对10只股票中的6只判断正确，那就很好了。',
    books: ['《彼得·林奇的成功投资》（1989）', '《战胜华尔街》（1993）'],
  },
  {
    name: '约翰·邓普顿',
    title: '邓普顿基金 创始人 · 全球价值投资先驱',
    born: '1912年11月29日 — 2008年7月8日',
    years: '1912–2008',
    origin: '美国田纳西州（后移居巴哈马）',
    color: 'from-cyan-500/10 to-cyan-600/5',
    border: 'border-cyan-500/20',
    tagColor: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    bio: '约翰·邓普顿是全球化价值投资的开拓者。1939年二战爆发时，他借钱买入104只价格低于1美元的纽约股票，4年后几乎全部盈利。他率先将价值投资扩展到全球市场，在日本、德国、加拿大等市场寻找被低估的优质企业。他坚信"在最悲观的时刻买入"，成为逆向投资的代表人物。',
    achievements: [
      '1939年逆市操作，奠定"在悲观时刻买入"的投资哲学',
      '邓普顿成长基金50年间年化回报超过13%',
      '将全球分散化价值投资推广为主流投资策略',
      '1987年以4亿美元出售基金管理公司，晚年致力于慈善',
    ],
    influences: ['本杰明·格雷厄姆', '大卫·多德'],
    keyQuote: '牛市在悲观中诞生，在怀疑中成长，在乐观中成熟，在欢欣中死亡。',
    books: ['《邓普顿教你逆向投资》', '《全球投资》'],
  },
  {
    name: '霍华德·马克斯',
    title: '橡树资本 联合创始人兼联席董事长',
    born: '1946年',
    years: '1995–至今',
    origin: '美国，纽约',
    color: 'from-orange-500/10 to-orange-600/5',
    border: 'border-orange-500/20',
    tagColor: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
    bio: '霍华德·马克斯是橡树资本的联合创始人，专注于另类投资和高收益债券。他以"投资备忘录"（Memo）著称，自1990年代起定期发布的备忘录已成为华尔街最受关注的投资文章。巴菲特称"当霍华德的备忘录出现在我的邮箱时，我会第一时间打开阅读"。马克斯对市场周期和风险的深刻理解，使其成为当代价值投资思想的重要传播者。',
    achievements: [
      '橡树资本管理资产超1800亿美元，专注于不良债务等另类资产',
      '发布40余年投资备忘录，形成完整的周期理论体系',
      '《投资最重要的事》被巴菲特推荐，成为投资经典',
      '提出"第二层思维"：不只想对，还要比市场想得更深',
    ],
    influences: ['本杰明·格雷厄姆', '菲利普·卡雷特'],
    keyQuote: '成功的投资不在于买好东西，而在于把东西买好。',
    books: ['《投资最重要的事》（2011）', '《掌握市场周期》（2018）'],
  },
  {
    name: '沃尔特·施洛斯',
    title: 'WJS Partners 创始人 · 格雷厄姆忠实传人',
    born: '1916年8月28日 — 2012年2月19日',
    years: '1955–2003',
    origin: '美国，纽约',
    color: 'from-stone-500/10 to-stone-600/5',
    border: 'border-stone-500/20',
    tagColor: 'bg-stone-500/10 border-stone-500/20 text-stone-400',
    bio: '沃尔特·施洛斯是格雷厄姆最忠实的门徒之一，也是巴菲特"超级投资者"演讲中的核心案例。他没有大学文凭，仅凭格雷厄姆的价值投资原则，在47年投资生涯中实现年化约16%的复合回报（同期标普500约10%）。他极少分析宏观经济，专注于寻找资产负债表上被低估的廉价股票，完全遵循安全边际原则。',
    achievements: [
      '47年独立管理资金，年化回报约16%，远超市场指数',
      '巴菲特将其列为"格雷厄姆-多德都市的超级投资者"之一',
      '不使用杠杆，不做空，仅靠选股实现卓越长期回报',
      '证明了普通投资者遵循价值投资原则可以战胜市场',
    ],
    influences: ['本杰明·格雷厄姆', '大卫·多德'],
    keyQuote: '不要被情绪影响。股价下跌时，我们会买更多；股价上涨时，我们会考虑卖出。',
    books: ['《超级投资者》（巴菲特文章）', '《证券分析》（格雷厄姆著）'],
  },
  {
    name: '塞思·卡拉曼',
    title: 'Baupost Group 创始人兼总裁',
    born: '1957年',
    years: '1983–��今',
    origin: '美国，波士顿',
    color: 'from-indigo-500/10 to-indigo-600/5',
    border: 'border-indigo-500/20',
    tagColor: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    bio: '塞思·卡拉曼是当代最受尊重的价值投资者之一。他的著作《安全边际》（1991）绝版后在二手市场价格高达数千美元，被称为"投资圣经"。Baupost Group以绝对回报为目标，擅长不良债务、私募股权和特殊情况投资。卡拉曼极度注重风险控制，常持有大量现金等待合适机会，堪称"安全边际"原则最彻底的践行者。',
    achievements: [
      'Baupost Group管理资产约300亿美元，30年平均年化回报约20%',
      '《安全边际》成为价值投资最稀缺的经典著作',
      '以持有大量现金储备著称，在危机时刻大举买入',
      '每年致投资者信被业界视为价值投资思想的重要文献',
    ],
    influences: ['本杰明·格雷厄姆', '沃伦·巴菲特', '迈克尔·普赖斯'],
    keyQuote: '价值投资是以折扣价买入资产，并在价值被市场认识时卖出。',
    books: ['《安全边际》（1991，绝版）'],
  },
]

const CHINESE_PEOPLE = [
  {
    name: '段永平',
    title: 'OPPO/步步高 创始人 · 价值投资者',
    born: '1961年',
    years: '2006–至今',
    origin: '中国，广东',
    color: 'from-red-500/10 to-red-600/5',
    border: 'border-red-500/20',
    tagColor: 'bg-red-500/10 border-red-500/20 text-red-400',
    bio: '段永平是步步高、OPPO、vivo品牌的创始人，也是中国最知名的巴菲特信徒之一。2006年他以62万美元竞拍与巴菲特共进午餐，将王石、丁磊等企业家带到了巴菲特身边。此后他退休专注投资，重仓苹果、腾讯、茅台等优质企业，深刻践行"买入并持有伟大企业"的价值投资理念，在网络上以"大道无形我有型"为名分享投资思想。',
    achievements: [
      '创立步步高系企业，后孵化出OPPO和vivo两个手机品牌',
      '2006年62万美元竞拍巴菲特午餐，中国最早的巴菲特学生之一',
      '重仓苹果早于巴菲特，持有腾讯等中国优质企业多年',
      '在网络上系统分享价值投资理念，影响中国一代投资者',
    ],
    influences: ['沃伦·巴菲特', '查理·芒格', '菲利普·费雪'],
    keyQuote: '做对的事情，把事情做对。长期而言，结果自然会好。',
    books: ['《段永平投资问答录》（网络整理）'],
  },
  {
    name: '李录',
    title: '喜马拉雅资本 创始人',
    born: '1966年',
    years: '1998–至今',
    origin: '中国（旅居美国）',
    color: 'from-sky-500/10 to-sky-600/5',
    border: 'border-sky-500/20',
    tagColor: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
    bio: '李录是喜马拉雅资本的创始人，也是芒格家族资金的长期管理人。1989年以学生身份赴美后，凭借对中国经济的深度理解和格雷厄姆-巴菲特价值投资体系，成功将两者结合，成为最早深度投资中国的价值投资者之一。他将比亚迪介绍给芒格，促成了伯克希尔的著名投资。其著作《文明、现代化、价值投资与中国》被称为理解中国与价值投资交叉点的最佳读本。',
    achievements: [
      '喜马拉雅资本自成立以来长期实现超越市场的复合回报',
      '将比亚迪引荐给查理·芒格，促成伯克希尔重大投资',
      '芒格称其为"中国的沃伦·巴菲特"，长期管理芒格家族资产',
      '《文明、现代化、价值投资与中国》成为思考中国投资的里程碑著作',
    ],
    influences: ['本杰明·格雷厄姆', '查理·芒格', '沃伦·巴菲特'],
    keyQuote: '价值投资的核心在于：以低于内在价值的价格买入，然后等待价值被市场发现。',
    books: ['《文明、现代化、价值投资与中国》（2021）'],
  },
  {
    name: '冷眼（冯时能）',
    title: '马来西亚股坛宗师 · 价值投资践行者',
    born: '1945年',
    years: '1973–至今',
    origin: '马来西亚，砂拉越',
    color: 'from-yellow-500/10 to-yellow-600/5',
    border: 'border-yellow-500/20',
    tagColor: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    bio: '冷眼是马来西亚华人投资界最具影响力的人物，笔名"冷眼"取自"冷眼看世界"。他从1973年开始投资马来西亚股市，以30年实战经验写成《30年股票投资心得》，成为华语世界最畅销的投资书籍之一。他专注于基本面分析，强调"以合理价格买入优质公司并长期持有"，拒绝投机和短线交易，是东南亚价值投资理念的最重要传播者。',
    achievements: [
      '30年股票投资经历年化回报远超马来西亚市场指数',
      '《30年股票投资心得》在华语投资界销量超百万册',
      '以浅显文字将价值投资理念普及给华人散户投资者',
      '坚持不借贷投资、不投机、专注业绩优良企业的投资原则',
    ],
    influences: ['本杰明·格雷厄姆', '沃伦·巴菲特'],
    keyQuote: '股票市场是将钱从没有耐心的人手中转移到有耐心的人手中的机制。',
    books: ['《30年股票投资心得》', '《冷眼分享集》（91篇）'],
  },
  {
    name: '邱国鹭',
    title: '高毅资产 创始合伙人',
    born: '1975年',
    years: '2015–至今',
    origin: '中国，福建',
    color: 'from-lime-500/10 to-lime-600/5',
    border: 'border-lime-500/20',
    tagColor: 'bg-lime-500/10 border-lime-500/20 text-lime-400',
    bio: '邱国鹭是高毅资产的核心创始人之一，曾任南方基金投资总监，以深度基本面研究和价值投资方法论著称。他长期研究消费、医药、金融等行业的优质龙头企业，以"买股票就是买企业"的理念指导投资决策。其著作《投资中最简单的事》以通俗语言阐述了A股价值投资的核心方法论，成为中国专业投资者的重要参考读物。',
    achievements: [
      '曾任南方基金投资总监，管理资产超百亿元',
      '联合创立高毅资产，成为中国顶级私募机构之一',
      '《投资中最简单的事》成为中国基金业最受欢迎的投资书籍之一',
      '系统总结A股价值投资方法论，影响一代中国专业投资者',
    ],
    influences: ['沃伦·巴菲特', '查理·芒格', '霍华德·马克斯'],
    keyQuote: '好公司、好价格、好时机——三者兼备才是最好的投资。大多数时候，满足两个就足够了。',
    books: ['《投资中最简单的事》（2014）'],
  },
  {
    name: '冯柳',
    title: '高毅资产 合伙人',
    born: '1979年',
    years: '2014–至今',
    origin: '中国，湖南',
    color: 'from-fuchsia-500/10 to-fuchsia-600/5',
    border: 'border-fuchsia-500/20',
    tagColor: 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400',
    bio: '冯柳是中国最具传奇色彩的私募投资人之一，早年以散户身份在论坛发表研究文章积累声誉，后加入高毅资产。他以"弱者体系"闻名——承认自身信息劣势，反向利用市场共识，在争议最大的地方寻找机会。他的投资逻辑强调"产业视角"：从产业变迁而非财务数据出发理解企业，以长线思维对抗短期波动，是中国本土原创投资思想的重要代表。',
    achievements: [
      '散户时期在论坛发表研究，积累数十万追随者，成就传奇经历',
      '加入高毅资产后管理资产数百亿元，长期业绩居行业前列',
      '提出"弱者体系"：以信息劣势方的视角构建投资框架',
      '以产业视角和逆向思维，形成独特的中国本土价值投资方法论',
    ],
    influences: ['沃伦·巴菲特', '查理·芒格', '邱国鹭'],
    keyQuote: '我是弱者，所以我要站在强者的对立面，在大家都不看好的地方找机会。',
    books: ['《冯柳内部讲稿》（整理版）'],
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
            价值投资关键人物
          </div>
          <h1 className="text-3xl font-bold text-stone-100 mb-3">塑造价值投资的大师们</h1>
          <p className="text-stone-400 text-base max-w-2xl leading-relaxed">
            从格雷厄姆到巴菲特，从东西方投资大师到中国本土践行者，这些人共同构筑了价值投资的思想体系。
          </p>
        </div>

        {/* Foreign investors */}
        <div className="mb-4 flex items-center gap-2">
          <Globe className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-widest">国际大师</h2>
        </div>
        <div className="space-y-6 mb-12">
          {FOREIGN_PEOPLE.map((person) => (
            <PersonCard key={person.name} person={person} />
          ))}
        </div>

        {/* Chinese investors */}
        <div className="mb-4 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-widest">华人大师</h2>
        </div>
        <div className="space-y-6">
          {CHINESE_PEOPLE.map((person) => (
            <PersonCard key={person.name} person={person} />
          ))}
        </div>
      </div>
    </div>
  )
}

function PersonCard({ person }: { person: typeof FOREIGN_PEOPLE[0] }) {
  return (
    <div className={`rounded-2xl border ${person.border} bg-gradient-to-br ${person.color} overflow-hidden`}>
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
          href={`/chat?q=${encodeURIComponent(`${person.name}的投资理念是什么？他对价值投资有哪些重要贡献？`)}`}
          className="flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-300 transition-colors"
        >
          <MessageSquare className="h-3 w-3" />
          AI 深度解析
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}
