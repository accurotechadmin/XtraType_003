# PortaShape XtraType SidePanel MVP v2.3 — Full Feature & Product Rundown

## Scope

This report summarizes the `PortaShape_XtraType_SidePanel_MVP_v2.3` source package as reviewed at the source-code level.

The application is best understood as a **local-first contextual annotation and web-state capture system**. XtraType allows a user to attach comments, quoted text, images, and structured context to a URL, physical place, YouTube moment or range, or an arbitrary JSON-schema-defined object. Around that annotation core is a lightweight page-revision system for snapshots, historical timelines, and visual comparison.

The package contains a **Manifest V3 Chrome extension** and a small **PHP/JSON companion service**. It is deliberately dependency-light: there is no npm application framework, no Composer package tree, no SQL database, and no front-end framework such as React, Vue, or Angular.

---

## 1. What Is Actually in the Application

| Product surface | Role |
|---|---|
| **XtraType Chrome Side Panel** | Primary/full workspace |
| **Floating Quick Comment Bar** | Lightweight page-level annotation UI |
| **YouTube integration** | Time-linked markers, popups, replies |
| **Capture / Revision system** | Visible and full-page rendered-state snapshots |
| **Timeline & Compare** | Snapshot history and visual pixel comparison |
| **Anchor Schema system** | URL, GPS, YouTube, and extensible custom targets |
| **Local IndexedDB repository** | Primary/local-first storage |
| **PHP sync/archive service** | Optional persistence and cross-client continuity |
| **Responsive web/mobile UI** | Browser/mobile access to annotations, GPS context, schemas |
| **JSON/media repository** | Server-side storage without a database |

There are **no commercial packages, pricing tiers, subscriptions, billing plans, premium editions, or feature-gated offerings** in this build. “Package” here refers to the software bundle and its functional modules.

---

## 2. Main XtraType Side Panel

The Chrome Side Panel is the primary product surface.

Clicking the **XT toolbar icon** opens Chrome's native Side Panel. It does **not** automatically inject the floating quick bar.

The panel begins with a persistent header containing:

- XT/XtraType branding
- **Open Quick Bar**
- **Refresh Context**

Immediately below is a live **current context strip** showing the active page title and URL. The implementation also detects protected browser pages where Chrome does not permit injection or access and surfaces that limitation to the user.

The principal Side Panel modules are:

1. **XtraType**
2. **Context Here**
3. **Capture**
4. **Timeline & Compare**
5. **Anchor Schemas**
6. **Settings**

---

## 3. XtraType Annotation Composer

The composer is the core authoring surface.

An annotation contains:

- A structured target
- A deterministic target key
- Optional highlighted/quoted text
- A required comment/body
- Optional image attachments
- Author information
- Creation/update timestamps
- Synchronization state
- Optional parent annotation reference for reply-style relationships

### Target Selector

The **Attach to** selector exposes native target classes:

| Anchor | Meaning |
|---|---|
| **URL** | A page or configurable variation of a page |
| **GPS** | Latitude/longitude with optional geographic radius |
| **YouTube** | Whole video, timestamp, or time range |
| **Custom Schema** | A structured object defined through supported JSON Schema |

When the companion PHP server is active, the bundled `example.anchor.book@1` schema is also returned from the schema endpoint and therefore becomes available to clients automatically.

---

## 4. URL Annotation Package

URL anchors are more capable than a simple exact-URL comment system.

A URL target is decomposed into:

- Origin and path
- Query parameters
- Query matching policy
- Query values
- Fragment policy
- A normalized/canonical target key

The application supports three query modes:

1. **Ignore all**
2. **Use selected variables**
3. **Use all variables**

The composer can parse a URL and turn its query parameters into editable rows through **Extract variables from URL**.

This means two visually related URLs can intentionally resolve as either the same target or different targets based on selected query semantics.

### Fragment behavior

