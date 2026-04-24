const mammoth = require('mammoth')
const fs = require('fs')
const path = require('path')

const docPath = path.join(__dirname, '../../data/other books/查理芒格的100个思维模型.docx')
const outputPath = path.join(__dirname, '../data/munger-models.json')

async function parseDocument() {
  console.log('Reading document...')
  const result = await mammoth.extractRawText({ path: docPath })
  const text = result.value
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)

  console.log(`Total lines: ${lines.length}`)

  // Find the start of actual content (line 104 based on our inspection)
  const contentStart = 103 // Line "1. 机会成本 思维模型..."

  const modelsMap = new Map() // Use Map to avoid duplicates

  for (let i = contentStart; i < lines.length; i++) {
    const line = lines[i]

    // Match patterns like "1.机会成本思维模型" or "10.时光机思维模型"
    const titleMatch = line.match(/^(\d+)\.\s*(.+)/)

    if (titleMatch) {
      const index = parseInt(titleMatch[1])

      // Only process models 1-100
      if (index < 1 || index > 100) continue

      // Skip if already exists (avoid list items overwriting real models)
      if (modelsMap.has(index)) continue

      let title = titleMatch[2].trim()

      // Extract just the title part (before the description starts)
      // Titles usually end with "思维模型" or "原理" or "理论" etc.
      const titleEndMatch = title.match(/^([^：:""]+(?:思维模型|原理|理论|系统|效应|法则|定律))/)
      if (titleEndMatch) {
        title = titleEndMatch[1].trim()
      } else {
        // If no clear ending, take first part before colon or quote
        const colonIndex = title.search(/[：:""]/);
        if (colonIndex > 0) {
          title = title.substring(0, colonIndex).trim()
        }
      }

      // Skip if title is too short (likely a list item)
      if (title.length < 4) continue

      const model = {
        slug: `model-${index}`,
        index: index,
        title: title,
        content: titleMatch[2].trim() // Start with full line content
      }

      modelsMap.set(index, model)
      console.log(`Found model ${index}: ${title}`)
    } else {
      // Add content to the most recent model
      const lastIndex = Array.from(modelsMap.keys()).pop()
      if (lastIndex && line.length > 0) {
        const model = modelsMap.get(lastIndex)
        if (line === '查理芒格的 100 个思维模型') continue
        model.content += '\n\n' + line
      }
    }
  }

  // Convert map to array and sort by index
  const models = Array.from(modelsMap.values()).sort((a, b) => a.index - b.index)

  console.log(`\nTotal models found: ${models.length}`)

  // Clean up content
  const cleanedModels = models.map(m => ({
    slug: m.slug,
    index: m.index,
    title: m.title,
    content: m.content.trim()
  }))

  // Write to JSON
  fs.writeFileSync(outputPath, JSON.stringify(cleanedModels, null, 2), 'utf-8')
  console.log(`Written to ${outputPath}`)

  // Print first and last few models for verification
  console.log('\nFirst 10 models:')
  cleanedModels.slice(0, 10).forEach(m => {
    console.log(`${m.index}. ${m.title} (${m.content.length} chars)`)
  })

  console.log('\nLast 10 models:')
  cleanedModels.slice(-10).forEach(m => {
    console.log(`${m.index}. ${m.title} (${m.content.length} chars)`)
  })
}

parseDocument().catch(console.error)
