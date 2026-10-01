# XtraType — Seed Repository 1

**Repository seed:** Seed 1  
**Current implemented XtraType runtime:** 2.5.0  
**Runtime maturity:** local-first invitation multi-user prototype / stabilization candidate  
**PortaShape architecture:** instantiated in this repository as specifications, contracts, registries, examples, and development boundaries; runtime host/plugins are not yet implemented  
**Seed date:** 2026-10-01

This snapshot is the **first official instantiated seed version of the XtraType repository**. It establishes one coherent home for the working XtraType application, the PortaShape wraparound platform architecture, the selected plugin/module specifications, the historical canon and evidence, and the current-truth indexes needed to build forward without confusing history, implementation, and intent.

“Instantiated seed” has a precise meaning here: **the repository and architecture are instantiated; not every specified runtime is implemented.** The working code today is XtraType 2.5.0. It now includes a bounded JSON-backed account/invitation/messaging layer added by explicit owner direction. PortaShape, Script Studio, Stay D.R.Y., Universal Publisher/Bridges, external connector packages, the broader package/permission host surfaces, and the broader cross-device identity/sync service plane remain represented by reviewed specifications and machine-readable contracts that define what will be built next.

## Start here

For any engineering or review session, read these in order:

1. `docs/SEED_00_CURRENT_TRUTH_AND_AUTHORITY.md` — the current-truth/SSOT router.
2. `docs/SEED_01_REPOSITORY_INDEX.md` — where everything lives.
3. `docs/SEED_03_CURRENT_IMPLEMENTATION_COMPONENTS.md` — what actually exists in code now.
4. `docs/SEED_04_PORTASHAPE_TARGET_ARCHITECTURE.md` — what the wraparound platform and selected modules specify next.
5. `docs/SEED_06_DATA_WORKFLOWS_AND_SEAMS.md` — current and target data/control flows.
6. `docs/SEED_07_VERIFICATION_AND_DEVELOPMENT_STATUS.md` — what has and has not been verified.
7. `EXPERT_SESSION_BOOT_PROMPT.md` — onboarding prompt for a fresh coding/development LLM session.

`docs/SEED_02_FILE_INVENTORY.md` and `docs/inventory/FILES.csv` provide the exhaustive file map. `docs/SEED_05_CONTRACT_AND_OPERATION_INDEX.md` indexes all PortaShape contracts/operations/permissions. `docs/SEED_08_CONCERN_STATUS_CROSSWALK.md` ties the v2.3 audit findings to the 2.4 implementation. `docs/SEED_09_BUILD_FORWARD_SEQUENCE.md` establishes a safe build order from this seed.

## What is implemented now

The root runtime is XtraType 2.5.0: a Manifest V3 Chrome extension plus a local-default PHP/JSON web/API companion. It implements typed URL/GPS/Time/YouTube/custom annotation targets, annotation/image storage, a live-navigation side-panel composer and contextual feed, quick-bar creation, YouTube projection/replies, local IndexedDB, controlled server replication, viewport/full-page snapshots, timeline/pixel comparison, custom schema installation, and the responsive web client. `Ctrl+Q` toggles the side panel. The omnibox keyword `xt` followed by Space lets the user type annotation text directly in the omnibox; Enter opens the side panel, refreshes the active page/highlighted selection, transfers the typed text into the comment textarea, and focuses the composer. Recent annotations remain week-young for seven days, including the user's own posts, and show a green tree marker/badge until they age out or the user explicitly chooses **Mark all as old**. A header Snapshot button defaults to full-page capture and can be changed to visible-only capture under Capture.