The target model and matching logic support fragment inclusion or exclusion. However, the current Side Panel UX exposes this less cleanly than the underlying model. The active-page “Bare URL” is normalized without the fragment and there is no dedicated fragment text field, so fragment-based targeting is supported architecturally but not fully surfaced in the authoring interface.

---

## 5. GPS / Location Annotation Package

GPS targets contain:

- Latitude
- Longitude
- Optional radius
- Optional human-readable label

The composer includes **Use my location**, which invokes browser geolocation and fills coordinates.

The default geographic matching radius is **75 meters** when no explicit radius is provided.

Distance is calculated with the **Haversine formula**, which makes the matching logic suitable for real geographic distance rather than approximate coordinate-delta comparison.

### Important behavior split

The responsive server/mobile UI has a true **Nearby GPS Context** experience: it determines the user’s position and checks which GPS annotation radii contain that position.

The Chrome Side Panel has the supporting geographic matching function in code, but its primary “Context Here” feed currently works mainly by target-key resolution rather than fully applying the same nearby-radius discovery model.

---

## 6. YouTube Package

YouTube is one of the most specialized and mature integrations in the package.

A YouTube annotation can represent:

| Form | Data |
|---|---|
| Whole video | Video ID |
| Timestamp | Video ID + start second |
| Time range | Video ID + start + end |

The extension recognizes common YouTube URL formats, including:

- Standard watch URLs
- `youtu.be` links
- Shorts URLs

When the current page is recognized as YouTube, the composer can default to a YouTube target and obtain the current playback position.

Controls include:

- **Use current time**
- **Bare video**

### In-player behavior

A dedicated YouTube content script renders time-based annotations into the player experience.

Implemented behavior includes:

- Progress-bar markers
- Wider markers for time ranges
- Hover comments
- Marker click cards
- Quick Reply
- **Open XtraType**
- Timed playback notification/toast when playback reaches an annotation start time

Replies are represented through `parentAnnotationId`, giving the data model the beginnings of threaded discussion.

The result is effectively a **time-coded discussion layer for YouTube video**.

---

## 7. Highlighted-Text Capture

The extension captures the user's selected page text when it can access the active page.

The captured selection is limited to approximately **10,000 characters**.

Selected text is copied into the annotation composer's highlighted-text field and stored separately from the comment body.

This distinction is important: the data model preserves both:

- The thing being quoted or referenced
- The user's commentary about it

The same basic pattern is reused in the quick bar and annotation feeds.

---

## 8. Image Attachments

Full-panel annotations support up to **three images**.

Accepted formats:

- PNG
- JPEG
- WebP

Per-image maximum size:

- **8 MiB**

The Side Panel provides previews and allows individual selected images to be removed before submission.

Locally, image binary data is stored as an IndexedDB Blob and the annotation holds a Blob reference.

During synchronization, the associated Blob is uploaded to the PHP server, which stores media beneath date-oriented directories.

The PHP side performs MIME checking using `finfo`, rather than trusting only the browser-provided MIME type or file extension.

---

## 9. Context Here Feed

The **Context Here** section displays annotations relevant to the active target.

Rendered metadata includes:

- Author
- Target type
- YouTube timing when applicable
- Sync state
- Highlighted/quoted text
- Comment body
- Image thumbnails

The Side Panel limits the rendered local result set to roughly **50 matching annotations**.

For YouTube, same-video annotations may be considered contextually related even if timestamps differ.

The **Sync now** action performs annotation synchronization and also attempts to push pending schemas and snapshots.

---

## 10. Optional Quick Comment Bar

The Quick Comment Bar is a secondary, lower-friction authoring mode.

It can be opened from:

- The Side Panel header
- The page right-click context menu

The bar is injected into the current page and isolated with a **Shadow DOM**, reducing CSS interference from the host site.

It contains:

- Comment input
- Current context summary
- Highlighted text
- Post
- Full Panel
- Close
- Save/sync state
- Recent matching comments

