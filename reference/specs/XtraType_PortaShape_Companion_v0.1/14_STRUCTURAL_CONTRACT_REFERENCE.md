# XtraType and PortaShape — Structural contract reference

**Edition:** 0.1. Generated from the companion JSON schemas. Semantic requirements remain in the owning specifications.

Examples are synthetic structural fixtures, not a coherent user database or evidence of successful effects. Some references intentionally name records outside the isolated example. `$id` uses an `.invalid` namespace for offline resolution; no network schema service is deployed.

## CT01 — Plugin.Manifest v1

Owner: PS. Specification: document 02. Stage: C1. Schema: [contracts/plugin-manifest.schema.json](contracts/plugin-manifest.schema.json). Example: [examples/plugin-manifest.json](examples/plugin-manifest.json).

| Field | Required | Type / constraint |
| --- | --- | --- |
| id | yes | string; minLength=1; maxLength=512 |
| recordType | yes | constant Plugin.Manifest |
| schemaVersion | yes | constant 1 |
| createdAt | yes | string; format=date-time |
| updatedAt | yes | string; format=date-time |
| ownerId | yes | string; minLength=1; maxLength=512 |
| name | yes | string; minLength=1; maxLength=512 |
| description | yes | string; maxLength=80000 |
| version | yes | string |
| kind | yes | enum module, connector, userscript |
| hostApiMajor | yes | constant 1 |
| implementation | yes | object |
| requires | yes | array; maxItems=20 |
| operations | yes | array; maxItems=100 |
| permissions | yes | array; maxItems=30 |
| uiContributions | yes | array; maxItems=20 |
| files | yes | array; maxItems=100 |
| tests | yes | array; maxItems=100 |

## CT02 — Plugin.Installation v1

Owner: PS. Specification: document 02. Stage: C1. Schema: [contracts/installation.schema.json](contracts/installation.schema.json). Example: [examples/installation.json](examples/installation.json).

| Field | Required | Type / constraint |
| --- | --- | --- |
| id | yes | string; minLength=1; maxLength=512 |
| recordType | yes | constant Plugin.Installation |
| schemaVersion | yes | constant 1 |
| createdAt | yes | string; format=date-time |
| updatedAt | yes | string; format=date-time |
| ownerId | yes | string; minLength=1; maxLength=512 |
| packageId | yes | string; minLength=1; maxLength=512 |
| revisionDigest | yes | string |
| desiredState | yes | enum enabled, disabled, removed |
| effectiveState | yes | enum staged, disabled, enabled, needs-review, blocked, rejected, removed |
| blockReason | no | string; maxLength=80000 |
| registeredOperations | yes | array; maxItems=100 |
| reconciledAt | no | string; format=date-time |

## CT03 — Host.Grant v1

Owner: PS. Specification: document 02. Stage: C1. Schema: [contracts/grant.schema.json](contracts/grant.schema.json). Example: [examples/grant.json](examples/grant.json).

| Field | Required | Type / constraint |
| --- | --- | --- |
| id | yes | string; minLength=1; maxLength=512 |
| recordType | yes | constant Host.Grant |
| schemaVersion | yes | constant 1 |
| createdAt | yes | string; format=date-time |
| updatedAt | yes | string; format=date-time |
| ownerId | yes | string; minLength=1; maxLength=512 |
| principalId | yes | string; minLength=1; maxLength=512 |
| packageId | yes | string; minLength=1; maxLength=512 |
| revisionDigest | yes | string |
| operationIds | yes | array; maxItems=100 |
| siteMatches | yes | array; maxItems=100 |
| resourceRefs | yes | array; maxItems=100 |
| approvedAt | yes | string; format=date-time |
| expiresAt | no | string; format=date-time |
| revokedAt | no | string; format=date-time |

## CT04 — Host.Invocation v1

Owner: PS. Specification: document 03. Stage: C1. Schema: [contracts/invocation.schema.json](contracts/invocation.schema.json). Example: [examples/invocation.json](examples/invocation.json).

