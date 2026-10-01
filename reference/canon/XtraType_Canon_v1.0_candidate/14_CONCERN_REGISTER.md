# XtraType — Concern and defect register

**Canon edition:** 1.0 approval candidate · **Baseline:** supplied v2.3 / extension 2.3.0 · **Audit date:** 2026-10-01

## How to interpret this register

This is the complete finding register for this audit, not a guarantee that all possible defects have been found. All 45 entries are open. No application fixes were made. Priority is an executive recommendation: **P0 deployment** blocks exposing the current service beyond a deliberately controlled development environment; **P1** should be addressed in stabilization before executable expansion; **P2** requires scoped follow-up or an explicit accepted limitation; **P3** is maintenance. A source risk is not falsely reported as a reproduced live-browser failure.

Source references are paths relative to `evidence/baseline/` plus function/handler names; exact file fingerprints and function locations are in documents 18–19. The acceptance column is a proposed outcome, not current code. Owners are concern IDs from document 03. The machine-readable mirror is [concerns.json](evidence/concerns.json).

## Priority index

| ID | Priority | Finding | Owner |
|---|---|---|---|
| XT-001 | P0 deployment | Unauthenticated shared API | C-07 |
| XT-002 | P0 deployment | All-interface launch and raw data beneath webroot | C-10 |
| XT-003 | P1 | Remote pull can erase dirty local state | C-06 |
| XT-004 | P1 | Successful sync loses local image references | C-06 |
| XT-005 | P1 | Missing Blob can silently drop attachment | C-05 |
| XT-006 | P1 | Observer reacts to its own marker mutations | C-09 |
| XT-007 | P1 | Whole-video null time becomes zero | C-09 |
| XT-008 | P1 | Capture pacing does not enforce Chrome rate limit | C-08 |
| XT-009 | P1 | Screenshot and extracted page may differ | C-08 |
| XT-010 | P1 | Failed tile may leave page scrolled and resources retained | C-08 |
| XT-011 | P1 | Unscriptable/invalid page can target example.com | C-04 |
| XT-012 | P1 | Draft target/quote can become stale or mismatched | C-04 |
| XT-013 | P1 | Auto-sync off still permits automatic network paths | C-06 |
| XT-014 | P1 | API trusts structurally invalid record data | C-07 |
| XT-015 | P1 | Untrusted schema kind overrides custom dispatch | C-02 |
| XT-016 | P1 | Changing API base does not migrate sync state | C-06 |
| XT-017 | P1 | Malformed collection silently becomes empty | C-07 |
| XT-018 | P1 | Aggregate save is several independent transactions | C-05 |
| XT-019 | P1 | Blank GPS becomes coordinates 0,0 | C-01 |
| XT-020 | P2 | Fragment authoring and key parity incomplete | C-01 |
| XT-021 | P2 | All-query anchor with no pairs matches extra query | C-01 |
| XT-022 | P2 | YouTube hostname recognition is permissive/inconsistent | C-01 |
| XT-023 | P2 | Schema constraints and scalar conversions differ | C-02 |
| XT-024 | P2 | Context Here can show all data or lag form | C-04 |
| XT-025 | P2 | Reply status is misleading and validation incomplete | C-04 |
| XT-026 | P2 | YouTube navigation and toast lifecycle races | C-09 |
| XT-027 | P2 | Interactive cards cannot be dismissed reliably | C-09 |
| XT-028 | P2 | Full-page label can hide clipping or extraction loss | C-08 |
| XT-029 | P2 | Memory and screenshot upload budgets differ | C-08 |
| XT-030 | P2 | Rescaling can obscure dimension changes | C-08 |
| XT-031 | P2 | No remote snapshot restore or event sync | C-06 |
| XT-032 | P2 | No deletion/tombstone reconciliation | C-06 |
| XT-033 | P2 | Media written before validation and duplicated on retry | C-07 |
| XT-034 | P2 | No timeouts and incomplete sync summaries | C-06 |
| XT-035 | P2 | Object URLs and stored media accumulate | C-05 |
| XT-036 | P2 | No complete backup/import or migrations | C-05 |
| XT-037 | P2 | Whole-corpus queries and full-file rewrites | C-06 |
| XT-038 | P2 | Page and server see sensitive content through intended paths | C-03 |
| XT-039 | P2 | Web failure handling/offline behavior weak | C-04 |
| XT-040 | P2 | Accessibility coverage incomplete | C-04 |
| XT-041 | P2 | GPS preference suggests behavior panel does not perform | C-01 |
| XT-042 | P2 | No end-to-end suite, CI, license or pinned development toolchain | C-10 |
| XT-043 | P2 | Identity/time canonicalization can drift or collide | C-01 |
| XT-044 | P2 | Repeated submit and stale native file selection | C-04 |
| XT-045 | P3 | Mixed concerns and compressed duplicated source | C-10 |

