import { NextRequest, NextResponse } from 'next/server'
import { getAllDuanInvestArticles, getDuanInvestBySlug, searchDuanInvest, getDuanInvestChapters } from '@/lib/duan_invest'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  if (searchParams.has('chapters')) {
    return NextResponse.json({ chapters: getDuanInvestChapters() })
  }

  if (searchParams.has('slug')) {
    const article = getDuanInvestBySlug(searchParams.get('slug')!)
    if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ article })
  }

  if (searchParams.has('q')) {
    return NextResponse.json({ results: searchDuanInvest(searchParams.get('q')!) })
  }

  if (searchParams.has('articles')) {
    const articles = getAllDuanInvestArticles().map(({ content: _c, ...rest }) => rest)
    return NextResponse.json({ articles })
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}
