# User Actions Required

## Required Now

Push the final MVP commits, run final local verification in normal Windows PowerShell, confirm `CLEANUP_SECRET` in Vercel, and run the final manual acceptance checklist.

## Why This Is Needed

Codex completed the remaining Task 8 code and documentation. Codex tried to push twice, but `git push` timed out and the local branch remains ahead of `origin/main`. Automated checks in the Codex sandbox are also blocked by Windows ACL/EPERM on `node_modules`, especially `@supabase/supabase-js` and esbuild config resolution. The same commands have passed in normal PowerShell before, so final verification should be run there.

The protected cleanup endpoint also needs your real Vercel `CLEANUP_SECRET`, which should stay private and should not be sent to Codex.

## Exact Steps

### 1. Push The Final Commits

```powershell
cd C:\Users\admin\Documents\Obsidian
git --git-dir C:\Users\admin\Documents\Obsidian\gitmeta-cors-push --work-tree C:\Users\admin\Documents\Obsidian\opp-cors-push -c http.sslBackend=openssl push -u origin main
```

Expected result:

```text
branch 'main' set up to track 'origin/main'
```

or:

```text
Everything up-to-date
```

Then confirm:

```powershell
git --git-dir C:\Users\admin\Documents\Obsidian\gitmeta-cors-push --work-tree C:\Users\admin\Documents\Obsidian\opp-cors-push status -sb
```

Expected:

```text
## main...origin/main
```

### 2. Repair Dependencies And Run Final Automated Checks

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
pnpm test
pnpm typecheck
pnpm --filter @opp/web build
pnpm --filter @opp/obsidian-plugin build
```

Expected result:

```text
All tests pass.
Typecheck passes.
Web build passes.
Obsidian plugin build passes.
```

### 3. Check Or Add CLEANUP_SECRET In Vercel

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

### 4. Test Cleanup Endpoint Without Secret

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

### 5. Test Cleanup Endpoint With Secret

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

### 6. Safe Manual Expiration Test

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

### 7. Reinstall The Final Obsidian Plugin Build

Copy these files:

```text
C:\Users\admin\Documents\Obsidian\opp-cors-push\packages\obsidian-plugin\main.js
C:\Users\admin\Documents\Obsidian\opp-cors-push\packages\obsidian-plugin\manifest.json
```

Paste and overwrite them in:

```text
<your vault>\.obsidian\plugins\obsidian-personal-publisher\
```

Then in Obsidian:

```text
Settings -> Community plugins -> Installed plugins -> Obsidian Personal Publisher -> off -> on
```

### 8. Final Manual Acceptance Test

1. Open a Markdown note with text, a table, and an image.
2. Run `Command Palette -> Publish current note`.
3. Confirm the URL is copied.
4. Open the URL in a private browser window.
5. Confirm no login is required.
6. Confirm the page uses the Notion-style layout.
7. Confirm footer shows Updated at, Expires at, and `Published by XIAOWANG - 18624433439`.
8. Edit the same note.
9. Run `Publish current note` again.
10. Confirm the same URL shows updated content.
11. Run `Command Palette -> Unpublish current note`.
12. Confirm the old URL returns 404.

## Expected Result

- Final local checks pass in normal PowerShell.
- Vercel deploys the final commit.
- Cleanup without secret returns 401.
- Cleanup with the correct secret returns a JSON summary.
- Expired test page is deleted and its public URL becomes unavailable.
- Expired page assets are deleted from `assets` rows and Supabase Storage when linked by `page_id` or referenced public Storage URL.
- Final Obsidian publish/update/unpublish acceptance test passes.

## After Completion

Tell Codex:

```text
Final MVP acceptance passed.
```

If anything fails, send the exact error or screenshot.
