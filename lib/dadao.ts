import fs from 'fs'
import path from 'path'

export interface DadaoArticle {
  slug: string
  index: number
  chapter: string
  section: string
  content: string
}

let _articles: DadaoArticle[] | null = null

function loadArticles(): DadaoArticle[] {
  if (_articles) return _articles
  const filePath = path.join(process.cwd(), 'data', 'dadao.json')
  const raw = fs.readFileSync(filePath, 'utf-8')
  _articles = JSON.parse(raw)
  return _articles!
}

export function getAllDadaoArticles(): DadaoArticle[] {
  return loadArticles()
}

export function getDadaoChapters(): { chapter: string; count: number }[] {
  const articles = loadArticles()
  const seen = new Set<string>()
  const chapters: { chapter: string; count: number }[] = []

  for (const a of articles) {
    if (!seen.has(a.chapter)) {
      seen.add(a.chapter)
      const count = articles.filter(art => art.chapter === a.chapter).length
      chapters.push({ chapter: a.chapter, count })
    }
  }

  return chapters
}

export function getDadaoBySlug(slug: string): DadaoArticle | null {
  return loadArticles().find(a => a.slug === slug) ?? null
}

export function searchDadao(query: string, topK = 8) {
  const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 0)
  if (keywords.length === 0) return []

  const articles = loadArticles()
  const results: Array<{ article: DadaoArticle; score: number; excerpt: string }> = []

  for (const article of articles) {
    const fullText = [article.chapter, article.section, article.content].join(' ').toLowerCase()
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
