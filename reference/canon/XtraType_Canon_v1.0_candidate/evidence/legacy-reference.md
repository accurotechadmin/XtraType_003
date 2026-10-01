# PortaShape XtraType Side-Panel MVP v2.3
## Complete Codebase Reference and Implementation Guide

**Reference edition:** 1 October 2026  
**Codebase reviewed:** `PortaShape_XtraType_SidePanel_MVP_v2.3(2).zip`  
**Scope:** Every source file in the supplied v2.3 package, including the Chrome extension, IndexedDB repository, PHP/JSON server, mobile/web surface, built-in anchor schemas, tests, and startup scripts.

---

## Preface: what this book is

This document is a technical map of the application **as it exists in the supplied v2.3 codebase**. It is intentionally different from a product vision document. When this book says that the application *does* something, that statement is grounded in the current files. When it describes something desirable but missing, it labels it as a limitation, design consequence, or future extension point.

The codebase is small enough to understand end to end, but it crosses several execution environments: a Chrome Manifest V3 extension, ordinary webpage content, the Chrome Side Panel, IndexedDB, Chrome extension storage, a vanilla-PHP HTTP service, filesystem JSON collections, media files, and a responsive web/mobile client. The important architectural idea is that those environments cooperate rather than pretending to be one process.

The user-facing center is **XtraType**. XtraType is the contextual annotation layer: it attaches comments, selected text, and images to a target. Targets are not limited to URLs. The first-class anchor families are URL, GPS, and YouTube video/time, and the system can render additional object-shaped anchor forms from uploaded JSON Schema documents. Snapshotting, full-page capture, visual comparison, schema management, and server synchronization are supporting capabilities underneath that primary XtraType interaction.

This reference therefore follows the application from the outside inward: first the user experience and runtime topology, then the data model, then each execution surface, then each file and function, and finally the current engineering limitations and the safest places to extend the system.

---

# Part I - The System as a Whole

## 1. One-sentence description

PortaShape XtraType v2.3 is a **local-first contextual annotation and rendered-web-state capture system** in which a Chrome side panel is the primary interface, a page-injected quick bar is an optional lightweight interface, IndexedDB is the extension's durable working repository, and a minimal PHP service mirrors portable records into JSON files and media files for continuity and mobile/web access.

## 2. What is first-class and what is supporting

The hierarchy is explicit in both the UI and the architecture documentation:

1. **XtraType annotation is first-class.** The first module visible in the side panel is the annotation composer.
2. **Object Click-style browser capabilities support XtraType.** Page selection, DOM access, screenshots, scrolling, and video state are provided by the browser host.
3. **IndexedDB is the extension's first durable write target.** The side panel saves annotation records and blobs locally before attempting server synchronization.
4. **The PHP service is a continuity/archive host.** It stores JSON records and uploaded media, exposes them to the extension, and supplies a responsive web/mobile surface.
5. **Capture, history, comparison, and schema management are secondary modules.** They are presented beneath XtraType rather than as separate applications.

The important consequence is that the project is not organized around a database-first CRUD application. It is organized around the browser's ability to understand the thing currently being viewed and to attach portable context to that thing.

## 3. Runtime topology

The current implementation can be pictured as five cooperating zones:

```text
+------------------------------------------------------------------+
| Ordinary webpage / YouTube                                      |
|                                                                  |
|  selected text     quick bar (optional)     YouTube markers      |
|       |                    |                       |              |
+-------|--------------------|-----------------------|--------------+
        | chrome.scripting   | runtime messages     | runtime msgs
        v                    v                       v
+------------------------------------------------------------------+
| Chrome extension                                                |
|                                                                  |
| service-worker.js <----> full Side Panel                         |
|       |                     |                                    |
|       |                     +-- XtraType composer                |
|       |                     +-- Context Here                     |
|       |                     +-- Capture                          |
|       |                     +-- Timeline / Compare               |
|       |                     +-- Schemas / Settings               |
|       |                                                          |
|       +-------------------- core modules -------------------------+
|                             anchors.js / db.js / api.js /        |
|                             schemas.js                           |
+------------------------------|-----------------------------------+
                               |
                               v
                     +--------------------+
                     | IndexedDB          |
                     | annotations        |
                     | blobs              |
                     | schemas            |
                     | snapshots          |
                     | events             |
                     +---------|----------+
                               | optional sync
                               v
+------------------------------------------------------------------+
| PHP service                                                     |
| api/*.php  -> JSON collections under server/data/               |
|            -> images/screenshots under server/media/            |
| server/index.php + assets/* -> responsive web/mobile interface  |
+------------------------------------------------------------------+
```

No one box can replace all the others. The PHP server cannot read the current DOM of an arbitrary user's tab. A content script cannot be the durable cross-device archive. The side panel cannot survive browser storage loss by itself. The system gets its capabilities by letting each environment do the job it is actually able to do.

## 4. Primary user flows

### 4.1 Side-panel annotation

The normal desktop flow is:

1. The user opens an ordinary webpage.
2. They may select text on the page.
3. Clicking the XT toolbar action opens Chrome's native Side Panel.
4. The side panel asks the service worker for current browser context.
5. The service worker executes a small function in the active tab to read URL, title, selection, video time, viewport, and page dimensions.
6. XtraType chooses URL by default, or YouTube when the page is recognized as a YouTube video.
7. The user chooses or edits the target, writes a comment, optionally keeps/edits highlighted text, and optionally attaches up to three images.
8. The annotation and its image blobs are written to IndexedDB.
9. If automatic sync is enabled, the record is posted to the PHP API. A server failure changes the local sync state but does not undo the local save.
10. The Context Here feed is refreshed from local IndexedDB.

### 4.2 Quick-comment annotation

The quick bar is intentionally smaller. It can be opened from the side-panel header or the page context menu. It lives inside a Shadow DOM at the top of the webpage and offers a comment box, selected-text preview, Post, Full panel, recent comments, and a prominent close button.

It does **not** expose the full target editor or image attachment workflow. On ordinary pages it creates a default URL anchor. On a recognized YouTube page it creates a timestamp annotation at the video's current playback time.

### 4.3 YouTube playback context

A dedicated content script runs only on `https://www.youtube.com/*`. It requests all annotations for the current video ID, draws markers/ranges over the YouTube progress bar, shows annotation text on hover or click, can submit a quick reply, and briefly displays a toast when playback reaches the start second of an annotation.

### 4.4 GPS/mobile context

The PHP web surface contains a dedicated Nearby tab. The browser asks for the device's current coordinates and tests all server-stored GPS annotations using a Haversine distance calculation. An annotation is visible in Nearby when the current position is inside its stored radius, or inside the configured default radius when the annotation has no explicit radius.

### 4.5 Snapshot/time-machine flow

The side panel can capture the visible viewport or attempt a tiled full-page screenshot. It also extracts bounded rendered HTML and text. The screenshot is stored as an IndexedDB Blob and the snapshot metadata is stored in the `snapshots` store. If synchronization is enabled, metadata is mirrored to `snapshots.json` and the screenshot is uploaded as a server media file.

Snapshots sharing the same normalized page key form a local timeline. The newest two screenshots can be compared by a simple pixel-difference algorithm.

---

# Part II - Repository Map

## 5. Source tree and responsibilities

```text
PortaShape_XtraType_SidePanel_MVP_v2.3/
|
|-- README.md                         overview, installation, scope
|-- start-server.sh                   launches PHP on 0.0.0.0:8787
|-- start-server.bat                  Windows equivalent
|
|-- docs/
|   |-- ARCHITECTURE.md               concise product/runtime model
|   `-- SCHEMAS.md                    anchor schema conventions
|
|-- ext/
|   |-- manifest.json                 Chrome MV3 declaration
|   |-- INSTALL.txt                   extension installation notes
|   |-- service-worker.js             browser broker and message router
|   |
|   |-- core/
|   |   |-- anchors.js                anchor creation, keys, GPS math
|   |   |-- api.js                    PHP API client and sync helpers
|   |   |-- db.js                     IndexedDB repository helpers
|   |   `-- schemas.js                built-ins + custom schema checks
|   |
|   |-- sidepanel/
|   |   |-- index.html                complete primary extension UI
|   |   |-- style.css                 side-panel visual system
|   |   `-- app.js                    side-panel behavior/orchestration
|   |
|   `-- content/
|       |-- page-ui.js                optional quick-comment overlay
|       `-- youtube.js                YouTube timeline integration
|
|-- server/
|   |-- config.php                    limits/default radius/CORS
|   |-- index.php                     responsive web/mobile UI shell
|   |
|   |-- api/
|   |   |-- bootstrap.php             JSON store, locking, uploads, CORS
|   |   |-- annotations.php           annotation CRUD endpoint
|   |   |-- schemas.php               schema GET/POST/DELETE endpoint
|   |   |-- snapshots.php             snapshot GET/POST endpoint
|   |   |-- events.php                event GET/POST endpoint
|   |   `-- health.php                health endpoint
|   |
|   |-- assets/
|   |   |-- app.js                    web/mobile client behavior
|   |   `-- style.css                 responsive web/mobile styling
|   |
|   |-- schemas/
|   |   |-- url-anchor.schema.json
|   |   |-- gps-anchor.schema.json
|   |   |-- youtube-anchor.schema.json
|   |   `-- example-book-anchor.schema.json
|   |
|   |-- data/                         JSON collection files
|   |-- media/                        uploaded images/screenshots
|   `-- ...
|
`-- tests/
    |-- anchors.mjs                   anchor/schema unit assertions
    `-- README.md                     test commands
