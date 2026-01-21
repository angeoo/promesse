import { SiteHeader } from "@/components/site/header";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-12">{children}</main>
    </div>
  );
}
