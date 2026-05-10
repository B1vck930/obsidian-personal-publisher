# Obsidian Personal Publisher — Codex Execution Brief

**Version:** Final MVP Brief  
**Date:** 2026-05-10  
**Owner:** XIAOWANG  
**Product type:** Personal free tool, not a SaaS  
**Target cost:** £0 / $0 per month for personal use  

---

## 0. Read This First, Codex

You are building a **personal free Obsidian publishing tool**.

The user wants a tool similar to a very small personal JotBird-style workflow, but **only for personal use**, with no commercial SaaS features.

### Core user flow

1. The user opens Obsidian.
2. The user opens one Markdown note.
3. The user clicks **Publish**.
4. The Obsidian plugin uploads the note and its local images.
5. The system generates one public webpage link.
6. The user sends the link to someone else.
7. The recipient can open the webpage without logging in.
8. If the user edits the note and clicks **Publish** again, the same link updates.
9. If the user clicks **Unpublish**, the page becomes unavailable immediately.
10. By default, every published page expires after **7 days** and should be cleaned up automatically.

### Non-negotiable requirements

- This is a **personal free tool**.
- No user accounts.
- No payment.
- No subscriptions.
- No team features.
- No public marketing website.
- No analytics dashboard.
- No custom domain requirement.
- No multi-user admin panel.
- No full-vault publishing.
- Only publish the **currently active Obsidian Markdown note**.
- Default public page style: **Notion-style clean document page**.
- Theme must be configurable so it can later change to Minimal / Obsidian / Vercel style.
- Every public page must show a footer:
  - `Updated at: ...`
  - `Expires at: ...`
  - `Published by XIAOWANG - 18624433439`
- Footer text must be configurable in one place.
- Do not hard-code the phone number across multiple files.
- Default expiration: **7 days after publish/update**.
- Expired pages must not just be hidden; their database row and uploaded images should be deleted by a cleanup job whenever possible.

---

## 1. Product Definition

### Product name placeholder

Use this temporary project name:

```text
obsidian-personal-publisher
```

The name can be changed later.

### One-sentence product description

A personal Obsidian plugin that publishes the currently open note, including local images and Markdown tables, as a Notion-style public webpage link that expires after 7 days.

### MVP scope

Build only:

- Obsidian plugin.
- Publish current note.
- Upload local images.
- Convert Obsidian-compatible Markdown to public HTML.
- Generate public shareable URL.
- Update the same URL when publishing again.
- Unpublish/delete page manually.
- Auto-expire pages after 7 days.
- Daily cleanup job for expired pages and their images.
- Notion-style public page template.
- Configurable footer.
- Configurable theme.

Do not build:

- Account system.
- Login.
- Payment.
- Subscription plans.
- User dashboard.
- Collaboration.
- Commenting.
- SEO marketing site.
- Full vault publishing.
- Knowledge graph.
- Advanced Obsidian Publish replacement.
- Dataview rendering.
- Canvas rendering.
- Excalidraw rendering.
- Third-party Obsidian plugin rendering.

---

## 2. Recommended Tech Stack

Use this stack unless there is a strong technical reason not to:

```text
Obsidian Plugin: TypeScript
Backend/Web: Next.js
Hosting: Vercel Hobby
Database: Supabase Postgres Free
Storage: Supabase Storage Free
Markdown Rendering: markdown-it or unified/remark/rehype
Syntax Highlighting: shiki or highlight.js
Testing: Vitest
Package Manager: pnpm
```

### Reason

This stack is easiest for an MVP and can stay within the free tier for personal use if storage and database cleanup are implemented properly.

---

## 3. Expected Repository Structure

Create a monorepo:

