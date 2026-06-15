import Link from "next/link";
import { Post } from "@/types";
import { ArrowRight } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { getAuthor, getReadingTime, getPostDate } from "@/lib/helpers";

export function PostCard({ post }: { post: Post }) {
  const author      = getAuthor(post.userId);
  const readingTime = getReadingTime(post.body);
  const date        = getPostDate(post.id);

  return (
    <Link href={`/posts/${post.id}`} className="group block h-full">
      <article className="relative h-full flex flex-col rounded-xl border bg-card
        p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-foreground/20">

        {/* Author */}
        <div className="flex items-center gap-2.5 mb-5">
          <Avatar userId={post.userId} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-medium leading-none truncate">{author}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{readingTime} min read</p>
          </div>
        </div>

        {/* Title */}
        <h2 className="font-serif text-[1.15rem] font-semibold leading-snug capitalize
          line-clamp-2 mb-3 group-hover:underline underline-offset-2 decoration-1 flex-1">
          {post.title}
        </h2>

        {/* Preview */}
        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2 mb-5">
          {post.body}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground">{date}</span>
          <div className="flex items-center gap-1 text-sm font-semibold">
            Read
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

      </article>
    </Link>
  );
}