## XT-001 — Unauthenticated shared API

**Priority:** P0 deployment · **Evidence:** CURRENT gap · **Owner:** C-07

**Source:** `server/config.php; server/api/*`.

**Trigger / mechanism:** Any reachable client can read/write/delete supported records; author is a display string.

**Required acceptance:** Identity/authorization and negative cross-user tests before public exposure.

## XT-002 — All-interface launch and raw data beneath webroot

**Priority:** P0 deployment · **Evidence:** CURRENT exposure path · **Owner:** C-10

**Source:** `start-server.sh/.bat; server/data/*`.

**Trigger / mechanism:** Scripts bind 0.0.0.0; static JSON can bypass future API guards. HTTP exposure not exercised here.

**Required acceptance:** Default loopback, private data root, denied direct data/lock/temp access, protected media.

## XT-003 — Remote pull can erase dirty local state

**Priority:** P1 · **Evidence:** CURRENT defect · **Owner:** C-06

**Source:** `ext/sidepanel/app.js:pull; ext/service-worker.js:recentAnnotationsForPage/youtubeAnnotations`.

**Trigger / mechanism:** Failed push or concurrent local change followed by same-ID remote put marks old data synced.

**Required acceptance:** Dirty-record preservation and explicit revision/conflict handling with a stale-pull fixture.

## XT-004 — Successful sync loses local image references

**Priority:** P1 · **Evidence:** CURRENT defect · **Owner:** C-06

**Source:** `ext/core/api.js:syncAnnotation`.

**Trigger / mechanism:** Server attachments replace blobId descriptors; offline renderer cannot find retained bytes.

**Required acceptance:** Retain attachment identity and Blob mapping across sync and offline reload.

## XT-005 — Missing Blob can silently drop attachment

**Priority:** P1 · **Evidence:** CURRENT defect · **Owner:** C-05

**Source:** `ext/sidepanel/app.js:pull; ext/core/api.js:syncAnnotation`.

**Trigger / mechanism:** Manual push skips absent Blob; transport omits local descriptor, allowing incomplete server record.

**Required acceptance:** Missing required media blocks complete-sync status and offers recovery without dropping metadata.

## XT-006 — Observer reacts to its own marker mutations

**Priority:** P1 · **Evidence:** SOURCE risk · **Owner:** C-09

**Source:** `ext/content/youtube.js:render/MutationObserver`.

**Trigger / mechanism:** replaceChildren and append under observed subtree can trigger repeated render work.

**Required acceptance:** Owned DOM excluded, idempotent render, bounded refresh; observer-quiescence browser test.

## XT-007 — Whole-video null time becomes zero

**Priority:** P1 · **Evidence:** VERIFIED defect · **Owner:** C-09

**Source:** `ext/content/youtube.js:render/interval`.

**Trigger / mechanism:** Number(null) is finite zero, so bare-video entries qualify as markers/toasts.

**Required acceptance:** Explicit null guard; zero-second notes retained; bare-video notes produce neither timed affordance.

## XT-008 — Capture pacing does not enforce Chrome rate limit

