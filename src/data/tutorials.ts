import { getCollection, type CollectionEntry } from 'astro:content'

export type Tutorial = CollectionEntry<'tutorials'>

export async function getTutorials(): Promise<Tutorial[]> {
  const notes = await getCollection('tutorials', ({ data }) => !data.draft)
  return notes.sort(
    (a, b) =>
      (a.data.series ?? '').localeCompare(b.data.series ?? '', 'zh-CN') ||
      a.data.order - b.data.order ||
      a.data.publishDate.valueOf() - b.data.publishDate.valueOf() ||
      a.id.localeCompare(b.id, 'en')
  )
}

export const tutorialUrl = (note: Tutorial) =>
  `/tutorials/${note.id.split('/').map(encodeURIComponent).join('/')}`

export const tutorialTagUrl = (tag: string) => `/tutorials?${new URLSearchParams({ tag })}`
