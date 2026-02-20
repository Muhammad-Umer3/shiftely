import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import type { Post } from '@/lib/blog'
import { format } from 'date-fns'

type PostCardProps = {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <Card className="h-full border-stone-800 bg-stone-900/50 hover:border-amber-500/30 hover:bg-stone-900 transition-colors">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
            {post.title}
          </CardTitle>
          <CardDescription className="text-stone-400 text-sm">
            {format(new Date(post.date), 'MMMM d, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-stone-300 text-sm line-clamp-3">{post.description}</p>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded bg-stone-800 text-stone-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
