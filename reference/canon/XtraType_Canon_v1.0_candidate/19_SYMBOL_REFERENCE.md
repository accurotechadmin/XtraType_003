# XtraType — Function and handler reference

**Canon edition:** 1.0 approval candidate · **Baseline:** supplied v2.3 / extension 2.3.0 · **Audit date:** 2026-10-01

## Function reference conventions

This is a complete index of named `function` declarations in shipped JavaScript/PHP, with parameters, physical source line and behavior. Private helpers are included. Anonymous callbacks/arrow helpers are covered in the following callback inventory and surface/message chapters. Parameters shown are source signatures, not a promise of runtime validation. Direct source copies permit inspection of every statement without inventing an API abstraction that does not yet exist.

## [ext/content/page-ui.js](evidence/baseline/ext/content/page-ui.js)

| Function / parameters | Line | Behavior and effects |
|---|---:|---|
| `formatTime(seconds)` | 117 | Format numeric seconds as minutes:seconds; null/invalid handling differs among surfaces. |
| `timeLabel(iso)` | 122 | Relative age under minute/hour/day then locale date; invalid timestamp empty. |
| `setStatus(message, kind = '')` | 132 | Set status text and error/success class; DOM-only helper, signature varies by surface. |
| `targetSuffix(item)` | 137 | Quick card target label; video/bare/point/range formatted text. |
| `renderRecent(items)` | 145 | Replace quick cards using safe DOM text nodes; hide section if empty. |
| `loadRecent()` | 174 | Request four current-page annotations from worker; ignore failure. |

## [ext/content/youtube.js](evidence/baseline/ext/content/youtube.js)

| Function / parameters | Line | Behavior and effects |
|---|---:|---|
| `ensureUi()` | 5 | Find YouTube progress DOM, attach marker host and toast; return false if no progress. |
| `render()` | 19 | Clear/recreate markers using time percentages; null numeric coercion and observer feedback risk. |
| `showCard(a, marker, interactive)` | 30 | Create hover/interactive YouTube card with reply/open controls; only hover has mouseleave dismissal. |
| `formatTime(sec)` | 46 | Format numeric seconds as minutes:seconds; null/invalid handling differs among surfaces. |
| `refresh()` | 47 | Request current video records asynchronously, assign annotation/video state and render. |

## [ext/core/anchors.js](evidence/baseline/ext/core/anchors.js)

| Function / parameters | Line | Behavior and effects |
|---|---:|---|
| `parseUrlTarget(rawUrl)` | 3 | Require HTTP(S), split origin/path/query/fragment, default policies ignore. |
| `youtubeInfo(rawUrl)` | 14 | Parse short/watch/Shorts identity using permissive hostname substrings; return null on parse/no-ID. |
| `makeYoutubeTarget(rawUrl, startSeconds = null, endSeconds = null)` | 25 | Validate nullable nonnegative times and order, produce canonical video target. |
| `makeGpsTarget(latitude, longitude, radiusMeters = null, label = '')` | 34 | Coerce and validate bounds/radius; blank coordinates become zero; return structured target. |
| `numberOrNull(value)` | 42 | Map blank/null/undefined to null; otherwise require finite nonnegative numeric coercion. |
| `stable(value)` | 47 | Recursively sort object keys, preserve array order; return canonicalizable value. |
| `targetKey(target)` | 53 | Derive kind-specific identity; web duplicate omits URL fragment support. |
| `haversineMeters(aLat, aLon, bLat, bLon)` | 72 | Spherical great-circle distance with Earth radius6371000m. |
| `gpsMatches(target, latitude, longitude, defaultRadius = DEFAULT_RADIUS)` | 79 | Require GPS kind and test distance <= explicit/default radius. |

## [ext/core/api.js](evidence/baseline/ext/core/api.js)

| Function / parameters | Line | Behavior and effects |
|---|---:|---|
| `settings()` | 3 | Overlay xtratypeSettings on defaults from Chrome local storage. |
| `saveSettings(next)` | 9 | Replace xtratypeSettings value and return supplied next object. |
| `api(path, options = {})` | 11 | Extension private Fetch wrapper resolves saved base, parses JSON, throws for HTTP failure. |
| `syncAnnotation(annotation, blobs = [])` | 20 | Transform local attachments to multipart; POST; merge returned item and persist synced locally. |
| `pullAnnotations()` | 31 | GET full annotation collection, return items or empty array. |
| `pullSchemas()` | 32 | GET catalog, return items or empty array. |
| `pushSchema(schema)` | 33 | POST wrapped schema JSON, return response schema. |
| `syncSnapshot(snapshot, screenshotBlobRecord)` | 35 | Remove local screenshotBlobId from wire; POST optional screenshot; return server item without local persistence. |
| `serverHealth()` | 43 | GET health endpoint through saved API base. |

