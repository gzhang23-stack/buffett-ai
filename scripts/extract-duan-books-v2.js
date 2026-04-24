const mammoth = require('mammoth')
const fs = require('fs')
const path = require('path')

// Extract business logic book
async function extractBusinessLogic() {
  const docxPath = path.join(__dirname, '../../data/other books/段永平投资问答录-商业逻辑篇.docx')

  const result = await mammoth.extractRawText({ path: docxPath })
  const lines = result.value.split('\n').map(l => l.trim()).filter(l => l)

  const articles = []
  let currentPart = null
  let currentTitle = null
  let currentContent = []
  let index = 0

  // Find content start (after TOC)
  let contentStart = -1
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === '前言：买股票就是买公司' && i > 50) {
      contentStart = i
      break
    }
  }

  if (contentStart === -1) {
    throw new Error('Cannot find content start')
  }

  for (let i = contentStart; i < lines.length; i++) {
    const line = lines[i]

    // Check for part headers (第X节：)
    const partMatch = line.match(/^(前言：买股票就是买公司|第\s*\d+\s*节[：:].+)$/)
    if (partMatch) {
      // Save previous article
      if (currentTitle && currentContent.length > 0) {
        const content = currentContent.join('\n\n')
        if (content.length >= 50) {
          articles.push({
            slug: `duan-biz-${String(index).padStart(3, '0')}`,
            index: index,
            part_zh: currentPart,
            title_zh: currentTitle,
            content: content
          })
          index++
        }
      }

      currentPart = partMatch[1]
      currentTitle = null
      currentContent = []

      // For "前言", treat the whole section as one article
      if (currentPart === '前言：买股票就是买公司') {
        currentTitle = '前言：买股票就是买公司'
      }
      continue
    }

    // Check for title headers (一、二、三...)
    const titleMatch = line.match(/^([一二三四五六七八九十]+、.+)$/)
    if (titleMatch && currentPart && currentPart !== '前言：买股票就是买公司') {
      // Save previous article
      if (currentTitle && currentContent.length > 0) {
        const content = currentContent.join('\n\n')
        if (content.length >= 50) {
          articles.push({
            slug: `duan-biz-${String(index).padStart(3, '0')}`,
            index: index,
            part_zh: currentPart,
            title_zh: currentTitle,
            content: content
          })
          index++
        }
      }

      currentTitle = titleMatch[1]
      currentContent = []
      continue
    }

    // Check for numbered titles (1、2、3...)
    const numberedMatch = line.match(/^(\d+、.+)$/)
    if (numberedMatch && currentPart && currentPart !== '前言：买股票就是买公司' && line.length < 100) {
      // Save previous article
      if (currentTitle && currentContent.length > 0) {
        const content = currentContent.join('\n\n')
        if (content.length >= 50) {
          articles.push({
            slug: `duan-biz-${String(index).padStart(3, '0')}`,
            index: index,
            part_zh: currentPart,
            title_zh: currentTitle,
            content: content
          })
          index++
        }
      }

      currentTitle = numberedMatch[1]
      currentContent = []
      continue
    }

    // Stop at "感谢" section
    if (line === '感谢') {
      break
    }

    // Collect content
    if (currentPart && currentTitle && line.length > 0) {
      currentContent.push(line)
    }
  }

  // Save last article
  if (currentTitle && currentContent.length > 0) {
    const content = currentContent.join('\n\n')
    if (content.length >= 50) {
      articles.push({
        slug: `duan-biz-${String(index).padStart(3, '0')}`,
        index: index,
        part_zh: currentPart,
        title_zh: currentTitle,
        content: content
      })
    }
  }

  return articles
}

// Extract investment logic book
async function extractInvestmentLogic() {
  const docxPath = path.join(__dirname, '../../data/other books/段永平投资问答录-投资逻辑篇.docx')

  const result = await mammoth.extractRawText({ path: docxPath })
  const lines = result.value.split('\n').map(l => l.trim()).filter(l => l)

  const articles = []
  let currentPart = null
  let currentTitle = null
  let currentContent = []
  let index = 0

  // Find content start (after TOC) - look for 前言 first
  let contentStart = -1
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === '前言' && i > 15 && i < 30) {
      contentStart = i
      break
    }
  }

  // If no 前言 found, look for 第一章
  if (contentStart === -1) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('第一章') && i > 50) {
        contentStart = i
        break
      }
    }
  }

  if (contentStart === -1) {
    throw new Error('Cannot find content start')
  }

  let seenPreface = false

  for (let i = contentStart; i < lines.length; i++) {
    const line = lines[i]

    // Check for chapter headers (前言, 第X章：) - skip TOC entries (those with tabs)
    const chapterMatch = line.match(/^(前言|第[一二三四五六七八九十]+章\s+.+)$/)
    if (chapterMatch && !line.includes('\t')) {
      // Skip duplicate "前言" (only process the first one)
      if (chapterMatch[1] === '前言' && seenPreface) {
        continue
      }
      if (chapterMatch[1] === '前言') {
        seenPreface = true
      }

      // Save previous article
      if (currentTitle && currentContent.length > 0) {
        const content = currentContent.join('\n\n')
        if (content.length >= 50) {
          articles.push({
            slug: `duan-invest-${String(index).padStart(3, '0')}`,
            index: index,
            part_zh: currentPart,
            title_zh: currentTitle,
            content: content
          })
          index++
        }
      }

      currentPart = chapterMatch[1]
      currentTitle = null
      currentContent = []

      // For "前言", treat the whole section as one article
      if (currentPart === '前言') {
        currentTitle = '前言'
      }
      continue
    }

    // Check for section headers (第X节)
    const sectionMatch = line.match(/^(第\s*\d+\s*节\s+.+)$/)
    if (sectionMatch && currentPart && currentPart !== '前言') {
      // Save previous article
      if (currentTitle && currentContent.length > 0) {
        const content = currentContent.join('\n\n')
        if (content.length >= 50) {
          articles.push({
            slug: `duan-invest-${String(index).padStart(3, '0')}`,
            index: index,
            part_zh: currentPart,
            title_zh: currentTitle,
            content: content
          })
          index++
        }
      }

      currentTitle = sectionMatch[1]
      currentContent = []
      continue
    }

    // Check for case studies (案例X：)
    const caseMatch = line.match(/^(案例\s*\d+\s*[：:].+)$/)
    if (caseMatch && currentPart && currentPart !== '前言') {
      // Save previous article
      if (currentTitle && currentContent.length > 0) {
        const content = currentContent.join('\n\n')
        if (content.length >= 50) {
          articles.push({
            slug: `duan-invest-${String(index).padStart(3, '0')}`,
            index: index,
            part_zh: currentPart,
            title_zh: currentTitle,
            content: content
          })
          index++
        }
      }

      currentTitle = caseMatch[1]
      currentContent = []
      continue
    }

    // Stop at "结尾" or "附录"
    if (line === '结尾' || line === '附录') {
      break
    }

    // Collect content
    if (currentPart && currentTitle && line.length > 0) {
      currentContent.push(line)
    }
  }

  // Save last article
  if (currentTitle && currentContent.length > 0) {
    const content = currentContent.join('\n\n')
    if (content.length >= 50) {
      articles.push({
        slug: `duan-invest-${String(index).padStart(3, '0')}`,
        index: index,
        part_zh: currentPart,
        title_zh: currentTitle,
        content: content
      })
    }
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

    console.log('\nFirst 3 articles from first part:')
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

    console.log('\nFirst 3 articles from first part:')
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
