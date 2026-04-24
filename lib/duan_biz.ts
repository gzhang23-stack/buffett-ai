import fs from 'fs'
import path from 'path'

export interface DuanBizArticle {
  slug: string
  index: number
  title_zh: string
  content: string
}

let _articles: DuanBizArticle[] | null = null

function loadArticles(): DuanBizArticle[] {
  if (_articles) return _articles
  const filePath = path.join(process.cwd(), 'data', 'duan_biz.json')
  const raw = fs.readFileSync(filePath, 'utf-8')
  _articles = JSON.parse(raw)
  return _articles!
}

export function getAllDuanBizArticles(): DuanBizArticle[] {
  return loadArticles()
}

export function getDuanBizBySlug(slug: string): DuanBizArticle | null {
  return loadArticles().find(a => a.slug === slug) ?? null
}

export function searchDuanBiz(query: string, topK = 8) {
  const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 0)
  if (keywords.length === 0) return []

  const articles = loadArticles()
  const results: Array<{ article: DuanBizArticle; score: number; excerpt: string }> = []

  for (const article of articles) {
    const fullText = [article.title_zh, article.content].join(' ').toLowerCase()
    let score = 0
    for (const kw of keywords) {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const matches = fullText.match(new RegExp(escaped, 'g'))
      score += matches ? matches.length : 0
    }
    if (score > 0) {
      const kwIdx = fullText.indexOf(keywords[0])
      const excerptStart = Math.max(0, kwIdx - 30)
      const excerpt = fullText.slice(excerptStart, excerptStart + 180).trim() + '...'
      results.push({ article, score, excerpt })
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, topK)
}
