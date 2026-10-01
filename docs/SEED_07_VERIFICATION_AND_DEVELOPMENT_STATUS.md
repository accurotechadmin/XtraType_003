# Seed 1 — Verification, Maturity and Development Status

## Package/integrity evidence

The source packages incorporated into Seed 1 were checked before assembly:

- Canon ZIP SHA-256: `91c8136b958cc34e779d99ab53e3e43fa28317aa1f0d0a275e5dd1c610f77eeb`; internal canon checksums/source manifest matched.
- PortaShape companion ZIP SHA-256: `f17270562f080ea403395de37a7ce103e78bae9326d4571d95c90e04987332ac`; package manifest and registry inventory matched.
- XtraType 2.4.0 ZIP SHA-256: `6582239444dbe2177796bbeb5bca162e0f3890e8f5017bc02a7a5e34cc5e7537`; its release checksum inventory matched.

`SHA256SUMS.txt` at the Seed 1 root is regenerated for this assembled repository and excludes only itself.

## Current runtime evidence

Preserved XtraType 2.4.0 evidence records:

- `npm test`: **32 passed, 0 failed, 0 skipped** in the recorded Linux/Node/PHP environment.
- real PHP HTTP coverage for current API families, validation, media and repository failure cases;
- process-concurrency fixture using independent PHP writers;
- jsdom/fake-IndexedDB/mocked-Chrome client tests for many extension behaviors;
- syntax/lint/JSON/reference checks in `docs/evidence/static-checks.json`.

This Seed assembly does not re-label those historical 2.4 results as newly executed unless a later coding session actually runs them. A future session should state its environment and exact command/results separately.

## 2026-10-01 XtraType 2.5.0 working-tree verification

The current patch covers live-navigation refresh, Time anchors, restored URL/Attach-to controls, `Ctrl+Q`, omnibox text transfer, seven-day week-young tree/badge state, Mark all as old, quick Snapshot mode, and the owner-directed account/invitation/contact/DM/XT-Group-Chat layer. The dependency-free anchor/manifest-UI tests, real PHP HTTP integration tests (including invitation chain/admin shutdown controls/messages/group-chat ACLs) and repository concurrency test were executed successfully: **17 selected Node-reported tests passed, 0 failed**. JavaScript syntax checks, PHP lint, JSON parsing and shared-core parity also pass in the packaging pass.

A clean dependency install is unavailable in this environment, so the complete jsdom/fake-IndexedDB suite is not freshly claimed. The preserved **32 passed** record above remains historical 2.4 release evidence. Native Chrome behavior remains an owner-side acceptance gate.

## Explicitly unverified or not certified

The 2.4 evidence explicitly does **not** establish:

- successful native Chrome extension load/visual acceptance in that recorded environment;
- real YouTube SPA/player acceptance;
- native capture fidelity/race/stress behavior across owner target systems;
- full screen-reader/contrast/mobile accessibility acceptance;
- Windows/macOS launcher/filesystem acceptance;
- public multiuser security or production hosting certification;
- distributed conflict safety, tombstones, exactly-once external effects, or complete restore.

## PortaShape structural evidence

The companion package is strongly structurally coherent: registry counts, JSON schemas/examples, operation bindings and workbook projections were checked by its supplied validation evidence and by the coherency review. That establishes a high-quality specification corpus, not executable feature completion.

All companion acceptance cases AT001–AT052 remain **Not run**.

## Current maturity map

| Area | Seed 1 status |
|---|---|
| XtraType core runtime | IMPLEMENTED — 2.5.0 local-first invitation multi-user prototype / stabilization candidate |
| Baseline protection | meaningful stabilization implemented/tested; formal companion C0 acceptance not declared passed |
| PortaShape C1 host/package boundary | SPECIFIED, NOT IMPLEMENTED |
| Script Studio / DRY C2 local assistance | SPECIFIED, NOT IMPLEMENTED |
| C3 richer context/publishing/connectors | SPECIFIED; current XtraType context is only a narrower predecessor |
| C4 typed bridge/finite routines/promotion | SPECIFIED, NOT IMPLEMENTED |
| C5 additional local clients | existing responsive XtraType web is narrow; package/permission/native surfaces not implemented |
| Bounded account/invitation/messaging layer | IMPLEMENTED by explicit owner direction; JSON-backed and local-default |
| D broader cross-device service plane | DEFERRED by explicit decision |

## Release and development truth

Seed 1 should be treated as an **engineering baseline repository**, not as a declaration that XtraType 2.5 is production-certified or that PortaShape is shipped. Its value is that the implementation, historical audit, target architecture, contracts, acceptance cases and current-truth routing now coexist coherently.

A component can advance from SPECIFIED to IMPLEMENTED only when executable source is present. It should advance to VERIFIED only with named evidence. A stage gate should advance only after its exact acceptance criteria are exercised, not by analogy.
