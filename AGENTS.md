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
