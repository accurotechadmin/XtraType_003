# Supported custom anchor schema profile

Custom schemas are inert data and primitive forms, not executable plugins or a full JSON Schema engine.

Root keywords: `$schema`, `$id`, `title`, `description`, `type: object`, `properties`, `required`, boolean `additionalProperties`, `x-xtratype`. At most 50 fields. Built-in `xtratype.anchor.*` IDs and URL/GPS/Time/YouTube kind claims are reserved.

Field keywords: `type`, `title`, `description`, `enum`, `minimum`, `maximum`, `minLength`, `maxLength`, `default`. Types: one of string/number/integer/boolean, optionally with null. `enum` has at most 100 primitive entries and retains primitive types. Required fields cannot be missing, null or empty strings. False and zero remain meaningful values. Numeric bounds, integer constraints, Unicode character lengths and enum membership are enforced by client and server. Optional blank numeric fields are omitted unless nullable.

Defaults are retained and validated metadata; the current form does not automatically apply them. References, nested object/array fields, pattern/format validators, combinators and executable semantics are unsupported and rejected at installation. Previously installed schemas that relied on silently ignored constraints remain in storage but must be revised to this explicit profile before new writes. Existing records are not migrated or deleted.

The packaged `server/schemas/example-book-anchor.schema.json` remains the custom Book example. Built-in schema files remain included. The JS core anchors/schemas sources are copied to server/assets/core by `scripts/sync-shared.mjs`; tests compare them to prevent web/extension drift. HTTP handlers validate independently in PHP; interoperability fixtures cover all target families.
