import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MuiProvider } from "./components/campus-pulse/mui-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Campus Pulse | Super Admin",
  description: "Campus Pulse club administration and moderation dashboard",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <MuiProvider>{children}</MuiProvider>
      </body>
    </html>
  );
}
