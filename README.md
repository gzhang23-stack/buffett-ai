# Buffett Letters Clone

AI-powered search and chat interface for Warren Buffett's letters to shareholders.

## Features

- 🔍 Semantic search through Buffett's letters
- 💬 AI-powered chat interface
- 📚 Full-text search capabilities
- 🎯 Citation and source tracking
- 📱 Responsive design

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Radix UI
- **AI**: OpenAI GPT-4 + Embeddings API
- **Database**: Supabase (PostgreSQL + pgvector)
- **Deployment**: Vercel

## Getting Started

1. Install dependencies: `npm install`
2. Copy environment variables: `cp .env.example .env.local`
3. Set up your API keys in `.env.local`
4. Run the development server: `npm run dev`

## Environment Variables

```bash
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
buffett-ai/
├── app/                 # Next.js App Router
├── components/          # React components
├── lib/                # Utilities and configurations
├── types/              # TypeScript type definitions
├── data/               # Local data files (if using local storage)
└── public/             # Static assets
```