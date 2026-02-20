import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

export type Post = {
  slug: string
  title: string
  description: string
  date: string
  image?: string
  tags?: string[]
  content: string
}

function getSlugFromFilename(filename: string): string {
  return filename.replace(/\.md$/, '')
}

export function getAllPosts(): Post[] {
  const dir = BLOG_DIR
  if (!fs.existsSync(dir)) return []

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'))
  const posts: Post[] = files.map((filename) => {
    const fullPath = path.join(dir, filename)
    const raw = fs.readFileSync(fullPath, 'utf-8')
    const { data, content } = matter(raw)
    return {
      slug: getSlugFromFilename(filename),
      title: (data.title as string) ?? '',
      description: (data.description as string) ?? '',
      date: (data.date as string) ?? '',
      image: data.image as string | undefined,
      tags: Array.isArray(data.tags) ? (data.tags as string[]) : undefined,
      content,
    }
  })

  return posts.sort((a, b) => (b.date.localeCompare(a.date)))
}

export function getPostBySlug(slug: string): Post | null {
  const fullPath = path.join(BLOG_DIR, `${slug}.md`)
  if (!fs.existsSync(fullPath)) return null

  const raw = fs.readFileSync(fullPath, 'utf-8')
  const { data, content } = matter(raw)
  return {
    slug,
    title: (data.title as string) ?? '',
    description: (data.description as string) ?? '',
    date: (data.date as string) ?? '',
    image: data.image as string | undefined,
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : undefined,
    content,
  }
}
