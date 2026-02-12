type MediaPlaceholderProps = {
  label?: string;
  aspect?: "16/9" | "4/3" | "1/1";
  tone?: "photo" | "video" | "chart";
  src?: string;
  alt?: string;
};

const toneMap: Record<NonNullable<MediaPlaceholderProps["tone"]>, string> = {
  photo: "from-primary/10 via-secondary/10 to-accent/20",
  video: "from-accent/20 via-secondary/20 to-primary/20",
  chart: "from-secondary/10 via-primary/10 to-accent/10"
};

export function MediaPlaceholder({
  label = "Média à venir",
  aspect = "16/9",
  tone = "photo",
  src,
  alt = "Media"
}: MediaPlaceholderProps) {
  const padding = aspect === "4/3" ? "pt-[75%]" : aspect === "1/1" ? "pt-[100%]" : "pt-[56.25%]";

  return (
    <div className={`relative w-full overflow-hidden rounded-lg border border-border shadow-soft ${padding}`}>
      {src ? (
        <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${toneMap[tone]} flex items-center justify-center`}
        >
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-foreground/80">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
