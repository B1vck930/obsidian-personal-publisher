# obsidian-personal-publisher

A personal free Obsidian publishing tool that will publish the currently open Markdown note, including local images, as a public Notion-style webpage link that expires after 7 days.

This repository currently contains the Task 1 foundation only. Publishing, image upload, Supabase persistence, cleanup, and the full Obsidian workflow are intentionally not implemented yet.

## Scope

This is a personal tool, not a SaaS product.

In scope for the MVP:

- Obsidian plugin
- Publish only the currently active Markdown note
- Upload local images
- Public Notion-style page
- Update the same URL on republish
- Manual unpublish
- 7-day default expiration
- Daily cleanup of expired pages and assets

Out of scope:

- user accounts
- login
- payments
- subscriptions
- dashboards
- analytics
- team features
- public marketing site
- full-vault publishing

## Repository Layout

```text
obsidian-personal-publisher/
  apps/
    web/                  Next.js public site and API skeleton
  packages/
    obsidian-plugin/       Obsidian plugin skeleton
```

## Local Setup

Install dependencies:

```bash
corepack enable
pnpm install
```

Run all type checks:

```bash
pnpm typecheck
```

Run all tests:

```bash
pnpm test
```

Run the web app locally:

```bash
pnpm --filter @opp/web dev
```

Build the Obsidian plugin:

```bash
pnpm --filter @opp/obsidian-plugin build
```

## Environment

The following variables will be needed in later tasks:

```text
NEXT_PUBLIC_SITE_URL=https://your-vercel-app.vercel.app
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_STORAGE_BUCKET=note-assets
CLEANUP_SECRET=your_long_random_secret
DEFAULT_THEME=notion
DEFAULT_EXPIRATION_DAYS=7
DEFAULT_FOOTER_TEXT=Published by XIAOWANG - 18624433439
```

Do not expose the Supabase service role key to the Obsidian plugin or browser code.

## Vercel Deployment

The project pins pnpm with `packageManager: pnpm@9.15.9` and pins the runtime to Node.js `20.x`.

In Vercel, add this project environment variable if dependency installation fails or Vercel does not use the pinned pnpm version:

```text
ENABLE_EXPERIMENTAL_COREPACK=1
```

This tells Vercel to use Corepack and the `packageManager` value from `package.json` during dependency installation.

If the Vercel project root is set to `apps/web`, keep the `packageManager` and `engines` fields in `apps/web/package.json`; Vercel may read that package file as the deployment root.

## Current Status

Task 1 foundation is present:

- root workspace package
- pnpm workspace
- AGENTS.md
- README.md
- Next.js app skeleton
- Obsidian plugin skeleton
- TypeScript setup
- Vitest setup

Next task: implement the Obsidian plugin shell.
