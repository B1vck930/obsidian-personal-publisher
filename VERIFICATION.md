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

Use the Task 5 Obsidian steps in `USER_ACTIONS.md`.

## Production API Smoke Test

Latest production deployment:

```text
commit: 9b10df387118f880dd1a8eadd4844f7576e1be43
state: READY
alias: https://obsidian-personal-publisher.vercel.app
```

Production asset upload:

```text
POST /api/assets: pass
returned assetId, url, storagePath
uploaded public asset URL: HTTP 200 image/png
```
