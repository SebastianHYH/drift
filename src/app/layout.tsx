import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

// Apply an explicit theme choice to prevent flashing of the wrong theme.
const themeScript = `try{var t=localStorage.getItem('drift-theme');if(t==='dark'||t==='light')document.documentElement.classList.add(t);}catch(e){}`;

const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-newsreader",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Drift. Letters to a stranger",
  description:
    "Write a letter to one random stranger. They may reply once. After a day, it's gone.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={newsreader.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen flex flex-col">
        <header className="px-6 pt-8 pb-2">
          <nav className="mx-auto flex max-w-2xl items-baseline justify-between">
            <Link href="/" className="text-2xl tracking-tight text-ink">
              Drift
            </Link>
            <div className="flex items-center gap-6 text-sm text-ink-soft">
              <Link href="/" className="transition-colors hover:text-accent">
                Write
              </Link>
              <Link href="/inbox" className="transition-colors hover:text-accent">
                Inbox
              </Link>
              <ThemeToggle />
            </div>
          </nav>
        </header>

        <main className="flex-1 px-6 py-10">{children}</main>

        <footer className="px-6 pb-10 pt-6">
          <div className="mx-auto max-w-2xl border-t border-edge pt-5 text-center text-xs leading-relaxed text-ink-soft">
            <p className="italic">
              Every letter and reply quietly disappears 24 hours after it&apos;s written.
            </p>
            <p className="mt-2">
              If you&apos;re in crisis, please reach out. call or text{" "}
              <span className="text-ink">988</span> (US Suicide &amp; Crisis Lifeline),
              or your local emergency number. You matter.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
