import { NextRequest, NextResponse } from 'next/server'
import { getAllUnscriptedArticles, getUnscriptedParts, getUnscriptedBySlug, searchUnscripted } from '@/lib/unscripted'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  if (searchParams.has('articles')) {
    const part = searchParams.get('part') ?? undefined
    let articles = getAllUnscriptedArticles()
    if (part) articles = articles.filter(a => a.part_en === part)
    return NextResponse.json({ articles: articles.map(a => ({
      slug: a.slug,
      index: a.index,
      title_en: a.title_en,
      title_zh: a.title_zh,
      part_en: a.part_en,
      part_zh: a.part_zh,
    })) })
  }

  if (searchParams.has('parts')) {
    return NextResponse.json({ parts: getUnscriptedParts() })
  }

  if (searchParams.has('slug')) {
    const slug = searchParams.get('slug')!
    const article = getUnscriptedBySlug(slug)
    if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ article })
  }

  if (searchParams.has('q')) {
    const query = searchParams.get('q')!
    const results = searchUnscripted(query)
    return NextResponse.json({ results })
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}
