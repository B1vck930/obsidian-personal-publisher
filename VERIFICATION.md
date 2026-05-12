# Verification

## Task 5 Commands

Run from repository root:

```powershell
pnpm typecheck
pnpm test
pnpm --filter @opp/web build
pnpm --filter @opp/obsidian-plugin build
```

Latest local result:

```text
pnpm typecheck: pass
pnpm test: pass, 12 test files / 52 tests
pnpm --filter @opp/web build: pass
pnpm --filter @opp/obsidian-plugin build: pass
```

Notes:

```text
Local Node is v24.14.0, while package.json asks for Node 20.x. This produces warnings only in the current local environment.
Vercel should use the configured Node 20 engine.
```

## Task 5 Coverage

Verified by automated tests:

```text
apps/web/src/lib/assetUpload.test.ts
packages/obsidian-plugin/tests/assetUpload.test.ts
```

Covered behavior:

```text
Supported image uploads: png, jpg/jpeg, gif, webp, svg
Unsupported image rejection
Max image size rejection
Safe Supabase Storage path generation
Plugin local image upload and Markdown URL replacement
Missing image warnings
Oversized image warnings
Upload failure warnings
```

## Supabase Verification

Project:

```text
obsidian-personal-publisher
tnxqbeogudkvdcbjkoat
```

Already verified in Task 4:

```text
public.pages exists
public.assets exists
storage bucket note-assets exists and is public
```

## Manual Verification

Use the Task 5 steps in `USER_ACTIONS.md` after Vercel deploys the latest commit.
