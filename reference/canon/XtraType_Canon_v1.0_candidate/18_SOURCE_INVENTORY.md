# XtraType — Complete source and interface inventory

**Canon edition:** 1.0 approval candidate · **Baseline:** supplied v2.3 / extension 2.3.0 · **Audit date:** 2026-10-01

## Inventory rules

Every file in the supplied code archive is indexed below, including packaged documentation and initially empty data collections. Paths are relative to its root, preserved in [evidence/baseline](evidence/baseline/). Line counts are physical lines, not logical complexity; the web controller and CSS contain long compressed lines. SHA-256 values in the machine manifest identify exact bytes. The month directory `server/media/2026-10/` is empty in the supplied ZIP; its name is not a media record or proof of upload activity.

| Path | Bytes | Lines | Concern | Responsibility |
|---|---:|---:|---|---|
| [README.md](evidence/baseline/README.md) | 4586 | 92 | C-10 | Legacy product/setup description; historical intent, not new canon |
| [docs/ARCHITECTURE.md](evidence/baseline/docs/ARCHITECTURE.md) | 2882 | 63 | C-10 | Legacy v2.2 hierarchy/local-first/host boundary narrative |
| [docs/SCHEMAS.md](evidence/baseline/docs/SCHEMAS.md) | 1547 | 49 | C-02 | Legacy target and custom-schema guide |
| [ext/INSTALL.txt](evidence/baseline/ext/INSTALL.txt) | 1341 | 33 | C-10 | Unpacked Chrome installation and site-access instructions |
| [ext/content/page-ui.js](evidence/baseline/ext/content/page-ui.js) | 11459 | 235 | C-04 | On-demand Shadow DOM quick composer and recent context |
| [ext/content/youtube.js](evidence/baseline/ext/content/youtube.js) | 5380 | 58 | C-09 | YouTube marker/card/toast projection and DOM/navigation observation |
| [ext/core/anchors.js](evidence/baseline/ext/core/anchors.js) | 4435 | 83 | C-01 | Pure anchor constructors, key algorithms, URL recognition and geographic matching |
| [ext/core/api.js](evidence/baseline/ext/core/api.js) | 2378 | 43 | C-06 | Settings and extension HTTP/multipart serialization/merge |
| [ext/core/db.js](evidence/baseline/ext/core/db.js) | 2717 | 78 | C-05 | Five-store IndexedDB repository, ID/Blob/event helpers |
| [ext/core/schemas.js](evidence/baseline/ext/core/schemas.js) | 2721 | 53 | C-02 | Compact built-ins, shallow schema normalization/value presence validation |
| [ext/manifest.json](evidence/baseline/ext/manifest.json) | 902 | 41 | C-03 | MV3 permissions, version, worker/panel/content entry points |
| [ext/service-worker.js](evidence/baseline/ext/service-worker.js) | 10727 | 216 | C-03 | Browser broker, runtime router, quick creation/replies and contextual reads |
| [ext/sidepanel/app.js](evidence/baseline/ext/sidepanel/app.js) | 25185 | 168 | C-04 | Panel form/feed/schema/settings orchestration plus capture/diff/sync |
| [ext/sidepanel/index.html](evidence/baseline/ext/sidepanel/index.html) | 6829 | 154 | C-04 | Primary UI shell, form controls and supporting details modules |
| [ext/sidepanel/style.css](evidence/baseline/ext/sidepanel/style.css) | 8000 | 35 | C-04 | Panel-specific narrow responsive layout, focus/access states |
| [server/api/annotations.php](evidence/baseline/server/api/annotations.php) | 2451 | 47 | C-07 | Annotation GET/filter/POST/DELETE normalization and persistence |
| [server/api/bootstrap.php](evidence/baseline/server/api/bootstrap.php) | 6544 | 155 | C-07 | HTTP envelopes/CORS, file locks/collections and media uploads |
| [server/api/events.php](evidence/baseline/server/api/events.php) | 440 | 10 | C-07 | Unconnected event GET/POST endpoint |
| [server/api/health.php](evidence/baseline/server/api/health.php) | 122 | 3 | C-07 | Health response without non-OPTIONS method guard |
| [server/api/schemas.php](evidence/baseline/server/api/schemas.php) | 1530 | 32 | C-02 | Disk+stored schema catalog and custom POST/DELETE |
| [server/api/snapshots.php](evidence/baseline/server/api/snapshots.php) | 1108 | 22 | C-07 | Snapshot GET/filter/POST and first-upload screenshot reference |
| [server/assets/app.js](evidence/baseline/server/assets/app.js) | 11219 | 23 | C-04 | Web target forms/post/feed/Nearby/schema install; duplicated domain logic |
| [server/assets/style.css](evidence/baseline/server/assets/style.css) | 2874 | 1 | C-04 | Web responsive sticky header/tabs/cards/form styles |
| [server/config.php](evidence/baseline/server/config.php) | 206 | 7 | C-07 | Upload/CORS/GPS defaults; no deployment environment abstraction |
| [server/data/annotations.json](evidence/baseline/server/data/annotations.json) | 3 | 1 | C-07 | Packaged empty annotation collection; runtime mutable |
| [server/data/events.json](evidence/baseline/server/data/events.json) | 3 | 1 | C-07 | Packaged empty event collection |
| [server/data/schemas.json](evidence/baseline/server/data/schemas.json) | 3 | 1 | C-07 | Packaged empty custom-schema wrapper collection |
| [server/data/snapshots.json](evidence/baseline/server/data/snapshots.json) | 3 | 1 | C-07 | Packaged empty snapshot collection |
| [server/index.php](evidence/baseline/server/index.php) | 2667 | 19 | C-04 | Responsive web shell and config injection |
| [server/media/.gitkeep](evidence/baseline/server/media/.gitkeep) | 0 | 0 | C-07 | Zero-byte media-directory packaging placeholder; no behavior |
| [server/schemas/example-book-anchor.schema.json](evidence/baseline/server/schemas/example-book-anchor.schema.json) | 453 | 13 | C-02 | Automatically served custom Book vocabulary: isbn/page/edition |
| [server/schemas/gps-anchor.schema.json](evidence/baseline/server/schemas/gps-anchor.schema.json) | 591 | 14 | C-02 | Fuller GPS vocabulary; bounds/radius/label constraints |
| [server/schemas/url-anchor.schema.json](evidence/baseline/server/schemas/url-anchor.schema.json) | 962 | 26 | C-02 | Fuller URL vocabulary; not automatically enforced |
| [server/schemas/youtube-anchor.schema.json](evidence/baseline/server/schemas/youtube-anchor.schema.json) | 559 | 14 | C-02 | Fuller video vocabulary with ID regex and nullable times |
| [start-server.bat](evidence/baseline/start-server.bat) | 90 | 4 | C-10 | Windows launcher; cd project and run PHP on all interfaces |
| [start-server.sh](evidence/baseline/start-server.sh) | 122 | 5 | C-10 | POSIX launcher; cd project and exec PHP on all interfaces |
| [tests/README.md](evidence/baseline/tests/README.md) | 177 | 7 | C-10 | Legacy commands for anchor tests, JS syntax and PHP lint |
| [tests/anchors.mjs](evidence/baseline/tests/anchors.mjs) | 1064 | 16 | C-10 | Six pure anchor/schema assertion calls; no browser/server integration |

