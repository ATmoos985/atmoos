import type { APIRoute } from 'astro'
import rss from '@astrojs/rss'
import { getBlogPosts, postUrl } from '@/data/blog'

import config from '@/site-config'

export const prerender = true

export const GET: APIRoute = async ({ site }) => {
  const posts = await getBlogPosts()
  return rss({
    title: `${config.title} · 博客`,
    description: config.description ?? 'Ami 的个人博客。',
    site: site ?? import.meta.env.SITE,
    trailingSlash: false,
    stylesheet: '/scripts/pretty-feed-v3.xsl',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      link: postUrl(post),
      pubDate: post.data.publishDate,
      categories: post.data.tags
    }))
  })
}
