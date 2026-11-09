# Sell Me This Pen

**Live: https://sellmethispen.vercel.app**

A satirical cold-calling game. You play **Jordan Beltford**, a parody 90s broker with too much
hair gel and no discernible licence: cold-call AI clients, sell them increasingly indefensible
merchandise, get graded by an LLM judge on charisma, confidence, objection handling and closing,
then spend the commission on a tasteless lifestyle.

> Jordan Beltford is an original caricature. Not based on, affiliated with, or endorsed by any
> real broker.

## Stack

| Layer | Choice |
|---|---|
| App | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS 4 (tokens in `src/app/globals.css`) |
| State | Zustand (from Phase 2) |
| Schema / structured output | Zod 4 |
| LLM | Groq free tier, behind a server-side route handler |
| Persistence | `localStorage` (Phase 2) |
| Hosting | Vercel |

## Running it

```bash
cd cold
npm install
cp .env.example .env.local   # fill in GROQ_API_KEY once Phase 1 lands
npm run dev
```

- `/` - title screen
- `/moodboard` - style bible: palette, type, the hand-drawn vector set, the scoring rubric, and a
  worked payout example

## Deploying

```bash
cd cold
npx vercel login
npx vercel          # preview
npx vercel --prod   # production
```

The repo root is one level above the app, so set the Vercel project's **Root Directory** to
`cold`. Running the commands from inside `cold/` makes the CLI offer exactly that.

From Phase 1 onward, set `GROQ_API_KEY` in the Vercel project's environment variables. It is read
only in server-side code and never shipped to the browser.

## Where things live

```
src/
  app/
    globals.css          design tokens: palette, fonts, paper/felt textures
    page.tsx             title screen
    moodboard/page.tsx   style bible
  components/
    art/                 hand-built flat-vector SVG (portraits, item icons)
    ui/                  Button, Panel - the only two primitives
  lib/
    game/
      rubric.ts          scoring criteria, weights, anchors, Zod verdict schema
      payout.ts          verdict -> commission
      personas.ts        the AI clients
      items.ts           the merchandise
      ranks.ts           Intern -> Legend ladder
      constants.ts       per-call tuning knobs
    prompts/
      clientPrompt.ts    system prompt for the client on the line
      judgePrompt.ts     system prompt + calibration examples for the grader
```

Balance lives in data, not in components: weights in `rubric.ts`, dollar values in `items.ts`,
difficulty in `personas.ts`. Re-tuning the game should not require touching UI or prompts.

The app lives in `cold/`; `../PLAN.md` holds the roadmap and `../PROGRESS.md` tracks where we
actually are.
