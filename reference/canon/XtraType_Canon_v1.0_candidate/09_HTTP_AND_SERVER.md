# XtraType — HTTP API and server implementation

**Canon edition:** 1.0 approval candidate · **Baseline:** supplied v2.3 / extension 2.3.0 · **Audit date:** 2026-10-01

## Common HTTP behavior

Base defaults to `http://localhost:8787/api`; web uses relative `api/`. Each endpoint includes `bootstrap.php`: config load, constants for data/media/schema directories, CORS, ensure directories. CORS sets origin from config (default `*`), headers `Content-Type, X-XtraType-Client`, methods `GET, POST, DELETE, OPTIONS`, and `Cache-Control:no-store`. OPTIONS exits 204 before normal endpoint logic. JSON responses use UTF-8 content type, pretty printing and unescaped slashes. No authentication, authorization, session, tenant, CSRF policy, pagination, request ID or protocol-version negotiation is implemented.

Errors: `{ok:false,error:<code>,message:<text>}`. Default error status 400 and code `invalidRequest`; annotation ID miss is 404 `notFound`; unsupported method normally 405 `methodNotAllowed`; storage paths can emit 500. PHP warnings/type errors and malformed unexpected shapes are not guaranteed to fit the JSON error envelope.

## Route inventory

| Route / method | Request contract | Response / behavior |
|---|---|---|
| `health.php` nominal GET | No fields | `{ok:true,service:'PortaShape XtraType MVP',time}`; no method guard, so non-OPTIONS methods also return health |
| `annotations.php` GET | Optional `id`, `videoId`, `targetKey` | ID takes precedence and returns `item`; otherwise apply both optional filters, string-sort createdAt descending, return `items` |
| `annotations.php` POST JSON | Annotation object | Normalize/validate described below, upsert, 201 `{ok:true,item}` even for replacement |
| `annotations.php` POST multipart | `payload` JSON and file fields (normally `images[]`) | Save all flattened file fields; append descriptors; validate count and annotation; same 201 |
| `annotations.php` DELETE | Required query `id` | `{ok:true,deleted:boolean}`; absent record false; no tombstone/media deletion |
| `schemas.php` GET | None | `{ok:true,items:[bare schema...]}` filesystem then stored merge by `$id` |
| `schemas.php` POST | Schema or `{schema:<schema>}` | Shallow validation, wrap/store, 201 `{ok:true,schema}` |
| `schemas.php` DELETE | Required query `id` | Delete stored wrapper only; `{ok:true,deleted}` |
| `snapshots.php` GET | Optional `pageKey` | Filter and capturedAt descending string-sort; `{ok:true,items}` |
| `snapshots.php` POST JSON/multipart | Snapshot; multipart `payload`, conventionally `screenshot` | First saved image becomes `screenshot`; force recordType/default ID/time; upsert, 201 `{ok:true,item}` |
| `events.php` GET | None | `{ok:true,items}` in stored order |
| `events.php` POST JSON | Arbitrary event object | Default null/missing ID/time, upsert, 201 `{ok:true,item}` |

GET filters use PHP `empty()` checks, so empty/`"0"` inputs do not act as normal nonempty filters. No PATCH/PUT implementation exists. No snapshot/event DELETE exists. All collections can grow without a page limit.

## Annotation POST normalization in exact order

For multipart, parse payload (default `{}`), require decoded array; save uploaded images; merge into supplied attachments; reject total > configured max. Then generate missing ID; force record type/schemaVersion; require nonempty array-valued target; require string body whose trim is nonempty; reject `strlen(body)>80000`; assign missing createdAt; replace updatedAt with server time; set syncState synced; upsert.

Consequences: media may be written before annotation validation fails; JSON-only POST bypasses the attachment-count/upload allowlist checks; `targetKey` can be missing/inconsistent; target schema/kind/value and author/quote/parent/timestamps are not fully validated; no parent existence check. Target “object” is a PHP associative-array expectation rather than strict object-schema validation. Body storage retains input whitespace. Arbitrary extra fields are retained, including client-only error metadata.

## Upload protocol

`flattened_uploads()` visits every `$_FILES` entry, flattening one multiple-file dimension; names are conventions, not a route allowlist. `save_uploaded_images()` checks count against `max_images` (3), upload success, size ≤8,388,608 bytes and actual MIME via Fileinfo. Accepted MIME→extension: PNG→png, JPEG→jpg, WebP→webp. No-file entries are skipped subject to loop order; count is checked before skip once at limit. Detected MIME, not caller extension, determines disk extension.

Media directory is UTC `YYYY-MM`. Disk basename is generated `media-<32 random hex>.<ext>`; upload original basename is sanitized to `[A-Za-z0-9._-]` with replacement/trimming and fallback `upload`. `move_uploaded_file` commits bytes, then descriptor is returned. No decoding/dimension check, rollback, duplicate suppression, content hash, quota, owner or cache policy for static media is added.

Snapshots reuse this helper and limits. A valid local PNG can exceed 8 MiB and fail remote upload. A snapshot request can upload multiple images; only the first descriptor is retained, so additional successfully saved files can be orphaned. Limits from PHP's own configuration can reject requests before application validation.

## JSON collection infrastructure

`collection_path(name)` allows lowercase alphanumeric/underscore/hyphen, maps to `data/<name>.json`. Endpoints pass hardcoded names. `ensure_dirs` creates data/media at mode 0775 if absent. `read_collection` treats absent/blank/unreadable/malformed/nonarray JSON as empty, with possible underlying warnings on read errors.

`mutate_collection` obtains exclusive lock on sibling `.lock`, reads current collection under lock, invokes mutation callback, serializes array values, writes random sibling temp file, renames it over collection and unlocks. `upsert_item` requires nonempty string ID and replaces the first matching record or appends. `delete_item` removes matching IDs. This prevents ordinary cooperating concurrent read-modify-write lost updates within one collection. It is not a multi-collection/media transaction, revision protocol or fsync-backed crash guarantee. Corrupt JSON may be treated as empty and overwritten on the next mutation.

`write_collection` is a general locked writer but has no shipped endpoint caller; its presence does not mean every operation uses it. `json_body` decodes associative JSON and accepts any array-like result, not a formal object contract. `uuid_like` produces prefixed random hex rather than RFC UUID formatting.

## Configuration

`server/config.php`: max image bytes 8 MiB; max images 3; default GPS radius 75; CORS origin `*`. Default radius is injected into web HTML/`XT_CONFIG`; it does not configure extension settings. No environment-variable override, data-root option, server ID, secrets, authentication policy, request-size limit or retention policy is included.

## Proposed API evolution boundary

Preserve legacy route behavior until a versioned change is approved, but add validation/access controls as explicit breaking/deployment changes where necessary. Recompute canonical keys server-side using a tested contract; validate records before staging media; define idempotent operation IDs and attachment IDs; return normalized timestamps, per-record revisions and typed errors. Move data outside the static root and protect media. Introduce change cursors/tombstones only with a complete reconciliation specification, not merely new fields. This work belongs to the PortaShape interchange/transport boundary and server storage concerns.
