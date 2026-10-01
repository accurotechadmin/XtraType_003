# XtraType — Persisted records and transient data contracts

**Canon edition:** 1.0 approval candidate · **Baseline:** supplied v2.3 / extension 2.3.0 · **Audit date:** 2026-10-01

## Scope

These are observed client-produced shapes, not claims that the server validates every field. The PHP endpoints retain arbitrary extra fields and validate only limited envelopes. Field names and literal identifiers below are compatibility-sensitive. Evidence: `ext/core/db.js`, `ext/core/api.js`, `ext/sidepanel/app.js:saveAnnotation/persistSnapshot`, worker `quickCreate/quickReply`, web `post`, and all API endpoints.

## Annotation envelope

| Field | Typical type/value | Writer / semantics |
|---|---|---|
| `id` | string, `annotation:<UUID>` locally | Chrome/web generate UUID; server missing-ID fallback is prefix + 32 hex chars |
| `recordType` | `Context.Annotation` | All creators; server forces literal |
| `schemaVersion` | 2 | All creators; server forces 2 |
| `target` | `{kind,schemaId,value}` | Full structured meaning; server checks only nonempty array-like decoded structure |
| `targetKey` | string | Client-derived; server neither requires nor recomputes |
| `highlightedText` | string, often empty | Quote; no text selector/provenance locator |
| `body` | nonempty trimmed string from UI | Server requires nonblank string, preserves submitted whitespace, rejects >80,000 bytes |
| `attachments` | array | Empty for quick create/reply; local and remote shapes differ |
| `parentAnnotationId` | string or null | Reply shares parent target/key; no foreign-key/cycle/deletion enforcement |
| `author` | display string | Settings fallback `Local user`; web `Web user`; unverified identity |
| `createdAt` | ISO-style UTC string | Client timestamp; server preserves non-null supplied value or uses `gmdate('c')` |
| `updatedAt` | ISO-style UTC string | Client initially; server replaces on every POST |
| `syncState` | `local`, `pending`, `synced`, `error` | Workflow metadata; not revision or durable queue |
| `syncError` | optional string | Written by some failure paths; later success does not explicitly remove it |

Full composer/web text controls have `maxlength=20000` for body and 10000 for quote. Quick inputs and runtime message handlers do not reproduce all those limits. JavaScript/string controls and PHP byte count are not interchangeable units. Client-generated times use `toISOString()`; PHP uses a timezone-offset format. Lexicographic sorting of arbitrary accepted timestamps is not a normalized chronological protocol.

```json
{
  "id":"annotation:11111111-1111-4111-8111-111111111111",
  "recordType":"Context.Annotation","schemaVersion":2,
  "target":{"kind":"url","schemaId":"xtratype.anchor.url@1","value":{
    "url":"https://example.com/a","queryMode":"ignore","queryParameters":[],
    "fragmentMode":"ignore","fragment":null}},
  "targetKey":"url:https://example.com/a","highlightedText":"A quoted sentence",
  "body":"A comment about this page.","attachments":[],"parentAnnotationId":null,
  "author":"Local user","createdAt":"2026-10-01T06:00:00.000Z",
  "updatedAt":"2026-10-01T06:00:00.000Z","syncState":"local"
}
```

This is a documentation fixture, not user data.

## Media and attachment transformation

| Stage | Fields | Identity consequence |
|---|---|---|
| Local Blob record | `id`, `blob` (Blob), `type`, `size`, `createdAt`, optional `name`; metadata spread can override defaults | Stored independently under `blob:<UUID>` |
| Local attachment | `id:attachment:<UUID>`, `name`, `type`, `size`, `blobId`, `serverUrl:null` | Links annotation to local bytes |
| Outbound annotation JSON | Only attachment entries with `serverUrl` or `url`; normalize `url` from either | Local-only descriptors removed; bytes sent as `images[]` |
| Server media descriptor | `id:media:<32 hex>`, sanitized `name`, detected `type`, `size`, `url:/media/YYYY-MM/...` | New media ID, no original attachment ID or Blob ID mapping |
| Synced local annotation | Returned server attachment array | Normal local Blob references lost; old Blob still stored |

