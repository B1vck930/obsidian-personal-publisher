# Project Status

## Current Task
Task 7 - Expiration cleanup implemented locally. Normal PowerShell verification, push, Vercel deployment, and manual cleanup endpoint test are pending.

## Completed
- Task 1 - Project foundation and Vercel baseline.
- Task 2 - Obsidian plugin shell.
- Task 3 - Markdown asset extraction and publish preview notices.
- Task 4 - Backend database schema, page APIs, token handling, Markdown rendering, expiration logic, and public page rendering.
- Task 5 - Asset upload API, Supabase Storage asset records, plugin-side local image reading, upload, Markdown URL replacement, and warning handling.
- Task 6 - Plugin publish/create, update same URL, unpublish/delete, local metadata storage, URL copy, and page API CORS support.
- Task 7 - Cleanup endpoint, protected cleanup secret check, expired page deletion, linked asset row deletion, Supabase Storage object deletion, temp asset URL matching, and daily Vercel Cron config.

## Latest Verification
- pnpm --filter @opp/web test: blocked in Codex sandbox by Windows ACL/esbuild dependency access
- pnpm --filter @opp/web typecheck: blocked after dependency reinstall hit Windows EPERM in node_modules
- pnpm --filter @opp/web build: blocked after dependency reinstall hit Windows EPERM in node_modules
- apps/web/vercel.json daily Cron config: confirmed
- Vercel deployment: pending Task 7 push
- Manual cleanup endpoint test: required after deployment

## Blockers
- Codex sandbox cannot repair or verify node_modules because Windows ACL/EPERM blocks @supabase/supabase-js during install and build.
- User must run dependency install and web verification once in normal PowerShell, then push the local Task 7 commit.
