"use client";
import { useState } from "react";
import { useDialog } from "../../lib/use-dialog";
import { exportCsv } from "../../lib/portal";
import type { AdminEvent } from "./types";
export function EventsView({ events }: { events: AdminEvent[] }) {
  const [filter, setFilter] = useState("All"),
    [selected, setSelected] = useState<AdminEvent | null>(null);
  useDialog(Boolean(selected), () => setSelected(null));
  const visible =
    filter === "All" ? events : events.filter((e) => e.status === filter.toLowerCase());
  return (
    <>
      <div className="page-title-row">
        <div>
          <p className="eyebrow">Mobile → oversight</p>
          <h1 className="page-title">Events</h1>
          <p className="page-subtitle">Live events published by club admins.</p>
        </div>
        <button
          className="primary-btn"
          onClick={() =>
            exportCsv("campus-pulse-events.csv", [
              ["Event", "Club", "Date", "Venue", "Status"],
              ...visible.map((e) => [e.title, e.club, e.date, e.venue, e.status]),
            ])
          }
        >
          Export events
        </button>
      </div>
      <div className="filter-row">
        {["All", "Published", "Completed", "Hidden"].map((x) => (
          <button
            key={x}
            className={filter === x ? "filter active" : "filter"}
            onClick={() => setFilter(x)}
          >
            {x}
          </button>
        ))}
      </div>
      <div className="data-panel">
        <div className="data-head">
          <span>Event</span>
          <span>Club</span>
          <span>Date & venue</span>
          <span>RSVP</span>
          <span>Status</span>
          <span />
        </div>
        {visible.map((e) => (
          <div className="data-row" key={e.id}>
            <span>
              <b>{e.title}</b>
              <small>{e.id}</small>
            </span>
            <span>{e.club}</span>
            <span>
              {e.date}
              <small>{e.venue || "No venue provided"}</small>
            </span>
            <span>{e.rsvpUrl ? "External link" : "No link"}</span>
            <span>
              <i className={`status ${e.status}`}>{e.status}</i>
            </span>
            <button className="ghost-btn" onClick={() => setSelected(e)}>
              View
            </button>
          </div>
        ))}
        {!visible.length && <p className="empty-state">No events match this filter.</p>}
      </div>
      {selected && (
        <div className="event-modal-backdrop" onClick={() => setSelected(null)}>
          <section
            className="event-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="event-modal-close"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              ×
            </button>
            <p className="eyebrow">Event details</p>
            <h2 id="event-modal-title">{selected.title}</h2>
            <p>{selected.description}</p>
            <dl>
              <dt>Club</dt>
              <dd>{selected.club}</dd>
              <dt>Date & time</dt>
              <dd>{selected.date}</dd>
              <dt>Venue</dt>
              <dd>{selected.venue}</dd>
              <dt>Status</dt>
              <dd>{selected.status}</dd>
            </dl>
            {selected.imageUrl && /^https:\/\//i.test(selected.imageUrl) && (
              <img className="content-preview" src={selected.imageUrl} alt="Event poster" />
            )}
            {selected.rsvpUrl && /^https?:\/\//i.test(selected.rsvpUrl) && (
              <a
                className="control-button"
                href={selected.rsvpUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open RSVP link
              </a>
            )}
            <div className="event-modal-footer">
              <button className="primary-btn" onClick={() => setSelected(null)}>
                Done
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
