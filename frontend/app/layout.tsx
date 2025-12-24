import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "@/store/ReduxProvider";

export const metadata: Metadata = {
  title: "LMS Platform - Learn, Grow, Certify",
  description: "Modern Learning Management System with integrated certification",
  keywords: ["lms", "learning", "education", "certification", "online courses"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-base text-neutral-900 dark:bg-base-dark dark:text-neutral-100">
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
