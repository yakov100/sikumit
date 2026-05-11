import type { Metadata } from 'next'
import { Heebo } from 'next/font/google'
import './globals.css'

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-heebo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'סיכומית', template: '%s | סיכומית' },
  description: 'מרחב כתיבה אישי ליצירה, שמירה, ארגון וחיפוש של פתקים וסיכומים בעברית.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    siteName: 'סיכומית',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className="min-h-screen" style={{ fontFamily: 'var(--font-heebo, Heebo, sans-serif)' }}>
        {children}
      </body>
    </html>
  )
}