## Direct JavaScript imports

This is the complete static import dependency list. Content IIFEs and web app use browser globals, not extension module imports.

| Importing file | Imported symbols | Module |
|---|---|---|
| `ext/core/api.js` | `get, put` | `./db.js` |
| `ext/service-worker.js` | `all, get, id, put, logEvent` | `./core/db.js` |
| `ext/service-worker.js` | `parseUrlTarget, makeYoutubeTarget, youtubeInfo, targetKey` | `./core/anchors.js` |
| `ext/service-worker.js` | `settings, syncAnnotation, pullAnnotations` | `./core/api.js` |
| `ext/sidepanel/app.js` | `all, byIndex, get, put, remove, addBlob, id, logEvent` | `../core/db.js` |
| `ext/sidepanel/app.js` | `BUILTIN, normalizeCustomSchema, validateCustomValue` | `../core/schemas.js` |
| `ext/sidepanel/app.js` | `parseUrlTarget, makeGpsTarget, makeYoutubeTarget, targetKey, youtubeInfo, gpsMatches` | `../core/anchors.js` |
| `ext/sidepanel/app.js` | `settings, saveSettings, syncAnnotation, pullAnnotations, pullSchemas, pushSchema, syncSnapshot, serverHealth` | `../core/api.js` |

## Runtime entry and persistent identifier index

