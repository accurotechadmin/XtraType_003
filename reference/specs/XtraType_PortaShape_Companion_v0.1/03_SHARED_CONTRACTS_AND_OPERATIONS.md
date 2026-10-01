# PortaShape — Shared contracts and operation protocol

**Edition:** 0.1 · **Date:** 2026-10-01 · **Status:** user-directed scope; target implementation specification, not implemented functionality

## Scope of the shared vocabulary

This is a contract set for the selected modules, not a separately introduced language or runtime product. Preserve the source distinctions: an Object is conceptual identity; a Handle locates a representation; a Shape names a representation contract; a Package carries versioned artifacts; a Capability declares an operation; a Procedure is a reusable method distinct from its local execution; a ReplicaSet joins representations of one Publication.

Use JSON for interchange. Each new durable record carries `id`, `recordType`, `schemaVersion:1`, `createdAt` and `updatedAt`. The exceptions are existing `Context.Annotation` v2 and `Revision.Snapshot` v1, which retain their actual fields. `recordType` names are case-sensitive. Resolve the prototype's Publication naming conflict to **`Publish.Publication`**. Capability IDs are case-sensitive dotted identifiers with a separate integer `major`; the registry fixes their exact spelling. Do not apply automatic case conversion.

**DESIGN identity rule:** allocate UUID-based opaque IDs with type prefixes; never infer conceptual equivalence from URL equality or copy an external platform ID into a local record ID. A `Core.Object` may refer to an existing XtraType record or a new Publication. Its `handles` are claims with provenance. An annotation's current `targetKey` is not promoted into global Object identity.

## Common representation rules

| Field/rule | Standard |
|---|---|
| IDs | Nonempty bounded strings; stable through export/import; conflict on same ID with incompatible identity |
| Versions | Record integer version; operation integer major; package semantic version; host protocol major/minor; physical store version are independent |
| Time | UTC RFC 3339 with millisecond precision for new records; original legacy timestamps preserved as evidence |
| Optional versus null | Omitted means absent/unknown; explicit null only where schema permits it; zero/false/empty must not be coerced into absence |
| Hashes | Lowercase SHA-256 hex over original bytes for files; compact sorted-key UTF-8 JSON for defined record digests; finite numbers only; do not normalize string contents |
| Extensions | Unknown fields are rejected at executable boundaries; optional inert `extensions` object uses namespaced keys and cannot alter behavior |
| References | ID plus expected record type/version where required; no secret-bearing URL or executable expression |
| Binary content | Separate BlobRef with content hash, byte length and media type; portable bundles include the bytes or clearly mark an unresolved external reference |
| Text | Preserve original user text; normalize only in explicitly named derived fields |
| Limits | Enforce bytes and logical counts independently; document defaults and reject over-limit input before effects |

## Record families and owners

| Family | Owner | Required semantics |
|---|---|---|
| Plugin.Manifest / Installation | PS | Declared immutable revision separate from local desired/effective state |
| Host.Grant / Invocation / Receipt / Event | PS | Local authority, bounded action identity, terminal or uncertain outcome, versioned notification |
| Core.Object / Handle | PS | Conceptual identity and one or more locators with explicit evidence |
| Browser.Context | PS browser adapter | Tab/document/frame/origin generation, capture time, approved page/selection metadata |
| Context.AnchorBundle / AnnotationExtension / Relationship / Conversation / Message | XT | Contextual additions without changing the existing annotation v2 envelope |
| Script.Definition / Revision | SS | Stable script identity, immutable source hash, metadata and declared execution profile |
| Procedure.TextTemplate / PatternHypothesis / Routine / Run | DRY | Reviewed helper/pattern/method and bounded local execution; no chat domain |
| Publish.Publication / Destination / Plan / Representation / ReplicaSet | PUB | Immutable planned intent, account/destination binding, result per target and common identity |
| Connector.Descriptor | EXT | Exact platform operations, transforms, locality and evidence policy |
| Evidence.FidelityReport / ProvenanceRecord | PS/shared | Honest transformation effects and causal action evidence |
| Trust.CredentialReference | PUB/connector boundary | Opaque local authorized session reference, never secret content |

`Context.AnnotationExtension` is a separate record linked by `annotationId`. It may carry an `objectId`, anchor bundle reference, tags, local-only visibility intention and relationship references. It does not overwrite the v2 note's `author`, `target`, attachments or sync metadata. Until identity services exist, `authorRef` is a local principal, explicitly unverified across devices.

## Operation declaration and invocation

An operation declaration binds `id`, `major`, provider package/revision, input/output contract IDs, required permissions, side-effect class (`read`, `local-write`, `page-write`, `external-write`), locality and maximum duration. Consumers pin a provider revision for an accepted run. A provider update cannot silently change a pending publish plan.

