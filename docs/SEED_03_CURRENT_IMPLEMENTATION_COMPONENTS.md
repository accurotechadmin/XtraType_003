# Seed 1 — Current Implementation Component Inventory

This file describes **executable XtraType 2.5.1 components as they exist now**. PortaShape target components are indexed separately in `SEED_04_PORTASHAPE_TARGET_ARCHITECTURE.md`.

## A. Chrome extension shell

| Component | Implementation | Uses / responsibility | Key dependencies |
|---|---|---|---|
| MV3 extension manifest | `ext/manifest.json` | Declares XtraType 2.5.1, Chrome 116 floor, service worker, native side panel, Ctrl+Q reserved action shortcut, `xt` omnibox keyword, permissions, all-sites host access, and YouTube content script | Chrome MV3 APIs |
| Install instructions | `ext/INSTALL.txt` | Human setup and local server expectations | Chrome + local PHP server |
| Extension service worker | `ext/service-worker.js` | Context menus, side-panel/omnibox opening, page context acquisition, bounded message routing, quick actions, annotation projection queries and capture coordination | core anchors/db/api/records; Chrome tabs/webNavigation/scripting/storage/sidePanel/contextMenus/omnibox |

### Service-worker subcomponents

- **Install/startup setup:** creates “Open XtraType” and quick-note context menus and configures side-panel behavior. The reserved `_execute_action` command binds `Ctrl+Q` to the same native action toggle.
- **Omnibox composer entry:** keyword `xt` opens the current-window side panel from the omnibox user gesture, refreshes active-page context/selection, transfers any text typed after `xt` + Space into the comment textarea, and focuses the composer.
- **Page scriptability guard:** rejects browser-protected/internal pages rather than inventing a fallback target.
- **Pinned tab context:** reads URL/title/selection/document identity and remembers bounded session context.
- **Live navigation projection:** broadcasts active-tab, normal URL, SPA history-state and fragment changes so an open side panel refreshes against the exact tab/window.
- **Week-young badge:** maintains a per-tab seven-day count of recent annotations applicable to the present URL/video context, including the current user's own content. Reading does not clear it; explicit **Mark all as old** or age beyond seven days clears the green state.
- **Quick-bar injection:** injects `content/page-ui.js` only into a scriptable current tab.
- **Annotation projection queries:** supplies recent page-context annotations and YouTube-video annotations to page surfaces.
- **Caller authority:** message handling checks the extension sender and uses tab/document context rather than trusting claimed page identity.
- **Quick create / quick reply:** routes bounded page/YouTube UI submissions into local annotation creation and optional sync.
- **Capture coordinator:** pins tab/window/document/URL/metrics, serializes screenshot calls, enforces pacing, and verifies identity around captures.

Current worker message names include the preserved context/quick/capture surface plus the panel badge/refresh additions: `xtratype:getContext`, `xtratype:openSidePanel`, `xtratype:openQuickBar`, `xtratype:quickCreate`, `xtratype:quickReply`, `xtratype:getRecentContextAnnotations`, `xtratype:getYouTubeAnnotations`, `xtratype:markAnnotationsOld`, `xtratype:markPageOld`, `xtratype:updateBadge`, `xtratype:pageExtract`, `xtratype:scrollTo`, and `xtratype:captureVisible`. The worker emits `xtratype:contextChanged` to extension-owned views, `xtratype:beginAnnotation` for the omnibox composer handoff, and `xtratype:annotationsUpdated` after an automatic annotation pull associated with navigation.

## B. Extension core modules

| Module | Public responsibilities | Current implementation notes |
|---|---|---|
| `ext/core/anchors.js` | Parse URL targets; identify YouTube URLs; build YouTube/GPS/Time targets; deterministic target keys; GPS distance/applicability; URL applicability | Shared byte-for-byte with web copy through sync script/tests |
| `ext/core/schemas.js` | Normalize bounded custom schema profile; validate custom values; convert primitive form values | Explicitly **not** a full JSON Schema engine |
| `ext/core/db.js` | Open `portashape-xtratype` IndexedDB v1; CRUD; indexed lookup; IDs; blob/event helpers; aggregate transactions; record update | Stores: `annotations`, `blobs`, `schemas`, `snapshots`, `events` |
| `ext/core/records.js` | Validate targets/images; construct annotation + attachment/blob/event aggregate | Current `Context.Annotation` schemaVersion 2 retained |
| `ext/core/api.js` | Settings, base normalization, pull/merge, annotation/schema/snapshot sync, health check | Automatic sync honors setting; request timeout; dirty/error merge protection; snapshot upload only |
| `ext/core/capture.js` | Tile positions, page extraction, visible/full capture orchestration, cleanup | Enforces page/tile/pixel bounds; does not make semantic screenshots |

## C. Native side-panel application

Files: `ext/sidepanel/index.html`, `app.js`, `style.css`.

