# XtraType — Responsive web and mobile companion

**Canon edition:** 1.0 approval candidate · **Baseline:** supplied v2.3 / extension 2.3.0 · **Audit date:** 2026-10-01

## Hosting and initialization

`server/index.php` loads config, emits a responsive HTML shell, includes `assets/style.css`, exposes `window.XT_CONFIG.defaultGpsRadius`, and loads `assets/app.js` as a module. Data is fetched after page load, not server-rendered into the feed. No build/bundler, offline service worker, web-app manifest, browser push, login or local repository exists.

Initialization awaits `loadSchemas()` then `loadFeed()`. Several GET paths parse JSON without checking HTTP status/shape and top-level initialization has no recovery boundary. An unavailable/malformed schema endpoint can leave the application without a usable form. Auto-sync settings from the extension do not apply to this independent client.

## Tabs and actions

| Tab/action | Behavior | Engineering limits |
|---|---|---|
| Post | Target from server catalog; quote/body/images; multipart annotation | Online server-first, author always Web user |
| Nearby | Tab click calls geolocation and loads feed; distance-filter GPS annotations | No accuracy/age filtering, no watchPosition, no map/sorting by distance |
| All context | Entire server list; Refresh repeats GET | No identity scoping, search, pagination, editing or threads |
| Schemas | List catalog and install file | Shallow validation, no deletion/migration/compatibility preview |
| Header Use location | Acquire position, reload feed, rebuild GPS form when selected | Rebuild can erase unsaved radius/label |
| Form Use my location | Fill GPS lat/lon, retain position | Does not itself rerender Nearby/feed |

Geolocation requests high accuracy with a 10,000 ms timeout. Position is an in-memory variable. Nearby filters in the browser using coordinates; it does not send live location as an API query. Posting a GPS annotation intentionally sends its target coordinates. Web location gate uses server config default, not extension preference.

## Authoring details and parity

URL form offers bare URL, query mode and extraction. Extract builds rows with inclusion checkboxes, then replaces input with origin/path. getTarget takes rows rather than automatically importing unextracted query pairs; fragment always ignored. It uses `new URL` without extension's explicit HTTP(S)-only enforcement.

GPS input conversion accepts finite values and does not enforce lat/lon bounds; blank becomes zero. Radius positive behavior partly depends on native input min; there is no shared semantic validator. YouTube accepts URL plus times; short host substring uses first path segment, otherwise `v`; no Shorts-path support or strict hostname validation. End without start and end-before-start rejected; full target schema not validated.

Custom fields render enum before type. Nonenum number/integer inputs convert to numbers, boolean to checked state, others to strings. Enum select stays string even for a numeric schema. Required checks reject null/undefined/empty string only. Custom minimum/maximum are not copied like the panel does. Data identity can therefore differ between clients for apparently equivalent form input.

Files are validated to three, allowed MIME strings and 8 MiB each. A failed change clears web selected files, while panel keeps prior valid selection when a new invalid choice is rejected. Web previews have no individual-remove control. Post clears body/files after success, preserves quote and target fields, and does not reset native file input or disable submission. Repeated clicks/network ambiguity can create multiple IDs. No durable draft recovery exists.

## Rendering and layout

Feed creates a card for each item with escaped author/kind/quote/body, date, YouTube start text and `url` image thumbnails. It does not display sync state or parent relationships, and does not fetch image bytes into a local cache. Escaping attributes does not validate allowed image URL schemes/origins; arbitrary server-supplied image URLs can cause external loads.

CSS uses sticky header and tab bar, max-width 760 px content, cards, two-column field groups, scrollable previews and a min-width 700 px padding adjustment. Unlike panel CSS, the web CSS is one compressed line. It shares a visual style by convention, not shared tokens/components. Review tiny text contrast, hidden file-input keyboard access, checkbox styling, image alternatives, nav selected-state semantics, error associations, dynamic announcements and narrow-screen overflow. No conformance audit is claimed.

## Extension/web parity matrix

| Contract | Extension | Web |
|---|---|---|
| First durable write | IndexedDB | PHP collection |
| Offline creation | Local metadata/bytes, with stated sync caveats | No persistent queue |
| Context prefill | Active tab/selection/video | User input/geolocation only |
| URL fragment | Core supports, UI incomplete | Ignored |
| GPS resolver | Exact-key feed | Distance Nearby |
| YouTube Shorts parsing | Core yes | Composer no |
| Schemas offline | Built-ins + cached custom | No offline catalog guarantee |
| Snapshot/history/diff | Yes | No UI |
| Author | User setting | Hardcoded Web user |
| Metadata export | Yes | No UI |

Proposed parity work should centralize semantic functions while leaving host-specific capabilities explicit. Web offline mode, capture and script management are not automatically required merely because the extension has local storage or browser privileges.
