# Project Status

## Current Task
Task 6 - Connect plugin publish, update, and unpublish is complete and manually verified. Ready to start Task 7.

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
- Vercel production page API smoke test: pass
- Vercel page API CORS preflight for Obsidian origin: pass
- Manual Obsidian publish/update/unpublish test: pass

## Blockers
- No active Task 6 product blockers.
- Codex sandbox still cannot run Vitest or Obsidian plugin esbuild in this workspace because esbuild attempts to read a parent directory that Windows ACL denies. Normal local PowerShell manual verification passed.
