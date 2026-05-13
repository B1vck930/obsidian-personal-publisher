# Verification

## Task 6 Commands

Run from repository root:

```powershell
pnpm typecheck
pnpm test
pnpm --filter @opp/web build
pnpm --filter @opp/obsidian-plugin build
```

Latest Codex result:

```text
pnpm typecheck: pass
pnpm --filter @opp/web build: pass
pnpm test: blocked by Codex sandbox / Windows ACL esbuild parent-directory access
pnpm --filter @opp/obsidian-plugin build: blocked by Codex sandbox / Windows ACL esbuild parent-directory access
```

The blocked test/build failures are environment startup failures:

```text
Cannot read directory "../../../../..": Access is denied.
Could not resolve vitest.config.ts.
Could not resolve ./src/main.ts.
```

The same Task 6 plugin behavior was manually verified in Obsidian after deployment and plugin rebuild.

## Task 6 Coverage Added

Automated test files added:

```text
packages/obsidian-plugin/tests/publishApi.test.ts
packages/obsidian-plugin/tests/publishWorkflow.test.ts
```

Covered behavior:

```text
Create vs update API decision
Owner token sent for update/delete
API error handling
Local published page metadata add/remove
Update keeps same URL and owner token
Missing image warning blocks publish
Clipboard failure does not fail publish
Unpublish API call
```

## Production Verification

Task 6 production verification passed:

```text
POST /api/pages: 201 Created
PUT /api/pages/:id: 200 OK
DELETE /api/pages/:id: 200 OK
OPTIONS /api/pages: 204 with Obsidian CORS headers
OPTIONS /api/pages/:id for PUT: 204 with Obsidian CORS headers
OPTIONS /api/pages/:id for DELETE: 204 with Obsidian CORS headers
Manual Obsidian publish/update/unpublish test: pass
```

## Task 7 Commands

Run from repository root:

```powershell
pnpm --filter @opp/web test
pnpm --filter @opp/web typecheck
pnpm --filter @opp/web build
```

Latest Codex result:

```text
pnpm --filter @opp/web test: blocked by Codex sandbox / Windows ACL esbuild dependency access
pnpm --filter @opp/web typecheck: blocked after node_modules reinstall hit Windows EPERM
pnpm --filter @opp/web build: blocked after node_modules reinstall hit Windows EPERM
```

Latest normal PowerShell result:

```text
pnpm --filter @opp/web test: pass
pnpm --filter @opp/web typecheck: pass
pnpm --filter @opp/web build: pass
git push: pass
```

Blocking errors:

```text
Cannot read directory "../../../../..": Access is denied.
Module not found: Can't resolve '@supabase/supabase-js'
EPERM, Permission denied: node_modules\.pnpm\@supabase+supabase-js@2.105.4
```

## Task 7 Coverage Added

Automated test file added:

```text
apps/web/src/lib/cleanup.test.ts
```

Covered behavior:

```text
Cleanup secret is required.
Expired pages are selected by the repository.
No deletion runs when no expired pages exist.
Related asset rows are selected by page_id.
Temp assets referenced by Supabase public Storage URLs are selected by storage_path.
Storage object deletion is called before database row deletion.
Cleanup summary returns deleted page and asset counts.
```

## Task 7 Production Verification Pending

After Vercel deployment:

```text
1. Confirm CLEANUP_SECRET exists in Vercel Production env.
2. Open /api/cleanup-expired without secret and confirm 401.
3. Open /api/cleanup-expired?secret=<CLEANUP_SECRET> and confirm success JSON.
4. Create a short-lived test page.
5. Trigger cleanup after it expires.
6. Confirm the public page URL returns 404.
```

Observed production result before the follow-up fix:

```text
/api/cleanup-expired without secret: 503
Cause: route read CLEANUP_SECRET before checking whether the request included a secret query parameter; production also appears to be missing CLEANUP_SECRET.
Follow-up fix: reject requests without ?secret=... with 401 before reading env.
```

## Task 8 Commands

Run from repository root:

```powershell
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm --filter @opp/web build
pnpm --filter @opp/obsidian-plugin build
```

Latest Codex result:

```text
pnpm install --frozen-lockfile: blocked by Windows EPERM on node_modules\.pnpm\@supabase+supabase-js@2.105.4
pnpm test: blocked by Codex sandbox / Windows ACL esbuild config access
pnpm typecheck: @opp/obsidian-plugin passed; @opp/web blocked by @supabase/supabase-js dependency access
pnpm --filter @opp/web build: blocked by @supabase/supabase-js dependency access
pnpm --filter @opp/obsidian-plugin build: blocked by Codex sandbox / Windows ACL esbuild entrypoint access
```

Task 8 changes made:

```text
Plugin API errors now preserve HTTP status codes.
Network failures now show backend unavailable.
Invalid owner token notices are explicit.
Expired/not-found page notices are explicit.
Clipboard failure notice remains non-fatal and shows the URL.
README now documents the final MVP, setup, env vars, Supabase schema, Obsidian install, cleanup testing, troubleshooting, cost controls, limitations, and final acceptance checklist.
.pnpm-store/ is ignored.
```

Final push and verification status:

```text
Codex git push attempt 1: timed out after 120 seconds.
Codex git push attempt 2: timed out after 180 seconds.
Local branch status after attempts: main...origin/main [ahead 1].
Final verification still required in normal PowerShell because the Codex sandbox cannot repair or read the local dependency tree.
```

## Final Preview-Only Notice Bugfix

Issue:

```text
Obsidian still showed: Backend publishing is not implemented yet.
```

Cause:

```text
The Task 3 preview-only helper remained in packages/obsidian-plugin/src/markdownTransform.ts and its tests, even though the active publish command already calls publishMarkdownNote -> publishPageToApi -> /api/pages.
```

Fix:

```text
Removed formatPublishPreviewNotice from source.
Removed preview notice tests.
Confirmed source search in packages/obsidian-plugin/src and tests has no matches for the old text.
```

Required final verification in normal PowerShell:

```powershell
pnpm install --frozen-lockfile
pnpm --filter @opp/obsidian-plugin typecheck
pnpm --filter @opp/obsidian-plugin build
Select-String -Path packages\obsidian-plugin\main.js -Pattern "Backend publishing is not implemented yet","Publish preview ready"
Select-String -Path packages\obsidian-plugin\main.js -Pattern "/api/pages","Published current note"
```

Expected:

```text
The first Select-String command prints no matches.
The second Select-String command prints matches.
```
