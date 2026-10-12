"use client";
import { useState } from "react";
import { categories, dateLabel, type Row } from "../../lib/portal";
import { PanelHeading } from "./shared";
export function PolicyView({
  applications,
  users,
  busy,
  review,
}: {
  applications: Row[];
  users: Row[];
  busy: boolean;
  review: (
    id: string,
    approve: boolean,
    feedback: string,
    category: string,
    checks: Record<string, boolean>,
  ) => Promise<boolean>;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState("PENDING");
  const [feedback, setFeedback] = useState("");
  const [category, setCategory] = useState("ACADEMIC");
  const [checks, setChecks] = useState<Record<string, boolean>>({
    constitution: false,
    signatories: false,
    advisor: false,
    noClash: false,
  });
  const labels: Record<string, string> = {
    constitution: "Constitution reviewed",
    signatories: "Signatories verified",
    advisor: "Advisor confirmed",
    noClash: "Club name and proposed arrangements checked",
  };
  const visible = applications.filter((a) => filter === "ALL" || a.status === filter);
  function select(a: Row) {
    setSelected(a.id);
    setFeedback(a.feedback || "");
    setCategory(categories.includes(a.category) ? a.category : "ACADEMIC");
    setChecks({ constitution: false, signatories: false, advisor: false, noClash: false });
  }
  return (
    <>
      <section className="view-heading">
        <div>
          <p className="eyebrow">Governance</p>
          <h1>Policy review</h1>
          <p className="lede">Review applications and provide a saved decision to the student.</p>
        </div>
        <select
          aria-label="Application status"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setSelected(null);
          }}
        >
          {["PENDING", "APPROVED", "REJECTED", "ALL"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </section>
      <section className="policy-layout">
        <article className="panel">
          <PanelHeading eyebrow={`${visible.length} applications`} title="Club applications" />
          {!visible.length && <p className="empty-state">No applications in this category.</p>}
          {visible.map((a) => (
            <div className="policy-request" key={a.id}>
              <div className="policy-request-head">
                <span>
                  <strong>{a.name}</strong>
                  <small>
                    {a.category} · {a.status} · {dateLabel(a.createdAt)}
                  </small>
                </span>
                <button
                  className="control-button"
                  onClick={() => (selected === a.id ? setSelected(null) : select(a))}
                >
                  {" "}
                  {selected === a.id ? "Close" : "Review"}
                </button>
              </div>
              {selected === a.id && (
                <div className="policy-details">
                  <p>
                    <strong>Applicant:</strong>{" "}
                    {users.find((u) => u.id === a.applicantId)?.name || "Name unavailable"}
                  </p>
                  <p>
                    <strong>Purpose:</strong> {a.purpose}
                  </p>
                  <p>
                    <strong>Location:</strong> {a.location}
                  </p>
                  <p>
                    Applicant declarations: constitution{" "}
                    {a.constitutionPrepared ? "prepared" : "not confirmed"}; signatories{" "}
                    {a.signatoriesPrepared ? "prepared" : "not confirmed"}; advisor{" "}
                    {a.advisorIdentified ? "identified" : "not confirmed"}.
                  </p>
                  {a.status === "PENDING" ? (
                    <>
                      <p>
                        These declarations are not uploaded documents. Verify the supporting details
                        before approving.
                      </p>
                      <label>
                        Club category
                        <select value={category} onChange={(e) => setCategory(e.target.value)}>
                          {categories.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </label>
                      <div className="review-checks">
                        {Object.entries(labels).map(([key, label]) => (
                          <label key={key}>
                            <input
                              type="checkbox"
                              checked={checks[key]}
                              onChange={(e) =>
                                setChecks((prev) => ({ ...prev, [key]: e.target.checked }))
                              }
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                      <label>
                        Feedback to applicant
                        <textarea
                          maxLength={2000}
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Explain the decision and any next steps."
                        />
                      </label>
                      <div className="modal-actions">
                        <button
                          className="control-button danger-button"
                          disabled={busy || !feedback.trim()}
                          onClick={async () => {
                            if (await review(a.id, false, feedback, category, checks))
                              setSelected(null);
                          }}
                        >
                          Reject application
                        </button>
                        <button
                          className="primary-button"
                          disabled={
                            busy || !feedback.trim() || !Object.values(checks).every(Boolean)
                          }
                          onClick={async () => {
                            if (await review(a.id, true, feedback, category, checks))
                              setSelected(null);
                          }}
                        >
                          Approve and create club
                        </button>
                      </div>
                    </>
                  ) : (
                    <p>
                      <strong>Decision feedback:</strong> {a.feedback || "No feedback recorded."}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </article>
        <article className="panel policy-copy">
          <PanelHeading eyebrow="Reference" title="Review guidance" />
          <h3>Verify before approval</h3>
          <p>
            The current mobile application collects readiness declarations. Supporting documents and
            advisor verification must be checked separately.
          </p>
          <h3>Approval result</h3>
          <p>
            A successful approval creates an active club and assigns its applicant as the club
            owner. Their existing Firebase account is used; no new password is generated.
          </p>
          <h3>Institutional policy</h3>
          <p>
            An official university policy document has not been configured. Do not treat prototype
            declarations as verified institutional approval requirements.
          </p>
        </article>
      </section>
    </>
  );
}
