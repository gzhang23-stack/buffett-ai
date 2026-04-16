import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function askClaude(question: string, context: string): Promise<string> {
  const systemPrompt = `You are an expert on Warren Buffett's investment philosophy and his annual letters to Berkshire Hathaway shareholders.

You will be given excerpts from Buffett's letters as context, and you should answer the user's question based primarily on this context.

Guidelines:
- Answer clearly and concisely, citing specific years or letters when relevant
- Quote directly from the letters when it strengthens your answer
- If the context doesn't fully address the question, say so and answer based on what is available
- Stay grounded in the actual text; do not invent quotes or facts`

  const userMessage = `Context from Buffett's letters:
---
${context}
---

Question: ${question}`

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  const block = message.content[0]
  if (block.type === 'text') {
    return block.text
  }
  return 'Sorry, I could not generate a response.'
}
