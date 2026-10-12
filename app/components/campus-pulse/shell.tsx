"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import type { ReactNode } from "react";
import type { NavigationItem, View } from "./types";
import { Icon } from "./cp-icon";
export function AppShell({
  view,
  navigation,
  setView,
  onLogout,
  children,
  notificationCount,
}: {
  view: View;
  navigation: NavigationItem[];
  setView: (v: View) => void;
  notificationCount: number;
  onLogout: () => void;
  children: ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  useEffect(() => {
    if (!drawerOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDrawerOpen(false);
        document.querySelector<HTMLButtonElement>(".menu-toggle")?.focus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [drawerOpen]);
  return (
    <div className={drawerOpen ? "mc-shell drawer-open" : "mc-shell"}>
      <aside className={drawerOpen ? "mc-sidebar drawer-open" : "mc-sidebar"}>
        <div className="mc-sidebar-head">
          <button
            className="mc-brand"
            onClick={() => {
              setView("dashboard");
              setDrawerOpen(false);
            }}
            aria-label="Campus Pulse dashboard"
          >
            <Image src="/ump-logo.jpg" alt="UMP" width={34} height={34} />
            <div>
              <b>Campus Pulse</b>
              <small>UMP · Super Admin</small>
            </div>
          </button>
          <button
            className="mc-drawer-close"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation"
            title="Close navigation"
          >
            <Icon name="x" />
          </button>
        </div>
        <nav id="cp-navigation" aria-label="Main navigation">
          {navigation.map((item) => (
            <button
              key={item.view}
              className={view === item.view ? "active" : ""}
              onClick={() => {
                setView(item.view);
                setDrawerOpen(false);
              }}
              aria-current={view === item.view ? "page" : undefined}
              aria-label={item.label}
              title={item.label}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="mc-side-bottom">
          <button className="mc-logout" onClick={onLogout} aria-label="Log out" title="Log out">
            <Icon name="logout" />
            <span>Log out</span>
          </button>
        </div>
      </aside>
      {drawerOpen && (
        <button
          className="cp-nav-scrim"
          aria-label="Close navigation"
          onClick={() => setDrawerOpen(false)}
        />
      )}
      <main
        className="mc-main"
        onClick={() => {
          if (drawerOpen) setDrawerOpen(false);
        }}
      >
        <header className="mc-topbar">
          <button
            className="menu-toggle"
            aria-label={drawerOpen ? "Collapse navigation" : "Expand navigation"}
            aria-expanded={drawerOpen}
            aria-controls="cp-navigation"
            onClick={(e) => {
              e.stopPropagation();
              setDrawerOpen((v) => !v);
            }}
          >
            ☰
          </button>
          <strong className="cp-topbar-title">
            {navigation.find((item) => item.view === view)?.label || "Dashboard"}
          </strong>
          <div className="mc-shortcuts">
            <button onClick={() => setView("policy")}>Applications ↗</button>
            <button onClick={() => setView("events")}>Events ↗</button>
            <button onClick={() => setView("reports")}>Reports ↗</button>
            <button
              className="mc-bell"
              onClick={() => setView("notifications")}
              aria-label="Notifications"
            >
              <Icon name="bell" />
              {notificationCount > 0 && <i />}
            </button>
          </div>
        </header>
        <div className="mc-content">{children}</div>
      </main>
    </div>
  );
}