| Field | Required | Type / constraint |
| --- | --- | --- |
| id | yes | string; minLength=1; maxLength=512 |
| recordType | yes | constant Host.Invocation |
| schemaVersion | yes | constant 1 |
| createdAt | yes | string; format=date-time |
| updatedAt | yes | string; format=date-time |
| ownerId | yes | string; minLength=1; maxLength=512 |
| requestId | yes | string; minLength=1; maxLength=512 |
| operationId | yes | string; minLength=1; maxLength=512 |
| operationMajor | yes | integer; minimum=1 |
| providerId | yes | string; minLength=1; maxLength=512 |
| providerRevision | yes | string; minLength=1; maxLength=512 |
| input | yes | object |
| contextRef | no | string; minLength=1; maxLength=512 |
| deadlineAt | yes | string; format=date-time |
| intentId | yes | string; minLength=1; maxLength=512 |

## CT05 — Host.Receipt v1

Owner: PS. Specification: document 03. Stage: C1. Schema: [contracts/receipt.schema.json](contracts/receipt.schema.json). Example: [examples/receipt.json](examples/receipt.json).

| Field | Required | Type / constraint |
| --- | --- | --- |
| id | yes | string; minLength=1; maxLength=512 |
| recordType | yes | constant Host.Receipt |
| schemaVersion | yes | constant 1 |
| createdAt | yes | string; format=date-time |
| updatedAt | yes | string; format=date-time |
| ownerId | yes | string; minLength=1; maxLength=512 |
| requestId | yes | string; minLength=1; maxLength=512 |
| intentId | yes | string; minLength=1; maxLength=512 |
| operationId | yes | string; minLength=1; maxLength=512 |
| operationMajor | yes | integer; minimum=1 |
| providerId | yes | string; minLength=1; maxLength=512 |
| providerRevision | yes | string; minLength=1; maxLength=512 |
| startedAt | yes | string; format=date-time |
| endedAt | yes | string; format=date-time |
| status | yes | enum succeeded, failed, cancelled, partial, blocked, unknown-outcome |
| output | no | object |
| error | no | object |
| effectRefs | yes | array; maxItems=100 |
| provenanceRefs | yes | array; maxItems=100 |

## CT06 — Host.Event v1

Owner: PS. Specification: document 03. Stage: C1. Schema: [contracts/event.schema.json](contracts/event.schema.json). Example: [examples/event.json](examples/event.json).

| Field | Required | Type / constraint |
| --- | --- | --- |
| id | yes | string; minLength=1; maxLength=512 |
| recordType | yes | constant Host.Event |
| schemaVersion | yes | constant 1 |
| createdAt | yes | string; format=date-time |
| updatedAt | yes | string; format=date-time |
| ownerId | yes | string; minLength=1; maxLength=512 |
| eventId | yes | string; minLength=1; maxLength=512 |
| eventType | yes | enum plugin.installed, plugin.stateChanged, grant.revoked, script.registrationChanged, dry.suggestionCreated, annotation.extensionChanged, publish.destinationChanged, operation.completed |
| eventVersion | yes | constant 1 |
| occurredAt | yes | string; format=date-time |
| sourceId | yes | string; minLength=1; maxLength=512 |
| sourceRevision | yes | string; minLength=1; maxLength=512 |
| subjectId | yes | string; minLength=1; maxLength=512 |
| sequence | yes | integer; minimum=1 |
| data | yes | object |

## CT07 — Core.Object v1

Owner: PS. Specification: document 03. Stage: C3. Schema: [contracts/object.schema.json](contracts/object.schema.json). Example: [examples/object.json](examples/object.json).

| Field | Required | Type / constraint |
| --- | --- | --- |
| id | yes | string; minLength=1; maxLength=512 |
| recordType | yes | constant Core.Object |
| schemaVersion | yes | constant 1 |
| createdAt | yes | string; format=date-time |
| updatedAt | yes | string; format=date-time |
| ownerId | yes | string; minLength=1; maxLength=512 |
| type | yes | string; minLength=1; maxLength=512 |
| handleRefs | yes | array; maxItems=100 |
| shape | yes | string; minLength=1; maxLength=512 |
| payloadRef | yes | string; minLength=1; maxLength=512 |
| provenanceRefs | yes | array; maxItems=100 |

