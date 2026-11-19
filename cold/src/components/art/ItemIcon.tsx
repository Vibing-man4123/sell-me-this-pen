import { ART } from "@/lib/art/assets";

/** Merchandise icon, drawn from /public/art/items (see lib/art/assets.ts). */
export type ItemIconProps = {
  icon: string;
  size?: number;
  className?: string;
  title?: string;
};

export function ItemIcon({ icon, size = 64, className, title }: ItemIconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG files
    <img
      src={ART.item(icon)}
      width={size}
      height={size}
      alt={title ?? ""}
      aria-hidden={title ? undefined : true}
      loading="lazy"
      decoding="async"
      className={className}
    />
  );
}

export const ICON_KEYS = ["pen", "timeshare", "moon", "ostrich", "vowel", "condo", "rolodex"];
