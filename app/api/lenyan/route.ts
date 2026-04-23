import { NextRequest, NextResponse } from 'next/server'
import { getAllArticles, getArticleBySlug, searchArticles } from '@/lib/lenyan'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  if (searchParams.has('articles')) {
    const articles = getAllArticles()
    return NextResponse.json({ articles })
  }

  if (searchParams.has('slug')) {
    const slug = searchParams.get('slug')!
    const result = getArticleBySlug(slug)
    if (!result) return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    return NextResponse.json({ article: result.article, content: result.content })
  }

  if (searchParams.has('q')) {
    const query = searchParams.get('q')!
    const results = searchArticles(query)
    return NextResponse.json({ results })
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}