## CT08 — Core.Handle v1

Owner: PS. Specification: document 03. Stage: C3. Schema: [contracts/handle.schema.json](contracts/handle.schema.json). Example: [examples/handle.json](examples/handle.json).

| Field | Required | Type / constraint |
| --- | --- | --- |
| id | yes | string; minLength=1; maxLength=512 |
| recordType | yes | constant Core.Handle |
| schemaVersion | yes | constant 1 |
| createdAt | yes | string; format=date-time |
| updatedAt | yes | string; format=date-time |
| ownerId | yes | string; minLength=1; maxLength=512 |
| objectId | yes | string; minLength=1; maxLength=512 |
| type | yes | string; minLength=1; maxLength=512 |
| value | yes | string; minLength=1; maxLength=512 |
| resolverHints | no | object |
| confidence | yes | enum asserted, verified, ambiguous |
| provenanceRefs | yes | array; maxItems=100 |

## CT09 — Browser.Context v1

Owner: PS. Specification: document 03. Stage: C1. Schema: [contracts/browser-context.schema.json](contracts/browser-context.schema.json). Example: [examples/browser-context.json](examples/browser-context.json).

| Field | Required | Type / constraint |
| --- | --- | --- |
| id | yes | string; minLength=1; maxLength=512 |
| recordType | yes | constant Browser.Context |
| schemaVersion | yes | constant 1 |
| createdAt | yes | string; format=date-time |
| updatedAt | yes | string; format=date-time |
| ownerId | yes | string; minLength=1; maxLength=512 |
| tabId | yes | integer; minimum=0 |
| documentId | yes | string; minLength=1; maxLength=512 |
| frameId | yes | integer; minimum=0 |
| generation | yes | string; minLength=1; maxLength=512 |
| origin | yes | string; minLength=1; maxLength=512 |
| pageUrl | yes | string; minLength=1; maxLength=512 |
| title | no | string; maxLength=80000 |
| capturedAt | yes | string; format=date-time |
| selectedText | no | string; maxLength=80000 |
| scriptAccess | yes | boolean |

## CT10 — Context.AnchorBundle v1

Owner: XT. Specification: document 04. Stage: C3. Schema: [contracts/anchor-bundle.schema.json](contracts/anchor-bundle.schema.json). Example: [examples/anchor-bundle.json](examples/anchor-bundle.json).

| Field | Required | Type / constraint |
| --- | --- | --- |
| id | yes | string; minLength=1; maxLength=512 |
| recordType | yes | constant Context.AnchorBundle |
| schemaVersion | yes | constant 1 |
| createdAt | yes | string; format=date-time |
| updatedAt | yes | string; format=date-time |
| ownerId | yes | string; minLength=1; maxLength=512 |
| sourceUrl | yes | string; minLength=1; maxLength=512 |
| canonicalUrl | no | string; minLength=1; maxLength=512 |
| capturedAt | yes | string; format=date-time |
| exactText | yes | string; maxLength=80000 |
| prefix | yes | string; maxLength=256 |
| suffix | yes | string; maxLength=256 |
| domHint | no | string; minLength=1; maxLength=512 |
| textPosition | no | object |
| fingerprint | no | string |
| normalizationVersion | yes | constant 1 |

## CT11 — Context.AnnotationExtension v1

Owner: XT. Specification: document 04. Stage: C3. Schema: [contracts/annotation-extension.schema.json](contracts/annotation-extension.schema.json). Example: [examples/annotation-extension.json](examples/annotation-extension.json).

