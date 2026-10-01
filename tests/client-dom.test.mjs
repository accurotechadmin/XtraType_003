import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import "fake-indexeddb/auto";
import * as db from "../ext/core/db.js";
import * as anchors from "../ext/core/anchors.js";
import * as schemas from "../ext/core/schemas.js";
import * as api from "../ext/core/api.js";
import * as records from "../ext/core/records.js";
import * as capture from "../ext/core/capture.js";
const wait = async (fn) => {
  for (let i = 0; i < 100; i++) {
    if (fn()) return;
    await new Promise((r) => setTimeout(r, 10));
  }
  throw new Error("DOM condition timed out.");
};
async function bootPanel() {
  const html = await readFile(
    new URL("../ext/sidepanel/index.html", import.meta.url),
    "utf8",
  );
  const dom = new JSDOM(html, {
    url: "https://extension.test/sidepanel/index.html",
    runScripts: "outside-only",
  });
  const w = dom.window;
  Object.assign(w, db, anchors, schemas, api, records, capture, {
    TextEncoder,
    Blob,
    File,
  });
  w.URL.createObjectURL = () => "blob:https://extension.test/test";
  w.URL.revokeObjectURL = () => {};
  w.confirm = () => true;
  let ctx = {
    tabId: 1,
    documentId: "doc1",
    pageUrl: "https://example.com/a",
    title: "Fixture",
    highlightedText: "Quote",
    currentVideoTime: null,
    viewport: {
      width: 800,
      height: 600,
      scrollX: 0,
      scrollY: 0,
      devicePixelRatio: 1,
    },
    page: { width: 800, height: 1200 },
  };
  let options = {
    apiBase: "http://localhost:8787/api",
    autoSync: false,
    author: "Fixture user",
    defaultGpsRadius: 75,
  };
  let network = 0, runtimeListener = null;
  const chrome = {
    storage: {
      session: { get: async () => ({}) },
      local: {
        get: async () => ({ xtratypeSettings: options }),
        set: async (v) => {
          options = v.xtratypeSettings;
        },
      },
    },
    runtime: {
      id: "test-extension",
      onMessage: { addListener: (fn) => (runtimeListener = fn) },
      sendMessage: async (m) =>
        m.type === "xtratype:getContext"
          ? { ok: true, context: ctx, tabId: ctx.tabId, windowId: 1 }
          : { ok: true },
    },
    tabs: {
      query: async () => [{ id: 1, url: ctx.pageUrl }],
      sendMessage: async () => ({}),
    },
  };
  globalThis.chrome = w.chrome = chrome;
  globalThis.fetch = w.fetch = async () => {
    network++;
    throw new Error("No network expected.");
  };
  const source = (
    await readFile(new URL("../ext/sidepanel/app.js", import.meta.url), "utf8")
  ).replace(/^import[\s\S]*?from\s+['"][^'"]+['"];\s*/gm, "");
  await w.eval(`(async()=>{${source}\n})()`);
  return {
    dom,
    w,
    $: (id) => w.document.getElementById(id),
    setContext: (c) => (ctx = { ...ctx, ...c }),
    contextChanged: () =>
      runtimeListener?.(
        { type: "xtratype:contextChanged", windowId: 1 },
        { id: "test-extension" },
      ),
    network: () => network,
  };
}
test("sidepanel DOM: initialization, offline save, draft cleanup, invalid target and stale context", async () => {
  const h = await bootPanel();
  try {
    assert.equal(h.$("url-base").value, "https://example.com/a");
    assert.equal(h.$("highlighted-text").value, "Quote");
    assert.ok(h.$("url-base").parentElement.nextElementSibling.matches("details.target-options"));
    h.setContext({ pageUrl: "https://example.com/auto", title: "Auto" });
    h.contextChanged();
    await wait(() => h.$("url-base").value === "https://example.com/auto");
    assert.equal(h.$("context-title").textContent, "Auto");
    assert.equal(h.network(), 0);
    h.$("comment").value = "DOM fixture save";
    h.$("composer").dispatchEvent(
      new h.w.Event("submit", { cancelable: true }),
    );
    await wait(() => h.$("composer-status").textContent === "Saved locally.");
    assert.equal(h.$("comment").value, "");
    assert.equal(h.$("highlighted-text").value, "");
    assert.ok(
      (await db.all("annotations")).some((a) => a.body === "DOM fixture save"),
    );
    assert.equal(h.network(), 0);
    h.$("comment").value = "keep stale draft";
    h.setContext({ pageUrl: "https://example.com/changed" });
    h.$("composer").dispatchEvent(
      new h.w.Event("submit", { cancelable: true }),
    );
    await wait(() =>
      h.$("composer-status").textContent.includes("Page changed"),
    );
    assert.equal(h.$("comment").value, "keep stale draft");
    h.$("url-base").value = "";
    h.$("url-base").dispatchEvent(new h.w.Event("input", { bubbles: true }));
    await wait(() =>
      h.$("annotation-list").textContent.includes("valid target"),
    );
  } finally {
    h.dom.window.close();
  }
});
test("quick bar retains input on failure and reports local-only sync error truthfully", async () => {
  const dom = new JSDOM("<html><body><p>Fixture</p></body></html>", {
    url: "https://example.com/a",
    runScripts: "outside-only",
  });
  const w = dom.window;
  let fail = true;
  w.chrome = {
    runtime: {
      sendMessage: async (m) =>
        m.type === "xtratype:getRecentContextAnnotations"
          ? { ok: true, items: [] }
          : fail
            ? { ok: false, error: "Storage unavailable" }
            : { ok: true, item: { syncState: "error" } },
    },
  };
  w.eval(
    await readFile(
      new URL("../ext/content/page-ui.js", import.meta.url),
      "utf8",
    ),
  );
  const root = w.document.querySelector("#xtratype-host").shadowRoot,
    textarea = root.querySelector("textarea");
  textarea.value = "keep me";
  root.querySelector(".post").click();
  await wait(
    () => root.querySelector(".status").textContent === "Storage unavailable",
  );
  assert.equal(textarea.value, "keep me");
  fail = false;
  root.querySelector(".post").click();
  await wait(() =>
    root.querySelector(".status").textContent.includes("Saved locally"),
  );
  assert.equal(textarea.value, "");
  dom.window.close();
});
test("YouTube fixture: null time excluded, zero marker retained, bounded rerender and reply failure", async () => {
  const dom = new JSDOM(
    '<html><body><div id="movie_player"><video></video><div class="ytp-progress-bar-container"></div></div></body></html>',
    {
      url: "https://www.youtube.com/watch?v=fixture",
      runScripts: "outside-only",
    },
  );
  const w = dom.window;
  const v = w.document.querySelector("video");
  Object.defineProperty(v, "duration", { value: 100 });
  v.currentTime = 0;
  let tick,
    query = 0;
  w.setInterval = (fn) => {
    tick = fn;
    return 1;
  };
  w.clearInterval = () => {};
  const item = (id, start) => ({
    id,
    body: id,
    updatedAt: "now",
    target: {
      kind: "youtube",
      value: { videoId: "fixture", startSeconds: start, endSeconds: null },
    },
  });
  w.chrome = {
    runtime: {
      onMessage: { addListener() {}, removeListener() {} },
      sendMessage: async (m) => {
        if (m.type === "xtratype:getYouTubeAnnotations") {
          query++;
          return { ok: true, items: [item("whole", null), item("zero", 0)] };
        }
        return { ok: false, error: "Reply rejected" };
      },
    },
  };
  w.eval(
    await readFile(
      new URL("../ext/content/youtube.js", import.meta.url),
      "utf8",
    ),
  );
  await wait(
    () =>
      w.document.querySelectorAll(".xt-youtube-markers button").length === 1,
  );
  const marker = w.document.querySelector(".xt-youtube-markers button");
  assert.match(marker.getAttribute("aria-label"), /0:00/);
  for (let i = 0; i < 20; i++) tick();
  assert.equal(query, 1);
  assert.equal(w.document.querySelector(".xt-youtube-markers button"), marker);
  marker.click();
  const card = w.document.querySelector("[role=dialog]"),
    input = card.querySelector("textarea");
  input.value = "keep reply";
  [...card.querySelectorAll("button")]
    .find((b) => b.textContent === "Reply")
    .click();
  await wait(() => card.textContent.includes("Reply rejected"));
  assert.equal(input.value, "keep reply");
  w.document.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape" }));
  assert.equal(w.document.querySelector("[role=dialog]"), null);
  w.dispatchEvent(new w.Event("pagehide"));
  assert.equal(w.document.querySelector(".xt-youtube-markers"), null);
  dom.window.close();
});
test("capture failure restores scroll and closes decoded tiles", async () => {
  const c = {
    documentId: "doc",
    pageUrl: "https://example.com",
    viewport: {
      width: 100,
      height: 100,
      scrollX: 5,
      scrollY: 9,
      devicePixelRatio: 1,
    },
    page: { width: 100, height: 200 },
  };
  let shots = 0,
    closed = 0,
    restored = false;
  globalThis.chrome = {
    tabs: { query: async () => [{ id: 1, windowId: 2 }] },
    runtime: {
      sendMessage: async (m) => {
        if (m.type === "xtratype:getContext")
          return { ok: true, tabId: 1, context: c };
        if (m.type === "xtratype:scrollTo") {
          if (m.x === 5 && m.y === 9) restored = true;
          return { ok: true, x: m.x, y: m.y };
        }
        if (m.type === "xtratype:captureVisible") {
          shots++;
          return shots === 1
            ? { ok: true, dataUrl: "data:image/png;base64,eA==" }
            : { ok: false, error: "tab changed" };
        }
        return { ok: true };
      },
    },
  };
  globalThis.document = {
    createElement: () => ({
      width: 0,
      height: 0,
      getContext: () => ({ drawImage() {} }),
    }),
  };
  globalThis.createImageBitmap = async () => ({
    width: 100,
    height: 100,
    close() {
      closed++;
    },
  });
  await assert.rejects(capture.capturePage(true), /tab changed/);
  assert.equal(restored, true);
  assert.equal(closed, 1);
});

