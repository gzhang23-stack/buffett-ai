const mammoth = require('mammoth')
const fs = require('fs')
const path = require('path')

const docPath = 'd:/AI编程/claude测试/VS code claude/data/other books/巴菲特文章和访谈资料集.docx'
const outputPath = path.join(__dirname, '../data/buffett-articles.json')

async function parseDocument() {
  console.log('Reading document...')
  const result = await mammoth.extractRawText({ path: docPath })
  const text = result.value
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)

  console.log(`Total lines: ${lines.length}`)

  // Manually define article boundaries based on the TOC
  const articles = [
    { title: '1951 年 12 月《商业与金融纪事报》专栏：我最看好的股票 - 政府雇员保险公司', start: 34, end: 58 },
    { title: '1953 年3 月《商业与金融纪事报》专栏：我最看好的股票 - 西部保险证券', start: 58, end: 80 },
    { title: '1974 年 11 月《福布斯》杂志专访巴菲特：击球，你这个笨蛋！', start: 80, end: 105 },
    { title: '1977 年《财富》杂志文章：《通货膨胀是如何欺骗股票投资者的》', start: 105, end: 278 },
    { title: '1979 年 8 月《福布斯》杂志巴菲特专栏：当市场一片欢腾时，你将付出高昂的价格', start: 278, end: 301 },
    { title: '1984 年巴菲特于哥伦比亚大学商学院的演讲：格雷厄姆-多德式的超级投资者', start: 301, end: 371 },
    { title: '1991 年春巴菲特对圣母大学全体师生的演讲（1）：对全体教员演讲', start: 371, end: 467 },
    { title: '1991 年春巴菲特对圣母大学全体师生的演讲（2）：对 MBA 学生的演讲', start: 467, end: 595 },
    { title: '1991 年春巴菲特对圣母大学全体师生的演讲（3）：对本科生的演讲', start: 595, end: 700 },
    { title: '1998 年巴菲特在佛罗里达大学商学院的演讲', start: 700, end: 852 },
    { title: '1999 年 1 月《财富》杂志专栏：巴菲特谈股市', start: 852, end: 874 },
    { title: '2001 年《财富》杂志专栏：巴菲特谈股市', start: 874, end: 998 },
    { title: '2001 年秋季内布拉斯加州大学商学院对沃伦·巴菲特的访谈', start: 998, end: 1052 },
    { title: '2005 年 5 月巴菲特与堪萨斯大学学生问答记录', start: 1052, end: 1100 },
    { title: '2006 年 12 月卡罗尔·卢米斯专访巴菲特：我为什么慷慨解囊', start: 1100, end: 1125 },
    { title: '2007 年 11 月比尔·盖茨与沃伦·巴菲特与大学生对话实录（节目《富豪面对面》）', start: 1125, end: 1225 },
    { title: '2008 年 2 月巴菲特答 Emory 与 Austin 大学商学院学生问', start: 1225, end: 1296 },
    { title: '2008 年 8 月瑞士洛桑国际管理学院对话巴菲特', start: 1296, end: 1462 },
    { title: '2008 年《纽约时报》巴菲特特稿：买入美国，正当时', start: 1462, end: 1484 },
    { title: '2008 年巴菲特和施瓦辛格在妇女大会上的对话：危机中，联邦政府必须举债', start: 1484, end: 1612 },
    { title: '2009 年3 月 9 日巴菲特专访：恐慌是会传染的，"我们必须做点什么"', start: 1612, end: 1747 },
    { title: '2009 年 7 月 9 日巴菲特接受 CNBC 采访', start: 1747, end: 1835 },
    { title: '2009 年 11 月 13 日巴菲特与比尔盖茨对话哥伦比亚大学商学院的学生（上）', start: 1835, end: 1943 },
    { title: '2009 年 11 月 13 日巴菲特与比尔盖茨对话哥伦比亚大学商学院的学生（下）', start: 1943, end: 2026 },
    { title: '2010 年巴菲特、芒格与盖茨深圳见面会纪要（但斌整理）', start: 2026, end: 2080 },
    { title: '2010 年 10 月 18 日巴菲特接受 CNBC 采访', start: 2080, end: 2131 },
    { title: '2011 年 5 月2 日巴菲特与杰克·韦尔奇接受 CNBC 采访', start: 2131, end: 2228 },
    { title: '2011 年 8 月 15 日巴菲特接受查理·罗斯的采访', start: 2228, end: 2414 },
    { title: '2018 年 1 月《时代周刊》巴菲特专栏文章：巴菲特分享美国财富的秘密', start: 2414, end: 2467 },
    { title: '2020 年2 月 24 日巴菲特接受 CNBC3 小时专访实录（上）', start: 2467, end: 2636 },
    { title: '2020 年2 月 24 日巴菲特接受 CNBC3 小时专访实录（中）', start: 2636, end: 2791 },
    { title: '2020 年2 月 24 日巴菲特接受 CNBC3 小时专访实录（下）', start: 2791, end: lines.length },
  ]

  const results = []

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i]
    let content = ''

    for (let lineIdx = article.start + 1; lineIdx < article.end; lineIdx++) {
      const line = lines[lineIdx]

      // Skip footers and page numbers
      if (line === '（完）' || line.match(/^\d+$/) || line.includes('www.') || line.length < 10) {
        continue
      }

      content += line + '\n\n'
    }

    content = content.trim()

    if (content.length > 200) {
      results.push({
        slug: `buffett-article-${results.length + 1}`,
        index: results.length + 1,
        title: article.title,
        content: content
      })

      console.log(`${results.length}. ${article.title} (${content.length} chars)`)
    }
  }

  console.log(`\nTotal articles: ${results.length}`)

  // Write to JSON
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8')
  console.log(`Written to ${outputPath}`)
}

parseDocument().catch(console.error)