| Field | Required | Type / constraint |
| --- | --- | --- |
| id | yes | string; minLength=1; maxLength=512 |
| recordType | yes | constant Context.AnnotationExtension |
| schemaVersion | yes | constant 1 |
| createdAt | yes | string; format=date-time |
| updatedAt | yes | string; format=date-time |
| ownerId | yes | string; minLength=1; maxLength=512 |
| annotationId | yes | string; minLength=1; maxLength=512 |
| objectId | no | string; minLength=1; maxLength=512 |
| anchorBundleRef | no | string; minLength=1; maxLength=512 |
| tags | yes | array; maxItems=50 |
| visibilityIntent | yes | enum local, shared, group, public |
| relationshipRefs | yes | array; maxItems=100 |
| revision | yes | integer; minimum=1 |
| authorRef | yes | string; minLength=1; maxLength=512 |

## CT12 — Context.Relationship v1

Owner: XT. Specification: document 04. Stage: C3. Schema: [contracts/relationship.schema.json](contracts/relationship.schema.json). Example: [examples/relationship.json](examples/relationship.json).

| Field | Required | Type / constraint |
| --- | --- | --- |
| id | yes | string; minLength=1; maxLength=512 |
| recordType | yes | constant Context.Relationship |
| schemaVersion | yes | constant 1 |
| createdAt | yes | string; format=date-time |
| updatedAt | yes | string; format=date-time |
| ownerId | yes | string; minLength=1; maxLength=512 |
| fromRef | yes | string; minLength=1; maxLength=512 |
| relationType | yes | enum related-to, corrects, warns-about, alternative-to, references, supersedes |
| toRef | yes | string; minLength=1; maxLength=512 |
| authorRef | yes | string; minLength=1; maxLength=512 |
| explanation | no | string; maxLength=80000 |

## CT13 — Context.Conversation v1

Owner: XT. Specification: document 04. Stage: C3. Schema: [contracts/conversation.schema.json](contracts/conversation.schema.json). Example: [examples/conversation.json](examples/conversation.json).

| Field | Required | Type / constraint |
| --- | --- | --- |
| id | yes | string; minLength=1; maxLength=512 |
| recordType | yes | constant Context.Conversation |
| schemaVersion | yes | constant 1 |
| createdAt | yes | string; format=date-time |
| updatedAt | yes | string; format=date-time |
| ownerId | yes | string; minLength=1; maxLength=512 |
| targetRef | yes | string; minLength=1; maxLength=512 |
| title | no | string; maxLength=80000 |
| visibility | yes | constant local |
| messageRefs | yes | array; maxItems=10000 |

## CT14 — Context.Message v1

Owner: XT. Specification: document 04. Stage: C3. Schema: [contracts/message.schema.json](contracts/message.schema.json). Example: [examples/message.json](examples/message.json).

| Field | Required | Type / constraint |
| --- | --- | --- |
| id | yes | string; minLength=1; maxLength=512 |
| recordType | yes | constant Context.Message |
| schemaVersion | yes | constant 1 |
| createdAt | yes | string; format=date-time |
| updatedAt | yes | string; format=date-time |
| ownerId | yes | string; minLength=1; maxLength=512 |
| conversationId | yes | string; minLength=1; maxLength=512 |
| body | yes | string; maxLength=80000 |
| authorRef | yes | string; minLength=1; maxLength=512 |
| parentMessageId | no | string; minLength=1; maxLength=512 |
| legacyAnnotationRef | no | string; minLength=1; maxLength=512 |

## CT15 — Script.Definition v1

Owner: SS. Specification: document 05. Stage: C2. Schema: [contracts/script-definition.schema.json](contracts/script-definition.schema.json). Example: [examples/script-definition.json](examples/script-definition.json).

| Field | Required | Type / constraint |
| --- | --- | --- |
| id | yes | string; minLength=1; maxLength=512 |
| recordType | yes | constant Script.Definition |
| schemaVersion | yes | constant 1 |
| createdAt | yes | string; format=date-time |
| updatedAt | yes | string; format=date-time |
| ownerId | yes | string; minLength=1; maxLength=512 |
| name | yes | string; minLength=1; maxLength=512 |
| namespace | yes | string; minLength=1; maxLength=512 |
| currentRevisionId | yes | string; minLength=1; maxLength=512 |
| desiredEnabled | yes | boolean |

## CT16 — Script.Revision v1