```

## 6. File inventory

The supplied package contains roughly 1,800 logical lines across extension code, PHP, HTML, CSS, documentation, schemas, and tests. The largest behavioral files are the side-panel controller, service worker, quick-bar content script, and web/mobile client.

The files are deliberately dependency-light. There is no package manager, no build step, no framework, no SQL database, and no bundler. Browser modules are loaded directly as ES modules; the two injected content scripts are self-contained IIFEs; PHP uses ordinary includes; CSS is hand-written.

This simplicity is one of the most important properties of the MVP: a developer can inspect nearly every execution path without first reconstructing a framework lifecycle.

---

# Part III - The Canonical Data Model

## 7. Annotation record

The extension and server converge on `Context.Annotation` version 2. A representative record is:

```json
{
  "id": "annotation:<uuid>",
  "recordType": "Context.Annotation",
  "schemaVersion": 2,
  "target": {
    "kind": "url",
    "schemaId": "xtratype.anchor.url@1",
    "value": {}
  },
  "targetKey": "url:https://example.com/path",
  "highlightedText": "optional selected text",
  "body": "comment text",
  "attachments": [],
  "parentAnnotationId": null,
  "author": "Local user",
  "createdAt": "ISO-8601 timestamp",
  "updatedAt": "ISO-8601 timestamp",
  "syncState": "local|pending|synced|error"
}
```

The important separation is between the **structured target** and its **targetKey**. The structured target preserves the complete targeting intent. The key is a deterministic string used for matching/index-style operations.

The main side-panel composer sets `parentAnnotationId` to `null`. YouTube's quick-reply pathway creates another annotation with the same target and sets `parentAnnotationId` to the original annotation's ID. There is not yet a general threaded-conversation renderer in the main feed, so this relationship currently exists more in the data than in the primary UI.

## 8. Attachments

On first local save, an attachment descriptor looks approximately like:

```json
{
  "id": "attachment:<uuid>",
  "name": "photo.jpg",
  "type": "image/jpeg",
  "size": 123456,
  "blobId": "blob:<uuid>",
  "serverUrl": null
}
```

The actual binary image is a separate record in IndexedDB's `blobs` store. During server sync, the Blob is uploaded in multipart form data. The PHP service writes it into a month-based media directory and returns a server descriptor containing an ID, sanitized original name, MIME type, size, and `/media/...` URL.

The synchronized annotation replaces its attachment list with the server-returned attachment descriptors. That makes the server URL the normal display path after successful synchronization. The local Blob itself remains in IndexedDB, but the synchronized attachment descriptor no longer necessarily keeps the original `blobId` reference.

## 9. Snapshot record

A local snapshot contains:

- an `id` with a `snapshot:` prefix;
- `recordType: "Revision.Snapshot"`;
- `schemaVersion: 1`;
- `pageKey`, derived from the current HTTP(S) URL anchor;
- the full current URL and title;
- `capturedAt`;
- `mode` (`visible` or `full-page`);
- viewport and page dimensions;
- bounded rendered text;
- bounded rendered HTML;
- `screenshotBlobId` pointing to an IndexedDB Blob;
- a sync state;
- after successful sync, an optional `serverScreenshot` descriptor.

A snapshot is treated as an observation, not as a mutable page object. Recapturing produces a new record rather than updating an existing snapshot.

## 10. Event record

The extension's `logEvent()` helper writes:

```json
{
  "id": "event:<uuid>",
  "type": "annotation.created",
  "data": {
    "annotationId": "...",
    "targetKey": "..."
  },
  "occurredAt": "ISO-8601 timestamp"
}
```

The current extension logs annotation creation events locally. A PHP `events.php` endpoint exists, but the extension does not currently push or pull event records. This is an example of a server capability that is scaffolded but not connected to the main synchronization loop.

## 11. Settings and session context

The project uses Chrome extension storage for two non-IndexedDB concerns.

### Persistent settings: `chrome.storage.local`

Key: `xtratypeSettings`

Default values:

```json
{
  "apiBase": "http://localhost:8787/api",
  "author": "Local user",
  "defaultGpsRadius": 75,
  "autoSync": true
}
```

### Ephemeral browser context: `chrome.storage.session`

Key: `xtratypeLastContext`

A captured context can contain:

- `pageUrl`
- `title`
- `highlightedText`
- `currentVideoTime`
- viewport dimensions and scroll position
- overall page width/height
- `tabId`
- `capturedAt`
- in fallback cases, `scriptAccess: false` and `accessReason`

This session record helps the side panel retain useful context across extension lifecycle boundaries and provides a fallback when live page scripting fails.

---

# Part IV - Anchor Handles

## 12. Why anchors are the heart of XtraType

XtraType comments are not merely comments in a global feed. Every annotation says what it is **attached to**. The target object therefore determines whether two annotations belong to the same context.

Three built-in anchor types are treated specially throughout the codebase. Custom schemas then extend that concept without changing the annotation envelope.

## 13. URL anchor

### 13.1 Stored shape

The built-in schema identifies itself as `xtratype.anchor.url@1`. The full server schema expects:

- `url`: a bare HTTP(S) URL without query string or fragment;
- `queryMode`: `ignore`, `selected`, or `all`;
- `queryParameters`: an array of `{key, value, include}` objects;
- `fragmentMode`: `ignore` or `include`;
- `fragment`: nullable string.

### 13.2 Initial parsing

`parseUrlTarget()` in `ext/core/anchors.js`:

1. parses the supplied URL with the platform `URL` class;
2. rejects non-HTTP(S) schemes;
3. stores every query pair but defaults each pair to `include: false`;
4. stores only origin + pathname in `value.url`;
5. defaults query matching to `ignore`;
6. defaults fragment matching to `ignore` while remembering the source fragment.

This preserves potentially useful URL components without making them part of matching until the user chooses to do so.

### 13.3 Canonical key

`targetKey()` reconstructs a URL from the stored bare URL, selects parameters according to `queryMode`, sorts selected parameters by key and then value, appends them, optionally appends the fragment, and prefixes the final string with `url:`.

Examples:

```text
https://example.com/a?x=1&y=2#section
queryMode=ignore
=> url:https://example.com/a

queryMode=selected, include x only
=> url:https://example.com/a?x=1
```

Sorting means two records that select the same key/value pairs in different UI order produce the same target key.

### 13.4 Runtime page matching

The service worker has a separate `urlTargetMatchesPage()` function used by the quick bar's Recent comments feature. It compares origin + pathname, optionally fragment, and then exact key/value pairs. Duplicate parameters are handled as a multiset through a small `used` pool, so matching one duplicate cannot satisfy two expected duplicates.

### 13.5 Current implementation caveat: fragment UI

The core model supports fragment inclusion, and the side panel exposes a Fragment handling selector, but the side-panel form does not expose or preserve the original fragment value when it rebuilds the target from the bare URL input. In practice, selecting “Include fragment” in the current side-panel implementation will normally still have a null fragment. The server/mobile client always emits `fragmentMode: "ignore"`.

Therefore fragment-aware URL anchoring is **represented in the schema and key algorithm but is not fully wired through the current UI**.

## 14. GPS anchor

### 14.1 Stored shape

Schema ID: `xtratype.anchor.gps@1`

Fields:

- `latitude`: -90 through 90;
- `longitude`: -180 through 180;
- `radiusMeters`: positive number or null;
- `label`: optional string.

The built-in default radius is 75 meters.

### 14.2 Construction and validation

`makeGpsTarget()` converts coordinate inputs to numbers, verifies legal latitude/longitude bounds, converts an optional radius, rejects non-positive radii, and preserves an optional label.

A blank radius intentionally remains `null`. It does not get rewritten to 75. This lets the record distinguish “the author chose exactly 75 m” from “use the consumer's configured default gate.”

### 14.3 Canonical key

The key rounds latitude and longitude to six decimal places:

```text
gps:41.880000,-87.630000
```

When an explicit radius exists:

```text
gps:41.880000,-87.630000@125
```

Six decimal places correspond to sub-meter coordinate precision in many contexts. The key is an identity/matching convenience; geofence evaluation itself uses full numeric values stored in the record.

### 14.4 Geofence test

The extension core exports `haversineMeters()` and `gpsMatches()`. The server web client contains its own equivalent Haversine implementation. The calculation treats Earth as a sphere of radius 6,371,000 meters and measures great-circle distance between two latitude/longitude points.

If `radiusMeters` is null, matching substitutes the configured default radius.

### 14.5 Where GPS matching is actually used today

The responsive PHP/web client uses geofence matching in its Nearby tab. The extension-side XtraType feed does not currently perform “near my current position” matching. When a GPS target is explicitly filled into the side-panel form, Context Here uses the exact `targetKey`; the imported `gpsMatches` helper is not used by side-panel logic.

This is an important distinction: **the data model supports GPS areas everywhere, but location-gated discovery is currently implemented in the web/mobile surface rather than the side-panel feed.**

## 15. YouTube anchor

### 15.1 Stored shape

Schema ID: `xtratype.anchor.youtube@1`

Fields:

- `videoId`
- canonical `videoUrl`
- nullable `startSeconds`
- nullable `endSeconds`

The legal semantic combinations are:

- neither start nor end: entire video;
- start only: a point/timestamp;
- start and end: a time range;
- end without start: invalid.

### 15.2 URL recognition

`youtubeInfo()` recognizes:

- `youtu.be/<id>` links;
- `youtube.com/watch?v=<id>`;
- `youtube.com/shorts/<id>`.

It does not currently implement every possible YouTube URL form, such as arbitrary embed/live variants.

### 15.3 Canonical key

Examples:

```text
youtube:abc123XYZ_0
youtube:abc123XYZ_0@12.500
youtube:abc123XYZ_0@12.500-18.000
```

Time values are formatted to three decimal places in the key.

### 15.4 Feed matching versus exact key matching

The side-panel Context Here renderer deliberately broadens YouTube matching: when the current target is YouTube, it includes any local annotation with the same video ID even if its precise timestamp/range key differs. This creates a video-level feed while preserving precise anchors inside individual records.

The quick bar's recent-comment lookup uses the same video-level idea: on a YouTube page, annotations are matched by video ID.

### 15.5 Quick-bar semantics

When the quick bar is used on YouTube, `quickCreate()` automatically makes a **timestamp annotation at the current playback time**. The quick bar does not offer a Bare video switch or an end-time range editor. Those richer choices live in the full side panel.

## 16. Custom structured anchors

Custom anchor schemas must be JSON objects containing:

- a non-empty string `$id`;
- `type: "object"`;
- a `properties` object;
- optionally `required`;
- optionally `x-xtratype` metadata such as label and description.

IDs beginning with `xtratype.anchor.` are reserved for built-ins.

The extension renderer supports fields that reduce to string, number, integer, or boolean, plus enum fields. A normalized custom schema receives `x-xtratype.kind = "custom"` if necessary.

The custom target key is:

```text
custom:<schemaId>:<canonical-json>
```

Canonical JSON is created recursively by sorting object keys. Arrays preserve their array order.

### 16.1 Validation scope

Current custom validation is deliberately shallow. The extension checks required fields and checks that schema field types belong to its supported primitive set. It does **not** implement a full JSON Schema validator. Constraints such as regex patterns, string lengths, complex `oneOf`, nested object rules, array item schemas, and arbitrary semantic constraints are not enforced by the generic renderer.

The PHP schema endpoint similarly verifies only `$id`, object type, and properties at installation time.

### 16.2 The example Book schema

`server/schemas/example-book-anchor.schema.json` defines ISBN, page, and edition fields. Because `schemas.php` loads every `*.schema.json` file under `server/schemas/`, this example is actually returned by the server's schema catalog automatically. Although documented as an example custom anchor, it behaves like a preinstalled server schema in this build.

---

# Part V - Chrome Extension Foundation

## 17. `ext/manifest.json`

The extension is Manifest V3, named **XtraType — PortaShape MVP**, version `2.3.0`, with minimum Chrome version 116.

### 17.1 Declared extension permissions

The manifest requests:

- `activeTab`
- `scripting`
- `storage`
- `sidePanel`
- `contextMenus`
- `tabs`
- `geolocation`

It also requests required host access to:

```json
"host_permissions": ["<all_urls>"]
```

This broad host permission is central to the intended product behavior: XtraType wants to inspect and annotate whichever ordinary webpage the user is viewing rather than forcing a separate permission request for every site.

### 17.2 Service worker

The background entry point is `service-worker.js`, loaded as an ES module. It imports the IndexedDB helpers, anchor helpers, and API synchronization helpers.

### 17.3 Side panel

The manifest's `side_panel.default_path` is `sidepanel/index.html`. There is no popup declared on the extension action. Runtime code configures the Chrome action so clicking it opens the native side panel.

### 17.4 YouTube content script

`content/youtube.js` is loaded at `document_idle` for `https://www.youtube.com/*`. The general quick bar is **not** declared as a persistent content script; it is injected on demand through `chrome.scripting.executeScript()`.

