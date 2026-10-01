import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { BUILTIN } from "../ext/core/schemas.js";

const root = new URL("../", import.meta.url);

async function text(path) {
  return readFile(new URL(path, root), "utf8");
}

test("extension manifest binds Ctrl+Q to Chrome's native action and exposes xt omnibox keyword", async () => {
  const manifest = JSON.parse(await text("ext/manifest.json"));
  assert.equal(manifest.omnibox?.keyword, "xt");
  for (const platform of ["windows", "linux", "chromeos"])
    assert.equal(manifest.commands?._execute_action?.suggested_key?.[platform], "Ctrl+Q");
  assert.equal(manifest.commands?._execute_action?.suggested_key?.mac, "MacCtrl+Q");
  assert.equal(manifest.commands?.["toggle-xtratype"], undefined);
  assert.equal(manifest.action?.default_title, "Toggle XtraType");
  assert.equal(manifest.action?.default_popup, undefined);
  assert.equal(manifest.side_panel?.default_path, "sidepanel/index.html");
  assert.equal(manifest.minimum_chrome_version, "116");
});

test("service worker leaves Ctrl+Q on Chrome's native action/side-panel toggle path", async () => {
  const worker = await text("ext/service-worker.js");
  assert.match(worker, /setPanelBehavior\?\.\(\{ openPanelOnActionClick: true \}\)/);
  assert.match(worker, /reserved "_execute_action" command/);
  assert.doesNotMatch(worker, /chrome\.commands\?\.onCommand/);
  assert.doesNotMatch(worker, /toggle-xtratype/);
  assert.doesNotMatch(worker, /chrome\.runtime\.getContexts/);
  assert.doesNotMatch(worker, /chrome\.sidePanel\.close/);
});
test("side panel ships built-in Attach to options and URL controls before JS hydration", async () => {
  const html = await text("ext/sidepanel/index.html");
  for (const [id, label] of [
    ["xtratype.anchor.url@1", "URL"],
    ["xtratype.anchor.time@1", "Time"],
    ["xtratype.anchor.youtube@1", "YouTube"],
    ["xtratype.anchor.gps@1", "GPS"],
  ]) {
    assert.match(html, new RegExp(`<option value="${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}">[^<]*${label}`));
  }
  assert.match(html, /id="url-base"/);
  assert.match(html, /<details class="target-options">/);
  assert.match(html, /Query &amp; fragment handling/);
});

test("built-in schema catalog labels the four requested attach handles", () => {
  const labels = new Map(
    BUILTIN.map((schema) => [schema["x-xtratype"]?.kind, schema["x-xtratype"]?.label]),
  );
  assert.equal(labels.get("url"), "URL");
  assert.equal(labels.get("time"), "Time");
  assert.equal(labels.get("youtube"), "YouTube video");
  assert.equal(labels.get("gps"), "GPS");
});

test("omnibox flow opens the panel, transfers typed text, refreshes context and focuses the composer", async () => {
  const worker = await text("ext/service-worker.js");
  const panel = await text("ext/sidepanel/app.js");
  assert.match(worker, /chrome\.omnibox\?\.onInputEntered/);
  assert.match(worker, /chrome\.sidePanel\.open/);
  assert.match(worker, /rememberContext\(tab\)/);
  assert.match(worker, /commentText: String\(commentText \|\| ""\)/);
  assert.match(worker, /commentText: request\.commentText/);
  assert.match(worker, /type: "xtratype:beginAnnotation"/);
  assert.match(panel, /request\.commentText/);
  assert.match(panel, /message\?\.type === "xtratype:beginAnnotation"/);
  assert.match(panel, /refreshContext\(\{ automatic: true, tabId \}\)/);
  assert.match(panel, /\$\("comment"\)\?\.focus\(\)/);
});


test("seven-day age state uses Mark all as old and a green tree marker without read-clearing", async () => {
  const worker = await text("ext/service-worker.js");
  const panel = await text("ext/sidepanel/app.js");
  const html = await text("ext/sidepanel/index.html");
  assert.match(worker, /xtratypeOldAnnotationIds/);
  assert.match(worker, /7 \* 24 \* 60 \* 60 \* 1000/);
  assert.doesNotMatch(worker, /xtratypeSeenAnnotationIds/);
  assert.match(html, /id="mark-all-old"[^>]*>Mark all as old/);
  assert.match(panel, /class="young-tree"/);
  assert.match(panel, /xtratype:markAnnotationsOld/);
  assert.match(panel, /xtratype:markPageOld/);
  assert.match(worker, /markPageAnnotationsOld/);
  assert.match(panel, /type: "xtratype:updateBadge"/);
  assert.doesNotMatch(panel, /markVisibleAnnotationsSeen/);
});

test("header quick snapshot defaults full and can be changed under Capture", async () => {
  const html = await text("ext/sidepanel/index.html");
  const api = await text("ext/core/api.js");
  const panel = await text("ext/sidepanel/app.js");
  const snapshotPos = html.indexOf('id="snapshot-quick"');
  const quickBarPos = html.indexOf('id="launch-quick-bar"');
  assert.ok(snapshotPos >= 0 && snapshotPos < quickBarPos);
  assert.match(html, /id="quick-snapshot-mode"/);
  assert.match(api, /quickSnapshotMode: "full"/);
  assert.match(panel, /takeSnapshot\(mode === "full"\)/);
});

test("account and messaging UI exposes registration, invites, contacts, DMs, group chats and admin controls", async () => {
  const html = await text("ext/sidepanel/index.html");
  const api = await text("ext/core/api.js");
  for (const id of ["register-form", "login-form", "create-invite", "contact-group-form", "dm-form", "group-chat-create", "admin-panel"])
    assert.match(html, new RegExp(`id="${id}"`));
  for (const fn of ["registerAccount", "createInvite", "saveContactGroup", "sendDirectMessage", "createGroupChat", "adminUpdateUser"])
    assert.match(api, new RegExp(`export async function ${fn}`));
});
