const mammoth = require('mammoth')
const fs = require('fs')
const path = require('path')

const docPath = 'd:/AI编程/claude测试/VS code claude/data/other books/冷眼分享集.docx'
const outputPath = path.join(__dirname, '../data/lenyan.json')

async function parseDocument() {
  console.log('Reading document...')
  const result = await mammoth.extractRawText({ path: docPath })
  const text = result.value
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)

  console.log(`Total lines: ${lines.length}`)

  // Find the start of actual content (after table of contents)
  let contentStart = 0
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('股票投资正道') && lines[i].includes('开场白') && i > 50) {
      contentStart = i
      console.log(`Content starts at line ${i}: ${lines[i]}`)
      break
    }
  }

  const articles = []

  // First, add the introduction article manually
  articles.push({
    slug: 'lenyan-0',
    index: 0,
    title: '关于冷眼与《冷眼分享集》',
    content: `冷眼，原名冯时能，马来西亚著名华人投资家、财经专栏作家。他是马来西亚股票投资界的传奇人物，被誉为马来西亚股神。

冷眼先生从事新闻工作超过40年，曾任《南洋商报》总编辑。他在股票投资领域深耕数十年，坚持价值投资理念，强调基本面分析，反对投机炒作。他的投资哲学深受本杰明·格雷厄姆和沃伦·巴菲特的影响，主张买股票就是买公司股份的核心理念。

冷眼的投资方法可以概括为冷眼方程式：反向 + 成长 + 时间 = 财富。这个简单而深刻的公式，帮助无数投资者在股市中找到了正确的方向。

关于《冷眼分享集》

《冷眼分享集》是冷眼先生在《南洋商报》开设的投资专栏文章合集。这些文章记录了他30多年的股票投资心得，涵盖了价值投资的核心理念、选股方法、风险控制、投资心态等各个方面。

本书的特点：

1. 实战经验丰富：所有观点都来自作者数十年的实际投资经验，而非纸上谈兵。

2. 理念清晰明确：始终坚持价值投资的正道，反对投机炒作，强调长期持有优质股票。

3. 语言通俗易懂：用简单的语言阐述深刻的投资道理，适合各个层次的投资者阅读。

4. 本土化案例：以马来西亚股市为背景，但投资原理具有普遍适用性。

5. 循序渐进：从基本概念到具体方法，从投资理念到实战技巧，层层深入。

冷眼的核心投资理念：

• 买股票就是买公司股份，不是买赌桌上的筹码
• 股票投资要循正道，从商业角度进行基本面分析
• 选择有成长潜力的优质公司，低价买入，长期持有
• 反向投资：在别人恐惧时贪婪，在别人贪婪时恐惧
• 时间是投资者的朋友，复利是财富增长的关键
• 做功课是投资成功的基本条件，不了解的公司不要买

《冷眼分享集》不仅是一本投资指南，更是一位智者的人生智慧分享。通过这些文章，读者不仅能学到投资知识，更能培养正确的投资心态和人生态度。

对于华人投资者而言，冷眼的著作具有特殊的意义。他用中文写作，以华人的视角和思维方式，将西方的价值投资理念与东方的智慧相结合，创造出独特的投资哲学。他的成功证明了，只要坚持正确的理念和方法，普通投资者也能在股市中获得长期稳定的回报。

本专栏收录了冷眼先生在《南洋商报》发表的系列文章，按主题分类整理，方便读者系统学习。无论你是股市新手还是资深投资者，都能从中获得启发和指导。`
  })

  let currentArticle = null
  let articleIndex = 0

  for (let i = contentStart; i < lines.length; i++) {
    const line = lines[i]
    const nextLine = i + 1 < lines.length ? lines[i + 1] : ''

    // Check if this is a date line
    const isDateLine = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s+\d{2}\s+\w+\s+\d{4}/.test(nextLine)

    // Check if line looks like a title
    const looksLikeTitle = line.length < 100 &&
                          line.length > 5 &&
                          /[一-龥]/.test(line) &&
                          !line.includes('www.') &&
                          !line.includes('http') &&
                          !line.includes('冷眼分享集') &&
                          !line.includes('（全）') &&
                          isDateLine

    if (looksLikeTitle) {
      // Save previous article
      if (currentArticle && currentArticle.content.trim().length > 100) {
        articles.push(currentArticle)
      }

      articleIndex++
      const title = line.trim()

      currentArticle = {
        slug: `lenyan-${articleIndex}`,
        index: articleIndex,
        title: title,
        content: '',
        date: nextLine
      }

      console.log(`Found article ${articleIndex}: ${title}`)
      i++ // Skip the date line
    } else if (currentArticle && line.length > 0) {
      // Skip lines that look like headers or footers
      if (line.includes('www.oomoney.com') ||
          line === '冷眼分享集' ||
          line === '（全）' ||
          line === '冷眼' ||
          line.match(/^\d+$/)) { // Skip page numbers
        continue
      }

      // Add content to current article
      currentArticle.content += line + '\n\n'
    }
  }

  // Save last article
  if (currentArticle && currentArticle.content.trim().length > 100) {
    articles.push(currentArticle)
  }

  console.log(`\nTotal articles found: ${articles.length}`)

  // Clean up titles - remove (第X篇) and (完结篇)
  const cleanedArticles = articles.map(a => ({
    slug: a.slug,
    index: a.index,
    title: a.title
      .replace(/\s*\(第\s*\d+\s*篇\)/g, '')
      .replace(/\s*\(完结篇\)/g, '')
      .replace(/\s*（第\s*\d+\s*篇）/g, '')
      .replace(/\s*（完结篇）/g, '')
      .trim(),
    content: a.content.trim()
  }))

  // Write to JSON
  fs.writeFileSync(outputPath, JSON.stringify(cleanedArticles, null, 2), 'utf-8')
  console.log(`Written to ${outputPath}`)

  // Print articles for verification
  console.log('\nFirst 15 articles:')
  cleanedArticles.slice(0, 15).forEach(a => {
    console.log(`${a.index}. ${a.title} (${a.content.length} chars)`)
  })

  console.log('\nLast 5 articles:')
  cleanedArticles.slice(-5).forEach(a => {
    console.log(`${a.index}. ${a.title} (${a.content.length} chars)`)
  })

  // Check for missing articles
  console.log('\nChecking for key articles:')
  const keyArticles = ['一念定吉凶', 'Buy American', '后会有期']
  keyArticles.forEach(key => {
    const found = cleanedArticles.find(a => a.title.includes(key))
    console.log(`${key}: ${found ? '✓ Found at index ' + found.index : '✗ Missing'}`)
  })
}

parseDocument().catch(console.error)