## 18. Service worker: `ext/service-worker.js`

The service worker is the broker between privileged Chrome APIs, webpage contexts, IndexedDB, and the extension UIs.

### 18.1 Installation/startup behavior

On installation, it removes existing extension context menus and creates:

- **Open XtraType side panel**
- **Open XtraType quick comment bar**

for selection/page/video/link contexts.

It also calls `chrome.sidePanel.setPanelBehavior({openPanelOnActionClick:true})`. The same setting is applied immediately when the service worker module evaluates and again on Chrome startup. This repeated configuration is intentional defensive wiring: the toolbar action is meant to open the full side panel without a custom `action.onClicked` intermediary.

### 18.2 Active tab helper

`activeTab()` queries the active tab in the current window and returns the first result or `null`.

### 18.3 Scriptability boundary

`pageScriptability()` preflights URLs before injection. It rejects:

- `chrome:`
- `chrome-extension:`
- `devtools:`
- `edge:`
- `about:`
- `view-source:`
- the Chrome Web Store host/path.

The function's purpose is not to model every possible browser restriction; it converts the common protected-page failure cases into a friendly explanation before `chrome.scripting.executeScript()` throws Chrome's raw permission error.

`requireScriptableTab()` combines the “tab exists” and “URL is scriptable” checks.

### 18.4 Reading current page context

`tabContext(tabId, tabUrl)` injects an inline function into the active page and returns:

- current `location.href`;
- `document.title`;
- selected text, trimmed and capped at 10,000 characters;
- the first `<video>` element's current time, if any;
- viewport width/height, scroll position, and device pixel ratio;
- maximum document/body scroll width and height.

This function is the bridge that lets the side panel know what the webpage can see.

### 18.5 Remembered context

`rememberContext(tab)` tries `tabContext()`, adds tab ID and capture time, and stores it in `chrome.storage.session` as `xtratypeLastContext`.

On failure it writes a fallback containing the tab's URL/title plus `scriptAccess:false` and an explanatory reason. This lets the side panel remain open and intelligible even when the page itself cannot be scripted.

### 18.6 Opening the side panel

`openPanelForTab(tab)` remembers context, enables the side-panel path for the tab, then calls `chrome.sidePanel.open({tabId})`.

Toolbar clicks normally use Chrome's native `openPanelOnActionClick` behavior rather than this function. `openPanelForTab()` is still used by the context menu and by the Full panel button in injected content UIs.

### 18.7 Opening the quick bar

`openQuickBarForTab(tab)` requires a scriptable page, remembers its context, and injects `content/page-ui.js` into that tab.

The quick bar is therefore explicitly opt-in and transient. Opening the side panel does not inject it.

### 18.8 Quick creation

`quickCreate(payload)` chooses its target from the page URL:

- recognized YouTube URL -> YouTube target at `currentVideoTime`;
- otherwise -> default URL target.

It creates a `Context.Annotation` with no attachments and saves it to IndexedDB. If auto-sync is enabled it tries to sync immediately.

One small state inconsistency exists here: the quick-created record starts with `syncState:'pending'` even when auto-sync is disabled, whereas the full side-panel composer uses `syncState:'local'` when auto-sync is off.

### 18.9 Recent comments on the current page

The worker contains matching logic specifically for the quick bar:

- YouTube annotations match when video IDs match.
- URL annotations match according to the annotation's URL matching policy.

If auto-sync is enabled, the worker first attempts to pull all server annotations into local IndexedDB, then returns up to 4 by default (bounded to 1–10) sorted newest first.

### 18.10 YouTube annotation retrieval

`youtubeAnnotations(videoId)` filters local IndexedDB by video ID. When auto-sync is enabled it attempts a full server annotation pull first and merges server records into local storage as `synced`.

### 18.11 Runtime message API

The service worker handles these message types:

| Message | Purpose |
|---|---|
| `xtratype:openSidePanel` | Open the full panel for sender/active tab |
| `xtratype:openQuickBar` | Inject quick bar into sender/active tab |
| `xtratype:getContext` | Return live active-tab context or fallback context |
| `xtratype:quickCreate` | Create a quick annotation |
| `xtratype:getRecentContextAnnotations` | Get recent URL/video annotations for quick bar |
| `xtratype:getYouTubeAnnotations` | Get all annotations for one video ID |
| `xtratype:quickReply` | Create child annotation sharing parent's target |
| `xtratype:scrollTo` | Scroll a tab for tiled capture |
| `xtratype:captureVisible` | Capture the active visible tab as PNG data URL |
| `xtratype:pageExtract` | Extract bounded outer HTML/text/title/URL |

The listener returns `true` so the asynchronous response channel stays alive while the Promise resolves.

### 18.12 Extraction bounds

`xtratype:pageExtract` caps:

- `document.documentElement.outerHTML` at 5,000,000 characters;
- body inner text at 2,000,000 characters.

This keeps individual snapshot records bounded, but those are still very large values for JSON-file storage when many snapshots accumulate.

---

# Part VI - Extension Core Modules

## 19. IndexedDB repository: `ext/core/db.js`

### 19.1 Database identity

Database name: `portashape-xtratype`  
Schema version: `1`

Object stores:

- `annotations`
- `blobs`
- `schemas`
- `snapshots`
- `events`

Every store uses `id` as its key path.

### 19.2 Indexes

`annotations` has:

- `targetKey`
- `createdAt`

`snapshots` has:

- `pageKey`

The current application usually retrieves all annotations rather than using the annotation indexes. Snapshot timeline rendering does use `byIndex('snapshots','pageKey',...)`.

### 19.3 DB connection caching

`openDb()` memoizes a Promise in `dbPromise`, so repeated calls share the same opened database for the lifetime of that JavaScript context.

During `onupgradeneeded`, stores and indexes are created only when absent. Because DB_VERSION is still 1, there is no migration code beyond initial creation.

### 19.4 CRUD helpers

- `put(storeName, value)` opens a read/write transaction and resolves only on transaction completion.
- `get(storeName, id)` wraps an IndexedDB request.
- `all(storeName)` uses `getAll()`.
- `remove(storeName, id)` deletes one record.
- `byIndex(storeName,indexName,key)` retrieves all matching records from an index.

`remove` is imported into the side-panel app but is not currently used by UI behavior.

### 19.5 IDs

`id(prefix)` returns:

```text
<prefix>:<crypto.randomUUID()>
```

### 19.6 Blob records

`addBlob(blob, meta)` creates a record containing ID, Blob object, MIME type, byte size, creation timestamp, and supplied metadata such as original filename.

This design keeps binary payloads out of annotation and snapshot metadata. It also makes the normal IndexedDB structured clone mechanism do the binary persistence work.

### 19.7 Event logging

`logEvent(type,data)` is a very small local append helper. There is no event pruning, indexing, or remote synchronization in the current extension.

## 20. API client: `ext/core/api.js`

This module centralizes extension-to-PHP HTTP behavior.

### 20.1 Settings defaults

`settings()` overlays stored values on defaults. The API base is `http://localhost:8787/api`.

### 20.2 Generic API helper

The private `api(path,options)`:

1. reads current settings;
2. joins API base + endpoint path;
3. runs `fetch`;
4. attempts to parse JSON whether success or failure;
5. throws a human-readable error using the server's `message` field when possible.

### 20.3 Annotation synchronization

`syncAnnotation(annotation, blobs)` constructs multipart `FormData`.

Before sending, it builds a wire copy of the annotation and keeps only attachments that already have `serverUrl` or `url`. Local-only attachment metadata with only `blobId` is not serialized into the portable JSON attachment list. The actual local Blobs are appended separately as `images[]`.

After a successful POST, the returned server item is merged with the local annotation, marked `synced`, and written back to IndexedDB.

### 20.4 Pull operations

- `pullAnnotations()` GETs all annotations.
- `pullSchemas()` GETs all server schemas.
- `pushSchema()` POSTs a schema.

There is no delta token, paging, ETag, revision cursor, or conflict protocol. Pulling annotations is an all-record operation.

### 20.5 Snapshot synchronization

`syncSnapshot(snapshot,screenshotBlobRecord)` removes `screenshotBlobId` from the wire payload and uploads the screenshot Blob under field name `screenshot`.

The module has no `pullSnapshots()` function. Therefore server-side snapshots act as an archive/mirror in the current build, not as a fully synchronized cross-device timeline.

### 20.6 Health check

`serverHealth()` calls `health.php` and is used by the side-panel Settings module.

## 21. Schema helper: `ext/core/schemas.js`

The extension keeps compact built-in schema definitions for URL, GPS, and YouTube. These built-ins are sufficient for rendering and basic client logic but are not byte-for-byte copies of the fuller JSON Schema files under `server/schemas/`.

`normalizeCustomSchema()`:

- verifies object input;
- requires `$id`;
- requires object type and properties;
- reserves `xtratype.anchor.*`;
- permits primitive supported types;
- ensures `x-xtratype.kind` becomes `custom` and supplies a label.

`validateCustomValue()` currently verifies only required-field presence.

The duplication between extension built-ins and server schema files is pragmatic for an MVP, but it creates a future drift risk. A production design would normally establish one canonical built-in schema source or a generated artifact pipeline.

---

# Part VII - The Full Chrome Side Panel

## 22. UI structure: `ext/sidepanel/index.html`

The side panel is the canonical desktop extension workspace. Its vertical order is meaningful.

### 22.1 Sticky application header

The header contains:

- XT logo and product name;
- “context attached anywhere” subtitle;
- quick-bar launcher button;
- refresh-context button.

### 22.2 Context strip

Directly below the header is a compact current-page status strip showing the page title and URL or, when injection is blocked, the access explanation. A colored dot changes to a blocked state through CSS.

### 22.3 Primary XtraType module

The first card is explicitly labeled `PRIMARY MODULE` and contains:

- Attach to selector;
- dynamically rendered target fields;
- Highlighted text textarea;
- Comment textarea;
- image attachment picker;
- image previews;
- Post annotation;
- Clear;
- composer status.

This is the principal creation workflow.

### 22.4 Context Here

The first supporting `details` module is open by default. It displays annotations matching the current target and provides Sync now.

### 22.5 Capture

Contains:

- Visible snapshot;
- Full page capture;
- capture status;
- latest snapshot preview.

### 22.6 Timeline & compare

Contains:

- page-specific snapshot list;
- Compare latest two;
- visual-difference canvas;
- pixel-change percentage.

### 22.7 Anchor schemas

Contains custom JSON schema upload and the resolved schema catalog.

### 22.8 Settings

Contains:

- explanatory toolbar behavior callout;
- PHP API base;
- display name;
- default GPS radius;
- automatic sync checkbox;
- Save settings;
- Test server;
- Export JSON metadata.

The export deliberately includes metadata and Blob references, not the binary image/screenshot data itself.

## 23. Side-panel controller: `ext/sidepanel/app.js`

This is the largest orchestration module in the extension and deserves to be understood in phases.

### 23.1 Module state

The module holds:

