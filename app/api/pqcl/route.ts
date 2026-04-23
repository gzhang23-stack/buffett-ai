import { NextRequest, NextResponse } from 'next/server'
import { getAllPqclArticles, getPqclParts, getPqclBySlug, searchPqcl } from '@/lib/pqcl'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  if (searchParams.has('parts')) {
    return NextResponse.json({ parts: getPqclParts() })
  }

  if (searchParams.has('slug')) {
    const article = getPqclBySlug(searchParams.get('slug')!)
    if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ article })
  }

  if (searchParams.has('q')) {
    return NextResponse.json({ results: searchPqcl(searchParams.get('q')!) })
  }

  if (searchParams.has('articles')) {
    const articles = getAllPqclArticles().map(({ content: _c, ...rest }) => rest)
    return NextResponse.json({ articles })
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}
