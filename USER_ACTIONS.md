# User Actions Required

## Required Now

Push the follow-up cleanup endpoint fix, then configure `CLEANUP_SECRET` in Vercel if it is missing, and rerun the cleanup endpoint checks.

## Why This Is Needed

The production endpoint returned `503` without a secret. That means the route reached environment validation before rejecting the request, and production likely does not have `CLEANUP_SECRET` configured for the deployed environment.

Codex fixed the route so a missing query secret returns `401` first. The protected cleanup call still needs a real Vercel `CLEANUP_SECRET`, which should stay private and should not be sent to Codex.

## Exact Steps

### 1. Push The Follow-Up Fix

```powershell
cd C:\Users\admin\Documents\Obsidian
git --git-dir C:\Users\admin\Documents\Obsidian\gitmeta-cors-push --work-tree C:\Users\admin\Documents\Obsidian\opp-cors-push -c http.sslBackend=openssl push -u origin main
```

### 2. Check Or Add CLEANUP_SECRET In Vercel

In browser:

```text
Vercel -> obsidian-personal-publisher -> Settings -> Environment Variables
```

Find `CLEANUP_SECRET`.

If it does not exist, add it:

```text
Name: CLEANUP_SECRET
Value: any long random secret you keep private
Environment: Production
```

Recommended PowerShell command to generate a secret locally:

```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

After adding or changing the variable, redeploy the latest deployment:

```text
Vercel -> Deployments -> latest deployment -> ... menu -> Redeploy
```

### 3. Test Cleanup Endpoint Without Secret

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

If this still returns `503`, Vercel has not deployed the follow-up fix yet.

### 4. Test Cleanup Endpoint With Secret

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

If this returns `503`, `CLEANUP_SECRET` is still missing from the production deployment or the deployment was not redeployed after adding it.

### 5. Safe Manual Expiration Test

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
