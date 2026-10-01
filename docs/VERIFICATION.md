# Verification — XtraType 2.5.0 working tree

## Executed for this release

Environment: Linux x86-64, Node 24.19.0, npm 11.9.0, PHP 8.3.6 with fileinfo.
Dev dependencies are pinned in package-lock.json. No runtime npm dependencies.

`npm test`: **32 tests passed, 0 failed, 0 skipped**. This count includes nested
HTTP cases and the baseline anchor assertion wrapper. Output is preserved in
`evidence/test-results.txt`; it must not be confused with the older canon audit.

Real PHP HTTP tests cover all existing API families, typed target writes, URL
query/fragment identity, JavaScript/PHP rounding boundaries, invalid records,
reserved schemas, malformed requests, origin/header/host protection, valid image
upload and retry, private raw-data paths, snapshot writes, events/deletion and
corrupt collection preservation. A separate test runs 24 independent PHP writer
processes and verifies every committed row survives.

Client tests use jsdom, fake-indexeddb and mocked Chrome APIs/canvas. They cover
atomic rollback, dirty record merge protection, local image references, refusal
to sync missing binaries, stable attachment IDs, disabled automatic sync, server
switch guards, draft/error handling, typed scalar forms, null-vs-zero YouTube
markers, projection cleanup, caller authority, pinned captures and failure-time
scroll/bitmap cleanup. Mocks prove these code paths, not Chrome's actual behavior.

JavaScript syntax, PHP lint, JSON parse and packaged reference/contract inventory
results are in `evidence/static-checks.json`. Release checksums cover all shipped
files except the checksum file itself. The ZIP has no node_modules, PHP/Chromium
binaries, test data or owner profile data.

## Working-tree feature patch note — 2026-10-01

The current 2.5.0 working tree adds live side-panel context changes, the Time anchor, restored/static-safe URL and Attach-to controls, reorganized URL query/fragment controls, persistent seven-day **week-young** badge/tree state with explicit **Mark all as old**, reorderable author/Annotations sections, `Ctrl+Q`, omnibox text-to-comment handoff, a header quick Snapshot control, and a bounded invitation-based account/messaging layer with contact groups, direct messages and member-authorized XT Group Chats.

For this working tree, the dependency-free anchor/manifest-UI suite, real PHP HTTP account/API suite, and independent repository concurrency suite were executed successfully: **17 selected Node-reported tests passed, 0 failed**. JavaScript syntax checks, PHP lint, JSON parsing, shared-core parity and repository checksum verification are also part of the packaging pass.

The full `npm test` suite depends on pinned `jsdom` and `fake-indexeddb`; those dev dependencies are not available in this execution environment, so that full suite is not claimed as freshly rerun. The preserved **32 passed** result above remains historical 2.4 release evidence. Native Chrome, real YouTube, public-network hardening and multi-user security acceptance remain explicit owner-side gates.

## Native browser limitation and release gates

Chromium 141 was obtained for acceptance testing but terminated with SIGTRAP
before opening a page in this execution environment. No native extension load,
Chrome screenshot, visual comparison or real YouTube acceptance is claimed.

Before treating this candidate as release-ready, complete these checks on the
owner's intended Chrome/OS combination and a copy of the existing profile/data:

1. Back up and upgrade with the same extension identity. Confirm old annotations,
   custom schemas, media and timeline records remain readable; restore a backup.
2. Exercise native panel/context menus/quick bar on normal and protected pages,
   slow navigation, changed selections, tab switches and extension worker restart.
3. Save text and all supported image types online/offline; restart Chrome offline,
   verify local images, reconnect and sync. Test a lost response and server error.
4. On YouTube, test watch/shorts SPA transitions, player replacement, seek/pause,
   whole-video/time-zero notes, overlapping notices and keyboard reply/dismissal.
5. Capture viewport/full pages at varied zoom/DPR and page dimensions. Navigate,
   scroll or switch active tabs mid-capture; verify refusal, cleanup/restoration,
   timeline images, large-image upload handling and equal-size pixel comparison.
6. Inspect web/panel layout at narrow widths, keyboard focus, screen reader output,
   contrast and geolocation permission denial. Confirm unsuccessful posts retain
   text and successful posts clear the native image selection.
7. Run Windows/macOS launchers and data-file replacement behavior on their local
   filesystems. Apache configuration is supplied but not acceptance-tested.

No zero-regression guarantee or public multiuser production certification is
made. Remaining scope gaps and partial mitigations are listed under all 45 canon
IDs in CONCERN_DISPOSITION.md. These are engineering dispositions for this build,
not changes to canon approval or evidence classifications.

## Historical evidence kept separate

The canon audit reported supplied Node anchors, nine JS syntax checks, nine JSON
parses and eleven characterization checks; some deliberately characterize bugs.
Its PHP/HTTP and live Chrome/YouTube/UI gates were unrun. This release's tests are
new evidence; companion structural/workbook checks and its 52 Not run acceptance
cases do not certify any runtime implementation here.


## v.003 side-panel toggle corrective patch — 2026-10-01

v.003 binds Ctrl+Q to the reserved `_execute_action` command, matching the supplied working demo, while retaining Chrome's native `openPanelOnActionClick` side-panel behavior. The superseded manual `toggle-xtratype` command, `SIDE_PANEL` context detection, and keyboard-specific `chrome.sidePanel.close()` path were removed. The manifest/UI regression test asserts the native action wiring and absence of that orphan branch.

For the corrected native-action repair, the dependency-free/available test set was run again: **17 tests passed, 0 failed** across `manifest-ui.test.mjs`, `http.test.mjs`, and `repository.test.mjs`. JavaScript syntax checks, PHP lint, JSON parsing, and shared-core parity also passed. The full `npm test` command could not be completed because the supplied ZIP did not include installed `jsdom` / `fake-indexeddb` dev dependencies and the attempted locked dependency install did not complete in this environment.

Native Chrome acceptance remains required because browser shortcut assignment and side-panel behavior cannot be certified by static tests. After reloading the unpacked extension, verify Ctrl+Q at `chrome://extensions/shortcuts` and test Ctrl+Q plus the toolbar button on a normal page. The shortcut path no longer requires Chrome 141; the manifest minimum is 116.