The PHP/JSON companion now also implements a bounded account layer: first-registration seed administrator, single-use invitations, one invite creation per fixed-EST calendar day, administrator global/per-user enable controls, per-user JSON profile documents, contact groups, direct messages, and access-controlled XT Group Chats addressed by case-sensitive five-character `xtratype.com/gc/#####` codes. Passwords are stored as password hashes and bearer session tokens are stored server-side only as hashes. This is not public-hosting certification: there is still no TLS termination supplied by the app, end-to-end message encryption, conflict-safe distributed editing, tombstone protocol, complete binary restore/import system, remote snapshot hydration, or broader cross-device identity/sync service plane.

## What this seed adds around that runtime

The repository now includes the full PortaShape v0.1 target architecture and its selected ecosystem:

- **PortaShape host/service boundary** — installation, package lifecycle, local grants, operation routing, receipts/events, repository namespaces, and UI/client seams.
- **XtraType first-party integration** — keeps XtraType primary and preserves existing annotation/database compatibility while specifying richer anchors, relationships, sidecars, and context operations.
- **Script Studio** — installable PortaShape plugin for bounded userscript authoring, revisions, testing, registration, diagnostics, and staged promotion.
- **Stay D.R.Y.** — installable consented text-assistance plugin for bounded observation, patterns, templates, insertion, finite routines, and promotion.
- **Bridges / Universal Publisher** — PortaShape core publishing feature for canonical publications, explicit mappings, fidelity, previews, confirmation, effects, representations, and replica sets.
- **External platform connectors** — separate plugin family for provider-specific transforms and authorized effects.
- **Shared web/mobile direction** — local management and portable/inert records with explicit host capability limits.
- **Glossary, registry, contracts, examples, and acceptance inventory** — the semantic and change-control foundation for implementation.

None of those statements should be read as claiming the PortaShape runtime or plugins already execute. Their current truth is **specified and repository-instantiated** unless the current implementation index explicitly says otherwise.

## Authority model

When sources disagree, distinguish the kind of claim before deciding precedence:

- **Current runtime behavior:** root source code and tests for XtraType 2.5.0, interpreted with the root seed current-truth documents.
- **Current repository/project status:** `docs/SEED_00_CURRENT_TRUTH_AND_AUTHORITY.md`, this README, `SEED_MANIFEST.json`, and the other `SEED_*` indexes.
- **2.4 release evidence and constraints:** existing root `docs/*.md`, `release-manifest.json`, and `docs/evidence/*`.
- **Target PortaShape behavior:** `reference/specs/XtraType_PortaShape_Companion_v0.1/`, especially its authority/decision documents, registry, contracts, and operation bindings.
- **Historical v2.3 evidence:** `reference/canon/XtraType_Canon_v1.0_candidate/`. It remains historical audit truth and must not be silently rewritten as 2.4 behavior.
- **Coherency reconciliation:** `reports/XtraType_PortaShape_Coherency_Report_2026-10-01.md`.

A specification never proves implementation. A test fixture never proves native-browser behavior. An old defect never remains “current” merely because it is still historically documented.

## Run and verify the current runtime

Use `docs/UPGRADE_AND_RECOVERY.md` before touching existing owner data. For a clean local development copy, the existing runtime instructions apply: PHP 8.2+ with `json` and `fileinfo`, then `./start-server.sh` or `start-server.bat`; load `ext/` unpacked in Chrome. The server launcher binds to loopback by default.

Developer verification is `npm ci` followed by `npm test`. The preserved 2.4 release evidence records 32 passing automated tests with no failures/skips in its recorded environment. Native Chrome extension acceptance and real YouTube acceptance were not completed in that evidence set; do not upgrade recorded evidence into certification.

## Build-forward rule

From this seed onward, implementation work should preserve the separation among **implemented**, **verified**, **specified**, **blocked/deferred**, and **historical**. When a target component becomes real, update its code, tests, acceptance evidence, registry status, current implementation index, and any affected contracts in one coherent change. Do not mark a companion acceptance case passed merely because a related unit test exists.

The goal of this seed is simple: **there is now one repository where the working XtraType core and the complete selected PortaShape direction can evolve together without losing provenance or current truth.**
