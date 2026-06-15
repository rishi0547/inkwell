export const QUERY_KEYS = {
  posts:      () => ["posts"]       as const,
  post:       (id: number) => ["posts", id] as const,
  localPosts: () => ["local-posts"] as const, // ← new: stores posts we create
};
