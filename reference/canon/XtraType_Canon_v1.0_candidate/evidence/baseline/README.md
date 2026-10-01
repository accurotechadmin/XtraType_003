# PortaShape XtraType Side-Panel MVP v2.3

A local-first Chrome + PHP application built around **XtraType as the primary interface**. The full Chrome Side Panel is the default workspace. The floating quick-comment bar remains available as an optional lightweight mode, but it no longer appears when the full panel opens.

## What changed in this build

- Clicking the **XT Chrome toolbar button now always opens the full Chrome Side Panel** using Chrome's native `openPanelOnActionClick` behavior.
- **XtraType is always the first module at the top** of the panel.
- All other UI lives below XtraType in tidy collapsible modules: Context Here, Capture, Timeline & Compare, Anchor Schemas, and Settings.
- The quick-comment bar is now explicitly optional:
  - click the quick-bar button in the panel header,
  - use the **Open XtraType quick comment bar** page context-menu item.
- The quick bar now puts highlighted text **under the comment input**, shows recent matching comments, and has a high-contrast close button.
- Highlighted text is copied into the XtraType **Highlighted text** field whenever the side panel is opened/refreshed from a page selection.

## XtraType capabilities

- URL anchors with editable/ignorable query parameters and optional fragment handling.
- GPS anchors with latitude, longitude, optional radius, and optional label.
- YouTube anchors with a bare video URL, timestamp, or start/end time range.
- Custom structured anchor types installed from JSON Schema files.
- Comment + highlighted text + up to 3 PNG/JPEG/WebP attachments, max 8 MiB each.
- Local-first IndexedDB records and blobs with optional PHP/JSON synchronization.
- YouTube progress-bar markers, hover context, playback notifications, quick replies, and a full-panel handoff.
- Rendered-state snapshots, full-page tiled screenshots, page timeline, and basic visual regression comparison.

## Quick start

### 1. Start the PHP service

From the project root:

```bash
php -S localhost:8787 -t server
```

Or use `start-server.sh` / `start-server.bat`.

The responsive/mobile server surface is then available at:

```text
http://localhost:8787/
```

### 2. Load the Chrome extension

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Choose **Load unpacked**.
4. Select this project's `ext/` directory.
5. Open an ordinary webpage.
6. Optionally highlight text.
7. Click the **XT** extension action.

The **full XtraType side panel** opens by default. It does not inject the floating quick bar at the same time.

### 3. Optional quick-comment mode

You can still use the floating quick bar without losing the side-panel workflow:

- In the side-panel header, click the small quick-bar button.
- Or right-click the page and choose **Open XtraType quick comment bar**.

The quick bar includes a **Full panel** button for immediate handoff to the complete workspace. After posting, it remains open and refreshes its recent-comment list so the saved context is immediately visible.

## Storage model

The extension writes locally first:

- annotations and metadata → IndexedDB
- images and screenshots → IndexedDB Blob records
- schemas → IndexedDB
- snapshots and events → IndexedDB

When synchronization is enabled, the PHP service mirrors portable records into JSON files under `server/data/` and media under `server/media/`. A server failure does not discard a locally saved annotation.

## Built-in anchor schemas

- `xtratype.anchor.url@1`
- `xtratype.anchor.gps@1`
- `xtratype.anchor.youtube@1`

See `docs/SCHEMAS.md` for their structure and `server/schemas/example-book-anchor.schema.json` for a custom anchor example.

## Development/security scope

This is a functional developer MVP rather than a hardened public multi-user service. The PHP server intentionally has no production authentication/authorization layer and should not be exposed directly to the public internet without TLS, identity/access controls, rate limiting, deployment hardening, and an upload/security review.


## All-site access in v2.3

XtraType now declares `<all_urls>` as a required host permission. This is intentional: page selection capture, the quick bar, DOM extraction, scrolling/stitching, and contextual annotation all require script access to the active ordinary webpage. Chrome can still block extension scripting on browser-owned pages such as `chrome://...` and the Chrome Web Store; those are surfaced as a friendly capability limitation instead of a raw scripting exception. For `file://` pages, enable **Allow access to file URLs** in the extension's Chrome details page.
