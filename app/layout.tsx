import type { Metadata, Viewport } from 'next'
import './globals.css'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: 'CicloCoach',
  description: 'Il tuo piano di allenamento ciclismo personalizzato',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F9F7F4',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <div style={{ maxWidth: 520, margin: '0 auto', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
          <main style={{ flex: 1, paddingBottom: 80 }}>
            {children}
          </main>
          <Nav />
        </div>
      </body>
    </html>
  )
}
