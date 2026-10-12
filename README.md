# CampusPulse SuperAdmin

This folder contains the complete arranged website source.

1. Extract the ZIP completely.
2. In Visual Studio Code, choose **File → Open Folder** and select **CampusPulse-SuperAdmin** (the folder containing package.json).
3. Open **Terminal → New Terminal**.
4. Run `npm install`.
5. Copy `.env.example` to `.env.local` and fill in your Firebase WEB configuration from the same project as the Android app.
6. Publish the included `firestore.rules` and authorise your superadmin account as explained in **WEB-SETUP.md**, steps 3 and 4.
7. Run `npm run dev` and open the localhost address printed in the terminal.

The files are already in the correct folders. Skip the manual file placement section of WEB-SETUP.md.

No Firebase password or superadmin account is created by extracting this project. Sign in with the existing account whose UID you authorised. Without Firebase configuration, the website shows a setup message.

Node.js and npm must be installed on your computer. Generated folders and node_modules are excluded; npm install recreates the dependencies.

The website source previously passed production compilation and TypeScript checks; Firebase workflows passed emulator tests. Your live Firebase connection still needs the configuration and access document described above.
