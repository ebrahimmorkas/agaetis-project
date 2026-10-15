const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function formatDate(value: string | Date) {
  return dateFormatter.format(new Date(value))
}
