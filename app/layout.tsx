import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: '巴菲特致股东信 — AI 智能问答',
  description: '基于 DeepSeek AI，探索沃伦·巴菲特 1977–2024 年致伯克希尔·哈撒韦股东信中的投资智慧',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full overflow-hidden`}>{children}</body>
    </html>
  )
}