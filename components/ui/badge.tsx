import { cn } from "@/lib/utils";

type BadgeTone = "primary" | "secondary" | "neutral";

type BadgeProps = {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
};

const toneStyles: Record<BadgeTone, string> = {
  primary: "bg-primary/10 text-primary border-primary/20",
  secondary: "bg-secondary/10 text-secondary border-secondary/20",
  neutral: "bg-muted text-foreground border-border"
};

export function Badge({ tone = "primary", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        toneStyles[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
