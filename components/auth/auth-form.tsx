'use client'

import { type FormEvent, useState } from 'react'
import { PenLine } from 'lucide-react'
import { useAuth } from '../../hooks/use-auth'
import type { AuthMode } from '../../lib/types'

export function AuthForm() {
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [mode, setMode] = useState<AuthMode>('signin')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const result = mode === 'signup' ? await signUp(email, password) : await signIn(email, password)
      if (result.error) setError(result.error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f7f2] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-xl bg-[#183c35] text-white">
            <PenLine className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black text-[#17211b]">סיכומית</h1>
          <p className="mt-1 text-sm text-[#68756f]">מרחב כתיבה אישי</p>
        </div>

        <div className="rounded-xl border border-[#deded4] bg-white p-6 shadow-sm">
          <div className="mb-5 flex rounded-lg border border-[#deded4] p-1">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 rounded-md py-2 text-sm font-bold transition ${
                mode === 'signin' ? 'bg-[#183c35] text-white' : 'text-[#53625c] hover:text-[#17211b]'
              }`}
            >
              כניסה
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-md py-2 text-sm font-bold transition ${
                mode === 'signup' ? 'bg-[#183c35] text-white' : 'text-[#53625c] hover:text-[#17211b]'
              }`}
            >
              הרשמה
            </button>
          </div>

          <form
            onSubmit={(e) => {
              void handleSubmit(e)
            }}
            className="space-y-4"
            dir="rtl"
          >
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-[#27352f]">אימייל</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-11 w-full rounded-md border border-[#d8d8cf] bg-[#f7f7f2] px-3 text-sm outline-none transition focus:border-[#317d6e] focus:ring-2 focus:ring-[#317d6e]/15"
                placeholder="your@email.com"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-[#27352f]">סיסמה</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                minLength={6}
                className="h-11 w-full rounded-md border border-[#d8d8cf] bg-[#f7f7f2] px-3 text-sm outline-none transition focus:border-[#317d6e] focus:ring-2 focus:ring-[#317d6e]/15"
                placeholder="לפחות 6 תווים"
              />
            </label>
            {error ? (
              <p className="rounded-md border border-[#e5c7c2] bg-[#fff0ed] px-3 py-2 text-sm font-bold text-[#a34334]">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={submitting}
              className="h-11 w-full rounded-md bg-[#183c35] text-sm font-bold text-white transition hover:bg-[#225246] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'אנא המתן...' : mode === 'signup' ? 'הרשמה' : 'כניסה'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
