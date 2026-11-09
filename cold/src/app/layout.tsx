import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { GAME_TITLE } from "@/lib/game/constants";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: `${GAME_TITLE} - cold calls, absurd merchandise, obscene luxury`,
  description:
    "Play a parody 90s broker: cold-call increasingly strange AI clients, get graded on charisma, confidence, objection handling and closing, then spend the commission on a tasteless lifestyle.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
