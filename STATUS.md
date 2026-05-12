# Project Status

## Current Task
Task 6 - Connect plugin publish, update, and unpublish completed in code. Manual Obsidian end-to-end verification is required after deployment and plugin rebuild.

## Completed
- Task 1 - Project foundation and Vercel baseline.
- Task 2 - Obsidian plugin shell.
- Task 3 - Markdown asset extraction and publish preview notices.
- Task 4 - Backend database schema, page APIs, token handling, Markdown rendering, expiration logic, and public page rendering.
- Task 5 - Asset upload API, Supabase Storage asset records, plugin-side local image reading, upload, Markdown URL replacement, and warning handling.
- Task 6 - Plugin publish/create, update same URL, unpublish/delete, local metadata storage, URL copy, and page API CORS support.

## Latest Verification
- pnpm typecheck: pass
- pnpm --filter @opp/web build: pass
- pnpm test: blocked in Codex sandbox by Windows ACL/esbuild directory access
- pnpm --filter @opp/obsidian-plugin build: blocked in Codex sandbox by Windows ACL/esbuild directory access
- Vercel deployment: pending after Task 6 push
- Manual Obsidian publish/update/unpublish test: required

## Blockers
- Codex sandbox cannot run Vitest or Obsidian plugin esbuild in this workspace because esbuild attempts to read a parent directory that Windows ACL denies.
- User must run the plugin build locally in normal PowerShell and manually test in Obsidian.
