const mammoth = require('mammoth')
const fs = require('fs')
const path = require('path')

// Extract business logic book
async function extractBusinessLogic() {
  const docxPath = path.join(__dirname, '../../data/other books/段永平投资问答录-商业逻辑篇.docx')

  const result = await mammoth.convertToHtml({ path: docxPath }, {
    styleMap: [
      "p[style-name='Heading 1'] => h1:fresh",
      "p[style-name='Heading 2'] => h2:fresh"
    ]
  })

  const html = result.value

  // Parse HTML to extract structure
  const articles = []
  let currentPart = null
  let currentTitle = null
  let currentQA = null
  let currentContent = []
  let index = 0

  // Split by paragraphs
  const paragraphs = html.split(/<\/?p[^>]*>/).filter(p => p.trim())

  // Parts structure for business logic
  const parts = [
    "前言：买股票就是买公司",
    "第1节：伟大企业",
    "第2节：商业模式",
    "第3节：企业文化",
    "第4节：产品、差异化与创新",
    "第5节：品牌、营销与广告",
    "第6节：收购和多元化",
    "第7节：Stop doing list（不为清单）"
  ]

  let contentStarted = false

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i].replace(/<[^>]+>/g, '').trim()

    if (!p) continue

    // Skip until we find the first part
    if (!contentStarted) {
      if (p.includes('前言：买股票就是买公司') || p.includes('第1节：伟大企业')) {
        contentStarted = true
      } else {
        continue
      }
    }

    // Check if it's a part header (第X节)
    const partMatch = p.match(/^(前言：买股票就是买公司|第\d+节：[^）]+(?:）)?)$/)
    if (partMatch) {
      // Save previous article
      if (currentTitle && currentContent.length > 0 && currentContent.join('').length >= 50) {
        articles.push({
          slug: `duan-biz-${String(index).padStart(3, '0')}`,
          index: index,
          part_zh: currentPart,
          title_zh: currentTitle,
          content: currentContent.join('\n\n')
        })
        index++
      }

      currentPart = partMatch[1]
      currentTitle = null
      currentContent = []
      continue
    }

    // Check if it's a title (一、二、三... or numbered)
    const titleMatch = p.match(/^([一二三四五六七八九十]+、.+|第?\d+[、．].+)$/)
    if (titleMatch && currentPart) {
      // Save previous article
      if (currentTitle && currentContent.length > 0 && currentContent.join('').length >= 50) {
        articles.push({
          slug: `duan-biz-${String(index).padStart(3, '0')}`,
          index: index,
          part_zh: currentPart,
          title_zh: currentTitle,
          content: currentContent.join('\n\n')
        })
        index++
      }

      currentTitle = titleMatch[1]
      currentContent = []
      continue
    }

    // Collect content
    if (currentPart && currentTitle && p.length > 0) {
      currentContent.push(p)
    }
  }

  // Save last article
  if (currentTitle && currentContent.length > 0 && currentContent.join('').length >= 50) {
    articles.push({
      slug: `duan-biz-${String(index).padStart(3, '0')}`,
      index: index,
      part_zh: currentPart,
      title_zh: currentTitle,
      content: currentContent.join('\n\n')
    })
  }

  return articles
}

