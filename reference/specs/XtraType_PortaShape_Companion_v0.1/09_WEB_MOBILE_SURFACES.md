# XtraType and PortaShape — Web and mobile surfaces

**Edition:** 0.1 · **Date:** 2026-10-01 · **Status:** user-directed scope; target implementation specification, not implemented functionality

## Shared client rule

Web/mobile surfaces present the selected module contracts without inventing separate object, permission or package semantics. Locality remains explicit: a browser-only operation is available only in a supporting browser host. A responsive page is not a native mobile shell and does not acquire extension privileges because it displays a script or connector manifest.

The existing PHP companion remains an online server-first annotation client with its current limits. New local management surfaces may share pure rendering/validation libraries but must not write new companion records into the legacy endpoints. This specification does not turn the deferred backend into a hidden prerequisite for all UI work.

## Surface inventory and availability

| Surface | Local edition behavior | Blocked dependency |
|---|---|---|
| Web Library | Inspect/import/export selected local objects, notes, scripts, helpers, publication drafts and replicas | Account-wide libraries and cross-device sync |
| Execution View | Inspect local selected-module receipts, steps, outcomes and permitted resume/cancel controls | Remote execution/history aggregation |
| Package Manager | Review inert packages, show compatibility and manage packages supported by that host | Remote executable marketplace/distribution service |
| Account/Permission Center | Local package/site grants and nonsecret connector session status | Central identity, devices, account sessions and server credentials |
| Annotation Feed | Existing legacy feed where configured; separate locally authorized companion context views | Private/shared/group remote queries and notifications |
| Publisher Web Surface | Compose, transform/preview with locally present implementations; execute only supported local connectors | Server-required connectors and remote queue/dispatch |
| Responsive Mobile Web | Same local data/preview/helper management adapted to touch and screen size | System-wide browser input observation and desktop extension execution |
| Native Mobile Shell | Later local share ingestion, annotation drafts and declared device-local location/time capture | Cross-device helpers, remote notifications and backend collaboration |

No third-party API developer program is added. The corresponding old D11 row depends on deferred service authorization and is held at the boundary rather than expanded into a new module.

## Local host discovery and handoff

A surface asks `describeHost` for effective capabilities. Unknown/unavailable operations show a specific reason. An ordinary web page cannot call extension internals. **DESIGN initial handoff:** explicitly export/import an inert draft/package or open a trusted extension UI where already available; do not imply a background cross-origin or cross-device command channel.

A future same-device direct bridge requires its own origin allowlist, authenticated pairing, request correlation, replay protection and consent boundary before exposure. It is not required to deliver the initial local surfaces. Cross-device handoff remains blocked by backend deferral.

Importing a Publication draft into the extension creates a local draft, re-resolves destinations and requires fresh preview/confirmation. Importing a script keeps it disabled. Imported grants, local session references and execution ownership are never activated. A receipt imported for history is not a resumable current job.

## UI flow standards

Navigation provides Context, Plugins, Helpers, Publisher and Activity where their providers are installed/available. Preserve XtraType's primary composer. Plugin install detail shows package source/revision, effective permissions, locality, dependencies and error state. Publisher shows one source draft and separate destination results; partial success remains visible. Stay D.R.Y. controls show observation status near assistance settings and offer pause/clear/exclude.

Shared semantic form controls preserve number/boolean/enum types. Empty input is not coerced into a coordinate zero. Error messages identify the field and recovery action. Long operations show current stage and cancellability truthfully. Keyboard focus, labels, screen-reader announcements and touch targets are part of component acceptance, not later polish.

## Web/mobile execution limits

On web/mobile-local hosts, arbitrary imported code is stored and inspected unless a specifically approved execution profile exists. No equivalent userscript engine is assumed. Bundled pure transformations can run locally. Platform operations must satisfy that host's actual permissions/authentication/CORS/runtime constraints; otherwise the client presents preview/export only.

Text assistance in web/mobile applies to the application's own editable fields. Native share-sheet support receives explicit OS-shared text/URL/media and creates a local draft with source metadata. Location/time capture is explicit and permissioned. No keyboard extension, background screen reader or system-wide recorder is implied.

## Development sequence and acceptance

Deliver responsive extension-owned management and pure shared components first. Add independent web-local inspection/drafts using the same structural contracts. Add native mobile only after selecting a concrete host build and device-permission profile. Do not promise native parity from the prototype's conflicting stage labels.

Verify import does not activate source, unsupported-host status, preview without dispatch, expired local session, narrow mobile viewport, keyboard/touch access, missing BlobRef, unknown contract version, rejected remote resume, explicit draft handoff, legacy/companion data separation and no silent exposure of local-only context through the old global feed.

## Owned component index

| ID | Component | Responsibility | Status / stage | Source |
| --- | --- | --- | --- | --- |
| UI-C103 | Web Library | Objects, annotations, scripts/packages, helpers, procedures, replica sets. | existing-narrow / C5 | LEGACY-C103; W Components!A104:E104; D11 T015R02 |
| UI-C104 | Workflow/Execution View | Run status, steps, inputs, provenance, pause/resume/cancel. | specified / C5 | LEGACY-C104; W Components!A105:E105; D11 T015R03 |
| UI-C105 | Package Manager | Import/export/install/update/remove packages. | specified / C5 | LEGACY-C105; W Components!A106:E106; D11 T015R04 |
| UI-C106 | Account/Permission Center | Local permissions/session status; centralized account/device administration blocked | specified / C5 | LEGACY-C106; W Components!A107:E107; D11 T015R05 |
| UI-C107 | Annotation Feed | Context feed and object-centered views. | existing-narrow / C5 | LEGACY-C107; W Components!A108:E108; D11 T015R06 |
| UI-C108 | Publisher Web Surface | Compose canonical Publication and choose configured destinations where supported. | specified / C5 | LEGACY-C108; W Components!A109:E109; D11 T015R07 |
| UI-C109 | Responsive Mobile Web | Immediate mobile access before native app. | existing-narrow / C5 | LEGACY-C109; W Components!A110:E110; D11 T015R08 |
| UI-C110 | Native Mobile Shell | Later local share ingestion and explicit location/time capture; sync/remote notifications blocked | specified / C5 | LEGACY-C110; W Components!A111:E111; D11 T015R09 |

