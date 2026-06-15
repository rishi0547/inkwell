import { Post, CreatePostInput } from "@/types";

const BASE = "https://jsonplaceholder.typicode.com";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  // DELETE returns 200 with empty body, so guard the .json() call
  const text = await res.text();
  return text ? JSON.parse(text) : (undefined as T);
}

export const postsApi = {
  getAll: (): Promise<Post[]> =>
    fetch(`${BASE}/posts`).then(handle<Post[]>),

  getOne: (id: number): Promise<Post> =>
    fetch(`${BASE}/posts/${id}`).then(handle<Post>),

  create: (data: CreatePostInput): Promise<Post> =>
    fetch(`${BASE}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, userId: 1 }),
    }).then(handle<Post>),

  delete: (id: number): Promise<void> =>
    fetch(`${BASE}/posts/${id}`, { method: "DELETE" }).then(handle<void>),
};
