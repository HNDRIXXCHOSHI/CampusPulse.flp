import type { NavigationItem } from "./types";

export const navigation: NavigationItem[] = [
  { label: "Dashboard", view: "dashboard", icon: "grid" },
  { label: "Active Clubs", view: "active-clubs", icon: "users" },
  { label: "Posts", view: "posts", icon: "file" },
  { label: "Events", view: "events", icon: "calendar" },
  { label: "Policy", view: "policy", icon: "shield" },
  { label: "Reports", view: "reports", icon: "file" },
  { label: "Analytics", view: "analytics", icon: "chart" },
  { label: "Notifications", view: "notifications", icon: "bell" },
];