```text
obsidian-personal-publisher/
  AGENTS.md
  README.md
  MVP_SPEC.md
  package.json
  pnpm-workspace.yaml

  apps/
    web/
      package.json
      next.config.js
      vercel.json
      src/
        app/
          p/[slug]/page.tsx
          api/
            pages/route.ts
            pages/[id]/route.ts
            assets/route.ts
            cleanup-expired/route.ts
        lib/
          supabase.ts
          markdown.ts
          auth.ts
          cleanup.ts
          theme.ts
        styles/
          notion.css
          minimal.css
          obsidian.css
          vercel.css

  packages/
    obsidian-plugin/
      package.json
      manifest.json
      versions.json
      esbuild.config.mjs
      src/
        main.ts
        settings.ts
        publisher.ts
        assets.ts
        markdownTransform.ts
        types.ts
      tests/
        markdownTransform.test.ts
        assets.test.ts
```

If this structure is too large for the first pass, create it incrementally.

---

## 4. `AGENTS.md` Content

Create this file at the repository root:

```md
# AGENTS.md

## Project Goal

Build a personal free Obsidian plugin that publishes the currently active Markdown note as a public Notion-style webpage link.

## MVP Requirements

- Publish current active Obsidian Markdown note.
- Upload local images referenced in the note.
- Render Markdown tables, headings, lists, links, images, code blocks, and simple Obsidian callouts.
- Generate a public URL that anyone can open without login.
- Update the same URL when publishing the same note again.
- Unpublish/delete the public page.
- Default page expiration is 7 days.
- Add a daily cleanup endpoint/job to remove expired pages and uploaded assets.
- Default public webpage style is Notion-style.
- Footer must show Updated at, Expires at, and "Published by XIAOWANG - 18624433439".
- Footer text and theme should be configurable in one place.

## Out of Scope

Do not build:
- user accounts
- login
- payment
- subscriptions
- dashboards
- analytics
- team features
- custom domains
- full vault publishing
- comments
- SEO site
- Dataview rendering
- Canvas rendering
- Excalidraw rendering

## Technical Preferences

- Use TypeScript.
- Use pnpm.
- Use Next.js for the backend and public pages.
- Use Supabase for Postgres and Storage.
- Use Vercel for deployment.
- Use Vitest for tests.
- Keep code simple and readable.
- Prefer small modules.
- Add clear error handling.
- Do not add unnecessary dependencies.

## Required Checks

After code changes:
- Run typecheck.
- Run tests.
- Run lint if configured.
- Add tests for new behavior.

## Security Rules

- Never expose Supabase service role keys to the Obsidian plugin or browser.
- Use an owner token for update/delete.
- Hash owner tokens before storing them in the database.
- Store owner token locally inside the Obsidian plugin settings, not in the Markdown note.
- Do not hard-code private footer text across multiple files. Keep it in one config file.
```

---

## 5. Database Schema

Use Supabase Postgres.

Create a table for pages:

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
```

Create a table for assets:

```sql
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

Important:

- `owner_token_hash` must be a hash.
- Never store raw owner tokens in the database.
- Raw owner token is stored only in Obsidian plugin local settings.
- Expired pages should be cleaned from both `pages` and `assets`.
- Supabase Storage objects should be deleted during cleanup.

---

## 6. API Design

### 6.1 Upload asset

```http
POST /api/assets
Content-Type: multipart/form-data
```

Body:

```text
file: image file
pageId?: optional page id
ownerToken?: optional owner token
```

Response:

```json
{
  "assetId": "uuid",
  "url": "https://...",
  "storagePath": "pages/page-id/image.png"
}
```

Rules:

- Accept common image formats: png, jpg, jpeg, gif, webp, svg.
- Reject very large files.
- Recommended max file size for personal free usage: 5 MB per image.
- Return clear error messages for unsupported or oversized files.

### 6.2 Publish page

```http
POST /api/pages
Content-Type: application/json
```

Body:

```json
{
  "title": "Note title",
  "markdown": "...markdown after image URL replacement...",
  "theme": "notion",
  "footerText": "Published by XIAOWANG - 18624433439",
  "expiresInDays": 7
}
```

Response:

```json
{
  "pageId": "uuid",
  "slug": "abc123",
  "url": "https://your-vercel-app.vercel.app/p/abc123",
  "ownerToken": "raw-owner-token",
  "expiresAt": "2026-05-17T00:00:00.000Z"
}
```

Rules:

- Generate `ownerToken` server-side.
- Store only hash in DB.
- Return raw token once to the plugin.
- Default theme is `notion`.
- Default expiration is 7 days.

