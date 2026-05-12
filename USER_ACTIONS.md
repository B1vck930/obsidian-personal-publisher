# User Actions Required

## Required Now

Run the production cleanup endpoint checks in normal Windows PowerShell after Vercel finishes deploying the Task 7 push.

## Why This Is Needed

Local Task 7 verification passed and the commit was pushed. The remaining checks need your real Vercel `CLEANUP_SECRET`, which should stay private and should not be sent to Codex.

## Exact Steps

### 1. Test Cleanup Endpoint Without Secret

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

### 2. Test Cleanup Endpoint With Secret

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

### 3. Safe Manual Expiration Test

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
