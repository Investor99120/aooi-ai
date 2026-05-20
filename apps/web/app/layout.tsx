import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Aooi Internal Review Dashboard",
  description: "Read-only file-based internal review dashboard for Aooi.",
};

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/brand", label: "Brand" },
  { href: "/product-facts", label: "Product Facts" },
  { href: "/schema", label: "Schema" },
  { href: "/faq", label: "FAQ" },
  { href: "/shopify", label: "Shopify" },
  { href: "/safety", label: "Safety" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <header className="topbar">
            <div className="topbar-inner">
              <div>
                <h1 className="brand-title">Aooi Internal Review Dashboard</h1>
                <p className="brand-subtitle">Read-only file-based review for FriendRedLight</p>
              </div>
              <nav className="nav" aria-label="Dashboard navigation">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
