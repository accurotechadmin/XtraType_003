# XtraType — Stabilization specifications and modular target architecture

**Canon edition:** 1.0 approval candidate · **Baseline:** supplied v2.3 / extension 2.3.0 · **Audit date:** 2026-10-01

## Status and implementation order

Everything in this document is **PROPOSED**. Approval authorizes these specifications as the development baseline; it does not certify that v2.3 already satisfies them. Keep fixes independently reviewable. P0 deployment controls are mandatory before wider hosting; P1 integrity/runtime work precedes userscript expansion. Do not bundle every roadmap item into one rewrite.

## Proposed module interfaces

Paths below are target decomposition, not existing files. Use domain/application/adapter separation while retaining a dependency-light implementation.

| Module | Public responsibilities | May depend on | Must not own |
|---|---|---|---|
| `domain/targets` | parse/validate/normalize/key; explicit `matchesPage`, `matchesVideo`, `matchesLocation` | Pure data/math/URL parsing | DOM, Chrome, HTTP, storage |
| `domain/records` | Annotation/snapshot validation and envelope construction | Targets, ID/time provider interfaces | UI state, upload |
| `domain/schemas` | Supported subset, scalar typing, reserved vocabulary, compatibility | Pure definitions | Execution of schema-provided code |
| `application/annotations` | Create/reply/edit intent, aggregate commit, local result | Repositories, policy, transport scheduler | Site DOM rendering |
| `application/context` | Live context generations and explicit draft binding | Browser-host interface | Rebuilding user draft silently |
| `application/sync` | Outbox, destination binding, revisions/conflicts, per-item results | Repositories, PortaShape adapter | Form-specific validation |
| `application/capture` | Capture job lifecycle, identity pinning, rate/budget/cleanup | Browser host, image processor, snapshot repository | Authentication/session authority |
| `application/history` | Timeline queries and versioned comparisons | Snapshot/blob repositories, comparator | Raw tab operations |
| `adapters/chrome-host` | Context, injection, scrolling, capture, panel opening | Chrome APIs and host permission policy | Domain canonicalization |
| `adapters/indexeddb` | Transactions, indexes, migrations, blob references | IndexedDB | Networking/rendering |
| `portashape/http` | Versioned wire envelopes, multipart transforms, errors/media URLs | Fetch and serialization | Deciding whether unsynced data may be overwritten |
| `portashape/bundles` | Portable manifest/binary export/import, checksum verification | Archive/serialization primitives | Script activation or permission grants |
| `ui/panel`, `ui/quick`, `ui/web` | Typed input, feedback, accessible rendering | Application services / approved broker interfaces | Duplicate domain algorithms |
| `adapters/sites/youtube` | Detect context and project annotations into player | Restricted context/annotation interfaces | General privileged runtime policy |
| `server/domain` and `server/storage` | Independent input/auth validation, revisions, durable persistence | Server platform/storage | Browser-state acquisition |

Adapt names to repository conventions when implementation starts, but preserve dependency rules. Generate/distribute shared JS assets for web/extension only after choosing a source layout; do not casually import extension-only Chrome code into the web origin. PHP needs independently executable conformance fixtures even if JavaScript is shared.

## SP-01 — Reliable context and target construction

**Inputs:** browser context with tab/document generation, user draft, explicit target choice. **Outputs:** validated target/key and source-context provenance, or actionable validation errors. **Related findings:** XT-011,012,019–024,041,043.

MUST reject missing GPS coordinates before number coercion; preserve explicit zero. MUST use strict known YouTube hosts and consistent formats. MUST preserve URL query/fragment intent, distinguish all-query empty set from wildcard, and document sorting/collision semantics. MUST show an invalid-target state instead of falling back to example.com or all notes. MUST bind drafts to their original context until an explicit rebind/clear decision; new context cannot silently mix old quotes with a different target. Form changes update the applicable view consistently.

Acceptance: shared fixtures for blank/zero/bounds, duplicate queries/Unicode/empty-all, fragment include/ignore, known/lookalike hosts, Shorts, zero/bare/range time, custom optional values, type parity and navigation with unsaved text. Before correcting persisted key semantics, inventory affected records, detect collisions and define a versioned reindex plan with rollback.

## SP-02 — One annotation creation service

**Inputs:** target, body, quote, attachment bytes, optional parent ID, settings/policy. **Outputs:** `{localCommit,annotationId,syncOutcome}` with stable operation identity. **Related findings:** XT-013,018,025,034,044.

MUST validate all entry points equivalently, allocate one logical ID per submitted intent, lock duplicate submission, commit note/media relationships atomically where supported, and distinguish event logging failure from failed note commit. Reply validates parent/target/body and honors policy. Quick/panel/web surface differences remain explicit: web can remain server-first unless separately funded. UI must never display remote success based only on an unchecked message response.

