import { supabase } from '../supabase/client'
import type { Note, WorkspaceRecord } from '../types'

export async function loadNotesFromWorkspaces(userId: string): Promise<WorkspaceRecord | null> {
  const { data, error } = await supabase
    .from('workspaces')
    .select('notes, updated_at')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) return null
  return { notes: data.notes as Note[], updatedAt: data.updated_at as string }
}

export async function saveNotesToWorkspaces(userId: string, notes: Note[]): Promise<void> {
  await supabase
    .from('workspaces')
    .upsert(
      { user_id: userId, notes, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    )
}