test('web DOM: existing surfaces, typed custom enum, GPS blank rejection, escaped feed, retained failed draft',async()=>{
 const html=(await readFile(new URL('../server/index.php',import.meta.url),'utf8')).replace(/<\?(?:php|=)[\s\S]*?\?>/g,'');
 const dom=new JSDOM(html,{url:'http://localhost:8787/',runScripts:'outside-only'});const w=dom.window;Object.assign(w,anchors,schemas,{TextEncoder});w.URL.createObjectURL=()=> 'blob:http://localhost/mock';w.URL.revokeObjectURL=()=>{};
 const custom=schemas.normalizeCustomSchema({$id:'test.web@1',type:'object',required:['flag'],properties:{flag:{type:'boolean',enum:[false,true]}}});let posted,failPost=false;
 const catalog=[...schemas.BUILTIN,custom];const notes=[{id:'x',author:'test',body:'<script>evil()</script>',target:anchors.parseUrlTarget('https://example.com'),createdAt:new Date().toISOString(),attachments:[]}];
 w.fetch=async(path,options)=>{
  if(path.endsWith('schemas.php'))return {ok:true,json:async()=>({ok:true,items:catalog})};
  if(options.method==='POST'){posted=JSON.parse(options.body.get('payload'));return {ok:!failPost,status:failPost?500:201,json:async()=>failPost?{ok:false,message:'Write failed'}:{ok:true,item:posted}};}
  return {ok:true,json:async()=>({ok:true,items:notes})};
 };
 const source=(await readFile(new URL('../server/assets/app.js',import.meta.url),'utf8')).replace(/^import[\s\S]*?from\s+['"][^'"]+['"];\s*/gm,'');await w.eval(`(async()=>{${source}\n})()`);
 const $=id=>w.document.getElementById(id);assert.equal($('target-kind').options.length,5);assert.equal($('feed').querySelector('script'),null);assert.ok($('feed').textContent.includes('<script>'));
 $('target-kind').value='xtratype.anchor.gps@1';$('target-kind').dispatchEvent(new w.Event('change'));$('body').value='gps';$('post-form').dispatchEvent(new w.Event('submit',{cancelable:true}));await wait(()=>$('post-status').textContent.includes('coordinates are required'));
 $('target-kind').value='xtratype.anchor.time@1';$('target-kind').dispatchEvent(new w.Event('change'));$('body').value='time';$('post-form').dispatchEvent(new w.Event('submit',{cancelable:true}));await wait(()=>$('post-status').textContent==='Posted.');assert.equal(posted.target.kind,'time');
 $('target-kind').value='test.web@1';$('target-kind').dispatchEvent(new w.Event('change'));$('body').value='typed';$('post-form').dispatchEvent(new w.Event('submit',{cancelable:true}));await wait(()=>$('post-status').textContent==='Posted.');assert.equal(posted.target.value.flag,false);assert.equal($('body').value,'');
 failPost=true;$('body').value='retain this';$('post-form').dispatchEvent(new w.Event('submit',{cancelable:true}));await wait(()=>$('post-status').textContent==='Write failed');assert.equal($('body').value,'retain this');dom.window.close();
});
