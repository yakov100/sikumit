export type Note = {
  id: string
  title: string
  body: string
  bodyHtml?: string
  articleNotes?: ArticleNote[]
  tags: string[]
  folder: string
  favorite: boolean
  archived: boolean
  createdAt: string
  updatedAt: string
}

export type ArticleNote = {
  id: string
  text: string
  done: boolean
  createdAt: string
  updatedAt: string
}

export type Filter = 'all' | 'recent' | 'favorites' | 'archive'

export type ImportedBlock = { type: 'heading' | 'list' | 'paragraph'; text: string }

export type DictationState = 'unsupported' | 'idle' | 'listening' | 'error'

export type EditorCommand =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikeThrough'
  | 'insertUnorderedList'
  | 'insertOrderedList'
  | 'justifyRight'
  | 'justifyCenter'
  | 'justifyLeft'
  | 'formatBlock'
  | 'insertCheckbox'
  | 'insertHorizontalRule'
  | 'undo'
  | 'redo'

export type SaveState = 'ready' | 'saving' | 'saved'

export type AuthMode = 'signin' | 'signup'

export type WorkspaceRecord = { notes: Note[]; updatedAt: string }
