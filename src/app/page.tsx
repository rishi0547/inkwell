"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { postsApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/queryKeys";
import { Post } from "@/types";
import { PostCard } from "@/components/posts/PostCard";
import { PostCardSkeleton } from "@/components/posts/PostCardSkeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const PER_PAGE = 9;

/* Fisher-Yates shuffle */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pageRange(cur: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (cur <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (cur >= total - 3)
    return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", cur - 1, cur, cur + 1, "…", total];
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  /* ── Keep shuffle order stable across re-renders ── */
  const shuffledApiRef = useRef<Post[] | null>(null);
  const [displayPosts, setDisplayPosts] = useState<Post[]>([]);

  /* ── Fetch API posts ── */
  const {
    data: posts,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.posts(),
    queryFn: postsApi.getAll,
  });

  /* ── Fetch locally created posts (our own cache) ── */
  const { data: localPosts = [] } = useQuery<Post[]>({
    queryKey: QUERY_KEYS.localPosts(),
    queryFn: () => [], // never fetches — we write to it via setQueryData
    staleTime: Infinity,
    gcTime: Infinity,
    initialData: [],
  });

  /* ── Merge + sort when source data changes ── */
  useEffect(() => {
    if (!posts) return;

    const apiPosts = posts.filter((p) => p.id <= 100);

    // Shuffle only once on first load
    if (!shuffledApiRef.current) {
      shuffledApiRef.current = shuffle(apiPosts);
    }

    // Local posts always on top, then shuffled API posts
    const localIds = new Set(localPosts.map((p) => p.id));
    const deduped = shuffledApiRef.current.filter((p) => !localIds.has(p.id));

    setDisplayPosts([...localPosts, ...deduped]);
  }, [posts, localPosts]);

  /* ── Search filter ── */
  const filtered = useMemo(() => {
    if (!query.trim()) return displayPosts;
    const q = query.toLowerCase();
    return displayPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q),
    );
  }, [displayPosts, query]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSearch = useCallback((v: string) => {
    setQuery(v);
    setPage(1);
  }, []);

  const goTo = useCallback((p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative border-b overflow-hidden">
        {/* Subtle radial fade at top center */}
        <div
          className="pointer-events-none absolute inset-0
          bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(0,0,0,0.035),transparent)]"
        />

        <div className="relative mx-auto max-w-6xl px-6 py-24 text-center">
          <p
            className="animate-in fade-in slide-in-from-bottom-2 duration-500
            text-[11px] font-semibold uppercase tracking-[0.15em]
            text-muted-foreground mb-5"
          >
            A space to think
          </p>

          <h1
            className="animate-in fade-in slide-in-from-bottom-3 duration-700
            font-serif text-5xl sm:text-6xl lg:text-7xl font-bold
            tracking-tight leading-[1.1] mb-5"
          >
            Stories Worth
            <br className="hidden sm:block" /> Reading.
          </h1>

          <p
            className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100
            text-muted-foreground text-base sm:text-lg max-w-sm mx-auto mb-10"
          >
            Discover ideas and perspectives from writers around the world.
          </p>

          {/* Search */}
          <div
            className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150
            relative max-w-md mx-auto group"
          >
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4
              text-muted-foreground pointer-events-none
              transition-colors group-focus-within:text-foreground"
            />
            <Input
              placeholder="Search posts..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-11 pr-10 h-12 rounded-full text-base
                bg-muted/40 border-border
                focus-visible:bg-background focus-visible:ring-1
                transition-all duration-200"
            />
            {query && (
              <button
                onClick={() => handleSearch("")}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2
                  text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Meta row */}
        {!isLoading && !isError && (
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-muted-foreground">
              {query
                ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${query}"`
                : `${filtered.length} stories`}
            </p>
            {totalPages > 1 && (
              <p className="text-sm text-muted-foreground hidden sm:block">
                Page {page} of {totalPages}
              </p>
            )}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <AlertCircle className="h-9 w-9 text-destructive" />
            <div>
              <p className="font-semibold">Failed to load posts</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {error?.message}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        )}

        {/* Empty search */}
        {!isLoading && !isError && filtered.length === 0 && query && (
          <div className="py-24 text-center space-y-3">
            <p className="font-semibold text-lg">No posts found</p>
            <p className="text-sm text-muted-foreground">
              Try different keywords.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSearch("")}
            >
              Clear search
            </Button>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: PER_PAGE }).map((_, i) => (
                <PostCardSkeleton key={i} />
              ))
            : visible.map((post) => <PostCard key={post.id} post={post} />)}
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-12 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goTo(page - 1)}
              disabled={page === 1}
              className="gap-1 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>

            {pageRange(page, totalPages).map((p, i) =>
              p === "…" ? (
                <span
                  key={`e${i}`}
                  className="px-1 text-sm text-muted-foreground"
                >
                  …
                </span>
              ) : (
                <Button
                  key={p}
                  variant={page === p ? "default" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full text-sm"
                  onClick={() => goTo(p as number)}
                >
                  {p}
                </Button>
              ),
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => goTo(page + 1)}
              disabled={page === totalPages}
              className="gap-1 rounded-full"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