`serverUrl` is a client-supported legacy/optional field, not a field emitted by the upload helper. Do not document attachment IDs as stable across synchronization. Root-relative media paths are resolved by the panel against settings `apiBase` after stripping terminal `/api`; this couples data to the current server setting. Web rendering uses `url` directly. There is no checksum, image width/height, ownership, content-addressed ID, deduplication, media download cache, or deletion reference count.

## Snapshot envelope

| Field | Local/current meaning | Server behavior |
|---|---|---|
| `id` | `snapshot:<UUID>` per capture | Generate if empty; upsert permits same-ID replacement |
| `recordType` | `Revision.Snapshot` | Forced |
| `schemaVersion` | 1 | Preserved if supplied; not required/forced |
| `pageKey` | Default URL key, query and fragment ignored | Accepted without validation |
| `url`, `title` | Initial context's page URL/title | No canonicalization |
| `capturedAt` | Persistence-time ISO string | Retain or default server time |
| `mode` | `visible` or `full-page` | Not enum-validated |
| `metrics.viewport` | `width,height,scrollX,scrollY,devicePixelRatio` | Stored as received |
| `metrics.page` | `width,height` | Original measured page, not actual clipped screenshot bounds |
| `renderedText` | Extraction text or empty string | No server length cap |
| `renderedHtml` | Extraction HTML or empty string | No server length cap |
| `screenshotBlobId` | Local Blob reference | Removed by extension transport |
| `syncState`, `syncError` | Local upload status | Payload may retain pending/error state; endpoint does not force synced |
| `serverScreenshot` | Added locally from response `.screenshot` | Not the server's canonical screenshot field |
| `screenshot` | Normally only remote | First generic uploaded image descriptor |

Snapshot metadata and bytes are separate writes. Snapshot is append-oriented by normal creation, not API-enforced immutable. There is no DOM dependency archive, capture manifest, truncation flag, content hash, annotation link, recipe provenance, baseline choice, or stored comparison result.

## Schema storage

Extension custom wrapper: `{id:schema.$id,schema,updatedAt}`. Server custom wrapper adds `$id` alongside `id`: `{id,$id,schema,updatedAt}`. Catalog GET returns bare schemas; both clients tolerate wrappers in some paths. Built-ins reside in source files rather than an automatically persisted local store. Remote custom schemas are cached locally and can survive loss of server availability.

## Events

Local event: `{id:'event:<UUID>',type,data,occurredAt}`. Full creation uses `type:'annotation.created'` and `data:{annotationId,targetKey}`. Quick creation adds `source:'quickbar'`. Quick replies, captures, sync, deletes and web posts do not log corresponding local events. Server event POST accepts arbitrary object/array-like JSON, defaults ID/time, upserts, and has no connection to the extension event store. This is not an event-sourced architecture or complete audit trail.

## Settings and session context

`chrome.storage.local.xtratypeSettings` defaults to `{apiBase:'http://localhost:8787/api',author:'Local user',defaultGpsRadius:75,autoSync:true}`. `settings()` overlays stored fields; `saveSettings(next)` replaces the settings value. No account, credential, server ID, retention preference, script policy or local migration version is stored. Extension GPS gate setting is currently not consumed by the panel's exact-key feed; web default comes from PHP config instead.

`chrome.storage.session.xtratypeLastContext` successful shape: `pageUrl,title,highlightedText,currentVideoTime,viewport,page,tabId,capturedAt`. Injection-failure fallback retains URL/title/tab/time, empties highlight, sets video time null, adds `scriptAccess:false,accessReason`, and lacks dimensions. Successful `getContext` returns live context without necessarily refreshing this session record. No expiry, document ID or generation token is present.

## Metadata export

`{exportedAt,annotations,schemas,snapshots,events}` is serialized with indentation into `xtratype-export-YYYY-MM-DD.json`. Blob bytes, Blob store records, settings and remote media files are omitted. References alone cannot restore an installation. There is no import handler. The export is useful for inspection but MUST NOT be described as a complete backup.
