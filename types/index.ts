export interface Letter {
  id: string
  year: number
  title: string
  content: string
  url?: string
  embedding?: number[]
}

export interface SearchResult {
  letter: Letter
  similarity: number
  excerpt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: SearchResult[]
}

export interface EmbeddingChunk {
  id: string
  letterId: string
  content: string
  embedding: number[]
  metadata: {
    year: number
    section?: string
    pageNumber?: number
  }
}