# XtraType — Local durability and synchronization semantics

**Canon edition:** 1.0 approval candidate · **Baseline:** supplied v2.3 / extension 2.3.0 · **Audit date:** 2026-10-01

## Local repository

IndexedDB database `portashape-xtratype`, version 1. All stores use keyPath `id`. Annotations have nonunique `targetKey` and `createdAt` indexes; snapshots have nonunique `pageKey`; blobs/schemas/events have no secondary indexes. `onupgradeneeded` creates a store and its indexes only if store absent. No migration beyond initial creation, blocked/versionchange handling or reset-on-open-error exists. A rejected memoized `dbPromise` remains rejected for that execution context.

| Helper | Contract |
|---|---|
| `openDb()` | Per-module-context cached Promise of IDB connection |
| `put(store,value)` | New single-store readwrite transaction, resolve on complete; reject error/abort |
| `get(store,id)` | Read request result |
| `all(store)` | `getAll()` entire store |
| `remove(store,id)` | Delete in readwrite transaction; no explicit onabort handler |
| `byIndex(store,index,key)` | Indexed `getAll(key)` |
| `id(prefix)` | Prefix + browser crypto UUID |
| `addBlob(blob,meta)` | Construct Blob metadata, spread meta, put blobs |
| `logEvent(type,data)` | Construct event with UTC timestamp, put events |

Most annotation reads scan everything even though indexes exist. Snapshot retrieval uses pageKey index. Multi-step workflows do not share an IDB transaction. Extension storage loss/uninstall is not recoverable through the metadata export alone. There is no persistent-storage request, quota monitor, cleanup, import, deduplication or app-level integrity repair.

## State labels are workflow hints

| Entry path | Initial local state | Network rule | Failure / success |
|---|---|---|---|
| Full composer | `pending` if autoSync else `local` | Only immediate upload gated by autoSync | error + syncError / merged synced |
| Quick create | Always `pending` | Immediate upload gated by autoSync | error + syncError / merged synced |
| Quick reply | Always `pending` | Always attempts upload | Failure swallowed; success DB synced but returned object pending |
| Snapshot creation | Always `pending` | Immediate upload gated by autoSync | error + syncError / local synced with serverScreenshot |
| Schema installation | No sync-state field | Always attempts push and later pull | Status message only; local wrapper persists |
| Manual sync | Skips only `synced` annotations/snapshots | Runs regardless of autoSync | Per-item errors swallowed; later pull may overwrite |
| Worker lookup | No local outbox processing | Full annotation pull only when autoSync | Remote records stored as synced |
| Panel schema load | No state | Always attempts pull | Failure silently uses local/built-in catalog |

Thus auto-sync off is not a global network kill switch. It is primarily a conditional on some save/lookup paths. There is no background retry scheduler, exponential backoff, timeout, operation journal, queue lease, per-destination receipt, record revision, conflict state or tombstone. `pending` does not prove an active worker is processing anything.

## Extension HTTP adapter

`api()` loads settings for each call, trims one trailing slash from API base and leading slash from endpoint, fetches, attempts JSON parse, throws on non-2xx using response message/status, returns parsed result (possibly null) on success. No AbortController, request timeout, response-schema validation or `ok` field enforcement. Sync callers can fail during dereference after a nominal 2xx invalid response. Settings changes mid-batch can route different operations to different servers.

`syncAnnotation` creates multipart payload, excludes local-only attachment descriptors, sends Blob bytes, merges `{...annotation,...data.item,attachments:...,syncState:'synced'}` and writes the annotation. Failure after server acceptance but before local commit/response receipt leaves the local record retryable; another upload creates fresh media files. Record upsert limits duplicate record IDs, but does not make media uploads idempotent.

## Manual synchronization in exact order

1. Read all annotations; for each state other than synced, gather Blob records for attachments with `blobId` and no URL. Missing Blob records are silently skipped. Attempt push with a pending copy; increment success counter only on success. No durable transition to pending before that call.
2. Read every local schema; push each nonreserved custom schema, including unchanged schemas. Errors ignored.
3. Read all snapshots; push nonsynced records and associated Blob if present. On response, retain original local snapshot plus serverScreenshot and local synced. Errors ignored.
4. Pull all annotations and unconditionally put each as synced by ID.
5. Report pushed annotation count and pulled annotation count; load schemas and refresh feeds/timeline.

There is no snapshot pull, event sync, deletion reconciliation, media download or transactional checkpoint. Counts omit schema/snapshot failures. A failed annotation upload can be followed by a successful pull of an older same-ID record, losing local changes and falsely marking synced. Worker recent/video pulls can do the same outside manual sync.

## Destination and deletion hazards

`apiBase` is global while sync state is stored on records without a destination. Changing servers skips old synced records on manual push, may resolve old relative media against a new origin, and merges another server's records into the same local collection. No namespace partition exists. Treat server switching as a migration problem.

Server DELETE removes a record only on the server. Full pulls never remove local records absent remotely. A local synced record may remain visible forever; later explicit state changes/reposts can resurrect it. Schema deletion similarly does not remove local cached definitions; manual sync may reintroduce a stored definition. There are no tombstones.

## Local image integrity

Before sync, attachments point to local Blobs. After sync, normal descriptors point to remote URLs and local Blob IDs are lost from annotation metadata. Local Blob bytes remain but are not found by that annotation, so offline images can disappear after a successful sync. This is both a retrieval defect and orphan accumulation. Snapshot sync does preserve `screenshotBlobId`, so snapshot local rendering has a different durability property.

Missing local attachment blobs during manual sync are not treated as a hard error: their descriptors are filtered out of outbound JSON and no bytes are uploaded, allowing a successful server record with missing images. Recovery must distinguish missing bytes from deliberately removed attachments.

## Required evolution — proposed

SYN-01 preserve local binary mapping independently of remote descriptors. SYN-02 protect dirty records during pull; quarantine conflict instead of overwrite. SYN-03 centralize network policy and serialize/coordinate sync across UI/worker. SYN-04 use destination IDs and explicit server-switch migration. SYN-05 make upload retry idempotent. SYN-06 surface per-record outcomes and timeouts. SYN-07 add delta cursors, revisions and tombstones as one protocol change. SYN-08 implement complete remote snapshot restore only with binary retrieval/integrity checks. SYN-09 classify events as local diagnostic history or explicitly opted-in replication; do not silently turn them into telemetry.

Keep compatibility fixtures for all old state labels and attachment shapes. A migration can recover only links supported by evidence; do not guess that the nth orphan Blob belongs to the nth remote image.
