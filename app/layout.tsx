import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: '🌺 Hailey City RP',
  description: 'The Supertwins — Hailey City RP Game',
}

export const viewport: Viewport = {
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#0a0a0a', overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  )
}
