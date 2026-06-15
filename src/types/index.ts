export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface CreatePostInput {
  title: string;
  body: string;
}