| Subcomponent | Current behavior |
|---|---|
| Context header | Shows current browser context and supports refresh / quick-bar launch |
| Annotation composer | Ships URL/Time/YouTube video/GPS built-ins in markup before JS hydration, then adds custom schemas; captures quote/comment and up to supported images; commits local record before optional sync |
| URL target form | Base URL plus a nested collapsible Query & fragment handling block through the shared anchor model |
| GPS target form | Numeric coordinates/radius; blank coordinates rejected |
| Time target form | Generic single UTC-normalized moment or timeframe with required start/end and forward-range validation |
| YouTube target form | Video/time target with null whole-video time kept distinct from zero |
| Custom target form | Primitive bounded fields from installed schemas |
| Annotations feed | Reads annotations for the selected context (Time intentionally lists the generic Time family); week-young rows carry a green tree marker and remain young after viewing; **Mark all as old** clears the current feed and current-page badge contributors |
| Primary-section ordering | Only the author/composer and Annotations sections can be drag-reordered (or keyboard-swapped); order persists in extension local storage |
| Snapshot capture | Header Snapshot button defaults to full-page capture; Capture section can switch the quick button to visible-only; detailed visible/full controls retain progress/error status |
| Timeline | Lists local snapshots and shows selected stored screenshot |
| Pixel comparison | Equal-dimension RGB comparison visualization with proportional downsampling |
| Schema manager | Lists/installs bounded inert custom target schemas |
| Settings | API base, display author, GPS radius preference, automatic-sync toggle, quick Snapshot mode, server test, and discoverability text for Ctrl+Q / `xt` omnibox entry |
| Metadata export | Exports JSON metadata; intentionally not a complete binary restore backup |

## D. Page-owned content surfaces

| Component | File | Current behavior / boundary |
|---|---|---|
| Quick bar | `ext/content/page-ui.js` | Injected on demand into scriptable pages; creates bounded page-context annotations; displays recent context; stale context guarded |
| YouTube projection | `ext/content/youtube.js` | Shows markers/toasts/replies for matching video annotations; bounded navigation/player polling; null whole-video notes; cleans up stale UI | No general mutation observer runtime; no userscript/plugin host |

These overlays live in page DOM and are therefore not secrecy boundaries from page-owned scripts. That is an intended architectural exposure, not a private extension-only surface.

## E. PHP server and API

| Component | File(s) | Current responsibility |
|---|---|---|
| Configuration | `server/config.php` | Private data/media paths, size limits, host/origin/extension configuration, defaults |
| Development router | `server/router.php` | Serves only approved app/API/assets/schema/media paths under built-in PHP server |
| Apache rules | `server/.htaccess` | Equivalent deployment boundary guidance for Apache |
| API bootstrap | `server/api/bootstrap.php` | Response/error helpers, Host/Origin/client-header checks, request bounds, JSON/multipart parsing, repository access, account helper loading, media validation/persistence, common ID/time validation |
| Account/session core | `src/server/Auth.php` | Password hashing, bearer-session verification, first-admin bootstrap, system/user enable checks, fixed-EST invite day logic and per-user profile JSON helpers |
| Auth/invitation/admin routes | `server/api/auth.php`, `invites.php`, `admin.php` | Registration/login/logout, single-use invitations, one-per-day invite creation, central invitation provenance, global/per-user enable controls |
| Contacts/messages/group chats | `server/api/contacts.php`, `messages.php`, `group-chats.php` | Per-user contact groups, authenticated direct messages, five-character case-sensitive XT Group Chat creation/grants/messages |
| Annotation route | `server/api/annotations.php` | GET/filter, POST validated annotation+media upsert, DELETE compatibility behavior; requires an enabled account after account setup |
| Schema route | `server/api/schemas.php` | Get catalog, install normalized custom schema, delete non-built-ins |
| Snapshot route | `server/api/snapshots.php` | Query and upload snapshot metadata/media; no remote hydration client flow |
| Event route | `server/api/events.php` | Sparse diagnostic event read/write |
| Health route | `server/api/health.php` | Validates service/collections and reports health |
| Media boundary | `server/media.php` | Validated media retrieval outside raw filesystem exposure |
| Web application | `server/index.php`, `server/assets/app.js`, `style.css` | Responsive Post / Nearby / All context / Schemas client plus simple account registration/login; server-first/online |
| Shared web core | `server/assets/core/anchors.js`, `schemas.js` | Browser-side parity copies of extension target/schema logic |
| Packaged target schemas | `server/schemas/*.schema.json` | URL, GPS, Time, YouTube built-ins plus example Book custom anchor schema |

Host/Origin/client-header checks remain defense-in-depth. After the first account is registered, bearer-session authorization provides a separate authenticated account boundary for protected API routes. This is still not public-hosting certification or end-to-end encryption.

## F. Persistence and validation internals

