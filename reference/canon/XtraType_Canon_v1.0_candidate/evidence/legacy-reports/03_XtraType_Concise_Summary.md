# PortaShape XtraType SidePanel MVP v2.3 — Concise Summary

## What It Is

PortaShape XtraType v2.3 is a **local-first Chrome extension plus lightweight PHP companion service** for attaching persistent context to things.

Those “things” can be:

- Web pages
- Specific URL variants
- Highlighted passages
- Physical locations
- YouTube videos
- Exact YouTube timestamps
- YouTube time ranges
- Custom structured objects defined by JSON Schema

It also contains a lightweight **webpage snapshot and revision-history system**.

---

## Main User-Facing Features

- Chrome Side Panel as the main workspace
- Quick in-page comment bar
- URL annotations
- Selected-text/highlight capture
- GPS/location annotations
- YouTube time-based annotations
- YouTube progress-bar markers
- YouTube timed notification popups
- Quick replies to YouTube annotations
- Up to three image attachments per full annotation
- Custom anchor schemas
- Visible-page screenshots
- Full-page stitched screenshots
- Rendered HTML capture
- Rendered text capture
- Snapshot timeline/history
- Pixel-level comparison of the latest two snapshots
- Local/offline-first saving
- Optional synchronization to the bundled PHP server
- Responsive mobile/web companion interface
- GPS Nearby discovery in the server web UI
- Metadata export

---

## Main Technical Components

### Chrome Extension

- Manifest V3
- Chrome 116+
- Side Panel
- toolbar action
- context-menu integration
- page scripting
- Shadow DOM Quick Bar
- YouTube content script
- screenshot/capture logic
- IndexedDB repository
- sync client

### Local Storage

IndexedDB database:

`portashape-xtratype`

Stores:

- `annotations`
- `blobs`
- `schemas`
- `snapshots`
- `events`

Settings use Chrome local storage. Temporary browsing context uses Chrome session storage.

### PHP Companion Service

Provides endpoints for:

- Health
- Annotations
- Schemas
- Snapshots
- Events

Persists metadata in JSON files and images/screenshots in filesystem media directories.

No SQL database is used.

---

## Anchor Types

### URL

Supports:

- Origin/path identity
- Ignoring all query parameters
- Selecting specific query parameters
- Using all query parameters
- Fragment include/exclude semantics
- Normalized target keys

### GPS

Supports:

- Latitude
- Longitude
- Optional label
- Optional radius
- Default radius of 75 meters
- Haversine distance matching

### YouTube

Supports:

- Whole video
- Timestamp
- Time range
- Progress-bar markers
- Timed playback notifications
- Replies

### Custom JSON Schema

Supports a practical subset of object-schema fields such as:

- String
- Number
- Integer
- Boolean
- Enum-like values

The package includes an example Book schema using ISBN, page, and edition.

---

## Capture and History

The application can preserve a page as a revision snapshot.

A snapshot may contain:

- URL
- title
- page/viewport dimensions
- screenshot
- rendered HTML
- rendered text
- capture mode
- timestamp
- sync state

Two capture modes exist:

- Visible viewport
- Full page

Full-page capture scrolls the document, captures multiple viewport tiles, and stitches them into a Canvas image.

The system imposes size/tile limits to avoid excessive memory use.

---

## Comparison

The latest two snapshots can be compared visually.

The app:

- loads both screenshot images
- scales them into comparison bounds
- compares RGB pixels
- marks sufficiently different pixels as changed
- reports a changed-pixel percentage
- highlights changed regions

This is a basic visual diff, not a semantic or DOM-aware diff.

---

## Synchronization

The extension saves locally first.

Typical states include:

- `local`
- `pending`
- `synced`
- `error`

Synchronization can:

- Push annotations
- Upload image attachments
- Pull annotations
- Push/pull schemas
- Push snapshots
- Upload screenshot Blobs

Current gaps:

- Remote snapshots are not fully restored/pulled into the local timeline
- Local events are not fully synchronized to the server event API

---

## Responsive Web/Mobile Client

The PHP server also hosts a browser UI with four tabs:

- **Post**
- **Nearby**
- **All context**
- **Schemas**

The Nearby view uses browser geolocation and stored GPS radii to show annotations that are geographically relevant to the user's current position.

---

## What Is Not Yet a Production Feature

The MVP does **not** include a complete production collaboration/security stack.

Not implemented or incomplete:

- Authentication
- Authorization
- Multi-user tenancy
- Verified user identities
- Rich annotation editing
- Complete delete-management UI
- General full-text search
- Full threaded discussion UI
- Advanced conflict resolution
- Complete remote snapshot restoration
- Complete event synchronization
- Production-grade rate limiting
- Production TLS/security configuration
- Billing/subscriptions/pricing tiers
- Advanced semantic screenshot diffing

---

## Important Implementation Caveats

- GPS “Nearby” behavior is stronger in the server/mobile client than in the Chrome Side Panel.
- URL fragment support exists in the model but is not fully exposed by the current Side Panel controls.
- Snapshot sync is asymmetric: upload exists, but full remote restore does not.
- The event endpoint and local event store are not fully connected.
- Quick Bar synchronization behavior is not perfectly aligned with the auto-sync setting.
- The server can accept a broader range of schemas than the extension renderer fully supports.
- The example Book schema is automatically available when the server is connected.

---

## Technology Stack

The project is intentionally lightweight.

It uses:

- Vanilla JavaScript
- HTML/CSS
- Chrome Extension APIs
- IndexedDB
- Canvas
- Shadow DOM
- Geolocation
- Fetch/FormData
- Plain PHP
- JSON files
- Filesystem media storage

It does **not** rely on a large application framework or package ecosystem.

---

## Overall Product Shape

XtraType can be summarized as four connected products:

1. **Context annotation**  
   Attach comments and media to pages, locations, video moments, and structured objects.

2. **Context resurfacing**  
   Re-show those annotations when the relevant page, place, video, or target reappears.

3. **Revision capture**  
   Preserve screenshots, rendered text, rendered HTML, and historical page states.

4. **Portable context model**  
   Keep data locally, optionally synchronize it, and extend the target vocabulary with custom schemas.

The core architectural idea is:

> **Attach durable context to things, not just to documents.**
