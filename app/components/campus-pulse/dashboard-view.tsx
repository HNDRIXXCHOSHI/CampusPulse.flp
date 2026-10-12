import type { Club, PendingClub, Report, View, AdminEvent } from "./types";
import { dateLabel, type Row } from "../../lib/portal";
import { postVisibility } from "./post-status";
export function DashboardView({pending, clubs, reports, events, posts, activity, cached, setView}: {pending: PendingClub[]; clubs: Club[]; reports: Report[]; events: AdminEvent[]; posts: Row[]; activity: Row[]; cached: boolean; setView: (v: View) => void}) {
  const members = clubs.reduce((sum,c) => sum+c.members,0);
  const active = clubs.filter(c => c.status === "active").length;
  const published = posts.filter(p => postVisibility(p) === "Published").length;
  const hidden = posts.filter(p => postVisibility(p) === "Hidden").length;
  const upcoming = events.filter(e => e.status === "published");
  const metrics: [string,number,string,View][] = [["Active clubs",active,"Approved and active","active-clubs"],["Memberships",members,"Active club memberships","active-clubs"],["Total posts",posts.length,`${published} published · ${hidden} hidden`,"posts"],["Upcoming events",upcoming.length,"Published events not ended","events"]];
  return <div className="mc-dashboard cp-dashboard">
    <section className="cp-overview"><div className="cp-overview-copy"><p className="eyebrow">CAMPUS PULSE · SUPER ADMIN</p><h1>Your campus,<br/>at a glance.</h1><p>Manage clubs, review community content and keep campus activity moving.</p><button className="primary-button" onClick={() => setView("posts")}>Explore posts →</button></div><div className="cp-overview-stats">{metrics.map(([label,value,caption,view]) => <button key={label} onClick={() => setView(view)}><span>{label}</span><strong>{value}</strong><small>{caption}</small><em aria-hidden="true">↗</em></button>)}</div></section>
    <div className="cp-workspace-grid"><div className="cp-workspace-main">
      <section className="cp-surface"><header className="cp-section-heading"><div><p className="eyebrow">CONTENT</p><h2>Post overview</h2></div><button className="control-button" onClick={() => setView("posts")}>View posts →</button></header><div className="cp-post-summary"><div><strong>{posts.length}</strong><span>Total posts</span></div><div><strong>{published}</strong><span>Published</span></div><div><strong>{hidden}</strong><span>Hidden</span></div></div><p className="cp-muted">Counts include all stored posts. Published posts have an active, published record; club visibility is managed separately.</p></section>
      <section className="cp-surface"><header className="cp-section-heading"><div><p className="eyebrow">LATEST UPDATES</p><h2>Campus activity</h2></div><button className="control-button" onClick={() => setView("notifications")}>View all →</button></header><div className="cp-activity-list">{activity.slice(0,6).map(a => <div key={a.id}><span className="cp-activity-dot"/><div><b>{a.title}</b><small>{dateLabel(a.createdAt)}</small></div></div>)}{!activity.length && <p className="cp-muted">No recorded activity yet.</p>}</div></section>
    </div><aside className="cp-workspace-aside">
      <section className="cp-surface"><header className="cp-section-heading"><div><p className="eyebrow">REVIEW QUEUE</p><h2>Needs attention</h2></div><span className="cp-count-chip">{pending.length+reports.length}</span></header><button className="cp-queue-item" onClick={() => setView("policy")}><span><b>Club applications</b><small>Review registration requests</small></span><strong>{pending.length} →</strong></button><button className="cp-queue-item" onClick={() => setView("reports")}><span><b>Open reports</b><small>Review flagged content</small></span><strong>{reports.length} →</strong></button></section>
      <section className="cp-surface"><header className="cp-section-heading"><div><p className="eyebrow">CALENDAR</p><h2>Upcoming events</h2></div></header>{[...upcoming].reverse().slice(0,3).map(e => <button className="cp-event-link" key={e.id} onClick={() => setView("events")}><b>{e.title}</b><small>{e.date}</small><span>{e.club}</span></button>)}{!upcoming.length && <p className="cp-muted">No upcoming events.</p>}<button className="control-button" onClick={() => setView("events")}>All events →</button></section>
      <p className="cp-connection" role="status"><i/> {cached ? "Waiting for server updates" : "Live data connected"}</p>
    </aside></div>
  </div>;
}
