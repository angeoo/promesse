import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Promesse | Association humanitaire",
  description:
    "Association Promesse : éducation menstruelle, lutte contre la précarité et soutien aux orphelins."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="font-body antialiased text-foreground min-h-screen">
        {children}
      </body>
    </html>
  );
}
