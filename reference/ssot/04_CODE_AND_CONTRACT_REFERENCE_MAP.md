# Code and Contract Reference Map

This document points to canonical examples instead of duplicating source snippets that can drift.

## Current executable reference paths

### Browser host / privilege boundary
- `ext/manifest.json` — permissions, side panel, commands, omnibox, extension metadata.
- `ext/service-worker.js` — privileged browser orchestration, active-tab/context messages, badge/update flows, side-panel entry points.

### Side panel
- `ext/sidepanel/index.html` — durable UI structure and progressive baseline controls.
- `ext/sidepanel/app.js` — state, context refresh, annotation form/feed, young/old behavior, capture, auth/social interactions.
- `ext/sidepanel/style.css` — layout, green-tree/newness presentation, reorder affordances.

### Shared browser domain modules
- `ext/core/anchors.js` — anchor normalization/matching/canonicalization.
- `ext/core/schemas.js` — built-in/custom bounded schema handling.
- `ext/core/db.js` — IndexedDB identity/schema/transactions.
- `ext/core/records.js` — annotation/snapshot record construction.
- `ext/core/api.js` — optional server transport.
- `ext/core/capture.js` — screenshot capture/tiling/restoration.

### Page-owned surfaces
- `ext/content/page-ui.js`
- `ext/content/youtube.js`

### Server
- `server/router.php`, `server/api/bootstrap.php` — request entry and shared guards.
- `src/server/Repository.php` — JSON repository mechanics/locking.
- `src/server/Validation.php` — server validation.
- `src/server/Auth.php` — bounded account/session/invitation authorization layer.
- `server/api/{annotations,schemas,snapshots,events}.php` — contextual core APIs.
- `server/api/{auth,invites,admin,contacts,messages,group-chats}.php` — active-development social/account APIs.

### Tests/evidence
- `tests/README.md` and tests under `tests/`.
- `docs/evidence/` for preserved Seed-era evidence.
- Current version verification records under `docs/v003/` and `reference/ssot/logs/`.

## Foundational record/behavior references

- Historical record contracts: `reference/canon/XtraType_Canon_v1.0_candidate/04_RECORD_CONTRACTS.md`.
- Anchors/resolution: canon `05_ANCHORS_AND_RESOLUTION.md` plus current source above.
- Extension surfaces/workflows: canon `07_EXTENSION_SURFACES.md`, `08_WORKFLOWS_AND_MESSAGES.md`.
- HTTP/storage/security: canon `09_HTTP_AND_SERVER.md`, `10_STORAGE_AND_SYNC.md`, `13_SECURITY_AND_OPERATIONS.md`.
- Seed-era current implementation/disposition: `docs/SEED_03_CURRENT_IMPLEMENTATION_COMPONENTS.md`, `SEED_06_DATA_WORKFLOWS_AND_SEAMS.md`, `CONCERN_DISPOSITION.md`.

## PortaShape target contract references

- Host/service architecture: companion `01_PORTASHAPE_SERVICE_ARCHITECTURE.md`.
- Package lifecycle: `02_PLUGIN_PACKAGE_LIFECYCLE.md`.
- Shared contracts/operations: `03_SHARED_CONTRACTS_AND_OPERATIONS.md`.
- XtraType integration: `04_XTRATYPE_CLIENT_INTEGRATION.md`.
- Script Studio: `05_SCRIPT_STUDIO_PLUGIN.md`.
- Stay D.R.Y.: `06_STAY_DRY_PLUGIN.md`.
- Universal Publisher/Bridges: `07_BRIDGES_UNIVERSAL_PUBLISHER_CORE.md`.
- External connectors: `08_EXTERNAL_PLATFORM_PLUGIN_STANDARD.md`.
- Shared clients: `09_WEB_MOBILE_SURFACES.md`.
- Deferred services: `10_LOCAL_DATA_AND_DEFERRED_SERVICES.md`.
- Verification/sequence/change control: `11`, `12`, `13`.
- Machine-readable contracts: `contracts/`, `examples/`, `registry/`.

## Example-selection rule

When a future developer needs an example, prefer:

1. current tested source that already implements the same kind of behavior;
2. a sealed source snapshot when verifying compatibility/provenance;
3. a machine-readable companion contract/example for target PortaShape semantics;
4. prose only after checking the source/contract it describes.

Do not copy old code into a new subsystem merely because it is familiar. Copy the **invariant and tested seam**, then adapt intentionally.
