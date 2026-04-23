import fs from 'fs'
import path from 'path'

export interface LenyanArticle {
  slug: string
  title: string
  date: string
  index: number
}

let _articles: LenyanArticle[] | null = null
let _rawText: string | null = null

function getRawText(): string {
  if (_rawText) return _rawText
  const filePath = path.join(process.cwd(), 'data', 'lenyan.txt')
  _rawText = fs.readFileSync(filePath, 'utf8')
  return _rawText
}

function parseArticles(): LenyanArticle[] {
  if (_articles) return _articles

  const text = getRawText()
  const lines = text.split(/\r?\n/)
  const dateRegex = /^[A-Z][a-z]+,\s*\d+\s*[A-Za-z]+\s*\d{4}\s*$/
  const articles: LenyanArticle[] = []

  for (let i = 0; i < lines.length; i++) {
    if (dateRegex.test(lines[i].trim())) {
      const title = i > 0 ? lines[i - 1].trim() : ''
      if (title && !title.startsWith('www.') && title.length > 1) {
        const slug = `article-${articles.length + 1}`
        articles.push({
          slug,
          title,
          date: lines[i].trim(),
          index: articles.length,
        })
      }
    }
  }

  _articles = articles
  return articles
}

export function getAllArticles(): LenyanArticle[] {
  return parseArticles()
}

export function getArticleBySlug(slug: string): { article: LenyanArticle; content: string } | null {
  const articles = parseArticles()
  const idx = articles.findIndex((a) => a.slug === slug)
  if (idx === -1) return null

  const text = getRawText()
  const lines = text.split(/\r?\n/)
  const dateRegex = /^[A-Z][a-z]+,\s*\d+\s*[A-Za-z]+\s*\d{4}\s*$/

  // Find all date line positions
  const datePositions: number[] = []
  for (let i = 0; i < lines.length; i++) {
    if (dateRegex.test(lines[i].trim())) {
      const prevTitle = i > 0 ? lines[i - 1].trim() : ''
      if (prevTitle && !prevTitle.startsWith('www.') && prevTitle.length > 1) {
        datePositions.push(i)
      }
    }
  }

  const startLine = datePositions[idx] + 1
  const endLine = idx + 1 < datePositions.length ? datePositions[idx + 1] - 1 : lines.length

  const content = lines
    .slice(startLine, endLine)
    .join('\n')
    .trim()

  return { article: articles[idx], content }
}

export function searchArticles(query: string, topK = 8): Array<{
  article: LenyanArticle
  excerpt: string
  score: number
}> {
  const keywords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 0)
  if (keywords.length === 0) return []

  const articles = getAllArticles()
  const text = getRawText()
  const lines = text.split(/\r?\n/)
  const dateRegex = /^[A-Z][a-z]+,\s*\d+\s*[A-Za-z]+\s*\d{4}\s*$/

  const datePositions: number[] = []
  for (let i = 0; i < lines.length; i++) {
    if (dateRegex.test(lines[i].trim())) {
      const prevTitle = i > 0 ? lines[i - 1].trim() : ''
      if (prevTitle && !prevTitle.startsWith('www.') && prevTitle.length > 1) {
        datePositions.push(i)
      }
    }
  }

  const results: Array<{ article: LenyanArticle; score: number; excerpt: string }> = []

  for (let idx = 0; idx < articles.length; idx++) {
    const startLine = datePositions[idx] + 1
    const endLine = idx + 1 < datePositions.length ? datePositions[idx + 1] - 1 : lines.length
    const content = lines.slice(startLine, endLine).join(' ')
    const searchTarget = (articles[idx].title + ' ' + content).toLowerCase()

    let score = 0
    for (const kw of keywords) {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const matches = searchTarget.match(new RegExp(escaped, 'g'))
      score += matches ? matches.length : 0
    }

    if (score > 0) {
      const kwIdx = searchTarget.indexOf(keywords[0])
      const excerptStart = Math.max(0, kwIdx - 40)
      const excerpt = content.slice(excerptStart, excerptStart + 200).trim() + '...'
      results.push({ article: articles[idx], score, excerpt })
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, topK)
}
