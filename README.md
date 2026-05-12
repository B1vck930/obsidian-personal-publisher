# Obsidian Personal Publisher

A personal, free Obsidian publishing tool for the currently active Markdown note. It uploads local images, creates a public Notion-style webpage, keeps the same URL on republish, supports unpublish, and cleans up expired pages and assets.

Production URL:

```text
https://obsidian-personal-publisher.vercel.app
```

## Scope

This is a personal tool, not a SaaS product.

Included in the MVP:

- Obsidian plugin for the current active Markdown note.
- Local image detection and upload.
- Public webpage rendering for headings, paragraphs, links, images, tables, task lists, ordered and unordered lists, fenced code blocks, and simple Obsidian callouts.
- Public URL that opens without login.
- Republish updates the same URL.
- Unpublish deletes the public page.
- Default expiration is 7 days.
- Daily cleanup of expired pages and related uploaded assets.
- Configurable API base URL, theme, expiration, footer text, and max image size.

Intentionally not included:

- Accounts, login, payments, subscriptions, pricing, teams, dashboards, analytics, comments, custom domains, full-vault publishing, graph publishing, Dataview execution, Canvas rendering, Excalidraw rendering, or third-party Obsidian plugin rendering.

## Defaults

```text
Theme: notion
Expiration: 7 days
Footer: Published by XIAOWANG - 18624433439
Max image size: 5 MB
Storage bucket: note-assets
Target cost: USD 0 / GBP 0
```

The public page footer shows:

```text
Updated at: ...
Expires at: ...
Published by XIAOWANG - 18624433439
```

## Repository Layout

```text
apps/web                  Next.js app, public pages, and API routes
packages/obsidian-plugin  Obsidian plugin source and build output
STATUS.md                 Current project status
USER_ACTIONS.md           Required human actions, if any
VERIFICATION.md           Verification history and commands
```

## Local Setup

Use Node.js 20.x and pnpm 9.15.9.

```powershell
corepack enable
corepack prepare pnpm@9.15.9 --activate
pnpm install --frozen-lockfile
```

If PowerShell blocks `pnpm.ps1`, run `pnpm.cmd` instead.

Run checks:

```powershell
pnpm test
pnpm typecheck
pnpm --filter @opp/web build
pnpm --filter @opp/obsidian-plugin build
```

Run the web app locally:

```powershell
pnpm --filter @opp/web dev
```

## Vercel Setup

Use Vercel Hobby and the default `.vercel.app` domain to keep the project free.

Project settings:

```text
Root Directory: apps/web
Node.js: 20.x
Package manager: pnpm
```

The repository pins:

```json
"packageManager": "pnpm@9.15.9",
"engines": {
  "node": "20.x"
}
```

If Vercel dependency installation fails or does not use the pinned pnpm version, add:

```text
ENABLE_EXPERIMENTAL_COREPACK=1
```

Daily cleanup is configured in [apps/web/vercel.json](apps/web/vercel.json):

```json
{
  "crons": [
    {
      "path": "/api/cleanup-expired",
      "schedule": "0 3 * * *"
    }
  ]
}
```

## Environment Variables

Set these in Vercel Production:

```text
NEXT_PUBLIC_SITE_URL=https://obsidian-personal-publisher.vercel.app
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
SUPABASE_STORAGE_BUCKET=note-assets
CLEANUP_SECRET=<long random secret>
DEFAULT_THEME=notion
DEFAULT_EXPIRATION_DAYS=7
DEFAULT_FOOTER_TEXT=Published by XIAOWANG - 18624433439
ENABLE_EXPERIMENTAL_COREPACK=1
```

Rules:

- `SUPABASE_URL` must not include `/rest/v1`.
- `SUPABASE_SERVICE_ROLE_KEY` must never be exposed to browser or Obsidian plugin code.
- `CLEANUP_SECRET` must stay private.

Generate a cleanup secret locally:

```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

## Supabase Setup

Create these tables in the Supabase SQL Editor.

```sql
create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  markdown text not null,
  html text not null,
  theme text not null default 'notion',
  footer_text text not null default 'Published by XIAOWANG - 18624433439',
  owner_token_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null,
  deleted_at timestamptz
);

create index if not exists pages_slug_idx on public.pages(slug);
create index if not exists pages_expires_at_idx on public.pages(expires_at);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references public.pages(id) on delete cascade,
  original_path text not null,
  storage_path text not null,
  public_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists assets_page_id_idx on public.assets(page_id);
