import { NextRequest, NextResponse } from 'next/server'
import { getAllDuanBizArticles, getDuanBizBySlug, searchDuanBiz } from '@/lib/duan_biz'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  if (searchParams.has('slug')) {
    const article = getDuanBizBySlug(searchParams.get('slug')!)
    if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ article })
  }

  if (searchParams.has('q')) {
    return NextResponse.json({ results: searchDuanBiz(searchParams.get('q')!) })
  }

  if (searchParams.has('articles')) {
    const articles = getAllDuanBizArticles().map(({ content: _c, ...rest }) => rest)
    return NextResponse.json({ articles })
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}
