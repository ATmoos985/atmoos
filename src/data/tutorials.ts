import { getCollection, type CollectionEntry } from 'astro:content'

export type Tutorial = CollectionEntry<'tutorials'>

export async function getTutorials(): Promise<Tutorial[]> {
  const notes = await getCollection('tutorials', ({ data }) => !data.draft)
  return notes.sort(
    (a, b) =>
      (a.data.series ?? '').localeCompare(b.data.series ?? '', 'zh-CN') ||
      a.data.chapterOrder - b.data.chapterOrder ||
      a.data.order - b.data.order ||
      a.data.publishDate.valueOf() - b.data.publishDate.valueOf() ||
      a.id.localeCompare(b.id, 'en')
  )
}

export const tutorialUrl = (note: Tutorial) =>
  `/tutorials/${note.id.split('/').map(encodeURIComponent).join('/')}`

export const tutorialTagUrl = (tag: string) => `/tutorials?${new URLSearchParams({ tag })}`

export function getCourses(notes: Tutorial[]) {
  const courses = new Map([
    ['data-structures', '数据结构'],
    ['operating-systems', '操作系统'],
    ['computer-networks', '计算机网络'],
    ['computer-organization', '计算机组成原理']
  ])
  for (const note of notes)
    if (!courses.has(note.data.course))
      courses.set(note.data.course, note.data.series ?? '独立笔记')
  return [...courses].map(([id, title]) => ({
    id,
    title,
    notes: notes.filter((note) => note.data.course === id)
  }))
}