### 6.3 Update page

```http
PUT /api/pages/:id
Content-Type: application/json
```

Body:

```json
{
  "ownerToken": "raw-owner-token",
  "title": "Updated title",
  "markdown": "...",
  "theme": "notion",
  "footerText": "Published by XIAOWANG - 18624433439",
  "expiresInDays": 7
}
```

Response:

```json
{
  "pageId": "uuid",
  "slug": "same-slug",
  "url": "https://your-vercel-app.vercel.app/p/abc123",
  "expiresAt": "new expiry date"
}
```

Rules:

- Same page ID.
- Same slug.
- Same URL.
- Refresh `updated_at`.
- Refresh `expires_at` to 7 days from update.
- Reject if token invalid.

### 6.4 Unpublish page

```http
DELETE /api/pages/:id
Content-Type: application/json
```

Body:

```json
{
  "ownerToken": "raw-owner-token"
}
```

Response:

```json
{
  "success": true
}
```

Rules:

- Verify owner token.
- Delete page or set `deleted_at`.
- Prefer actual deletion for personal free usage.
- Delete associated storage assets when possible.
- Public URL should return 404 or "This page is no longer available".

### 6.5 Public page

```http
GET /p/:slug
```

Rules:

- If page does not exist: return 404.
- If `deleted_at` is not null: return 404.
- If `expires_at` is in the past: return 410 Gone or 404.
- Render Notion-style public page.
- Show footer:
  - Updated at
  - Expires at
  - Published by XIAOWANG - 18624433439

### 6.6 Cleanup expired pages

```http
GET /api/cleanup-expired
```

Rules:

- This endpoint is called by Vercel Cron once per day.
- It deletes expired pages and associated storage assets.
- It should be protected by a secret header or query token.

Environment variable:

```text
CLEANUP_SECRET=some-long-random-secret
```

Example request:

```text
/api/cleanup-expired?secret=...
```

---

## 7. Vercel Cron Configuration

Create `apps/web/vercel.json`:

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

This runs once daily at 03:00 UTC.

For the Vercel Hobby plan, only daily cron is needed.

---

## 8. Obsidian Plugin Requirements

### Plugin commands

Implement:

1. Ribbon icon: `Publish current note`
2. Command palette command: `Publish current note`
3. Command palette command: `Unpublish current note`
4. Optional file menu item: `Publish note`

### Plugin settings

Add settings tab:

```text
API Base URL
Default Theme: notion
Default Expiration Days: 7
Footer Text: Published by XIAOWANG - 18624433439
Max Image Size MB: 5
```

Default settings:

```json
{
  "apiBaseUrl": "https://your-vercel-app.vercel.app",
  "defaultTheme": "notion",
  "defaultExpirationDays": 7,
  "footerText": "Published by XIAOWANG - 18624433439",
  "maxImageSizeMb": 5,
  "publishedPages": {}
}
```

### Local metadata

Store local publish data in plugin settings, not in the Markdown note:

```json
{
  "publishedPages": {
    "folder/my-note.md": {
      "pageId": "uuid",
      "url": "https://your-vercel-app.vercel.app/p/abc123",
      "ownerToken": "raw-owner-token",
      "slug": "abc123",
      "publishedAt": "2026-05-10T00:00:00.000Z",
      "updatedAt": "2026-05-10T00:00:00.000Z",
      "expiresAt": "2026-05-17T00:00:00.000Z"
    }
  }
}
```

### Publish behavior

When clicking Publish:

1. Check active file exists.
2. Check active file is Markdown.
3. Read current Markdown.
4. Extract title:
   - first `# heading`, or
   - file basename if no heading.
5. Find local images.
6. Read image files from vault.
7. Upload images to `/api/assets`.
8. Replace local image syntax with public image URLs.
9. If note was never published:
   - call `POST /api/pages`.
10. If note was already published:
   - call `PUT /api/pages/:id`.
11. Save returned metadata in plugin settings.
12. Copy public URL to clipboard.
13. Show Obsidian Notice:
   - `Published: URL copied to clipboard`
   - or `Updated: URL copied to clipboard`