The visible recent-comment feed shows about **four recent matching annotations**, while supporting code can request more.

On YouTube, a quick comment automatically becomes a time-linked YouTube annotation using the current playback position.

On ordinary pages, it becomes a URL annotation.

Keyboard behavior includes:

- **Ctrl/Cmd + Enter** — post
- **Escape** — close

The bar remains open after a successful post and refreshes its recent context.

### Quick-bar limitations

The quick bar intentionally omits advanced configuration. It does not expose:

- Image attachment authoring
- GPS target authoring
- Custom-schema target authoring
- Detailed URL query controls
- Snapshot controls

---

## 11. Capture System

The Capture module expands the product from annotation into lightweight revision/history capture.

Two capture modes exist:

| Capture | Behavior |
|---|---|
| **Visible snapshot** | Captures the current viewport |
| **Full page** | Scrolls, captures viewport tiles, and stitches them |

Each snapshot also captures page metadata and rendered state, including:

- URL
- Title
- Viewport dimensions
- Page dimensions
- Rendered page text
- Rendered HTML
- Screenshot reference
- Capture mode
- Timestamp
- Sync state

This makes each capture more than a screenshot. It is a point-in-time record of the **rendered browser state**.

Approximate extraction limits include:

- Rendered HTML: about **5 million characters**
- Rendered visible/body text: about **2 million characters**

---

## 12. Full-Page Screenshot Engine

Full-page capture is implemented directly rather than delegated to a hosted screenshot service.

The process:

1. Determines page/document dimensions
2. Determines viewport dimensions
3. Calculates tile positions
4. Scrolls the document
5. Captures each viewport
6. Restores the original scroll position
7. Composites tile captures into a Canvas
8. Stores the resulting Blob

Protective limits constrain extremely large documents.

Approximate bounds include:

- Around **14,000 × 28,000 CSS pixels**, adjusted for device pixel ratio
- A maximum of roughly **30 screenshot tiles**

These caps reduce the risk of excessive memory use and oversized Canvas allocations.

---

## 13. Timeline

Snapshots are immutable historical records.

A later capture does not overwrite an earlier one.

The Timeline presents page captures newest-first with information such as:

- Thumbnail
- Capture mode
- Timestamp
- Sync state
- Approximate captured text size

Selecting a historical item expands it into the larger snapshot display area.

Snapshot history is keyed to normalized page identity.

---

## 14. Visual Comparison

The product can compare the **latest two snapshots**.

The implementation:

1. Loads the two screenshot Blobs
2. Draws/scales them into Canvas
3. Compares RGB pixel values
4. Applies a difference threshold
5. Calculates changed-pixel percentage
6. Visually highlights changed areas
7. Dims unchanged areas

The interface can report results such as:

> `12.47% pixels changed`

Comparison dimensions are bounded to roughly:

- **1,800 pixels wide**
- **12,000 pixels high**

This is a basic visual regression mechanism, not a layout-aware or semantic diff engine. Changes caused by anti-aliasing, animation, responsive movement, font rendering, or shifted layout can register as meaningful pixel changes.

---

## 15. Custom Anchor Schemas

The custom schema mechanism is the principal extensibility layer.

Users can install an object-oriented `.json` JSON Schema and create new target classes without modifying the built-in URL/GPS/YouTube model.

Supported field styles include:

- String
- Number
- Integer
- Boolean
- Enum-style values

Required fields are enforced.

Custom targets are keyed using:

- Schema ID
- Canonicalized JSON value object

Canonicalization prevents property ordering from producing different keys for otherwise identical objects.

The system does **not** perform semantic entity resolution. It will not automatically infer that alternate ISBN forms, aliases, product codes, or differently normalized values refer to the same real-world object unless they canonicalize to the same stored value structure.

---

## 16. Example Book Schema

The package includes an example custom schema, roughly representing a book/page anchor.

