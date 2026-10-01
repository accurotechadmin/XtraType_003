# Baseline compatibility and feature coverage

Source: supplied v2.3 prototype, byte-identical to all 38 files under the canon's
`evidence/baseline/`. The canon remains an approval candidate. This checklist
records preservation and evidence; it is not a claim of complete runtime parity.

| Existing feature/contract | Release location | Evidence / remaining check |
|---|---|---|
| Native side panel, toolbar/context-menu entry, Ctrl+Q action toggle, `xt` omnibox composer entry, optional quick bar | ext/manifest.json, ext/service-worker.js, ext/sidepanel/, ext/content/page-ui.js | Manifest/UI regression checks plus worker/DOM fixtures; native shortcut/omnibox gesture and real site injection still need manual Chrome acceptance |
| URL query/fragment, GPS, generic Time moment/range, YouTube whole/time/range, primitive custom targets | ext/core/anchors.js, schemas.js, server/assets/core/ | Anchor/core/HTTP tests; existing URL/GPS/YouTube key algorithms retained and Time adds a distinct canonical UTC key family |
| Annotation v2, body/quote/display author, replies, images | ext/core/records.js, sidepanel/app.js, content/youtube.js | Atomic save, typed form, failed reply and image retry fixtures |
| Existing local DB identity and five stores | ext/core/db.js | fake-IndexedDB transaction/rollback; real existing-profile upgrade unrun |
| Local-first extension saves and explicit/automatic server replication | ext/core/api.js, service-worker.js | Dirty pull protection, blob links, missing binary, autosync-off and destination guards |
| Annotations feed and page recent annotations | sidepanel/app.js, service-worker.js, content/page-ui.js | Invalid-target/stale-context DOM checks; side panel now refreshes on active-tab, URL, SPA-history and fragment changes; all-site behavior still needs native acceptance |
| Seven-day week-young badge and tree state | service-worker.js, sidepanel/app.js | Every annotation created within seven days, including the current user's content, remains green/tree-marked and counts for matching URL/YouTube context badges until it ages out or is explicitly cleared by **Mark all as old**; merely viewing it does not clear state |
| YouTube markers, timed notices and replies | ext/content/youtube.js | Null-vs-zero, stable DOM and error fixture; real YouTube SPA/player unrun |
| Viewport/full-page screenshot + HTML/text snapshot | ext/core/capture.js, service-worker.js, sidepanel/ | Header Snapshot button defaults to full-page; Capture preference can switch it to visible-only; tile geometry, failure restoration/resource cleanup and worker pin/pacing tests remain; actual Chrome screenshots unrun |
| Timeline and latest-two pixel comparison | ext/sidepanel/app.js | Source reviewed; rejects mismatched dimensions; real image comparison/visual review unrun |
| Schema catalog and JSON schema installation | ext/core/schemas.js, server/api/schemas.php | Supported primitive profile tests; unsupported semantics explicitly rejected |
| Settings, server test, metadata export | ext/sidepanel/app.js, ext/core/api.js | Settings/destination logic tests; manual UI/export gate remains |
| PHP health/schemas/annotations/events/snapshots routes | server/api/ | Real HTTP integration and JSON corruption tests; after account initialization these routes require an enabled authenticated account |
| Accounts/invitations/admin controls | src/server/Auth.php, server/api/auth.php, invites.php, admin.php | First registration seeds admin; later accounts require single-use invitations; one invite creation per fixed-EST day; global and per-user disable controls exercised in PHP HTTP tests |
| Contact groups, DMs and XT Group Chats | server/api/contacts.php, messages.php, group-chats.php, ext/sidepanel/ | Per-user profile JSON contact groups, authenticated direct messages, member-authorized five-character case-sensitive group chats and side-panel dialogue exercised in PHP/static tests |
| Responsive web Post/Nearby/All/Schemas | server/index.php, server/assets/ | Real HTTP + DOM post/error fixtures; geolocation, mobile layout and native accessibility unrun |
| Sparse local events and snapshot upload | ext/core/records.js, core/api.js | Preserved scope; neither remote restore nor replicated event sourcing added |

## Intentional stabilization changes

Server data/media moved outside the document root; use the new launcher/router
and follow upgrade instructions. Mutation requests now require X-XtraType-Client.
Clients that called the old mutation API directly must supply that header and meet input validation. Once the first account is registered, protected API families also require a bearer session. The client header remains an anti-cross-origin write measure; account authorization is a separate layer.

Image uploads accept verified PNG/JPEG/WebP, three files of at most 8 MiB each;
malformed, SVG and other unsupported images are rejected. Oversized full-page
captures fail visibly instead of silently clipping. Primitive schema constraints
outside the documented subset are rejected instead of silently ignored. Invalid
records already on disk are not silently repaired or discarded. Server changes
with existing local annotations/snapshots are blocked until an explicit migration
workflow is designed; use a separate profile for an independent destination.

Existing JavaScript target-key sorting/rounding remains for compatibility. PHP
checks GPS/video quantized key components against the numeric target within half
of the existing precision unit, allowing JavaScript floating-point tie behavior;
it does not regenerate a conflicting PHP-rounded key. This does not eliminate
inherited precision collisions. No new key format or record migration is implied.

Deferred additions remain absent: PortaShape host/plugins, companion XtraType sidecars, Script Studio, Stay D.R.Y., Publisher/connectors, the broader cross-device identity/sync service plane, native mobile, snapshot download, tombstones and full restore/import. The bounded owner-directed account/invitation/messaging layer in 2.5.0 is intentionally narrower than that deferred service plane.
