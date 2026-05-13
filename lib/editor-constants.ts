import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Archive,
  Bold,
  CheckSquare,
  Clock3,
  FileText,
  Italic,
  List,
  ListOrdered,
  Redo2,
  Star,
  Strikethrough,
  Underline,
  Undo2,
} from 'lucide-react'
import type { EditorCommand, Filter } from './types'

export const textFormatActions: { icon: typeof Bold; label: string; command: EditorCommand }[] = [
  { icon: Bold, label: 'מודגש', command: 'bold' },
  { icon: Italic, label: 'נטוי', command: 'italic' },
  { icon: Underline, label: 'קו תחתון', command: 'underline' },
  { icon: Strikethrough, label: 'קו חוצה', command: 'strikeThrough' },
]

export const paragraphActions: { icon: typeof List; label: string; command: EditorCommand }[] = [
  { icon: AlignRight, label: 'יישור לימין', command: 'justifyRight' },
  { icon: AlignCenter, label: 'יישור למרכז', command: 'justifyCenter' },
  { icon: AlignLeft, label: 'יישור לשמאל', command: 'justifyLeft' },
  { icon: List, label: 'רשימת תבליטים', command: 'insertUnorderedList' },
  { icon: ListOrdered, label: 'רשימה ממוספרת', command: 'insertOrderedList' },
  { icon: CheckSquare, label: 'צ׳קבוקס', command: 'insertCheckbox' },
]

export const historyActions: { icon: typeof Undo2; label: string; command: EditorCommand }[] = [
  { icon: Undo2, label: 'ביטול', command: 'undo' },
  { icon: Redo2, label: 'ביצוע מחדש', command: 'redo' },
]

export const styleOptions = [
  { label: 'טקסט רגיל', value: 'p' },
  { label: 'כותרת 1', value: 'h1' },
  { label: 'כותרת 2', value: 'h2' },
  { label: 'כותרת 3', value: 'h3' },
  { label: 'ציטוט', value: 'blockquote' },
]

export const fontSizeOptions = [
  { label: '10', value: '1' },
  { label: '11', value: '11pt' },
  { label: '12', value: '2' },
  { label: '14', value: '3' },
  { label: '16', value: '4' },
  { label: '18', value: '5' },
  { label: '24', value: '6' },
  { label: '32', value: '7' },
]

export const fontFamilyOptions = [
  { label: 'Heebo', value: 'Heebo, Arial, sans-serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'David', value: 'David, serif' },
  { label: 'Miriam', value: 'Miriam, sans-serif' },
  { label: 'Noto Sans Hebrew', value: '"Noto Sans Hebrew", Arial, sans-serif' },
]

export const colorOptions = ['#17211b', '#1d4ed8', '#047857', '#b45309', '#be123c', '#6d28d9']
export const highlightOptions = ['#fff7ad', '#dbeafe', '#dcfce7', '#ffedd5', '#fce7f3', '#ffffff']

export const filters: { id: Filter; label: string; icon: typeof FileText }[] = [
  { id: 'all', label: 'כל הפתקים', icon: FileText },
  { id: 'recent', label: 'אחרונים', icon: Clock3 },
  { id: 'favorites', label: 'מועדפים', icon: Star },
  { id: 'archive', label: 'ארכיון', icon: Archive },
]
