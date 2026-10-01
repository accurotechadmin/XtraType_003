# XtraType 2.4.0 — stabilization release candidate

A fresh PHP server and Chrome Manifest V3 extension, based on the supplied v2.3 source and the XtraType canon v1.0 approval candidate. Existing features are retained: side-panel composer, quick bar, YouTube markers/toasts/replies, URL/GPS/YouTube/custom targets, image attachments, local records, server replication, viewport/full-page snapshots, timeline/pixel comparison, and responsive web Post/Nearby/All/Schemas.

**JSON is the server's storage engine.** MySQL/PostgreSQL are not installed or implemented. A repository interface isolates persistence for a later adapter. No PortaShape host, Script Studio, Stay D.R.Y., Publisher, connectors, new context sidecars, accounts or deferred services are included.

## Run the server

1. Install PHP 8.2 or later, with the standard JSON and fileinfo extensions. PHP must be on your PATH.
2. Extract this entire folder into a writable location. Keep `src/`, `var/`, and `server/` together.
3. Run `./start-server.sh` (macOS/Linux) or `start-server.bat` (Windows).
4. Open **http://localhost:8787/**. Check **http://localhost:8787/api/health.php**.

The launcher binds only to loopback. Runtime JSON collections live in `var/data/`; uploaded images live in `var/media/`, outside the public `server/` directory. The launcher applies the upload limits and the supplied router. Do not start PHP with the repository root as the document root.

## Load the Chrome extension

1. Open `chrome://extensions`, enable Developer mode, and choose **Load unpacked**.
2. Select this release's `ext/` directory.
3. Pin XtraType. The toolbar button opens its native side panel.
4. In Settings, keep the default `http://localhost:8787/api`, choose a display name, and use **Test server**.
5. Open an HTTP(S) page. Use the panel, context menu or optional quick bar. YouTube projection runs on `https://www.youtube.com/*`.

Chrome 116 is the manifest floor inherited from the native side-panel baseline; see the verification report for the browser actually exercised. Browser-protected pages remain unavailable for injection/capture. The existing all-sites host permission is retained; no remote code is loaded.

Automatic sync can be disabled. Local saves, quick saves, replies and schema installation then remain local; explicit **Sync now** and **Test server** still contact the configured server. Web posts remain server-first and need a running server.

## Upgrade existing data safely

Read `docs/UPGRADE_AND_RECOVERY.md` before replacing an installation. Keep the existing extension identity and profile: changing the unpacked extension path can create a different extension ID, which has a different IndexedDB origin. The DB remains `portashape-xtratype`, version 1, with the same five stores. No destructive migration is performed.

Do not replace old server data with the empty collections shipped here. Stop the old server and copy its complete `server/data/` contents to this release's `var/data/`, and its `server/media/` contents to `var/media/`. Preserve old media subdirectories. Use a backup and work on a copy first.

## Verification and release limits

Read `docs/VERIFICATION.md` for results and unrun gates, and `docs/CONCERN_DISPOSITION.md` for all 45 canon findings. Developer checks use Node's test runner: `npm ci`, then `npm test`. PHP integration checks run if PHP is available; absence is an explicit skip. No npm packages are needed to run the server or extension.

This is a local/single-user release candidate, not a public multiuser service. Display names are not authenticated identities. The JSON API still has no account-based authorization. Do not expose it publicly without a separate security/identity deployment design. A local malicious process or permitted extension can access this local service.

Snapshot replication remains upload-only. Events remain sparse diagnostics. There is no distributed deletion/tombstone protocol or conflict-safe multi-client editing. The panel's metadata JSON export does not contain image/screenshot binaries and is not a full restore backup. Existing missing blobs cannot be reconstructed by this release.

## Delivery contents

- `ext/`: complete loadable Chrome client, plain JavaScript, no build step.
- `server/`: PHP API, responsive web UI, schemas and restricted development router.
- `src/server/`: repository interface, JSON implementation and validation.
- `var/`: empty JSON collections and media placeholder.
- `tests/`: baseline assertions and new regression/integration fixtures.
- `docs/`: architecture, upgrade/recovery, schema profile, evidence and issue disposition.
- `release-manifest.json` and `SHA256SUMS.txt`: release identity and integrity inventory.

The supplied baseline did not specify a redistribution license. This package does not invent one; the owner should select licensing before distribution.
