# Seed 1 — Data Workflows, Seams and Commit Boundaries

## 1. Current annotation workflow

**Side panel:** live/preserved browser context (including active-tab, URL, SPA-history and fragment change signals) → target form → shared target validation/key → body/quote/images → `createAnnotation()` → aggregate IndexedDB commit (annotation + blob records + local event) → UI success → optional server sync → later local/server reads. Navigation also refreshes the seven-day unseen badge; when automatic sync is enabled the worker performs a throttled annotation pull before finalizing that badge.

**Quick bar / YouTube reply:** page-owned UI → bounded runtime message → service worker validates caller/context → record creation → local commit → optional sync → truthful success/error response back to page UI.

Important boundaries:

- Local commit precedes remote success; a server failure must not erase the local annotation.
- Attachment records preserve stable attachment IDs and local blob linkage.
- Missing local binary blocks upload instead of silently dropping media.
- Remote pull does not overwrite dirty/error local records.
- Server upsert is not a distributed conflict-resolution protocol.

## 2. Target identity and applicability

Current target types are URL, GPS, Time, YouTube and bounded custom schemas. Time supports either one canonical UTC timestamp or a canonical start/end timeframe. `targetKey()` creates deterministic exact identity. Applicability helpers answer different questions: URL pattern/query rules, GPS radius and YouTube video/time context; generic Time targets intentionally have no page applicability. Exact identity and “does this apply here?” are not interchangeable.

The companion's future Handle/AnchorBundle/relationship model is richer and not yet a replacement for current target records.

## 3. Server write workflow

HTTP request → router/endpoint → bootstrap guard (Host/Origin/client header/request size/content type) → bearer account authorization after first registration where required → JSON/multipart parse → target/record/schema/media validation → media persistence where applicable → `JsonRepository::mutate()` → exclusive lock → decode current array → callback mutation → temp sibling write/flush → atomic rename → JSON response.

There is no atomic transaction spanning media filesystem bytes and JSON metadata. A metadata failure after media persistence can leave an orphan content-addressed media file. There is no automatic garbage collection.

## 4. Sync workflow

Local record → configured API base → bounded HTTP request with timeout → server validation/upsert → local sync-state update. Automatic sync may be disabled; explicit Sync now/Test server remain explicit network actions. Server-base switching is conservatively blocked when local annotations/snapshots exist because there is no media/state migration UI.

Absent today: cross-device conflict resolution, distributed ownership reconciliation, tombstones, exactly-once external effects, and generalized reconciliation. The 2.5 account layer authenticates the central JSON API but does not turn local IndexedDB into a remotely revocable/distributed store.

## 5. Account, invitation and messaging workflow

First registration → seed administrator → subsequent single-use invitation → password hash + user registry + per-user profile JSON documents → bearer session (server stores token hash only). Enabled users may create at most one invitation per fixed-EST calendar day unless invitation creation is disabled globally or for that user. Administrators can disable central system access or individual users. Contact groups live in profile JSON documents; DMs and group-chat messages live in central JSON collections. XT Group Chats use case-sensitive five-character codes and member ACLs; visiting `xtratype.com/gc/#####` causes the side panel to render the authorized chat in the annotation-feed area.

This is a simple local-default service boundary, not public-hosting certification or end-to-end encryption. Disabling an account disables central API use, but cannot remotely erase or revoke already-local IndexedDB data in an installed extension.

## 6. Capture / snapshot workflow

Header Snapshot (full by default, visible-only when selected under Capture) or detailed capture action → active tab → pin tab/window/document/URL/viewport/page metrics → page extraction/scroll requests → worker pacing → `captureVisibleTab()` tiles → canvas assembly → cleanup/scroll restoration attempt → local snapshot + blob aggregate commit → optional snapshot/media upload → local timeline → equal-size pixel comparison.

Limits include 40 million pixels, 28,000 pixels per dimension and 30 tiles in the current implementation. Dynamic document changes cause explicit failure. Sticky/fixed content may repeat. A lost document can prevent successful scroll restoration despite cleanup attempts.

Snapshots are uploaded, but current client behavior does not download/hydrate remote snapshot binaries. The timeline is local-first.

## 7. YouTube projection workflow

YouTube navigation/player identity → query service worker for matching annotations → generation check → markers/toasts → optional reply message → worker/local record path. Bounded polling replaces the old self-triggering broad observer behavior. Navigation/pagehide removes stale UI. Real native YouTube acceptance remains an unrun gate in the preserved release evidence.

## 8. Custom schema workflow

Install JSON schema → bounded normalization profile → reject reserved IDs/kinds and unsupported semantics → local schema store / optional server schema route → dynamic primitive form → client value validation → annotation target → server validation.

The current profile intentionally rejects nested arrays/objects, references, combinators, executable semantics and other unsupported JSON Schema behavior. A custom schema is data, not a plugin.

## 9. Web companion workflow

Responsive web UI → server schema catalog/form → POST annotation/media to local JSON API → server-first feed. Nearby uses browser geolocation against GPS targets. The web client has no extension privileges and no offline local IndexedDB equivalent.

## 10. Future PortaShape package lifecycle

**Specified, not implemented:** package bytes/manifest → inspection/hash/bounds/dependencies → inert installation state → explicit grant review → enablement/effective availability → operation invocation → receipt/event → disable/update/remove/reconciliation.

Installation, enablement, permission and execution are separate states. Imported state never transfers execution grants.

## 11. Future XtraType–PortaShape integration

**Specified:** existing Annotation v2 commit remains first-party XtraType behavior → linked `Context.AnnotationExtension` and richer `AnchorBundle`/relationships in a separate PortaShape-local store → deterministic context operations → UI rendering.

Because the proposed PortaShape DB is separate, no cross-database atomic transaction may be claimed. If the XtraType note commits and the extension/sidecar write fails, the note survives and the sidecar needs explicit pending/recovery semantics.

## 12. Future Script Studio

**Specified:** source authoring/import → immutable revision → supported userscript/profile validation → controlled fixtures/tests → local registration/execution under grants → diagnostics → staged promotion. Initial user script source is not privileged host code and has no automatic privileged bridge.

## 13. Future Stay D.R.Y.

**Specified:** site/surface consent → eligible committed input/action evidence → bounded retention/thresholds → pattern hypothesis → template/routine suggestion → explicit user review → safe insertion or finite routine execution → optional draft promotion.

Sensitive/excluded inputs, composition/focus/value changes, TTL/revocation and “no implicit submit/send” are part of the boundary, not optional polish.

## 14. Future publishing and connectors

**Specified:** canonical Publication → selected destinations/accounts → mapping/fidelity → preview/validation → immutable confirmed plan → per-destination connector effect → result/unknown state → representations/ReplicaSet → inspection/reconciliation/retry only when safe.

A lost response can produce an **unknown outcome**. Unknown is not failure and not success; blind retry is forbidden because it can duplicate external effects.

## 15. Cross-client portability

Portable package/record bundles are designed to be inert until imported and locally reviewed. Grants, credentials and observation buffers are not portable authority. Web/mobile clients can inspect/manage what their host can support but do not gain extension-only capabilities by sharing schemas.
