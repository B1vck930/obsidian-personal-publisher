# User Actions Required

## Required Now

After Codex creates the Task 7 commit, run the commands below in normal Windows PowerShell. This is required because the Codex sandbox hit Windows ACL/EPERM while rebuilding `node_modules`.

## Why This Is Needed

Task 7 changes only the web backend. Codex implemented the cleanup endpoint and tests, but local verification is blocked by dependency filesystem permissions in the sandbox:

```text
EPERM, Permission denied: node_modules\.pnpm\@supabase+supabase-js@2.105.4
Cannot resolve @supabase/supabase-js
```

## Exact Steps

### 1. Repair Local Dependencies And Verify

```powershell
cd C:\Users\admin\Documents\Obsidian\opp-cors-push

if (Test-Path .pnpm-store) {
  Remove-Item -Recurse -Force .pnpm-store
}

$env:HTTP_PROXY="http://127.0.0.1:40808"
$env:HTTPS_PROXY="http://127.0.0.1:40808"
$env:NO_PROXY="localhost,127.0.0.1"
$env:CI="true"

pnpm install --frozen-lockfile
pnpm --filter @opp/web test
pnpm --filter @opp/web typecheck
pnpm --filter @opp/web build
```

Expected result:

```text
@opp/web test: pass
@opp/web typecheck: pass
@opp/web build: pass
```

### 2. Push Task 7

```powershell
cd C:\Users\admin\Documents\Obsidian
git --git-dir C:\Users\admin\Documents\Obsidian\gitmeta-cors-push --work-tree C:\Users\admin\Documents\Obsidian\opp-cors-push -c http.sslBackend=openssl push -u origin main
```

Expected result:

```text
Everything up-to-date
```

or a normal push showing the Task 7 commit.

### 3. Test Cleanup Endpoint After Vercel Deploys

Open without a secret first:

```powershell
try {
  Invoke-RestMethod -Uri "https://obsidian-personal-publisher.vercel.app/api/cleanup-expired"
} catch {
  $_.Exception.Response.StatusCode.value__
}
```

Expected result:

```text
401
```

Then run with your Vercel `CLEANUP_SECRET`:

```powershell
$secret = Read-Host "Paste CLEANUP_SECRET"
$encodedSecret = [uri]::EscapeDataString($secret)
Invoke-RestMethod -Uri "https://obsidian-personal-publisher.vercel.app/api/cleanup-expired?secret=$encodedSecret"
```

Expected result:

```json
{
  "success": true,
  "deletedPages": 0,
  "deletedAssets": 0
}
```

Counts may be higher if old expired pages/assets already exist.

### 4. Safe Manual Expiration Test

Create a short-lived test page:

```powershell
$body = @{
  title = "Task 7 Cleanup Test"
  markdown = "# Task 7 Cleanup Test`nThis page should expire quickly."
  theme = "notion"
  footerText = "Published by XIAOWANG - 18624433439"
  expiresInDays = 0.001
} | ConvertTo-Json

$created = Invoke-RestMethod -Method Post -Uri "https://obsidian-personal-publisher.vercel.app/api/pages" -ContentType "application/json" -Body $body
$created.url
Start-Process $created.url
```

Wait two minutes, then trigger cleanup:

```powershell
$secret = Read-Host "Paste CLEANUP_SECRET"
$encodedSecret = [uri]::EscapeDataString($secret)
Invoke-RestMethod -Uri "https://obsidian-personal-publisher.vercel.app/api/cleanup-expired?secret=$encodedSecret"
```

Finally confirm the old URL is unavailable:

```powershell
try {
  Invoke-WebRequest -Uri $created.url -UseBasicParsing
} catch {
  $_.Exception.Response.StatusCode.value__
}
```

Expected result:

```text
404
```

## Expected Result

- Cleanup without secret returns 401.
- Cleanup with the correct secret returns a JSON summary.
- Expired test page is deleted and its public URL becomes unavailable.
- Expired page assets are deleted from `assets` rows and Supabase Storage when linked by `page_id` or referenced public Storage URL.

## After Completion

Tell Codex:

```text
Task 7 verification passed.
```

If anything fails, send the exact error or screenshot.