## [ext/core/db.js](evidence/baseline/ext/core/db.js)

| Function / parameters | Line | Behavior and effects |
|---|---:|---|
| `openDb()` | 6 | Memoize IDB open request; initialize stores/indexes at version1. |
| `request(req)` | 29 | Wrap IDBRequest success/error in Promise; does not wait for a larger transaction. |
| `put(storeName, value)` | 36 | Write record in one-store transaction and wait for transaction completion/error/abort. |
| `get(storeName, id)` | 44 | Read one record by ID. |
| `all(storeName)` | 49 | Read all records in a store; unbounded. |
| `remove(storeName, id)` | 54 | Delete one ID in transaction; no explicit abort handler. |
| `byIndex(storeName, indexName, key)` | 61 | Read all records for one index key. |
| `id(prefix)` | 66 | Generate prefix:crypto.randomUUID() string. |
| `addBlob(blob, meta = {})` | 68 | Create Blob record with type/size/time/metadata then persist. |
| `logEvent(type, data = {})` | 74 | Create local event ID/type/data/time then persist. |

## [ext/core/schemas.js](evidence/baseline/ext/core/schemas.js)

| Function / parameters | Line | Behavior and effects |
|---|---:|---|
| `normalizeCustomSchema(schema)` | 34 | Validate shallow object/ID/type support, reserve prefix, merge metadata; override/union gaps remain. |
| `validateCustomValue(schema, value)` | 47 | Reject only missing/null/empty required values; return true otherwise. |

## [ext/service-worker.js](evidence/baseline/ext/service-worker.js)

| Function / parameters | Line | Behavior and effects |
|---|---:|---|
| `activeTab()` | 20 | Query active tab in current window; return first tab or null; browser side effect is read only. |
| `pageScriptability(rawUrl='')` | 27 | Parse URL and reject known browser/Web Store surfaces; return capability reason, not a complete permission grant. |
| `requireScriptableTab(tab)` | 38 | Require tab ID and successful URL preflight; throw otherwise. |
| `tabContext(tabId, tabUrl='')` | 45 | Inject top-frame function and return URL/title/selection/video/viewport/page data; browser operation can reject. |
| `rememberContext(tab)` | 63 | Capture or construct access-failure fallback, then write Chrome session context. |
| `openPanelForTab(tab)` | 77 | Remember context, configure per-tab panel and call native open; return ok. |
| `openQuickBarForTab(tab)` | 85 | Require scriptable tab, remember context and inject quick IIFE. |
| `quickCreate(payload)` | 100 | Build URL/video target; commit pending note and event; optionally sync; return local record on sync failure. |
| `urlTargetMatchesPage(target, rawPageUrl)` | 120 | Apply origin/path/fragment/query multiset applicability; current empty-all-query defect. |
| `annotationMatchesPage(annotation, rawPageUrl)` | 140 | Use same-video predicate when applicable, else URL page predicate. |
| `recentAnnotationsForPage(rawPageUrl, limit = 4)` | 146 | Optionally pull all remote notes into DB, filter context, sort newest and bound limit. |
| `youtubeAnnotations(videoId)` | 161 | Optionally full-pull remote notes and return local same-video records. |

## [ext/sidepanel/app.js](evidence/baseline/ext/sidepanel/app.js)

