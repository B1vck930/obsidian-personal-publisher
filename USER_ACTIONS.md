# User Actions Required

## Required Now

Codex completed Task 5 code, automated verification, Vercel deployment verification, and production `/api/assets` smoke testing.

Only one manual step remains: local Obsidian UI testing. Codex cannot operate your local Obsidian vault/plugin UI from this environment.

## Test In Obsidian

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

## Optional Later

Task 5 no longer requires `CLEANUP_SECRET` for asset upload. Before relying on the cleanup endpoint from Task 4, add this Production variable if it is still missing:

```text
Vercel Dashboard -> obsidian-personal-publisher -> Settings -> Environment Variables -> Add New
CLEANUP_SECRET=<long random secret>
Environment: Production
```

## After Completion

Tell Codex:

```text
Task 5 manual testing passed.
```

If anything fails, send Codex the exact error output or a screenshot.
