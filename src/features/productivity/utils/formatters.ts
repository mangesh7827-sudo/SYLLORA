export function formatDateTime(value: string): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}
export function formatDate(value: string): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}
