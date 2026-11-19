/**
 * Single map of every art file. The SVGs in /public/art are a template the
 * owner will redraw under the same filenames - change paths here, nowhere else.
 */

export type PersonaMood = "neutral" | "resist" | "sold";
export type JordanMood = "grin" | "panic" | "rich";
export type PhoneState = "idle" | "ringing" | "live";

/** Persona id -> file prefix in /art/characters. */
export const PERSONA_ART_PREFIX = {
  "dr-brenda-kalb": "brenda",
  "kai-mercer": "kai",
  "eunice-pell": "eunice",
  "dale-hochstetter": "dale",
  "saffron-vey": "saffron",
  "gil-orloff": "gil",
} as const;

export type ArtPersonaId = keyof typeof PERSONA_ART_PREFIX;

const BASE = "/art";

export function personaArt(personaId: string, mood: PersonaMood = "neutral"): string | null {
  const prefix = (PERSONA_ART_PREFIX as Record<string, string | undefined>)[personaId];
  return prefix ? `${BASE}/characters/${prefix}_${mood}.svg` : null;
}

export const ART = {
  jordan: {
    grin: `${BASE}/characters/jordan_grin.svg`,
    panic: `${BASE}/characters/jordan_panic.svg`,
    rich: `${BASE}/characters/jordan_rich.svg`,
  } satisfies Record<JordanMood, string>,
  phone: {
    idle: `${BASE}/props/phone_idle.svg`,
    ringing: `${BASE}/props/phone_ringing.svg`,
    live: `${BASE}/props/phone_live.svg`,
    handset: `${BASE}/props/phone_handset.svg`,
  },
  props: {
    monitor: `${BASE}/props/monitor.svg`,
    monitorGlare: `${BASE}/props/monitor-glare.svg`,
  },
  backgrounds: {
    desk: `${BASE}/backgrounds/bg-desk.svg`,
    title: `${BASE}/backgrounds/bg-title.svg`,
  },
  fx: {
    cashBurst: `${BASE}/fx/fx-cash-burst.svg`,
    dialtone: `${BASE}/fx/fx-dialtone.svg`,
    hungupStamp: `${BASE}/fx/fx-hungup-stamp.svg`,
    ring: `${BASE}/fx/fx-ring.svg`,
    soldStamp: `${BASE}/fx/fx-sold-stamp.svg`,
    sweat: `${BASE}/fx/fx-sweat.svg`,
  },
  logo: {
    wordmark: `${BASE}/logo/logo-wordmark.svg`,
    icon: `${BASE}/logo/logo-icon.svg`,
  },
  /**
   * Merchandise icon, keyed by Item.icon (pen, timeshare, moon, ostrich, vowel,
   * condo, plus "rolodex" for the title footer). ART.md names them item-<key>;
   * code item ids differ (lunar-acre -> moon, ostrich-futures -> ostrich, ...)
   * so we map through Item.icon, not Item.id.
   */
  item: (icon: string) => `${BASE}/items/item-${icon}.svg`,
  /** Rank badge; ART.md rank ids match code RankIds exactly. */
  rank: (id: string) => `${BASE}/ranks/rank-${id}.svg`,
  /** Lifestyle Shop item art (placeholders for now); one file per shop item id. */
  shop: (id: string) => `${BASE}/shop/shop-${id}.svg`,
  ui: {
    bubbleBroker: `${BASE}/ui/ui-bubble-broker.svg`,
    bubbleClient: `${BASE}/ui/ui-bubble-client.svg`,
    bubbleSet: `${BASE}/ui/ui-bubble-set.svg`,
    buttonSet: `${BASE}/ui/ui-button-set.svg`,
    frame: `${BASE}/ui/ui-frame.svg`,
  },
} as const;
