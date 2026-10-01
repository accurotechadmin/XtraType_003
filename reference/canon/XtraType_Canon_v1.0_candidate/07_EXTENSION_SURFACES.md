# XtraType — Extension hosts, lifecycle and user interfaces

**Canon edition:** 1.0 approval candidate · **Baseline:** supplied v2.3 / extension 2.3.0 · **Audit date:** 2026-10-01

## Manifest and host contract

Manifest V3, package version 2.3.0, minimum Chrome 116. Permissions: `activeTab`, `scripting`, `storage`, `sidePanel`, `contextMenus`, `tabs`, `geolocation`; required host permissions `<all_urls>`. Background `service-worker.js` is an ES module. Side panel path `sidepanel/index.html`. Action has a title but no popup. The only manifest content script is `content/youtube.js`, at `document_idle`, for `https://www.youtube.com/*`; no all-frames flag. The quick bar is injected on demand, not on every site visit.

There is no userscripts permission, offscreen document, alarm scheduler, declarative network rule set, command shortcut registration, external-message listener, options page, incognito policy override or web-accessible-resource list in the supplied manifest.

## Worker lifecycle

At module evaluation, install and browser startup, worker requests native `openPanelOnActionClick:true`, swallowing setup failures. Installation removes context menus and creates two entries for selection/page/video/link: `xtratype-panel` and `xtratype-quick`. The click handler ignores menu `selectionText`, `linkUrl` and `srcUrl`; it uses the tab's context. Selecting a link's context menu therefore does not target that link specifically.

`activeTab()` queries `{active:true,currentWindow:true}`. `pageScriptability()` rejects known protected schemes and Web Store URLs but is a preflight heuristic, not a complete permissions oracle. `tabContext()` injects into top frame and reads selection (trimmed, 10,000 code units), first video time, viewport/scroll/DPR and document/body maximum scroll dimensions. `rememberContext()` stores successful capture or metadata-only fallback. `openPanelForTab()` remembers context before setOptions/open; asynchronous work can interact with user-gesture requirements and needs Chrome verification. Toolbar native opening bypasses that helper; the panel requests context on its own initialization.

The worker uses async `onMessage` handling with `return true`; errors become `{ok:false,error:e.message}`. It has no message schema validation, per-operation caller allowlist, document-generation check or synchronization mutex. Existing content scripts have extension privileges through this private message bus; ordinary web pages do not get direct runtime access merely because the listener exists.

## Side Panel

Initialization is `loadSettingsForm()` then `refreshContext()`. Module state: `context`, schema array, selected unsaved files and one selected-snapshot URL. It does not subscribe to tab activation/navigation or storage changes. It refreshes on initialization/manual controls, not automatically on every browser context change.

| UI module/control | Behavior and state effect |
|---|---|
| Sticky header / quick icon | Inject optional bar into current active tab |
| Refresh context | Read session/live context; update strip; reload schemas/form/feed/timeline |
| Context strip | Title and URL or access reason; green/red dot; no expiring context indicator |
| Target selector | Rebuild target controls and feed; may discard unsaved target fields |
| Highlighted text | Prefilled only if newly captured text nonempty; old quote retained otherwise |
| Comment | Required textarea, maxLength 20,000 |
| Image picker | Replace selected file list after validation; individual preview removal |
| Post | Local-first aggregate sequence followed by optional upload; not disabled during save |
| Clear | Clears comment, quote and selected file state; not target settings or native file input value |
| Context Here | Open details section; up to 50 records; no page count/search/thread/edit/delete |
| Sync now | Best-effort annotation/schema/snapshot pushes followed by annotation/schema pulls |
| Capture | Visible/full controls and latest preview; no cancel/progress lock |
| Timeline & compare | All local page captures and newest-two pixel diff |
| Anchor schemas | File import and resolved schema list; no delete/migration UI |
| Settings | API base/name/GPS default/auto-sync, health probe, metadata export |