Owner: SS. Specification: document 05. Stage: C2. Schema: [contracts/script-revision.schema.json](contracts/script-revision.schema.json). Example: [examples/script-revision.json](examples/script-revision.json).

| Field | Required | Type / constraint |
| --- | --- | --- |
| id | yes | string; minLength=1; maxLength=512 |
| recordType | yes | constant Script.Revision |
| schemaVersion | yes | constant 1 |
| createdAt | yes | string; format=date-time |
| updatedAt | yes | string; format=date-time |
| ownerId | yes | string; minLength=1; maxLength=512 |
| scriptId | yes | string; minLength=1; maxLength=512 |
| source | yes | string; maxLength=1048576 |
| sourceHash | yes | string |
| version | yes | string |
| matches | yes | array; maxItems=100 |
| excludeMatches | yes | array; maxItems=100 |
| profile | yes | enum userscript-initial-v1, userscript-typed-v1 |
| runAt | yes | constant document_idle |
| world | yes | constant USER_SCRIPT |
| allFrames | yes | constant False |
| inputContract | no | string; minLength=1; maxLength=512 |
| outputContract | no | string; minLength=1; maxLength=512 |
| permissions | yes | array; maxItems=30 |
| fixtureRefs | yes | array; maxItems=100 |

## CT17 — Procedure.TextTemplate v1

Owner: DRY. Specification: document 06. Stage: C2. Schema: [contracts/text-template.schema.json](contracts/text-template.schema.json). Example: [examples/text-template.json](examples/text-template.json).

| Field | Required | Type / constraint |
| --- | --- | --- |
| id | yes | string; minLength=1; maxLength=512 |
| recordType | yes | constant Procedure.TextTemplate |
| schemaVersion | yes | constant 1 |
| createdAt | yes | string; format=date-time |
| updatedAt | yes | string; format=date-time |
| ownerId | yes | string; minLength=1; maxLength=512 |
| template | yes | string; maxLength=80000 |
| variables | yes | array; maxItems=50 |
| provenanceRefs | yes | array; maxItems=100 |
| revision | yes | integer; minimum=1 |

## CT18 — Procedure.PatternHypothesis v1

Owner: DRY. Specification: document 06. Stage: C2. Schema: [contracts/pattern.schema.json](contracts/pattern.schema.json). Example: [examples/pattern.json](examples/pattern.json).

| Field | Required | Type / constraint |
| --- | --- | --- |
| id | yes | string; minLength=1; maxLength=512 |
| recordType | yes | constant Procedure.PatternHypothesis |
| schemaVersion | yes | constant 1 |
| createdAt | yes | string; format=date-time |
| updatedAt | yes | string; format=date-time |
| ownerId | yes | string; minLength=1; maxLength=512 |
| siteKey | yes | string; minLength=1; maxLength=512 |
| patternKey | yes | string |
| algorithmVersion | yes | constant 1 |
| occurrences | yes | integer; minimum=1 |
| windowStart | yes | string; format=date-time |
| expiresAt | yes | string; format=date-time |
| summary | yes | string; maxLength=80000 |
| status | yes | enum candidate, accepted, dismissed |
| observationRefs | yes | array; maxItems=200 |

## CT19 — Procedure.Routine v1

Owner: DRY. Specification: document 06. Stage: C4. Schema: [contracts/routine.schema.json](contracts/routine.schema.json). Example: [examples/routine.json](examples/routine.json).

| Field | Required | Type / constraint |
| --- | --- | --- |
| id | yes | string; minLength=1; maxLength=512 |
| recordType | yes | constant Procedure.Routine |
| schemaVersion | yes | constant 1 |
| createdAt | yes | string; format=date-time |
| updatedAt | yes | string; format=date-time |
| ownerId | yes | string; minLength=1; maxLength=512 |
| name | yes | string; minLength=1; maxLength=512 |
| inputs | yes | array; maxItems=50 |
| outputNames | yes | array; maxItems=50 |
| steps | yes | array; maxItems=25 |
| maxDurationMs | yes | integer; minimum=1; maximum=120000 |
| trigger | yes | constant manual |
| revision | yes | integer; minimum=1 |
| provenanceRefs | yes | array; maxItems=100 |