```

Create a public Storage bucket:

```text
note-assets
```

For this personal MVP, a public bucket is acceptable because published note images are intentionally public.

## Obsidian Plugin Install

Build the plugin:

```powershell
pnpm --filter @opp/obsidian-plugin build
```

Copy these files:

```text
packages/obsidian-plugin/main.js
packages/obsidian-plugin/manifest.json
```

Paste them into:

```text
<your vault>\.obsidian\plugins\obsidian-personal-publisher\
```

If `styles.css` exists in the plugin package, copy it too.

Restart the plugin:

```text
Obsidian -> Settings -> Community plugins -> Installed plugins -> Obsidian Personal Publisher -> off -> on
```

Plugin settings:

```text
API Base URL = https://obsidian-personal-publisher.vercel.app
Default Theme = notion
Default Expiration Days = 7
Footer Text = Published by XIAOWANG - 18624433439
Max Image Size MB = 5
```

## Manual Acceptance Checklist

1. Open Obsidian.
2. Open a Markdown note with text, a table, and an image.
3. Run `Command Palette -> Publish current note`.
4. Confirm Obsidian says the URL was copied.
5. Open the URL in a private browser window.
6. Confirm no login is required.
7. Confirm the page uses the Notion-style layout.
8. Confirm the footer shows Updated at, Expires at, and the configured footer text.
9. Edit the same note.
10. Run `Publish current note` again.
11. Confirm the same URL shows updated content.
12. Run `Command Palette -> Unpublish current note`.
13. Confirm the old URL returns 404.
14. Confirm cleanup works by calling `/api/cleanup-expired?secret=<CLEANUP_SECRET>` after a test page expires.

## Cleanup Endpoint Test

Without a secret:

```powershell
try {
  Invoke-RestMethod -Uri "https://obsidian-personal-publisher.vercel.app/api/cleanup-expired"
} catch {
  $_.Exception.Response.StatusCode.value__
}
```

Expected:

```text
401
```

With the secret:

```powershell
$secret = Read-Host "Paste CLEANUP_SECRET"
$encodedSecret = [uri]::EscapeDataString($secret)
Invoke-RestMethod -Uri "https://obsidian-personal-publisher.vercel.app/api/cleanup-expired?secret=$encodedSecret"
```

Expected:

```json
{
  "success": true,
  "deletedPages": 0,
  "deletedAssets": 0
}
```

Counts may be higher if expired pages already exist.

## Troubleshooting

`ERR_INVALID_THIS` during Vercel install:

- Confirm `packageManager` is pinned to `pnpm@9.15.9`.
- Confirm Node is `20.x`.
- Add `ENABLE_EXPERIMENTAL_COREPACK=1` in Vercel.

`SUPABASE_URL must not include /rest/v1`:

- Use the Supabase project URL only, such as `https://<project-ref>.supabase.co`.

Cleanup endpoint returns `401`:

- The request is missing `?secret=...` or the secret is wrong.

Cleanup endpoint returns `503`:

- A required Vercel environment variable is missing. Check `CLEANUP_SECRET`, Supabase URL, service role key, and storage bucket.

Image upload fails:

- Confirm the bucket is named `note-assets`.
- Confirm the bucket is public.
- Confirm the file is png, jpg, jpeg, gif, webp, or svg.
- Confirm the file is not larger than Max Image Size MB.

Publish update fails with invalid owner token:

- The local plugin metadata is stale or the backend page was deleted. Unpublish locally if possible, then publish again to create a new page.

Build warnings about Node version:

- The project expects Node 20.x. Node 24 may work locally but is not the target runtime.

Windows PowerShell blocks `pnpm.ps1`:

- Use `pnpm.cmd` or run PowerShell with an execution policy that allows local scripts.

## Cost Control Rules

1. Use Vercel Hobby.
2. Use Supabase Free.
3. Use the default `.vercel.app` domain.
4. Keep the default 7-day expiration.
5. Keep daily cleanup enabled.
6. Keep the 5 MB image limit.
7. Do not add analytics.
8. Do not add history/versioning.
9. Do not publish the full vault.
10. Do not upgrade paid plans unless intentionally needed.

## Known Limitations

- No accounts.
- No login.
- No dashboard.
- No comments.
- No analytics.
- No custom domain by default.
- No full-vault publishing.
- No Dataview execution.
- No Canvas rendering.
- No Excalidraw rendering.
- No third-party Obsidian plugin rendering.
- Missing, unsupported, oversized, or failed image uploads block publishing until fixed.
