# XtraType — Anchor identities and contextual resolution

**Canon edition:** 1.0 approval candidate · **Baseline:** supplied v2.3 / extension 2.3.0 · **Audit date:** 2026-10-01

## Identity versus applicability

An annotation's structured `target` describes intent. `targetKey(target)` derives exact identity. Contextual retrieval may intentionally match more than one exact identity. Current consumers disagree in useful and accidental ways:

| Consumer | Matching rule | Result bound |
|---|---|---|
| Panel Context Here | Current form exact key; YouTube additionally same video ID | 50 newest by string `createdAt` |
| Worker quick-bar recent | URL policy against live page, or same YouTube video | Default 4, integer-like numeric request clamped 1–10 |
| YouTube adapter | All annotations for video ID | Unbounded |
| Web Nearby | GPS distance ≤ effective radius | Unbounded |
| Web All context | No target filter | Entire server collection |
| Annotation API | ID shortcut; otherwise optional videoId and targetKey filters combined | Entire matching collection |
| Snapshot timeline | Default URL page key | All local captures for origin/path |

If panel `buildTarget()` throws, `renderFeed()` falls back to **all** annotations instead of an empty/error context. Form-field edits do not generally trigger feed recomputation; target-kind changes, save, refresh and sync do. A displayed feed can lag the form's current target.

## URL anchor

Schema ID `xtratype.anchor.url@1`; shape: `value:{url,queryMode,queryParameters:[{key,value,include}],fragmentMode,fragment}`.

`parseUrlTarget(raw)` uses the platform URL parser and requires HTTP(S). It stores `origin+pathname`, all query pairs in order with `include:false`, query mode `ignore`, fragment mode `ignore`, and fragment text without `#` or null. The original raw URL, credentials and query ordering are not preserved as a separate source field.

Key generation starts with `new URL(value.url)`, selects all pairs for `all` or included pairs for `selected`, sorts by `key.localeCompare` then `value.localeCompare`, appends them and optionally sets a nonempty fragment. Prefix is `url:`. Duplicate pairs remain; sorting discards original order. This is application-specific canonicalization, not a universal canonical URL algorithm. Locale-sensitive sorting must be stabilized before cross-runtime conformance can be assumed for arbitrary Unicode.

| Input/policy | Key |
|---|---|
| `https://example.com/a?x=1&y=2#z`, ignore | `url:https://example.com/a` |
| Same, selected x | `url:https://example.com/a?x=1` |
| Same, all | `url:https://example.com/a?x=1&y=2` |
| Same, selected x + fragment include with preserved z | `url:https://example.com/a?x=1#z` |
| `https://example.com`, ignore | `url:https://example.com/` |

The worker's page matcher first requires exact origin/path. Fragment inclusion requires exact fragment text, including empty-versus-nonempty handling. Selected query matches require a multiset of chosen pairs; extra live pairs are allowed. All query matches require equal pair counts and matching pairs **except** that an early return treats zero chosen pairs as a wildcard. Thus an `all` anchor with no query pairs incorrectly matches a page with queries. Characterized in this audit.

The panel initially strips fragment from its bare-URL field and does not retain a dedicated fragment input. “Include fragment” normally therefore has no fragment value to include. Typing a complete URL with a fragment manually can reach the constructor, but extracting variables strips it again. Query rows are similarly authoritative: typing queries without extraction does not automatically update the rows. The web composer always emits ignore/null fragment and its key implementation ignores fragment entirely.

## GPS anchor

Schema ID `xtratype.anchor.gps@1`; `value:{latitude,longitude,radiusMeters,label}`. Extension converts coordinates with `Number`, enforces finite latitude [-90,90] and longitude [-180,180], radius null or positive, and stringifies label. Blank coordinate strings become zero and pass; fields are not `required`. This is a defect, not a supported “use equator/prime meridian by default” feature.

Key is `gps:<latitude.toFixed(6)>,<longitude.toFixed(6)>` plus `@<Number(radius)>` when radius is truthy. Label is excluded. Distinct coordinates may collide after rounding; stored full values still govern distance. Null radius and explicit 75 produce different keys despite sharing a default 75 m gate in some consumers.

Distance uses spherical Earth radius 6,371,000 m and Haversine formula, inclusive `distance <= radius`. Core `gpsMatches` defaults to 75; web uses explicit radius or `window.XT_CONFIG.defaultGpsRadius`. Web conversion checks finiteness but not coordinate bounds. Schema disk maximum radius 100,000 and label length 200 are not constructor/server guarantees. No geolocation accuracy, altitude, acquisition time or CRS is stored in the target.

## YouTube anchor

Schema ID `xtratype.anchor.youtube@1`; `value:{videoId,videoUrl,startSeconds,endSeconds}`. Both times nullable. A start alone is a point; both times make a range; neither is whole-video; end-only is rejected; equal start/end is accepted despite “after” error wording. Core accepts finite nonnegative times and does not clamp to duration.

Extension recognition uses hostname substring tests for `youtu.be` and `youtube.com`. It supports short paths, `?v=` and `/shorts/<id>` but also accepts lookalike hosts. There is no schema pattern enforcement on actual ID construction. Web URL parsing is even looser: a non-short-link host with a `v` query can provide an ID, and Shorts paths are not handled.

Keys: `youtube:<id>`, `youtube:<id>@12.500`, `youtube:<id>@12.500-18.000`. Key times round to milliseconds, stored values do not. Panel prefill rounds current video time to tenths; quick capture takes the numeric time directly. The first `<video>` is used, not a uniquely verified player.

The panel's ID field can override the ID parsed from URL; the canonical URL is then reconstructed. Quick creation supplies a point only when payload time is finite, otherwise bare video. The content script currently coerces `null` to zero for rendering and toast checks, so whole-video notes can incorrectly appear at 0:00. Replies share parent target and can therefore add markers at the same time.

## Custom anchor

Shape `{kind:'custom',schemaId:<installed $id>,value:<object>}`. Key: `custom:<schemaId>:<JSON.stringify(stable(value))>`. `stable()` recursively sorts object keys using `.sort()` and preserves array order. Empty strings, null, omitted fields, numbers and strings remain distinct where JSON serialization does. There is no ISBN cleanup, aliasing, case-folding or semantic equivalence. Optional empty controls are materialized as empty string/null/false and participate in identity.

Normal schema UI is limited to primitives, but the key function itself can canonicalize nested objects/arrays. Do not infer nested form support from that ability. Numeric enums are coerced by schema type in the panel but by HTML input type in the web client; web select values can stay strings and create different keys.

## Proposed invariants

Validate before constructing; prohibit placeholder targets; preserve source context separately from editable draft; one key algorithm per version; reject unsupported schemes and spoofed hosts; distinguish `null` from zero; expose exact-match and contextual resolvers by name; migrate old keys explicitly if corrected meaning changes. Preserve legitimate zero coordinates and zero time while rejecting missing coordinates. Keep source target alongside any reindexed key so migration is explainable.
