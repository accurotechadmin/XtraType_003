# PortaShape and XtraType — Local data and deferred-service boundary

**Edition:** 0.1 · **Date:** 2026-10-01 · **Status:** user-directed scope; target implementation specification, not implemented functionality

## Local persistence ownership

**DESIGN:** create a separate IndexedDB database `portashape-local`, version 1, in the host origin. Preserve the existing `portashape-xtratype` database and all current keys. Other web/mobile origins have independent stores; identical names do not mean shared data or synchronization.

| Store | Key / indexes | Owner and semantics |
|---|---|---|
| packages | `id`; kind | Installed manifest and current revision selection |
| revisions | `id`; packageId, digest | Immutable source/manifest/file metadata |
| installations | `packageId`; desiredState, effectiveState | Local lifecycle/reconciliation state |
| grants | `id`; principalId, packageId, revokedAt | Local authority; never portable |
| records | `id`; recordType, ownerId, updatedAt | Selected shared/domain records with namespace ownership |
| blobs | `id`; hash | Binary content/length/type; explicit reference tracking |
| invocations | `requestId`; status, intentId | Accepted local operation and outcome/recovery context |
| receipts | `id`; intentId, subjectId, occurredAt | Append-oriented local evidence with retention |
| events | `eventId`; sequence, subjectId | Local notifications; sequence allocated transactionally |
| observations | `id`; siteKey, expiresAt, patternKey | DRY consented short-lived evidence |
| reconciliation | `id`; kind, state | Recoverable local cross-boundary tasks |

This schema is a target, not a description of files already present. A single IndexedDB transaction can update several stores in this database. It cannot atomically commit a remote platform action or a write to the old XtraType DB. Explicit staged state and recovery are mandatory at those boundaries.

## Namespaces and ownership

Each durable record carries `ownerId` or is bound to an owning service by its store/API. Plugins access only their own namespace through the host repository facade. Core Publication/ReplicaSet and XT context records have application-owned services; a plugin cannot rewrite them through generic key/value storage. Record IDs remain globally unique within one local database; an import collision with different content is an explicit conflict.

Host grants and connector sessions are not normal portable records. `Trust.CredentialReference` is an opaque identifier and metadata; its resolution is in a trusted local provider context. This edition does not persist raw platform secrets. Session loss after service-worker suspension yields reauthentication, not a fabricated reusable credential.

## Atomicity and outbox-like local recovery

For a local action, stage payload/blobs, validate, then commit record references and a receipt in one transaction where possible. Do not expose an orphan Blob as a complete attachment. For XtraType sidecars, use the explicit two-store recovery protocol in document 04. For publishing, persist intent/plan before dispatch and destination results after; reconciliation handles the unavoidable uncertain interval.

Do not call this local recovery queue “sync.” It coordinates selected local operations; it does not upload records or guarantee remote exactly-once execution. Each reconciliation item records kind, owner, stable intent, attempt state, last evidence and next permitted action. A restart never blindly replays an external mutation.

## Export, import and deletion

Portable bundles contain manifest, selected inert records, referenced binaries with hashes and provenance links. A complete requested backup includes those bytes; a metadata-only export is clearly labeled and cannot be described as a restorable backup. Existing XtraType metadata export remains incomplete until its baseline recovery specification is implemented.

Import validates bounds, hashes, type/version and reference integrity in staging. Conflicting IDs require a user choice or safe copy-as-new with remapped internal references; never silently overwrite dirty local content. Imported scripts remain disabled, sessions unresolved and historical runs non-resumable. Unknown executable content is rejected; unknown optional inert fields may be preserved.

Plugin removal disables first and preserves unrelated records. Explicit data deletion identifies affected local references and Blob ownership. External publications are not deleted through local data cleanup. Deleting local receipts is a retention/privacy action, not a claim that external effects disappear. Deleting a referenced object retains an explicit tombstone/reference-unavailable state where needed for local graph integrity; this is not a distributed delete protocol.

## Quota and retention defaults

**DESIGN:** plugin namespace data budget 10 MiB excluding user-approved binary/source packages; prompt before increasing. DRY evidence uses its stricter document 06 limits. Keep event notifications for 30 days/10,000 entries, whichever is reached first; consumers detect sequence gaps. Keep action receipts while referenced by active publication/routine records, with explicit user-managed cleanup; do not silently delete evidence needed to reconcile unknown outcomes.

Store no full page contents in routine diagnostics by default. Capture/snapshot retention remains XtraType-owned. Quota failure before dispatch blocks the action; failure after effect becomes an explicit recovery problem. These defaults must be measured and adjusted through a versioned decision rather than hidden constant changes.

## Deferred service boundary

| Deferred concern | Consequence in this edition |
|---|---|
| Backend identity/accounts | Local principals/display labels only; no verified cross-device author |
| Server authorization/groups | No operational private/shared/group collaboration or remote visibility enforcement |
| Incremental cloud sync | Manual inert export/import only for new companion records |
| Server object/package/execution stores | Local records and history; no remote continuation |
| Credential vault and broker | Local permitted session references only; server-secret connectors unavailable |
| API gateway/developer tokens | No new public/client API or third-party provider onboarding |
| Notification/event service | Local activity only; no cross-device delivery promise |

The original XtraType PHP endpoints remain current baseline. They cannot be reused to sidestep these deferred requirements. Existing public-host security defects and C15 stabilization gates remain in force before any broader deployment.

## Future seam without implementation

The local repository interfaces accept IDs, revisions, typed errors and immutable intent identifiers so a later service can be designed. This edition does not select endpoints, authentication providers, server databases, conflict policy or transport schedules. Reopening the service plane requires a separate approved specification, including migrations from local principal/session references and privacy rules for every new record family.

## Acceptance

Old DB untouched; schema creation/reopen; atomic multi-store commit; failed Blob staging; XtraType sidecar recovery; grant namespace isolation; import conflict/hash mismatch; export restore with binaries; quota failure; expired evidence; event gap; service-worker interruption after external effect; no raw secret export/logging; unavailable backend mode and safe plugin uninstall.
