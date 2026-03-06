import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  href?: string;
  newTab?: boolean;
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-secondary disabled:cursor-not-allowed";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary/90 disabled:bg-primary/60 focus-visible:ring-primary",
  secondary:
    "bg-secondary text-white hover:bg-secondary/90 disabled:bg-secondary/60 focus-visible:ring-secondary",
  ghost:
    "bg-transparent text-foreground border border-border hover:bg-surface disabled:text-muted focus-visible:ring-secondary"
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "text-sm px-3 py-2",
  md: "text-base px-4 py-2.5",
  lg: "text-lg px-5 py-3"
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  children,
  href,
  newTab = false,
  ...props
}: ButtonProps) {
  const classes = cn(baseStyles, variantStyles[variant], sizeStyles[size], className);
  const content = (
    <>
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
          aria-hidden
        />
      )}
      <span>{children}</span>
    </>
  );

  if (href) {
    const rel = newTab ? "noreferrer noopener" : undefined;
    const target = newTab ? "_blank" : undefined;

    if (href.startsWith("/")) {
      return (
        <Link href={href} className={classes}>
          {content}
        </Link>
      );
    }

    return (
      <a href={href} className={classes} target={target} rel={rel}>
        {content}
      </a>
    );
  }

  return (
    <button
      className={classes}
      disabled={props.disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {content}
    </button>
  );
}