| Function / parameters | Line | Behavior and effects |
|---|---:|---|
| `setStatus(el, message, error=false)` | 10 | Set status text and error/success class; DOM-only helper, signature varies by surface. |
| `safe(s)` | 11 | HTML-escape &, <, >, quotes and apostrophe; does not validate URLs or record shape. |
| `formatTime(sec)` | 12 | Format numeric seconds as minutes:seconds; null/invalid handling differs among surfaces. |
| `schemaLabel(s)` | 13 | Resolve metadata label, title, then ID for panel catalog. |
| `schemaKind(s)` | 14 | Resolve metadata kind or custom; currently trusts supplied dispatch metadata. |
| `loadSchemas()` | 16 | Fetch/merge/populate schema catalog and rerender target fields; panel additionally caches custom entries. |
| `refreshContext()` | 24 | Read session/live context, update strip/quote and rebuild schema form/feed/timeline. |
| `renderTargetFields()` | 36 | Dispatch current schema kind to URL/GPS/YouTube/custom panel form. |
| `renderUrl(host)` | 44 | Build URL/query/fragment policy controls and extraction handler; fallback URL can be example.com. |
| `renderGps(host)` | 52 | Build coordinate/radius/label controls and geolocation handler. |
| `renderYoutube(host)` | 57 | Build ID/URL/time controls with current time and bare-video actions. |
| `renderCustom(host,schema)` | 64 | Build enum/boolean/numeric/text controls from schema properties, with some native bounds. |
| `buildTarget()` | 75 | Read panel controls, invoke constructors or custom presence validator, return structured target. |
| `validateFiles(files)` | 89 | Reject excessive count, MIME string mismatch or >8MiB per file; different signature in web. |
| `saveAnnotation()` | 91 | Panel local Blob/note/event sequence then optional sync; reset body/files and rerender. |
| `renderFeed()` | 102 | Panel filters local current target and caps50; web renders supplied full list into chosen host. |
| `renderPreviews()` | 110 | Create image object URLs for selected files; panel adds remove buttons; no full disposal. |
| `pull()` | 112 | Panel best-effort manual sync: annotations, schemas, snapshots pushes then annotations/schema pulls. |
| `makeVisibleSnapshot()` | 120 | Read tab/context, capture visible window, extract tab, convert pixels and persist. |
| `makeFullSnapshot()` | 124 | Compute capped tile grid, scroll/wait/capture/decode, restore on success, stitch and persist. |
| `persistSnapshot(c,extract,blob,mode)` | 130 | Write screenshot Blob then snapshot metadata, optionally upload and update local state. |
| `dataUrlToBlob(dataUrl)` | 134 | Decode base64 data URL into typed bytes and Blob. |
| `renderSnapshots()` | 136 | Query local pageKey index, sort, create timeline/thumbs and latest image. |
| `showSnapshot(s)` | 141 | Read selected snapshot Blob, revoke prior selected URL, update large preview. |
| `compareLatest()` | 143 | Load newest two local screenshots, resample, threshold RGB, draw diff and score. |
| `renderSchemaList()` | 147 | Render panel schema label/ID/property-name cards. |
| `installSchema(file)` | 149 | Parse selected JSON and validate available subset; panel saves locally then pushes; web only posts. |
| `loadSettingsForm()` | 151 | Populate panel settings controls from merged Chrome local settings. |
| `exportMetadata(items)` | 153 | Create JSON download Blob and object URL; revoke download URL after1s. |

## [server/api/bootstrap.php](evidence/baseline/server/api/bootstrap.php)

| Function / parameters | Line | Behavior and effects |
|---|---:|---|
| `cors()` | 9 | Set CORS/cache headers and terminate OPTIONS204. |
| `respond($data, int $status = 200)` | 18 | Set status/content type, JSON encode response and exit. |
| `fail(string $message, int $status = 400, string $code = 'invalidRequest')` | 25 | Build standardized error envelope and delegate to respond. |
| `ensure_dirs()` | 29 | Ensure data/media directories exist or fail500. |
| `collection_path(string $name)` | 33 | Validate safe collection name and derive JSON pathname. |
| `read_collection(string $name)` | 38 | Read/decode array or return empty for missing/invalid input. |
| `write_collection(string $name, array $items)` | 48 | Lock and serialize supplied full collection to temp then rename; unused by endpoints. |
| `mutate_collection(string $name, callable $mutator)` | 62 | Lock-read-mutate-write-rename one collection; callback returns next array and result. |
| `upsert_item(string $collection, array $item)` | 81 | Require ID string; replace same-ID first match or append under mutation lock. |
| `delete_item(string $collection, string $id)` | 93 | Filter all matching IDs and report whether count changed. |
| `json_body()` | 101 | Read php input, decode associative JSON, require array-like value. |
| `uuid_like(string $prefix)` | 108 | Prefix random_bytes(16) hexadecimal ID. |
| `sanitize_filename(string $name)` | 110 | Basename, replace unsupported chars, trim punctuation, fallback upload. |
| `save_uploaded_images(array $files)` | 115 | Validate PHP upload status/count/size/detected MIME, write generated media files, return descriptors. |
| `flattened_uploads()` | 144 | Flatten every file field into upload entries; field names not constrained. |

## [server/api/schemas.php](evidence/baseline/server/api/schemas.php)

| Function / parameters | Line | Behavior and effects |
|---|---:|---|
| `builtins()` | 4 | Read every server disk *.schema.json with nonempty $id into catalog array. |