- `context`: current page context;
- `schemas`: built-ins plus local/remote custom schemas;
- `selectedFiles`: unsaved image choices;
- `selectedSnapshotUrl`: object URL for explicitly selected snapshot preview.

An unused `TextEncoder` is also instantiated, and `remove` and `gpsMatches` are imported but unused in the current build.

### 23.2 Output safety helpers

`safe()` HTML-escapes ampersand, angle brackets, quotes, and apostrophes before strings are interpolated into HTML templates. Many dynamic UI areas use this helper. Other places use `textContent` or direct DOM element creation.

### 23.3 Schema loading/merging

`loadSchemas()` builds a Map keyed by `$id` in this order:

1. extension built-ins;
2. locally stored custom schema records;
3. server schemas, when the pull succeeds.

Remote custom schemas are written into local IndexedDB. Remote built-ins are used in-memory but not saved as local custom schema records.

The current selector value is preserved when still valid. Otherwise a recognized YouTube page defaults to YouTube; all other pages default to URL.

### 23.4 Context refresh

`refreshContext()`:

1. reads the last session context;
2. asks the service worker for live context;
3. uses live context when successful, otherwise session fallback;
4. copies selected text into the Highlighted text field when non-empty;
5. updates page title/URL strip;
6. shows a blocked-state message if page scripting is unavailable;
7. reloads schemas, feed, and snapshots.

This means opening the side panel is not dependent on a custom toolbar-click message. The panel self-initializes by asking for the active tab.

### 23.5 Dynamic target form

`renderTargetFields()` dispatches by `x-xtratype.kind`:

- URL -> `renderUrl()`
- GPS -> `renderGps()`
- YouTube -> `renderYoutube()`
- custom -> `renderCustom()`

#### URL form

It parses the current page URL when possible. The form presents a bare URL, query-mode selector, query rows with inclusion checkboxes and editable keys/values, a fragment-mode selector, and an Extract variables button.

The Extract button can accept a full URL typed into the bare-URL input, generate query rows, and replace the URL input with origin + pathname.

#### GPS form

It renders latitude, longitude, optional radius, label, and Use my location. `navigator.geolocation.getCurrentPosition()` is called only after the user's button click.

#### YouTube form

It prepopulates video ID/URL from the current page when recognized. If the live page context contains a current video time, the start field is prefilled with that time rounded to tenths of a second. Buttons let the user refresh the current time or clear both times to make a bare-video target.

#### Custom form

Fields are generated from `schema.properties`. Enums become `<select>`, booleans become checkboxes, numbers/integers become numeric inputs, and other supported values become text inputs.

### 23.6 Building the structured target

`buildTarget()` reads the current dynamic form and uses the core constructors for URL/GPS/YouTube. Custom values are assembled from inputs and passed through required-field validation.

This is the exact boundary between UI state and portable target state.

### 23.7 Client-side image rules

`validateFiles()` enforces:

- maximum three files;
- PNG, JPEG, or WebP MIME types;
- maximum 8 MiB per file.

The server repeats these important checks rather than trusting the client.

### 23.8 Saving an annotation

`saveAnnotation()` performs the local-first transaction sequence:

1. requires non-empty comment text;
2. validates selected files;
3. builds the target;
4. loads settings;
5. stores each image as an IndexedDB Blob;
6. constructs attachment descriptors referencing those Blob IDs;
7. constructs the annotation and deterministic target key;
8. writes it to IndexedDB;
9. logs `annotation.created` locally;
10. reports “Saved locally.” immediately;
11. optionally attempts server sync;
12. on sync error, preserves the annotation with `syncState:'error'` and a `syncError` string;
13. clears the comment and selected image list;
14. rerenders the feed;
15. for YouTube, tells the active YouTube content script to refresh its markers.

The selected highlighted text is **not** cleared after posting. Only the comment and image selections are cleared. This makes it possible to attach multiple comments to the same selection, although the Clear button will clear both textareas.

### 23.9 Context Here feed

`renderFeed()` starts with all local annotations. It attempts to build the target from the current form. If it succeeds:

- non-YouTube records are filtered by exact target key;
- YouTube records also match any annotation with the same video ID.

It renders up to 50 newest records. Highlighted text is displayed as a quote, body text preserves whitespace, and local/server image sources are resolved.

There is currently no edit, delete, moderation, reply-tree, pagination, or search control in this feed.

### 23.10 Image previews

Selected unsaved files are previewed with `URL.createObjectURL()`, with a small remove button per image.

The current implementation does not revoke every preview/object URL after use, so long-lived repeated use can retain some Blob URL memory until the document is destroyed. That is a cleanup opportunity rather than a data-integrity issue.

### 23.11 Manual synchronization

`pull()` is actually a bidirectional best-effort sync pass:

1. iterate all local annotations not marked synced;
2. recover any local image Blobs still needing upload;
3. attempt annotation push;
4. push every local custom schema;
5. push every unsynced snapshot with screenshot Blob;
6. pull all remote annotations;
7. upsert them locally as synced;
8. reload schemas, feed, and snapshots.

Individual push failures inside the loops are swallowed so other records continue. A failure of the final overall flow is surfaced as “Local data is safe; sync failed...”

There is no tombstone/deletion sync, conflict merging, or change cursor.

### 23.12 Visible snapshot

`makeVisibleSnapshot()`:

- identifies the active tab;
- retrieves current context;
- asks the worker for `captureVisibleTab()` PNG;
- asks the worker for rendered page extraction;
- converts the data URL to a Blob;
- persists the snapshot.

### 23.13 Full-page tiled snapshot

`makeFullSnapshot()` is the most browser-mechanical part of the application.

It:

1. retrieves page and viewport dimensions;
2. accounts for device pixel ratio;
3. caps logical capture width to roughly `14000 / DPR`;
4. caps logical height to roughly `28000 / DPR`;
5. creates horizontal and vertical scroll positions by viewport increments plus the final edge position;
6. rejects captures requiring more than 30 tiles;
7. scrolls to each tile position;
8. waits 140 ms;
9. captures the visible tab;
10. decodes each capture to an ImageBitmap;
11. restores the original scroll position;
12. creates a canvas sized to the target page area;
13. draws each tile into its corresponding position;
14. converts the canvas to PNG;
15. extracts page HTML/text;
16. persists the snapshot.

This provides useful “impossible screenshot” behavior without third-party libraries, but it is not a general-purpose browser rendering engine. Sticky/fixed elements can repeat across tiles, lazy loading may need longer than 140 ms, animated content can change between tiles, and extremely large canvases can be memory-intensive even within the current caps.

### 23.14 Snapshot persistence

`persistSnapshot()` stores screenshot Blob first, then metadata. It only supports HTTP(S) page keys because it calls `parseUrlTarget()`.

Automatic server synchronization uploads the screenshot and updates local sync state. A sync failure does not delete the local snapshot.

### 23.15 Timeline rendering

`renderSnapshots()` computes the default normalized URL `pageKey` for the current page, queries the IndexedDB snapshot index, sorts newest first, creates thumbnail object URLs, and shows the newest image as Latest snapshot.

Because page keys use the default URL policy, query variables are ignored for snapshot grouping. Distinct query-state pages under the same origin/path therefore share one snapshot timeline in this MVP.

### 23.16 Visual comparison

`compareLatest()` retrieves the two newest screenshot Blobs and decodes them.

It chooses comparison dimensions as the minimum of each image's dimensions and hard caps width at 1800 and height at 12000. Both images are drawn scaled into the same comparison dimensions.

For each pixel it calculates:

```text
|R_after - R_before| + |G_after - G_before| + |B_after - B_before|
```

A sum greater than 60 is treated as changed. Changed pixels are drawn red-ish; unchanged pixels are drawn as a darkened version of the newer image. The UI displays:

```text
changed pixels / total pixels * 100
```

This is a deliberately simple visual regression signal. It is not layout-aware, anti-aliasing-aware, perceptual, DOM-aware, or motion-aware.

### 23.17 Custom schema installation

The selected file is parsed as JSON, normalized/validated, saved locally, then pushed to the server. A server failure leaves the schema installed locally and reports that distinction to the user.

### 23.18 Settings behavior

On Save settings, the side panel stores the four settings values. It contains code to request an origin permission when API base is a non-localhost URL. Since v2.3 already requests `<all_urls>` as a required host permission, that additional origin request is normally redundant in this exact manifest configuration.

### 23.19 Metadata export

The export contains all local annotation, schema, snapshot, and event **metadata** serialized to JSON. IndexedDB Blob bytes are not inlined into the export.

---

# Part VIII - Side-Panel Styling

## 24. `ext/sidepanel/style.css`

The side panel uses a compact neutral design system based on CSS custom properties:

- ink: dark blue-gray;
- muted gray;
- light borders;
- white cards;
- dark primary accent;
- red error state.

### 24.1 Layout principles

The UI is designed for the narrow, resizable Chrome side-panel column rather than a full webpage. Important techniques include:

- `min-width:300px` rather than a large fixed width;
- sticky header;
- ellipsis for current-page title/URL;
- collapsible `<details>` modules;
- flexible button grids;
- two-column field groups that collapse on narrow widths;
- `overflow-wrap:anywhere` for annotation text;
- scrollable horizontal image preview strips.

### 24.2 Primary-module emphasis

The XtraType module has a dark top border and a dedicated module heading. Supporting capabilities use neutral `tool-module` cards. This makes the hierarchy visible rather than merely documented.

### 24.3 Accessibility/polish provisions

v2.2 added a `:focus-visible` treatment, narrower-width adjustments, improved textarea line height, and wrap rules for comments/quotes. v2.3 added a red blocked-context dot.

There is still room for a fuller accessibility pass: explicit error associations, more ARIA relationships in generated fields, keyboard testing of all dynamic controls, and better image alt semantics are not implemented as a formal system.

---

# Part IX - Optional Quick Comment Bar

## 25. `ext/content/page-ui.js`

This file is injected only on demand and runs as a self-contained IIFE so it does not depend on ES-module imports in the page context.

### 25.1 Reopening behavior

The script first captures current selection. If an `#xtratype-host` already exists, it does not create a second overlay. Instead it updates the existing highlighted-text display, hides it when selection is empty, focuses the textarea, and returns.

### 25.2 Shadow DOM isolation

A fixed host element is appended to `document.documentElement`, and an open Shadow DOM contains the quick-bar HTML and CSS. Shadow DOM substantially reduces style collisions with arbitrary host webpages and prevents the quick bar's compact CSS rules from globally affecting the page.

### 25.3 Position and dimensions

The bar is fixed 12 px from the top and horizontally centered. Width is up to 860 px but constrained to viewport width. Maximum height is bounded and scrollable.

On very narrow screens it becomes nearly full width and its button row wraps.

### 25.4 UI composition

The quick bar contains:

- dark XT brand square;
- current context label;
- comment textarea;
- Post;
- Full panel;
- selected/highlighted text block underneath the comment input;
- status line;
- Recent comments here section;
- high-contrast circular close button.

The selected-text block is line-clamped to three visible lines, preserves line breaks, and wraps long content. The full selected value is retained in `dataset.fullText` and is what gets submitted.

### 25.5 Current context line

On a YouTube-like hostname with a video element, the bar shows title + current playback time. Otherwise it shows host + pathname.