**Priority:** P1 · **Evidence:** SOURCE/platform risk · **Owner:** C-08

**Source:** `ext/sidepanel/app.js:makeFullSnapshot`.

**Trigger / mechanism:** 140 ms delay does not guarantee <=2 capture calls/second.

**Required acceptance:** Central limiter/backoff and rate-limit failure test, with finally restoration.

## XT-009 — Screenshot and extracted page may differ

**Priority:** P1 · **Evidence:** CURRENT defect/race · **Owner:** C-08

**Source:** `ext/sidepanel/app.js:makeVisibleSnapshot/makeFullSnapshot`.

**Trigger / mechanism:** Active-window capture versus saved tabId plus live context queries; navigation not pinned.

**Required acceptance:** Capture token verifies tab/window/document before and after each stage; mismatch aborts.

## XT-010 — Failed tile may leave page scrolled and resources retained

**Priority:** P1 · **Evidence:** CURRENT defect · **Owner:** C-08

**Source:** `ext/sidepanel/app.js:makeFullSnapshot`.

**Trigger / mechanism:** No finally restores scroll; ImageBitmaps not closed; concurrent capture allowed.

**Required acceptance:** Guaranteed cleanup/cancel and one active job per target tab with failure injection.

## XT-011 — Unscriptable/invalid page can target example.com

**Priority:** P1 · **Evidence:** CURRENT defect · **Owner:** C-04

**Source:** `ext/sidepanel/app.js:renderUrl`.

**Trigger / mechanism:** Fallback is a valid real-looking URL and posting is not disabled.

**Required acceptance:** No placeholder target persisted; require explicit valid user target when context unavailable.

## XT-012 — Draft target/quote can become stale or mismatched

**Priority:** P1 · **Evidence:** CURRENT defect · **Owner:** C-04

**Source:** `ext/sidepanel/app.js:refreshContext/loadSchemas`.

**Trigger / mechanism:** Refresh replaces fields but retains body/old nonempty quote; no tab lifecycle subscription.

**Required acceptance:** Separate draft from live context, show binding, explicit rebind action and navigation tests.

## XT-013 — Auto-sync off still permits automatic network paths

**Priority:** P1 · **Evidence:** CURRENT inconsistency · **Owner:** C-06

**Source:** `worker:quickReply; panel:installSchema/loadSchemas`.

**Trigger / mechanism:** Reply always POSTs; schema install always POSTs; schema loads always GET.

**Required acceptance:** Define network preferences and apply consistently; no unexpected traffic in disabled-mode suite.

## XT-014 — API trusts structurally invalid record data

**Priority:** P1 · **Evidence:** CURRENT defect · **Owner:** C-07

**Source:** `server/api/annotations.php; snapshots.php; events.php`.

**Trigger / mechanism:** No full target/key/types/parent/time validation; JSON attachments bypass count checks.

**Required acceptance:** Validate typed envelope before mutation, recompute keys, reject malformed shape with stable errors.

## XT-015 — Untrusted schema kind overrides custom dispatch

**Priority:** P1 · **Evidence:** CURRENT defect · **Owner:** C-02

**Source:** `core/schemas.js:normalizeCustomSchema; both schema loaders`.

**Trigger / mechanism:** Supplied metadata spread overrides kind; remote schemas bypass normalizer.

**Required acceptance:** Reserved-kind dispatch cannot be selected by custom schemas; all ingress validated.

## XT-016 — Changing API base does not migrate sync state

**Priority:** P1 · **Evidence:** CURRENT defect · **Owner:** C-06

**Source:** `core/api.js:settings; panel settings/pull`.

**Trigger / mechanism:** Synced records skipped on new server; relative media may point to wrong destination.

**Required acceptance:** Bind receipts/media to server identity and implement explicit switch/export/import policy.

## XT-017 — Malformed collection silently becomes empty

**Priority:** P1 · **Evidence:** CURRENT integrity risk · **Owner:** C-07

