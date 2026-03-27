import type { ReactNode } from "react";
import "./globals.css";

/** Root pass-through; `<html>` / `<body>` live in `app/[locale]/layout.tsx` (next-intl). */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
