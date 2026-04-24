import { NextRequest, NextResponse } from 'next/server'
import { getAllMungerModels, getMungerModelBySlug, searchMungerModels } from '@/lib/munger-models'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  if (searchParams.has('models')) {
    const models = getAllMungerModels()
    return NextResponse.json({ models })
  }

  if (searchParams.has('slug')) {
    const slug = searchParams.get('slug')!
    const model = getMungerModelBySlug(slug)
    if (!model) return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    return NextResponse.json({ model })
  }

  if (searchParams.has('q')) {
    const query = searchParams.get('q')!
    const results = searchMungerModels(query)
    return NextResponse.json({ results })
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}