### 25.6 Recent comments

The bar asks the service worker for up to four matching annotations and renders:

- author;
- target suffix (URL/custom/video and timestamp/range);
- relative time;
- two-line comment preview;
- one-line selected-text quote when present.

It refreshes this list after a successful post.

### 25.7 Posting

The quick bar requires comment text, sends body + full selected text + page URL/title + current video time, and relies on the service worker to create the correct URL or YouTube target.

After success it clears the textarea but stays open, reports success, refreshes recent context, and returns focus to the textarea.

Keyboard shortcuts:

- Ctrl/Cmd + Enter -> Post
- Escape -> close

### 25.8 Handoff to the full panel

Full panel sends `xtratype:openSidePanel`. If the browser refuses to open the panel, the quick bar displays a fallback instruction to use the XT toolbar button.

### 25.9 Deliberate limitations

The quick bar does not offer:

- image attachments;
- GPS targeting;
- custom-schema targeting;
- URL query policy controls;
- YouTube end-time range controls;
- annotation editing/deletion.

That is intentional: it is the rapid “comment here” surface, not a duplicate of the full application.

---

# Part X - YouTube Integration

## 26. `ext/content/youtube.js`

The YouTube content script turns time anchors into visible temporal context.

### 26.1 Video identity

`videoId()` extracts `v` from the current URL or the ID from `/shorts/<id>`.

### 26.2 Marker host

`ensureUi()` locates YouTube's progress-bar element using:

```text
.ytp-progress-bar-container, .ytp-progress-bar
```

It injects an absolutely positioned marker host over the progress bar, with pointer events disabled at the host level and re-enabled on individual marker buttons.

### 26.3 Toast host

The same function creates a toast overlay inside `#movie_player` when possible, otherwise `document.body`.

### 26.4 Rendering markers and ranges

For each annotation with a numeric `startSeconds`:

- start percentage = start / video duration;
- end percentage = end / video duration when a range exists;
- point annotations receive a small minimum width;
- ranges stretch across the progress bar proportionally;
- markers are yellow and interactive.

Bare-video annotations have no start time and therefore do not draw a marker.

### 26.5 Hover/click card

Hovering a marker creates a small card showing XtraType, start time, and comment. Clicking creates the interactive version with:

- Quick reply input;
- Reply button;
- Open XtraType button.

Replies are sent to the worker as child annotations with `parentAnnotationId` referencing the original.

### 26.6 Playback notification

A 700 ms interval checks the integer playback second. When it first observes the integer second equal to an annotation's integer start second, it shows a 4.5-second toast containing the annotation body.

This mechanism is simple and works for ordinary playback, but a large seek can jump over the exact second and therefore miss the notification. Range annotations are represented on the timeline; the current code does not provide a continuously visible “inside this range” overlay.

### 26.7 YouTube SPA changes

A `MutationObserver` watches the entire document subtree. If the video ID changes, annotations are refreshed; otherwise markers are rerendered. This helps with YouTube's client-side navigation, but observing all subtree mutations and rerendering immediately is potentially expensive on a highly dynamic site. Debouncing and more targeted observation would be a likely optimization for a production version.

### 26.8 DOM coupling risk

The integration necessarily depends on YouTube CSS selectors and page structure. Changes in YouTube's player markup can break marker placement even though annotation data remains valid. This is a host-adapter maintenance concern, not a failure of the core anchor model.

---

# Part XI - The PHP/JSON Server

## 27. Server philosophy

The server is intentionally plain. It does not introduce a second semantic object model. It persists the same annotation/snapshot/schema records the extension already understands and supplies a responsive client that consumes those endpoints.

The persistence model is:

```text
server/data/annotations.json
server/data/events.json
server/data/schemas.json
server/data/snapshots.json
server/media/YYYY-MM/<generated files>
```

## 28. Configuration: `server/config.php`

Current settings:

- maximum image bytes: 8 MiB;
- maximum images: 3;
- default GPS radius: 75 meters;
- CORS origin: `*`.

The source explicitly labels wildcard CORS as a developer-MVP setting.

## 29. Shared API foundation: `server/api/bootstrap.php`

This file is the server's infrastructure layer.

### 29.1 Constants and directories

It defines:

- `DATA_DIR`
- `MEDIA_DIR`
- `SCHEMA_DIR`

### 29.2 CORS and no-cache behavior

`cors()` sets:

- Access-Control-Allow-Origin;
- allowed request headers;
- GET/POST/DELETE/OPTIONS methods;
- `Cache-Control: no-store`.

OPTIONS requests terminate with 204.

### 29.3 JSON response conventions

`respond(data,status)` sets status, JSON content type, pretty-prints JSON without escaping slashes, and exits.

`fail(message,status,code)` standardizes error envelopes:

```json
{
  "ok": false,
  "error": "invalidRequest",
  "message": "..."
}
```

### 29.4 Directory creation

`ensure_dirs()` creates data and media directories with mode 0775 when absent.

### 29.5 Collection path hardening

`collection_path()` accepts only lowercase letters, digits, underscore, and hyphen in collection names. The actual endpoint code passes hard-coded names, so this is additional defense against path injection.

### 29.6 Reading JSON collections

`read_collection()` returns an empty array when a file is absent, blank, unreadable, or decodes to a non-array value.

This is tolerant but means malformed/corrupt JSON degrades to an empty collection rather than producing a loud recovery error.

### 29.7 Atomic writes and file locks

`write_collection()` and `mutate_collection()` use a sibling `.lock` file with `flock(LOCK_EX)`. Data is serialized to a randomly named temp file and then renamed over the collection file.

That pattern avoids many common partial-write failures and prevents two writers from editing the same JSON collection simultaneously.

`mutate_collection()` is the important function for CRUD. It reads under the lock, lets a callback produce the next item list and a result, writes atomically, unlocks, and returns the result.

### 29.8 Upsert and delete

`upsert_item()` requires a string ID, replaces an existing item with the same ID, or appends a new item.

`delete_item()` filters by ID and returns whether the item count changed.

There is no record version check. Last accepted write for a given ID wins.

### 29.9 JSON request parsing

`json_body()` reads `php://input` and requires the decoded result to be an array.

### 29.10 Server-generated IDs

`uuid_like(prefix)` is not RFC UUID formatting; it is a prefix plus 16 random bytes encoded as hex. The string still provides strong random uniqueness for MVP purposes.

### 29.11 Upload handling

`save_uploaded_images()` enforces server-side limits independently of the client:

- max count;
- successful PHP upload status;
- max byte size;
- MIME type determined with `finfo`, not trusted browser extension;
- only PNG/JPEG/WebP.

Media is stored under a `YYYY-MM` directory. Disk filenames use a generated media ID, not the user's filename. The original filename is sanitized before being returned as metadata.

### 29.12 Multipart normalization

`flattened_uploads()` converts PHP's nested multiple-file upload shape into a normal list that `save_uploaded_images()` can process.

### 29.13 What this infrastructure does not provide

There is no authentication, authorization, tenant isolation, database transaction spanning multiple collections, encryption, quota, rate limiting, media garbage collection, content scanning, or audit identity. The README correctly calls the service a developer MVP.

## 30. Annotation API: `server/api/annotations.php`

### GET

Returns all annotations, sorted newest first. Optional filters:

- `id`
- `videoId`
- `targetKey`

An `id` miss returns a 404 `notFound` error.

### DELETE

Requires `?id=...` and deletes that record from `annotations.json`.

No current shipped UI calls this endpoint.

### POST

Accepts either multipart form data or JSON.

Multipart requests:

1. parse `payload` JSON;
2. save all uploaded files found in `$_FILES`;
3. append returned media descriptors to existing payload attachments;
4. enforce total attachment count.

Then the endpoint:

- creates an ID when absent;
- forces `recordType` to `Context.Annotation`;
- forces schema version 2;
- requires target object;
- requires non-empty string body;
- rejects body length above 80,000 bytes/characters as measured by PHP `strlen`;
- preserves supplied `createdAt` or assigns server time;
- always replaces `updatedAt` with server time;
- forces `syncState:'synced'`;
- upserts by ID.

The server does **not** currently independently validate that `targetKey` is the canonical key for the target, nor does it fully validate the target against its claimed schema.

## 31. Schema API: `server/api/schemas.php`

### Built-in discovery

`builtins()` loads every file matching `server/schemas/*.schema.json`, decodes it, and returns those with `$id`.

GET merges filesystem schemas with JSON-store schemas by `$id`, with later entries replacing earlier entries in the map.

### POST

Requires `$id`, object type, and properties. IDs under `xtratype.anchor.*` cannot be replaced. Custom schemas are wrapped in a storage record and upserted into `schemas.json`.

### DELETE

Deletes only from `schemas.json`.

This means a schema physically present in `server/schemas/` cannot actually be removed through this endpoint. In particular, the example Book schema will reappear on every GET even if a JSON-store record with that ID is deleted.

## 32. Snapshot API: `server/api/snapshots.php`

GET returns snapshots newest first and can filter by `pageKey`.

POST accepts JSON or multipart. Multipart uses the generic image-upload helper; the first uploaded file becomes `payload.screenshot`. The endpoint forces `recordType:'Revision.Snapshot'`, ensures ID and capture time, and upserts the record.

There is no DELETE endpoint and no snapshot validation beyond this basic envelope.

## 33. Event API: `server/api/events.php`

GET returns all event records. POST fills missing ID/time and upserts.

This endpoint is currently not used by the extension's sync module.

## 34. Health API: `server/api/health.php`

Returns:

```json
{
  "ok": true,
  "service": "PortaShape XtraType MVP",
  "time": "..."
}
```

This is used by Test server in extension settings.

---

# Part XII - Responsive Web/Mobile Surface

## 35. `server/index.php`

The PHP page is intentionally thin. It loads config to display the default GPS radius and produces a four-tab interface:

- Post
- Nearby
- All context
- Schemas

It also exposes the default radius to JavaScript via `window.XT_CONFIG`.

There is no server-rendered annotation data. All working data is loaded through the API from `server/assets/app.js`.

## 36. Web client: `server/assets/app.js`

The web client implements a smaller parallel version of the target and posting model without importing extension modules.

### 36.1 Schema loading

It fetches `api/schemas.php`, populates the target selector, renders the selected target form, and lists available schemas.

### 36.2 Target rendering

It supports the same four categories:

- URL
- GPS
- YouTube
- custom

The web URL UI allows query selection but not fragment handling. GPS can populate from current position. YouTube accepts URL + optional start/end seconds. Custom schemas become simple generated form controls.

### 36.3 Target-key implementation

The file contains its own compact implementation of stable custom JSON, URL key generation, GPS key generation, and YouTube key generation.

This is logically aligned with `ext/core/anchors.js` but is duplicate code. Changes to canonicalization must therefore be made carefully in both places or moved into a shared/generated contract in a later architecture.

### 36.4 Direct-to-server posting

Unlike the Chrome extension, the web/mobile client is **not local-first**. It creates the annotation in memory and POSTs directly to the server. If the request fails, there is no IndexedDB fallback queue in this client.

The author field is hard-coded to `Web user`.

### 36.5 Feed rendering

