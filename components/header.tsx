"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { Route } from "next";
import { usePathname } from "next/navigation";

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
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: Route<string>) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-border">
      <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
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
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="ml-auto inline-flex items-center justify-center rounded-md border border-border px-3 py-2 text-sm font-semibold text-foreground hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary md:hidden"
          aria-expanded={open}
          aria-label="Ouvrir la navigation"
        >
          <span className="sr-only">Navigation</span>
          <span className="flex h-4 w-4 flex-col justify-between">
            <span className="block h-[2px] w-full bg-foreground"></span>
            <span className="block h-[2px] w-full bg-foreground"></span>
            <span className="block h-[2px] w-full bg-foreground"></span>
          </span>
        </button>
        <nav
          className={`${
            open ? "flex" : "hidden"
          } w-full flex-col gap-2 text-sm font-semibold text-foreground/90 md:flex md:w-auto md:flex-1 md:flex-wrap md:flex-row md:items-center md:justify-center md:gap-x-4 md:gap-y-2 lg:justify-center`}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 transition ${
                isActive(item.href)
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "hover:bg-surface hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
