import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {title: "BriefBot — AI Document Assistant",
  description: "Convert raw notes and data into polished SOPs, reports, emails, and more.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
