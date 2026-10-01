# Test, Release, Security, and Scale Gates

## Current v.002 release posture

- **Personal client-side extension:** designated tested/working for non-server-dependent use based on the inherited verified v.001 baseline.
- **Server-side account/social/service work:** under heavy development and testing; not yet represented as production-hardened public infrastructure.
- **PortaShape broad host/plugin runtime:** specified target, not broadly implemented.

## Evidence labels

Use exact labels:

- historical recorded pass;
- test executed in this session;
- static/lint/parse check;
- mocked/integration test;
- native/manual browser acceptance;
- target acceptance case not run;
- production/scale/security certification (do not claim without evidence).

## Before widening server access

Require explicit work around authentication/session hardening, transport/TLS deployment, abuse/rate limiting, invite-cap enforcement, auditability, backup/restore, migration, recovery, privacy boundaries, data retention, account recovery, authorization review, group-chat/DM access control, observability, and adversarial testing.

## Before enabling privileged community packages

Require package identity/revision, installation state, grant model, provenance/signing/review policy, revocation/rollback, sandbox/userscript distinction, permission UI, namespaced storage, cleanup, and acceptance tests.

## Before external publishing/connectors

Require preview/confirmation, destination/account binding, effect idempotency strategy where possible, receipts, unknown-outcome reconciliation, credential isolation, rate/abuse limits, and provider-specific acceptance tests.

## Scale is staged

Invitation-limited testing is not the same as public readiness. The confidential owner-held total invitation ceiling remains outside the repository. Server-side implementation should be evaluated against the currently authorized testing population without turning that population size into a public constant.
