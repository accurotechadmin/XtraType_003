# Developer verification

From the package root, install Node.js (tested with 24.19.0), then run:

```sh
npm ci
npm test
```

PHP 8.2+ with fileinfo must be on PATH for HTTP and process-concurrency tests.
`PHP_BIN` can point to another PHP executable. `PHP_FILEINFO_EXTENSION` optionally
selects a standalone fileinfo module and runs PHP with `-n`. `TMPDIR` can select a
writable temporary directory. PHP tests explicitly skip when PHP is absent:
a green run with skips is not equivalent to the recorded full run.

Tests use temporary repositories and loopback ports, never the packaged var/data.
No external service, YouTube account, plugin or publishing destination is used.

- `anchors.mjs`: the original six anchor assertions, also imported by core tests.
- `core.test.mjs`: anchor/schema semantics, fake-IndexedDB atomicity and sync safety.
- `client-dom.test.mjs`: jsdom panel, quick bar, YouTube and web fixtures, plus mocked
  canvas/capture failure cleanup. This does not exercise browser rendering.
- `worker.test.mjs`: mocked Chrome sender/context checks, replies and capture pacing.
- `manifest-ui.test.mjs`: dependency-free checks for the built-in Attach-to/URL markup, Ctrl+Q command, `xt` omnibox declaration, and composer handoff wiring.
- `http.test.mjs`: real PHP HTTP routes, validation, uploads/media, bad requests,
  query/delete behavior and corrupt-file preservation.
- `repository.test.mjs`: 24 independent PHP writer processes using the real JSON
  repository. The single-worker development HTTP server alone cannot prove this.

`node scripts/sync-shared.mjs` refreshes the web copies of anchors/schemas after
editing extension core; tests require byte equality. No build step is needed for
normal use. `docs/VERIFICATION.md` records results and manual release gates.

## XtraType 2.5 working-tree additions

`manifest-ui.test.mjs` statically covers Ctrl+Q, omnibox text handoff, restored URL/Attach-to controls, week-young/Mark-all-old behavior, quick Snapshot defaults and account/messaging UI exports. `http.test.mjs` covers first-admin registration, single-use invitations/daily quota, profile invite history, contact groups, DMs, group-chat ACLs and administrator disable controls.
