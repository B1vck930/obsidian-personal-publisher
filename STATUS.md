# Project Status

## Current Task
Task 8 - Final MVP polish and documentation implemented locally. Final push, normal PowerShell verification, Vercel deployment confirmation, and manual acceptance testing are pending.

## Completed
- Task 1 - Project foundation and Vercel baseline.
- Task 2 - Obsidian plugin shell.
- Task 3 - Markdown asset extraction and publish preview notices.
- Task 4 - Backend database schema, page APIs, token handling, Markdown rendering, expiration logic, and public page rendering.
- Task 5 - Asset upload API, Supabase Storage asset records, plugin-side local image reading, upload, Markdown URL replacement, and warning handling.
- Task 6 - Plugin publish/create, update same URL, unpublish/delete, local metadata storage, URL copy, and page API CORS support.
- Task 7 - Cleanup endpoint, protected cleanup secret check, expired page deletion, linked asset row deletion, Supabase Storage object deletion, temp asset URL matching, and daily Vercel Cron config.
- Task 8 - Final plugin error message polish, README documentation, cost controls, known limitations, troubleshooting, and final acceptance checklist.

## Latest Verification
- pnpm install --frozen-lockfile: blocked in Codex sandbox by Windows EPERM on @supabase/supabase-js
- pnpm test: blocked in Codex sandbox by Windows ACL/esbuild config access
- pnpm typecheck: plugin passed; web blocked in Codex sandbox by @supabase/supabase-js dependency access
- pnpm --filter @opp/web build: blocked in Codex sandbox by @supabase/supabase-js dependency access
- pnpm --filter @opp/obsidian-plugin build: blocked in Codex sandbox by Windows ACL/esbuild entrypoint access
- apps/web/vercel.json daily Cron config: confirmed
- Previous normal PowerShell Task 7 verification: @opp/web test/typecheck/build passed
- Git push from Codex: failed twice by timeout; local branch remains ahead of origin
- Vercel deployment: pending final push/deployment confirmation
- Manual Obsidian final acceptance test: required

## Blockers
- Codex cannot verify the cleanup endpoint with the real `CLEANUP_SECRET` because the secret should remain private.
- Codex sandbox cannot complete dependency install or build after Windows EPERM blocks @supabase/supabase-js in node_modules.
- Codex could not push the final Task 8 commit because git push timed out twice on this machine.
- Vercel production needs `CLEANUP_SECRET` configured and a redeploy before the protected cleanup endpoint can succeed.
