# XtraType — Authority, language and executive decisions

**Canon edition:** 1.0 approval candidate · **Baseline:** supplied v2.3 / extension 2.3.0 · **Audit date:** 2026-10-01

## Authority and evidence precedence

This set supersedes the supplied reports **for the scope approved by the owner**, after approval. Until then it is the proposed replacement canon. It covers the attached source, not an unseen deployed build or unprovided repository history.

Current behavior resolves in this order: exact supplied source and reproducible results; supplied user statement that this iteration works; historical architecture intent; prior descriptive reports. Source inspection establishes implemented control flow; it cannot establish all platform behavior or live-site reliability. The supplied reports' PHP/browser claims are retained as historical evidence and are not borrowed as tests performed in this audit.

For future development, an approved change specification takes precedence over a current defect description. Preserving compatibility means preserving valid records and meaningful contracts, not reproducing bugs. `MUST` in a proposed section means a proposed acceptance requirement awaiting approval. A source assertion and a future requirement must never be silently conflated.

## Naming and compatibility decision

The product, document titles, feature names and future release-facing branding use **XtraType**. PortaShape remains the name for portable record interchange, schema adaptation, local-to-wire transformation, transport, and import/export boundaries. The legacy database identifier `portashape-xtratype` MUST remain unchanged until an explicit migration is implemented. Renaming it cosmetically would create a different database and make existing data appear absent.

Existing literal manifest name `XtraType — PortaShape MVP`, health service string `PortaShape XtraType MVP`, archive filenames and source-history titles remain evidence. Their presence is not a requirement to keep mixed product branding. A later branding patch can change visible strings without changing schema IDs, record types, message names, storage keys or IDs.

## Executive decision register

| ID | Proposed decision | Rationale and implementation consequence |
|---|---|---|
| ADR-001 | XtraType owns product semantics and primary UI | Keep annotation first; capture, history, schemas and automation are supporting capabilities |
| ADR-002 | PortaShape is an explicit interoperability boundary | Group transformations and transport under interfaces; do not claim a separately implemented framework |
| ADR-003 | Preserve typed targets and derived keys | Full target is required; keys are caches/indexes, with migrations when algorithms change |
| ADR-004 | Preserve extension local-first authoring | Commit user intent before network; unify entry-point behavior and retain local binaries |
| ADR-005 | Separate exact identity from contextual applicability | A video-wide view, selected-query resolver and GPS nearby query are distinct operations |
| ADR-006 | Keep the current companion as a development host until hardened | No multi-user or public-service claim without authentication, authorization and protected storage |
| ADR-007 | Fix loss/privacy/observer/capture seams before executable extensions | Userscripts amplify existing privileges; foundation work precedes runtime exposure |
| ADR-008 | Use one semantic implementation across JS hosts | Extract host-neutral constructors, keys and validation; maintain server conformance fixtures independently |
| ADR-009 | Keep schema data separate from executable code | Installing an anchor schema must never execute code or select built-in behavior via untrusted metadata |
| ADR-010 | New captures create new logical observations | Make server immutability explicit later; v2.3 POST currently allows replacement by ID |
| ADR-011 | Do not promise bidirectional sync until reconciliation exists | Directional capability labels and error summaries must reflect reality |
| ADR-012 | Treat userscripts as a new capability with separate trust and lifecycle | Separate registry/permissions from annotations; no execution from arbitrary annotation/schema fields |
| ADR-013 | Adopt migration-first evolution | Never silently change key semantics, storage names, record meaning or server destinations |
| ADR-014 | Defer framework/database selection until a measured requirement | Modular vanilla JS is sufficient for stabilization; future authenticated transactional persistence needs a separate decision |

## Version dimensions

| Dimension | Current value | Meaning |
|---|---|---|
| Extension package | `2.3.0` | Chrome manifest version |
| Source package label | v2.3 | Supplied archive name; no commit ID supplied |
| Canon | 1.0 candidate | Documentation release, independent from executable version |
| IndexedDB | 1 | Physical local store/index schema |
| Annotation | `schemaVersion:2` | Envelope version forced by annotation endpoint |
| Snapshot | `schemaVersion:1` in extension | Endpoint does not force this number |
| Built-in target IDs | `xtratype.anchor.{url,gps,youtube}@1` | Target vocabulary versions |
| Custom target | `$id` chosen by author | No enforced migration or registry version protocol |
| HTTP/message protocols | Unversioned routes and `xtratype:*` | No negotiation/version field |

New releases MUST record these dimensions independently. For any breaking change: document old/new contract, migration, collision handling, rollback and tests. A new field alone does not justify falsely marking existing persisted data as migrated.

## Change control and ownership

Assign engineering ownership by concern, not by the accidental size of a file. Every change request should name its concern ID, records/interfaces affected, behavior change, migration requirement and acceptance cases. One engineer can own several concerns; no staffing structure is assumed.

Approval should record owner, date, canon checksum/version, accepted ADRs, deferred ADRs, and exceptions. Baseline descriptions may be approved separately from userscript scope. Unknown earlier history and unprovided roadmap clauses remain unknown after approval.
