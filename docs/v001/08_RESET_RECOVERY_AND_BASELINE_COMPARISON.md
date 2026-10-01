# XtraType v.001 — Reset, Recovery, and Baseline Comparison Procedure

Use this when the project feels conceptually lost, after a large refactor, before a major release, or when two branches disagree about what XtraType/PortaShape is supposed to be.

## 1. Verify the sealed predecessor

Run SHA-256 verification against `docs/v001/V001_LEGACY_SEED_SHA256SUMS.txt`. It contains all 260 files present before v.001 instantiation, including the predecessor root checksum file itself.

A mismatch means the legacy standard has been altered. Restore it from the sealed source package before treating the repository as a trustworthy lineage reference.

## 2. Re-read in this order

1. `00_V001_START_HERE.md`
2. v.001 authority + Current Status
3. product ethos + fidelity policy
4. wiring/component map
5. predecessor `docs/SEED_00`, `SEED_03`, `SEED_06`, `SEED_07`, `SEED_09`
6. PortaShape companion authority, architecture, XtraType integration, local/deferred services, verification sequence, change control, decisions
7. historical canon authority/product/architecture/records/anchors/workflows/security/concerns/change specifications/provenance
8. current source for any behavior under discussion

## 3. Compare a future branch against v.001

Create a structured delta:

- file additions/deletions/modifications;
- persisted identifier changes;
- API/operation changes;
- new permissions/trust boundaries;
- new network/external effects;
- new user-visible concepts;
- removed concepts;
- schema/contract version changes;
- migration/recovery behavior;
- verification delta.

Then classify each difference using the change classes in `04_CHANGE_CONTROL_VERSIONING_AND_FIDELITY.md`.

## 4. Run the identity test

Ask whether the branch still preserves:

- XtraType as a context-first application;
- PortaShape as the wraparound host/platform rather than a replacement name for everything;
- local-first durability where promised;
- typed/inspectable context identity;
- explicit package/grant/effect boundaries;
- provenance and compatibility discipline;
- truthful failure/status reporting;
- community extensibility with bounded authority.

If not, either revert/reshape the branch or obtain an explicit owner charter change.

## 5. Recovery hierarchy

When implementation and documents conflict:

- use source for what code actually does now;
- use current forward status for intended current project state;
- use sealed legacy for immutable historical facts and foundational constraints;
- use target specs for behavior not yet implemented;
- record discrepancies instead of choosing whichever source is convenient.

## 6. Never “repair” history

Do not solve a contradiction by editing the old artifact. Add a correction, migration note, or superseding decision with date/version and links to both sides.