| Identifier | Location / role |
|---|---|
| `service-worker.js` | Manifest module background; install/startup/messages |
| `sidepanel/index.html` | Manifest default panel; module app.js |
| `content/youtube.js` | Automatic www YouTube document_idle IIFE |
| `content/page-ui.js` | Worker-injected generic IIFE |
| `server/index.php` | Web shell → assets/app.js |
| `portashape-xtratype`, version 1 | IndexedDB compatibility identity |
| `annotations`, `blobs`, `schemas`, `snapshots`, `events` | IDB store names |
| `targetKey`, `createdAt`, `pageKey` | IDB secondary indexes |
| `xtratypeSettings` | Chrome local storage |
| `xtratypeLastContext` | Chrome session storage |
| `xtratype-panel`, `xtratype-quick` | Context-menu IDs |
| `xtratype-host` | Generic overlay DOM root |
| `xt-youtube-markers` | Adapter marker-root CSS class |
| `XT_CONFIG.defaultGpsRadius` | Web PHP→JS runtime configuration |
| `Context.Annotation`, `Revision.Snapshot` | Record types |
| `annotation`, `attachment`, `blob`, `snapshot`, `event`, `media` prefixes | Identifier families |
| `annotation.created` | Only current local event type |
| `X-XtraType-Client:chrome-extension` | Annotation-upload identifying header, not authentication |

## Static DOM identifier inventory

Dynamic target-field IDs and runtime handlers follow below; source files remain the exact markup authority.

### `ext/sidepanel/index.html`

`launch-quick-bar`, `refresh-context`, `context-title`, `context-url`, `xt-heading`, `sync-pill`, `composer`, `target-kind`, `target-fields`, `highlighted-text`, `comment`, `images`, `image-previews`, `clear-composer`, `composer-status`, `pull-annotations`, `annotation-list`, `capture-visible`, `capture-full`, `capture-status`, `latest-snapshot`, `compare-latest`, `snapshot-list`, `compare-card`, `diff-score`, `diff-canvas`, `schema-file`, `schema-status`, `schema-list`, `settings-form`, `api-base`, `author`, `gps-radius`, `auto-sync`, `test-server`, `settings-status`, `export-local`.

### `server/index.php`

`locate`, `tab-post`, `post-form`, `target-kind`, `target-fields`, `highlighted`, `body`, `images`, `previews`, `post-status`, `tab-nearby`, `location-state`, `nearby-list`, `tab-feed`, `refresh`, `feed`, `tab-schemas`, `schema-file`, `schema-status`, `schemas`.

## Generated field identifiers

`ext/sidepanel/app.js`: `gps-label`, `gps-lat`, `gps-lon`, `gps-r`, `query-list`, `url-base`, `url-extract`, `url-fragment-mode`, `url-query-mode`, `use-location`, `yt-clear-time`, `yt-end`, `yt-id`, `yt-start`, `yt-url`, `yt-use-now`.

`server/assets/app.js`: `g-here`, `g-label`, `g-lat`, `g-lon`, `g-r`, `parse-url`, `u-mode`, `u-params`, `u-url`, `y-end`, `y-start`, `y-url`.

