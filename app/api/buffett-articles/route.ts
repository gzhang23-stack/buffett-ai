import { NextRequest, NextResponse } from 'next/server'
import { getAllBuffettArticles, getBuffettArticleBySlug, searchBuffettArticles } from '@/lib/buffett-articles'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  if (searchParams.has('articles')) {
    const articles = getAllBuffettArticles()
    return NextResponse.json({ articles })
  }

  if (searchParams.has('slug')) {
    const slug = searchParams.get('slug')!
    const article = getBuffettArticleBySlug(slug)
    if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    return NextResponse.json({ article })
  }

  if (searchParams.has('q')) {
    const query = searchParams.get('q')!
    const results = searchBuffettArticles(query)
    return NextResponse.json({ results })
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}
