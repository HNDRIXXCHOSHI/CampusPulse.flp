import type { Club } from "./types";
import { millis, type Row } from "../../lib/portal";
export function AnalyticsView({
  clubs,
  category,
  setCategory,
  memberships,
  events,
  posts,
  reports,
  clock,
}: {
  clubs: Club[];
  category: string;
  setCategory: (v: string) => void;
  memberships: Row[];
  events: Row[];
  posts: Row[];
  reports: Row[];
  clock: number;
}) {
  const cats = ["All categories", ...new Set(clubs.map((c) => c.category))],
    visible = category === "All categories" ? clubs : clubs.filter((c) => c.category === category),
    ids = new Set(visible.map((c) => c.id));
  const members = memberships.filter((m) => ids.has(m.clubId) && m.status === "ACTIVE"),
    filteredEvents = events.filter((e) => ids.has(e.clubId)),
    filteredPosts = posts.filter(
      (p) => ids.has(p.clubId) && p.status === "PUBLISHED" && p.isActive === true,
    );
  const resolved = reports.filter(
      (r) => r.status === "RESOLVED" || r.status === "DISMISSED",
    ).length,
    percent = reports.length ? Math.round((resolved / reports.length) * 100) : 0;
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(clock));
  const dayStart = Date.parse(`${today}T00:00:00+02:00`),
    days = Array.from({ length: 7 }, (_, i) => dayStart - (6 - i) * 86400000),
    counts = days.map(
      (t) =>
        members.filter((m) => millis(m.joinedAt) >= t && millis(m.joinedAt) < t + 86400000).length,
    ),
    maximum = Math.max(1, ...counts);
  return (
    <div className="mc-page">
      <div className="mc-page-head">
        <div>
          <p>INSIGHTS</p>
          <h1>Analytics</h1>
          <span>Recorded memberships and content. Students may belong to more than one club.</span>
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {cats.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </div>
      <section className="mc-analytics-metrics">
        <article>
          <small>ACTIVE MEMBERSHIPS</small>
          <strong>{members.length}</strong>
          <span>Selected category</span>
        </article>
        <article>
          <small>PUBLISHED POSTS</small>
          <strong>{filteredPosts.length}</strong>
          <span>Active published content</span>
        </article>
        <article>
          <small>REPORTS REVIEWED</small>
          <strong>{percent}%</strong>
          <span>All platform reports</span>
        </article>
        <article>
          <small>ACTIVE CLUBS</small>
          <strong>{visible.filter((c) => c.status === "active").length}</strong>
          <span>Selected category</span>
        </article>
      </section>
      <section className="mc-analytics-grid">
        <article className="mc-dark-card chart-card">
          <header>
            <div>
              <small>7 DAYS · SOUTH AFRICA</small>
              <h2>New active memberships</h2>
            </div>
          </header>
          <div className="big-bars">
            {days.map((day, i) => (
              <div key={day}>
                <b>{counts[i]}</b>
                <i style={{ height: `${(counts[i] / maximum) * 100}%` }} />
                <small>
                  {new Intl.DateTimeFormat("en-ZA", {
                    weekday: "short",
                    timeZone: "Africa/Johannesburg",
                  }).format(day)}
                </small>
              </div>
            ))}
          </div>
        </article>
        <article className="mc-dark-card">
          <header>
            <div>
              <small>CLUBS</small>
              <h2>Category mix</h2>
            </div>
          </header>
          <div className="category-list">
            {cats.slice(1).map((c) => {
              const total = visible.filter((x) => x.category === c).length,
                p = visible.length ? Math.round((total / visible.length) * 100) : 0;
              return (
                <div key={c}>
                  <span>{c}</span>
                  <i>
                    <b style={{ width: `${p}%` }} />
                  </i>
                  <strong>{total}</strong>
                </div>
              );
            })}
            {!visible.length && <p>No clubs in this category.</p>}
          </div>
        </article>
        <article className="mc-dark-card funnel">
          <header>
            <div>
              <small>CONTENT</small>
              <h2>Event activity</h2>
            </div>
          </header>
          <div>
            <p>
              <b>
                {
                  filteredEvents.filter(
                    (e) => e.isActive && millis(e.eventEndDate || e.eventDate) >= clock,
                  ).length
                }
              </b>
              <span>Upcoming events</span>
            </p>
            <p>
              <b>
                {
                  filteredEvents.filter(
                    (e) => e.isActive && millis(e.eventEndDate || e.eventDate) < clock,
                  ).length
                }
              </b>
              <span>Completed events</span>
            </p>
            <small>Views and external RSVP attendance are not collected.</small>
          </div>
        </article>
        <article className="mc-dark-card">
          <header>
            <div>
              <small>MODERATION · ALL CATEGORIES</small>
              <h2>Reports</h2>
            </div>
          </header>
          <div className="report-summary">
            <strong>{percent}%</strong>
            <span>reviewed</span>
            <p>
              <i style={{ width: `${percent}%` }} />
            </p>
            <small>
              {reports.filter((r) => r.status === "OPEN").length} open · {resolved} reviewed
            </small>
          </div>
        </article>
      </section>
    </div>
  );
}
