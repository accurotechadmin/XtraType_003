# Architecture and JSON-to-SQL boundary

## Existing topology retained

The Chrome extension owns local context and IndexedDB. Extension-owned side-panel code creates notes and capture records. The service worker mediates page context, quick saves/replies and pinned tab operations. Page quick-bar and YouTube scripts only receive the bounded operations they need. The responsive PHP web client remains server-first.

`Context.Annotation` schemaVersion 2, `Revision.Snapshot` schemaVersion 1 and the `portashape-xtratype` IndexedDB v1 identity remain unchanged. Existing store names and message names remain. Additional local sync metadata (`syncBase`, attachment `serverBase`) binds media to the configured destination; those fields are not a new annotation family.

## JSON server storage

`src/server/Repository.php` defines `Repository::read(collection)` and `Repository::mutate(collection, callback)`. HTTP handlers do not open collection files. `JsonRepository` holds a shared lock for a read and an exclusive lock for the complete read/modify/replace transaction. It validates collection JSON and record IDs, writes a temporary sibling file, flushes/fsyncs where supported, and atomically renames. Malformed, empty or wrong-shaped JSON fails closed. Missing collections initialize logically as empty; they are written on the first mutation.

Media stays file-backed outside the web root. All files in a request are checked before any media persistence. Uploaded bytes determine the filename, so a lost-response retry does not accumulate duplicate files. Annotation attachment IDs from the new client survive upload. HTTP write failure after media persistence can still leave an unreferenced content-addressed file; automatic garbage collection is intentionally not introduced. There is no atomic transaction spanning filesystem media and JSON metadata.

Collection files are arrays for continuity with the prototype. The adapter scans them in memory; this is suitable for the current local scope, not an unlimited database. A successful write is process-safe on a local filesystem that supports advisory flock and atomic rename. Network/shared filesystems, multi-machine writers and power-loss behavior are not certified. Use backups.

## Later MySQL or PostgreSQL

Add an adapter at the repository boundary, not inside route handlers. Before implementation, select schema/indexes, transaction isolation, migration validation and rollback. Preserve IDs, record envelopes, created times, media ownership and existing HTTP paths. The present callback-based mutation seam is deliberately small; a SQL implementation can initially use a transaction and row/collection lock, then introduce explicit query methods through a reviewed interface change for efficient indexing.

Likely relational indexes include annotation ID, targetKey, target kind/video ID, createdAt and snapshot pageKey/capturedAt; these are design notes, not implemented migrations. SQL credentials must remain in server configuration outside the client. No SQL driver or schema is shipped as if operational.

## Local commit and sync

Annotation + image Blob records + creation event commit in one IndexedDB transaction. Snapshot + screenshot Blob also commit together. UI clears the draft only after local success. Unsynced records survive remote pulls. Clean-record merges preserve local blobId by stable attachment ID; local images render before remote URLs. Missing binary data blocks upload rather than silently dropping an attachment. Explicit sync reports failed work separately.

Server switching is blocked while annotations or snapshots exist. Use a separate profile for a different server. This conservative policy prevents silent media rebinding without introducing a migration UI. The current upsert API is not a distributed conflict-resolution protocol; concurrent edits across clients are outside this scope.

## Account, invitation and messaging boundary

XtraType 2.5 adds a bounded account layer to the existing PHP/JSON companion. The first registered account becomes the seed administrator; later registrations require a single-use invitation. Passwords are stored only as `password_hash()` results, session bearer tokens are stored centrally only as SHA-256 hashes, and protected API routes require an enabled account after initial setup. Invitation provenance is stored centrally and mirrored into the creator's private per-user JSON profile documents. Invitation creation is normally available to enabled users at one code per fixed-EST calendar day, with both global and per-user administrator controls.

Contact groups are per-user profile JSON. Direct messages and XT Group Chat messages are central JSON collections. XT Group Chats use case-sensitive five-character base62 codes and explicit member lists; the creator grants access. These controls are application authorization, not end-to-end encryption. The server still defaults to loopback and no TLS termination, public-hosting hardening, federation, distributed conflict protocol, remote device revocation or broad cross-device sync service is certified. Disabling a central account cannot erase data already committed to an extension's local IndexedDB.

## Capture and UI lifecycle

Capture requests pin tab, window, document ID, URL, viewport and page metrics. The worker serializes capture calls with at least 600 ms spacing and checks context before/after capture. Full-page assembly closes each tile after drawing, enforces 40 million pixels / 28,000 pixels per dimension / 30 tiles, and attempts scroll restoration in finally. Oversize pages fail explicitly instead of clipping. Dynamic page dimensions cause an explicit stop; fixed/sticky content can repeat across tiles. Visible and full captures include visible page overlays, matching the existing rendered-state approach.

Pixel comparison requires equal image dimensions and uses one proportional downsampling factor. It remains a simple RGB-difference visualization, not semantic change detection. Snapshots retain bounded HTML/text as inert data; the UI never evaluates saved HTML.

YouTube uses bounded polling for player/navigation identity rather than a document-wide observer that reacts to its own DOM. Stale query results are discarded, UI is removed on navigation/pagehide, null times remain whole-video notes, and reply errors preserve typed text. No separate userscript/plugin runtime is added.

## Deployment boundary

The launcher binds to 127.0.0.1, validates Host and Origin, and requires an X-XtraType-Client header for mutations. CORS/client-header checks are defense-in-depth, not substitutes for bearer account authorization. Empty XTRATYPE_EXTENSION_IDS permits extension origins; configure exact IDs to narrow this. Raw data/config/bootstrap/profile paths are not routed. Public multiuser hosting remains uncertified and requires a separate deployment/security review.
