"use client";
import { useEffect, useRef, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { firebase, configured } from "./lib/firebase";
import { useDialog } from "./lib/use-dialog";
import { usePortal, type PortalData } from "./lib/use-portal";
import {
  announce,
  clubStatus,
  dateLabel,
  errorMessage,
  hideContent,
  login,
  millis,
  reviewApplication,
  resolveReport,
  type Row,
} from "./lib/portal";
import { PostsView } from "./components/campus-pulse/posts-view";
import { AnalyticsView } from "./components/campus-pulse/analytics-view";
import { navigation } from "./components/campus-pulse/data";
import { ClubsView } from "./components/campus-pulse/clubs-view";
import { ReportModal, ReportsView } from "./components/campus-pulse/reports-view";
import { DashboardView } from "./components/campus-pulse/dashboard-view";
import { NotificationsView } from "./components/campus-pulse/notifications-view";
import { PolicyView } from "./components/campus-pulse/policy-view";
import { EventsView } from "./components/campus-pulse/events-view";
import { LoginScreen } from "./components/campus-pulse/login-screen";
import { AppShell } from "./components/campus-pulse/shell";
import type { Club, PendingClub, Report, View, AdminEvent } from "./components/campus-pulse/types";
export default function DashboardClient() {
  const [signInError, setSignInError] = useState("");
  const [retry, setRetry] = useState(0),
    portal = usePortal(retry);
  if (!portal.authReady)
    return (
      <main className="portal-loading" role="status">
        Checking your session… An internet connection is needed to verify access.
      </main>
    );
  if (!portal.access || !portal.user)
    return (
      <>
        {!configured && (
          <p className="portal-error">
            Firebase configuration is missing. Follow WEB-SETUP.md before signing in.
          </p>
        )}
        {portal.errors.access && (
          <p role="alert" className="portal-error">
            {portal.errors.access}
            <button onClick={() => setRetry((n) => n + 1)}>Retry access check</button>
          </p>
        )}
        <LoginScreen
          externalError={signInError}
          onLogin={async (email, password) => {
            setSignInError("");
            try {
              await login(email, password);
            } catch (e) {
              setSignInError(errorMessage(e));
              throw new Error(errorMessage(e));
            }
          }}
        />
      </>
    );
  return (
    <PortalDashboard
      key={portal.user.uid}
      data={portal.data}
      loading={portal.loading}
      errors={portal.errors}
      cached={portal.cached}
      retry={() => setRetry((n) => n + 1)}
    />
  );
}
function PortalDashboard({
  data,
  loading,
  errors,
  cached,
  retry,
}: {
  data: PortalData;
  loading: boolean;
  errors: Record<string, string>;
  cached: boolean;
  retry: () => void;
}) {
  const [view, setView] = useState<View>("dashboard"),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState("All"),
    [sortAsc, setSortAsc] = useState(true),
    [expandedClub, setExpandedClub] = useState<string | null>(null),
    [reviewReport, setReviewReport] = useState<Report | null>(null),
    [recipient, setRecipient] = useState(""),
    [notice, setNotice] = useState(""),
    [actionError, setActionError] = useState(""),
    [busy, setBusy] = useState(false),
    [analyticsCategory, setAnalyticsCategory] = useState("All categories"),
    [leaders, setLeaders] = useState<Record<string, Club["committee"]>>({}),
    [content, setContent] = useState<Row | null>(null),
    [clock, setClock] = useState(() => Date.now());
  const busyRef = useRef(false);
  useDialog(Boolean(content), () => setContent(null), busy);
  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  async function perform(action: () => Promise<void>, message: string): Promise<boolean> {
    if (busyRef.current) return false;
    busyRef.current = true;
    setBusy(true);
    setActionError("");
    setNotice("");
    try {
      await action();
      setNotice(message);
      return true;
    } catch (e) {
      setActionError(errorMessage(e));
      return false;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  const label = (s: string) =>
    s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : "Uncategorised";
  const clubs: Club[] = data.clubs.map((c) => {
    const assignment = data.adminAccess.find(
      (a) => a.clubId === c.id && a.canManageAdmins && a.isActive,
    );
    return {
      id: c.id,
      name: c.name || "Unnamed club",
      category: label(c.category),
      members: data.clubMembers.filter((m) => m.clubId === c.id && m.status === "ACTIVE").length,
      status: c.isActive && c.status === "APPROVED" ? "active" : "suspended",
      lastActive: dateLabel(c.updatedAt),
      email: data.users.find((u) => u.id === assignment?.id)?.email || "No contact email available",
      clubCode:
        assignment?.clubCode ||
        data.adminAccess.find((a) => a.clubId === c.id && a.isActive)?.clubCode,
      photoUrl: c.profileImageUrl,
      description: c.description,
      committee: leaders[c.id] || [],
    };
  });
  const pending: PendingClub[] = data.clubApplications
    .filter((a) => a.status === "PENDING")
    .map((a) => ({
      id: a.id,
      name: a.name,
      category: label(a.category),
      submittedBy: data.users.find((u) => u.id === a.applicantId)?.name || "Name unavailable",
      submittedAgo: dateLabel(a.createdAt),
      committee: [],
      checks: {
        constitution: a.constitutionPrepared === true,
        signatories: a.signatoriesPrepared === true,
        advisor: a.advisorIdentified === true,
        noClash: false,
      },
    }));
  const reports: Report[] = data.reports.map((r) => ({
    id: r.id,
    societyName: r.societyName || "Reported content",
    category: r.category,
    reason: r.reason,
    date: dateLabel(r.createdAt),
    description: r.description,
    attachment: r.attachment,
    resolution: r.resolution,
    status: r.status,
    targetType: r.targetType,
    targetId: r.targetId,
  }));
  const openReports = reports.filter((r) => r.status === "OPEN");
  const events: AdminEvent[] = data.events
    .map((e): AdminEvent => ({
      id: e.id,
      title: e.title || "Untitled event",
      club: e.clubName || clubs.find((c) => c.id === e.clubId)?.name || "Unknown club",
      date: dateLabel(e.eventDate),
      venue: e.location || "",
      rsvps: 0,
      status: !e.isActive
        ? "hidden"
        : e.status !== "PUBLISHED"
          ? "review"
          : millis(e.eventEndDate || e.eventDate) < clock
            ? "completed"
            : "published",
      description: e.description,
      imageUrl: e.posterUrl || e.imageUrl,
      rsvpUrl: e.rsvpLink || e.rsvpUrl,
    }))
    .sort(
      (a, b) =>
        millis(data.events.find((e) => e.id === b.id)?.eventDate) -
        millis(data.events.find((e) => e.id === a.id)?.eventDate),
    );
  const activity = [
    ...data.platformActivity,
    ...data.posts.map((p) => ({
      id: `post:${p.id}`,
      title: `${p.clubName || "Club"}: published a post`,
      createdAt: p.createdAt,
    })),
    ...data.events.map((e) => ({
      id: `event:${e.id}`,
      title: `${e.title}: event created`,
      createdAt: e.createdAt,
    })),
  ].sort((a, b) => millis(b.createdAt) - millis(a.createdAt));
  const sortedClubs = clubs
    .filter(
      (c) =>
        (category === "All" || c.category === category) &&
        `${c.name} ${c.category}`.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) => (sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
  async function expand(id: string | null) {
    setExpandedClub(id);
    if (!id) return;
    try {
      const snapshot = await getDocs(collection(firebase().db, "clubs", id, "leadership"));
      setLeaders((prev) => ({
        ...prev,
        [id]: snapshot.docs
          .filter((d) => d.data().isActive)
          .sort((a, b) => (a.data().order || 0) - (b.data().order || 0))
          .map((d) => ({
            role: d.data().role || "Leader",
            name: d.data().name || "Name unavailable",
            phone: "",
          })),
      }));
    } catch (e) {
      setActionError(errorMessage(e));
    }
  }
  return (
    <AppShell
      view={view}
      navigation={navigation}
      setView={setView}
      notificationCount={pending.length + openReports.length}
      onLogout={() => {
        void perform(() => signOut(firebase().auth), "Signed out.");
      }}
    >
      {notice && (
        <div className="portal-success" role="status">
          {notice}
          <button aria-label="Dismiss message" onClick={() => setNotice("")}>
            ×
          </button>
        </div>
      )}
      {actionError && (
        <div className="portal-error" role="alert">
          {actionError}
          <button aria-label="Dismiss error" onClick={() => setActionError("")}>
            ×
          </button>
        </div>
      )}
      {busy && (
        <p role="status" className="portal-status">
          Saving…
        </p>
      )}
      {cached && (
        <p className="portal-status">
          Waiting for server updates. Check your connection if this persists.
        </p>
      )}
      {Object.keys(errors).length > 0 ? (
        <div className="portal-error" role="alert">
          {Object.entries(errors).map(([source, message]) => (
            <p key={source}>
              {source}: {message}
            </p>
          ))}
          <button className="control-button" onClick={retry}>
            Retry loading
          </button>
        </div>
      ) : loading ? (
        <div className="portal-loading" role="status">
          Loading your dashboard…
        </div>
      ) : (
        <fieldset className="portal-controls" disabled={busy}>
          {view === "dashboard" && (
            <DashboardView
              posts={data.posts}
              pending={pending}
              clubs={clubs}
              reports={openReports}
              events={events}
              activity={activity}
              cached={cached}
              setView={setView}
            />
          )}
          {view === "active-clubs" && (
            <ClubsView
              clubs={sortedClubs}
              query={query}
              setQuery={setQuery}
              category={category}
              setCategory={setCategory}
              sortAsc={sortAsc}
              setSortAsc={setSortAsc}
              expandedClub={expandedClub}
              setExpandedClub={(id) => void expand(id)}
              suspend={(id) => {
                const club = clubs.find((c) => c.id === id);
                if (
                  club &&
                  window.confirm(
                    `${club.status === "active" ? "Deactivate" : "Reactivate"} ${club.name}? Deactivating hides it and prevents its admins from managing it.`,
                  )
                )
                  void perform(
                    () => clubStatus(id, club.status !== "active"),
                    "Club status saved.",
                  );
              }}
              onMessage={(id) => {
                setRecipient(id);
                setView("notifications");
                setNotice(
                  `Select ${clubs.find((c) => c.id === id)?.name} below to send a message to its admins.`,
                );
              }}
            />
          )}
          {view === "posts" && <PostsView posts={data.posts} clubs={clubs} openPost={(post) => setContent({...post, collectionName: "posts"})} />}
          {view === "events" && <EventsView events={events} />}
          {view === "policy" && (
            <PolicyView
              applications={[...data.clubApplications].sort(
                (a, b) => millis(b.createdAt) - millis(a.createdAt),
              )}
              users={data.users}
              busy={busy}
              review={(id, approve, feedback, cat, checks) =>
                perform(
                  () => reviewApplication(id, approve, feedback, cat, checks),
                  approve
                    ? "Club approved. Its assigned code is available under Active Clubs."
                    : "Application rejected. Feedback is available to the student.",
                )
              }
            />
          )}
          {view === "reports" && (
            <ReportsView reports={reports} setReviewReport={setReviewReport} />
          )}
          {view === "analytics" && (
            <AnalyticsView
              clubs={clubs}
              category={analyticsCategory}
              setCategory={setAnalyticsCategory}
              memberships={data.clubMembers}
              events={data.events}
              posts={data.posts}
              reports={data.reports}
              clock={clock}
            />
          )}
          {view === "notifications" && (
            <NotificationsView
              key={recipient}
              initialClubId={recipient}
              pending={pending}
              reports={openReports}
              clubs={clubs}
              notices={[...data.adminNotifications].sort(
                (a, b) => millis(b.createdAt) - millis(a.createdAt),
              )}
              activity={activity}
              setView={setView}
              busy={busy}
              send={(id, title, message) =>
                perform(
                  () => announce(id, title, message),
                  "Announcement saved for the club admins.",
                )
              }
            />
          )}
        </fieldset>
      )}
      {reviewReport && (
        <ReportModal
          key={reviewReport.id}
          report={reports.find((r) => r.id === reviewReport.id) || reviewReport}
          busy={busy}
          close={() => setReviewReport(null)}
          resolveReport={(id, status, note) =>
            perform(() => resolveReport(id, status, note), "Report decision saved.")
          }
          viewContent={() => {
            const rows = reviewReport.targetType === "POST" ? data.posts : data.events;
            const row = rows.find((r) => r.id === reviewReport.targetId);
            if (row) {
              setContent({
                ...row,
                collectionName: reviewReport.targetType === "POST" ? "posts" : "events",
              });
              setReviewReport(null);
            } else setActionError("This content has been deleted or is unavailable.");
          }}
        />
      )}
      {content && (
        <div
          className="modal-backdrop"
          onClick={() => {
            if (!busy) setContent(null);
          }}
        >
          <section
            className="review-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="content-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              aria-label="Close content"
              disabled={busy}
              onClick={() => setContent(null)}
            >
              ×
            </button>
            <h2 id="content-title">{content.title || content.clubName || "Reported post"}</h2>
            <p>{content.text || content.description}</p>
            <p>{dateLabel(content.createdAt)}</p>
            {(content.imageUrl || content.posterUrl) &&
              /^https:\/\//i.test(content.imageUrl || content.posterUrl) && (
                <img
                  className="content-preview"
                  src={content.imageUrl || content.posterUrl}
                  alt="Reported content"
                />
              )}
            <p>Status: {content.isActive ? "Visible" : "Hidden"}</p>
            <button
              className="control-button danger-button"
              disabled={busy || !content.isActive}
              onClick={() => {
                if (window.confirm("Hide this content from student feeds?"))
                  void perform(async () => {
                    await hideContent(content.collectionName, content.id);
                    setContent(null);
                  }, "Content hidden from student feeds. Any related report can be reviewed under Reports.");
              }}
            >
              Hide from student feeds
            </button>
          </section>
        </div>
      )}
    </AppShell>
  );
}