**Source:** `server/api/bootstrap.php:read_collection/mutate_collection`.

**Trigger / mechanism:** Next mutation can replace corrupt corpus with a small new array.

**Required acceptance:** Fail closed, retain corrupt bytes, explicit repair workflow and corruption tests.

## XT-018 — Aggregate save is several independent transactions

**Priority:** P1 · **Evidence:** CURRENT integrity risk · **Owner:** C-05

**Source:** `panel:saveAnnotation; worker:quickCreate; core/db.js`.

**Trigger / mechanism:** Blobs can orphan; event failure after note commit reports operation failure and invites duplicate.

**Required acceptance:** Atomic aggregate where possible; committed-record-aware responses and retry-safe IDs.

## XT-019 — Blank GPS becomes coordinates 0,0

**Priority:** P1 · **Evidence:** VERIFIED defect · **Owner:** C-01

**Source:** `ext/core/anchors.js:makeGpsTarget; web:getTarget`.

**Trigger / mechanism:** Number empty-string coercion; web additionally omits geographic bounds.

**Required acceptance:** Reject blank fields while accepting explicit zero; consistent coordinate/radius validation.

## XT-020 — Fragment authoring and key parity incomplete

**Priority:** P2 · **Evidence:** CURRENT defect · **Owner:** C-01

**Source:** `panel:renderUrl/buildTarget; web targetKey`.

**Trigger / mechanism:** Panel loses initial fragment, web always ignores it.

**Required acceptance:** Preserve/edit fragment and share semantics with migration compatibility tests.

## XT-021 — All-query anchor with no pairs matches extra query

**Priority:** P2 · **Evidence:** VERIFIED defect · **Owner:** C-01

**Source:** `worker:urlTargetMatchesPage`.

**Trigger / mechanism:** Early zero-pair return bypasses all-mode length check.

**Required acceptance:** All-mode empty set matches only empty live query; duplicate-pair tests retained.

## XT-022 — YouTube hostname recognition is permissive/inconsistent

**Priority:** P2 · **Evidence:** VERIFIED/core + CURRENT/web defect · **Owner:** C-01

**Source:** `anchors:youtubeInfo; web:getTarget`.

**Trigger / mechanism:** Substring spoof hosts accepted; web accepts v on unrelated hosts and lacks Shorts support.

**Required acceptance:** Strict allowed-host parser shared by both clients; canonical ID validation fixture suite.

## XT-023 — Schema constraints and scalar conversions differ

**Priority:** P2 · **Evidence:** CURRENT gap · **Owner:** C-02

**Source:** `core/schemas.js; both form controllers`.

**Trigger / mechanism:** Required-only validator, permissive unions, numeric enum web strings, missing defaults/ranges.

**Required acceptance:** Document/enforce exact supported subset and same typed values across both clients.

## XT-024 — Context Here can show all data or lag form

**Priority:** P2 · **Evidence:** CURRENT defect · **Owner:** C-04

**Source:** `panel:renderFeed/event bindings`.

**Trigger / mechanism:** Invalid target skips filtering; ordinary field edits do not rerender.

**Required acceptance:** Invalid-target explicit state and consistent resolver update triggers.

## XT-025 — Reply status is misleading and validation incomplete

**Priority:** P2 · **Evidence:** CURRENT inconsistency · **Owner:** C-04

**Source:** `worker:quickReply; youtube:reply handler`.

**Trigger / mechanism:** Empty message can be stored via bus; ignores sync errors; UI ignores ok false; no event/refresh.

**Required acceptance:** Use shared creation service, validate body, return commit/sync result, truthful UI.

## XT-026 — YouTube navigation and toast lifecycle races

**Priority:** P2 · **Evidence:** SOURCE risk · **Owner:** C-09

**Source:** `youtube:refresh/interval/ensureUi`.

**Trigger / mechanism:** Concurrent refreshes can resolve out of order; missing progress can leave toast undefined; stale ID/second state.

