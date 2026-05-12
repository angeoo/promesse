"use client";

import { useState } from "react";
import { PdfPreviewModal } from "@/components/ui/pdf-preview-modal";

export type FicheItem = {
  label: string;
  url?: string;
};

export function FichesPdfList({ items }: { items: FicheItem[] }) {
  const [preview, setPreview] = useState<FicheItem | null>(null);

  return (
    <>
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li key={item.label}>
            {item.url ? (
              <button
                type="button"
                onClick={() => setPreview(item)}
                className="flex w-full items-center justify-between py-2.5 text-left text-sm text-foreground/80 transition hover:text-foreground"
              >
                <span>{item.label}</span>
                <span className="ml-4 shrink-0 text-xs font-semibold text-secondary">
                  Consulter →
                </span>
              </button>
            ) : (
              <span className="flex items-center justify-between py-2.5 text-sm text-foreground/45">
                <span>{item.label}</span>
                <span className="ml-4 text-xs">Bientôt disponible</span>
              </span>
            )}
          </li>
        ))}
      </ul>

      {preview?.url ? (
        <PdfPreviewModal
          url={preview.url}
          title={preview.label}
          onClose={() => setPreview(null)}
        />
      ) : null}
    </>
  );
}
