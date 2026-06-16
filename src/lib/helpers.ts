export const AUTHORS = [
  "Alex Chen", "Maria Santos", "James Wright", "Priya Sharma",
  "Lucas Kim", "Sofia Rossi", "David Park", "Aisha Johnson",
  "Noah Miller", "Emma Wilson",
];

const AVATAR_COLORS = [
  { bg: "bg-violet-100", text: "text-violet-600" },
  { bg: "bg-blue-100",   text: "text-blue-600"   },
  { bg: "bg-emerald-100",text: "text-emerald-600" },
  { bg: "bg-amber-100",  text: "text-amber-600"   },
  { bg: "bg-rose-100",   text: "text-rose-600"    },
  { bg: "bg-sky-100",    text: "text-sky-600"     },
  { bg: "bg-orange-100", text: "text-orange-600"  },
  { bg: "bg-teal-100",   text: "text-teal-600"    },
  { bg: "bg-fuchsia-100",text: "text-fuchsia-600" },
  { bg: "bg-lime-100",   text: "text-lime-600"    },
];

export function getAuthor(userId: number) {
  return AUTHORS[(userId - 1) % AUTHORS.length];
}

export function getAvatarColor(userId: number) {
  return AVATAR_COLORS[(userId - 1) % AVATAR_COLORS.length];
}

export function getReadingTime(text: string) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function getPostDate(id: number) {
  // If id is a timestamp (e.g. > 1000000000), construct Date from it; otherwise use mock formula
  const date = id > 1000000000 ? new Date(id) : new Date(2024, id % 12, (id % 28) + 1);
  return date.toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}
