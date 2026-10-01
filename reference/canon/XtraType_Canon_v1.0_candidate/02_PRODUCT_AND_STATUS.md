# XtraType — Product inventory and current status

**Canon edition:** 1.0 approval candidate · **Baseline:** supplied v2.3 / extension 2.3.0 · **Audit date:** 2026-10-01

## Product model

A user identifies a thing through a typed target, adds a required comment plus optional quote/images, and later sees that context through a relevant surface. Quoted text is stored text; it is **not** a durable text-range selector and is not automatically re-highlighted in the page. There is no source DOM-node identity or annotation-to-snapshot relationship in the current envelope.

The desktop workspace is the Chrome Side Panel. The optional quick bar is a smaller page overlay. The YouTube integration projects annotations into a site-specific player. The responsive PHP web companion provides server-backed posting and GPS discovery. Local capture/history is available in the extension only.

## Capability inventory

| ID | Capability | Current surface / implementation | Status and boundary |
|---|---|---|---|
| CAP-01 | Native workspace launch | Manifest + worker | Toolbar uses native side-panel behavior; context-menu paths use explicit open |
| CAP-02 | Context acquisition | Worker script injection | URL/title/selection/first-video time/dimensions; top frame only |
| CAP-03 | Full annotation composer | Panel | Four target families, quote, body, image files; local-first |
| CAP-04 | URL variants | Panel/web + keys | Query policies; fragment model exceeds authoring UX |
| CAP-05 | GPS targets | Panel/web | Coordinates/radius/label; validation differs between clients |
| CAP-06 | Video/time targets | Panel/web | Bare, point and range; extension understands Shorts, web composer does not |
| CAP-07 | Structured custom targets | Panel/web | Primitive object forms and requiredness, not full JSON Schema |
| CAP-08 | Images | Panel/web/API | Three PNG/JPEG/WebP files, 8 MiB each in normal multipart path |
| CAP-09 | Context Here | Panel | Exact target key plus same-video expansion; at most 50 shown |
| CAP-10 | Quick comments | On-demand overlay | URL or automatic video time; no image/GPS/custom editor |
| CAP-11 | Recent comments | Quick bar | Worker contextual matching; four requested, limit clamped 1–10 |
| CAP-12 | YouTube projection | Automatic content script | Markers/cards/toast; defects in null handling and observer lifecycle |
| CAP-13 | Quick replies | YouTube card + worker | Child record shares parent target; no thread renderer |
| CAP-14 | Visible snapshot | Panel + worker | One screenshot plus separate HTML/text extraction |
| CAP-15 | Full-page snapshot | Panel + worker | Scroll/stitch with caps; not guaranteed full or atomic capture |
| CAP-16 | Timeline | Panel | Local snapshot page-key index, newest-first, no remote restoration |
| CAP-17 | Compare latest two | Panel canvas | Thresholded RGB comparison, no saved comparison record |
| CAP-18 | Schema distribution | Local store + API | Built-ins/local/remote merge, server can exceed renderer capability |
| CAP-19 | Annotation mirroring | Panel/worker/API | Push/pull with full replacement by ID; no conflicts/tombstones |
| CAP-20 | Snapshot archive | Panel/API | Upload only; screenshots not downloaded into another extension |
| CAP-21 | Events | DB + unused remote API | `annotation.created` logged for full/quick create only |
| CAP-22 | Settings | Panel/Chrome local storage | Server base, display name, default GPS gate, auto-sync |
| CAP-23 | Metadata export | Panel | Four metadata collections, no binaries/settings/import |
| CAP-24 | Web Post/All context | Web companion | Online server-first authoring and unpaginated global feed |
| CAP-25 | Nearby | Web companion | Browser-local Haversine filtering over server annotations |
| CAP-26 | Health probe | Settings/API | Availability response; not a storage integrity or auth test |

## Explicitly absent or incomplete

No accounts, permissions, private workspaces, sharing policy, authenticated authors, general search/tags, edit/delete UI, thread navigation, remote snapshot recovery, event synchronization, full backup/import, quotas/retention, background sync scheduler, automatic capture scheduling, text/DOM comparison, deterministic archive replay, script editor, userscript registry, GM API compatibility, automation runner, billing, or multi-browser implementation is supplied.

Annotation and schema DELETE endpoints exist. Record replacement through POST exists. Those API affordances do not constitute implemented end-user editing/deletion workflows. `remove()` is a repository helper with no shipped UI caller.

## History supported by the inputs

| Evidence | What it supports | What it does not establish |
|---|---|---|
| Packaged architecture's “UI priority in v2.2”; CSS v2.2 comments | Side-panel-first layout and polish were associated with the earlier iteration |
| README “What changed”; v2.3 permission notes; manifest | Native toolbar side panel, optional quick bar, revised quote/recent UI, broad host access are declared v2.3 behavior |
| Old “Object Click” terminology | Browser-capability conceptual ancestry beneath XtraType | No separately present Object Click module/service |
| Prior reports and reference | Previous source-review descriptions and reported checks | No repository commit sequence, release dates for older builds, or current runtime proof |
| User statement | The provided iteration works and is the intended foundation | Does not erase code-level bugs or certify every feature |
| User's truncated roadmap | Interest in Tampermonkey-like additions | No complete feature list or named second comparison |

There is no supplied VCS history, license file, CI configuration or deployment manifest. Do not fabricate past milestones, feature completion dates, authorship, licensing grants or committed delivery dates.

## Direction

Stabilize context integrity, storage/sync, adapter lifecycle and capture. Extract common domain contracts. Then add a narrowly specified, permission-aware userscript capability beside the existing annotation model. More ambitious collaboration, schema richness, web offline mode and automation can reuse those contracts after their prerequisites are met; they are roadmap candidates, not promises.
