export const metadata = {
  title: '🌺 Hailey City RP',
  description: 'The Supertwins — Hailey City RP Game',
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
