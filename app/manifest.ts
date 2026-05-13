import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'סיכומית',
    short_name: 'סיכומית',
    description: 'מרחב כתיבה אישי ליצירה, שמירה, ארגון וחיפוש של פתקים וסיכומים בעברית.',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    dir: 'rtl',
    lang: 'he',
    orientation: 'any',
    background_color: '#f7f7f2',
    theme_color: '#183c35',
    categories: ['productivity', 'education'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  }
}