Fields include:

| Field | Type |
|---|---|
| ISBN | Required string |
| Page | Integer >= 1 |
| Edition | String |

This demonstrates the architecture's broader direction: comments could be attached to books, products, tickets, records, documents, physical inventory, database entities, and other structured targets.

---

## 17. Schema Validation Limitations

The application is **not** a complete JSON Schema Draft 2020-12 implementation.

It validates and renders a practical subset.

The extension primarily understands object schemas with supported primitive properties and required-field semantics.

The PHP service accepts a somewhat broader class of object schemas than the extension renderer is guaranteed to support. This creates a possible compatibility gap if complex schemas are installed through the server.

---

## 18. Settings

The settings module includes configuration for:

| Setting | Default |
|---|---|
| PHP API base | `http://localhost:8787/api` |
| Display name | `Local user` |
| Default GPS gate | `75 m` |
| Automatic synchronization | Enabled |

Additional controls include:

- **Test server**
- **Export JSON metadata**

The export includes metadata such as:

- Annotations
- Schemas
- Snapshots
- Events
- Export timestamp

Binary image and screenshot data are not embedded directly into the JSON export; metadata retains references to the locally stored Blob records.

---

## 19. Local-First Architecture

The browser extension treats local storage as the first-write system.

An annotation is persisted locally **before** server synchronization is attempted.

This makes ordinary annotation authoring resilient to temporary server unavailability.

Typical sync states include:

- `local`
- `pending`
- `synced`
- `error`

The server is therefore best understood as a **sync/archive/continuity layer**, not the sole authoritative runtime database for the browser experience.

---

## 20. IndexedDB Data Model

The local database is named:

`portashape-xtratype`

It includes five principal object stores:

| Store | Purpose |
|---|---|
| `annotations` | Annotation records |
| `blobs` | Image and screenshot binary objects |
| `schemas` | Installed custom schema definitions |
| `snapshots` | Page revision/snapshot metadata |
| `events` | Local activity/event log |

Annotations include indexes for fields such as:

- `targetKey`
- `createdAt`

Snapshots include a page-key index.

Application settings are stored separately using Chrome local storage, while recent active-page context is stored through Chrome session storage.

---

## 21. Core Annotation Record

The principal record is conceptually:

`Context.Annotation`

with schema version 2.

Its fields include concepts such as:

- ID
- Version
- Structured target
- Target key
- Highlighted text
- Annotation body
- Attachment metadata
- Parent annotation ID
- Author
- Created/updated timestamps
- Sync state

Attachments contain metadata such as:

- Attachment ID
- Filename
- MIME type
- Size
- Local Blob ID or remote URL

Snapshots use a `Revision.Snapshot`-style model with page identity, capture metadata, rendered content, screenshot reference, and sync state.

---

## 22. Responsive Server/Web Application

Running the bundled PHP service also exposes a responsive browser UI.

It is not merely a raw API.

Its tabs include:

| Tab | Purpose |
|---|---|
| **Post** | Create annotations |
| **Nearby** | Discover GPS annotations around current position |
| **All context** | View server-side annotation feed |
| **Schemas** | View/install structured schemas |

The Post surface supports:

- URL targets
- GPS targets
- YouTube targets
- Custom-schema targets
- Highlighted text
- Comments
- Up to three image uploads

The web client writes directly to the PHP service rather than using the browser extension's IndexedDB-first workflow.

Its default author identity is hard-coded as **Web user**.

---

## 23. Nearby GPS Web Experience

The **Nearby** tab is a distinct server/mobile capability.

After browser geolocation permission is granted, the client:

1. Reads the user's location
2. Enumerates GPS annotations
3. Calculates geographic distance
4. Applies annotation-specific radius or the default 75 m radius
5. Displays the annotations whose geographic gate contains the user

This gives the package a rudimentary **location-triggered context browser**.

---

## 24. PHP API Surface