Refresh can preserve a body/quote while replacing target fields, creating an unintended target association. Nonempty quotes remain after posting. If current URL parsing fails, the URL form falls back to `https://example.com/`; access messaging does not disable posting. Selecting GPS creates blank coordinates which the constructor turns into zero. `sync-pill` is a static local-first label, not dynamically updated status.

Save is not one IDB transaction. Blob writes precede annotation write, which precedes event write. If event logging fails after annotation commit, the user sees an error even though the note exists. With no submit lock, retry can create another ID. Same pattern affects quick creation. Image preview/feed/timeline object URLs are mostly not revoked; only selected large preview replacement and export URL have targeted revocation.

Panel styling uses a 300 px minimum width, sticky header, CSS variables, collapsible native details, wrapping text, small controls, responsive adjustments around 340/360 px and dark primary accent. Styling is separate from web and quick bar CSS. No formal shared token package exists. Some accessible labels/focus indicators/live regions exist; image alt text, generated error associations and keyboard-accessible snapshot rows require review.

## Quick bar

`page-ui.js` is a self-contained IIFE. It captures selection before injection, creates fixed `#xtratype-host` with open Shadow DOM, and appends to documentElement. Existing host: update quote dataset/text, hide if empty, focus textarea, return. It does not verify host ownership beyond ID nor refresh all context fields/recent data on this early-return path.

The dialog-like shell contains context label, comment, Post, Full panel, Close, quote, status and Recent comments. Desktop width up to 860 px; top offset 12 px; viewport-constrained scroll height; 680/440 px responsive layouts. Full quote is stored in `dataset.fullText` while visual text is clamped. That shared DOM is visible to the host page. The overlay is not a private editor against the site it inhabits.

Post trims and requires body, disables Post while awaiting worker response, obtains current URL/title/video time at submit, sends captured quote, and then clears body/refreshes recent/focuses. Other controls remain available. Worker success may represent local-only save with sync error; the bar's generic success text does not distinguish it. Ctrl/Cmd+Enter posts; Escape closes only via the textarea key handler. Full panel disables its button and only re-enables on failure. Close removes host. Recent cards use safe text nodes and show author, target/time suffix, relative age, clamped body and quote; no images/replies.

## YouTube adapter

State: annotations, lastVideoId, lastSecond, marker host, card, toast. Extract `v` or `/shorts/`. `refresh()` asks worker for annotations then sets state and renders. A 700 ms interval detects video changes and integer second changes. An unfiltered subtree childList MutationObserver refreshes on ID change or renders otherwise. An internal `xtratype:refresh` message does the same.

`ensureUi()` requires `.ytp-progress-bar-container,.ytp-progress-bar`, changes its positioning to relative, adds marker overlay and toast under `#movie_player` or body. `render()` requires video duration, removes all markers and recreates them. Start/end are coerced with `Number`; null becomes zero. Position is clamped to 0–100%; width at least 0.45% and min-width 4 px. No click-to-seek is implemented.

Hover replaces prior card; click creates persistent interactive card. Card body is escaped. Noninteractive mouseleave removes it. Interactive card lacks close/outside-click/Escape handling. Position formula can produce negative left coordinates on narrow viewports. Reply checks nonempty input, sends quickReply, then unconditionally labels Saved without checking response `.ok`. Open sends panel-open message.

Toast triggers only when observed integer currentTime equals floor(start), lasts 4.5 seconds, and later matching annotations replace earlier toast content. Skipping that second can miss it; seeking back can repeat it. Range code has no continuous-range overlay. If progress UI is unavailable, the timer can attempt to use an uncreated toast. No cancellation/deduplication of concurrent refresh requests, no generation check against stale responses, no complete cleanup when leaving a video, no resource dispose lifecycle.

**High-impact risk:** observer sees its own `replaceChildren`/append changes. With markers, each render schedules more observed changes, which can create sustained render churn or starvation. Severity is based on source causality; this audit did not run a real YouTube session. The required fix is owned-subtree exclusion plus idempotent rendering and controlled refresh, not merely a longer polling interval.
