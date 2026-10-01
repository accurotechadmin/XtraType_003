# Anti-Drift Guard Dogs

These are not aspirational slogans. They are pre-merge questions. If one “barks,” stop and reconcile the design before proceeding.

## GD-01 — Recognizable product
Would a knowledgeable v.001/v.002 maintainer still recognize the result as a grown XtraType/PortaShape system? If not, the change needs an explicit charter-level decision.

## GD-02 — XtraType stays XtraType
Do not collapse XtraType into PortaShape. XtraType is the contextual application/client. PortaShape is the host/interoperability/plugin/data-transport framework around it.

## GD-03 — Local-first means real local capability
Do not make ordinary personal annotation authoring depend on the server unless a future explicit product decision changes that contract. Local commit and local availability remain first-class.

## GD-04 — Existing identities are compatibility anchors
Do not casually rename/migrate IndexedDB `portashape-xtratype`, Annotation v2, Snapshot v1, anchor identities, or established record fields. Migration requires a designed path, tests, rollback/recovery, and documentation.

## GD-05 — Target is not implementation
Never report PortaShape, Script Studio, Stay D.R.Y., Publisher, connectors, or deferred service-plane capabilities as implemented merely because specifications exist.

## GD-06 — Data is not authority
Imported records/packages/data must not manufacture credentials, sessions, grants, trusted privileged code, or machine-local capabilities.

## GD-07 — Plugin classes stay distinct
Custom schemas, userscripts, ordinary plugins, privileged reviewed packages, and external connectors have different trust/authority models. Do not blur them for convenience.

## GD-08 — Unknown external effects remain unknown
Publishing or connector operations with ambiguous outcomes require reconciliation. Do not blind-retry an effect that may already have happened.

## GD-09 — Page DOM is not a secret boundary
Page-owned overlays or injected UI must not be treated as secure storage for secrets/credentials.

## GD-10 — Server maturity must be stated truthfully
The account/invitation/messaging service exists, but production-scale public hosting, abuse resistance, distributed synchronization, mature identity recovery, and E2E messaging are not automatically solved.

## GD-11 — Evidence wording is exact
Distinguish historical recorded tests, tests actually run now, static checks, mocked tests, native/manual acceptance, and target acceptance not yet run.

## GD-12 — Invitation policy has two separate constraints
The code-level per-user generation cadence and the confidential overall rollout ceiling are distinct. Never infer or publish the owner-held ceiling.

## GD-13 — Current docs synchronize as a set
When current status/version/behavior changes, “update current docs” means updating all affected current pointers and registers, not one convenient README paragraph.

## GD-14 — Historical docs do not go stale
A dated landmark can be old without being wrong. Supersede current guidance through a new layer; preserve the older artifact as provenance.

## GD-15 — Extensibility must preserve user agency
Automation, scripts, plugins, D.R.Y. insertion, publishing, and connectors should remain inspectable, revocable, bounded, and explicit at meaningful effect boundaries.

## GD-16 — Portable contracts should make provenance visible
As data moves among XtraType, PortaShape, clients, plugins, and connectors, preserve stable IDs, provenance, schema/representation identity, and compatibility information.

## GD-17 — A tiny diff can still be an architectural change
Changes to auth, permissions, network effects, migrations, portable data, plugin execution, or trust boundaries require architectural review regardless of line count.

## GD-18 — Do not “fix” legacy by rewriting it
If history contains obsolete status language, leave it in its timestamped context and route readers through current authority documents.
