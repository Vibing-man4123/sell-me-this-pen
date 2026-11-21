# How to work in this repo

## Team: Head + researcher + builder

The main session is the **Head** (Opus; set in `.claude/settings.json`). It plans, decides, writes specs and checks reports. To save tokens it does **not** read project files or write code itself. It delegates:

| Role | Agent (`.claude/agents/`) | Model | Use for |
|---|---|---|---|
| Head | main session | Opus | planning, decisions, specs, reviewing reports, git, talking to the owner |
| researcher | `researcher` | Haiku | reading files/docs/assets/git, finding code, measuring, web docs — read-only, reports facts with `path:line` |
| builder | `builder` | Sonnet | all code and doc edits, lint/build, headless playtests |

Rules for the Head:
- Give the builder precise specs: files it may touch, what not to change, how to verify (`npm run lint`, `npm run build` in `cold/`, headless Chrome via `playwright-core` + `/usr/bin/google-chrome`; `chromium-browser` is a broken snap stub).
- Use `model: "opus"` on the builder only for ambiguous or architectural work, or a bug that survived two attempts.
- Run builders in parallel only when their file sets don't overlap.
- Treat agent reports as claims; verify anything important (e.g. a second agent or a quick `git status`).
- Agents must kill any dev server they start (by PID). Check `pgrep -fa next` for orphans.
- Use mocked `/api/call` and `/api/judge` in UI tests; real Groq calls ≥8s apart, few per task (free tier: 8K TPM / 1K RPD per model).

## Project state

- Read `PROGRESS.md` (log, Polish) and `PLAN.md` (plan, Polish) at the start — via the researcher.
- After each step: have `PROGRESS.md` and `PLAN.md` updated, then move on to the next step in `PLAN.md` without waiting for approval.
- Commit and push only when the owner asks. A push to `main` deploys to Vercel (https://sellmethispen.vercel.app).

## Scope

Sell Me This Pen is a **CV/portfolio piece for a single viewer** (decided 2026-11-21). Prefer simplicity: no scaling infra, leaderboards, model pools or paid tiers. The app is in `cold/` — read `cold/AGENTS.md` before changing code (Next.js 16 differs from older versions). Art in `art/` is a template the owner will redraw under the same filenames; keep asset paths stable.