**Required acceptance:** Generation tokens, clear on navigation, guard unavailable player, detach cleanup.

## XT-027 — Interactive cards cannot be dismissed reliably

**Priority:** P2 · **Evidence:** CURRENT UX gap · **Owner:** C-09

**Source:** `youtube:showCard`.

**Trigger / mechanism:** No explicit close/outside/Escape; narrow left positioning may be negative.

**Required acceptance:** Keyboard/pointer dismiss and viewport-bounded placement tests.

## XT-028 — Full-page label can hide clipping or extraction loss

**Priority:** P2 · **Evidence:** CURRENT limitation · **Owner:** C-08

**Source:** `panel:makeFullSnapshot/persistSnapshot`.

**Trigger / mechanism:** Dimension clamps, no quality flags; extraction errors default to empty text/HTML.

**Required acceptance:** Coverage/truncation/error metadata, explicit partial capture, no false complete label.

## XT-029 — Memory and screenshot upload budgets differ

**Priority:** P2 · **Evidence:** CURRENT risk · **Owner:** C-08

**Source:** `panel capture/compare; api upload limits`.

**Trigger / mechanism:** Potential large canvases/retained tiles, PNG can exceed server 8 MiB.

**Required acceptance:** Memory preflight, measured budgets and upload-size outcome without local loss.

## XT-030 — Rescaling can obscure dimension changes

**Priority:** P2 · **Evidence:** CURRENT limitation · **Owner:** C-08

**Source:** `panel:compareLatest`.

**Trigger / mechanism:** Both entire images distorted into common min rectangle; mixed capture modes accepted.

**Required acceptance:** Version algorithm, show dimension/mode changes and compatible comparison policy.

## XT-031 — No remote snapshot restore or event sync

**Priority:** P2 · **Evidence:** CURRENT gap · **Owner:** C-06

**Source:** `core/api.js; panel sync`.

**Trigger / mechanism:** Endpoints exist, corresponding client bridge does not.

**Required acceptance:** Label direction accurately; restore requires metadata plus verified media, event purpose decision.

## XT-032 — No deletion/tombstone reconciliation

**Priority:** P2 · **Evidence:** CURRENT gap · **Owner:** C-06

**Source:** `all sync paths; API DELETE`.

**Trigger / mechanism:** Remote absence does not delete local record; cached schemas can be republished.

**Required acceptance:** Versioned tombstones and explicit conflict/retention semantics before delete UI rollout.

## XT-033 — Media written before validation and duplicated on retry

**Priority:** P2 · **Evidence:** CURRENT risk · **Owner:** C-07

**Source:** `api/bootstrap.php:save_uploaded_images; POST endpoints`.

**Trigger / mechanism:** No transactional rollback/idempotency/GC; extra snapshot files unreferenced.

**Required acceptance:** Prevalidate, stage/commit, stable media identity, cleanup and retry tests.

## XT-034 — No timeouts and incomplete sync summaries

**Priority:** P2 · **Evidence:** CURRENT limitation · **Owner:** C-06

**Source:** `core/api.js:api; panel:pull`.

**Trigger / mechanism:** Fetch can wait indefinitely; item errors swallowed; stale syncError may remain after success.

**Required acceptance:** Abortable network, per-item result ledger, truthful completion and clear resolved errors.

## XT-035 — Object URLs and stored media accumulate

**Priority:** P2 · **Evidence:** CURRENT resource gap · **Owner:** C-05

**Source:** `panel/web previews/feed/timeline`.

**Trigger / mechanism:** Most object URLs not revoked; no blob/media reference lifecycle or retention.

**Required acceptance:** Dispose views, preserve ownership refs, quota/retention design and stress check.

## XT-036 — No complete backup/import or migrations

**Priority:** P2 · **Evidence:** CURRENT gap · **Owner:** C-05

**Source:** `panel:exportMetadata; core/db.js`.

**Trigger / mechanism:** Export omits binaries/settings; DB remains v1 with no upgrade/recovery protocol.

