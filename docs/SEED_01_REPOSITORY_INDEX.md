# Seed 1 — Repository Index and Navigation

## Root map

| Path | Layer | Purpose |
|---|---|---|
| `README.md` | Seed authority | Project entry point and seed declaration |
| `SEED_MANIFEST.json` | Seed authority | Machine-readable identity, counts and authority roots |
| `EXPERT_SESSION_BOOT_PROMPT.md` | Session bootstrap | Fresh expert coding/development LLM onboarding |
| `ext/` | Current implementation | Chrome MV3 extension |
| `server/` | Current implementation | PHP API, web UI, router, schemas and media serving boundary |
| `src/server/` | Current implementation | Repository abstraction, PHP validation and account/session helpers |
| `var/` | Current implementation data skeleton | Private JSON collections, per-user profile JSON root and media directory placeholder |
| `tests/` | Verification | Node/jsdom/fake-IDB/mocked-Chrome/real-PHP fixtures |
| `scripts/` | Engineering tooling | Shared-source synchronization helper |
| `docs/ARCHITECTURE.md` etc. | Current runtime docs | Architecture, parity, verification, recovery, schema profile, concern dispositions |
| `docs/SEED_*` | Seed indexes/SSOT | Cross-version current truth, inventories, component/contract maps and build sequence |
| `docs/inventory/` | Machine-readable indexes | Exhaustive files and component rows |
| `reference/canon/` | Historical truth | Canon v1.0 approval candidate and frozen v2.3 evidence |
| `reference/specs/` | Target truth | PortaShape companion v0.1, registry, contracts, examples and workbook |
| `reference/source-snapshot/` | Provenance | Original XtraType 2.4 README preserved before the seed README replaced it |
| `reference/legacy/` | Provenance | Earlier expert-session boot prompt |
| `reports/` | Reconciliation evidence | Coherency/current-truth audit |

## Seed documentation set

| Document | Use it when… |
|---|---|
| `SEED_00_CURRENT_TRUTH_AND_AUTHORITY.md` | deciding what “current”, “implemented”, “specified” or “historical” means |
| `SEED_01_REPOSITORY_INDEX.md` | locating the correct source quickly |
| `SEED_02_FILE_INVENTORY.md` | finding every file and its role |
| `SEED_03_CURRENT_IMPLEMENTATION_COMPONENTS.md` | answering “what exists in code now?” |
| `SEED_04_PORTASHAPE_TARGET_ARCHITECTURE.md` | answering “what are PortaShape and the selected modules supposed to become?” |
| `SEED_05_CONTRACT_AND_OPERATION_INDEX.md` | locating record schemas, operations and permission boundaries |
| `SEED_06_DATA_WORKFLOWS_AND_SEAMS.md` | tracing calls, records, side effects, commit boundaries and recovery |
| `SEED_07_VERIFICATION_AND_DEVELOPMENT_STATUS.md` | evaluating evidence, maturity and unrun gates |
| `SEED_08_CONCERN_STATUS_CROSSWALK.md` | reconciling the 45 canon concerns with 2.4 |
| `SEED_09_BUILD_FORWARD_SEQUENCE.md` | choosing implementation order without collapsing stages |

## Current implementation traversal

For code onboarding, use this sequence:

1. `ext/manifest.json`, `docs/ARCHITECTURE.md`, `docs/SCHEMAS.md`.
2. `ext/core/anchors.js`, `schemas.js`, `db.js`, `records.js`, `api.js`, `capture.js`.
3. `ext/service-worker.js`.
4. `ext/sidepanel/index.html`, `app.js`, `style.css`.
5. `ext/content/page-ui.js`, `ext/content/youtube.js`.
6. `server/config.php`, `server/router.php`, `server/api/bootstrap.php`.
7. all `server/api/*.php`, `server/media.php`, `server/index.php`, `server/assets/*`.
8. `src/server/Repository.php`, `src/server/Validation.php`, `src/server/Auth.php`.
9. `tests/README.md`, then all test files.
10. `docs/VERIFICATION.md`, `FEATURE_PARITY.md`, `CONCERN_DISPOSITION.md`, `UPGRADE_AND_RECOVERY.md`.

## PortaShape traversal

Read target material from `reference/specs/XtraType_PortaShape_Companion_v0.1/` in this order:

1. `READ_ME.md`, `00_READ_ME_AND_AUTHORITY.md`, `13_SOURCE_TRACEABILITY_AND_DECISIONS.md`.
2. `01_PORTASHAPE_SERVICE_ARCHITECTURE.md`, `02_PLUGIN_PACKAGE_LIFECYCLE.md`, `03_SHARED_CONTRACTS_AND_OPERATIONS.md`, `10_LOCAL_DATA_AND_DEFERRED_SERVICES.md`.
3. all `contracts/` and same-stem `examples/`; then `registry/operation-contracts.json` and operation payload definitions.
4. selected module specs 04–09 and verification/implementation sequence 11.
5. glossary/change control 12, structural reference 14, registry index, all registry tables and workbook.

## Canon traversal

Use `reference/canon/XtraType_Canon_v1.0_candidate/` only with its v2.3 scope visible. Start with `00_START_HERE.md`, `01_AUTHORITY_AND_DECISIONS.md`, `02_PRODUCT_AND_STATUS.md`, and `20_PROVENANCE_AND_CORRECTIONS.md`, then use the numbered technical documents, source/symbol inventories and concern/verification evidence as needed.

## Fast lookup table

| Need | Primary source |
|---|---|
| Current extension entry points | `ext/manifest.json`, `ext/service-worker.js` |
| Current record construction/validation | `ext/core/records.js`, `src/server/Validation.php` |
| Anchor identity/applicability | `ext/core/anchors.js` and identical web copy |
| Local storage/transactions | `ext/core/db.js` |
| Sync/network semantics | `ext/core/api.js`, server API handlers |
| Accounts/invitations/contacts/messages | `src/server/Auth.php`, `server/api/{auth,invites,admin,contacts,messages,group-chats}.php`, side-panel Account module |
| Page/YouTube surfaces | `ext/content/page-ui.js`, `ext/content/youtube.js` |
| Snapshot capture/diff | `ext/core/capture.js`, worker capture handlers, sidepanel timeline code |
| Current web surface | `server/index.php`, `server/assets/app.js` |
| JSON persistence | `src/server/Repository.php` |
| 45 historical concerns, current dispositions | canon `14_CONCERN_REGISTER.md`; root `docs/CONCERN_DISPOSITION.md` |
| PortaShape modules/components | companion `registry/modules.csv`, `components.csv` |
| PortaShape operations/contracts | companion `registry/operations.csv`, `contracts.csv`, `operation-contracts.json` |
| PortaShape acceptance cases | companion `registry/acceptance.csv` |
| Current reconciliation report | `reports/XtraType_PortaShape_Coherency_Report_2026-10-01.md` |
