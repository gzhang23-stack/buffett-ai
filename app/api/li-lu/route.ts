import { NextRequest, NextResponse } from 'next/server'
import { getAllLiLuArticles, getLiLuBySlug, searchLiLu, getLiLuParts } from '@/lib/li_lu'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  if (searchParams.has('parts')) {
    return NextResponse.json({ parts: getLiLuParts() })
  }

  if (searchParams.has('slug')) {
    const article = getLiLuBySlug(searchParams.get('slug')!)
    if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ article })
  }

  if (searchParams.has('q')) {
    return NextResponse.json({ results: searchLiLu(searchParams.get('q')!) })
  }

  if (searchParams.has('articles')) {
    const articles = getAllLiLuArticles().map(({ content: _c, ...rest }) => rest)
    return NextResponse.json({ articles })
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}
