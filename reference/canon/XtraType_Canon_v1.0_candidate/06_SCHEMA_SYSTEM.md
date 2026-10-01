# XtraType — Schema catalog, rendering and validation

**Canon edition:** 1.0 approval candidate · **Baseline:** supplied v2.3 / extension 2.3.0 · **Audit date:** 2026-10-01

## Current catalog composition

Extension `BUILTIN` has URL, GPS and YouTube compact definitions. `loadSchemas()` creates a Map in precedence order: extension built-ins → local wrappers → remote entries. Later entries with the same `$id` win. Remote non-`xtratype.anchor.*` schemas are cached locally; remote built-ins only replace the in-memory definitions. It attempts network even if auto-sync is off. A valid prior selector value is preserved before considering the current page's YouTube identity.

Server GET loads every `server/schemas/*.schema.json`, then `data/schemas.json`. Wrapped or bare stored entries are supported. Last entry per `$id` wins. The four packaged files are URL, GPS, YouTube and Book (`example.anchor.book@1`). The Book example is therefore in the online catalog by default, not an inert sample. Deleting its stored override reveals the disk definition again.

Web `loadSchemas()` has no offline built-ins, fetches server catalog, preserves prior selection if available and otherwise leaves browser selection order. The disk/glob order is not a product contract; URL is not explicitly made the default web choice.

## Schema identity and metadata

`$id` identifies target vocabulary. `title` and `x-xtratype.label` provide labels. `x-xtratype.description` is introductory copy. `x-xtratype.kind` dispatches built-in forms (`url`, `gps`, `youtube`) or custom. The extension normalizer sets `kind:'custom'` and then spreads supplied metadata over it; supplied `kind` therefore overrides the supposed restriction. Both UIs trust catalog kind metadata. A custom ID can select a built-in form unexpectedly. This is a dispatch integrity defect, not executable JavaScript injection.

## Installation paths

| Path | Validation | Persistence and network |
|---|---|---|
| Panel local file | JSON parse, nonempty string `$id`, object type/properties, reserved prefix, supported-type presence | Local wrapper first, then POST always, then reload catalog |
| Web local file | JSON parse and shallow `$id`/type/properties/reserved prefix | Server POST only |
| Direct server POST | Array-like decoded schema, nonempty `$id`, object type, properties array-like, reserved prefix | Whole-record upsert in schema collection |
| Remote-to-panel load | No `normalizeCustomSchema` call | Cache custom schema and render directly |

Extension supported-type check accepts a union if **any** non-null type is among string/number/integer/boolean. A union containing string plus unsupported object can pass. Missing type defaults to string during normalization. Malformed property definitions can throw. Server does not enforce the same primitive subset. None of these paths performs complete Draft 2020-12 validation.

## Field behavior matrix

| Keyword/type | Panel | Web | Semantic guarantee |
|---|---|---|---|
| `enum` | Select, string option values; target builder coerces numeric schema types | Select; values remain strings because it tests control type | Numeric-enum parity broken |
| boolean | Checkbox; checked → boolean | Checkbox; checked → boolean | Required false accepted |
| number | Number input; empty → null | Same for ordinary numeric inputs | Browser validity helps; not shared/server validation |
| integer | Number input with step=1 | Same | Requiredness helper alone allows fractional numbers |
| string | Text input | Text input | No pattern/length enforcement by helper |
| `minimum`/`maximum` | Assigned as input attributes | Not generally copied for custom fields | UI behavior, not authoritative record validation |
| `required` | Reject undefined/null/empty string during build | Same | Whitespace string passes |
| `default` | Not applied | Not applied | Empty control behavior governs |
| nullable type union | First supported control interpretation; no explicit null toggle | Similar | Blank numeric null; blank strings remain empty |
| nested object/array | Pure nested types rejected on local panel install | Can be accepted server-side, then misrendered as text | No supported nested form contract |
| `$ref`, conditions, combinators, format, pattern | Not evaluated | Not evaluated | Schema syntax does not imply support |
| `additionalProperties` | Not evaluated | Not evaluated | Server preserves unknown data |

Native form validation occurs on normal form submission, but it is not a full validator and does not protect direct API writes or all helper callers. The helper `validateCustomValue` checks required presence only.

## Built-in drift

Disk URL schema includes pair structures, required query fields and URI format; compact extension schema omits much of that detail. Disk GPS uses exclusive minimum >0, max 100,000 radius and label maxLength 200; compact schema has minimum 1 without the same maximum. Disk YouTube has video-ID regex; constructors do not enforce it. Downloading fuller schemas does not automatically strengthen hand-written constructors.

## Proposed specification

SCH-01: all ingress paths MUST pass one documented compatibility validator before installation/cache/rendering. Unsupported constructs produce a list of unsupported paths/keywords and no partial installation. SCH-02: installed custom schemas cannot select reserved built-in kind handlers. SCH-03: validation, form conversion and key derivation share scalar typing; enum types preserve number/boolean semantics. SCH-04: built-in definitions are maintained from one source and generated/distributed with a versioned fixture suite. SCH-05: schema replacement distinguishes compatible metadata change from identity-breaking value change and requires migration/version policy.

A future full JSON Schema engine is a separate decision. Stabilization can instead implement a precisely specified subset with consistent rejection. Adding an ordinary custom target should not require a code patch; adding a resolver with time/geography/site behavior does require application code and acceptance tests.
