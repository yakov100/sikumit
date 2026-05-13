'use client'

import { useEffect, useState } from 'react'

function initialStatus() {
  if (typeof navigator === 'undefined') return 'מכין מצב אופליין...'
  return 'serviceWorker' in navigator ? 'מכין מצב אופליין...' : 'מצב אופליין לא נתמך בדפדפן הזה'
}

export function useServiceWorker(scriptUrl: string, scope: string) {
  const [status, setStatus] = useState(initialStatus)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register(scriptUrl, {
          scope,
          updateViaCache: 'none',
        })
        await navigator.serviceWorker.ready
        registration.update().catch(() => undefined)
        setStatus('זמין אופליין אחרי ביקור ראשון')
      } catch {
        setStatus('לא הצלחתי להכין מצב אופליין')
      }
    }

    void register()
  }, [scriptUrl, scope])

  return { status, setStatus }
}
