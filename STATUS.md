# Project Status

## Current Task
Task 4 - Backend Database and API completed in code. Vercel production deployment needs confirmation after push.

## Completed
- Task 1 - Project foundation and Vercel baseline.
- Task 2 - Obsidian plugin shell.
- Task 3 - Markdown asset extraction and publish preview notices.
- Task 4 - Backend database schema, page APIs, token handling, Markdown rendering, expiration logic, and public page rendering.

## Latest Verification
- pnpm test: pass
- pnpm typecheck: pass
- pnpm --filter @opp/web build: pass
- Supabase schema: pass, tables `pages` and `assets` exist, bucket `note-assets` exists and is public
- Vercel deployment: not checked after this task push
- Manual Obsidian test: not required for Task 4

## Blockers
- Vercel environment variables must be confirmed in the Vercel UI before backend API runtime testing.