// Extract investment logic book
async function extractInvestmentLogic() {
  const docxPath = path.join(__dirname, '../../data/other books/段永平投资问答录-投资逻辑篇.docx')

  const result = await mammoth.convertToHtml({ path: docxPath })
  const html = result.value

  const articles = []
  let currentPart = null
  let currentTitle = null
  let currentContent = []
  let index = 0

  // Split by paragraphs
  const paragraphs = html.split(/<\/?p[^>]*>/).filter(p => p.trim())

  let contentStarted = false

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i].replace(/<[^>]+>/g, '').trim()

    if (!p) continue

    // Skip until we find the first chapter
    if (!contentStarted) {
      if (p.includes('前言') || p.includes('第一章')) {
        contentStarted = true
      } else {
        continue
      }
    }

    // Check if it's a chapter header
    const chapterMatch = p.match(/^(前言|第[一二三四五六七八九十]+章[：:].+)$/)
    if (chapterMatch) {
      // Save previous article
      if (currentTitle && currentContent.length > 0 && currentContent.join('').length >= 50) {
        articles.push({
          slug: `duan-invest-${String(index).padStart(3, '0')}`,
          index: index,
          part_zh: currentPart,
          title_zh: currentTitle,
          content: currentContent.join('\n\n')
        })
        index++
      }

      currentPart = chapterMatch[1]
      currentTitle = null
      currentContent = []
      continue
    }

    // Check if it's a section title (第X节：)
    const sectionMatch = p.match(/^(第\s*\d+\s*节[：:].+)$/)
    if (sectionMatch && currentPart) {
      // Save previous article
      if (currentTitle && currentContent.length > 0 && currentContent.join('').length >= 50) {
        articles.push({
          slug: `duan-invest-${String(index).padStart(3, '0')}`,
          index: index,
          part_zh: currentPart,
          title_zh: currentTitle,
          content: currentContent.join('\n\n')
        })
        index++
      }

      currentTitle = sectionMatch[1]
      currentContent = []
      continue
    }

    // Check for case studies (案例X：)
    const caseMatch = p.match(/^(案例\s*\d+[：:].+)$/)
    if (caseMatch && currentPart) {
      // Save previous article
      if (currentTitle && currentContent.length > 0 && currentContent.join('').length >= 50) {
        articles.push({
          slug: `duan-invest-${String(index).padStart(3, '0')}`,
          index: index,
          part_zh: currentPart,
          title_zh: currentTitle,
          content: currentContent.join('\n\n')
        })
        index++
      }

      currentTitle = caseMatch[1]
      currentContent = []
      continue
    }

    // Collect content
    if (currentPart && currentTitle && p.length > 0) {
      currentContent.push(p)
    }
  }

  // Save last article
  if (currentTitle && currentContent.length > 0 && currentContent.join('').length >= 50) {
    articles.push({
      slug: `duan-invest-${String(index).padStart(3, '0')}`,
      index: index,
      part_zh: currentPart,
      title_zh: currentTitle,
      content: currentContent.join('\n\n')
    })
  }

  return articles
}

// Main execution
async function main() {
  try {
    console.log('Extracting business logic book...')
    const bizArticles = await extractBusinessLogic()

    console.log('Extracting investment logic book...')
    const investArticles = await extractInvestmentLogic()

    // Save to files
    const bizOutputPath = path.join(__dirname, '../data/duan_biz.json')
    const investOutputPath = path.join(__dirname, '../data/duan_invest.json')

    fs.writeFileSync(bizOutputPath, JSON.stringify(bizArticles, null, 2))
    fs.writeFileSync(investOutputPath, JSON.stringify(investArticles, null, 2))

    // Report
    console.log('\n=== Business Logic Book ===')
    console.log(`Total articles: ${bizArticles.length}`)

    // Count by part
    const bizByPart = {}
    bizArticles.forEach(a => {
      bizByPart[a.part_zh] = (bizByPart[a.part_zh] || 0) + 1
    })
    console.log('\nArticles per part:')
    Object.entries(bizByPart).forEach(([part, count]) => {
      console.log(`  ${part}: ${count}`)
    })

    console.log('\nFirst 3 articles:')
    bizArticles.slice(0, 3).forEach(a => {
      console.log(`\n  [${a.slug}] ${a.part_zh} > ${a.title_zh}`)
      console.log(`  Content length: ${a.content.length} chars`)
      console.log(`  Preview: ${a.content.substring(0, 100)}...`)
    })

    console.log('\n\n=== Investment Logic Book ===')
    console.log(`Total articles: ${investArticles.length}`)

    // Count by part
    const investByPart = {}
    investArticles.forEach(a => {
      investByPart[a.part_zh] = (investByPart[a.part_zh] || 0) + 1
    })
    console.log('\nArticles per part:')
    Object.entries(investByPart).forEach(([part, count]) => {
      console.log(`  ${part}: ${count}`)
    })

    console.log('\nFirst 3 articles:')
    investArticles.slice(0, 3).forEach(a => {
      console.log(`\n  [${a.slug}] ${a.part_zh} > ${a.title_zh}`)
      console.log(`  Content length: ${a.content.length} chars`)
      console.log(`  Preview: ${a.content.substring(0, 100)}...`)
    })

  } catch (err) {
    console.error('Error:', err)
  }
}

main()
