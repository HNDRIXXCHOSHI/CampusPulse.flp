"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { configured, firebase } from "./firebase";
import { errorMessage, type Row } from "./portal";
export const sources = [
  "clubs",
  "clubApplications",
  "reports",
  "events",
  "clubMembers",
  "users",
  "posts",
  "adminAccess",
  "adminNotifications",
  "platformActivity",
] as const;
export type Source = (typeof sources)[number];
export type PortalData = Record<Source, Row[]>;
const empty = (): PortalData =>
  Object.fromEntries(sources.map((s) => [s, []])) as unknown as PortalData;
export function usePortal(retry: number) {
  const [user, setUser] = useState<User | null>(null);
  const [access, setAccess] = useState(false);
  const [authReady, setAuthReady] = useState(!configured);
  const [data, setData] = useState<PortalData>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState<Source[]>([]);
  const [cached, setCached] = useState<Source[]>([]);
  useEffect(() => {
    if (!configured) return;
    const { auth, db } = firebase();
    let stopAccess = () => {};
    const stopAuth = onAuthStateChanged(auth, (next) => {
      stopAccess();
      setUser(next);
      setAccess(false);
      setData(empty());
      setLoaded([]);
      setErrors({});
      setCached([]);
      if (!next) {
        setAuthReady(true);
        return;
      }
      setAuthReady(false);
      stopAccess = onSnapshot(
        doc(db, "superAdminAccess", next.uid),
        { includeMetadataChanges: true },
        (snapshot) => {
          if (auth.currentUser?.uid !== next.uid || snapshot.metadata.fromCache) return;
          const allowed = snapshot.exists() && snapshot.data().isActive === true;
          setAccess(allowed);
          setAuthReady(true);
          if (!allowed) {
            setData(empty());
            setErrors({ access: "This account does not have active superadmin access." });
            void signOut(auth);
          }
        },
        (e) => {
          if (auth.currentUser?.uid !== next.uid) return;
          setAccess(false);
          setAuthReady(true);
          setErrors({ access: errorMessage(e) });
        },
      );
    });
    return () => {
      stopAccess();
      stopAuth();
    };
  }, [retry]);
  useEffect(() => {
    if (!access || !user) return;
    const { db } = firebase();
    const stops = sources.map((source) =>
      onSnapshot(
        collection(db, source),
        { includeMetadataChanges: true },
        (snapshot) => {
          if (firebase().auth.currentUser?.uid !== user.uid) return;
          setData((prev) => ({
            ...prev,
            [source]: snapshot.docs.map((d) => ({ ...d.data(), id: d.id })),
          }));
          setLoaded((prev) => (prev.includes(source) ? prev : [...prev, source]));
          setCached((prev) =>
            snapshot.metadata.fromCache
              ? [...new Set([...prev, source])]
              : prev.filter((x) => x !== source),
          );
          setErrors((prev) => {
            const next = { ...prev };
            delete next[source];
            return next;
          });
        },
        (e) => {
          setData((prev) => ({ ...prev, [source]: [] }));
          setErrors((prev) => ({ ...prev, [source]: errorMessage(e) }));
          setLoaded((prev) => (prev.includes(source) ? prev : [...prev, source]));
        },
      ),
    );
    return () => stops.forEach((stop) => stop());
  }, [access, user, retry]);
  return {
    user,
    access,
    authReady,
    data,
    errors,
    loading: loaded.length < sources.length,
    cached: cached.length > 0,
  };
}
