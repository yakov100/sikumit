import type { Metadata, Viewport } from 'next'
import { Heebo } from 'next/font/google'
import './globals.css'

const appBasePath = '/sikumit'
const appUrl = process.env.NEXT_PUBLIC_URL || 'https://yakov100.github.io/sikumit'

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-heebo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'סיכומית', template: '%s | סיכומית' },
  description: 'מרחב כתיבה אישי ליצירה, שמירה, ארגון וחיפוש של פתקים וסיכומים בעברית.',
  metadataBase: new URL(appUrl),
  manifest: `${appBasePath}/manifest.webmanifest`,
  applicationName: 'סיכומית',
  category: 'productivity',
  icons: {
    icon: [{ url: `${appBasePath}/icon.svg`, type: 'image/svg+xml' }],
    apple: [{ url: `${appBasePath}/icon.svg`, type: 'image/svg+xml' }],
  },
  appleWebApp: {
    capable: true,
    title: 'סיכומית',
    statusBarStyle: 'default',
  },
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    siteName: 'סיכומית',
  },
}

export const viewport: Viewport = {
  themeColor: '#183c35',
  colorScheme: 'light',
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
