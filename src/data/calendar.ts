const dayFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
})

// Publication days always use the site's timezone, including timestamps around midnight.
export function publicationDay(date: Date): string {
  const parts = dayFormatter.formatToParts(date)
  const part = (type: string) => parts.find((item) => item.type === type)?.value
  return `${part('year')}-${part('month')}-${part('day')}`
}

export function validMonth(value: string | null): string {
  return value && /^(?:[1-9]\d{3})-(?:0[1-9]|1[0-2])$/.test(value) ? value : ''
}

export function validDay(value: string | null): string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value) || !validMonth(value.slice(0, 7))) return ''
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(date.valueOf()) && date.toISOString().slice(0, 10) === value ? value : ''
}

export function calendarMonth(params: URLSearchParams, fallback: string): string {
  const chosen = validMonth(`${params.get('year') ?? ''}-${params.get('monthNumber') ?? ''}`)
  return (
    chosen ||
    validMonth(params.get('month')) ||
    validDay(params.get('date')).slice(0, 7) ||
    fallback
  )
}

export function shiftMonth(month: string, offset: number): string {
  const [year, number] = month.split('-').map(Number)
  const result = new Date(Date.UTC(year, number - 1 + offset, 1)).toISOString().slice(0, 7)
  return validMonth(result)
}

export function monthDays(month: string): (string | null)[] {
  const [year, number] = month.split('-').map(Number)
  const start = new Date(Date.UTC(year, number - 1, 1))
  const count = new Date(Date.UTC(year, number, 0)).getUTCDate()
  const padding = (start.getUTCDay() + 6) % 7
  const days: (string | null)[] = Array.from({ length: padding }, () => null)
  for (let day = 1; day <= count; day++) days.push(`${month}-${String(day).padStart(2, '0')}`)
  while (days.length % 7) days.push(null)
  return days
}

export function blogFilterUrl(values: { date?: string; month?: string; tag?: string }): string {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(values)) if (value) query.set(key, value)
  return `/blog${query.size ? `?${query}` : ''}`
}