**Required acceptance:** Versioned lossless export/import with hashes and migration fixtures before schema/storage changes.

## XT-037 — Whole-corpus queries and full-file rewrites

**Priority:** P2 · **Evidence:** CURRENT performance gap · **Owner:** C-06

**Source:** `worker lookups; panel feeds; server collections`.

**Trigger / mechanism:** Video/recent refresh may pull all notes; loops scan all; HTML/text inflate snapshot JSON.

**Required acceptance:** Measure corpus budgets, indexed/delta/paginated queries and bounded concurrency.

## XT-038 — Page and server see sensitive content through intended paths

**Priority:** P2 · **Evidence:** CURRENT privacy boundary · **Owner:** C-03

**Source:** `quick bar open Shadow DOM; auto-sync defaults; image URLs`.

**Trigger / mechanism:** Draft/quote DOM visible to host; no redaction/exclusions; remote image origins unrestricted.

**Required acceptance:** Document surface trust, per-origin capture policy and governed remote media loads.

## XT-039 — Web failure handling/offline behavior weak

**Priority:** P2 · **Evidence:** CURRENT resilience gap · **Owner:** C-04

**Source:** `web:initialization/loadFeed/loadSchemas/post`.

**Trigger / mechanism:** No durable drafts, several GET status checks absent, submission not locked.

**Required acceptance:** Explicit loading/error/retry states and duplicate prevention; offline mode remains separately scoped.

## XT-040 — Accessibility coverage incomplete

**Priority:** P2 · **Evidence:** CURRENT accessibility gap · **Owner:** C-04

**Source:** `panel HTML/CSS; content UIs; web shell`.

**Trigger / mechanism:** Unlabeled images, div-click timeline rows, hidden file inputs, dynamic errors and small text.

**Required acceptance:** Keyboard/focus/screen-reader/contrast verification with accessible controls and error links.

## XT-041 — GPS preference suggests behavior panel does not perform

**Priority:** P2 · **Evidence:** CURRENT mismatch · **Owner:** C-01

**Source:** `panel GPS settings/import; web Nearby`.

**Trigger / mechanism:** defaultGpsRadius stored but unused in panel resolver; web uses independent server config.

**Required acceptance:** Explicit Exact/Nearby mode and clearly scoped setting or remove inactive control.

## XT-042 — No end-to-end suite, CI, license or pinned development toolchain

**Priority:** P2 · **Evidence:** CURRENT governance gap · **Owner:** C-10

**Source:** `tests/*; repository root`.

**Trigger / mechanism:** Only small pure tests; earlier checks are not current runtime proof.

**Required acceptance:** Document supported runtimes/distribution decision and required release integration matrix.

## XT-043 — Identity/time canonicalization can drift or collide

**Priority:** P2 · **Evidence:** CURRENT risk · **Owner:** C-01

**Source:** `server timestamps; targetKey rounding/sort`.

**Trigger / mechanism:** LocaleCompare URL sorting, rounded GPS/time keys, arbitrary accepted timestamp formats.

**Required acceptance:** Version explicit canonicalization; collision fixtures; normalized timestamps and migration decision.

## XT-044 — Repeated submit and stale native file selection

**Priority:** P2 · **Evidence:** CURRENT UX defect · **Owner:** C-04

**Source:** `panel:saveAnnotation; web:post; file handlers`.

**Trigger / mechanism:** No full-form submit lock/idempotency; file input value not reset after state clear.

**Required acceptance:** One logical submission per action and predictable reselection of same file.

## XT-045 — Mixed concerns and compressed duplicated source

**Priority:** P3 · **Evidence:** CURRENT maintainability gap · **Owner:** C-10

**Source:** `panel app.js; web app.js; core built-ins; legacy docs`.

**Trigger / mechanism:** Large physical lines obscure logic; unused imports/encoder; stale names/overstated reports.

**Required acceptance:** Incremental module extraction, format source, remove dead code and maintain generated inventories.