## [server/assets/app.js](evidence/baseline/server/assets/app.js)

| Function / parameters | Line | Behavior and effects |
|---|---:|---|
| `status(el,msg,error=false)` | 3 | Web status text/class helper. |
| `kind(s)` | 4 | Read schema kind metadata or custom (optional chaining). |
| `label(s)` | 4 | Read schema label/title/ID; no schema validation. |
| `stable(v)` | 5 | Recursively sort object keys, preserve array order; return canonicalizable value. |
| `targetKey(t)` | 6 | Derive kind-specific identity; web duplicate omits URL fragment support. |
| `hav(a,b,c,d)` | 7 | Web duplicate Haversine distance helper. |
| `loadSchemas()` | 9 | Fetch/merge/populate schema catalog and rerender target fields; panel additionally caches custom entries. |
| `renderTarget()` | 10 | Generate web URL/GPS/YouTube/custom controls and bind extraction/location actions. |
| `getTarget()` | 11 | Read web fields and construct target; weaker validation and enum type drift versus extension. |
| `validateFiles()` | 12 | Reject excessive count, MIME string mismatch or >8MiB per file; different signature in web. |
| `post()` | 13 | Create Web user annotation, POST multipart, clear body/files and reload feed on success. |
| `loadFeed()` | 14 | GET all server annotations then render all-context and Nearby. |
| `renderFeed(host,items)` | 15 | Panel filters local current target and caps50; web renders supplied full list into chosen host. |
| `renderNearby(items)` | 16 | Filter supplied GPS records against in-memory position/effective radius and render. |
| `locate()` | 17 | Acquire position, reload feed, rebuild GPS form if selected. |
| `locateIntoForm()` | 17 | Acquire position and fill GPS lat/lon; does not reload feed. |
| `renderPreviews()` | 18 | Create image object URLs for selected files; panel adds remove buttons; no full disposal. |
| `renderSchemas()` | 19 | Render web schema label/ID/property names. |
| `installSchema(f)` | 20 | Parse selected JSON and validate available subset; panel saves locally then pushes; web only posts. |

## Arrow helpers, callbacks and module initialization

| File | Non-declaration callable / event family | Behavior / references |
|---|---|---|
| core/anchors.js | `rad` within Haversine; sort/filter/map callbacks | Degree conversion and canonicalization helpers, pure; document05 |
| core/db.js | IDB upgrade/success/error/complete/abort callbacks | Repository lifecycle; document10 |
| core/api.js | Attachment filter/map callbacks | Local-to-wire transformation; document04/10 |
| service-worker.js | onInstalled/onStartup/onClicked/onMessage; injected `func` closures | Menus, runtime routes, context/scroll/extraction; document08 is complete message contract |
| sidepanel/app.js | `$`; `positions` within full capture; event handlers; per-field schema/file handlers | DOM lookup, tile-offset construction, UI bindings; documents07/11 and inventory18 |
| content/page-ui.js | Top-level IIFE, close/panel/post click, keydown | One overlay per host ID, posting and keyboard behavior; document07 |
| content/youtube.js | IIFE, `videoId`, `esc`, interval/observer/runtime listener, marker/card/reply callbacks | Site identity, escaping, polling and projection; document07 |
| server/assets/app.js | `$`, `api`, `safe`; nav/control callbacks; top-level awaits | DOM lookup, relative route, escaping and web lifecycle; document12 |
| server/api/bootstrap.php | Mutation closures for upsert/delete | One-collection replacement and filtered deletion under lock; document09 |
| server/api/annotations.php | GET filter/sort arrows; top-level method branches | ID precedence, video/key filters, createdAt order; document09 |
| server/api/snapshots.php | GET filter/sort arrows; top-level branches | PageKey filter, capturedAt order; document09 |
| server/api/schemas.php | Catalog loop and top-level branches | Bare-schema merge/wrapper persistence; document06/09 |
| server/api/events.php / health.php | Top-level request handling | No named helper functions; routes in document09 |

## Export surface and dead-code notes

All declared `export function`/`export async function` declarations in core modules are importable; `BUILTIN` is the schema constant export. `numberOrNull`, `stable`, repository request wrapper and generic HTTP api helper are private. Content scripts export nothing and must remain self-contained in the present injection model.

Panel imports `remove` and `gpsMatches` without using them, and instantiates unused TextEncoder `enc`. API module imports `get` without using it. PHP `write_collection` is unused by shipped endpoints. These are seeds/dead code, not hidden implemented features. Full symbol list also exists in [symbols.json](evidence/symbols.json).
