"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/queryKeys";
import { Post } from "@/types";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Trash2, AlertCircle, Clock } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { getAuthor, getReadingTime, getPostDate } from "@/lib/helpers";

export default function PostDetailPage() {
  const params = useParams();
  const postId = parseInt(params.id as string);
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: post,
    isLoading,
    isError,
  } = useQuery({
    queryKey: QUERY_KEYS.post(postId),
    queryFn: async () => {
      // Check localPosts query cache first
      const localPosts =
        queryClient.getQueryData<Post[]>(QUERY_KEYS.localPosts()) || [];
      const localPost = localPosts.find((p) => p.id === postId);
      if (localPost) return localPost;

      // Check main posts cache next
      const cachedPosts =
        queryClient.getQueryData<Post[]>(QUERY_KEYS.posts()) || [];
      const cachedPost = cachedPosts.find((p) => p.id === postId);
      if (cachedPost) return cachedPost;

      // Fetch from API
      return postsApi.getOne(postId);
    },
    enabled: !isNaN(postId),
  });

  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      if (postId > 100) {
        try {
          await postsApi.delete(postId);
        } catch (err) {
          // Ignore delete errors for local-only mock posts
        }
      } else {
        await postsApi.delete(postId);
      }
    },
    onSuccess: () => {
      // Remove from localPosts cache
      queryClient.setQueryData<Post[]>(QUERY_KEYS.localPosts(), (old) =>
        old ? old.filter((p) => p.id !== postId) : [],
      );
      // Remove from main posts cache
      queryClient.setQueryData<Post[]>(QUERY_KEYS.posts(), (old) =>
        old ? old.filter((p) => p.id !== postId) : [],
      );

      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.posts() });
      toast.success("Post deleted.");
      router.push("/");
    },
    onError: () => toast.error("Couldn't delete post. Try again."),
  });

  /* ── Loading ─────────────────────────── */
  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12 space-y-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-3/4" />
        <div className="flex items-center gap-3 pt-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
        <Skeleton className="h-px w-full" />
        <div className="space-y-3 pt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              className={`h-4 ${i % 4 === 3 ? "w-2/3" : "w-full"}`}
            />
          ))}
        </div>
      </div>
    );
  }

  /* ── Error ───────────────────────────── */
  if (isError || !post) {
    return (
      <div className="flex flex-col items-center gap-4 py-32 text-center">
        <AlertCircle className="h-9 w-9 text-destructive" />
        <p className="font-semibold">Post not found</p>
        <Button asChild variant="outline" size="sm">
          <Link href="/">Back to posts</Link>
        </Button>
      </div>
    );
  }

  const author = getAuthor(post.userId);
  const fullText = `${post.body} ${post.body} ${post.body}`;
  const readingTime = getReadingTime(fullText);
  const date = getPostDate(post.id);

  /* ── Post ────────────────────────────── */
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground
          hover:text-foreground transition-colors mb-10"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All Posts
      </Link>

      <article>
        {/* Eyebrow */}
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.12em]
          text-muted-foreground mb-4"
        >
          Post · {post.id}
        </p>

        {/* Title */}
        <h1 className="font-serif text-4xl sm:text-5xl font-bold leading-tight capitalize mb-8">
          {post.title}
        </h1>

        {/* Author row */}
        <div className="flex items-center gap-3 mb-8">
          <Avatar userId={post.userId} size="md" />
          <div>
            <p className="font-semibold text-sm">{author}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              {date}
              <span aria-hidden>·</span>
              <Clock className="h-3 w-3" />
              {readingTime} min read
            </p>
          </div>
        </div>

        <hr className="mb-8" />

        {/* Body */}
        <div className="space-y-6 text-base leading-8 text-foreground/80">
          <p>{post.body}</p>
          <p>{post.body}</p>
          <p>{post.body}</p>
        </div>
      </article>

      {/* Footer */}
      <div className="mt-16 pt-8 border-t flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar userId={post.userId} size="sm" />
          <div>
            <p className="text-sm font-medium">{author}</p>
            <p className="text-xs text-muted-foreground">Author</p>
          </div>
        </div>

        <Button
          variant="destructive"
          size="sm"
          disabled={isDeleting}
          onClick={() => {
            if (confirm("Delete this post? This can't be undone."))
              deletePost();
          }}
        >
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          {isDeleting ? "Deleting..." : "Delete Post"}
        </Button>
      </div>
    </div>
  );
}
