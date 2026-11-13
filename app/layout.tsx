import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Youran (Selina) Zhao - Visual & UI/UX Designer",
  description: "Visual and UI/UX design portfolio by Youran (Selina) Zhao, featuring product UI, visual systems, and AI-assisted creative work.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