## CT20 — Procedure.Run v1

Owner: DRY. Specification: document 06. Stage: C4. Schema: [contracts/routine-run.schema.json](contracts/routine-run.schema.json). Example: [examples/routine-run.json](examples/routine-run.json).

| Field | Required | Type / constraint |
| --- | --- | --- |
| id | yes | string; minLength=1; maxLength=512 |
| recordType | yes | constant Procedure.Run |
| schemaVersion | yes | constant 1 |
| createdAt | yes | string; format=date-time |
| updatedAt | yes | string; format=date-time |
| ownerId | yes | string; minLength=1; maxLength=512 |
| routineId | yes | string; minLength=1; maxLength=512 |
| routineRevision | yes | integer; minimum=1 |
| status | yes | enum ready, running, paused, succeeded, failed, cancelled, unknown-outcome |
| currentStep | yes | integer; minimum=0 |
| state | yes | object |
| checkpointRefs | yes | array; maxItems=25 |
| receiptRefs | yes | array; maxItems=100 |
| deadlineAt | yes | string; format=date-time |

## CT21 — Publish.Publication v1

Owner: PUB. Specification: document 07. Stage: C3. Schema: [contracts/publication.schema.json](contracts/publication.schema.json). Example: [examples/publication.json](examples/publication.json).

| Field | Required | Type / constraint |
| --- | --- | --- |
| id | yes | string; minLength=1; maxLength=512 |
| recordType | yes | constant Publish.Publication |
| schemaVersion | yes | constant 1 |
| createdAt | yes | string; format=date-time |
| updatedAt | yes | string; format=date-time |
| ownerId | yes | string; minLength=1; maxLength=512 |
| objectId | yes | string; minLength=1; maxLength=512 |
| authorRef | yes | string; minLength=1; maxLength=512 |
| title | no | string; maxLength=80000 |
| body | yes | string; maxLength=80000 |
| attachments | yes | array; maxItems=20 |
| links | yes | array; maxItems=50 |
| tags | yes | array; maxItems=50 |
| location | no | object |
| price | no | object |
| category | no | string; minLength=1; maxLength=512 |
| audience | no | string; minLength=1; maxLength=512 |
| destinationIds | yes | array; maxItems=20 |
| revision | yes | integer; minimum=1 |

## CT22 — Publish.Destination v1

Owner: PUB. Specification: document 07. Stage: C3. Schema: [contracts/destination.schema.json](contracts/destination.schema.json). Example: [examples/destination.json](examples/destination.json).

| Field | Required | Type / constraint |
| --- | --- | --- |
| id | yes | string; minLength=1; maxLength=512 |
| recordType | yes | constant Publish.Destination |
| schemaVersion | yes | constant 1 |
| createdAt | yes | string; format=date-time |
| updatedAt | yes | string; format=date-time |
| ownerId | yes | string; minLength=1; maxLength=512 |
| platformId | yes | string; minLength=1; maxLength=512 |
| connectorRevision | yes | string; minLength=1; maxLength=512 |
| accountLabel | yes | string; minLength=1; maxLength=512 |
| accountRef | yes | string; minLength=1; maxLength=512 |
| credentialRef | no | string; minLength=1; maxLength=512 |
| presets | yes | object |
| operations | yes | array; maxItems=20 |

## CT23 — Publish.Plan v1

Owner: PUB. Specification: document 07. Stage: C3. Schema: [contracts/publish-plan.schema.json](contracts/publish-plan.schema.json). Example: [examples/publish-plan.json](examples/publish-plan.json).

