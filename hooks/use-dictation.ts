'use client'

import { useEffect, useRef, useState } from 'react'
import type { DictationState } from '../lib/types'

type SpeechRecognitionConstructor = new () => SpeechRecognition

type SpeechRecognitionResultItem = {
  transcript: string
}

type SpeechRecognitionResult = {
  isFinal: boolean
  [index: number]: SpeechRecognitionResultItem
}

type SpeechRecognitionResultList = {
  length: number
  [index: number]: SpeechRecognitionResult
}

type SpeechRecognitionEvent = Event & {
  resultIndex: number
  results: SpeechRecognitionResultList
}

type SpeechRecognitionErrorEvent = Event & {
  error: string
}

type SpeechRecognition = EventTarget & {
  lang: string
  continuous: boolean
  interimResults: boolean
  onend: (() => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  start: () => void
  stop: () => void
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

function dictationErrorMessage(error: string) {
  if (error === 'not-allowed' || error === 'service-not-allowed') return 'אין הרשאת מיקרופון'
  if (error === 'no-speech') return 'לא זוהה דיבור'
  if (error === 'audio-capture') return 'לא נמצא מיקרופון פעיל'
  if (error === 'network') return 'ההכתבה דורשת חיבור זמין'
  return 'ההכתבה הופסקה'
}

export type UseDictationOptions = {
  onTranscript: (text: string) => void
  beforeStart?: () => void
}

export function useDictation({ onTranscript, beforeStart }: UseDictationOptions) {
  const [state, setState] = useState<DictationState>('unsupported')
  const [message, setMessage] = useState('הכתבה קולית לא נתמכת בדפדפן הזה')
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const onTranscriptRef = useRef(onTranscript)

  useEffect(() => {
    onTranscriptRef.current = onTranscript
  })

  useEffect(() => {
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!Recognition) return

    const recognition = new Recognition()
    recognition.lang = 'he-IL'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event) => {
      let transcript = ''

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        if (result.isFinal) transcript += result[0]?.transcript ?? ''
      }

      const text = transcript.trim()
      if (!text) return

      onTranscriptRef.current(`${text} `)
    }

    recognition.onerror = (event) => {
      setState('error')
      setMessage(dictationErrorMessage(event.error))
    }

    recognition.onend = () => {
      setState((current) => (current === 'unsupported' || current === 'error' ? current : 'idle'))
    }

    recognitionRef.current = recognition
    const readyTimeout = window.setTimeout(() => {
      setState('idle')
      setMessage('התחלת הכתבה קולית')
    }, 0)

    return () => {
      window.clearTimeout(readyTimeout)
      try {
        recognition.stop()
      } catch {
        // Some browsers throw when stop is called before recognition starts.
      }
      recognitionRef.current = null
    }
  }, [])

  const toggle = () => {
    const recognition = recognitionRef.current
    if (!recognition || state === 'unsupported') return

    if (state === 'listening') {
      recognition.stop()
      setState('idle')
      setMessage('התחלת הכתבה קולית')
      return
    }

    try {
      beforeStart?.()
      recognition.start()
      setState('listening')
      setMessage('מקליט בעברית...')
    } catch {
      setState('error')
      setMessage('לא ניתן להתחיל הקלטה כרגע')
    }
  }

  return { state, message, toggle }
}
