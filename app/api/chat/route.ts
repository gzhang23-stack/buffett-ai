import { NextRequest } from 'next/server'
import { getAllLetters, searchLetters, buildContext } from '@/lib/letters'
import OpenAI from 'openai'

function getDeepSeekClient() {
  return new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY || 'dummy-key-for-build',
    baseURL: 'https://api.deepseek.com',
  })
}

export async function POST(req: NextRequest) {
  try {
    const { question, history } = await req.json()

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Question is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Check if API key is configured
    if (!process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY === 'dummy-key-for-build') {
      return new Response(
        JSON.stringify({ error: 'DeepSeek API key not configured. Please set DEEPSEEK_API_KEY environment variable.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 1. 读取信件并搜索相关段落
    const letters = getAllLetters()

    if (letters.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No letter data found. Please add .txt files to the data/texts/ directory.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const results = searchLetters(question, letters, 3)
    const context = buildContext(results)

    // 2. 构建消息历史（多轮对话，最多保留 6 轮）
    type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string }
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `你是价值投资领域的专家助手，精通巴菲特、芒格、段永平等价值投资大师的投资哲学。

请根据提供的原文片段回答用户的问题，**全程使用中文**。要求：
- 仔细阅读提供的原文片段，从中提取相关信息直接回答问题
- 具体且有据可查，引用年份和来源时请明确说明（如"巴菲特在1996年致股东信中提到..."）
- 适当直接引用原文关键句，以增强说服力
- 使用 Markdown 格式（加粗关键术语，适当使用列表）
- 综合多位大师的观点，明确指出是谁的论述
- 如果原文片段确实无法回答问题，简单说"抱歉，在现有文献中没有找到相关内容"即可，不要说"虽然检索到...但未提供"这类矛盾的话`,
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
      content: `以下是从价值投资大师文献中检索到的相关段落：\n---\n${context}\n---\n\n问题：${question.trim()}`,
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
          const deepseek = getDeepSeekClient()
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