## Direct bound-control inventory

Bindings point to functions documented in document 19; inline closures are described by surface/workflow in documents 07–12.

| File | Control / event | Source line |
|---|---|---:|
| `ext/sidepanel/app.js` | `target-kind.onchange` | 155 |
| `ext/sidepanel/app.js` | `refresh-context.onclick` | 155 |
| `ext/sidepanel/app.js` | `pull-annotations.onclick` | 155 |
| `ext/sidepanel/app.js` | `launch-quick-bar.onclick` | 156 |
| `ext/sidepanel/app.js` | `composer.onsubmit` | 157 |
| `ext/sidepanel/app.js` | `clear-composer.onclick` | 158 |
| `ext/sidepanel/app.js` | `images.onchange` | 159 |
| `ext/sidepanel/app.js` | `capture-visible.onclick` | 160 |
| `ext/sidepanel/app.js` | `capture-full.onclick` | 161 |
| `ext/sidepanel/app.js` | `compare-latest.onclick` | 162 |
| `ext/sidepanel/app.js` | `schema-file.onchange` | 163 |
| `ext/sidepanel/app.js` | `settings-form.onsubmit` | 164 |
| `ext/sidepanel/app.js` | `test-server.onclick` | 165 |
| `ext/sidepanel/app.js` | `export-local.onclick` | 166 |
| `server/assets/app.js` | `parse-url.onclick` | 10 |
| `server/assets/app.js` | `g-here.onclick` | 10 |
| `server/assets/app.js` | `target-kind.onchange` | 22 |
| `server/assets/app.js` | `locate.onclick` | 22 |
| `server/assets/app.js` | `refresh.onclick` | 22 |
| `server/assets/app.js` | `post-form.onsubmit` | 22 |
| `server/assets/app.js` | `images.onchange` | 22 |
| `server/assets/app.js` | `schema-file.onchange` | 22 |

## Constants and duplicated policy inventory

| Policy | Current location/value | Coordination requirement |
|---|---|---|
| Default GPS radius | anchors.js 75; api.js settings 75; compact/disk GPS metadata 75; PHP config 75 | Scope consumer defaults explicitly; panel setting presently unused for nearby |
| Max image count/size/types | Both UI controllers and PHP config/helper; 3 / 8 MiB / PNG JPEG WebP | Validate on server, keep UIs aligned; JSON-only gap must be fixed |
| Selection/quote | worker/quick slice 10000; panel/web maxlength 10000 | Units and message/direct-API enforcement differ |
| Comment | panel/web maxlength 20000; PHP strlen limit 80000 | Quick/message paths not equivalently bounded |
| Snapshot extraction | worker HTML 5m/text 2m | Version truncation/fidelity metadata |
| Full capture | panel 14000/DPR × 28000/DPR, max30 tiles, wait140ms | Separate coverage, memory and rate policies |
| Compare | panel 1800×12000 max, RGB sum >60 | Version algorithm and compatibility |
| Feed limits | panel50, quick requests4/worker1–10, web/video unbounded | Pagination/scalability contract |
| YouTube polling/toast | adapter 700ms / 4500ms | Lifecycle/seek/simultaneous-note policy |
| Geolocation | panel/web highAccuracy, timeout10000ms | Permissions, freshness/accuracy policy |
| API/server ports | settings localhost8787/api; scripts0.0.0.0:8787 | Destination/security distinction |
| Reserved vocabulary | `xtratype.anchor.*` in JS/PHP installs | Kind metadata and remote-cache validation still needed |

## Not present in the source inventory

No package.json/lockfile, Composer manifest, build config, SQL migrations, service worker for the web app, userscript registry, AGENTS.md, license, CI workflow or automated browser suite. No hidden external dependency is inferred from their absence. External platform dependencies are Chrome APIs, browser DOM/Canvas/IndexedDB/Fetch/Geolocation and PHP standard/Fileinfo/filesystem capabilities.
