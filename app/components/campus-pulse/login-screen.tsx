"use client";
import { FormEvent, useState } from "react";
import Image from "next/image";
export function LoginScreen({
  onLogin,
  externalError,
}: {
  externalError?: string;
  onLogin: (email: string, password: string) => Promise<void>;
}) {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Enter your university email and password.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await onLogin(email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login-page">
      <section className="login-brand" aria-label="Campus Pulse">
        <div className="login-brand-top">
          <div className="login-brand-identity">
            <Image src="/ump-logo.jpg" alt="" width={54} height={54} />
            <div>
              <strong>Campus Pulse</strong>
              <span>University of Mpumalanga</span>
            </div>
          </div>
          <span className="login-campus-tag">Super Admin</span>
        </div>
        <div className="campus-art" aria-hidden="true">
          <svg viewBox="0 0 900 760" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="campus-sky" x1="0" y1="0" x2="0.9" y2="1">
                <stop offset="0" stopColor="#6dadd1" />
                <stop offset="0.56" stopColor="#24618b" />
                <stop offset="1" stopColor="#102e4c" />
              </linearGradient>
              <linearGradient id="campus-glass" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#91c5dc" />
                <stop offset="1" stopColor="#22516b" />
              </linearGradient>
              <linearGradient id="campus-ground" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#143852" />
                <stop offset="1" stopColor="#071c31" />
              </linearGradient>
              <linearGradient id="campus-glow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffb454" stopOpacity=".95" />
                <stop offset="1" stopColor="#f47b32" stopOpacity=".12" />
              </linearGradient>
            </defs>
            <rect width="900" height="760" fill="url(#campus-sky)" />
            <circle cx="710" cy="184" r="105" fill="#f1a24a" opacity=".9" />
            <path d="M0 365 143 290l147 55 147-103 146 104 141-76 176 89v182H0Z" fill="#214d5d" />
            <path d="M0 425 167 337l163 64 139-71 171 72 140-47 120 48v152H0Z" fill="#193c4b" />
            <path d="M0 511h900v249H0Z" fill="url(#campus-ground)" />
            <path d="M67 483 370 361q31-13 65 0l388 137v34L67 521Z" fill="#09243c" />
            <path
              d="M83 474 375 357q28-11 57 0l367 128-12 21-362-127q-20-7-39 1L92 501Z"
              fill="#f19a43"
            />
            <path d="M103 482 383 372q22-9 43-1l342 119v174H103Z" fill="url(#campus-glass)" />
            <path
              d="M103 482 383 372q22-9 43-1l342 119"
              fill="none"
              stroke="#f8b65b"
              strokeWidth="8"
            />
            <path
              d="M106 522h660M106 562h660M106 602h660M106 642h660"
              stroke="#f5b263"
              strokeOpacity=".55"
              strokeWidth="4"
            />
            <path
              d="m178 454 1 231m89-266v266m91-302v302m91-302v302m91-267v267m91-231v231m91-195v195"
              stroke="#153b55"
              strokeWidth="8"
            />
            <path d="M0 685q224-65 450-11t450 0v86H0Z" fill="#071b2c" opacity=".84" />
            <path
              d="M0 704q215-43 450-5t450-3"
              fill="none"
              stroke="url(#campus-glow)"
              strokeWidth="5"
              opacity=".8"
            />
            <path d="M530 760q80-46 185-63 85-14 185 1v62Z" fill="#f49b48" opacity=".19" />
            <g fill="#0b2637">
              <path d="M57 511h18v74H57zM46 512q20-45 40 0zM818 483h17v84h-17zM807 485q20-46 40 0z" />
              <circle cx="66" cy="503" r="24" />
              <circle cx="826" cy="475" r="26" />
            </g>
            <g fill="#f5a354" opacity=".68">
              <path d="M150 513h3v132h-3zM332 442h3v202h-3zM515 438h3v206h-3zM697 500h3v144h-3z" />
            </g>
          </svg>
        </div>
        <div className="login-brand-content">
          <span className="brand-pill">
            <i /> A UNIVERSITY COMMUNITY, CONNECTED
          </span>
          <h1>
            One campus.
            <br />
            One pulse.
          </h1>
          <p>
            A clearer view of campus life. Govern clubs, events and student-community activity from
            one secure university workspace.
          </p>
          <div className="login-brand-footer">
            <span>University of Mpumalanga</span>
            <span>Student Community Platform</span>
          </div>
        </div>
      </section>
      <section className="login-card-wrap">
        <form className="login-card" onSubmit={submit} aria-labelledby="login-heading">
          <div className="login-form-kicker">
            <span className="eyebrow">SUPER ADMIN PORTAL</span>
            <span className="login-secure-badge">
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M5.5 8V5.8a4.5 4.5 0 0 1 9 0V8m-9.8 0h10.6v8.5H4.7V8Z" />
                <circle cx="10" cy="12" r="1" />
                <path d="M10 13v1.4" />
              </svg>
              Secure access
            </span>
          </div>
          <h2 id="login-heading">Welcome back</h2>
          <p className="login-intro">Sign in with your authorised university account.</p>
          <label htmlFor="login-email">
            University email
            <input
              id="login-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="name@ump.ac.za"
              autoComplete="username"
              required
              disabled={busy}
              aria-invalid={Boolean(externalError || error)}
              aria-describedby={externalError || error ? "login-error" : undefined}
            />
          </label>
          <div className="login-field">
            <label htmlFor="login-password">Password</label>
            <div className="password login-password">
              <input
                id="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={show ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                disabled={busy}
                aria-invalid={Boolean(externalError || error)}
                aria-describedby={externalError || error ? "login-error" : undefined}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                aria-label={show ? "Hide password" : "Show password"}
                aria-pressed={show}
                disabled={busy}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  {show ? (
                    <>
                      <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                      <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.2 0 8.7 4.8 9.5 6-.3.5-1.3 1.9-2.8 3.2M6.2 6.2C3.9 7.8 2.7 9.8 2.5 11c.6 1 4 7 9.5 7 1.3 0 2.4-.3 3.4-.8" />
                    </>
                  ) : (
                    <>
                      <path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
                      <circle cx="12" cy="12" r="2.7" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>
          {(externalError || error) && (
            <div className="form-error" id="login-error" role="alert">
              {externalError || error}
            </div>
          )}
          <button className="login-btn" type="submit" disabled={busy}>
            <span>{busy ? "Signing in…" : "Sign in to dashboard"}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 12h15m-6-6 6 6-6 6" />
            </svg>
          </button>
          <div className="secure-note">
            <span className="secure-note-dot" />
            Your university account is protected with secure sign-in.
          </div>
        </form>
      </section>
    </main>
  );
}
