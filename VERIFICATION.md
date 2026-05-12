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

## Production Verification Pending

After Task 6 push:

```text
1. Confirm Vercel deployment is READY.
2. Verify /api/pages OPTIONS returns CORS headers for app://obsidian.md.
3. Run the Obsidian manual publish/update/unpublish checklist in USER_ACTIONS.md.
```
