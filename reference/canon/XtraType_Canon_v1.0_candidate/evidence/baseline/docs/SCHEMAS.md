# XtraType anchor schemas

XtraType ships three first-class anchor-handle schemas and accepts user-supplied schemas.

## URL

A URL target stores the bare URL separately from query matching policy. Query parameters are extracted from the active page for convenience, but are ignored by default. A user can include individual parameters and edit their matching value.

Important fields: `url`, `queryMode`, `queryParameters[]`, `fragmentMode`.

## GPS

A GPS target stores WGS84 latitude/longitude. `radiusMeters` is optional. If omitted, matching uses the configured default radius (75 m in this MVP) without rewriting the stored anchor.

Important fields: `latitude`, `longitude`, `radiusMeters`, `label`.

## YouTube

A YouTube target is keyed by video ID. `startSeconds` and `endSeconds` are optional:

- neither: whole video
- start only: timestamp
- start + end: time range

An end time without a start is invalid. End must be >= start.

## Custom schema format

Upload a `.json` file shaped like:

```json
{
  "$id": "example.anchor.book@1",
  "title": "Book",
  "type": "object",
  "required": ["isbn"],
  "properties": {
    "isbn": {"type": "string", "title": "ISBN"},
    "page": {"type": "integer", "title": "Page", "minimum": 1},
    "edition": {"type": "string", "title": "Edition"}
  },
  "x-xtratype": {
    "label": "Book",
    "description": "Attach context to a book/page tuple"
  }
}
```

The MVP renderer supports string, number, integer, boolean and enum fields. Custom matching is exact over a canonical JSON representation.
