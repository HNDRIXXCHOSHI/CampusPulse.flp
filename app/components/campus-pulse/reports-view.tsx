"use client";
import { useDialog } from "../../lib/use-dialog";
import { useState } from "react";
import type { Report } from "./types";
import { Icon } from "./cp-icon";
export function ReportsView({
  reports,
  setReviewReport,
}: {
  reports: Report[];
  setReviewReport: (r: Report) => void;
}) {
  const [filter, setFilter] = useState("OPEN");
  const visible = reports.filter((r) => filter === "ALL" || r.status === filter);
  return (
    <>
      <section className="view-heading">
        <div>
          <p className="eyebrow">Moderation</p>
          <h1>Reports & flags</h1>
          <p className="lede">Review student reports and save a moderation decision.</p>
        </div>
        <select
          aria-label="Report status"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {["OPEN", "RESOLVED", "DISMISSED", "ALL"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </section>
      <article className="panel full-panel">
        <div className="report-admin-head">
          <span>Club / content</span>
          <span>Reason</span>
          <span>Date lodged</span>
          <span>Action</span>
        </div>
        {visible.map((r) => (
          <div className="report-admin-row" key={r.id}>
            <strong>
              {r.societyName}
              <small>{r.status}</small>
            </strong>
            <span>{r.reason}</span>
            <span>{r.date}</span>
            <button className="control-button" onClick={() => setReviewReport(r)}>
              Review
            </button>
          </div>
        ))}
        {!visible.length && <p className="empty-state">No reports match this filter.</p>}
      </article>
    </>
  );
}
export function ReportModal({
  report,
  close,
  resolveReport,
  viewContent,
  busy,
}: {
  report: Report;
  close: () => void;
  resolveReport: (id: string, status: "RESOLVED" | "DISMISSED", note: string) => Promise<boolean>;
  viewContent: () => void;
  busy: boolean;
}) {
  const [note, setNote] = useState("");
  useDialog(true, close, busy);
  return (
    <div
      className="modal-backdrop"
      onClick={() => {
        if (!busy) close();
      }}
    >
      <section
        className="review-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={close} disabled={busy} aria-label="Close">
          <Icon name="x" />
        </button>
        <p className="eyebrow">Report review · {report.status}</p>
        <h2 id="review-title">{report.societyName}</h2>
        <p className="modal-meta">
          {report.category} · {report.date}
        </p>
        <dl>
          <dt>Reason</dt>
          <dd>{report.reason}</dd>
          <dt>Description</dt>
          <dd>{report.description}</dd>
          <dt>Content reference</dt>
          <dd>
            {report.targetType}: {report.targetId}
          </dd>
        </dl>
        <button className="control-button" onClick={viewContent}>
          View reported content
        </button>
        {report.status !== "OPEN" && (
          <p>
            <strong>Review note:</strong> {report.resolution || "No note recorded."}
          </p>
        )}
        {report.status === "OPEN" && (
          <>
            <label>
              Review note
              <textarea
                value={note}
                maxLength={2000}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Record what you found and the action taken."
              />
            </label>
            <div className="modal-actions">
              <button
                className="control-button"
                disabled={busy || !note.trim()}
                onClick={async () => {
                  if (await resolveReport(report.id, "DISMISSED", note)) close();
                }}
              >
                Dismiss
              </button>
              <button
                className="primary-button"
                disabled={busy || !note.trim()}
                onClick={async () => {
                  if (await resolveReport(report.id, "RESOLVED", note)) close();
                }}
              >
                Resolve <Icon name="check" />
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
