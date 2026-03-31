import React from "react";
import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";

type CardProps = PropsWithChildren<{
  title?: string;
  className?: string;
  actions?: React.ReactNode;
  headerClassName?: string;
  titleClassName?: string;
}>;

export function Card({ title, actions, className, headerClassName, titleClassName, children }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-white shadow-soft p-6 flex flex-col gap-3",
        className
      )}
    >
      {(title || actions) && (
        <header className={cn("flex items-start justify-between gap-2", headerClassName)}>
          {title && (
            <h3 className={cn("font-heading text-lg font-semibold text-foreground", titleClassName)}>
              {title}
            </h3>
          )}
          {actions}
        </header>
      )}
      <div className="text-sm text-foreground/80">{children}</div>
    </section>
  );
}
