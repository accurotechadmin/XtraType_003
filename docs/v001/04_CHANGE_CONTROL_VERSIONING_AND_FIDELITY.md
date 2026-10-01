# XtraType v.001 — Change Control, Versioning, and Fidelity Policy

## 1. Forward version line

The canonical forward development line starts at **v.001**. Expect many small increments before a public 1.0-quality release. The numbering communicates deliberate early-stage evolution, not instability as an excuse for incompatible change.

The frozen predecessor source contains `2.5.0` identifiers. Do not rewrite those historical files merely to make the timeline cosmetically uniform.

### Technical version identifiers

Before the first post-v.001 code-bearing release, record a small version-mapping decision for Chrome/package/server metadata. The canonical human/project label remains v.00N. Technical fields must be valid for their platform and must map unambiguously to the canonical release. Do not invent a platform-version mapping ad hoc inside a feature patch.

## 2. Every forward release gets a delta record

For every v.00N increment that changes code, contracts, data, security posture, or target architecture, create a timestamped release/status document containing:

- predecessor version;
- exact changed files;
- behavioral delta;
- migrations/compatibility impact;
- tests actually run and tests not run;
- new/deferred risks;
- contract/registry/acceptance changes;
- checksum/package identity.

Never use “all tests passed” without naming the suite/environment.

## 3. Legacy preservation rule

The 260-file predecessor baseline is immutable. If a future change wants to “fix” an old document, create a new correction/decision that cites the old text and explains the correction. Do not patch the sealed artifact.

The same append-only rule should be used for important future milestones: seal them, then evolve above them.

## 4. Compatibility classes

Classify each change before implementation:

- **A — additive compatible:** new UI, operation, optional field, package, or behavior that preserves existing readers/writers.
- **B — corrective compatible:** fixes behavior while preserving record identity/contracts.
- **C — versioned migration:** changes persisted shape/identifier/storage and needs explicit migration, rollback, validation, and recovery.
- **D — trust-boundary change:** changes permissions, authentication, exposure, execution privilege, external effects, or data visibility; requires threat-model update and security acceptance.
- **E — charter change:** changes what XtraType/PortaShape fundamentally is; requires explicit owner decision and a recorded supersession statement.

A patch may have multiple classes; use the highest-risk obligations.

## 5. Completion standard

A feature is not complete because code compiles. For a substantive change, reconcile as applicable:

1. source implementation;
2. browser/server/shared-contract parity;
3. persisted-record compatibility or migration;
4. UI/accessibility/error states;
5. authorization/capability checks;
6. deterministic tests;
7. native/manual acceptance where mocks cannot establish truth;
8. current status/component/workflow docs;
9. PortaShape registry/contracts/acceptance when target semantics change;
10. release manifest/checksums and change record.

## 6. Data migration discipline

Never casually change:

- IndexedDB database `portashape-xtratype` or version/stores;
- `Context.Annotation` v2;
- `Revision.Snapshot` v1;
- target key canonicalization;
- server collection meaning;
- account/profile identifiers;
- group-chat code semantics.

A migration needs inventory, old/new contract, conversion, idempotence/retry story, backup/recovery, failure handling, and tests against real representative data.

## 7. Architecture fidelity

Prefer adapters and explicit seams over rewrites that erase lineage. Examples:

- new server storage engine behind a repository interface rather than changing API semantics by accident;
- PortaShape-local sidecars around Annotation v2 rather than renaming the annotation store into a generic object store;
- new clients that consume shared contracts but truthfully omit unavailable browser privileges;
- external connectors through qualified packages and effect receipts rather than arbitrary browser automation hidden in core.

## 8. Scope expansion rule

New social, remote, AI, automation, payment, publication, or external-platform capabilities should arrive with an explicit answer to:

- who owns the data;
- who may read/write/execute;
- what persists locally/remotely;
- what is portable;
- what can be revoked;
- what happens on partial failure;
- what is observable/auditable;
- what acceptance demonstrates safety and correctness.

## 9. Documentation freshness without historical rewriting

“Current” documents are replaceable landmarks. Historical documents are immutable. When current status advances, create a new timestamped current-status document and make the newest router point to it; never mutate the old landmark into the future.

## 10. Definition of project drift

Drift is not merely adding an unplanned feature. Drift is a sequence of changes that makes the system no longer explainable as a compatible growth of the sealed baseline plus explicit owner-approved decisions. The remedy is not cosmetic renaming; it is to compare against v.001, identify the divergence, and either restore fidelity or record a conscious charter change.
