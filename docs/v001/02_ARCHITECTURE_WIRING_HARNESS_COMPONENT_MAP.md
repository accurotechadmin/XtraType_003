# XtraType v.001 — Architecture, Wiring, Harnesses, Components, and Subcomponents

This is the forward orientation map for engineers and coding agents. It is intentionally concrete about call paths and trust seams. Source remains authoritative for exact behavior.

## 1. Runtime topology

```text
Browser page / YouTube page
        │ page DOM / selection / navigation
        ▼
Chrome MV3 extension
  ├─ service worker (privileged orchestration)
  ├─ side panel (authoring, feed, capture, account UI)
  ├─ quick-bar content UI (page-owned DOM)
  ├─ YouTube content UI (page-owned DOM)
  └─ core modules
       ├─ anchors
       ├─ schemas
       ├─ IndexedDB
       ├─ records
       ├─ API/sync/auth adapter
       └─ capture
        │ optional HTTP sync/auth/messages
        ▼
PHP companion/router/API
  ├─ request guards
  ├─ Auth/account helpers
  ├─ validation
  ├─ JsonRepository
  ├─ private JSON collections
  ├─ private per-user profile JSON
  └─ validated media store
```

PortaShape currently surrounds this topology as a **specified future host boundary**, not an executing generic plugin runtime.

## 2. Privileged browser harness

### `ext/service-worker.js`

This is the principal extension authority broker. Treat it as a high-risk wiring hub because it can see active tabs, inject scripts, query page state, open the side panel, access extension storage/IndexedDB through imports, make extension-origin HTTP calls, and capture visible tabs.

Important state/constants include the compose-request handoff, old/young annotation state, seven-day youth window, and badge pull throttling. Important flows include:

- install/startup → context menus + side-panel action behavior;
- action / `Ctrl+Q` → browser-native side-panel toggle path;
- omnibox `xt` → current active tab → side-panel open → remembered context/selection → compose request → panel focus;
- tab activation + webNavigation/history/fragment changes → context change broadcast → panel refresh + badge recomputation;
- badge query → optional throttled remote annotation pull → page applicability filter → exclude explicitly old IDs → badge count;
- quick-bar create/reply → verify sender/tab context → construct local annotation → optional sync → update projections;
- capture request → pin active tab/window/document/URL/metrics → pace `captureVisibleTab` calls → reject changed context.

Do not bypass the worker by trusting page-supplied URL/document identity for privileged operations.

## 3. Side-panel harness

### `ext/sidepanel/index.html`

Static markup deliberately contains the four built-in Attach-to options and URL Base URL/query-fragment controls so essential authoring UI still exists if asynchronous hydration fails. The top header contains Snapshot, quick-bar, and context refresh actions.

The only reorderable primary sections are:

1. author/composer (`data-primary-section="author"`)
2. Annotations (`data-primary-section="annotations"`)

Other tools remain fixed below that pair.

### `ext/sidepanel/app.js`

Major sub-harnesses:

- **context:** `refreshContext`, scheduled refresh, compose trigger consumption;
- **target rendering:** URL, GPS, Time, YouTube, custom schema;
- **record creation:** `buildTarget` → file validation → `saveAnnotation`;
- **young/old projection:** seven-day age test + old-ID map + feed rendering + `markAllCurrentTargetOld`;
- **sync:** explicit pull and automatic paths through core API;
- **capture/history:** visible/full capture, snapshot persistence, timeline, selected snapshot, latest-two diff;
- **schema:** list/install custom schema;
- **accounts:** account status, registration/login/logout, invitations, contacts, DMs, group chats, admin controls;
- **layout preference:** persistent author/Annotations ordering.

A draft-preservation rule matters: navigation refresh should update page context without arbitrarily destroying unrelated in-progress drafts.

## 4. Core browser modules

### `ext/core/anchors.js`

Owns target parsing/key identity/applicability. Exact identity (`targetKey`) is deliberately distinct from applicability (e.g., URL rules or GPS radius). Time targets are generic and not page-applicable by default.

### `ext/core/schemas.js`

Owns a deliberately bounded custom-schema profile. It is not a full JSON Schema engine. Keep unsupported nested/executable/combinator/reference semantics rejected unless the entire schema contract is deliberately expanded across browser + server + tests.

### `ext/core/db.js`

Owns `portashape-xtratype` IndexedDB v1 and its five stores. `atomicPut` is the important aggregate transaction seam for local record groups. Any DB version/store change is a migration event, not a casual refactor.

### `ext/core/records.js`

Owns target/image validation and `Context.Annotation` construction. This is where authoring becomes a persisted record contract. Keep Annotation v2 compatibility unless a versioned migration is authorized.

### `ext/core/api.js`

Owns API base normalization/settings, authentication session persistence, pull/merge/sync, snapshot upload, health, and account/messaging endpoints. Local dirty/error records must not be overwritten blindly. The account bearer token is client-side sensitive state; server records store only its hash.

### `ext/core/capture.js`

Owns extraction/tile positioning/capture orchestration while privileged screenshot execution remains worker-mediated. Capture is a job with context identity, limits, cleanup, and potential fidelity loss—not a simple screenshot helper.

## 5. Page-owned extension surfaces

`ext/content/page-ui.js` and `ext/content/youtube.js` execute in/alongside page DOM. They are user-facing convenience surfaces, not secrets containers. Treat anything rendered there as visible to page-owned scripts under the browser's actual isolation rules.

