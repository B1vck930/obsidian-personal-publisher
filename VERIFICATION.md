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
