# Cortex

**Your brain's command centre.** A keyboard-driven life organiser that pulls your Gmail inbox, auto-categorises with AI, and lets you manage everything in one dense, beautiful interface.

![Next.js](https://img.shields.io/badge/Next.js_16-black?logo=next.js)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?logo=cloudflare&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)

---

## How it works

Emails land in your inbox. Cortex syncs them via the Gmail API, then Claude (Haiku) reads each one and sorts it into a **lane**:

| Lane | Purpose |
|------|---------|
| **Reply** | Needs a response |
| **Action** | Requires you to do something |
| **Read** | Worth reading later |
| **Reference** | Saved for lookup (manual only) |

You can also create manual tasks in any lane. Everything lives in one view — no tabs, no page switches.

## Features

- **Multi-lane columns** — toggle, reorder, and colour-coded
- **AI categorisation** — Claude Haiku sorts incoming email automatically
- **Gmail sync** — two-way read status, inbox pull
- **Keyboard-first** — `j`/`k`/arrows to navigate, `Enter` to read, `Backspace` to archive
- **Drag and drop** — move items between lanes
- **Reading pane** — full overlay, not a sidebar
- **Archive & restore** — clear items, bring them back
- **Reference bin** — collapsible bottom drawer for pinned items
- **Dark theme** — navy blue with lane-tinted columns

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) + React 19 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Runtime | Cloudflare Workers via `@opennextjs/cloudflare` |
| Database | Cloudflare D1 (SQLite) + Drizzle ORM |
| Auth | Auth.js v5 + Google OAuth |
| AI | Claude API (Haiku) |

## Setup

```bash
# Install dependencies
npm install

# Set up your secrets
cp .dev.vars.example .dev.vars
# Fill in: AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, ANTHROPIC_API_KEY

# Run database migrations
npx drizzle-kit push

# Start dev server
npm run dev
```

## Deploy

```bash
npm run deploy
```

Deploys to Cloudflare Workers. Database is Cloudflare D1 — no external services needed.

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `j` / `k` / `Arrow keys` | Navigate items |
| `Enter` / Click | Open reading pane |
| `Escape` | Close pane / deselect |
| `Backspace` | Archive (or restore in archive view) |
| `Cmd+Shift+S` | Sync Gmail |

---

Built for one person. No multi-tenancy, no onboarding flow, no landing page. Just a tool that works.
