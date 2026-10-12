# CampusPulse superadmin: install the complete files

These files connect the existing website to the SAME Firebase project as the Android app. The existing dark layout, navigation and branding are retained. Functional forms and real data replace sample content.

## 1. Put each file in its matching folder

Open the existing **super-admin** project. Replace the complete file content, rather than adding snippets to old files.

At the project root:
- package.json
- package-lock.json
- WEB-SETUP.md (this guide)

Inside `app/`:
- dashboard-client.tsx
- globals.css

Create `app/lib/` if it does not exist, and put these files there:
- firebase.ts
- portal.ts
- use-portal.ts
- use-dialog.ts

Inside `app/components/campus-pulse/`:
- analytics-view.tsx
- clubs-view.tsx
- cp-icon.tsx
- dashboard-view.tsx
- data.ts
- events-view.tsx
- login-screen.tsx
- notifications-view.tsx
- policy-view.tsx
- reports-view.tsx
- shared.tsx
- shell.tsx
- types.ts

**Delete the old `app/components/campus-pulse/icon.tsx`.** It has been renamed to `cp-icon.tsx` because Next.js treats `icon.tsx` as a special metadata route. The visual icons are unchanged. All supplied imports use the new filename.

Keep your existing page.tsx, layout.tsx, theme.ts, mui-provider.tsx, public images and configuration files.

## 2. Add your Firebase web configuration

In Firebase Console, open the same project used by the mobile app. Open Project settings → General → Your apps. Select the web app or register a web app. Copy its web configuration values.

Create `.env.local` beside `package.json`, using this template with YOUR values:

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_WEB_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_EXISTING_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_WEB_APP_ID
```

API key, auth domain, project ID and app ID are required. Storage is not used by this batch. Do not copy Android application identifiers into the web app ID field. Do not add a service account private key to this file.

If deploying later, add the same values to that host's environment settings before building. Restart the development server after changing `.env.local`.

Leave `NEXT_PUBLIC_USE_FIREBASE_EMULATORS` unset. That optional flag is only for local emulator tests; it must not be enabled for your actual project.

## 3. Publish the supplied Firestore rules

Open Firebase Console → Firestore Database → Rules.

Replace the full rules text with the supplied `firestore.rules`, then click **Publish**.

These are the complete combined rules for both Android and the website. Do not paste only the superadmin section over the existing mobile rules. They preserve student profile protection, memberships, notifications, leadership, posts, events and the previously removed member controls.

Alternatively, if your existing Firebase CLI project points to a local rules file, replace that file and deploy only Firestore rules. No Cloud Functions deployment is needed for this batch.

## 4. Authorise your superadmin account

Use an existing Firebase Authentication email/password account, or create one in Firebase Console → Authentication → Users → Add user.

Copy that account's **User UID** from Authentication. The UID is a long account identifier. It is not `adminAccess`, an email address or a club code.

In Firestore Database → Data:
1. Create the collection **superAdminAccess**.
2. Create a document whose document ID is the exact superadmin account UID you copied.
3. Add `isActive` with type **boolean** and value **true**.

Example structure (replace the bracketed label with the actual UID):

```text
superAdminAccess / [YOUR_AUTHENTICATION_UID]
  isActive: true   (boolean)
```

Do this in Firebase Console. The website and students cannot create or modify superadmin access documents.

Sign into the website using that account's actual email and password. No default password is provided. Club admin assignment alone does not grant website access.

Email/password sign-in must be enabled in Authentication → Sign-in method. If Firebase reports an unauthorised domain, add the website's hostname under Authentication settings → Authorised domains.

## 5. Install and run

Open a terminal in the **super-admin** folder containing package.json:

```bash
npm install
npm run dev
```

Open the localhost address printed by Next.js, usually `http://localhost:3000`.

For a production build:

```bash
npm run build
npm start
```

If an old local build causes problems, stop the server, remove only the generated `.next` folder, and restart it. Do not delete your source folders.

## What each section now does