| Component | File | Current behavior |
|---|---|---|
| Repository interface | `src/server/Repository.php` | `Repository::read()` and `mutate()` persistence seam |
| JSON repository | same | Shared/exclusive file locks; fail-closed collection decoding; read/modify/temp-write/flush/rename replacement | 
| PHP validation | `src/server/Validation.php` | Schema normalization/field checks, schema catalog, typed target validation and annotation validation |
| Runtime collections | `var/data/*.json` | Packaged JSON arrays are created/read for annotations/events/schemas/snapshots plus users/sessions/invites/system settings/direct messages/group chats/messages |
| Runtime media location | `var/media/` | Private file-backed upload destination; no automatic orphan GC |
| User profile documents | `var/profiles/<user>/` | Runtime-created private JSON documents for profile/registration/invitation history/contact groups/group-chat memberships; only `.gitkeep` is packaged |

There is no SQL adapter or distributed transaction layer. The implemented account store is the local-default PHP/JSON companion and is deliberately narrower than the deferred cross-device/PortaShape identity service plane.

## G. Developer tooling and tests

| Component | File(s) | What it establishes |
|---|---|---|
| Shared-source sync | `scripts/sync-shared.mjs` | Copies extension anchors/schemas to web equivalents after edits |
| Anchor baseline tests | `tests/anchors.mjs` | Preserved original anchor assertions |
| Core tests | `tests/core.test.mjs` | Anchor/schema semantics, fake IndexedDB transactions and sync safety |
| DOM/client tests | `tests/client-dom.test.mjs` | jsdom panel, quick bar, YouTube/web fixtures and mocked capture/canvas behavior |
| Worker tests | `tests/worker.test.mjs` | Mocked Chrome sender/context/reply/capture pacing behavior |
| HTTP tests | `tests/http.test.mjs` | Real PHP route/validation/upload/query/delete/corruption behavior plus registration/invitation quota/provenance, contact groups, DMs, group-chat ACLs and admin shutdown controls |
| Repository concurrency | `tests/repository.test.mjs`, `repository-worker.php` | Multiple independent PHP writers against JSON repository |
| Dev toolchain | `package.json`, `package-lock.json` | Node test runner, jsdom, fake-indexeddb, prettier; no runtime npm dependency |

Preserved release evidence says 32 automated tests passed in the recorded environment. This is not native Chrome or real YouTube certification.

## H. Current record/data families

### Implemented records/storage

- `Context.Annotation` schemaVersion 2 — annotation envelope with target, targetKey, body/quote, author/time, attachments and sync metadata.
- `Revision.Snapshot` schemaVersion 1 — page snapshot/capture metadata linked to local screenshot blob and optional server upload.
- Local custom schema records — normalized inert schema metadata.
- Local blob records — actual image/screenshot Blob payloads and metadata.
- Sparse local/server events — diagnostics, not replicated event sourcing.
- Central account/session/invitation/system-control records — JSON-backed server records; passwords are hashes and stored session values are token hashes.
- Direct-message and XT Group Chat/message records — server JSON collections with account/member authorization.
- Per-user profile payload documents — profile/registration/invitation/contact-group/group-chat membership JSON files under `var/profiles/` at runtime.
- Settings in Chrome local storage and current context/capture pacing state in session storage.

### Not implemented despite target contracts existing

No `Plugin.Manifest`, `Plugin.Installation`, `Host.Grant`, `Host.Invocation`, `Host.Receipt`, PortaShape `Host.Event`, `Core.Object`, generic `Core.Handle`, companion anchor-bundle/annotation-extension/relationship/conversation/message family, Script records, DRY procedure records, Publisher records, credential reference, or connector descriptor has a current PortaShape runtime repository/dispatcher.

## I. Crosswalk to companion “existing-narrow” concepts

| Companion concept | Seed 1 current source truth |
|---|---|
| XT-C047 Target Resolver | **Existing narrow:** typed target parsing/key/applicability in `anchors.js`; no generic Handle resolver |
| XT-C049 Annotation Object | **Existing narrow:** `Context.Annotation` v2; companion sidecar/object model not implemented |
| XT-C051 Overlay Renderer | **Existing narrow:** quick bar and YouTube projections; not generic anchored relation renderer |
| XT-C052 Capture UI | **Existing narrow:** annotation composer/quick bar plus screenshot capture tools; companion richer anchoring not implemented |
| XT-C054 Conversation Layer | **Existing narrow:** annotation reply linkage plus the 2.5 application-level DM/XT Group Chat stores; these are not the companion Conversation/Message contract repository |
| XT-C056 Feed/Query API | **Existing narrow:** local exact/context queries and local JSON API; not companion operation/visibility query API |
| UI-C103 Web Library | **Existing narrow only:** Post/Nearby/All/Schemas web client; no package/helper/procedure library |
| UI-C107 Annotation Feed | **Implemented narrow:** responsive annotation feed/context views |
| UI-C109 Responsive Mobile Web | **Implemented narrow:** current responsive PHP web surface; no extension privilege on mobile web |
| EXT-C068/069 Source/Target Adapter | **No PortaShape connector runtime.** Any current transformations are predecessor/narrow application logic, not installed connector packages. |

Use this crosswalk to avoid the two opposite errors: declaring target features implemented because a narrow predecessor exists, or ignoring useful existing seams that future PortaShape integration can build on.