The PHP server exposes a small REST-style JSON API.

| Endpoint | Methods / purpose |
|---|---|
| `health.php` | GET health/status |
| `annotations.php` | GET, POST, DELETE |
| `schemas.php` | GET, POST, DELETE |
| `snapshots.php` | GET, POST |
| `events.php` | GET, POST |

Annotation queries can be filtered by identity/context such as:

- Annotation ID
- YouTube video ID
- Target key

Snapshots can be queried by page key.

Schema responses combine bundled disk schemas with stored custom schemas.

Media upload uses multipart form data.

---

## 25. Server Persistence

The PHP server deliberately avoids SQL.

Metadata is stored as JSON files beneath:

`server/data/`

Data categories include:

- Annotations
- Schemas
- Snapshots
- Events

Uploaded media is stored beneath date-oriented directories under:

`server/media/YYYY-MM/`

JSON persistence uses file locking plus a write-to-temporary-file-and-rename pattern rather than simple direct overwrites.

---

## 26. Synchronization Behavior

Manual Side Panel synchronization performs several operations:

- Push unsynced annotations
- Upload associated image Blobs
- Push custom schemas
- Push unsynced snapshots
- Upload screenshot Blobs
- Pull server annotations
- Pull server schemas

### Important synchronization gaps

**Remote snapshot restoration is incomplete.** The server supports reading snapshots, but the extension does not currently expose a complete remote-snapshot pull/reconciliation flow into the local timeline.

**Events are not fully synchronized.** The extension stores local events and the server has an events endpoint, but the client-side event log is not fully bridged into that endpoint.

---

## 27. Chrome Permissions and Access

The extension is Manifest V3 and targets Chrome **116+**.

Requested capabilities include:

- Active tab
- Scripting
- Storage
- Side Panel
- Context menus
- Tabs
- Geolocation
- Broad URL host access

The all-sites access supports functionality such as:

- Selected-text capture
- DOM extraction
- Quick-bar injection
- Full-page scrolling/capture
- Context collection

Chrome-protected surfaces cannot be injected into. Examples include various `chrome://` pages, DevTools contexts, and other restricted browser surfaces.

Local `file://` pages require Chrome's separate **Allow access to file URLs** setting.

---

## 28. Technology and Dependency Profile

The project is intentionally dependency-light.

There is:

- No `package.json` application dependency tree
- No front-end framework
- No React
- No Vue
- No Angular
- No jQuery
- No Composer application stack
- No SQL database
- No server framework

The extension relies mainly on browser-native APIs such as:

- Chrome extension APIs
- IndexedDB
- Canvas
- ImageBitmap
- Shadow DOM
- Geolocation
- Fetch
- FormData

The server is plain PHP.

The source uses PHP's `never` return type, making **PHP 8.1+** the practical minimum runtime.

---

## 29. Implemented vs. Missing / Incomplete

| Capability | Status |
|---|---|
| Contextual annotation creation | Implemented |
| Local offline-first saving | Implemented |
| Image attachments | Implemented |
| Page-text quoting | Implemented |
| URL variable matching | Implemented |
| GPS anchors | Implemented |
| GPS Nearby discovery on web/mobile | Implemented |
| YouTube timestamps | Implemented |
| YouTube ranges | Implemented |
| Progress-bar markers | Implemented |
| Timed playback notification | Implemented |
| YouTube replies | Implemented |
| Custom anchor schemas | Implemented, limited schema subset |
| Visible screenshots | Implemented |
| Full-page stitched screenshots | Implemented |
| Rendered HTML/text capture | Implemented |
| Page timeline | Implemented |
| Visual pixel diff | Implemented |
| Annotation sync | Implemented |
| Schema sync | Implemented |
| Snapshot upload/archive | Implemented |
| Remote snapshot restoration | Not fully implemented |
| Local event logging | Implemented |
| Event synchronization | Endpoint exists; client integration incomplete |
| Annotation editing | No primary UI |
| Annotation deletion | API exists; no primary UI |
| Schema deletion | API exists; no primary UI |
| Authentication/accounts | Not implemented |
| Multi-user permissions | Not implemented |
| TLS/security hardening | Not bundled |
| Rate limiting | Not implemented |
| Billing/subscriptions | Not present |
| General full-text search | Not present |
| Advanced cross-site notifications | Not present |
| Full threaded-discussion UI | Partial/basic |
| Advanced visual regression | Basic pixel comparison only |