All context loads all annotations and renders author, target kind, YouTube time when present, creation date, highlighted text, body, and attachment thumbnails.

### 36.6 Nearby GPS evaluation

After geolocation succeeds, the client filters server annotations to kind `gps`, measures Haversine distance, and compares it to explicit radius or `window.XT_CONFIG.defaultGpsRadius`.

This is currently the application's complete GPS-gated discovery experience.

### 36.7 Mobile deployment caveat

The startup scripts bind PHP to `0.0.0.0:8787`, which makes LAN access possible when firewall/network settings permit it. However, actual mobile geolocation behavior depends on browser secure-context rules and deployment origin. The codebase itself does not provide HTTPS certificates or a production deployment layer. A real mobile deployment should therefore be treated as a separate hosting/security step rather than assuming that plain LAN HTTP is sufficient for every browser.

## 37. `server/assets/style.css`

The responsive surface uses a sticky header and sticky tab navigation, a maximum 760 px content column, card layout, large touch-friendly form controls, two-column field groups, horizontally scrollable image previews, and compact note cards.

The stylesheet is minified into one long source line, which is efficient enough for delivery but less comfortable to maintain by hand than the formatted extension stylesheet.

---

# Part XIII - Synchronization Semantics

## 38. Local-first means “save first, mirror second”

For full side-panel annotations, the most important reliability invariant is:

```text
local IndexedDB write succeeds
        |
        +--> user already has a durable local annotation
        |
        `--> server sync is attempted afterward
                |
                +--> success -> synced
                `--> failure -> error/pending, local copy remains
```

This is why a missing PHP endpoint or `404` does not have to become data loss.

## 39. What sync currently includes

The side panel's manual sync loop covers:

- unsynced annotations;
- image blobs required by those annotations;
- local custom schemas;
- unsynced snapshots/screenshots;
- pulling all remote annotations;
- pulling remote schemas indirectly through `loadSchemas()`.

## 40. What sync does not yet include

- pulling server snapshots into local timeline;
- local/server event synchronization;
- deletion/tombstone replication;
- edit conflict resolution;
- record revision numbers;
- per-device cursors;
- incremental/delta queries;
- identity-scoped filtering;
- selective/private sharing rules.

Therefore “sync” in v2.3 is best understood as **best-effort mirroring and merging for a single-user developer environment**, not a general distributed database protocol.

## 41. Failure behavior

### Annotation auto-sync failure

The local record remains. The full composer writes `syncState:'error'` and `syncError`.

### Quick-create auto-sync failure

The worker writes an error state and returns the local annotation rather than throwing away the creation.

### Manual sync per-item failures

Many item pushes catch and ignore individual failures so the loop can continue. The summary therefore reports successful push count, not a full per-record error ledger.

### Remote pull overwrite semantics

Pulled annotations are written locally with `syncState:'synced'`. Because records are keyed by ID and there is no revision comparison, a remote record with the same ID can replace local metadata.

---

# Part XIV - Capture and Visual Regression Internals

## 42. What “rendered-state snapshot” means here

A snapshot captures three complementary views of the page:

1. **Pixels** - what Chrome visibly rendered;
2. **Text** - body inner text after client-side rendering;
3. **HTML** - current document outer HTML after client-side modifications.

That is materially different from downloading the initial HTTP response. It can preserve information that only exists after JavaScript execution and user interaction.

## 43. Visible capture versus full-page capture

### Visible capture

Fast, low-complexity, one `captureVisibleTab` image. It captures exactly the visible browser viewport.

### Full-page capture

The side panel scrolls the document through a grid and stitches visible captures. This makes it possible to record content taller or wider than one viewport without relying on a site-provided print view.

## 44. Important full-page capture edge cases

The current algorithm does not neutralize page behavior during capture. Therefore:

- sticky headers can appear in many tiles;
- fixed chat widgets can repeat;
- lazy content may load at different moments;
- animations can make seams;
- scroll-linked effects can change content;
- infinite-scroll pages can grow while being measured;
- horizontal/vertical viewport overlap at final edges can duplicate some pixels;
- the 140 ms wait may be too short on slow sites;
- enormous canvas allocations can fail or consume substantial memory;
- cross-origin iframes are visible in pixels but their DOM contents are not available to page extraction in the same way.

These are reasons to regard the current full-page feature as an MVP capture engine rather than a forensic archival renderer.

## 45. Visual-diff interpretation

The percentage displayed is the fraction of compared pixels whose summed RGB difference exceeds 60 after both screenshots have been scaled to the chosen common dimensions.

It does **not** mean “percentage of the webpage that semantically changed.” Small font anti-aliasing changes can produce many changed pixels, while a dimension change can be partially hidden by scaling both images to a common size.

For practical regression testing, the score is a useful signal but not a verdict.

---

# Part XV - Security, Privacy, and Trust Boundaries

## 46. Browser host permissions

`<all_urls>` is intentionally broad because the core feature is to attach context to arbitrary ordinary websites. That permission should be understood as powerful: extension code can request script execution against sites the user visits.

The service worker blocks known browser-owned/protected surfaces before quick-bar injection. Chrome still remains the ultimate authority and can refuse operations.

## 47. Protected-page behavior

When `tabContext()` cannot run, the worker remembers a fallback context with `scriptAccess:false`. The side panel shows an error state rather than simply failing to open.

However, some side-panel operations such as snapshot extraction issue their own scripting calls and do not all reuse the same preflight function. On a protected page, those can still fail at operation time.

A more subtle current edge case is the URL target form: when current page parsing fails, `renderUrl()` falls back to `https://example.com/`. The panel also displays an access error, but a user could theoretically post without noticing that the target form is now the fallback example URL. A production fix should disable posting or preserve a non-scriptable page locator instead of using a real-looking example target.

## 48. Sensitive browser data

Annotations can contain selected page text and screenshots. Snapshots can contain millions of characters of rendered HTML/text. With automatic sync enabled, those values are sent to the configured PHP server.

Therefore the API base and server deployment are part of the application's privacy boundary. The current code assumes a trusted developer-controlled service.

## 49. Server exposure

The packaged startup scripts bind PHP to `0.0.0.0:8787`, not only loopback. That is useful for LAN/mobile testing but means the process can be reachable from other network devices depending on firewall configuration.

At the same time:

- CORS is `*`;
- there is no login;
- there is no authorization;
- there is no tenant partition;
- anyone who can reach the API can read/write/delete supported data.

The service must not be considered suitable for exposure to the public internet in its current form.

## 50. Upload defenses present today

Positive controls include:

- client-side MIME allowlist;
- client-side size limit;
- client-side count limit;
- server-side independent count/size checks;
- server-side MIME detection with `finfo`;
- generated disk filenames;
- sanitized display filename;
- allowed extension derived from detected MIME.

Not present today are image dimension limits, decompression-bomb analysis, malware scanning, per-user quotas, storage quotas, and lifecycle cleanup.

## 51. Output escaping

The side panel and web client HTML-escape user text before interpolating it into HTML templates in major feed paths. Quick-bar recent comments use `textContent`. YouTube popup bodies are escaped.

This is a good baseline. A hardened release should still perform a dedicated XSS review of every dynamic attribute, attachment URL, schema-driven label, and future rich-text feature.

## 52. Identity model

`author` is a display string, not an authenticated identity. The extension defaults to `Local user`; the web client uses `Web user`. The server accepts the record. Replies and annotations therefore provide attribution labels but not proof of authorship.

---

# Part XVI - Tests and Verification

## 53. Existing automated tests

`tests/anchors.mjs` verifies several foundational behaviors:

- URL default ignores query parameters;
- selected query parameter changes the URL target key;
- nearby coordinates match a 75 m GPS gate;
- YouTube range key formatting;
- custom schema normalization;
- custom required field enforcement.

The documented test commands also run JavaScript syntax checking for extension files and PHP linting for server files.

The supplied v2.3 package was re-run during this review and those tests/lints passed.

## 54. What is not automated yet

There is no automated browser integration test for:

- native side-panel opening;
- selected-text transfer;
- protected-page fallback;
- quick-bar injection/layout;
- IndexedDB persistence across extension restarts;
- actual PHP multipart sync from Chrome;
- YouTube marker positioning;
- quick reply;
- GPS browser permissions;
- full-page tile stitching;
- visual comparison correctness;
- custom schema UI generation;
- server concurrency;
- mobile responsive behavior.

For a browser-centric system, these are high-value future tests. Playwright/Puppeteer can cover ordinary pages, while extension-specific Chrome tests may need dedicated launch configuration and some YouTube behaviors may be better tested against a controlled video fixture rather than the live site.

---

# Part XVII - Known Limits, Quirks, and Technical Debt

## 55. Concise implementation-status matrix

| Area | Current state | Main limitation |
|---|---|---|
| Full Chrome Side Panel | Implemented | Browser-specific behavior still needs real-Chrome testing |
| Quick bar | Implemented | Comment-only, no attachments/advanced target editing |
| Highlight capture | Implemented | Page scripting unavailable on protected surfaces |
| URL anchors | Implemented | Fragment inclusion not fully wired through side-panel form |
| GPS anchor creation | Implemented | Extension Context Here does not geofence by current position |
| Mobile GPS Nearby | Implemented on server web client | Web client is not offline-first; secure hosting matters |
| YouTube timestamp/range model | Implemented | URL recognition and host DOM adapter are limited |
| YouTube markers | Implemented | DOM-selector fragility; broad MutationObserver |
| Custom anchors | Implemented | Partial, not full JSON Schema validation |
| Image attachments | Implemented | No cleanup/quota/dimension scan |
| IndexedDB local-first | Implemented in extension | No migrations beyond DB version 1 |
| Annotation sync | Implemented | Full pulls, no conflict/change cursor/deletion sync |
| Snapshot local timeline | Implemented | Query variants share bare-path timeline |
| Server snapshot archive | Implemented push | No snapshot pull into another extension/device |
| Visual diff | Implemented | Raw thresholded pixel diff only |
| Events | Local logging + server endpoint exist | Not connected by sync |
| Edit/delete annotations | Server delete exists | No shipped UI workflow |
| Multi-user auth/ACL | Not implemented | Development service only |

## 56. URL/query/fragment behavior to remember

- URL annotations default to bare origin/path.
- Query parameters are captured but ignored until selected/all mode is chosen.
- Snapshot grouping always uses default parsed URL behavior and therefore ignores query values.
- Core anchor code supports fragments, but the main UI does not currently carry fragment text back into `buildTarget()`.

## 57. GPS behavior to remember

- Radius may be null.
- Null means “use configured/default gate when matching,” not “zero radius.”
- Exact target keys can differ when radius differs.
- Server Nearby performs distance matching; extension Context Here does not.

## 58. YouTube behavior to remember

- Full side panel can create bare video, point, or range.
- Quick bar creates point annotations at current time.
- Bare-video comments have no timeline marker.
- Progress-bar markers are host-DOM-dependent.
- Start-time toast is second-based and can be skipped by seeking.
- Replies are stored as child annotations but not rendered as a thread in the main side-panel feed.

## 59. Schema behavior to remember

- Custom schema UI supports primitive fields and enums.
- Requiredness is enforced.
- Full JSON Schema semantics are not.
- Built-in definitions exist in two locations (extension and server), so changes can drift.
- All `server/schemas/*.schema.json` files are automatically in the server catalog, including the example Book schema.

