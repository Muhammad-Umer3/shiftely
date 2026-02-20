import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/blog'
import { PostCard } from '@/components/blog/post-card'

export const metadata: Metadata = {
  title: 'Blog | Shiftely',
  description:
    'Tips, stories, and updates on how Shiftely helps small businesses solve shift scheduling, coverage, and team management.',
  openGraph: {
    title: 'Blog | Shiftely',
    description:
      'Tips, stories, and updates on how Shiftely helps small businesses solve shift scheduling and team management.',
  },
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <div className="container mx-auto px-6 py-12 md:py-16">
      <header className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight font-[var(--font-playfair)]">
          Blog
        </h1>
        <p className="mt-3 text-stone-400 max-w-2xl">
          How Shiftely solves scheduling problems, product updates, and tips for
          small teams.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-stone-400">No posts yet. Check back soon.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.slug}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