| Field | Required | Type / constraint |
| --- | --- | --- |
| id | yes | string; minLength=1; maxLength=512 |
| recordType | yes | constant Publish.Plan |
| schemaVersion | yes | constant 1 |
| createdAt | yes | string; format=date-time |
| updatedAt | yes | string; format=date-time |
| ownerId | yes | string; minLength=1; maxLength=512 |
| publicationId | yes | string; minLength=1; maxLength=512 |
| publicationRevision | yes | integer; minimum=1 |
| publicationDigest | yes | string |
| targets | yes | array; maxItems=20 |
| planDigest | yes | string |
| intentId | yes | string; minLength=1; maxLength=512 |
| status | yes | enum needs-input, ready, confirmed, running, complete, partial, needs-reconciliation, cancelled |
| confirmationRef | no | string; minLength=1; maxLength=512 |

## CT24 — Publish.Representation v1

Owner: PUB. Specification: document 07. Stage: C3. Schema: [contracts/representation.schema.json](contracts/representation.schema.json). Example: [examples/representation.json](examples/representation.json).

| Field | Required | Type / constraint |
| --- | --- | --- |
| id | yes | string; minLength=1; maxLength=512 |
| recordType | yes | constant Publish.Representation |
| schemaVersion | yes | constant 1 |
| createdAt | yes | string; format=date-time |
| updatedAt | yes | string; format=date-time |
| ownerId | yes | string; minLength=1; maxLength=512 |
| publicationId | yes | string; minLength=1; maxLength=512 |
| objectId | yes | string; minLength=1; maxLength=512 |
| destinationId | yes | string; minLength=1; maxLength=512 |
| connectorId | yes | string; minLength=1; maxLength=512 |
| connectorRevision | yes | string; minLength=1; maxLength=512 |
| operationId | yes | string; minLength=1; maxLength=512 |
| status | yes | enum pending, blocked, executing, succeeded, failed, cancelled, unknown-outcome |
| externalHandleRef | no | string; minLength=1; maxLength=512 |
| payloadDigest | yes | string |
| fidelityRef | yes | string; minLength=1; maxLength=512 |
| receiptRefs | yes | array; maxItems=100 |

## CT25 — Publish.ReplicaSet v1

Owner: PUB. Specification: document 07. Stage: C3. Schema: [contracts/replica-set.schema.json](contracts/replica-set.schema.json). Example: [examples/replica-set.json](examples/replica-set.json).

| Field | Required | Type / constraint |
| --- | --- | --- |
| id | yes | string; minLength=1; maxLength=512 |
| recordType | yes | constant Publish.ReplicaSet |
| schemaVersion | yes | constant 1 |
| createdAt | yes | string; format=date-time |
| updatedAt | yes | string; format=date-time |
| ownerId | yes | string; minLength=1; maxLength=512 |
| objectId | yes | string; minLength=1; maxLength=512 |
| publicationId | yes | string; minLength=1; maxLength=512 |
| representationRefs | yes | array; maxItems=1000 |

## CT26 — Evidence.FidelityReport v1

Owner: PUB. Specification: document 07. Stage: C3. Schema: [contracts/fidelity.schema.json](contracts/fidelity.schema.json). Example: [examples/fidelity.json](examples/fidelity.json).

| Field | Required | Type / constraint |
| --- | --- | --- |
| id | yes | string; minLength=1; maxLength=512 |
| recordType | yes | constant Evidence.FidelityReport |
| schemaVersion | yes | constant 1 |
| createdAt | yes | string; format=date-time |
| updatedAt | yes | string; format=date-time |
| ownerId | yes | string; minLength=1; maxLength=512 |
| transformId | yes | string; minLength=1; maxLength=512 |
| transformVersion | yes | string; minLength=1; maxLength=512 |
| sourceDigest | yes | string |
| targetDigest | yes | string |
| preserves | yes | array; maxItems=100 |
| approximates | yes | array; maxItems=100 |
| drops | yes | array; maxItems=100 |
| requires | yes | array; maxItems=100 |

## CT27 — Evidence.ProvenanceRecord v1

Owner: PS. Specification: document 03. Stage: C1. Schema: [contracts/provenance.schema.json](contracts/provenance.schema.json). Example: [examples/provenance.json](examples/provenance.json).

