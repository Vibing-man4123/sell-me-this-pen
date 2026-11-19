import { ART } from "@/lib/art/assets";

export function RankBadge({
  rank,
  size = 24,
  className,
  title,
}: {
  rank: string;
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG files
    <img
      src={ART.rank(rank)}
      width={size}
      height={size}
      alt={title ?? ""}
      aria-hidden={title ? undefined : true}
      decoding="async"
      className={className}
    />
  );
}
