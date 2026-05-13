import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '../../../lib/supabase/server'
import { fetchUserNotes, upsertNote } from '../../../lib/db/notes.repo'
import type { Note } from '../../../lib/types'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const notes = await fetchUserNotes(user.id)
  return NextResponse.json({ notes: notes ?? [] })
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = (await request.json()) as { note: Note }
  if (!body?.note) return NextResponse.json({ error: 'note required' }, { status: 400 })

  await upsertNote(user.id, body.note)
  return NextResponse.json({ ok: true })
}
