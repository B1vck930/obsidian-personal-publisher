# MVP Spec

## Product

`obsidian-personal-publisher` is a personal free tool for publishing the currently active Obsidian Markdown note as a public Notion-style webpage link.

## MVP Flow

1. Open one Markdown note in Obsidian.
2. Click Publish.
3. Upload the note and its local images.
4. Receive one public URL.
5. Open the URL without login.
6. Publish again to update the same URL.
7. Unpublish to make the URL unavailable.
8. Expired pages are cleaned after 7 days whenever possible.

## Defaults

- Theme: `notion`
- Expiration: 7 days
- Footer: `Published by XIAOWANG - 18624433439`
- Max image size: 5 MB

## Non-Goals

- Accounts
- Login
- Payments
- Subscriptions
- Team features
- Analytics
- Marketing site
- Full vault publishing
- Dataview, Canvas, Excalidraw, or third-party plugin rendering
