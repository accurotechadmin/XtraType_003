import test from "node:test";
import assert from "node:assert/strict";
import "fake-indexeddb/auto";
import {
  parseUrlTarget,
  makeGpsTarget,
  makeYoutubeTarget,
  makeTimeTarget,
  targetKey,
  youtubeInfo,
  urlTargetMatchesPage,
} from "../ext/core/anchors.js";
import {
  normalizeCustomSchema,
  validateCustomValue,
  readPrimitiveInput,
} from "../ext/core/schemas.js";
import { all, get, put, atomicPut } from "../ext/core/db.js";
import { createAnnotation } from "../ext/core/records.js";
import {
  mergeRemote,
  pullAnnotations,
  syncAnnotation,
  saveSettings,
} from "../ext/core/api.js";
import { tilePositions } from "../ext/core/capture.js";
let opts = { apiBase: "http://localhost:8787/api", autoSync: false };
globalThis.chrome = {
  storage: {
    local: {
      get: async () => ({ xtratypeSettings: opts }),
      set: async (v) => {
        opts = v.xtratypeSettings;
      },
    },
  },
};
const schema = normalizeCustomSchema({
  $id: "test.anchor@1",
  type: "object",
  required: ["title"],
  additionalProperties: false,
  properties: {
    title: { type: "string", minLength: 2, maxLength: 5 },
    page: { type: "integer", minimum: 1, maximum: 5 },
    active: { type: "boolean" },
    choice: { type: "integer", enum: [1, 2] },
  },
});
test("baseline anchor/schema assertions", async () => {
  await import("./anchors.mjs");
});
test("whole-video remains distinct from zero seconds", () => {
  assert.equal(
    targetKey(makeYoutubeTarget("https://youtube.com/watch?v=abc")),
    "youtube:abc",
  );
  assert.equal(
    targetKey(makeYoutubeTarget("https://youtube.com/watch?v=abc", 0)),
    "youtube:abc@0.000",
  );
});
test("time anchors normalize moments and require complete forward ranges", () => {
  assert.equal(
    targetKey(makeTimeTarget("2026-10-01T08:15:30-04:00")),
    "time:2026-10-01T12:15:30.000Z",
  );
  assert.equal(
    targetKey(
      makeTimeTarget(
        null,
        "2026-10-01T12:00:00Z",
        "2026-10-01T13:30:00Z",
      ),
    ),
    "time:2026-10-01T12:00:00.000Z/2026-10-01T13:30:00.000Z",
  );
  assert.throws(() => makeTimeTarget(null, "2026-10-01T12:00:00Z", ""));
  assert.throws(() =>
    makeTimeTarget(null, "2026-10-01T13:00:00Z", "2026-10-01T12:00:00Z"),
  );
});
test("reject blank GPS and spoofed YouTube host; retain shorts/subdomains", () => {
  assert.throws(() => makeGpsTarget("", 0));
  assert.throws(() => makeGpsTarget(0, null));
  assert.equal(youtubeInfo("https://notyoutube.com/watch?v=x"), null);
  assert.equal(youtubeInfo("https://youtu.be.evil/x"), null);
  assert.equal(youtubeInfo("https://m.youtube.com/shorts/abc").videoId, "abc");
  assert.equal(makeGpsTarget(0, 0).value.latitude, 0);
});
test("all-empty queries match only empty queries, selected duplicates count", () => {
  const t = parseUrlTarget("https://example.com/a");
  t.value.queryMode = "all";
  assert.equal(urlTargetMatchesPage(t, "https://example.com/a?x=1"), false);
  assert.equal(urlTargetMatchesPage(t, "https://example.com/a"), true);
  const d = parseUrlTarget("https://example.com/?x=1&x=1");
  d.value.queryMode = "all";
  assert.equal(urlTargetMatchesPage(d, "https://example.com/?x=1"), false);
});
test("stable key retains baseline fragment/query semantics", () => {
  const t = parseUrlTarget("https://example.com/a?b=2&a=1#part");
  t.value.queryMode = "all";
  t.value.fragmentMode = "include";
  assert.equal(targetKey(t), "url:https://example.com/a?a=1&b=2#part");
});
test("custom types, required, bounds, enum and unsupported semantics", () => {
  assert.equal(
    validateCustomValue(schema, {
      title: "okay",
      page: 2,
      active: false,
      choice: 1,
    }),
    true,
  );
  for (const value of [
    { title: "x" },
    { title: "okay", page: 1.2 },
    { title: "okay", page: 9 },
    { title: "okay", active: "false" },
    { title: "okay", choice: "1" },
    { title: "okay", extra: 1 },
  ])
    assert.throws(() => validateCustomValue(schema, value));
  assert.throws(() =>
    normalizeCustomSchema({ ...schema, "x-xtratype": { kind: "url" } }),
  );
  assert.throws(() => normalizeCustomSchema({ ...schema, allOf: [] }));
  assert.equal(readPrimitiveInput({ value: "1" }, schema.properties.choice), 2);
});
test("tile positions include edges without duplicate last tile", () => {
  assert.deepEqual(tilePositions(2400, 1000), [0, 1000, 1400]);
  assert.deepEqual(tilePositions(900, 1000), [0]);
});
test("protected merge retains dirty local record and reconciles blobs by attachment ID", () => {
  const local = {
    id: "a",
    syncState: "error",
    body: "new",
    attachments: [{ id: "img", blobId: "b" }],
  };
  const remote = {
    id: "a",
    body: "old",
    attachments: [{ id: "img", url: "/media/a.png" }],
  };
  assert.equal(mergeRemote(local, remote, opts.apiBase), local);
  const merged = mergeRemote(
    { ...local, syncState: "synced" },
    remote,
    opts.apiBase,
  );
  assert.equal(merged.attachments[0].blobId, "b");
  assert.equal(merged.attachments[0].serverBase, opts.apiBase);
});
test("atomic annotation includes blobs and event; aborted aggregate leaves no partial record", async () => {
  const file = new File(["test"], "test.png", { type: "image/png" });
  const a = await createAnnotation({
    target: parseUrlTarget("https://example.com"),
    body: "saved",
    files: [file],
    autoSync: false,
  });
  assert.equal((await get("annotations", a.id)).syncState, "local");
  assert.ok((await get("blobs", a.attachments[0].blobId)).blob);
  assert.ok((await all("events")).some((e) => e.data.annotationId === a.id));
  await assert.rejects(
    atomicPut([
      ["annotations", { id: "abort-me" }],
      ["blobs", { blob: "no-id" }],
    ]),
  );
  assert.equal(await get("annotations", "abort-me"), undefined);
});
test("reject empty/oversize replies before local writes", async () => {
  const before = (await all("annotations")).length;
  await assert.rejects(
    createAnnotation({
      target: parseUrlTarget("https://example.com"),
      body: " ",
    }),
  );
  await assert.rejects(
    createAnnotation({
      target: parseUrlTarget("https://example.com"),
      body: "x".repeat(80001),
    }),
  );
  assert.equal((await all("annotations")).length, before);
});
test("pull cannot overwrite pending or error local records", async () => {
  await put("annotations", { id: "dirty", body: "mine", syncState: "pending" });
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        ok: true,
        items: [
          {
            id: "dirty",
            recordType: "Context.Annotation",
            schemaVersion: 2,
            target: {},
            body: "old",
            attachments: [],
          },
        ],
      }),
    );
  await pullAnnotations();
  assert.equal((await get("annotations", "dirty")).body, "mine");
});
test("missing binary rejects sync before fetch and keeps note", async () => {
  const a = {
    id: "missing",
    updatedAt: "today",
    attachments: [{ id: "a", blobId: "gone", name: "lost.png" }],
    syncState: "pending",
  };
  await put("annotations", a);
  let fetched = false;
  globalThis.fetch = async () => {
    fetched = true;
    throw new Error("unexpected");
  };
  await assert.rejects(syncAnnotation(a), /missing/);
  assert.equal(fetched, false);
  const saved = await get("annotations", "missing");
  assert.equal(saved.syncState, "error");
  assert.match(saved.syncError, /missing/);
});
test("image upload preserves attachment ID and local Blob linkage", async () => {
  const a = await createAnnotation({
    target: parseUrlTarget("https://example.com"),
    body: "photo",
    files: [new File(["x"], "x.png", { type: "image/png" })],
  });
  globalThis.fetch = async (_, init) => {
    const wire = JSON.parse(init.body.get("payload"));
    assert.equal(wire.attachments[0].id, a.attachments[0].id);
    return new Response(
      JSON.stringify({
        ok: true,
        item: {
          ...wire,
          attachments: [{ ...wire.attachments[0], url: "/media/test.png" }],
        },
      }),
    );
  };
  const merged = await syncAnnotation(a);
  assert.equal(merged.attachments[0].blobId, a.attachments[0].blobId);
  assert.equal(merged.syncState, "synced");
});
test("server destination change with existing data is blocked", async () => {
  await assert.rejects(
    saveSettings({
      ...opts,
      apiBase: "http://another.test/api",
      defaultGpsRadius: 75,
    }),
    /Server changes/,
  );
});
test("web and extension use identical anchor/schema sources", async () => {
  const { readFile } = await import("node:fs/promises");
  for (const name of ["anchors.js", "schemas.js"])
    assert.equal(
      await readFile(new URL("../ext/core/" + name, import.meta.url), "utf8"),
      await readFile(
        new URL("../server/assets/core/" + name, import.meta.url),
        "utf8",
      ),
    );
});