An invocation contains `requestId`, `operationId`, `operationMajor`, `providerId`, `providerRevision`, `input`, optional `contextRef`, `deadlineAt`, and `intentId`. The host adds the **trusted caller identity and effective grant context** outside the untrusted body. A request cannot enlarge its deadline beyond the operation's declared maximum. Input validation, provider/version selection and current grants are checked before execution.

A receipt contains `id`, `requestId`, `intentId`, operation/provider/revision, start/end time, `status`, optional output/error, effect references and provenance references. Status is one of `succeeded`, `failed`, `cancelled`, `partial`, `blocked`, `unknown-outcome`. `failed` means the host has evidence of the stated failure; it must not be used to imply no external effect when uncertain.

**DESIGN limits:** ordinary broker request/response JSON ≤256 KiB, excluding separately authorized BlobRefs; default call deadline 30 seconds, maximum 120 seconds unless the selected operation's own specification defines a reviewed longer limit. Publish jobs may span calls and store status per destination. No unbounded `invoke` is permitted.

## Error contract

`error` has `code`, `message`, `providerId`, optional `stepId`, `retryable`, `effectState` (`none`, `committed`, `unknown`), `userAction` and optional `details` with nonsecret bounded values. Standard codes: `INVALID_INPUT`, `UNSUPPORTED_VERSION`, `UNAVAILABLE_HOST`, `MISSING_IMPLEMENTATION`, `DEPENDENCY_BLOCKED`, `PERMISSION_DENIED`, `CONTEXT_CHANGED`, `STALE_PLAN`, `AUTH_REQUIRED`, `QUOTA_EXCEEDED`, `DEADLINE_EXCEEDED`, `CANCEL_REQUESTED`, `CONFLICT`, `UNKNOWN_OUTCOME`, `INTERNAL_ERROR`.

Retryability describes whether a specific retry is safe after required reconciliation; it is not permission to repeat an external action automatically. Never expose tokens, full observation buffers or secret headers through diagnostics.

## Events and replay

`Host.Event` contains `eventId`, `eventType`, `eventVersion`, `occurredAt`, `sourceId`, `sourceRevision`, `subjectId`, `sequence` and bounded `data`. Initial names are `plugin.installed`, `plugin.stateChanged`, `grant.revoked`, `script.registrationChanged`, `dry.suggestionCreated`, `annotation.extensionChanged`, `publish.destinationChanged` and `operation.completed`.

**DESIGN:** local event delivery is at least once within retained history. Consumers deduplicate `eventId`; `sequence` is monotonic within one local event log, not globally ordered across devices. On a retention gap, subscribers refresh the owning records. Events are notifications, not the sole source of record truth. No event in this edition is a remotely synchronized audit stream.

## Selected integration rules

A Stay D.R.Y. suggestion can open a reviewed helper in Script Studio via `script.importDraft`; it cannot enable it. A script can request `xtratype.proposeDraft` only through an approved later bridge and receives a draft reference, not an automatic committed note. Publisher can ask XtraType to annotate a Publication or individual representation; its object reference remains separate from an external URL handle. XtraType can offer explicitly selected content to Publisher; it does not export a private annotation merely because a connector is installed.

Backend-dependent operations return `UNAVAILABLE_HOST` with a specific dependency reason and are not advertised as available. Absence is not replaced with an insecure localhost request or an unauthenticated endpoint.

## Validation and contract artifacts

The `contracts/` directory provides structural schemas for the new shared envelopes and selected domain records. Record-specific examples are under `examples/`. The registry gives their normative document, owner and implementation stage. Structural validation is necessary but insufficient: reference existence, ownership, grant checks, hashes, context generations, legal transitions and external outcome reconciliation are enforced by application services.

No new type is silently persisted to old PHP endpoints. Unknown companion records remain local/exportable until a future versioned transport is approved. This prevents a nominal schema version from concealing incompatible semantics.

## Exact operation payload bindings

`registry/operation-contracts.json` binds every one of the 40 registry operations at major 1 to an input and success-output schema in `contracts/operation-payloads.schema.json`. The host validates the invocation envelope, then the selected input schema; it validates the provider success output before storing it in `Host.Receipt.output`. Failures use the common Error contract. A malformed provider result does not erase a potentially committed effect.

`reviewToken`, `gestureRef` and `confirmationRef` are host-issued references bound to the trusted caller/context, not self-authenticating strings. Resource fields and imported records do not establish ownership. `storage.get/put` values must also validate against their registered contract ID and namespace policy; their generic JSON slot is not an executable-code or arbitrary repository escape hatch.

Some interfaces return references rather than full records. Resolve them only through an authorized owning service; reference possession alone does not grant access. Unlisted helper methods remain private implementation details and cannot be registered as public capabilities without updating this binding inventory.