| Section | Result |
| --- | --- |
| Login | Uses Firebase Authentication and a server-verified active superAdminAccess document. Restores authorised sessions and clears authentication on logout. |
| Dashboard | Live club, membership, application and report totals; real recorded activity and event counts. Memberships count club enrolments, so one student in two clubs counts twice. |
| Active Clubs | Searches, filters and sorts real clubs, loads their leadership, shows existing profile photos and the assigned club code. Send message opens an announcement form for that club. Deactivate/reactivate persists and controls club visibility and admin management. |
| Policy | Shows pending and reviewed mobile applications. Saves rejection feedback. Approval atomically creates an active club, founder membership, owner admin assignment and application decision. |
| Events | Shows live event details, date/location, existing poster URL and external RSVP link. Completed status rolls over with time. Export saves the filtered events as CSV. |
| Reports | Shows actual student flags. View reported content, hide it from feeds if appropriate, then record a resolution or dismissal with a note. Reviewed reports remain available for inspection. |
| Analytics | Actual active memberships, published posts, recorded joins over seven South African calendar days, club categories, event totals and platform report decisions. No invented attendance, view or uptime numbers. |
| Notifications | Pending action links, saved activity, sent announcements and a real send form. Announcements appear in the assigned club admin's existing mobile Notifications section. |
| Navigation | Sidebar shortcuts, expandable labels, event/report dialogs, keyboard focus, filters and logout are connected. Loading, connection and action errors are shown. Failed actions do not show a success message. |

## Approving a club

Open Policy → Pending → Review. Read the purpose/location and applicant details. The mobile application currently collects readiness declarations, not uploaded constitutions or verified signatures. Verify the supporting information separately, then tick the review checks, choose a supported category and enter feedback.

Click **Approve and create club**. On success:
- The applicant's original application changes to APPROVED, including feedback.
- A club is created with an ID equal to that applicant's UID.
- An active founder membership is created.
- An owner entry is created in adminAccess for that applicant's UID.
- A random club code is generated.

Find that club under Active Clubs and expand it to read its code. The applicant uses their **existing account email/password plus that code** in the mobile club admin login. The website does not create a new Firebase Authentication password.

If the applicant already has an adminAccess assignment, approval stops without partial changes. Resolve the existing assignment in Firebase Console before approving another club. Repeated approval attempts also stop without creating a duplicate club.

New clubs start without a photo because photo uploading remains postponed. Existing photos are maintained; no photo URLs are replaced with icons.

## Check the connection with your app

1. Sign in as your authorised superadmin; check that Coding Club is loaded rather than sample clubs.
2. Create a report in the student mobile app. It should appear under Reports on the website.
3. Send an announcement to Coding Club. Open the Coding Club admin's mobile Notifications section.
4. Submit a Create Club application using a separate student account that has no club admin assignment. Review and approve/reject it on the website; check the mobile application's decision feedback.
5. If approved, use that student's actual email/password and assigned club code to open their club admin dashboard.
6. Publish a mobile event and verify its title, date and location on the website. Try the event CSV export.
7. Log out of the website and reload. It must show login, not the dashboard.

## Validation completed here

- Next.js production compilation, TypeScript and static page generation passed.
- ESLint has zero errors. Five advisory warnings remain for ordinary image elements that preserve existing/external image display.
- 165 Firestore checks passed: 50 new superadmin checks plus existing admin, Home, applications, profile/member, leadership and notification checks.
- Actual website Firebase action code passed against Authentication and Firestore emulators: authorised/unauthorised login, complete atomic approval, duplicate prevention, rejection feedback, generated code, founder membership, announcements, deactivate/reactivate, content hiding, report resolution, activity and logout.
- Your live Firebase configuration, account and deployment were not accessible here. Complete the setup above and check the workflows on your own project. A full interactive browser test was not completed here.

This batch uses direct Authentication and Firestore operations. It adds no Cloud Functions deployment or Storage uploads. Photos picked from a phone, push notifications, external RSVP attendance tracking, official policy documents and revised rejected application submissions remain separate work. Firestore usage remains subject to your project's plan limits.
