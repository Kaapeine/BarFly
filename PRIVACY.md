# Privacy Policy

BarFly reads your bookmarks and visited-URL events **only to order the bookmarks toolbar** (pinned section + recency-ordered dynamic section). Everything BarFly tracks is stored in `storage.local`, on your device. BarFly **transmits nothing** — there are no network requests, no analytics, no telemetry, and no remote servers involved.

## Permission justifications

- **`bookmarks`** — Required to read your bookmarks toolbar, create/move/remove the toolbar duplicates that make up the dynamic section, and sync renames/URL changes between an original bookmark and its duplicate.
- **`history`** — Required to detect when you visit a bookmarked URL, so that bookmark can be bumped to the front of the dynamic section.
- **`storage`** — Required to persist BarFly's own state (separator id, dynamic-section entries, capacity setting) locally in `storage.local`.
- **`contextMenus`** — Required to add the "Pin to bar" / "Unpin from bar" right-click context menu item on bookmarks.

No other data is collected, read, or shared.
