# Verification

## Task 4 Commands

Run from repository root:

```powershell
pnpm test
pnpm typecheck
pnpm --filter @opp/web build
```

Expected result:

```text
pnpm test: all workspace tests pass
pnpm typecheck: all workspace typechecks pass
pnpm --filter @opp/web build: Next.js production build succeeds
```

Latest local result:

```text
pnpm test: pass
pnpm typecheck: pass
pnpm --filter @opp/web build: pass
```

## Supabase Verification

Project:

```text
obsidian-personal-publisher
tnxqbeogudkvdcbjkoat
```

Verified:

```text
public.pages exists
public.assets exists
storage bucket note-assets exists and is public
```

## Task 4 Manual Backend Test

Use the PowerShell commands in `USER_ACTIONS.md` after Vercel deploys the latest commit.
