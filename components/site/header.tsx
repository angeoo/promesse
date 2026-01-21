import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";

const navItems = [
  { href: "/", label: "Accueil" },
  { href: "/association", label: "L’Association" },
  { href: "/actions", label: "Nos Actions" },
  { href: "/programmes", label: "Nos Programmes" },
  { href: "/ressources", label: "Ressources éducatives" },
  { href: "/s-engager", label: "S’engager" },
  { href: "/partenariats", label: "Partenariats" },
  { href: "/actualites", label: "Actualités" },
  { href: "/contact", label: "Contact / Faire un don" }
] satisfies Array<{ href: Route<string>; label: string }>;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 bg-background/90 backdrop-blur border-b border-border">
      <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white border border-border shadow-soft p-1">
            <Image
              src="/logo-promesse-small.png"
              alt="Logo Association Promesse"
              width={48}
              height={48}
              className="h-full w-full object-contain"
              priority
              unoptimized
            />
          </div>
        </Link>
        <nav className="flex flex-1 flex-nowrap items-center gap-3 text-[13px] font-semibold text-foreground/90 lg:justify-center">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-2 py-1 transition hover:bg-surface hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