### Unpublish behavior

When clicking Unpublish:

1. Check current note has stored page metadata.
2. Call `DELETE /api/pages/:id` with owner token.
3. Remove local metadata from plugin settings.
4. Show Notice:
   - `Unpublished successfully`

### Image syntax support

Support at least:

```md
![[image.png]]
![[folder/image.png]]
![[folder/image.png|400]]
![alt](image.png)
![alt](folder/image.png)
```

Replace with standard Markdown image URLs:

```md
![alt](https://...)
```

### Markdown support

MVP must support:

- headings
- paragraphs
- bold / italic
- links
- images
- tables
- task lists
- ordered lists
- unordered lists
- fenced code blocks
- simple callouts, for example:

```md
> [!note]
> This is a note.
```

Do not support in MVP:

- Dataview dynamic queries
- Canvas
- Excalidraw
- complex embedded PDFs
- plugin-generated content
- full graph view

---

## 9. Public Page Style: Notion Default

The public webpage should look like a clean Notion-style document.

### Style requirements

- Background: warm off-white or very light neutral.
- Content max width: around 720px to 820px.
- Large title.
- Spacious paragraphs.
- Rounded image corners.
- Clean table style.
- Soft callout block.
- Readable code block.
- Mobile responsive.
- Footer at the bottom.

### Theme config

Create a central theme config:

```ts
export const defaultPublicPageConfig = {
  theme: "notion",
  footerText: "Published by XIAOWANG - 18624433439",
  expirationDays: 7
};
```

Make it easy to later change:

```ts
theme: "minimal" | "notion" | "obsidian" | "vercel"
```

---

## 10. Testing Requirements

Add tests if they do not exist.

### Unit tests

Add tests for:

1. Extracting image paths from Obsidian wiki image syntax.
2. Extracting image paths from standard Markdown image syntax.
3. Replacing local image paths with remote URLs.
4. Handling image paths inside folders.
5. Handling image width syntax like `![[image.png|400]]`.
6. Detecting missing images.
7. Extracting title from first H1.
8. Falling back to filename if no H1.
9. Expiration date calculation: 7 days by default.
10. Public page should not render expired pages.
11. Invalid owner token should reject update.
12. Invalid owner token should reject delete.
13. Footer config should render exactly once.
14. Theme config should default to `notion`.

### Manual tests

The user should manually test:

1. Publish plain text note.
2. Publish note with one image.
3. Publish note with multiple images.
4. Publish note with images in a subfolder.
5. Publish note with table.
6. Publish note with code block.
7. Publish note with simple callout.
8. Update note and confirm URL stays the same.
9. Unpublish note and confirm link is unavailable.
10. Wait for or manually trigger cleanup endpoint and confirm expired data is removed.
11. Confirm footer shows:
    - Updated at
    - Expires at
    - Published by XIAOWANG - 18624433439

---

## 11. Codex Task Plan

Do not attempt everything in one huge change. Implement in phases.

### Task 1 — Create project foundation

Prompt to Codex:

```text
Create the monorepo foundation for obsidian-personal-publisher.

Build:
- root package.json
- pnpm-workspace.yaml
- AGENTS.md
- README.md
- apps/web Next.js app skeleton
- packages/obsidian-plugin skeleton
- TypeScript config
- Vitest setup

Do not implement publishing yet.
Make sure the repo can install dependencies and run typecheck/test.
```

Expected output:

- Project installs successfully.
- Basic tests run.
- README explains local setup.

### Task 2 — Build Obsidian plugin shell

Prompt to Codex:

```text
Implement the Obsidian plugin shell.

Requirements:
- Add ribbon icon: Publish current note
- Add command palette command: Publish current note
- Add command palette command: Unpublish current note
- Add settings tab with:
  - API Base URL
  - Default Theme
  - Default Expiration Days
  - Footer Text
  - Max Image Size MB
- Read active Markdown file.
- Show clear Obsidian Notices for success/error.
- Do not call backend yet.
- Add tests where possible.
```

Expected output:

- Plugin can load in Obsidian.
- Clicking Publish reads current note.
- If no Markdown file is open, a clear error appears.

### Task 3 — Implement Markdown and asset extraction

Prompt to Codex:

```text
Implement Markdown asset extraction and transformation.

Support:
- ![[image.png]]
- ![[folder/image.png]]
- ![[folder/image.png|400]]
- ![alt](image.png)
- ![alt](folder/image.png)

Return:
- transformed Markdown
- list of local asset paths
- warnings for missing or unsupported assets

Add Vitest tests for all supported image syntaxes.
```

Expected output:

- Image references are detected correctly.
- Local paths can be mapped to public URLs.
- Tests pass.

### Task 4 — Build backend database and API

Prompt to Codex:

```text
Build the Next.js backend API for publishing.

Implement:
- Supabase client setup
- database schema documentation
- POST /api/pages
- PUT /api/pages/:id
- DELETE /api/pages/:id
- GET /p/:slug public page
- owner token generation
- owner token hashing
- 7-day default expiration
- Notion-style public page rendering
- footer showing Updated at, Expires at, and Published by XIAOWANG - 18624433439

Do not expose service role keys to the browser.
Add tests for token validation and expiration logic.
```

Expected output:

- Page can be created.
- Public URL opens.
- Update/delete requires valid owner token.
- Expired pages do not render.

### Task 5 — Implement image upload

Prompt to Codex:

```text
Implement image upload from the Obsidian plugin to the backend.

Build:
- POST /api/assets
- Supabase Storage upload
- return public image URL
- plugin-side image reading from Obsidian vault
- max image size validation
- replacement of local image references with public URLs

Add tests for image path replacement and upload error handling.
```

Expected output:

- Local Obsidian images appear on the published webpage.
- Oversized images are rejected with clear error.
- Missing images produce warnings.

### Task 6 — Connect plugin publish/update/unpublish flow

Prompt to Codex:

```text
Connect the Obsidian plugin to the backend.

Publish behavior:
- If current note has no page metadata, create a new page.
- If current note already has page metadata, update the same page.
- Copy URL to clipboard.
- Store pageId, slug, URL, ownerToken, updatedAt, expiresAt locally in plugin settings.

Unpublish behavior:
- Send DELETE request with ownerToken.
- Remove local metadata.
- Show success/error Notice.

Add manual QA checklist to README.
```

Expected output:

- Full user flow works end to end.
- Publish creates link.
- Re-publish updates same link.
- Unpublish disables link.

### Task 7 — Add cleanup job

Prompt to Codex:

```text
Add daily cleanup for expired pages.

Implement:
- /api/cleanup-expired endpoint
- CLEANUP_SECRET protection
- delete expired pages
- delete related Supabase Storage assets
- vercel.json cron schedule once per day
- tests for cleanup selection logic

Document how to test cleanup manually.
```

Expected output:

- Expired pages are removed.
- Related assets are removed.
- Endpoint is protected.
- Vercel Cron configuration exists.

### Task 8 — Polish and final QA

Prompt to Codex:

```text
Polish the MVP.

Add:
- better user-facing error messages
- README screenshots placeholders
- environment variable example
- deployment checklist
- local development guide
- security notes
- known limitations

Run tests and typecheck.
Fix any failing tests.
```

Expected output:

- Project is ready for personal beta use.

---

## 12. What the Human User Must Do

Codex can write code, but the user must complete account setup, deployment, secrets, and real testing.

### Step 1 — Install local tools

Install:

1. Obsidian
2. Git
3. Node.js LTS
4. pnpm
5. VS Code or Cursor
6. Codex extension / Codex CLI
7. GitHub account

Commands:

```bash
node -v
npm -v
npm install -g pnpm
pnpm -v
git --version
```

### Step 2 — Create GitHub repository

1. Go to GitHub.
2. Create a new private repository:
   - `obsidian-personal-publisher`
3. Clone it locally:

```bash
git clone https://github.com/YOUR_USERNAME/obsidian-personal-publisher.git
cd obsidian-personal-publisher
```

