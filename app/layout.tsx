import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from 'next/font/google'
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "O'qish Testi - Bola-dostona O'qish Platformasi",
  description: "Bolalar uchun interactive o'qish testlari va o'quv platformasi",
  generator: "ardentsoft.uz",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="uz">
      <body className={`font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
