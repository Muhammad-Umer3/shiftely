import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { getAllPosts, getPostBySlug } from '@/lib/blog'
import { PostContent } from '@/components/blog/post-content'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post)
    return {
      title: 'Post not found | Shiftely',
    }
  return {
    title: `${post.title} | Shiftely Blog`,
    description: post.description,
    openGraph: {
      title: `${post.title} | Shiftely Blog`,
      description: post.description,
      ...(post.image && { images: [post.image] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  return (
    <div className="container mx-auto px-6 py-12 md:py-16 max-w-3xl">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-stone-400 hover:text-amber-400 transition-colors text-sm mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to blog
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight font-[var(--font-playfair)]">
          {post.title}
        </h1>
        <p className="mt-3 text-stone-400">
          {format(new Date(post.date), 'MMMM d, yyyy')}
        </p>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded bg-stone-800 text-stone-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {post.image && (
        <div className="mb-8 rounded-lg overflow-hidden border border-stone-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image}
            alt=""
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      <PostContent content={post.content} />

      <div className="mt-12 pt-8 border-t border-stone-800">
        <Link href="/blog">
          <Button
            variant="outline"
            className="border-stone-700 text-stone-300 hover:bg-stone-800 hover:text-amber-400"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            All posts
          </Button>
        </Link>
      </div>
    </div>
  )
}