## 60. Synchronization behavior to remember

- Full composer saves locally before networking.
- Quick create also saves locally before networking.
- Web/mobile UI posts directly to server and has no offline queue.
- Pull is all annotations, not incremental.
- Server has no authenticated ownership.
- Server upsert is last-write replacement by ID.
- Deletion is not synchronized.
- Snapshot pull is absent.
- Event sync is absent.

## 61. Capture behavior to remember

- Full-page capture is scroll-and-stitch, not a browser-native full-page compositor.
- It is capped by logical dimensions and 30 tiles.
- Captured HTML/text can be very large and is stored in server JSON when synced.
- There is no retention policy or compression for snapshot JSON.
- Visual diff is pixel-based and scales images to a common comparison size.

## 62. Resource cleanup opportunities

Several UI paths create Blob object URLs for previews and thumbnails. Not all are explicitly revoked. The browser will eventually release them when the extension page is destroyed, but a long-running side-panel session with repeated preview/render cycles can retain unnecessary memory.

Likewise, deleting a record through future UI would need a policy for deleting associated IndexedDB blobs and server media; that garbage-collection layer does not exist yet.

---

# Part XVIII - File-by-File Reference

## 63. Root files

### `README.md`

The human entry point. It states the product hierarchy, current v2.3 changes, quick-start commands, local-first storage model, built-in schema IDs, developer-security scope, and the rationale/limits of all-site access.

### `start-server.sh`

Changes to the project root and executes:

```text
php -S 0.0.0.0:8787 -t server
```

Because it uses `exec`, the shell process is replaced by PHP and signals go directly to the PHP server.

### `start-server.bat`

Windows equivalent, also binds to `0.0.0.0:8787`.

## 64. Documentation files

### `docs/ARCHITECTURE.md`

The concise architectural contract for this MVP: side panel canonical, XtraType first, quick bar optional, browser capabilities underneath, IndexedDB local-first, server continuity role, and matching semantics for URL/GPS/YouTube/custom targets.

### `docs/SCHEMAS.md`

The concise schema author guide: field meanings for URL/GPS/YouTube plus the custom object-schema example and supported primitive renderer scope.

## 65. Extension setup files

### `ext/INSTALL.txt`

Step-by-step Chrome developer-mode installation, default toolbar behavior, quick-bar launch routes, API default, site-access rationale, protected page warning, and file-URL note.

### `ext/manifest.json`

Chrome's declaration of privileged capabilities and entry points. Any permission, content-script, side-panel, or service-worker lifecycle change begins here.

## 66. Extension core files

### `ext/core/anchors.js`

Canonical anchor constructors and matching math. This is the most semantically important pure-JavaScript module because target keys affect lookup, history, deduplication expectations, and portability.

### `ext/core/db.js`

Local persistence adapter. Any future schema migration, index addition, retention rule, or IndexedDB transaction abstraction belongs here.

### `ext/core/api.js`

Extension/server transport boundary. Any future authentication headers, sync cursors, endpoint versioning, retry policy, or richer server error mapping belongs here.

### `ext/core/schemas.js`

Built-in compact definitions and custom-schema normalization. A real JSON Schema validator or generated form system would replace/extend this boundary.

## 67. Extension host file

### `ext/service-worker.js`

Privileged browser broker. This is where code should live when it needs Chrome APIs unavailable to side-panel/page contexts: tab querying, injection, context menus, side panel opening, captureVisibleTab, and routing between content scripts and persistent repositories.

## 68. Side-panel files

### `ext/sidepanel/index.html`

Static structural UI. It should remain relatively declarative; new features ideally add semantic sections/controls here rather than large inline scripts.

### `ext/sidepanel/style.css`

Narrow-panel design system and responsive behavior.

### `ext/sidepanel/app.js`

Primary application controller. It currently mixes rendering, orchestration, snapshot algorithms, sync orchestration, and schema form generation. As the project grows, this is the first file likely to benefit from decomposition into focused modules.

## 69. Content scripts

### `ext/content/page-ui.js`

Optional generic overlay. It is self-contained because it is injected as a script file into arbitrary pages. Shadow DOM is the main isolation mechanism.

### `ext/content/youtube.js`

Site-specific adapter. It should be treated as replaceable/maintainable host integration rather than as the semantic source of YouTube anchor meaning.

## 70. Server infrastructure

### `server/config.php`

Small central limits/defaults. Production-specific values should eventually move to environment configuration rather than source control.

### `server/api/bootstrap.php`

Server foundation and the main place to harden storage, authentication, validation, and upload behavior.

## 71. Server endpoints

### `server/api/annotations.php`

Annotation list/filter/upsert/delete.

### `server/api/schemas.php`

Merged built-in/custom schema catalog plus custom schema upsert/delete.

### `server/api/snapshots.php`

Snapshot list/filter/upsert with screenshot upload.

### `server/api/events.php`

Simple event list/upsert; currently disconnected from extension sync.

### `server/api/health.php`

Connectivity probe.

## 72. Web/mobile files

### `server/index.php`

Thin UI shell and default radius bootstrap.

### `server/assets/app.js`

Direct-to-server mobile/web application logic. This duplicates some core anchor semantics for independence from extension code.

### `server/assets/style.css`

Touch-friendly responsive visual layout.

## 73. Schema files

### `server/schemas/url-anchor.schema.json`

Full portable URL anchor definition including query and fragment policy.

### `server/schemas/gps-anchor.schema.json`

Coordinate/radius/label definition and default-radius metadata.

### `server/schemas/youtube-anchor.schema.json`

Video ID/URL/start/end definition.

### `server/schemas/example-book-anchor.schema.json`

Demonstrates a custom structured anchor. Because of server catalog discovery rules, it is also effectively preinstalled in this package.

## 74. Data/media files

The four JSON files begin as empty arrays. They are rewritten as whole collections on mutation. `.gitkeep` preserves the empty media directory in source packaging.

## 75. Tests

`tests/anchors.mjs` validates the pure semantic helpers that are easiest to test without a browser. `tests/README.md` documents syntax/lint commands.

---

# Part XIX - Extension Points: Where to Add the Next Thing

## 76. Adding another custom anchor without code

If the desired target can be expressed using the supported primitive form fields, create an object JSON Schema with a unique `$id`, properties, required list, and optional `x-xtratype.label/description`. Install it through the side panel or server/mobile Schemas tab.

Matching will be exact canonical JSON equality. No custom geospatial, temporal, or fuzzy resolver will be inferred automatically.

## 77. Adding a new first-class anchor with special behavior

For a target that needs custom parsing or resolution comparable to GPS/YouTube, changes would normally span:

1. server schema JSON;
2. compact built-in in `ext/core/schemas.js` if truly first-class;
3. constructor/key logic in `ext/core/anchors.js`;
4. side-panel renderer + builder;
5. service-worker matching when quick/recent behavior is needed;
6. web/mobile renderer + target/key logic;
7. tests;
8. possibly a site-specific content script.

This list shows why the architecture distinguishes ordinary custom schemas from deeply integrated anchor families.

## 78. Adding a new site adapter

A site adapter should ideally:

- keep site DOM selectors in its own content script;
- ask the service worker for portable annotations/capabilities;
- avoid inventing a site-private annotation record;
- render the same target meaning into site-native affordances;
- tolerate SPA navigation;
- fail without corrupting stored data when the host site changes.

YouTube is the current example.

## 79. Hardening synchronization

A natural evolution path would be:

1. authenticated principal/session;
2. server-assigned monotonically increasing change sequence or revision token;
3. per-record version/ETag;
4. incremental pull cursor;
5. tombstones for deletion;
6. conflict rules;
7. per-object visibility/ACL;
8. snapshot/event pull support;
9. media lifecycle management.

The current JSON-file API can be evolved incrementally, but large-scale multi-user sync will eventually outgrow whole-collection rewrites.

## 80. Improving capture

The next generation of full-page capture could add:

- capture-time hiding/restoration of fixed elements;
- configurable settle delay;
- lazy-load stabilization pass;
- animation pause;
- overlap-aware stitching;
- canvas-size preflight;
- chunked output for very large pages;
- DOM/screenshot element correspondence;
- mask rules for volatile regions;
- recipe steps such as click/hover/expand/wait before snapshot.

These improvements belong above the same snapshot record model rather than requiring a new storage model.

## 81. Improving comparison

A richer regression engine could preserve the current pixel score while adding:

- dimension-change reporting;
- threshold controls;
- perceptual color distance;
- anti-aliasing tolerance;
- region masks;
- text diff;
- DOM summary diff;
- extracted-field diff;
- baseline selection rather than only newest two;
- pass/fail policy separated from raw measurements.

---

# Part XX - Troubleshooting by Symptom

## 82. XT button opens nothing or the wrong UI

Check:

1. extension was reloaded after manifest/service-worker changes;
2. Chrome version is at least the manifest minimum;
3. service worker has run and `openPanelOnActionClick` has been applied;
4. the extension is not disabled;
5. side panel is supported/enabled in that Chrome profile.

The toolbar action has no popup; its intended behavior is the native side panel.

## 83. “Cannot access contents of URL”

v2.3 requests `<all_urls>`, but Chrome-owned pages remain protected. Ordinary sites should also have Extension details -> Site access set appropriately. Local `file://` pages require Chrome's separate Allow access to file URLs setting.

## 84. Highlighted text is missing

The service worker captures `getSelection().toString()` from the active page when the side panel asks for context or when the quick bar is injected. Possible causes include protected pages, selection inside contexts that do not expose normal document selection, a changed active tab, or selection being cleared before context capture.

The maximum captured selection is 10,000 characters.

## 85. Annotation saved but server says 404/offline

The side-panel workflow should still have the local IndexedDB record. Check API base in Settings, Test server, and run the PHP service. Then use Sync now.

## 86. Images do not upload

Verify:

- at most three;
- each <= 8 MiB;
- actual MIME detected as PNG/JPEG/WebP;
- PHP upload limits (`upload_max_filesize` / `post_max_size`) are not lower than the application limit;
- server/media is writable.

The last PHP configuration limits are deployment concerns and are not set by this repository.

## 87. GPS Nearby is empty

Nearby is server/mobile logic. It needs:

- GPS annotations on the server;
- permission to read location;
- a browser/deployment context in which geolocation is allowed;
- device coordinates inside the explicit/default radius.

## 88. YouTube markers are missing

Check:

- URL yields the expected video ID;
- annotations exist for that ID;
- annotations have a start time (bare-video notes have no marker);
- the YouTube player exposes one of the expected progress-bar selectors;
- the content script loaded after extension reload.

## 89. Full-page capture looks duplicated

Fixed/sticky content is the most likely reason. The current algorithm scrolls and captures; it does not temporarily restyle the page to remove fixed layers.

## 90. Timeline does not contain server snapshots from another device

That is expected in v2.3. Snapshots are pushed to the server but not pulled back into IndexedDB by the extension.

## 91. A custom schema installs but constraints are not enforced

Only a limited subset is interpreted. Required fields and basic primitive rendering are supported; this is not a general JSON Schema validation engine.