| Field | Required | Type / constraint |
| --- | --- | --- |
| id | yes | string; minLength=1; maxLength=512 |
| recordType | yes | constant Evidence.ProvenanceRecord |
| schemaVersion | yes | constant 1 |
| createdAt | yes | string; format=date-time |
| updatedAt | yes | string; format=date-time |
| ownerId | yes | string; minLength=1; maxLength=512 |
| subjectRef | yes | string; minLength=1; maxLength=512 |
| action | yes | string; minLength=1; maxLength=512 |
| componentId | yes | string; minLength=1; maxLength=512 |
| componentVersion | yes | string; minLength=1; maxLength=512 |
| actorRef | yes | string; minLength=1; maxLength=512 |
| occurredAt | yes | string; format=date-time |
| parentRefs | yes | array; maxItems=100 |
| warnings | yes | array; maxItems=50 |
| effectState | yes | enum none, committed, unknown |

## CT28 — Trust.CredentialReference v1

Owner: PUB. Specification: document 08. Stage: C3. Schema: [contracts/credential-reference.schema.json](contracts/credential-reference.schema.json). Example: [examples/credential-reference.json](examples/credential-reference.json).

| Field | Required | Type / constraint |
| --- | --- | --- |
| id | yes | string; minLength=1; maxLength=512 |
| recordType | yes | constant Trust.CredentialReference |
| schemaVersion | yes | constant 1 |
| createdAt | yes | string; format=date-time |
| updatedAt | yes | string; format=date-time |
| ownerId | yes | string; minLength=1; maxLength=512 |
| providerId | yes | string; minLength=1; maxLength=512 |
| opaqueRef | yes | string; minLength=1; maxLength=512 |
| accountLabel | yes | string; minLength=1; maxLength=512 |
| scopes | yes | array; maxItems=100 |
| mode | yes | constant browser-session |
| expiresAt | no | string; format=date-time |

## CT29 — Connector.Descriptor v1

Owner: EXT. Specification: document 08. Stage: C3. Schema: [contracts/connector-descriptor.schema.json](contracts/connector-descriptor.schema.json). Example: [examples/connector-descriptor.json](examples/connector-descriptor.json).

| Field | Required | Type / constraint |
| --- | --- | --- |
| id | yes | string; minLength=1; maxLength=512 |
| recordType | yes | constant Connector.Descriptor |
| schemaVersion | yes | constant 1 |
| createdAt | yes | string; format=date-time |
| updatedAt | yes | string; format=date-time |
| ownerId | yes | string; minLength=1; maxLength=512 |
| packageId | yes | string; minLength=1; maxLength=512 |
| packageRevision | yes | string; minLength=1; maxLength=512 |
| platformLabel | yes | string; minLength=1; maxLength=512 |
| operations | yes | array; maxItems=20 |
| accepts | yes | array; maxItems=20 |
| produces | yes | array; maxItems=20 |
| authModes | yes | array; maxItems=3 |
| locality | yes | enum browser-local, web-local, mobile-local |
| requiredFields | yes | array; maxItems=100 |
| idempotencyMode | yes | enum platform-key, reconcile-before-retry, manual-only |
| canReconcile | yes | boolean |
| fixtureRefs | yes | array; maxItems=100 |
| status | yes | enum candidate, stub, qualified, blocked-service-deferred |

## Semantic checks beyond schemas

- Verify ownership and existence of references; never trust caller-supplied identity.
- Enforce lifecycle transitions, revision immutability, exact file/record hashes and schema-specific digest inputs.
- Publication requires nonblank body or at least one valid attachment; platform constraints may be stricter.
- `Host.Invocation.input` and receipt output use the declared operation payload contract; structural envelope validation alone is insufficient.
- Reject shared/group/public execution while service prerequisites are deferred, even if visibility intent is retained as data.
- A succeeded representation requires a verified external Handle; unknown outcomes never qualify as success.
- Validate template placeholder/variable consistency, predicate type compatibility and routine step/input dependencies.
- A source hash is not a trust signature; a successful schema check is not an execution grant.
- Match patterns, URLs, file paths and numeric/time boundaries receive their owning module validation in addition to structural checks.
