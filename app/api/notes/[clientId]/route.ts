import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '../../../../lib/supabase/server'
import { softDeleteNote, upsertNote } from '../../../../lib/db/notes.repo'
import type { Note } from '../../../../lib/types'

type RouteContext = {
  params: Promise<{ clientId: string }>
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { clientId } = await params
  const body = (await request.json()) as { note: Note }
  if (!body?.note || body.note.id !== clientId) {
    return NextResponse.json({ error: 'note mismatch' }, { status: 400 })
  }

  await upsertNote(user.id, body.note)
  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { clientId } = await params
  await softDeleteNote(user.id, clientId)
  return NextResponse.json({ ok: true })
}
