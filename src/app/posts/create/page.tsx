"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/queryKeys";
import { Post } from "@/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Send, Loader2, AlertCircle } from "lucide-react";

export default function CreatePostPage() {
  const router      = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [body,  setBody]  = useState("");

  const wordCount    = body.trim().split(/\s+/).filter(Boolean).length;
  const readingMins  = Math.max(1, Math.ceil(wordCount / 200));
  const canSubmit    = title.trim().length > 2 && body.trim().length > 10;

  const { mutate: createPost, isPending, isError, error } = useMutation({
    mutationFn: postsApi.create,
    onSuccess: (newPost: Post) => {
      // 1. Save to our "local posts" cache — persists across route changes
      //    (survives the JSONPlaceholder refetch that doesn't store new posts)
      queryClient.setQueryData<Post[]>(QUERY_KEYS.localPosts(), (old) =>
        [newPost, ...(old ?? [])]
      );
      // 2. Also add to the main posts cache immediately
      queryClient.setQueryData<Post[]>(QUERY_KEYS.posts(), (old) =>
        old ? [newPost, ...old] : [newPost]
      );
      // 3. Invalidate so homepage knows to re-sort
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.posts() });

      toast.success("Post published!");
      router.push("/");
    },
    onError: (err) => {
      console.error("Create post failed:", err);
      // error is shown inline too, not just toast
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    createPost({ title: title.trim(), body: body.trim() });
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">

      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground
          hover:text-foreground transition-colors mb-10"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All Posts
      </Link>

      <div className="mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em]
          text-muted-foreground mb-2">
          New Post
        </p>
        <h1 className="font-serif text-4xl font-bold tracking-tight">
          Write Something
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>

        {/* Title */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="title" className="text-sm font-semibold">Title</Label>
            <span className="text-xs text-muted-foreground">{title.length} / 100</span>
          </div>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 100))}
            placeholder="Give your post a clear, compelling title..."
            className="h-12 text-base"
            disabled={isPending}
          />
        </div>

        {/* Body */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="body" className="text-sm font-semibold">Content</Label>
            <span className="text-xs text-muted-foreground">
              {wordCount} words · {readingMins} min read
            </span>
          </div>
          <Textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your thoughts here..."
            className="min-h-[280px] resize-none text-base leading-relaxed"
            disabled={isPending}
          />
        </div>

        {/* Inline error */}
        {isError && (
          <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30
            bg-destructive/5 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <p className="text-sm text-destructive">
              {(error as Error)?.message ?? "Something went wrong. Please try again."}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPending || (!title && !body)}
            onClick={() => { setTitle(""); setBody(""); }}
          >
            Clear
          </Button>

          <Button
            type="submit"
            disabled={!canSubmit || isPending}
            className="gap-2 min-w-[130px]"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Publish Post
              </>
            )}
          </Button>
        </div>

      </form>
    </div>
  );
}
