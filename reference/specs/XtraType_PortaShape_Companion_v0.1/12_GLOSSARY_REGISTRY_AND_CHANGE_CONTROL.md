# XtraType and PortaShape — Glossary and relational registry standard

**Edition:** 0.1 · **Date:** 2026-10-01 · **Status:** user-directed scope; target implementation specification, not implemented functionality

## Canonical vocabulary

| Term | Meaning in this companion |
|---|---|
| PortaShape | Wraparound plugin service and owner of core interoperability/publishing around the selected clients/modules |
| XtraType | Contextual application; first-party Chrome extension client with preserved annotation/capture foundation |
| Plugin | Installable package with provider identity, revision, lifecycle, operation declarations and grants |
| Core feature | Built-in owned responsibility, not removable through the user plugin manager |
| Script Studio | Plugin for user JavaScript authoring, execution, tests, packages and promotion |
| Stay D.R.Y. | Plugin for consented input assistance and extraction of explicit reusable helpers/routines/procedures |
| Bridges | Core contracts and transformations connecting canonical content to platform-specific representations |
| Universal Publisher | Core compose/preview/confirm/execute/replica flow over selected connectors |
| Connector | Platform plugin; declared operations and transforms for one platform family |
| Destination | Configured target instance/account and defaults, separate from connector implementation |
| Object | Conceptual identity preserved across explicitly linked representations |
| Handle | Locator/reference for a representation, with evidence; not automatic identity equivalence |
| Shape/schema | Named record representation and structural constraints; not executable plugin code |
| Mapping/transform | Declared field correspondence and conversion with fidelity; not implicit format guessing |
| Capability/operation | Named versioned callable behavior with typed I/O, locality and required authority |
| Policy/grant | Governing rule and concrete local authorization; package declarations request but do not grant it |
| Package/revision | Portable artifact set and immutable content version; installed/effective state stays local |
| Anchor bundle | Redundant evidence for resolving a contextual passage; distinct from quoted text |
| AnnotationExtension | Companion record linking added context fields to an unchanged v2 annotation |
| Context relationship | Typed directional link such as corrects, references or alternative-to |
| Template/helper | Reusable text with explicit variables/defaults, inserted only after current-context checks |
| Pattern hypothesis | Explained candidate repetition, awaiting user acceptance |
| Routine/procedure | Reviewed reusable finite method with declared inputs/steps/outputs/conditions; no automatic grant |
| Run/invocation | Particular local execution and individual operation request, distinct from the reusable definition |
| ReplicaSet | One Publication Object linked to per-platform representations and outcomes |
| Fidelity report | What conversion preserves, approximates, drops or still requires |
| Provenance/receipt | Causal/versioned evidence and outcome of a specific action; local logs are not tamper-proof audit infrastructure |
| CredentialReference | Opaque local reference to authorized account material; never the secret value |
| Surface/locality | UI or execution environment and the actual place a capability can run |
| Deferred service | Explicitly unimplemented backend/identity/sync dependency, not a placeholder success path |

The glossary uses source meanings for the selected concerns while applying the owner's new PortaShape placement. It does not import every old glossary term as a module or implementation requirement.

## Registry contents

The workbook has distinct tables for modules, components, contracts, operations, permissions, interactions, surfaces, stages, acceptance cases, decisions and source traceability, with a summary showing actual row counts and status counts. It replaces the old all-to-all project matrix with specific selected seams. No relationship is implied just because two modules exist.

Stable IDs are preserved in documents and machine JSON. New host components use `PS-Cxx`; imported component IDs retain a `LEGACY-Cnnn` source reference while receiving an owned companion ID. Every row has a normative document and source/decision reference. Changing a display name must not change stable identity.

## Authority between documents, schemas and workbook

- These specifications own behavioral meaning and scope.
- JSON schemas own the stated structural validation for their version, subject to this edition's semantic rules.
- `registry/registry.json` is the normalized authoring source for the generated registry workbook and Markdown inventory.
- The `.xlsx` is an editable review/index surface. Workbook edits are proposed changes until reconciled into the normalized source and the owning specification in the same change.
- Runtime discovery/installation state comes from the host, never from the planning workbook.

Do not maintain two independently authoritative field definitions in spreadsheet prose and JSON schema. The registry links to the schema/document and records ownership/status; detailed field meaning remains at its canonical home.

## Regular maintenance procedure

Update the registry whenever a module/component/operation/record/permission/surface is added, changed, deferred, deprecated or removed, and before every companion release. This is an engineering change-control requirement, not a background scheduled service.

The change author records a change ID, owner, rationale, old/new contract version, affected IDs, migration/rollback, grant impact and acceptance evidence. Review checks unique IDs, valid references, no prohibited module dependencies, correct selected/deferred status, matching schema examples and truthful implementation status. Regenerate workbook/counts/reading edition/hashes from the accepted normalized data. Preserve removed IDs as retired references where historical records depend on them; never reuse an ID for unrelated semantics.

## Status vocabulary

`specified`: target requirement with no delivered source evidence. `existing-narrow`: part of current XtraType behaves similarly, with the difference explicitly documented. `implemented`: linked build source exists. `verified`: acceptance evidence exists for the stated environment. `blocked-dependency`: selected behavior cannot operate under current deferred prerequisites. `deferred`: deliberately not in implementation scope. `retired`: retained only for history. Approval status and implementation status are separate columns/records.

## Change compatibility

Breaking operation/record changes require a new major/schema version and migration plan. Additive optional inert metadata can use a minor contract documentation revision only when old consumers remain correct. A field that changes identity, authority, side effects or matching is behaviorally significant even when the JSON parser still accepts it. Package updates never turn compatibility metadata into permission grants.

## Source provenance

Primary scope is the owner's latest module selection. Inherited definitions come from the immediately preceding comparison package and its D00/D05/D06/D07/D08/D11/D12/W references. D10 is present only as the deferred boundary. The source's cited public-release overview remains unprovided. Detailed mappings and deliberate dependency substitutions appear in document 13. No historical claim is silently promoted into current implementation evidence.

## Owned component index

| ID | Component | Responsibility | Status / stage | Source |
| --- | --- | --- | --- | --- |
| DOC-C01 | Glossary | Selected semantic vocabulary and authority | specified / C1 | D12; USER |
| DOC-C02 | Relational registry | Versioned engineering index updated with each change | specified / C1 | W; USER |

