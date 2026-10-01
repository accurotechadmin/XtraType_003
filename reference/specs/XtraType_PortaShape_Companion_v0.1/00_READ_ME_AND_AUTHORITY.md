# XtraType and PortaShape — Companion canon and authority

**Edition:** 0.1 · **Date:** 2026-10-01 · **Status:** user-directed scope; target implementation specification, not implemented functionality

## Purpose

This companion defines PortaShape as the **wraparound service that installs and hosts plugins around XtraType and the selected related modules**. XtraType remains the contextual application and its Chrome extension is a first-party client of PortaShape. PortaShape is now more than the transport boundary described in the preceding XtraType canon. This change comes directly from the owner's latest instruction and governs this companion.

The existing XtraType v1.0 approval-candidate documents remain the source-grounded description of application v2.3/extension 2.3.0. This set adds target specifications. Neither writing these specifications nor selecting a module means that its code has been implemented, tested or deployed.

## Authority order

1. The owner's latest explicit definitions and future corrections govern scope and ownership.
2. This companion's explicit decisions standardize the selected scope. Requirements labeled **DESIGN** fill implementation details not settled by the source; they are reviewable engineering decisions, not quotations of prior canon.
3. The preceding comparison package governs inherited module meanings and identifies gaps/conflicts. Its source locators are retained.
4. Existing XtraType canon governs unchanged current behavior, storage identifiers and compatibility.
5. Prototype prose supplies historical intention where compatible with the above. It cannot establish delivered functionality.

**MUST/MUST NOT** identify target requirements. **SHOULD** requires a documented reason to deviate. **MAY** is optional. User-directed module assignments are settled scope. New engineering choices are this edition's proposed implementation standard and can be revised by the owner without rewriting history.

## Selected ownership

| Module ID | Concern | Placement | Delivery status |
|---|---|---|---|
| PS | PortaShape wraparound service | Core host and common boundary | New implementation |
| XT | XtraType context layer | Core XtraType Chrome extension client, not a user-installed plugin | v2.3 foundation plus selected extensions |
| SS | Script Studio | Installable PortaShape plugin | New implementation |
| DRY | Stay D.R.Y. | Installable PortaShape plugin serving browser text-input interactions | New implementation |
| PUB | Bridges / Universal Publisher | PortaShape core feature | New implementation |
| EXT | External-platform connector packages | Installable PortaShape plugins, one platform family per package | New implementation; each platform independently qualified |
| UI | Web/mobile surfaces | Shared clients for the selected modules | Existing narrow web companion plus new local/management surfaces |
| DOC | Glossary and relational registry | Shared documentation/change-control assets | Supplied in this companion |

Backend/API/identity/sync is **deferred** across all selected modules. No new backend endpoints, account service, sync service, cloud package registry, credential vault or remote execution service is specified for implementation in this edition. The current PHP companion remains documented legacy functionality; deferral does not pretend it disappears.

The omitted master-system project, POSH project, standalone Runtime, Object Click project and LLM-harvesting project are not imported. Necessary installation, validation and bounded invocation behavior is specified only as internal PortaShape host responsibilities. This does not reinstate those omitted projects under new module IDs. Chat automation and conversation harvesting are absent from this implementation scope.

## Reading order and normative homes

| Document | Responsibility |
|---|---|
| 01 | Service architecture, deployment boundary, ownership and failure isolation |
| 02 | Plugin packages, installation, update, grants and lifecycle |
| 03 | Shared records, operations, events, errors and contract rules |
| 04 | XtraType integration, anchors, context relationships and compatibility |
| 05 | Script Studio authoring, userscript execution, fixtures and promotion |
| 06 | Stay D.R.Y. consent, input assistance, pattern extraction and routines |
| 07 | Core publishing, identity, transformations, previews and replicas |
| 08 | External-platform plugin standard and conformance |
| 09 | Web/mobile surfaces and execution availability |
| 10 | Local persistence, recovery, export and deferred dependencies |
| 11 | Implementation sequence and acceptance gates |
| 12 | Glossary, registry authority and maintenance procedure |
| 13 | Source mapping and explicit decisions |
| 14 | Generated structural field reference and schema/example links |

The registry indexes components, records, operations, permissions, interactions, surfaces, stages and tests. Detailed behavior belongs in these documents and the contract schemas. A spreadsheet status cell is not evidence that a feature exists.

## Changes to prior decisions

- Earlier XtraType ADR-002's “PortaShape is only an interoperability boundary” is superseded for target architecture. PortaShape now also hosts plugin installation and shared services.
- XtraType remains the contextual application. Its internal annotation semantics and v2 storage names are not rebranded into a generic object store.
- The prior userscript first slice remains the initial execution profile. Script Studio's fuller typed tooling and explicitly granted bridges are now selected later stages, rather than assumed unavailable forever.
- Source dependency references to omitted projects are replaced only by the finite host responsibilities described here. No dependency on an omitted project may enter a selected module's manifest.
- Old “MVP-1/R1/R2” labels are replaced by companion stages C0–C5. Those labels do not alter the existing application's version or the old canon's stabilization findings.
- The selected source meaning of sharing, groups, account management and continuity is preserved, but execution requiring the deferred service plane is blocked. A local privacy label is not an enforced remote ACL.

## Baseline and next architecture boundary

**DESIGN:** initially host PortaShape inside the existing extension distribution, behind a transport-neutral facade. “Service” denotes an owned lifecycle and API boundary, not a newly assumed HTTP daemon. Pure contracts and transformations can be reused by web/mobile clients. Browser operations stay in the browser host. A future process/package split requires an explicit deployment ADR; it must preserve these contracts.

The owner indicated further architectural detail may follow. This edition records the above deployable default rather than inventing an unseen server or final cross-device topology. Future corrections replace the relevant design decision; current behavior remains accurately documented.

## Deliverables and review

The package includes modular Markdown documents, one reading edition, a relational `.xlsx` registry, its normalized JSON source, structural JSON schemas, examples, validation evidence and hashes. Contract examples are synthetic. The schemas validate structure; authorization, referential integrity, lifecycle and algorithmic semantics require the specified implementation tests.

No original canon or application file is modified. Approving this target set must not be recorded as approval of unimplemented capabilities or as a change to the historical v2.3 evidence.
