# XtraType — Capture, history and visual comparison

**Canon edition:** 1.0 approval candidate · **Baseline:** supplied v2.3 / extension 2.3.0 · **Audit date:** 2026-10-01

## Current observation model

A snapshot is screenshot pixels plus independently collected rendered HTML/text and initial browser context. These components are sampled at different times; they are not a transactionally consistent page state. The server cannot capture the user's active browser DOM. Capture is a browser-host operation orchestrated in the panel and persisted through PortaShape transport only afterward.

Visible mode queries active tab, asks worker for active context, captures that window's currently active tab, extracts from the previously selected tab ID and persists. Only screenshot response `.ok` is explicitly checked before extraction use; extraction failure can become empty HTML/text. Full mode reads context dimensions without robust fallback validation. Tab switching/navigation can mix pixels from one page with metadata/extraction from another.

## Full-page algorithm

Let `dpr=max(1,Number(viewport.devicePixelRatio||1))`. Logical caps are `maxW=min(page.width,floor(14000/dpr))` and `maxH=min(page.height,floor(28000/dpr))`. For each dimension, offsets progress by viewport size up to the final edge `max(0,dimension-view)`, include that last position and deduplicate. More than 30 Cartesian tiles throws before capture.

For each y then x: inject scrollTo → wait 140 ms → capture visible window PNG → decode ImageBitmap → compute scale `bitmap.width/viewport.width` → retain tile. After successful capture loop, scroll to original offset, allocate canvas `round(maxW*scale) × round(maxH*scale)`, draw all tiles at scaled offsets, encode PNG, extract HTML/text and persist.

This does not reject every page larger than the dimension caps. It can silently clip them while still labeling mode full-page and recording the original page dimensions. There is no clipped flag, actual screenshot coverage rectangle, verified achieved scroll offset or page-stability token. Overlapping final tiles are drawn with later tiles overwriting earlier pixels. Smooth scrolling, scroll snapping, dynamic height and sticky elements can make requested offsets differ from captured positions.

## Limits and units

| Limit | Exact current value | Meaning |
|---|---|---|
| Selection | 10,000 | JavaScript string slice length after trim |
| Extracted HTML | 5,000,000 | outerHTML string slice length; no truncation flag |
| Extracted text | 2,000,000 | body.innerText string slice length; no truncation flag |
| Full logical width | floor(14,000 / clamped DPR) | Actual canvas uses measured scale, not guaranteed same as DPR |
| Full logical height | floor(28,000 / clamped DPR) | Same |
| Tiles | 30 max | Grid cap only, not a memory budget |
| Settle delay | 140 ms per tile | Fixed delay; no loaded/stable-state observation |
| Remote screenshot size | 8 MiB | Inherited generic upload helper, not local capture cap |
| Compare canvas | min(image widths,1800) × min(image heights,12000) | Full images rescaled to common independent dimensions |

Chrome documents at most two `captureVisibleTab` calls per second. A fixed 140 ms wait plus variable capture/decode time does not guarantee adherence. This is a source-grounded rate-limit risk, not a claim that every full-page attempt fails. The documented API captures the currently active tab of a window, which explains the identity race. [Official tabs API](https://developer.chrome.com/docs/extensions/reference/api/tabs), consulted 2026-10-01.

## Failure and resource behavior

No `try/finally` guarantees original scroll restoration if a tile fails. Message scroll errors are not checked; browser clamping is not measured. ImageBitmaps are retained and not explicitly closed. `canvas.toBlob` null and memory allocation errors have no special handling. No cancel button, per-tab capture mutex or disabled capture controls prevent concurrent jobs. A nominal 14,000×28,000 RGBA canvas alone is approximately 1.57 GB decimal, before tiles/PNG/other copies, if those dimensions are reached; the tile cap may reduce practical cases but does not establish a safe byte budget.

`persistSnapshot` writes screenshot Blob before validating HTTP(S) page key; bad page targets can leave orphan bytes. Capture time is assigned at persistence, not start. Snapshot mode says visible/full-page, not fidelity. Extraction uses current document outerHTML and body innerText, excluding a complete resource archive and shadow/cross-origin-frame internals. It does not preserve JS heap, cookies, network resources, canvas replay state or deterministic execution. Captured DOM can include XtraType's light-DOM adapter UI; quick bar's open shadow contents are not serialized in ordinary outerHTML, though pixels can include overlays.

## History and preview

Timeline derives default URL key from panel `context.pageUrl`, ignoring all query/fragment values, queries local snapshot pageKey index, sorts capturedAt descending strings and generates thumbnail object URLs. The newest is shown initially; clicking row shows selected image/title/time. Snapshot server descriptors are not a fallback image source in this view. No baseline pinning, deletion, retention, tags, search, lazy loading, remote hydration or history pagination exists.

## Exact comparison algorithm

Newest image `ia`, older image `ib`. Width is min(ia.width,ib.width,1800); height min(ia.height,ib.height,12000). Each entire image is independently resized to that same rectangle. This can distort aspect ratios and hide dimensional differences; it is not a simple common-area crop.

For each pixel, `d=abs(Rnew-Rold)+abs(Gnew-Gold)+abs(Bnew-Bold)`. Changed iff `d>60` (not ≥). Changed output RGBA `(230,40,60,210)`. Unchanged RGB is newer color×0.45 with alpha 180. Source alpha is ignored. Score is changedCount/(width×height)×100, formatted to two decimals. Result is drawn in UI only; no record, threshold configuration or pass/fail policy.

The score means a fraction of resampled RGB pixels crossed a threshold. It does not mean semantic content percentage or a regression verdict. Comparison may mix visible and full-page modes or captures with different viewport/page state.

## Proposed capture contract

CAPTURE-01 pin tab/window/document and abort on changes. CAPTURE-02 validate every worker response; allow explicit partial extraction only with quality flags. CAPTURE-03 throttle centrally, restore scroll in finally, close bitmaps/revoke URLs and handle cancellation. CAPTURE-04 compute byte/canvas budget before capture; label clipped coverage and extraction truncation. CAPTURE-05 retain start/end times, actual offsets, dimensions, algorithm version and fidelity warnings in a migrated snapshot contract. CAPTURE-06 compare only explicitly compatible captures or warn; report dimensions separately and preserve aspect ratio under a documented algorithm version.

Do not silently reinterpret old scores under a new algorithm or claim older snapshots have fidelity metadata that was never captured.
