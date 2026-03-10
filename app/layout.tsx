import type { Metadata } from 'next'
import { Manrope, Sora } from 'next/font/google'
import './globals.css'
import SessionProvider from '@/components/SessionProvider'

const bodyFont = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700', '800'],
})

const displayFont = Sora({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'MEI Organizado - Controle financeiro simples R$19',
  description: 'Sistema completo para MEI: finanças, recibos, clientes. 7 dias grátis!',
  metadataBase: new URL('https://mei-organizado.vercel.app'),
  openGraph: {
    title: 'MEI Organizado - Controle financeiro simples R$19',
    description: 'Sistema completo para MEI: finanças, recibos, clientes. 7 dias grátis!',
    url: 'https://mei-organizado.vercel.app',
    siteName: 'MEI Organizado',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MEI Organizado - Controle financeiro simples R$19',
    description: 'Sistema completo para MEI: finanças, recibos, clientes. 7 dias grátis!',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <body className={`${bodyFont.variable} ${displayFont.variable} font-sans antialiased`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
