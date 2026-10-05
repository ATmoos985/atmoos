import { getCollection, type CollectionEntry } from 'astro:content'

export type BlogPost = CollectionEntry<'blog'>

// Archived notes are outside the publishing collection.
export async function getBlogPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft)
  return posts.sort(
    (a, b) =>
      (b.data.publishDate?.valueOf() ?? 0) - (a.data.publishDate?.valueOf() ?? 0) ||
      a.id.localeCompare(b.id, 'en')
  )
}

export const postUrl = (post: BlogPost) =>
  `/blog/${post.id.split('/').map(encodeURIComponent).join('/')}`

export const tagUrl = (tag: string) => `/blog?${new URLSearchParams({ tag })}`

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
    .format(date)
    .replaceAll('/', '.')

export const publicationYear = (date?: Date) =>
  date
    ? new Intl.DateTimeFormat('en', { timeZone: 'Asia/Shanghai', year: 'numeric' }).format(date)
    : '日期未记录'
