import './globals.css'
import { Inter } from 'next/font/google'
import Sidebar from '@/components/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: '价值投资知识库',
  description: '基于 AI，深入探索价值投资的核心理念——巴菲特、芒格、格雷厄姆等大师的投资智慧',
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
          <main className="flex-1 min-w-0 overflow-hidden pt-14 md:pt-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
