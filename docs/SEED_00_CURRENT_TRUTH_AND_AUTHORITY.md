# Seed 1 — Current Truth and Authority (SSOT Router)

## Purpose

This document is the top-level **current-truth router** for Seed 1. It does not replace source code, historical canon, or target specifications. It tells a reader which layer answers which kind of question and prevents the term “current” from collapsing different versions into one false timeline.

## Current project truth

| Subject | Truth in Seed 1 | Authority |
|---|---|---|
| Working XtraType implementation | XtraType 2.5.0 | root source + tests + current runtime docs |
| Runtime maturity | local-first invitation multi-user prototype / stabilization candidate | `release-manifest.json`, `docs/VERIFICATION.md` |
| Historical baseline audited by canon | XtraType v2.3 / extension 2.3.0 | `reference/canon/...` |
| Canon document status | v1.0 approval candidate; historical audit/specification layer | canon authority/provenance docs |
| PortaShape companion status | v0.1 target implementation specification | `reference/specs/...` |
| PortaShape host runtime | not implemented in current source | source traversal + 2.4 release manifest |
| Script Studio runtime | not implemented | source traversal + companion |
| Stay D.R.Y. runtime | not implemented | source traversal + companion |
| Universal Publisher / connector runtime | not implemented as companion architecture | source traversal + companion |
| Existing responsive web client | implemented narrow XtraType surface | `server/` + `server/assets/` |
| Native mobile shell | not implemented | companion only |
| Bounded account/invitation/messaging layer | implemented by explicit owner direction; broader cross-device service plane remains deferred | `src/server/Auth.php`, `server/api/{auth,invites,admin,contacts,messages,group-chats}.php`, companion DEC-09 |
| Existing PHP API | implemented local JSON API; **not** the deferred service plane | root server/source |
| Companion acceptance AT001–AT052 | all Not run | companion `registry/acceptance.csv` |

## The Seed 1 status vocabulary

Use these words literally:

- **IMPLEMENTED** — executable source exists in the current root implementation.
- **RECORDED-VERIFIED** — preserved evidence records a check as executed/passing; this does not mean the current reviewer reran it.
- **VERIFIED-NOW** — a current session actually executed the named check and can report environment/results.
- **SPECIFIED** — behavior/contracts are defined but no current runtime implementation is established.
- **EXISTING-NARROW** — a current XtraType behavior supplies part of the concept, but not the full PortaShape contract/component.
- **PARTIAL** — some required behavior exists, with material gaps named explicitly.
- **BLOCKED/DEFERRED** — intentionally not implementable/complete until an approved dependency/specification exists.
- **HISTORICAL** — accurate for a preserved earlier baseline; not automatically current.
- **UNRESOLVED** — evidence does not establish a single truthful answer.

## Authority order by claim type

### Current runtime behavior

1. Current root source and directly associated data/manifest files.
2. Current executable tests and current-session results when actually run.
3. 2.4 release documentation (`docs/ARCHITECTURE.md`, `FEATURE_PARITY.md`, `VERIFICATION.md`, etc.).
4. Seed indexes as navigation/reconciliation aids.
5. Historical canon only for provenance, predecessor behavior, or unresolved background.

If documentation says the runtime does X but the root source demonstrably does Y, report the discrepancy; do not rewrite source truth to fit prose.

### Current project/repository status

1. This file and `SEED_MANIFEST.json`.
2. Root `README.md` and other `SEED_*` documents.
3. The coherency report.
4. Version-specific source/spec evidence.

### Target PortaShape behavior

1. Explicit owner direction recorded in the companion decisions.
2. Companion authority/decision documents.
3. Companion modular specifications.
4. Registry JSON/CSV + contracts/operation bindings.
5. Workbook as a review/planning projection, not runtime authority.

Target text cannot be used as proof that code exists.

### Historical v2.3 behavior and audit findings

1. Canon authority/provenance documents.
2. Frozen `evidence/baseline/` source.
3. Canon concern/verification/evidence files.
4. Legacy reports only with their historical attribution.

For the current status of a canon concern, pair it with root `docs/CONCERN_DISPOSITION.md` and `docs/SEED_08_CONCERN_STATUS_CROSSWALK.md`.

## Version relationship

The version line is:

`v2.3 preserved baseline` → `canon v1.0 audit/approval candidate` → `XtraType 2.4.0 stabilization baseline` → `XtraType 2.5.0 owner-directed feature patch` → **Seed 1 repository** combining the current runtime with the selected PortaShape v0.1 target architecture.

Seed 1 is a repository milestone, not a claim that every target component shipped. The current runtime version is 2.5.0; preserved 2.4 evidence remains historical evidence for that earlier stabilization baseline.

## Non-negotiable current boundaries

- Keep the existing IndexedDB name `portashape-xtratype`, version 1, and current stores unless a migration is explicitly designed and approved.
- Keep `Context.Annotation` v2 and `Revision.Snapshot` v1 compatible unless an explicit migration/version change is authorized.
- JSON is the current server storage engine. A repository seam exists for later adapters; SQL is not implemented.
- The server is local-default but now has a bounded account/session/ACL layer after first registration. Host/origin/client-header controls remain separate defense-in-depth controls and are not substitutes for account authorization.
- Snapshot replication is upload-only; event records are sparse diagnostics, not a replicated event log.
- There is no current distributed tombstone/conflict protocol or complete binary backup/import workflow.
- The PortaShape transport-neutral boundary is a target contract, not evidence of a daemon or remote service.
- Imported packages/scripts must never inherit local execution grants merely because metadata says they were enabled elsewhere.
- Publishing/connector target behavior requires explicit effect/outcome semantics; unknown outcomes cannot be converted into success or blindly retried.
- The deferred service plane remains deferred until a new owner-approved specification changes that decision.

## How to resolve future conflicts

When a new change appears to contradict an older layer:

1. classify the claim as current runtime, current project status, target, verification, or history;
2. cite the exact file/symbol/ID on both sides;
3. preserve historical evidence rather than editing it to look prophetic;
4. update this router and the appropriate current indexes if the project status genuinely changed;
5. update registry/contracts/acceptance status only when their exact meaning changed or was verified.