The YouTube adapter is special-purpose. Do not generalize its polling/navigation logic into a universal plugin runtime.

## 6. Server harness

### `server/router.php`

Acts as the dev-server allowlist. Approved API families, media, assets, and schemas are routed/served; arbitrary filesystem paths are not exposed.

### `server/api/bootstrap.php`

Common request harness:

1. configure exception handling;
2. Host allowlist;
3. Origin checks including configured extension IDs;
4. CORS response behavior;
5. request-size bound;
6. `X-XtraType-Client` requirement for mutating calls;
7. JSON/multipart parsing;
8. repository singleton;
9. bounded IDs/timestamps/strings;
10. image validation and content-addressed persistence;
11. load Auth and Validation helpers.

Every endpoint inherits this boundary. Do not create a new endpoint that bypasses it.

### `src/server/Repository.php`

`JsonRepository` is the current persistence abstraction. Collection mutation is serialized by file locking and replacement uses staged temp files/rename. It prevents many same-host lost writes but is not a distributed database transaction system.

### `src/server/Validation.php`

Server-side contract enforcement for schemas, anchor targets, target keys, and Annotation v2. Browser validation is usability; server validation is authority for server writes.

### `src/server/Auth.php`

Owns username/password bounds, password hashes, bearer-session validation/hashes, system/user authorization, fixed-EST invitation-day semantics, profile JSON read/write, and message decoration helpers.

## 7. API ownership map

- `health.php` — storage/service health.
- `annotations.php` — validated annotation GET/filter/upsert/delete compatibility.
- `schemas.php` — catalog/install/delete non-built-ins.
- `snapshots.php` — snapshot query/upload.
- `events.php` — sparse diagnostic records.
- `auth.php` — account bootstrap/register/login/logout/status.
- `invites.php` — per-user invitation creation/history and cadence enforcement.
- `admin.php` — system/invite switches and per-user controls.
- `contacts.php` — user contact groups.
- `messages.php` — direct messages.
- `group-chats.php` — five-character chat creation, membership grants, reads, messages.

After the first user exists, legacy data APIs call `require_api_user_if_initialized()`: the first-registration transition therefore changes the central API from pre-setup compatibility mode to authenticated mode.

## 8. Data ownership map

### Browser local authority

IndexedDB owns local annotations/blobs/schemas/snapshots/events and is authoritative for local-first authoring durability.

### Server central JSON

Server JSON collections own replicated annotations/schemas/snapshots/events and the account/messaging registries. Account/session/invite/message/group-chat data is not a replacement for IndexedDB's local annotation authority.

### Per-user profiles

`var/profiles/<user>/` holds private JSON payload documents such as profile, registration, invitation history, contact groups, and group-chat membership references. Password hashes and session token hashes remain in central auth collections, not portable profile payloads.

### Media

Validated PNG/JPEG/WebP bytes are content-addressed under private media storage and served only through the media boundary.

## 9. Important event/control paths

### Annotation authoring

page context → target form → shared target key/validation → body/quote/images → local aggregate commit → UI success → optional remote sync → feed/badge projection.

### Navigation

tab activation / committed navigation / history state / fragment → worker `announceContextChange` → side-panel `xtratype:contextChanged` → refreshed context/forms/feed/snapshots → badge update.

### Young state

annotation createdAt within seven days + applicable target + ID not in explicit-old map → green tree / badge contribution. Reading is irrelevant. Mark-old adds IDs to local explicit-old state.

### Omnibox

`xt` keyword + text + Enter → `omnibox.onInputEntered` → open panel from user gesture → remember active page/selection → store compose request → panel consumes request → comment textarea receives text → focus composer.

### Capture

panel command → core capture → worker pinned capture messages → screenshot tiles/extraction → blob/snapshot local commit → optional server upload → timeline/diff.

### Invite/account

first registration → admin; later registration → validate unused invite + creator enabled → create user/profile → consume central invitation + update creator profile invitation record → issue bearer session.

### Group chat

creator → unique base62(5) code → member IDs → profile membership refs → authorized URL visit → side panel detects `/gc/#####` → authenticated fetch → specialized dialogue in annotations region.

## 10. Shared-copy seam

`ext/core/anchors.js` and `ext/core/schemas.js` have web copies under `server/assets/core/`. Treat byte parity as a maintained invariant. Use `scripts/sync-shared.mjs` and parity tests rather than hand-editing only one copy.

## 11. PortaShape insertion seams

The selected target architecture should be inserted around—not through—these stable seams:

- host package inspection/install/grants/operations behind explicit privileged boundaries;
- XtraType client bridge that preserves current annotation/database identity;
- separate PortaShape-local namespaces/sidecars rather than renaming XtraType stores into a generic object DB;
- userscripts separated from privileged package code;
- UI contributions with deterministic cleanup;
- connector external effects with receipts and unknown-outcome reconciliation;
- portable imports without transferred grants/secrets.

## 12. “Do not casually change” harness list

- IndexedDB name/version/stores.
- Annotation v2 and Snapshot v1 without migration.
- target-key canonicalization independently on only one side.
- server bootstrap guard path.
- local-before-remote annotation durability.
- extension/page trust distinction.
- side-panel navigation identity pinning.
- account token/password storage properties.
- group-chat case sensitivity and ACL semantics.
- plugin/import rule that data does not carry execution authority.
