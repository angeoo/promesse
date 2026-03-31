import Link from "next/link";
import { SiteHeader } from "@/components/header";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-6">
      <SiteHeader />
      <main className="mx-auto mt-4 w-full max-w-7xl rounded-2xl border border-white/70 bg-white/95 px-4 py-8 shadow-soft backdrop-blur-md md:px-8 md:py-10 lg:rounded-3xl lg:px-10 lg:py-12">
        {children}
      </main>
      <footer className="mx-auto mt-6 w-full max-w-7xl rounded-2xl border border-white/70 bg-white/90 px-4 py-4 text-sm text-foreground/70 shadow-soft backdrop-blur-md md:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Promesse</p>
          <nav aria-label="Liens légaux">
            <Link className="font-semibold text-secondary hover:text-primary" href="/mentions-legales">
              Mentions légales
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
