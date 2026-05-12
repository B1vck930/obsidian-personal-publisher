# User Actions Required

## Required Now

After Codex pushes Task 6, rebuild and reinstall the Obsidian plugin, then manually test publish, update, and unpublish.

## Why This Is Needed

Task 6 changes the Obsidian plugin runtime. Codex cannot operate your local Obsidian UI, and the Codex sandbox cannot build the plugin because Windows ACL blocks esbuild from reading a parent directory.

## Exact Steps

### 1. Pull Latest Code

Use the clean working copy that was used for the successful CORS push:

```powershell
cd C:\Users\admin\Documents\Obsidian\opp-cors-push
git pull
```

### 2. Build The Plugin

```powershell
pnpm install
pnpm typecheck
pnpm --filter @opp/obsidian-plugin build
```

### 3. Copy Plugin Files

Copy these files:

```text
C:\Users\admin\Documents\Obsidian\opp-cors-push\packages\obsidian-plugin\main.js
C:\Users\admin\Documents\Obsidian\opp-cors-push\packages\obsidian-plugin\manifest.json
```

Paste and overwrite them in your vault plugin folder:

```text
<your vault>\.obsidian\plugins\obsidian-personal-publisher\
```

If `styles.css` exists in the plugin package, copy it too.

### 4. Restart Plugin

In Obsidian:

```text
Settings -> Community plugins -> Installed plugins -> Obsidian Personal Publisher
```

Turn the plugin off, then on.

Confirm settings:

```text
API Base URL = https://obsidian-personal-publisher.vercel.app
Default Theme = notion
Default Expiration Days = 7
Footer Text = Published by XIAOWANG - 18624433439
Max Image Size MB = 5
```

### 5. Publish Plain Text Test

Open `Plain Text Test`, then run:

```text
Command Palette -> Publish current note
```

Expected:

```text
Published current note.
URL copied to clipboard.
URL: https://obsidian-personal-publisher.vercel.app/p/...
Expires at: ...
```

Open the copied URL in the browser. It should render without login.

### 6. Publish Table Test

Open `Table Test`, publish it, and confirm the public page renders the table.

### 7. Publish Image Test

Open `Image Test`, publish it, and confirm:

```text
Uploaded assets: 1.
```

Open the public URL and confirm the image renders.

### 8. Update Same Note

Edit the same note, then run `Publish current note` again.

Expected:

```text
Updated current note.
URL copied to clipboard.
```

The URL should be the same as before, and the public page should show updated content.

### 9. Unpublish

Run:

```text
Command Palette -> Unpublish current note
```

Expected:

```text
Unpublished current note.
Removed URL: https://obsidian-personal-publisher.vercel.app/p/...
```

Open the old URL. It should show 404/unavailable.

## Expected Result

- First publish creates a public page and copies the URL.
- Second publish of the same note updates the same URL.
- Missing/unsupported/oversized image warnings block publish instead of silently creating a broken page.
- Unpublish deletes the public page and removes local metadata.

## After Completion

Tell Codex:

```text
Task 6 manual testing passed.
```

If anything fails, send the exact error or screenshot.
