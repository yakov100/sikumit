export function formatRelativeDate(value: string) {
  const date = new Date(value)
  const diff = Date.now() - date.getTime()
  const minutes = Math.max(1, Math.round(diff / 60000))

  if (minutes < 60) return `עודכן לפני ${minutes} דק׳`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `עודכן לפני ${hours} שעות`
  const days = Math.round(hours / 24)
  if (days === 1) return 'עודכן אתמול'
  if (days < 7) return `עודכן לפני ${days} ימים`

  return new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'short' }).format(date)
}