4. Put this Markdown file into the repository root.
5. Ask Codex to start with **Task 1 only**.

### Step 3 — Create Supabase project

1. Go to Supabase.
2. Create a free project.
3. Save:
   - Project URL
   - Anon key
   - Service role key
4. Create a Storage bucket:
   - bucket name: `note-assets`
   - public or signed URL strategy: for MVP, public bucket is simplest.
5. Open SQL Editor.
6. Run the SQL schema from section 5.

Important:

- Never put the service role key inside the Obsidian plugin.
- Only the backend should use the service role key.

### Step 4 — Create Vercel project

1. Go to Vercel.
2. Import your GitHub repo.
3. Set project root to:

```text
apps/web
```

4. Add environment variables:

```text
NEXT_PUBLIC_SITE_URL=https://your-vercel-app.vercel.app
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_STORAGE_BUCKET=note-assets
CLEANUP_SECRET=your_long_random_secret
DEFAULT_THEME=notion
DEFAULT_EXPIRATION_DAYS=7
DEFAULT_FOOTER_TEXT=Published by XIAOWANG - 18624433439
```

5. Deploy.

### Step 5 — Test backend manually

After deployment, test:

1. Public page path exists:
   - `/p/test-slug` should return 404 if no page exists.
2. API routes exist:
   - `/api/pages`
   - `/api/assets`
   - `/api/cleanup-expired`
3. Cleanup endpoint rejects missing secret.
4. Cleanup endpoint accepts correct secret.

### Step 6 — Install plugin locally in Obsidian

1. Open your Obsidian vault.
2. Find vault plugin folder:

```text
YOUR_VAULT/.obsidian/plugins/
```

3. Create plugin folder:

```text
YOUR_VAULT/.obsidian/plugins/obsidian-personal-publisher/
```

4. Build plugin:

```bash
cd packages/obsidian-plugin
pnpm install
pnpm build
```

5. Copy built files into plugin folder:
   - `main.js`
   - `manifest.json`
   - `styles.css` if present

6. In Obsidian:
   - Settings
   - Community plugins
   - Turn off Restricted Mode if needed
   - Enable `Obsidian Personal Publisher`

### Step 7 — Configure plugin

In plugin settings, set:

```text
API Base URL: https://your-vercel-app.vercel.app
Default Theme: notion
Default Expiration Days: 7
Footer Text: Published by XIAOWANG - 18624433439
Max Image Size MB: 5
```

### Step 8 — Prepare test notes

Create test notes in Obsidian:

#### Test note 1: plain text

```md
# Plain Text Test

This is a simple test note.
```

#### Test note 2: table

```md
# Table Test

| Feature | Status |
|---|---|
| Publish | Done |
| Update | Done |
| Unpublish | Planned |
```

#### Test note 3: image

```md
# Image Test

Here is an image:

![[test-image.png]]
```

#### Test note 4: callout and code

```md
# Callout Test

> [!note]
> This is a simple Obsidian callout.

```ts
console.log("Hello from Obsidian");
```
```

### Step 9 — Test full user flow

For each test note:

1. Open the note.
2. Click Publish.
3. Confirm a URL is copied.
4. Open the URL in incognito/private browser.
5. Confirm no login is required.
6. Confirm page is Notion-style.
7. Confirm footer shows:
   - Updated at
   - Expires at
   - Published by XIAOWANG - 18624433439
8. Edit the note.
9. Click Publish again.
10. Confirm same URL updates.
11. Click Unpublish.
12. Confirm URL no longer works.

### Step 10 — Monitor free usage

In Supabase:

- Check Database size.
- Check Storage size.
- Check project warnings.

In Vercel:

- Check deployments.
- Check cron logs.
- Check function logs.

---

## 13. Cost Estimate

### Target: £0 / $0 monthly cost

Expected monthly cost for personal use:

| Item | Required? | Expected MVP Cost |
|---|---:|---:|
| Obsidian | Yes | $0 |
| GitHub private repo | Yes | $0 |
| Vercel Hobby | Yes | $0 |
| Supabase Free | Yes | $0 |
| Custom domain | No | $0 if using `.vercel.app` |
| Codex / ChatGPT Plus | Already used by user | Existing subscription cost |
| Total new monthly infrastructure cost | Yes | $0 |

