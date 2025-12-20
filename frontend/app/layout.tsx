import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
