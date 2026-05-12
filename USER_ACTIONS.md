# User Actions Required

## Required Now

Codex completed Task 5 code and automated verification. The only remaining actions are checks Codex cannot perform inside your local Obsidian UI.

## 1. Confirm Vercel Deployment

Open:

```text
https://vercel.com
```

Click path:

```text
Vercel Dashboard -> obsidian-personal-publisher -> Deployments
```

Confirm the latest `main` deployment after the Task 5 commit is green.

## 2. Confirm Production Environment Variables

Click path:

```text
Vercel Dashboard -> obsidian-personal-publisher -> Settings -> Environment Variables
```

Confirm these Production variables exist:

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

## 3. Smoke Test The Asset Upload API

Open PowerShell and run:

```powershell
$pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII="
$file = "$env:TEMP\opp-task5-test.png"
[IO.File]::WriteAllBytes($file, [Convert]::FromBase64String($pngBase64))

curl.exe -X POST "https://obsidian-personal-publisher.vercel.app/api/assets" -F "file=@$file;type=image/png" -F "originalPath=task5/opp-task5-test.png"
```

Expected result:

```text
JSON with assetId, url, and storagePath
```

Copy the returned `url` into your browser. The image should open.

## 4. Test In Obsidian

Open Obsidian and make sure the local plugin is reloaded after the Task 5 build.

Click path:

```text
Obsidian -> Settings -> Community plugins -> Installed plugins -> Obsidian Personal Publisher
```

If needed, toggle the plugin off and on.

Confirm plugin settings:

```text
API Base URL = https://obsidian-personal-publisher.vercel.app
Max Image Size MB = 5
```

Create or open a note with a real local image:

```markdown
# Task 5 Image Upload Test

![[image.png]]
```

Run:

```text
Command Palette -> Publish current note
```

Expected notice:

```text
Publish preview ready for "Task 5 Image Upload Test".
Local assets detected: 1.
Uploaded assets: 1.
Warnings: 0.
Backend publishing is not implemented yet.
```

Now test a missing image:

```markdown
# Task 5 Missing Image Test

![[missing-image.png]]
```

Expected notice:

```text
Local assets detected: 1.
Uploaded assets: 0.
Warnings: 1.
Missing local image: missing-image.png
Backend publishing is not implemented yet.
```

## After Completion

Tell Codex:

```text
Task 5 manual testing passed.
```

If anything fails, send Codex the exact error output or a screenshot.
