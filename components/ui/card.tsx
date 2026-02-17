import React from "react";
import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";

type CardProps = PropsWithChildren<{
  title?: string;
  className?: string;
  actions?: React.ReactNode;
}>;

export function Card({ title, actions, className, children }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-white shadow-soft p-6 flex flex-col gap-3",
        className
      )}
    >
      {(title || actions) && (
        <header className="flex items-start justify-between gap-2">
          {title && <h3 className="font-heading text-lg font-semibold text-foreground">{title}</h3>}
          {actions}
        </header>
      )}
      <div className="text-sm text-foreground/80">{children}</div>
    </section>
  );
}
