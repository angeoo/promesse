import React from "react";
import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";

type TitleProps = PropsWithChildren<{
  level?: 1 | 2 | 3 | 4;
  className?: string;
}>;

export function Title({ level = 1, className, children }: TitleProps) {
  const Tag = (`h${level}` as unknown) as keyof JSX.IntrinsicElements;
  const sizes: Record<number, string> = {
    1: "text-4xl md:text-5xl",
    2: "text-3xl md:text-4xl",
    3: "text-2xl md:text-3xl",
    4: "text-xl md:text-2xl"
  };

  return (
    <Tag
      className={cn(
        "font-heading font-semibold text-foreground leading-tight tracking-tight",
        sizes[level],
        className
      )}
    >
      {children}
    </Tag>
  );
}

type TextProps = PropsWithChildren<{
  tone?: "muted" | "default";
  className?: string;
}>;

export function Text({ tone = "default", className, children }: TextProps) {
  return (
    <p
      className={cn(
        "text-base md:text-lg leading-relaxed",
        tone === "muted" ? "text-foreground/70" : "text-foreground",
        className
      )}
    >
      {children}
    </p>
  );
}
