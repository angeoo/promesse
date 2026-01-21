import { SiteHeader } from "@/components/header";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-10 py-12 mt-6 bg-white/95 backdrop-blur-md rounded-3xl shadow-soft border border-white/70">
        {children}
      </main>
    </div>
  );
}
