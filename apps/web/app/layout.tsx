import './globals.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'Ecommerce Platform',
  description: 'Shop, sell, and manage with ease.'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
