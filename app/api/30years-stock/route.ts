import { NextRequest, NextResponse } from 'next/server'
import { getAllThirtyYearsStockArticles, getThirtyYearsStockArticleBySlug, searchThirtyYearsStockArticles } from '@/lib/30years-stock'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  if (searchParams.has('articles')) {
    const articles = getAllThirtyYearsStockArticles()
    return NextResponse.json({ articles })
  }

  if (searchParams.has('slug')) {
    const slug = searchParams.get('slug')!
    const article = getThirtyYearsStockArticleBySlug(slug)
    if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    return NextResponse.json({ article })
  }

  if (searchParams.has('q')) {
    const query = searchParams.get('q')!
    const results = searchThirtyYearsStockArticles(query)
    return NextResponse.json({ results })
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}
