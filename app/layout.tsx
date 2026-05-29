import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Happy 30th Birthday! ✨",
  description: "A digital memory box from your favorite people.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const particles = [...Array(30)].map((_, i) => ({
    id: i,
    top: `${(i * 17) % 100}%`,
    left: `${(i * 29) % 100}%`,
    delay: `${(i % 8) * 0.4}s`,
    duration: `${6 + (i % 5) * 1.2}s`,
  }));

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased text-slate-800`}>
        <div className="fixed inset-0 -z-10 bg-beehive-glade">
          <div className="absolute inset-0 bg-honeycomb-pattern pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none">
            {particles.map((p) => (
              <div key={p.id} className="pollen-particle" style={{ top: p.top, left: p.left, "--delay": p.delay, "--duration": p.duration } as React.CSSProperties} />
            ))}
          </div>
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,transparent_0%,transparent_60%,rgba(217,119,0,0.15)_100%)]" />
        </div>

        <main className="relative z-10 flex flex-col items-center w-full min-h-screen p-4 md:p-8 pb-16">
          {children}
        </main>
      </body>
    </html>
  );
}
