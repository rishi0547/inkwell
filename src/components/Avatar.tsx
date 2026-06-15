import { getAuthor, getAvatarColor } from "@/lib/helpers";

interface AvatarProps {
  userId: number;
  size?: "sm" | "md" | "lg";
}

export function Avatar({ userId, size = "md" }: AvatarProps) {
  const author = getAuthor(userId);
  const color  = getAvatarColor(userId);
  const initials = author.split(" ").map((n) => n[0]).join("");

  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base",
  };

  return (
    <div
      className={`${sizes[size]} ${color.bg} ${color.text} rounded-full
        flex items-center justify-center font-semibold shrink-0 select-none`}
    >
      {initials}
    </div>
  );
}
