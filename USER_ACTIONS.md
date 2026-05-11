# User Actions Required

## Required Now

1. Confirm the Vercel production environment variables for `obsidian-personal-publisher`.
2. After Codex pushes Task 4, wait for the Vercel deployment to finish.
3. Run the PowerShell backend smoke test below.

## Why This Is Needed

Codex applied the Supabase schema directly, but Vercel secrets are external runtime settings. The API will build without them, but `POST /api/pages` and `/p/:slug` need Supabase values at runtime.

## Exact Steps

### 1. Confirm Vercel Environment Variables

Open Vercel project `obsidian-personal-publisher` -> Settings -> Environment Variables.

Confirm these variables exist for Production:

```text
NEXT_PUBLIC_SITE_URL=https://obsidian-personal-publisher.vercel.app
SUPABASE_URL=https://tnxqbeogudkvdcbjkoat.supabase.co
SUPABASE_ANON_KEY=<your Supabase anon key>
SUPABASE_SERVICE_ROLE_KEY=<your Supabase service role key>
SUPABASE_STORAGE_BUCKET=note-assets
CLEANUP_SECRET=<long random secret>
DEFAULT_THEME=notion
DEFAULT_EXPIRATION_DAYS=7
DEFAULT_FOOTER_TEXT=Published by XIAOWANG - 18624433439
ENABLE_EXPERIMENTAL_COREPACK=1
```

Important: `SUPABASE_URL` must not include `/rest/v1`.

### 2. Wait For Deployment

After Codex pushes this task, open:

```text
https://vercel.com
```

Go to the `obsidian-personal-publisher` project and confirm the latest deployment is green.

### 3. Create A Test Page From PowerShell

Run:

```powershell
$body = @{
  title = "Task 4 Backend Test"
  markdown = "# Task 4 Backend Test`n`n| A | B |`n| --- | --- |`n| 1 | 2 |`n`n> [!NOTE] Test callout`n> Backend rendering works."
  theme = "notion"
  footerText = "Published by XIAOWANG - 18624433439"
  expiresInDays = 7
} | ConvertTo-Json

$created = Invoke-RestMethod -Method Post -Uri "https://obsidian-personal-publisher.vercel.app/api/pages" -ContentType "application/json" -Body $body
$created
Start-Process $created.url
```

### 4. Verify Update Keeps The Same URL

Run:

```powershell
$updateBody = @{
  ownerToken = $created.ownerToken
  title = "Task 4 Backend Test Updated"
  markdown = "# Task 4 Backend Test Updated`n`nThe same URL should show updated content."
  theme = "notion"
  footerText = "Published by XIAOWANG - 18624433439"
  expiresInDays = 7
} | ConvertTo-Json

$updated = Invoke-RestMethod -Method Put -Uri "https://obsidian-personal-publisher.vercel.app/api/pages/$($created.pageId)" -ContentType "application/json" -Body $updateBody
$updated
Start-Process $updated.url
```

Confirm `$updated.url` is the same as `$created.url`.

### 5. Verify Delete Makes The Page Unavailable

Run:

```powershell
$deleteBody = @{
  ownerToken = $created.ownerToken
} | ConvertTo-Json

Invoke-RestMethod -Method Delete -Uri "https://obsidian-personal-publisher.vercel.app/api/pages/$($created.pageId)" -ContentType "application/json" -Body $deleteBody
Start-Process $created.url
```

The page should now show unavailable or 404.

## Expected Result

- `POST /api/pages` returns `pageId`, `slug`, `url`, `ownerToken`, and `expiresAt`.
- The public page opens without login.
- Footer shows `Updated at`, `Expires at`, and `Published by XIAOWANG - 18624433439`.
- `PUT /api/pages/:id` keeps the same URL and refreshes expiration.
- `DELETE /api/pages/:id` removes the public page.

## After Completion

Tell Codex:

```text
Task 4 backend manual test passed.
```

If any command fails, send Codex the exact error output.