---

## 30. Notable Implementation Inconsistencies

Several items are particularly relevant for future development.

### GPS resolution mismatch

The server/mobile interface has genuine radius-based discovery, while the Side Panel's local context feed does not fully use the same radius-matching behavior despite supporting code existing.

### Fragment targeting UX

Fragment semantics are present in the target model but are not fully exposed through the current authoring controls.

### Snapshot sync asymmetry

Snapshots can be pushed to the server, but remote snapshot restoration into the local timeline is not a complete workflow.

### Event sync gap

The product has both a local event log and a server event endpoint, but the two are not fully connected.

### Quick-bar synchronization inconsistency

The quick-bar flow is not perfectly aligned with the Side Panel's automatic-sync preference handling. Some quick-created items enter pending/sync behavior more eagerly than the full composer.

### Schema parity

The server can store some schemas that the extension renderer may not be able to faithfully render.

### Bundled Book schema

The example Book schema effectively behaves like another bundled anchor when the server is connected because the schema endpoint returns it automatically.

---

## 31. Security Posture

This is clearly a **developer MVP**, not a hardened multi-tenant production backend.

The bundled PHP API does not provide:

- User authentication
- Authorization rules
- Per-user isolation
- Roles
- Rate limiting
- Production TLS configuration
- Mature abuse prevention

CORS is permissive by default.

If the service were exposed directly to the public internet, any reachable client could potentially interact with shared data unless deployment controls were added.

The documentation and architecture therefore support a local/developer or trusted-network use case much more strongly than a public SaaS deployment.

---

## 32. Quality and Verification State

The package includes basic tests around anchor/schema behavior.

During review:

- Included anchor/schema tests passed
- JavaScript syntax checks passed
- PHP lint checks passed
- The bundled PHP server responded correctly to its health endpoint
- The schema endpoint exposed four schemas in the reviewed package:
  - `xtratype.anchor.url@1`
  - `xtratype.anchor.gps@1`
  - `xtratype.anchor.youtube@1`
  - `example.anchor.book@1`

The packaged data stores were initially empty.

The source-level review did **not** include a full interactive manual browser QA pass with the extension loaded into Chrome, so behavioral descriptions above reflect implementation analysis rather than a formal end-to-end browser test campaign.

---

## 33. Product Summary

PortaShape/XtraType v2.3 combines four major product concepts:

### 1. Context Annotation

Attach durable comments to:

- Web pages
- Specific page variants
- Selected text
- Geographic locations
- Video moments
- Video ranges
- Arbitrary structured objects

### 2. Contextual Browser Experience

Surface those annotations through:

- Chrome Side Panel
- Page-level quick bar
- Highlight capture
- YouTube timeline markers
- Timed video notifications
- Quick replies

### 3. Revision Capture

Preserve page state through:

- Visible screenshots
- Full-page screenshots
- Rendered HTML
- Rendered text
- Snapshot history
- Pixel comparison

### 4. Portable Context Model

Persist and synchronize structured records through:

- IndexedDB
- JSON-based server storage
- Blob/media storage
- Optional server synchronization
- Custom JSON-schema-defined anchor classes

The broader architectural idea is therefore:

> **Attach durable context to things, not merely to documents.**

That “thing” can be a page, a parameterized page identity, a physical place, a moment in media, a captured page revision, or a custom structured entity.