---

# Part XXI - API Reference

## 92. `GET /api/health.php`

Response contains `ok`, service name, and server UTC time.

## 93. `/api/annotations.php`

### GET

Optional query parameters:

- `id`
- `videoId`
- `targetKey`

### POST JSON

Body is an annotation object.

### POST multipart

Fields:

- `payload`: JSON annotation string;
- `images[]`: zero to three image files.

### DELETE

`?id=<annotation-id>`

## 94. `/api/schemas.php`

### GET

Returns merged filesystem and JSON-store schema catalog.

### POST

```json
{"schema": {"$id":"...","type":"object","properties":{}}}
```

The wrapper is optional; the schema itself may be the JSON body.

### DELETE

`?id=<custom-schema-id>`

Only JSON-store entries are deletable.

## 95. `/api/snapshots.php`

### GET

Optional `pageKey` filter.

### POST

JSON snapshot, or multipart with:

- `payload`
- `screenshot`

## 96. `/api/events.php`

GET all; POST one event object.

---

# Part XXII - Internal Message Reference

## 97. Page/side-panel -> service worker

### `xtratype:getContext`

No required fields. Returns active-tab context and tab ID.

### `xtratype:openQuickBar`

Injects quick UI into active/sender tab if scriptable.

### `xtratype:openSidePanel`

Opens the panel for sender/active tab.

### `xtratype:quickCreate`

Payload includes body, highlighted text, page URL/title, and optional video time.

### `xtratype:getRecentContextAnnotations`

Fields: `pageUrl`, `limit`.

### `xtratype:getYouTubeAnnotations`

Field: `videoId`.

### `xtratype:quickReply`

Fields: `annotationId`, `body`.

### `xtratype:scrollTo`

Fields: `tabId`, `x`, `y`.

### `xtratype:captureVisible`

Optional `windowId`.

### `xtratype:pageExtract`

Field: `tabId`.

## 98. Service worker/side panel -> YouTube content script

### `xtratype:refresh`

Tells the YouTube adapter to refetch annotations and redraw markers.

---

# Part XXIII - Data Store Reference

## 99. IndexedDB `annotations`

Key path: `id`  
Indexes: `targetKey`, `createdAt`

Contains local and synchronized annotation metadata.

## 100. IndexedDB `blobs`

Key path: `id`

Contains image attachments and snapshot PNGs as Blob values plus type/size/name metadata.

## 101. IndexedDB `schemas`

Key path: `id`

Contains custom schema wrappers such as `{id, schema, updatedAt}`.

## 102. IndexedDB `snapshots`

Key path: `id`  
Index: `pageKey`

Contains rendered-state snapshot metadata and screenshot Blob references.

## 103. IndexedDB `events`

Key path: `id`

Contains lightweight local event records.

## 104. Server JSON collections

Each server collection is a JSON array rewritten atomically on mutation. The current design favors inspectability and simplicity over scale.

---

# Part XXIV - Practical Maintenance Rules

## 105. If you change target-key semantics

Update and test every implementation that computes or compares keys. At minimum:

- `ext/core/anchors.js`
- `server/assets/app.js`
- any service-worker page-matching logic
- unit tests
- documentation/schema contracts

Existing stored records may require migration if their key meaning changes.

## 106. If you change annotation shape

Coordinate:

- extension creation paths (full + quick + reply);
- side-panel feed renderer;
- server annotation POST normalization;
- web client creation/rendering;
- sync wire handling;
- export expectations;
- schema version number/migration policy.

## 107. If you change image limits

Change both client and server limits. The current values are duplicated in JavaScript and PHP by design for independent enforcement.

## 108. If you add authentication

Do not merely add a login page. Authentication affects:

- API client headers/tokens;
- CORS policy;
- record ownership;
- server filtering;
- media URLs;
- sync conflicts;
- web/mobile session handling;
- author identity;
- deletion authorization;
- sharing/visibility semantics.

## 109. If you make the mobile client local-first

The cleanest conceptual path is to give it an IndexedDB repository and outbound queue comparable to the extension, while preserving the same portable annotation/target contracts. It should not invent a second “mobile annotation” record type.

## 110. If you split `sidepanel/app.js`

A logical decomposition would be:

```text
sidepanel/context.js
sidepanel/composer.js
sidepanel/feed.js
sidepanel/capture.js
sidepanel/compare.js
sidepanel/schema-ui.js
sidepanel/settings.js
```

Keep `core/anchors.js`, `core/db.js`, `core/api.js`, and `core/schemas.js` host-neutral within the extension. The side-panel files should orchestrate them, not duplicate their semantics.

---

# Part XXV - Glossary

## 111. Anchor

A structured description of the thing or region of meaning to which an annotation is attached.

## 112. Target key

A deterministic string derived from an anchor and used for exact/context lookup. It is not a replacement for the structured anchor itself.

## 113. Bare URL

Origin + pathname without query or fragment in the current URL model.

## 114. GPS gate

The radius around stored coordinates within which a consumer considers a GPS annotation applicable.

## 115. Bare video

A YouTube target with video ID but no start/end time.

## 116. Timestamp annotation

YouTube target with start time and no end time.

## 117. Time-range annotation

YouTube target with both start and end time.

## 118. Local-first

The extension commits the user's record to IndexedDB before depending on a server request.

## 119. Sync state

The extension's local label describing server-mirroring status: `local`, `pending`, `synced`, or `error`.

## 120. Snapshot

An immutable observed browser state containing image plus rendered-page metadata/text/HTML.

## 121. Provider/host boundary

The idea that browser-only operations remain in the browser and server-only durability remains on the server, connected through explicit messages/data rather than pretending every operation can run anywhere.

---

# Part XXVI - Final Architectural Reading

## 122. What the codebase proves

The current MVP demonstrates a coherent vertical slice rather than just disconnected demos:

- one annotation envelope can attach context to URL, GPS, YouTube time, or custom structured targets;
- browser context can prefill that annotation without making the server a DOM proxy;
- selected text and image attachments can be preserved alongside comments;
- YouTube time anchors can be rendered back into the host experience as timeline markers and playback notifications;
- GPS anchors can be resolved against a live device position in the mobile/web surface;
- extension data can survive server failures because the primary extension write is local;
- rendered page states can be captured as immutable revisions and compared later;
- the same PHP service can remain inspectable and framework-free while providing enough API surface for continuity.

## 123. What it deliberately does not prove yet

It is not yet a hardened multi-user collaboration platform, a complete JSON Schema engine, a conflict-free distributed database, a forensic web archiver, or a general browser automation runtime. The code contains seeds for several of those directions, but the present implementation stays small.

That distinction is important for maintenance: new capabilities should preserve the strengths of the current model instead of disguising missing production infrastructure behind increasingly complex UI.

## 124. The most important invariants to preserve

As the application grows, the following principles are worth treating as non-negotiable unless deliberately redesigned:

1. **XtraType stays semantically above capture/storage mechanics.** Users are attaching context to things, not “editing database rows.”
2. **Targets stay structured.** Never reduce GPS, time ranges, or custom objects to arbitrary strings just because a key exists.
3. **The target key is derived, not the source of truth.** Keep the full anchor record.
4. **Browser-only state is collected by the browser host.** Do not make the server pretend it can see the active DOM.
5. **Extension writes remain local-first when practical.** A temporary server failure should not erase the user's act of annotation.
6. **Snapshots are immutable observations.** Recapture should create history.
7. **Server storage remains a mirror/continuity layer until identity, authority, and conflict rules are explicitly added.**
8. **Site integrations such as YouTube remain adapters.** Host markup can change without invalidating the portable annotation model.
9. **Custom schemas extend target vocabulary without automatically granting custom execution semantics.**
10. **Production security must be added deliberately, not implied by the developer MVP.**

---

# Appendix A - Current Source Metrics

| File | Approx. lines | Role |
|---|---:|---|
| `ext/sidepanel/app.js` | 168 | Main side-panel controller |
| `ext/content/page-ui.js` | 235 | Injected quick bar |
| `ext/service-worker.js` | 216 | Browser broker/message router |
| `server/api/bootstrap.php` | 155 | JSON filesystem + upload infrastructure |
| `ext/sidepanel/index.html` | 154 | Primary UI structure |
| `README.md` | 92 | Package overview |
| `ext/core/anchors.js` | 83 | Anchor semantics |
| `ext/core/db.js` | 78 | IndexedDB repository |
| `ext/content/youtube.js` | 58 | YouTube integration |
| `ext/core/schemas.js` | 53 | Built-ins/custom schema rules |
| `server/api/annotations.php` | 47 | Annotation endpoint |
| `ext/core/api.js` | 43 | Server sync client |
| `ext/manifest.json` | 41 | Chrome declaration |
| `ext/sidepanel/style.css` | 35 | Panel styling |
| `server/api/schemas.php` | 32 | Schema endpoint |
| `server/assets/app.js` | 23 physical/minified lines | Web/mobile behavior |
| `server/api/snapshots.php` | 22 | Snapshot endpoint |
| `server/index.php` | 19 | Web/mobile shell |
| other schemas/tests/scripts | small | Contracts, tests, launch helpers |

Line counts are approximate physical source lines; minified files contain multiple functions on individual lines.

---

# Appendix B - Recommended Reading Order for New Developers

A new maintainer can understand the system fastest in this order:

1. `README.md`
2. `docs/ARCHITECTURE.md`
3. `docs/SCHEMAS.md`
4. `ext/manifest.json`
5. `ext/core/anchors.js`
6. `ext/core/db.js`
7. `ext/core/api.js`
8. `ext/service-worker.js`
9. `ext/sidepanel/index.html`
10. `ext/sidepanel/app.js`
11. `ext/content/page-ui.js`
12. `ext/content/youtube.js`
13. `server/api/bootstrap.php`
14. each PHP endpoint
15. `server/index.php` + `server/assets/app.js`
16. schema JSON files
17. tests

This sequence moves from meaning, to storage/contracts, to privileged browser mechanics, to UI orchestration, and finally to the server mirror.

---

# Appendix C - Review Notes for v2.3

During preparation of this reference, the supplied code was inspected file by file and the existing anchor/schema unit test, extension JavaScript syntax checks, and PHP lint checks were run successfully. No source files were modified for this documentation.

The most significant issues worth tracking for a next release are:

- fully wire URL fragment capture/editing;
- prevent fallback `example.com` targeting on unscriptable pages;
- add extension-side GPS-nearby resolution if desired;
- debounce/target the YouTube MutationObserver;
- add close/outside-click behavior to interactive YouTube cards;
- pull snapshots from the server or explicitly label snapshot sync as upload-only;
- connect or remove the unused server event endpoint;
- implement full custom-schema validation or clearly formalize the supported subset;
- centralize duplicated built-in schema and target-key semantics;
- add edit/delete/reply-thread UI;
- revoke Blob object URLs and add blob/media garbage collection;
- add authentication/authorization before any public deployment;
- change production CORS from wildcard;
- add pagination/change cursors before collections become large;
- add snapshot retention/compression because rendered HTML/text can make JSON files large;
- strengthen full-page capture against sticky elements, animation, and large-canvas memory pressure;
- expand automated browser integration coverage.

---

**End of reference.**
