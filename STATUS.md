# Project Status

## Current Task
Task 7 - Expiration cleanup implemented, locally verified, and pushed. Production cleanup endpoint env/config verification is pending.

## Completed
- Task 1 - Project foundation and Vercel baseline.
- Task 2 - Obsidian plugin shell.
- Task 3 - Markdown asset extraction and publish preview notices.
- Task 4 - Backend database schema, page APIs, token handling, Markdown rendering, expiration logic, and public page rendering.
- Task 5 - Asset upload API, Supabase Storage asset records, plugin-side local image reading, upload, Markdown URL replacement, and warning handling.
- Task 6 - Plugin publish/create, update same URL, unpublish/delete, local metadata storage, URL copy, and page API CORS support.
- Task 7 - Cleanup endpoint, protected cleanup secret check, expired page deletion, linked asset row deletion, Supabase Storage object deletion, temp asset URL matching, and daily Vercel Cron config.

## Latest Verification
- pnpm --filter @opp/web test: pass in normal PowerShell
- pnpm --filter @opp/web typecheck: pass in normal PowerShell
- pnpm --filter @opp/web build: pass in normal PowerShell
- apps/web/vercel.json daily Cron config: confirmed
- Git push: pass
- Vercel deployment: pending production endpoint confirmation
- Manual cleanup endpoint without secret returned 503 before the follow-up fix, indicating production `CLEANUP_SECRET` is missing or not available to the deployment
- Follow-up fix added so requests without a `secret` query return 401 before reading env
- Manual cleanup endpoint test with configured `CLEANUP_SECRET`: required after deployment

## Blockers
- Codex cannot verify the cleanup endpoint with the real `CLEANUP_SECRET` because the secret should remain private.
- Vercel production needs `CLEANUP_SECRET` configured and a redeploy before the protected cleanup endpoint can succeed.
