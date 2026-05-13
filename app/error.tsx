'use client'

import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[error-boundary]', error)
  }, [error])

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f7f2] px-4 text-[#17211b]">
      <div className="max-w-sm text-center">
        <h1 className="mb-2 text-2xl font-black">משהו השתבש</h1>
        <p className="mb-6 text-sm text-[#68756f]">לא הצלחנו לטעון את המסך. אפשר לנסות שוב.</p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 items-center rounded-md bg-[#183c35] px-5 text-sm font-bold text-white transition hover:bg-[#225246]"
        >
          ניסוי חוזר
        </button>
      </div>
    </main>
  )
}
