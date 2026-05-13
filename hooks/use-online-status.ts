'use client'

import { useEffect } from 'react'

export function useOnlineStatus(handler: () => void) {
  useEffect(() => {
    window.addEventListener('online', handler)
    return () => window.removeEventListener('online', handler)
  }, [handler])
}
