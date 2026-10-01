# XtraType v.001 — Verification, Security, Scale, and Release Gates

## 1. Evidence discipline

Use three different statements:

- **RECORDED-VERIFIED:** an older artifact says a check passed in its recorded environment.
- **VERIFIED-NOW:** this exact session ran a named check and observed the result.
- **NOT VERIFIED / NOT CERTIFIED:** no evidence establishes the claim.

Never convert mock coverage into native-browser certification or local multi-user functionality into public-service certification.

## 2. v.001 inherited verification baseline

The sealed predecessor records:

- an earlier 2.4 automated suite: 32 passed, 0 failed, 0 skipped in its recorded environment;
- the immediately preceding 2.5 feature package: 17 selected runnable Node-reported tests passed, plus PHP HTTP/account/repository concurrency and syntax/lint/JSON/parity/checksum verification;
- inability to freshly rerun the full jsdom/fake-IndexedDB suite in that environment because pinned dev dependencies were unavailable;
- native Chrome and real YouTube acceptance still unrun/not certified in that package.

The v.001 instantiation itself is documentation-only and must verify **byte preservation and package integrity**, not claim new runtime behavior.

## 3. Security gates before wider network exposure

Accounts do not by themselves make this a hardened public multi-user service. Before meaningful public exposure, require an explicit deployment/security review covering at minimum:

- TLS/reverse proxy and secure-origin model;
- cookie/token handling strategy and XSS implications;
- CSRF/origin assumptions for all clients;
- password policy/recovery/admin recovery;
- brute-force/rate-limit/abuse controls;
- session rotation/revocation/audit;
- filesystem permissions and backup encryption;
- privacy/data-retention/deletion requirements;
- authorization checks on every object/resource;
- group-chat membership lifecycle and revocation;
- messaging abuse/report/block strategy as community size increases;
- dependency/update/security-response process;
- log redaction and secret handling;
- threat model for extension credentials and page-owned overlays.

## 4. Confidential invitation capacity

The current rollout is governed by an owner-established finite invitation ceiling whose numeric value is intentionally kept outside this repository. Respect it as a hard operational launch gate. Do not surface the number in UI/docs/logs unless explicitly directed.

The existing per-user one-invite-per-fixed-EST-day rule is a **cadence rule**, not the confidential global capacity limit.

## 5. Scale gates

### Small invited testing

Current JSON/file-backed design can support controlled testing, but test operational characteristics rather than assuming scale. Monitor lock contention, whole-file rewrite cost, media growth, message/feed query size, backups, and recovery.

### Larger groups

Before materially larger cohorts, define metrics and thresholds for repository sizes, request latency, concurrent writers, profile/media growth, admin operations, group-chat history, and backup/restore duration. Introduce storage indexes/adapters only with compatibility-preserving migrations.

### Public scale

Public scale requires a separately approved service architecture. Do not let a private beta deployment accidentally become the permanent platform backend through inertia.

## 6. Release acceptance layers

A serious release should consider:

1. static syntax/schema/parity checks;
2. deterministic unit tests;
3. repository concurrency/failure tests;
4. HTTP/auth/ACL integration tests;
5. browser-mocked extension tests;
6. native Chrome install/action/side-panel/navigation/omnibox/capture tests;
7. real target-site tests such as YouTube;
8. accessibility and keyboard/screen-reader review;
9. upgrade/recovery against representative prior data;
10. security/adversarial tests for any network-facing changes;
11. PortaShape stage acceptance cases where relevant.

## 7. Plugin/ecosystem security gates

Before privileged community package execution exists, prove package inspection, hash/revision identity, inert import, grants/revocation, namespace isolation, invocation correlation, bounded resources, UI cleanup, update/rollback behavior, and no authority transfer through metadata.

Before external connectors are qualified, prove fidelity/mapping, confirmation, credential-reference isolation, effect receipt semantics, unknown-outcome reconciliation, and provider-specific conformance fixtures.

## 8. Recovery is part of correctness

A release is not safe if it can write new formats but cannot explain downgrade/recovery. Backup/import must eventually include media and enough metadata to restore relationships. Until then, current metadata export must not be marketed as a complete backup.
