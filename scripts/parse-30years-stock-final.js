const mammoth = require('mammoth')
const fs = require('fs')
const path = require('path')

const docPath = 'd:/AI编程/claude测试/VS code claude/data/other books/三十年股票投资心得.docx'
const outputPath = path.join(__dirname, '../data/30years-stock.json')

async function parseDocument() {
  console.log('Reading document...')
  const result = await mammoth.extractRawText({ path: docPath })
  const text = result.value
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)

  console.log(`Total lines: ${lines.length}`)

  // Define chapters based on table of contents
  const chapters = [
    { title: '马来西亚股市简史', start: 250 },
    { title: '股票投资的好处与坏处', start: 310 },
    { title: '股市大崩溃的教训', start: 360 },
    { title: '你就是老板', start: 420 },
    { title: '股票的种类与形式', start: 480 },
    { title: '常用的价值评估标准', start: 600 },
    { title: '收集资料', start: 700 },
    { title: '阅读公司年报', start: 750 },
    { title: '深读招股说明书', start: 820 },
    { title: '财报读透透：引言', start: 880 },
    { title: '财报读透透：财务摘要表', start: 920 },
    { title: '财报读透透：资产负债表', start: 1000 },
    { title: '财报读透透：损益表', start: 1150 },
    { title: '财报读透透：现金流量表', start: 1250 },
    { title: '财报读透透：结论', start: 1350 },
    { title: '股票价值评估', start: 1400 },
    { title: '怎样预测股价', start: 1460 },
    { title: '怎样评估种值股', start: 1520 },
    { title: '怎样发掘成长股', start: 1580 },
    { title: '怎样作出买进股票的决定', start: 1680 },
    { title: '只买名单中的股票', start: 1730 },
    { title: '股票组合管理', start: 1780 },
    { title: '怎样发掘股票的潜能', start: 1830 },
    { title: '保本至上', start: 1980 },
    { title: '富向RUG中求', start: 2050 },
    { title: '选股五准则排行榜', start: 2150 },
    { title: '可远观不可近玩', start: 2230 },
    { title: '莫看波浪看潮汐', start: 2280 },
    { title: '多看公司少看股市', start: 2330 },
    { title: '股票的短中及长期投资', start: 2390 },
    { title: '如何在牛熊和淡市中投资', start: 2480 },
    { title: '借钱五铁则', start: 2580 },
    { title: '慎防资产陷阱', start: 2640 },
    { title: '冷眼方程式', start: 2700 },
    { title: '反向选公司', start: 2850 },
    { title: '反向选行业', start: 2930 },
    { title: '投机何以亏多赚少', start: 3010 },
    { title: '散户的通病', start: 3080 },
    { title: '先了解后参股', start: 3200 },
    { title: '向严元章学习股票投资', start: 3280 },
    { title: '邓普顿投资金言', start: 3360 },
    { title: '老老实实投资', start: 3450 },
    { title: '一万变百万', start: 3530 },
  ]

  const results = []

  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i]
    const nextChapter = i < chapters.length - 1 ? chapters[i + 1] : null
    const endLine = nextChapter ? nextChapter.start : Math.min(chapter.start + 300, lines.length)

    let contentLines = []
    for (let lineIdx = chapter.start; lineIdx < endLine; lineIdx++) {
      if (lineIdx >= lines.length) break
      const line = lines[lineIdx]

      // Skip very short lines, page numbers, headers, watermarks, and image text
      if (
        line.length < 10 ||
        line.match(/^\d+$/) ||
        line.match(/^[①②③④⑤⑥⑦⑧⑨]/) ||
        line.includes('冷眼') && line.includes('30年股票投资心得') ||
        line.includes('目录') ||
        line.match(/^第[一二三四五六七八]辑/) ||
        line.includes('扫描全能王') ||
        line.includes('扫描创建') ||
        line.match(/^由.*扫描/) ||
        line.match(/^\d+\s*冷眼/) ||
        line.match(/修\s*订\s*版/) && line.length < 30 ||
        // Filter out image-related text patterns
        line.includes('FIRST DEALS') ||
        line.includes('STOCK EXCHANGE') ||
        line.includes('Promotion') ||
        line.match(/^[A-Z\s]{20,}$/) || // Lines with only uppercase letters and spaces (likely image text)
        line.match(/Aot\s+the\s+Federation/) ||
        line.match(/Top\s+30\s+stocks/) ||
        line.match(/All-time high/) ||
        line.match(/Friday's close/) ||
        line.match(/Listed since/) ||
        line.match(/Note.*Source.*Bloomberg/) ||
        line.match(/^\d{2}\/\d{1,2}\/\d{2}$/) || // Date patterns from image captions
        // Filter out OCR garbage from images
        line.match(/Federaionzhw|stocr|eschstge|betweea|2and4p\.m|yestarca|ofiL|estabEsh/i) ||
        line.match(/[a-z]{3,}[A-Z][a-z]+[A-Z]/) || // Mixed case gibberish like "yestarca7Lhe"
        line.match(/\b[a-zA-Z]{2,}\d+[a-zA-Z]{2,}\b/) // Letters mixed with numbers like "yestarca7Lhe"
      ) {
        continue
      }

      contentLines.push(line)
    }

    // Smart merge: combine lines that should be together
    let content = ''
    for (let i = 0; i < contentLines.length; i++) {
      const line = contentLines[i]
      const nextLine = i < contentLines.length - 1 ? contentLines[i + 1] : null

      // Check if current line ends with sentence-ending punctuation
      const endsWithPunctuation = /[。！？…」』"'）\)～]$/.test(line)

      // Check if next line starts with lowercase or continues mid-sentence
      const nextContinues = nextLine && /^[，、；：]/.test(nextLine)

      if (endsWithPunctuation && !nextContinues) {
        // This line is complete, add paragraph break
        content += line + '\n\n'
      } else if (nextContinues) {
        // Next line continues with punctuation, merge without space
        content += line
      } else {
        // Merge lines that were broken mid-sentence
        content += line
      }
    }

    content = content.trim()

    if (content.length > 200) {
      results.push({
        slug: `30years-stock-${results.length + 1}`,
        index: results.length + 1,
        title: chapter.title,
        content: content
      })

      console.log(`${results.length}. ${chapter.title} (${content.length} chars)`)
    }
  }

  console.log(`\nTotal chapters: ${results.length}`)

  // Write to JSON
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8')
  console.log(`Written to ${outputPath}`)
}

parseDocument().catch(console.error)
