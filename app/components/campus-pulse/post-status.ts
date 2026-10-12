import type { Row } from "../../lib/portal";
export type PostVisibility = "Published" | "Hidden" | "Other";
export function postVisibility(post: Row): PostVisibility {
  if (post.isActive === false) return "Hidden";
  if (post.isActive === true && post.status === "PUBLISHED") return "Published";
  return "Other";
}
