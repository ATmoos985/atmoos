import type { CollectionEntry } from 'astro:content'

export type ActivityKind = 'note' | 'essay'
export type ActivityAction = '发布' | '更新'

export interface ActivityEvent {
  date: string
  action: ActivityAction
}

export interface ActivityItem {
  id: string
  title: string
  description: string
  href: string
  kind: ActivityKind
  kindLabel: string
  latestAction: ActivityAction
  latestDate: string
  events: ActivityEvent[]
}

type ActivitySource = CollectionEntry<'docs'> | CollectionEntry<'blog'>

const dateKey = (date?: Date) => date?.toISOString().slice(0, 10)

const eventsFor = (publishDate?: Date, updatedDate?: Date) => {
  const publish = dateKey(publishDate)
  const updated = dateKey(updatedDate)
  const events: ActivityEvent[] = []

  if (publish) events.push({ date: publish, action: '发布' })
  if (updated && updated !== publish) events.push({ date: updated, action: '更新' })

  return events
}

const toActivityItem = (source: ActivitySource, kind: ActivityKind): ActivityItem | null => {
  const events = eventsFor(source.data.publishDate, source.data.updatedDate)
  const latestEvent = events.at(-1)

  if (!latestEvent) return null

  return {
    id: source.id,
    title: source.data.title,
    description: source.data.description,
    href: kind === 'note' ? `/docs/${source.id}` : `/essays/${source.id}`,
    kind,
    kindLabel: kind === 'note' ? '笔记' : '随笔',
    latestAction: latestEvent.action,
    latestDate: latestEvent.date,
    events
  }
}

export const buildActivityItems = (
  docs: CollectionEntry<'docs'>[],
  essays: CollectionEntry<'blog'>[]
) =>
  [
    ...docs
      .filter(({ data }) => !data.draft && !data.isIndex)
      .map((entry) => toActivityItem(entry, 'note')),
    ...essays.filter(({ data }) => !data.draft).map((entry) => toActivityItem(entry, 'essay'))
  ]
    .filter((item): item is ActivityItem => item !== null)
    .sort((a, b) => b.latestDate.localeCompare(a.latestDate) || a.title.localeCompare(b.title))
