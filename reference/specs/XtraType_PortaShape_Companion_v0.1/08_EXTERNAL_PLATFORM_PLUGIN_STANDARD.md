# PortaShape — External-platform connector plugin standard

**Edition:** 0.1 · **Date:** 2026-10-01 · **Status:** user-directed scope; target implementation specification, not implemented functionality

## Definition

A connector package implements one external platform family and declares each supported source/target operation. It is installed through PortaShape, supplies transformations and platform actions to core Publisher, and may provide a destination-specific UI contribution. It cannot replace the Publisher's canonical intent, confirmation rules or ReplicaSet owner.

A platform family may include multiple accounts/instances, such as distinct forums. Destination instances are data records, not separate copies of connector code. Each operation's output must preserve which account/instance actually performed the action.

## Descriptor

`Connector.Descriptor@1` defines `id`, package/revision, platform label, contract versions, operations, accepted canonical types, produced target types, locality, authentication modes, input limits, required fields, side-effect classes, idempotency mode, reconciliation capability, fidelity behavior and fixture references. Unsupported operations are omitted, not implemented as no-op success.

Initial operation family: `validate`, `preview`, `create`, `inspectResult`. Optional later operations: `read`, `update`, `delete`, `compare`. Source adaptation maps an explicitly acquired external representation into canonical fields with provenance. It never silently imports a user's entire account or comments.

## Required interface

| Method | Input | Output | Effect |
|---|---|---|---|
| describe | Host compatibility context | Descriptor and current availability | Read |
| validate | Publication revision + destination config | Structured missing/invalid fields | Read/pure |
| preview | Same immutable input | Target payload + fidelity report + digest | Read/pure except explicit media reads |
| resolveAccount | Pinned authorized local platform context | Nonsecret account identity evidence or AUTH_REQUIRED | Read |
| create | Confirmed immutable target plan + operation/idempotency identity | External Handle and evidence, failure or unknown-outcome | External write |
| inspectResult | Prior intent/known handle and authorized context | Found/not-found/ambiguous/unavailable evidence | Read |
| optional mutation | Existing representation + reviewed change | New representation state/evidence | External write |

The host supplies trusted caller/grant context separately. `create` MUST revalidate the account, payload digest and platform context immediately before mutation. A connector cannot authorize itself based on a `confirmed:true` field sent by another plugin.

## Mapping and fidelity

A mapping declares source field, destination field, conversion/default, supported values and loss. Schema/type failure must remain distinct from a platform availability error. Defaults that change audience, location, identity, price or destination require explicit configuration and preview. No platform-specific field may silently become a new canonical field; register a namespaced extension or propose a shared contract change.

The output includes exact target payload and transform version, with preserved/approximated/dropped/required fields. Validation and preview must be repeatable for the same frozen input and declared external dependencies. If a platform constraint changes between preview and execution, return `STALE_PLAN` and ask for review.

## Browser interaction profile

Browser connectors operate only on permitted pages and verified user-selected accounts. Selectors are implementation details with tested fallbacks; absent/ambiguous controls block execution. Revalidate document identity after navigation. Avoid hidden cross-tab target switching. A submitted action must be associated with concrete platform evidence such as returned ID/URL or a reliable observed confirmation. “Click succeeded” alone does not prove publication.

No bypass of access controls, CAPTCHA, paid access or platform restrictions is part of the contract. If supported interaction cannot complete, present a manual completion path without falsely marking the operation successful.

## Locality and credentials

Declare `browser-local`, `web-local` or `mobile-local` availability only when that host actually supports the needed operation. A web management view must not pretend to run a Chrome-only connector. Server-required providers remain `blocked-service-deferred`. Local browser session references expire and are revalidated; no cookies, tokens or secret request bodies appear in portable packages/records.

There is no cloud credential broker in this edition. Host support for an ephemeral token profile, if selected later within this module, requires explicit provider-specific security and lifecycle review; a descriptor alone does not make it available.

## Conformance package

Every connector includes target fixtures, mapping fixtures, valid/invalid field examples, fidelity expectations, stubbed operation responses, and outcome/reconciliation cases. Tests identify connector revision, host build and platform adapter fixture version. Live feasibility evidence is stored separately from unit results with date/environment and supported operations. A working stub is not a working live connector.

Required cases: required-field mismatch; unsupported media; length/thread choices; audience default; wrong account; expiry; selector drift; rate limit; lost response; duplicate intent; uncertain external outcome; update/delete unsupported; denied permissions and redacted diagnostics. Platform quotas are observed from the provider and may not be bypassed by retries.

## Catalog and updates

A catalog entry names package/revision, platform, operations, host locality, required permissions, implementation availability and verification evidence. Candidate example platforms from the source are not shipped catalog promises. User updates revalidate pending plans and invalidate confirmations bound to old transforms. Historical representations retain the version that created them even after uninstall/update.

Core/plugin separation is testable: adding a compliant platform package must not require changing the Publication envelope or copying Publisher orchestration. If a genuine new common field is needed, change the versioned contract and migration first.

## Owned component index

| ID | Component | Responsibility | Status / stage | Source |
| --- | --- | --- | --- | --- |
| EXT-C067 | Connector Descriptor | Target service/site, versions, supported capability operations, authentication modes. | specified / C3 | LEGACY-C067; W Components!A68:E68; D08 T015R02 |
| EXT-C068 | Source Adapter | External representation → canonical shape. | existing-narrow / C3 | LEGACY-C068; W Components!A69:E69; D08 T015R03 |
| EXT-C069 | Target Adapter | Canonical shape → external representation. | existing-narrow / C3 | LEGACY-C069; W Components!A70:E70; D08 T015R04 |

