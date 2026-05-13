import { z } from 'zod'

export const articleNoteSchema = z.object({
  id: z.string(),
  text: z.string(),
  done: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const noteSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  bodyHtml: z.string().optional(),
  articleNotes: z.array(articleNoteSchema).optional(),
  tags: z.array(z.string()),
  folder: z.string(),
  favorite: z.boolean(),
  archived: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const noteRowSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  client_id: z.string(),
  title: z.string(),
  body_text: z.string(),
  body_html: z.string(),
  folder: z.string(),
  tags: z.array(z.string()).nullable().transform((value) => value ?? []),
  favorite: z.boolean(),
  archived: z.boolean(),
  version: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable(),
})

export const articleNoteRowSchema = z.object({
  id: z.string(),
  note_id: z.string(),
  user_id: z.string(),
  client_id: z.string(),
  text: z.string(),
  done: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type NoteRow = z.infer<typeof noteRowSchema>
export type ArticleNoteRow = z.infer<typeof articleNoteRowSchema>
