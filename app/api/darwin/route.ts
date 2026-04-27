import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface Article {
  slug: string
  index: number
  part: string
  title: string
  content: string
}

interface PartGroup {
  part: string
  count: number
}

interface SearchResult {
  article: {
    slug: string
    index: number
    part: string
    title: string
  }
  excerpt: string
  score: number
}

const dataPath = path.join(process.cwd(), 'data', 'darwin', 'darwin.json')

function loadArticles(): Article[] {
  try {
    const raw = fs.readFileSync(dataPath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const articles = loadArticles()

  // 获取部分列表
  if (searchParams.get('parts') === '1') {
    const partMap = new Map<string, number>()
    articles.forEach(a => {
      partMap.set(a.part, (partMap.get(a.part) || 0) + 1)
    })
    const parts: PartGroup[] = Array.from(partMap.entries()).map(([part, count]) => ({ part, count }))
    return NextResponse.json({ parts })
  }

  // 获取文章元数据列表
  if (searchParams.get('articles') === '1') {
    const meta = articles.map(a => ({
      slug: a.slug,
      index: a.index,
      part: a.part,
      title: a.title,
    }))
    return NextResponse.json({ articles: meta })
  }

  // 搜索
  const q = searchParams.get('q')
  if (q) {
    const query = q.toLowerCase()
    const results: SearchResult[] = []
    articles.forEach(article => {
      const content = article.content.toLowerCase()
      const idx = content.indexOf(query)
      if (idx !== -1) {
        const start = Math.max(0, idx - 60)
        const end = Math.min(content.length, idx + query.length + 60)
        let excerpt = article.content.slice(start, end)
        if (start > 0) excerpt = '...' + excerpt
        if (end < content.length) excerpt = excerpt + '...'
        results.push({
          article: {
            slug: article.slug,
            index: article.index,
            part: article.part,
            title: article.title,
          },
          excerpt,
          score: 1,
        })
      }
    })
    return NextResponse.json({ results })
  }

  // 获取单篇文章
  const slug = searchParams.get('slug')
  if (slug) {
    const article = articles.find(a => a.slug === slug)
    if (!article) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 })
    }
    return NextResponse.json({ article })
  }

  return NextResponse.json({ error: '缺少参数' }, { status: 400 })
}
