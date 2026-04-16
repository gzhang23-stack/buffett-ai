import { NextRequest } from 'next/server'
import { getAllLetters, searchLetters, buildContext } from '@/lib/letters'
import OpenAI from 'openai'

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  baseURL: 'https://api.deepseek.com',
})

export async function POST(req: NextRequest) {
  try {
    const { question, history } = await req.json()

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Question is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 1. 读取信件并搜索相关段落
    const letters = getAllLetters()

    if (letters.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No letter data found. Please add .txt files to the data/texts/ directory.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const results = searchLetters(question, letters, 6)
    const context = buildContext(results)

    // 2. 构建消息历史（多轮对话，最多保留 6 轮）
    type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string }
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `你是沃伦·巴菲特投资哲学和伯克希尔·哈撒韦年度股东信的专家助手。

请根据提供的信件原文片段回答用户的问题，**全程使用中文**。要求：
- 具体且有据可查，引用年份时请明确说明
- 适当直接引用原文（可翻译为中文），以增强说服力
- 使用 Markdown 格式（加粗关键术语，适当使用列表）
- 如果提供的原文片段不足以完整回答，请坦诚说明，并结合巴菲特的整体投资理念作补充`,
      },
    ]

    // 加入历史对话（最多 6 轮 = 12 条）
    if (Array.isArray(history)) {
      for (const msg of history.slice(-12)) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ role: msg.role, content: msg.content })
        }
      }
    }

    // 当前问题 + 检索到的 context
    messages.push({
      role: 'user',
      content: `Context from Buffett's letters:\n---\n${context}\n---\n\nQuestion: ${question.trim()}`,
    })

    // 3. 先发 sources，让前端立即渲染
    const sources = results.map((r) => ({
      year: r.letter.year,
      title: r.letter.title,
      excerpt: r.excerpt,
    }))

    // 4. 流式调用 DeepSeek
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        // 先推送 sources
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'sources', sources })}\n\n`)
        )

        try {
          const completion = await deepseek.chat.completions.create({
            model: 'deepseek-chat',
            messages,
            max_tokens: 1024,
            temperature: 0.7,
            stream: true,
          })

          for await (const chunk of completion) {
            const text = chunk.choices[0]?.delta?.content ?? ''
            if (text) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'text', text })}\n\n`)
              )
            }
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
        } catch (err) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', message: String(err) })}\n\n`)
          )
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    console.error('[/api/chat] Error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
