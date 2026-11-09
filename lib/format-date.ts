export function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}
