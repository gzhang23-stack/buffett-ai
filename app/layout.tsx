import './globals.css'
import { Inter } from 'next/font/google'
import Sidebar from '@/components/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: '巴菲特致股东信知识库',
  description: '基于 DeepSeek AI，探索沃伦·巴菲特 1977–2024 年致伯克希尔·哈撒韦股东信中的投资智慧',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh" className="h-full">
      <body className={`${inter.className} h-full bg-[#0f0f0f] text-stone-200 overflow-hidden`}>
        <div className="flex h-full">
          <Sidebar />
          <main className="flex-1 min-w-0 overflow-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
