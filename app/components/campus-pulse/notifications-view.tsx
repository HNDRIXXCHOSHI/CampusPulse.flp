"use client";
import { useState } from "react";
import type { Club, PendingClub, Report, View } from "./types";
import { dateLabel, type Row } from "../../lib/portal";
import { Icon } from "./cp-icon";
export function NotificationsView({
  pending,
  reports,
  clubs,
  notices,
  activity,
  setView,
  send,
  busy,
  initialClubId,
}: {
  pending: PendingClub[];
  reports: Report[];
  clubs: Club[];
  notices: Row[];
  activity: Row[];
  setView: (v: View) => void;
  send: (clubId: string, title: string, message: string) => Promise<boolean>;
  busy: boolean;
  initialClubId: string;
}) {
  const [clubId, setClubId] = useState(initialClubId),
    [title, setTitle] = useState(""),
    [message, setMessage] = useState("");
  return (
    <>
      <section className="view-heading">
        <div>
          <p className="eyebrow">Inbox</p>
          <h1>Notifications</h1>
          <p className="lede">
            Review platform activity and send announcements to mobile club admins.
          </p>
        </div>
      </section>
      <section className="notification-list">
        <button className="notification-card" onClick={() => setView("policy")}>
          <span className="notification-symbol">+</span>
          <span>
            <strong>{pending.length} club requests</strong>
            <small>Applications waiting for approval.</small>
          </span>
          <Icon name="arrow" />
        </button>
        <button className="notification-card" onClick={() => setView("reports")}>
          <span className="notification-symbol">!</span>
          <span>
            <strong>{reports.length} open reports</strong>
            <small>Review moderation decisions.</small>
          </span>
          <Icon name="arrow" />
        </button>
      </section>
      <article className="panel">
        <h2>Send announcement</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (await send(clubId, title, message)) {
              setTitle("");
              setMessage("");
            }
          }}
        >
          <label>
            Club
            <select required value={clubId} onChange={(e) => setClubId(e.target.value)}>
              <option value="">Choose a club</option>
              {clubs
                .filter((c) => c.status === "active")
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Title
            <input
              required
              maxLength={150}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label>
            Message
            <textarea
              required
              maxLength={5000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>
          <button
            className="primary-button"
            disabled={busy || !clubId || !title.trim() || !message.trim()}
          >
            Send to club admins
          </button>
          <p>This appears in the club admin’s mobile Notifications section.</p>
        </form>
      </article>
      <article className="panel">
        <h2>Sent announcements</h2>
        {notices.map((n) => (
          <div className="policy-request" key={n.id}>
            <strong>{n.title}</strong>
            <small>
              {clubs.find((c) => c.id === n.clubId)?.name || n.clubId} · {dateLabel(n.createdAt)}
            </small>
            <p>{n.message}</p>
          </div>
        ))}
        {!notices.length && <p>No announcements sent yet.</p>}
      </article>
      <article className="panel">
        <h2>Platform activity</h2>
        {activity.map((a) => (
          <p key={a.id}>
            {a.title}
            <small>{dateLabel(a.createdAt)}</small>
          </p>
        ))}
        {!activity.length && <p>No recorded actions yet.</p>}
      </article>
    </>
  );
}
