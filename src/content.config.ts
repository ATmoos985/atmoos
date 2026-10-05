import { defineCollection, type SchemaContext } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

function removeDupsAndLowerCase(array: string[]) {
  if (!array.length) return array
  const lowercaseItems = array.map((str) => str.trim().toLowerCase()).filter(Boolean)
  const distinctItems = new Set(lowercaseItems)
  return Array.from(distinctItems)
}

const articleSchema = ({ image }: SchemaContext) =>
  z.object({
    title: z.string().max(100),
    description: z.string().max(240),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z
      .object({
        src: image(),
        alt: z.string().optional(),
        inferSize: z.boolean().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        color: z.string().optional()
      })
      .optional(),
    tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
    language: z.string().optional(),
    draft: z.boolean().default(false),
    comment: z.boolean().default(false)
  })

// Archived notes are outside both publishing directories.
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: articleSchema
})

const tutorials = defineCollection({
  loader: glob({ base: './src/content/tutorials', pattern: '**/*.{md,mdx}' }),
  schema: (context) =>
    articleSchema(context).extend({
      series: z.string().trim().min(1).optional(),
      order: z.number().int().nonnegative().default(999)
    })
})

export const collections = { blog, tutorials }