### Why 7-day expiration helps

The biggest cost risk is not Markdown text. It is uploaded images.

The 7-day expiration strategy helps because:

- old pages stop being accessible,
- old database rows are removed,
- old uploaded images are deleted,
- Supabase Storage stays small,
- Supabase Database stays below free limits.

### Free-tier safety rules

To keep the project at $0:

1. Use default `.vercel.app` domain.
2. Use Supabase Free.
3. Keep image max size at 5 MB.
4. Avoid uploading large screenshots repeatedly.
5. Use 7-day default expiration.
6. Run cleanup daily.
7. Do not store page history.
8. Do not create analytics tables.
9. Do not store duplicate image versions.
10. Do not disable cleanup.

### Optional future costs

Only if needed later:

| Optional item | Estimated cost |
|---|---:|
| Custom domain | Usually around $10–$20/year |
| Vercel Pro | $20/month + usage |
| Supabase Pro | $25/month + usage |
| Larger storage | Depends on provider usage pricing |

For the current personal MVP, do not buy a domain and do not upgrade plans.

---

## 14. Difficulty Estimate

### Overall difficulty

```text
With Codex: Medium
Without Codex: Medium to Hard
For non-developer user: Manageable if following steps carefully
```

### Difficulty by part

| Part | Difficulty | Who mainly handles it |
|---|---:|---|
| Product definition | Easy | User |
| Obsidian plugin shell | Medium | Codex |
| Markdown parsing | Medium | Codex |
| Image handling | Medium-Hard | Codex + User testing |
| Backend API | Medium | Codex |
| Supabase setup | Easy-Medium | User |
| Vercel deployment | Easy-Medium | User |
| Expiration cleanup | Medium | Codex |
| End-to-end testing | Medium | User |
| Keeping cost at $0 | Easy if cleanup works | User |

### Biggest technical risks

1. Obsidian local image path resolution.
2. Image upload reliability.
3. Owner token update/delete security.
4. Expired image cleanup.
5. Preventing service role key exposure.
6. Making the plugin easy to configure.

---

## 15. Acceptance Criteria

The MVP is complete only when this exact flow works:

```text
1. Open Obsidian.
2. Open a Markdown note containing text, a table, and at least one local image.
3. Click Publish.
4. The plugin uploads the note and image.
5. A public URL is copied to clipboard.
6. The URL opens in a private/incognito browser without login.
7. The webpage uses Notion-style layout.
8. The webpage footer shows:
   - Updated at
   - Expires at
   - Published by XIAOWANG - 18624433439
9. Edit the Obsidian note.
10. Click Publish again.
11. The same URL shows the updated content.
12. Click Unpublish.
13. The URL becomes unavailable.
14. Expired pages are automatically cleaned after 7 days.
```

---

## 16. First Message to Send to Codex

Copy and paste this into Codex after placing this file in the repo root:

```text
Read the Markdown file `Obsidian_Personal_Publisher_Codex_Final_Brief.md` completely before making changes.

This is a personal free Obsidian publishing tool, not a SaaS.

Start with Task 1 only:
- Create the monorepo foundation.
- Add AGENTS.md based on the brief.
- Add README.md.
- Add pnpm workspace.
- Add a Next.js app skeleton under apps/web.
- Add an Obsidian plugin skeleton under packages/obsidian-plugin.
- Add TypeScript and Vitest setup.
- Do not implement publishing yet.
- Do not add login, payments, subscriptions, analytics, dashboards, or team features.
- After implementation, run install/typecheck/tests if possible and report what passed or failed.
```

---

## 17. Source Notes

This brief assumes:

- Obsidian plugins can read Markdown files and vault contents through Obsidian's Vault API.
- Codex can use repository-level `AGENTS.md` instructions.
- Vercel Hobby can host personal projects and run daily cron jobs.
- Supabase Free can support small personal MVPs if database and storage usage stay within free limits.

Always re-check provider pricing before upgrading anything.
