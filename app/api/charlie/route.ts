import { NextRequest, NextResponse } from 'next/server'
import { getAllCharlieArticles, getCharlieBySlug, searchCharlie, getCharlieParts } from '@/lib/charlie'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  if (searchParams.has('parts')) {
    return NextResponse.json({ parts: getCharlieParts() })
  }

  if (searchParams.has('slug')) {
    const article = getCharlieBySlug(searchParams.get('slug')!)
    if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ article })
  }

  if (searchParams.has('q')) {
    return NextResponse.json({ results: searchCharlie(searchParams.get('q')!) })
  }

  if (searchParams.has('articles')) {
    const articles = getAllCharlieArticles().map(({ content: _c, ...rest }) => rest)
    return NextResponse.json({ articles })
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}
