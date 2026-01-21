import { SiteHeader } from "@/components/header";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 mt-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-soft border border-white/70 md:px-8 md:py-10 lg:px-10 lg:py-12 lg:rounded-3xl">
        {children}
      </main>
    </div>
  );
}
