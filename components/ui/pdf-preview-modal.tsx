"use client";

import { useEffect } from "react";

type PdfPreviewModalProps = {
  url: string;
  title: string;
  onClose: () => void;
};

export function PdfPreviewModal({ url, title, onClose }: PdfPreviewModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Aperçu : ${title}`}
    >
      <div
        className="relative flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-border bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3">
          <p className="truncate text-sm font-semibold text-foreground">{title}</p>
          <button
            onClick={onClose}
            className="ml-4 rounded-md px-3 py-1 text-sm text-foreground/60 transition hover:bg-surface hover:text-foreground"
            aria-label="Fermer l'aperçu"
          >
            Fermer
          </button>
        </header>
        <iframe
          src={url}
          title={`Aperçu PDF : ${title}`}
          className="flex-1"
          style={{ border: "none", display: "block" }}
        />
      </div>
    </div>
  );
}
