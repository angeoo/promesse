import type { Metadata } from "next";
import { Libre_Baskerville, Questrial } from "next/font/google";
import { getSiteUrl } from "@/lib/site-url";
import "../styles/globals.css";

const heading = Libre_Baskerville({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap"
});

const body = Questrial({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Promesse | Association humanitaire",
  description:
    "Association Promesse : éducation menstruelle, lutte contre la précarité et soutien aux orphelins.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Promesse | Association humanitaire",
    description:
      "Association Promesse : éducation menstruelle, lutte contre la précarité et soutien aux orphelins.",
    url: siteUrl,
    siteName: "Promesse",
    locale: "fr_FR",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${heading.variable} ${body.variable}`}>
      <body className="font-body antialiased text-foreground min-h-screen">
        {children}
      </body>
    </html>
  );
}
