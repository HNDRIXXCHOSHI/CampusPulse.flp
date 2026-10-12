import {
  addDoc,
  collection,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  updateDoc,
  writeBatch,
  type DocumentData,
} from "firebase/firestore";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { firebase } from "./firebase";
export type Row = DocumentData & { id: string };
export const categories = ["ACADEMIC", "SPORT", "CULTURE", "ADVOCACY", "IDENTITY"];
export function millis(value: unknown): number {
  if (
    value &&
    typeof value === "object" &&
    "toMillis" in value &&
    typeof value.toMillis === "function"
  )
    return value.toMillis();
  return 0;
}
export function dateLabel(value: unknown) {
  const time = millis(value);
  return time
    ? new Intl.DateTimeFormat("en-ZA", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Africa/Johannesburg",
      }).format(time)
    : "Date unavailable";
}
export function errorMessage(e: unknown) {
  const code = (e as { code?: string })?.code;
  if (code?.includes("permission-denied"))
    return "Access denied. Check your superAdminAccess document and publish the supplied Firestore rules.";
  if (
    code?.includes("invalid-credential") ||
    code?.includes("user-not-found") ||
    code?.includes("wrong-password")
  )
    return "The email or password is incorrect.";
  if (code?.includes("too-many-requests")) return "Too many attempts. Please try again later.";
  if (code?.includes("unavailable") || code?.includes("network"))
    return "Connection unavailable. Check your connection and try again.";
  return e instanceof Error ? e.message : "Unable to complete the action.";
}
export async function login(email: string, password: string) {
  const { auth, db } = firebase();
  const result = await signInWithEmailAndPassword(auth, email.trim(), password);
  try {
    const access = await getDoc(doc(db, "superAdminAccess", result.user.uid));
    if (!access.exists() || access.data().isActive !== true)
      throw new Error("This account is not authorised for the superadmin website.");
  } catch (e) {
    await signOut(auth);
    throw e;
  }
}
function actor() {
  const { auth, db } = firebase();
  if (!auth.currentUser) throw new Error("Please sign in again.");
  return { db, uid: auth.currentUser.uid };
}
export async function reviewApplication(
  id: string,
  approve: boolean,
  feedback: string,
  category: string,
  checks: Record<string, boolean>,
) {
  if (!feedback.trim() || feedback.length > 2000)
    throw new Error("Enter feedback of 1–2,000 characters.");
  if (approve && (!categories.includes(category) || !Object.values(checks).every(Boolean)))
    throw new Error("Select a category and complete all review checks.");
  const { db, uid } = actor();
  const code = `CP-${Array.from(crypto.getRandomValues(new Uint8Array(12)), (n) =>
    n.toString(16).padStart(2, "0"),
  )
    .join("")
    .toUpperCase()}`;
  await runTransaction(db, async (tx) => {
    const appRef = doc(db, "clubApplications", id);
    const application = await tx.get(appRef);
    if (!application.exists() || application.data().status !== "PENDING")
      throw new Error("This application has already been reviewed. Refresh the list.");
    const applicationData = application.data();
    if (approve) {
      const userRef = doc(db, "users", id),
        clubRef = doc(db, "clubs", id),
        accessRef = doc(db, "adminAccess", id);
      const [user, club, access] = await Promise.all([
        tx.get(userRef),
        tx.get(clubRef),
        tx.get(accessRef),
      ]);
      if (!user.exists() || user.data().accountStatus !== "ACTIVE")
        throw new Error("The applicant needs an active student profile.");
      if (club.exists()) throw new Error("A club already exists for this application.");
      if (access.exists())
        throw new Error(
          "This applicant already has a club admin assignment. Review it in Firebase before assigning another club.",
        );
      const membershipId = `founder_${id}`;
      const membership = await tx.get(doc(db, "clubMembers", membershipId));
      if (membership.exists())
        throw new Error("A founder membership already exists. Review it before approving.");
      tx.set(clubRef, {
        name: applicationData.name,
        shortName: applicationData.name.slice(0, 24),
        description: applicationData.purpose,
        history: "",
        category,
        location: applicationData.location,
        profileImageUrl: "",
        bannerImageUrl: "",
        organisationType: "CLUB",
        status: "APPROVED",
        isActive: true,
        applicationId: id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      tx.set(doc(db, "clubMembers", membershipId), {
        userId: id,
        clubId: id,
        status: "ACTIVE",
        joinedAt: serverTimestamp(),
      });
      tx.set(accessRef, {
        clubId: id,
        clubCode: code,
        isActive: true,
        canManageAdmins: true,
        notificationsEnabled: true,
        membershipId,
        updatedAt: serverTimestamp(),
      });
    }
    tx.update(appRef, {
      status: approve ? "APPROVED" : "REJECTED",
      feedback: feedback.trim(),
      clubId: approve ? id : "",
      reviewChecks: checks,
      reviewedBy: uid,
      reviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    tx.set(doc(collection(db, "platformActivity")), {
      title: `${applicationData.name}: ${approve ? "approved" : "rejected"}`,
      kind: "APPLICATION",
      actorId: uid,
      createdAt: serverTimestamp(),
    });
  });
}
export async function clubStatus(id: string, active: boolean) {
  const { db, uid } = actor();
  const batch = writeBatch(db);
  batch.update(doc(db, "clubs", id), { isActive: active, updatedAt: serverTimestamp() });
  batch.set(doc(collection(db, "platformActivity")), {
    title: `Club ${id}: ${active ? "activated" : "deactivated"}`,
    kind: "CLUB",
    actorId: uid,
    createdAt: serverTimestamp(),
  });
  await batch.commit();
}
export async function resolveReport(id: string, status: "RESOLVED" | "DISMISSED", note: string) {
  if (!note.trim() || note.length > 2000)
    throw new Error("Enter a review note of 1–2,000 characters.");
  const { db, uid } = actor();
  await runTransaction(db, async (tx) => {
    const ref = doc(db, "reports", id),
      report = await tx.get(ref);
    if (!report.exists() || report.data().status !== "OPEN")
      throw new Error("This report has already been reviewed.");
    tx.update(ref, {
      status,
      resolution: note.trim(),
      reviewedBy: uid,
      reviewedAt: serverTimestamp(),
    });
    tx.set(doc(collection(db, "platformActivity")), {
      title: `Report ${id}: ${status.toLowerCase()}`,
      kind: "REPORT",
      actorId: uid,
      createdAt: serverTimestamp(),
    });
  });
}
export async function announce(clubId: string, title: string, message: string) {
  if (!title.trim() || title.length > 150 || !message.trim() || message.length > 5000)
    throw new Error("Enter a title (up to 150 characters) and message (up to 5,000 characters).");
  const { db, uid } = actor();
  await addDoc(collection(db, "adminNotifications"), {
    clubId,
    title: title.trim(),
    message: message.trim(),
    authorId: uid,
    createdAt: serverTimestamp(),
  });
}
export async function hideContent(collectionName: "posts" | "events", id: string) {
  const { db } = actor();
  await updateDoc(doc(db, collectionName, id), { isActive: false, updatedAt: serverTimestamp() });
}
export function exportCsv(filename: string, rows: unknown[][]) {
  const escape = (value: unknown) =>
    `"${String(value ?? "")
      .replace(/^[=+@-]/, "'$&")
      .replaceAll('"', '""')}"`;
  const blob = new Blob(["\ufeff" + rows.map((row) => row.map(escape).join(",")).join("\r\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