Acceptance: storage failure before/after each write, repeated submit, server-offline reply, auto-sync off, max body/file limits, same-file reselection and recoverable retry. A committed note must be returned even if secondary diagnostics fail.

## SP-03 — Durable media and dependable sync

**Inputs:** local record versions and binary references, destination ID, pending operations. **Outputs:** per-record receipts/conflicts/errors and preserved local representation. **Related findings:** XT-003–005,013,016,031–036,037.

MUST keep local Blob reference and stable attachment identity when adding remote media. MUST not treat missing bytes as attachment deletion. MUST use bounded, abortable network calls and clear resolved errors. MUST prevent pulls overwriting dirty records. Before multi-client edits/deletes, define server revision comparison, operation ID idempotency, tombstones, change cursor ordering/retention, conflict UX and lost-response replay. Server changes require a deliberate destination migration; relative URLs alone are insufficient provenance.

Suggested conservative conflict rule: preserve both versions and ask for resolution rather than automatic text merge. This is a proposed rule, not current behavior. Start by preventing overwrite and improving outcomes; introduce a versioned protocol in a separate milestone. Snapshot restore must hydrate bytes and verify hashes before declaring restored. Events remain local diagnostics until a purpose/privacy decision authorizes replication.

Acceptance: offline→online with images; lost POST response→retry; stale remote revision; two clients change same ID; remote delete vs local edit; switched server; missing Blob; interrupted snapshot restore; corrupted media; restart mid-batch. Validate old record compatibility before migration.

## SP-04 — Safe schema vocabulary

**Inputs:** schema definition and declared compatibility version. **Outputs:** installed validated schema or structured unsupported-keyword/type errors. **Related findings:** XT-015,023,043.

MUST normalize every ingress; reject reserved dispatch kind spoofing; preserve enum scalar types; validate the supported subset on client and server. Publish canonical built-in sources and conformance vectors. Installing data must never grant execution. Replacing a schema that changes identity requires a new version/ID or explicit value/key migration. Existing incompatible installed schemas must be quarantined/readable, not silently coerced or deleted.

## SP-05 — Controlled YouTube lifecycle

**Inputs:** document/video generation and annotations. **Outputs:** owned markers/cards/toast, explicit refresh state. **Related findings:** XT-006,007,025–027.

MUST ignore owned DOM mutations, render idempotently, coalesce host changes, discard stale async responses, distinguish null from zero, guard missing player/progress UI and clean up on navigation. Add accessible dismiss and bounded placement. Preserve whole-video notes in the video feed without timed markers. Define toast behavior for seeking and simultaneous timestamps explicitly; do not infer “show every note” from the existing last-toast-wins loop.

Acceptance: controlled player fixture, no-progress case, whole-video/zero/range, multiple same-second notes, repeated navigation, mutation storm and no self-sustaining observer work after idle. Add a live-site smoke check separately because selectors can drift.

## SP-06 — Capture jobs with fidelity reporting

**Inputs:** pinned context and selected capture policy. **Outputs:** complete or explicitly partial snapshot plus quality metadata. **Related findings:** XT-008–010,028–030,035.

MUST rate-limit captures, serialize jobs per tab, verify actual scroll/context, restore state and release resources in finally, handle cancellation and byte/canvas budgets. No silent partial screenshot labeled complete. Extraction error/truncation must be recorded explicitly. The compare algorithm is versioned and dimension/mode compatibility reported. Old snapshots remain readable with quality unknown, not retroactively certified.

Acceptance: fast/slow capture calls, tab switch, navigation, denied injection, failed third tile, cancel, smooth scrolling/sticky/lazy page, high DPR, oversized PNG, memory rejection and restoration. Compare fixtures distinguish rescaling, dimension changes, alpha behavior and threshold boundaries.

## SP-07 — Server integrity and exposure controls

**Inputs:** validated authorized operation; staged media. **Outputs:** committed record/receipt or nonmutating error. **Related findings:** XT-001,002,014,017,033,038.

MUST move private collections outside served paths or deny them independently of API auth, default launch to loopback, validate before media commitment, fail closed on malformed collections, and add authenticated ownership/authorization before wider collaboration. Secure media routes must use the same ownership model. CORS alone is insufficient. Transactional storage technology is an implementation ADR after concurrency/scale requirements; no database product is selected here.

Acceptance: unauthorized API/media/static access, malformed JSON preservation, forged keys/parents, excess JSON attachments, invalid MIME, failed metadata after upload, concurrent same-collection mutations, interrupted writes and restore drill.

## SP-08 — Recovery, accessibility and maintainability

**Related findings:** XT-035–042,045. Provide full portable backup/import before destructive storage migrations; hash binaries and verify restore. Add accessible keyboard controls, named images where meaningful, focus/error semantics and dynamic announcements. Format/extract modules without unrelated behavior changes. Add integration tests for the critical seams and maintain a generated inventory. The acceptance gate is risk-based: do not use passing syntax checks as evidence of browser/runtime correctness.
