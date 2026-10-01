# Architecture

## UI priority in v2.2

The Chrome Side Panel is the canonical extension workspace. XtraType is rendered first and owns the primary annotation composer; capture, history, comparison, schemas, and settings are supporting modules below it. The injected quick-comment bar is an optional alternate entry surface and is never injected merely because the side panel was opened. The XT toolbar action is permanently bound to Chrome’s native side-panel opening behavior; the quick bar is launched separately from the panel or page context menu.

## Product hierarchy

**XtraType is the top-level user experience.** Object Click is the browser host beneath it; snapshots, comparison and sync are reusable capabilities. The server is a continuity/archive host, not the semantic owner of browser state.

```text
User
 ├─ XtraType side-panel composer / page overlay / YouTube markers
 │   ├─ URL anchor
 │   ├─ GPS anchor
 │   ├─ YouTube time anchor
 │   └─ Custom JSON-schema anchor
 ├─ Snapshot / timeline / compare
 └─ Schema + settings tools
        │
        ▼
Object Click browser capabilities
 selection · DOM state · screenshot tiles · active video state
        │
        ▼
IndexedDB local repository  ⇄  PHP JSON API + media files
```

## Local-first rule

Annotations, attachments, schemas and snapshots are written to IndexedDB first. Server synchronization is a second operation. A server 404/offline failure therefore marks an item `pending` rather than preventing the user's local write.

## Core records

### Annotation

```json
{
  "id": "annotation:<uuid>",
  "recordType": "Context.Annotation",
  "schemaVersion": 2,
  "target": {"kind": "url", "schemaId": "xtratype.anchor.url@1", "value": {}},
  "targetKey": "url:https://example.com/path",
  "highlightedText": "optional selected text",
  "body": "comment",
  "attachments": [],
  "parentAnnotationId": null,
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601",
  "syncState": "local|pending|synced|error"
}
```

### Snapshot

A snapshot stores a normalized page key, title, viewport/page metrics, rendered text, rendered HTML (bounded in the extension), screenshot blob reference, timestamps and optional server media reference. Snapshots are immutable observations; recapturing creates another revision.

## Built-in resolution

- URL: normalized origin/path plus included query parameters; ignored parameters remain recorded as capture metadata but do not affect the target key.
- GPS: Haversine distance against `radiusMeters`, or the configured default radius when radius is omitted.
- YouTube: video ID plus optional start/end seconds. Bare-video comments are valid but do not draw time markers.
- Custom: deterministic canonical JSON key over the schema ID and stored value. The MVP does not guess semantic equivalence between two custom records.
