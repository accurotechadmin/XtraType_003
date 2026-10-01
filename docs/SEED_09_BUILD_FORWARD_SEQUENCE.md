# Seed 1 — Build-Forward Sequence

This is a sequencing guide, not a delivery-date promise. It combines the current 2.4 implementation with the companion's C0–C5/D staging while preserving the rule that acceptance evidence must match the stage's exact gates.

## 0. Protect the seed before expansion

Before platform work, keep XtraType 2.4 behavior stable:

- preserve database/record identity and upgrade/recovery path;
- keep current automated tests green and add regression tests for every touched current seam;
- run native Chrome/YouTube/manual acceptance on owner target environments when release readiness matters;
- do not widen public-network exposure merely because the bounded 2.5 account layer exists;
- update `SEED_*` current-truth documents when implementation status changes.

## 1. C1 — PortaShape host/package boundary

Build the smallest replaceable embedded host boundary inside the existing extension distribution:

- package inspection and inert staging;
- installation/effective state model;
- exact operation directory/versioning;
- local revision/site grants and revocation;
- invocation correlation, cancellation semantics and truthful receipts;
- plugin-local repository namespaces;
- event/receipt retention semantics;
- UI contribution cleanup and XtraType client bridge;
- export/import with no transferred grants/secrets.

Do not introduce a remote daemon merely because the contracts are transport-neutral. Do not execute arbitrary downloaded privileged worker code; privileged packages/connectors follow the reviewed host-release catalog decision.

## 2. C2 — Local assistance

With C1 boundaries proven, implement:

- Script Studio editor/library/manifest/revisions/import-export/diagnostics;
- supported userscript profile and registration/execution with site grants;
- Stay D.R.Y. consent, input observation, pattern/template extraction, suggestion UI, variables/defaults and safe insertion.

Keep user script code separated from privileged host code. Keep DRY observation bounded, consented, expiring and unable to implicitly submit/send.

## 3. C3 — Richer XtraType context and publishing

Add richer XtraType sidecars/anchor bundles/relationships without breaking Annotation v2. Then implement Publisher canonical shapes, mappings, fidelity, destination/account references, previews, confirmed plans, representations/replica sets and qualified connector packages.

The two-real-target/two-stub goal remains an acceptance target, not a current provider claim. Every external effect must represent success/failure/unknown truthfully and support reconciliation before retry.

## 4. C4 — Advanced selected behavior

Only after identity/isolation/bounds gates are met, add privileged Script Studio bridge capabilities, DRY finite routines/procedure runs, and promotion paths. Keep explicit step/time bounds and unknown-effect recovery.

## 5. C5 — Additional local clients

Extend web/native local management only where the host can truthfully support operations. Imported records/packages remain inert until local review. A web page/native shell never acquires extension privileges just because it shares contracts.

## D — Deferred broader service plane

XtraType 2.5 includes an explicit owner-directed bounded account/invitation/messaging service on the existing PHP/JSON companion. DEC-09 still applies to expansion beyond that scope: cross-device synchronization, remote execution, generalized remote sharing, platform-wide authoritative ACLs, or public centralized service behavior require a new owner-approved service specification/ADR with threat model, data model, migration and acceptance plan.

## Change-completion checklist

A target component is not “done” merely because code was added. For each substantive change:

1. source implementation exists at a named path;
2. contract/schema/registry rows still match it;
3. permission/effect/commit/failure semantics are explicit;
4. automated tests are added where deterministic;
5. exact acceptance case is run when claiming acceptance;
6. current implementation and file inventories are updated;
7. concern/dependency status is updated without deleting history;
8. `SEED_MANIFEST.json`/checksums are regenerated for a packaged seed/release.
