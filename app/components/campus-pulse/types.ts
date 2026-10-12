export type View =
  "dashboard" | "posts" | "active-clubs" | "events" | "policy" | "reports" | "analytics" | "notifications";
export type Club = {
  id: string;
  name: string;
  category: string;
  members: number;
  status: "active" | "inactive_flagged" | "suspended";
  lastActive: string;
  email: string;
  clubCode?: string;
  photoUrl?: string;
  description?: string;
  committee: { role: string; name: string; phone: string }[];
};
export type PendingClub = {
  id: string;
  name: string;
  category: string;
  submittedBy: string;
  submittedAgo: string;
  committee: { role: string; name: string; email: string; phone: string }[];
  checks: { constitution: boolean; signatories: boolean; advisor: boolean; noClash: boolean };
};
export type Report = {
  id: string;
  societyName: string;
  category: string;
  reason: string;
  date: string;
  description: string;
  attachment: string;
  targetType?: string;
  targetId?: string;
  status?: string;
  resolution?: string;
};
export type NavigationItem = { label: string; view: View; icon: string };
export type AdminEvent = {
  id: string;
  title: string;
  club: string;
  date: string;
  venue: string;
  rsvps: number;
  status: "published" | "review" | "completed" | "hidden";
  description?: string;
  imageUrl?: string;
  rsvpUrl?: string;
};
