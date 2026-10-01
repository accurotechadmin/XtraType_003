import { createAnnotation, validateTarget } from "../core/records.js";
import { capturePage } from "../core/capture.js";
import {
  all,
  byIndex,
  get,
  put,
  remove,
  addBlob,
  id,
  logEvent,
  atomicPut,
} from "../core/db.js";
import {
  BUILTIN,
  normalizeCustomSchema,
  validateCustomValue,
  readPrimitiveInput,
} from "../core/schemas.js";
import {
  parseUrlTarget,
  makeGpsTarget,
  makeYoutubeTarget,
  makeTimeTarget,
  targetKey,
  youtubeInfo,
  gpsMatches,
} from "../core/anchors.js";
import {
  settings,
  saveSettings,
  syncAnnotation,
  pullAnnotations,
  pullSchemas,
  pushSchema,
  syncSnapshot,
  serverHealth,
  accountStatus,
  registerAccount,
  loginAccount,
  logoutAccount,
  listInvites,
  createInvite,
  adminState,
  adminSetInvitesEnabled,
  adminSetSystemEnabled,
  adminUpdateUser,
  listContactGroups,
  saveContactGroup,
  deleteContactGroup,
  directMessages,
  sendDirectMessage,
  listGroupChats,
  getGroupChat,
  createGroupChat,
  grantGroupChat,
  sendGroupChatMessage,
} from "../core/api.js";

const $ = (id) => document.getElementById(id);
let context = null,
  schemas = [...BUILTIN],
  selectedFiles = [],
  selectedSnapshotUrl = null;
const enc = new TextEncoder();
let dirty = false,
  saving = false,
  captureBusy = false,
  feedGeneration = 0,
  contextRefreshTimer = null,
  currentFeedAnnotationIds = [],
  accountStateCache = null;
const objectUrls = { feed: [], preview: [], snapshot: [] };
function revoke(group) {
  for (const url of objectUrls[group]) URL.revokeObjectURL(url);
  objectUrls[group] = [];
}
function objectUrl(group, blob) {
  const url = URL.createObjectURL(blob);
  objectUrls[group].push(url);
  return url;
}
window.addEventListener("pagehide", () => {
  Object.keys(objectUrls).forEach(revoke);
  if (selectedSnapshotUrl) URL.revokeObjectURL(selectedSnapshotUrl);
});

function setStatus(el, message, error = false) {
  el.textContent = message || "";
  el.classList.toggle("error", error);
}
function safe(s) {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
function formatTime(sec) {
  if (sec == null || !Number.isFinite(Number(sec))) return "";
  const n = Math.floor(Number(sec));
  return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;
}
function localDateTimeValue(value = new Date()) {
  const d = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function timeTargetLabel(target) {
  const v = target?.value || {};
  if (target?.kind !== "time") return "";
  if (v.timestamp) return ` · ${new Date(v.timestamp).toLocaleString()}`;
  if (v.startTime && v.endTime)
    return ` · ${new Date(v.startTime).toLocaleString()} – ${new Date(v.endTime).toLocaleString()}`;
  return "";
}
function schemaLabel(s) {
  return s["x-xtratype"]?.label || s.title || s.$id;
}
function schemaKind(s) {
  return s["x-xtratype"]?.kind || "custom";
}

async function loadSchemas(force = false) {
  const locals = await all("schemas"),
    map = new Map(BUILTIN.map((s) => [s.$id, s]));
  for (const r of locals) {
    try {
      const sc = normalizeCustomSchema(r.schema || r);
      map.set(sc.$id, sc);
    } catch {}
  }
  if (force || (await settings()).autoSync)
    try {
      for (const sc of await pullSchemas()) {
        if (sc.$id?.startsWith("xtratype.anchor.")) continue;
        try {
          const normalized = normalizeCustomSchema(sc);
          map.set(sc.$id, normalized);
          await put("schemas", { id: sc.$id, schema: normalized });
        } catch {}
      }
    } catch {}
  schemas = [...map.values()];
  const select = $("target-kind"),
    prior = select.dataset.hydrated === "true" ? select.value : "";
  select.replaceChildren(
    ...schemas.map((sc) => {
      const o = document.createElement("option");
      o.value = sc.$id;
      o.textContent = schemaLabel(sc);
      return o;
    }),
  );
  select.value =
    prior && map.has(prior)
      ? prior
      : youtubeInfo(context?.pageUrl || "")
        ? "xtratype.anchor.youtube@1"
        : "xtratype.anchor.url@1";
  select.dataset.hydrated = "true";
  if (!$("target-fields").children.length || select.value !== prior)
    renderTargetFields();
  renderSchemaList();
}

async function refreshContext({ automatic = false, tabId = null } = {}) {
  const draftPresent =
    dirty ||
    !!$("comment").value.trim() ||
    selectedFiles.length > 0;
  if (
    !automatic &&
    draftPresent &&
    !confirm(
      "Refresh page context and reset the target fields/quote? Your comment and images will be kept.",
    )
  )
    return;
  const previousPageUrl = context?.pageUrl || "";
  const priorSchema = schemas.find((s) => s.$id === $("target-kind").value);
  const priorKind = schemaKind(priorSchema);
  const preserveIndependentTarget =
    automatic && draftPresent && !["url", "youtube"].includes(priorKind);
  const previousQuote = $("highlighted-text").value;
  const session = (await chrome.storage.session.get("xtratypeLastContext"))
    .xtratypeLastContext;
  const live = await chrome.runtime
    .sendMessage({
      type: "xtratype:getContext",
      ...(Number.isInteger(tabId) ? { tabId } : {}),
    })
    .catch(() => null);
  context = live?.ok
    ? { ...live.context, tabId: live.tabId, windowId: live.windowId }
    : session || context;
  $("highlighted-text").value =
    automatic && draftPresent ? previousQuote : context?.highlightedText || "";
  if (!preserveIndependentTarget) $("target-fields").replaceChildren();
  dirty = draftPresent;
  $("context-title").textContent = context?.title || "Current page";
  $("context-url").textContent =
    context?.scriptAccess === false
      ? context.accessReason || "Browser context is unavailable on this page."
      : context?.pageUrl || "Browser context is unavailable on this page.";
  document
    .querySelector(".context-dot")
    ?.classList.toggle("blocked", context?.scriptAccess === false);
  if (context?.scriptAccess === false)
    setStatus(
      $("composer-status"),
      context.accessReason || "This browser page cannot be scripted.",
      true,
    );
  else if (automatic && draftPresent && context?.pageUrl !== previousPageUrl)
    setStatus(
      $("composer-status"),
      "Page context updated automatically. Your comment and images were kept; review the new target before posting.",
    );
  await loadSchemas();
  await renderFeed();
  await renderSnapshots();
  await chrome.runtime
    .sendMessage({ type: "xtratype:updateBadge" })
    .catch(() => null);
}

function scheduleContextRefresh(tabId = null) {
  clearTimeout(contextRefreshTimer);
  contextRefreshTimer = setTimeout(() => {
    refreshContext({ automatic: true, tabId }).catch((e) =>
      setStatus($("composer-status"), e.message, true),
    );
  }, 120);
}

const COMPOSE_REQUEST_KEY = "xtratypeComposeRequest";
const COMPOSE_REQUEST_MAX_AGE_MS = 60_000;

function focusComposer() {
  document
    .querySelector('[data-primary-section="author"]')
    ?.scrollIntoView?.({ block: "start" });
  $("comment")?.focus();
}

async function clearComposeRequest() {
  await chrome.storage.session
    .set({ [COMPOSE_REQUEST_KEY]: null })
    .catch(() => {});
}

async function consumeComposeRequest() {
  const stored = await chrome.storage.session
    .get(COMPOSE_REQUEST_KEY)
    .catch(() => ({}));
  const request = stored?.[COMPOSE_REQUEST_KEY];
  if (!request || typeof request !== "object") return false;
  if (Date.now() - Number(request.requestedAt || 0) > COMPOSE_REQUEST_MAX_AGE_MS) {
    await clearComposeRequest();
    return false;
  }
  if (
    (request.tabId != null && context?.tabId !== request.tabId) ||
    (request.windowId != null && context?.windowId !== request.windowId)
  )
    return false;
  await clearComposeRequest();
  if (typeof request.commentText === "string" && request.commentText.length) {
    $("comment").value = request.commentText.slice(0, 20000);
    dirty = true;
  }
  focusComposer();
  return true;
}

async function beginAnnotationFromTrigger(tabId = null, commentText = "") {
  await refreshContext({ automatic: true, tabId });
  await clearComposeRequest();
  if (typeof commentText === "string" && commentText.length) {
    $("comment").value = commentText.slice(0, 20000);
    dirty = true;
  }
  focusComposer();
}

function renderTargetFields() {
  const schema = schemas.find((s) => s.$id === $("target-kind").value);
  const kind = schemaKind(schema);
  const host = $("target-fields");
  host.replaceChildren();
  if (kind === "url") return renderUrl(host);
  if (kind === "gps") return renderGps(host);
  if (kind === "time") return renderTime(host);
  if (kind === "youtube") return renderYoutube(host);
  return renderCustom(host, schema);
}

function renderUrl(host) {
  let parsed;
  try {
    parsed = parseUrlTarget(context?.pageUrl || "");
  } catch {}
  const v = parsed?.value || { url: "", queryParameters: [], fragment: null };
  host.innerHTML = `<label>Base URL<input id="url-base" type="url" value="${safe(v.url + (v.fragment ? "#" + v.fragment : ""))}"></label><details class="target-options"><summary><span><strong>Query & fragment handling</strong><small>Choose how URL variables and fragments participate in matching</small></span></summary><div class="target-options-body"><label>Query handling<select id="url-query-mode"><option value="ignore">Ignore all query variables</option><option value="selected">Use selected variables</option><option value="all">Use all variables</option></select></label><div id="query-list"></div><label>Fragment handling<select id="url-fragment-mode"><option value="ignore">Ignore fragment</option><option value="include">Include fragment</option></select></label><div class="actions"><button type="button" id="url-extract">Extract variables from URL</button></div></div></details>`;
  const q = host.querySelector("#query-list");
  if (!v.queryParameters.length)
    q.innerHTML = '<p class="muted">No query parameters detected.</p>';
  for (const p of v.queryParameters) {
    const row = document.createElement("div");
    row.className = "query-row";
    row.innerHTML = `<input type="checkbox" class="q-include"><input class="q-key" value="${safe(p.key)}" aria-label="Query key"><input class="q-value" value="${safe(p.value)}" aria-label="Query value">`;
    q.append(row);
  }
  host.querySelector("#url-extract").onclick = () => {
    try {
      const p = parseUrlTarget(host.querySelector("#url-base").value);
      const list = host.querySelector("#query-list");
      list.replaceChildren();
      if (!p.value.queryParameters.length)
        list.innerHTML = '<p class="muted">No query parameters detected.</p>';
      for (const x of p.value.queryParameters) {
        const row = document.createElement("div");
        row.className = "query-row";
        row.innerHTML = `<input type="checkbox" class="q-include"><input class="q-key" value="${safe(x.key)}"><input class="q-value" value="${safe(x.value)}">`;
        list.append(row);
      }
      host.querySelector("#url-base").value =
        p.value.url + (p.value.fragment ? "#" + p.value.fragment : "");
      dirty = true;
      renderFeed();
    } catch (e) {
      setStatus($("composer-status"), e.message, true);
    }
  };
}

function renderGps(host) {
  host.innerHTML = `<div class="two"><label>Latitude<input id="gps-lat" type="number" step="any"></label><label>Longitude<input id="gps-lon" type="number" step="any"></label></div><div class="two"><label>Radius (m, optional)<input id="gps-r" type="number" min="1" step="1" placeholder="default"></label><label>Label<input id="gps-label" type="text" placeholder="optional"></label></div><div class="actions"><button type="button" id="use-location">Use my location</button></div><p class="muted">A blank radius stores bare coordinates; the web Nearby view uses its default gate. This panel lists exact GPS keys.</p>`;
  host.querySelector("#use-location").onclick = () =>
    navigator.geolocation.getCurrentPosition(
      (p) => {
        host.querySelector("#gps-lat").value = p.coords.latitude;
        host.querySelector("#gps-lon").value = p.coords.longitude;
      },
      (e) => setStatus($("composer-status"), e.message, true),
      { enableHighAccuracy: true, timeout: 10000 },
    );
}

function renderTime(host) {
  const now = localDateTimeValue();
  host.innerHTML = `<label>Time anchor type<select id="time-mode"><option value="moment">Single moment</option><option value="range">Timeframe / range</option></select></label><div id="time-moment-fields"><label>Timestamp<input id="time-at" type="datetime-local" step="1" value="${safe(now)}"></label><div class="actions"><button id="time-use-now" type="button">Use current time</button></div></div><div id="time-range-fields" class="hidden"><div class="two"><label>Start time<input id="time-start" type="datetime-local" step="1" value="${safe(now)}"></label><label>End time<input id="time-end" type="datetime-local" step="1"></label></div><div class="actions"><button id="time-start-now" type="button">Start now</button><button id="time-end-now" type="button">End now</button></div></div><p class="muted time-mode-help">Time anchors are generic: they are not tied to the current URL, GPS location, or video.</p>`;
  const toggle = () => {
    const range = host.querySelector("#time-mode").value === "range";
    host.querySelector("#time-moment-fields").classList.toggle("hidden", range);
    host.querySelector("#time-range-fields").classList.toggle("hidden", !range);
  };
  host.querySelector("#time-mode").onchange = () => {
    toggle();
    dirty = true;
    renderFeed();
  };
  host.querySelector("#time-use-now").onclick = () => {
    host.querySelector("#time-at").value = localDateTimeValue();
    dirty = true;
    renderFeed();
  };
  host.querySelector("#time-start-now").onclick = () => {
    host.querySelector("#time-start").value = localDateTimeValue();
    dirty = true;
    renderFeed();
  };
  host.querySelector("#time-end-now").onclick = () => {
    host.querySelector("#time-end").value = localDateTimeValue();
    dirty = true;
    renderFeed();
  };
  toggle();
}

function renderYoutube(host) {
  const info = youtubeInfo(context?.pageUrl || "") || {
    videoId: "",
    videoUrl: "",
  };
  const now = Number.isFinite(context?.currentVideoTime)
    ? context.currentVideoTime
    : null;
  host.innerHTML = `<label>Video ID<input id="yt-id" value="${safe(info.videoId)}"></label><label>Video URL<input id="yt-url" type="url" value="${safe(info.videoUrl)}"></label><div class="two"><label>Start seconds<input id="yt-start" type="number" min="0" step="0.1" value="${now == null ? "" : Math.round(now * 10) / 10}"></label><label>End seconds<input id="yt-end" type="number" min="0" step="0.1"></label></div><div class="actions"><button id="yt-use-now" type="button">Use current time</button><button id="yt-clear-time" type="button">Bare video</button></div>`;
  host.querySelector("#yt-use-now").onclick = async () => {
    const live = await chrome.runtime.sendMessage({
      type: "xtratype:getContext",
    });
    if (live.ok && Number.isFinite(live.context.currentVideoTime))
      host.querySelector("#yt-start").value =
        Math.round(live.context.currentVideoTime * 10) / 10;
  };
  host.querySelector("#yt-clear-time").onclick = () => {
    host.querySelector("#yt-start").value = "";
    host.querySelector("#yt-end").value = "";
  };
}

function renderCustom(host, schema) {
  const intro = document.createElement("p");
  intro.className = "muted";
  intro.textContent =
    schema["x-xtratype"]?.description ||
    `Structured ${schemaLabel(schema)} handle`;
  host.append(intro);
  for (const [name, def] of Object.entries(schema.properties || {})) {
    const label = document.createElement("label");
    label.textContent = def.title || name;
    let input;
    if (Array.isArray(def.enum)) {
      input = document.createElement("select");
      for (const [i, value] of def.enum.entries()) {
        const o = document.createElement("option");
        o.value = i;
        o.textContent = String(value);
        input.append(o);
      }
    } else if (
      (Array.isArray(def.type) ? def.type : [def.type]).includes("boolean")
    ) {
      input = document.createElement("input");
      input.type = "checkbox";
    } else {
      input = document.createElement("input");
      const types = Array.isArray(def.type) ? def.type : [def.type];
      input.type = types.some((t) => t === "number" || t === "integer")
        ? "number"
        : "text";
      if (input.type === "number") input.step = "any";
      if (def.minimum != null) input.min = def.minimum;
      if (def.maximum != null) input.max = def.maximum;
      if (types.includes("integer")) input.step = "1";
    }
    input.dataset.field = name;
    label.append(input);
    host.append(label);
  }
}

function buildTarget() {
  const schema = schemas.find((s) => s.$id === $("target-kind").value);
  const kind = schemaKind(schema);
  if (kind === "url") {
    const params = [...document.querySelectorAll(".query-row")].map((r) => ({
      key: r.querySelector(".q-key").value,
      value: r.querySelector(".q-value").value,
      include: r.querySelector(".q-include").checked,
    }));
    const raw = $("url-base").value;
    const t = parseUrlTarget(raw);
    t.value.queryMode = $("url-query-mode").value;
    if (!t.value.queryParameters.length) t.value.queryParameters = params;
    else if (t.value.queryMode === "selected")
      throw new Error(
        "Extract URL variables, then select the parameters to include.",
      );
    t.value.fragmentMode = $("url-fragment-mode").value;
    return t;
  }
  if (kind === "gps")
    return makeGpsTarget(
      $("gps-lat").value,
      $("gps-lon").value,
      $("gps-r").value,
      $("gps-label").value,
    );
  if (kind === "time")
    return $("time-mode").value === "range"
      ? makeTimeTarget(null, $("time-start").value, $("time-end").value)
      : makeTimeTarget($("time-at").value);
  if (kind === "youtube") {
    const raw =
      $("yt-url").value ||
      `https://www.youtube.com/watch?v=${$("yt-id").value}`;
    const t = makeYoutubeTarget(raw, $("yt-start").value, $("yt-end").value);
    t.value.videoId = $("yt-id").value.trim() || t.value.videoId;
    t.value.videoUrl = `https://www.youtube.com/watch?v=${t.value.videoId}`;
    validateTarget(t);
    return t;
  }
  const value = {};
  for (const input of $("target-fields").querySelectorAll("[data-field]")) {
    const def = schema.properties[input.dataset.field] || {};
    const types = Array.isArray(def.type) ? def.type : [def.type];
    const v = readPrimitiveInput(input, def);
    if (v !== undefined) value[input.dataset.field] = v;
  }
  validateCustomValue(schema, value);
  return { kind: "custom", schemaId: schema.$id, value };
}

function validateFiles(files) {
  const allowed = new Set(["image/png", "image/jpeg", "image/webp"]);
  if (files.length > 3) throw new Error("Choose no more than three images.");
  for (const f of files) {
    if (!allowed.has(f.type))
      throw new Error("Only PNG, JPEG and WebP images are allowed.");
    if (f.size > 8 * 1024 * 1024)
      throw new Error(`${f.name} is larger than 8 MiB.`);
  }
}

async function saveAnnotation() {
  if (saving) return;
  saving = true;
  const button = $("composer").querySelector("[type=submit]");
  button.disabled = true;
  try {
    const target = buildTarget();
    validateTarget(
      target,
      schemas.find((s) => s.$id === target.schemaId),
    );
    if (
      context?.documentId &&
      (target.kind === "url" ||
        target.kind === "youtube" ||
        $("highlighted-text").value)
    ) {
      const live = await chrome.runtime.sendMessage({
        type: "xtratype:getContext",
      });
      if (
        !live?.ok ||
        live.tabId !== context.tabId ||
        live.context.documentId !== context.documentId ||
        live.context.pageUrl !== context.pageUrl
      )
        throw new Error(
          "Page changed. Review your draft and refresh context before saving.",
        );
    }
    const opts = await settings();
    let a = await createAnnotation({
      target,
      body: $("comment").value,
      highlightedText: $("highlighted-text").value,
      files: selectedFiles,
      author: opts.author,
      autoSync: opts.autoSync,
    });
    $("comment").value = "";
    $("highlighted-text").value = "";
    $("images").value = "";
    selectedFiles = [];
    dirty = false;
    renderPreviews();
    setStatus($("composer-status"), "Saved locally.");
    if (opts.autoSync) {
      try {
        a = await syncAnnotation(a);
        setStatus($("composer-status"), "Saved locally and synced.");
      } catch (e) {
        setStatus(
          $("composer-status"),
          `Saved locally; sync failed: ${e.message}`,
          true,
        );
      }
    }
    await renderFeed();
    await chrome.runtime.sendMessage({ type: "xtratype:updateBadge" }).catch(() => null);
    if (target.kind === "youtube" && context?.tabId)
      chrome.tabs
        .sendMessage(context.tabId, { type: "xtratype:refresh" })
        .catch(() => {});
  } finally {
    saving = false;
    button.disabled = false;
  }
}

const OLD_ANNOTATION_KEY = "xtratypeOldAnnotationIds";
const WEEK_YOUNG_MS = 7 * 24 * 60 * 60 * 1000;

function isWeekYoung(annotation, now = Date.now()) {
  const created = Date.parse(annotation?.createdAt || "");
  return Number.isFinite(created) && created >= now - WEEK_YOUNG_MS;
}

async function oldAnnotationMap() {
  const stored = await chrome.storage.local.get(OLD_ANNOTATION_KEY);
  return stored?.[OLD_ANNOTATION_KEY] && typeof stored[OLD_ANNOTATION_KEY] === "object"
    ? stored[OLD_ANNOTATION_KEY]
    : {};
}

function groupChatCode(rawUrl) {
  try {
    const u = new URL(rawUrl || "");
    if (!["xtratype.com", "www.xtratype.com"].includes(u.hostname)) return null;
    return /^\/gc\/([A-Za-z0-9]{5})(?:\/|$)/.exec(u.pathname)?.[1] || null;
  } catch {
    return null;
  }
}

async function renderGroupChat(host, code) {
  host.innerHTML = '<p class="muted">Loading XT Group Chat…</p>';
  try {
    const data = await getGroupChat(code);
    const chat = data.chat;
    host.replaceChildren();
    const card = document.createElement("div");
    card.className = "group-chat-dialogue";
    const memberNames = (chat.members || []).map((m) => m.username).join(", ");
    card.innerHTML = `<div class="group-chat-head"><div><strong>${safe(chat.name || "XT Group Chat")}</strong><div class="muted">xtratype.com/gc/${safe(code)} · members: ${safe(memberNames || "you")}</div></div><span class="pill">private</span></div><div class="message-thread group-chat-thread"></div><form class="group-chat-compose"><label>Message<textarea rows="2" maxlength="20000" required placeholder="Write to this XT Group Chat…"></textarea></label><button class="primary" type="submit">Send</button></form>`;
    const thread = card.querySelector(".group-chat-thread");
    for (const message of data.messages || []) {
      const row = document.createElement("div");
      row.className = "message-row";
      row.innerHTML = `<div class="meta"><span>${safe(message.sender?.displayName || message.sender?.username || "User")}</span><span>${safe(new Date(message.createdAt).toLocaleString())}</span></div><div class="body">${safe(message.body)}</div>`;
      thread.append(row);
    }
    if (!(data.messages || []).length)
      thread.innerHTML = '<p class="muted">No messages in this group chat yet.</p>';
    card.querySelector("form").onsubmit = async (e) => {
      e.preventDefault();
      const input = card.querySelector("textarea");
      const body = input.value.trim();
      if (!body) return;
      const button = card.querySelector("button[type=submit]");
      button.disabled = true;
      try {
        await sendGroupChatMessage(code, body);
        await renderGroupChat(host, code);
      } catch (error) {
        setStatus($("composer-status"), error.message, true);
      } finally {
        button.disabled = false;
      }
    };
    host.append(card);
  } catch (error) {
    host.innerHTML = `<div class="mini-card"><strong>XT Group Chat ${safe(code)}</strong><p class="muted">${safe(error.message)}</p><p class="muted">Log in under Account & messaging, or ask the chat creator to grant your username access.</p></div>`;
  }
}

async function renderFeed() {
  const generation = ++feedGeneration;
  revoke("feed");
  const host = $("annotation-list");
  host.replaceChildren();
  const chatCode = groupChatCode(context?.pageUrl);
  if (chatCode) {
    currentFeedAnnotationIds = [];
    $("annotations-title").textContent = `XT Group Chat · ${chatCode}`;
    $("mark-all-old").classList.add("hidden");
    await renderGroupChat(host, chatCode);
    return;
  }
  $("annotations-title").textContent = "Annotations:";
  $("mark-all-old").classList.remove("hidden");
  let items = await all("annotations");
  if (generation !== feedGeneration) return;
  let currentTarget = null;
  try {
    currentTarget = buildTarget();
  } catch {}
  if (!currentTarget) {
    currentFeedAnnotationIds = [];
    host.textContent = "Enter a valid target to see matching annotations.";
    return;
  }
  const key = targetKey(currentTarget);
  items = items.filter(
    (a) =>
      a.targetKey === key ||
      (currentTarget.kind === "youtube" &&
        a.target?.kind === "youtube" &&
        a.target.value.videoId === currentTarget.value.videoId) ||
      (currentTarget.kind === "time" && a.target?.kind === "time"),
  );
  items.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  currentFeedAnnotationIds = items.map((a) => a.id);
  const old = await oldAnnotationMap();
  if (generation !== feedGeneration) return;
  const now = Date.now();
  const visibleItems = items.slice(0, 50);
  for (const a of visibleItems) {
    const el = document.createElement("article");
    const young = isWeekYoung(a, now) && !old[a.id];
    el.className = `annotation${young ? " week-young" : ""}`;
    const time =
      a.target?.kind === "youtube" && a.target.value.startSeconds != null
        ? ` · ${formatTime(a.target.value.startSeconds)}`
        : timeTargetLabel(a.target);
    const tree = young
      ? '<span class="young-tree" title="Less than seven days old" aria-label="Less than seven days old">🌳</span>'
      : "";
    el.innerHTML = `<div class="meta"><span>${tree}${safe(a.author || "Local")} · ${safe(a.target?.kind || "custom")}${safe(time)}</span><span>${safe(a.syncState || "local")}</span></div>${a.highlightedText ? `<div class="quote">${safe(a.highlightedText.slice(0, 500))}</div>` : ""}<div class="body">${safe(a.body)}</div>${a.syncError ? `<p class="muted">Sync failed: ${safe(a.syncError)}</p>` : ""}<div class="thumbs"></div>`;
    const thumbs = el.querySelector(".thumbs");
    for (const at of a.attachments || []) {
      let src = null;
      if (at.blobId) {
        const br = await get("blobs", at.blobId);
        if (generation !== feedGeneration) return;
        if (br?.blob) src = objectUrl("feed", br.blob);
      }
      if (!src) src = at.serverUrl || at.url;
      if (src) {
        const img = document.createElement("img");
        img.alt = at.name || "Annotation image";
        const base = at.serverBase || (await settings()).apiBase;
        if (generation !== feedGeneration) return;
        img.src = src.startsWith("/") ? new URL(src, base).href : src;
        if (!/^(https?:|blob:)/.test(img.src)) continue;
        thumbs.append(img);
      }
    }
    host.append(el);
  }
  if (!items.length)
    host.innerHTML = '<p class="muted">No local annotations match this target yet.</p>';
}

async function markAllCurrentTargetOld() {
  const ids = [...currentFeedAnnotationIds];
  const feedResult = await chrome.runtime
    .sendMessage({ type: "xtratype:markAnnotationsOld", ids })
    .catch((e) => ({ ok: false, error: e.message }));
  if (!feedResult?.ok) throw new Error(feedResult?.error || "Could not mark annotations as old.");

  // Also clear every recent annotation that contributes to the current page's
  // toolbar badge, even if the current target/query view does not list it.
  const pageResult = await chrome.runtime
    .sendMessage({ type: "xtratype:markPageOld" })
    .catch((e) => ({ ok: false, error: e.message }));
  if (!pageResult?.ok) throw new Error(pageResult?.error || "Could not mark page annotations as old.");

  const changed = Number(feedResult.count || 0) + Number(pageResult.count || 0);
  setStatus(
    $("composer-status"),
    changed
      ? "Recent annotations here are marked as old."
      : "There were no week-young annotations here to mark old.",
  );
  await renderFeed();
  await chrome.runtime.sendMessage({ type: "xtratype:updateBadge" }).catch(() => null);
}

function renderPreviews() {
  revoke("preview");
  const host = $("image-previews");
  host.replaceChildren();
  selectedFiles.forEach((f, i) => {
    const d = document.createElement("div");
    d.className = "preview";
    const img = document.createElement("img");
    img.src = objectUrl("preview", f);
    img.alt = f.name;
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = "×";
    b.setAttribute("aria-label", "Remove " + f.name);
    b.onclick = () => {
      selectedFiles.splice(i, 1);
      $("images").value = "";
      renderPreviews();
    };
    d.append(img, b);
    host.append(d);
  });
}

async function pull() {
  const button = $("pull-annotations");
  if (button.disabled) return;
  button.disabled = true;
  let pushed = 0,
    failed = 0;
  try {
    for (const r of await all("schemas")) {
      const sc = r.schema || r;
      try {
        await pushSchema(sc);
      } catch {
        failed++;
      }
    }
    for (const a of await all("annotations"))
      if (a.syncState !== "synced") {
        try {
          await syncAnnotation(a);
          pushed++;
        } catch {
          failed++;
        }
      }
    for (const snap of await all("snapshots"))
      if (snap.syncState !== "synced") {
        try {
          const remote = await syncSnapshot(
            snap,
            await get("blobs", snap.screenshotBlobId),
          );
          await put("snapshots", {
            ...snap,
            serverScreenshot: remote.screenshot,
            syncState: "synced",
            syncBase: (await settings()).apiBase,
          });
        } catch (e) {
          failed++;
          await put("snapshots", {
            ...snap,
            syncState: "error",
            syncError: e.message,
          });
        }
      }
    const remote = await pullAnnotations();
    setStatus(
      $("composer-status"),
      `Sync finished: ${pushed} uploaded, ${remote.length} received, ${failed} failed (retained locally).`,
      failed > 0,
    );
    await loadSchemas(true);
    await renderFeed();
    await renderSnapshots();
    await chrome.runtime
      .sendMessage({ type: "xtratype:updateBadge" })
      .catch(() => null);
  } catch (e) {
    setStatus(
      $("composer-status"),
      `Local data retained; sync failed: ${e.message}`,
      true,
    );
  } finally {
    button.disabled = false;
  }
}
async function takeSnapshot(full) {
  if (captureBusy) return;
  captureBusy = true;
  $("capture-visible").disabled = $("capture-full").disabled = true;
  $("snapshot-quick").disabled = true;
  try {
    setStatus(
      $("capture-status"),
      full ? "Capturing page; keep this tab active…" : "Capturing viewport…",
    );
    const result = await capturePage(full, (n, total) =>
      setStatus($("capture-status"), `Capturing tile ${n}/${total}…`),
    );
    const snap = await persistSnapshot(
      result.context,
      result.extract,
      result.blob,
      result.mode,
    );
    setStatus(
      $("capture-status"),
      `Snapshot saved locally${snap.syncState === "error" ? "; upload failed: " + snap.syncError : snap.syncState === "synced" ? " and synced." : "."}${result.extract.htmlTruncated || result.extract.textTruncated ? " Extracted text/HTML reached its limit." : ""}`,
      snap.syncState === "error",
    );
  } catch (e) {
    setStatus($("capture-status"), e.message, true);
  } finally {
    captureBusy = false;
    $("capture-visible").disabled = $("capture-full").disabled = false;
    $("snapshot-quick").disabled = false;
  }
}
async function persistSnapshot(c, extract, blob, mode) {
  const now = new Date().toISOString(),
    br = {
      id: id("blob"),
      blob,
      type: blob.type,
      size: blob.size,
      name: "snapshot.png",
      createdAt: now,
    };
  const opts = await settings();
  const snap = {
    id: id("snapshot"),
    recordType: "Revision.Snapshot",
    schemaVersion: 1,
    pageKey: targetKey(parseUrlTarget(c.pageUrl)),
    url: c.pageUrl,
    title: c.title,
    capturedAt: now,
    mode,
    metrics: {
      viewport: c.viewport,
      page: c.page,
      htmlTruncated: !!extract.htmlTruncated,
      textTruncated: !!extract.textTruncated,
    },
    renderedText: extract.text,
    renderedHtml: extract.html,
    screenshotBlobId: br.id,
    syncState: opts.autoSync ? "pending" : "local",
  };
  await atomicPut([
    ["blobs", br],
    ["snapshots", snap],
  ]);
  if (opts.autoSync) {
    try {
      const remote = await syncSnapshot(snap, br);
      snap.serverScreenshot = remote.screenshot;
      snap.syncState = "synced";
      snap.syncBase = opts.apiBase;
    } catch (e) {
      snap.syncState = "error";
      snap.syncError = e.message;
    }
    await put("snapshots", snap);
  }
  await renderSnapshots();
  return snap;
}

function dataUrlToBlob(dataUrl) {
  const [head, b64] = dataUrl.split(",");
  const type = /data:([^;]+)/.exec(head)?.[1] || "image/png";
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return new Blob([bytes], { type });
}

async function renderSnapshots() {
  revoke("snapshot");
  const host = $("snapshot-list"),
    latest = $("latest-snapshot");
  host.replaceChildren();
  latest.replaceChildren();
  if (!context?.pageUrl) return;
  let pageKey;
  try {
    pageKey = targetKey(parseUrlTarget(context.pageUrl));
  } catch {
    return;
  }
  const snaps = (await byIndex("snapshots", "pageKey", pageKey)).sort((a, b) =>
    String(b.capturedAt).localeCompare(String(a.capturedAt)),
  );
  for (const [i, s] of snaps.entries()) {
    const br = await get("blobs", s.screenshotBlobId);
    const url = br?.blob ? objectUrl("snapshot", br.blob) : "";
    const row = document.createElement("div");
    row.className = "snapshot";
    row.innerHTML = `${url ? `<img src="${url}">` : "<div></div>"}<div><strong>${safe(s.mode)}</strong><br><small>${new Date(s.capturedAt).toLocaleString()} · ${safe(s.syncState || "local")}</small><br><span class="muted">${Math.round((s.renderedText?.length || 0) / 1000)}k text chars</span></div>`;
    row.tabIndex = 0;
    row.setAttribute("role", "button");
    row.setAttribute("aria-label", "View " + s.mode + " snapshot");
    row.onclick = () => showSnapshot(s);
    row.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        showSnapshot(s);
      }
    };
    host.append(row);
    if (i === 0 && url) {
      const img = document.createElement("img");
      img.src = url;
      latest.append(img);
    }
  }
  if (!snaps.length)
    host.innerHTML = '<p class="muted">No snapshots for this page yet.</p>';
}

async function showSnapshot(s) {
  const br = await get("blobs", s.screenshotBlobId);
  if (!br?.blob) return;
  if (selectedSnapshotUrl) URL.revokeObjectURL(selectedSnapshotUrl);
  selectedSnapshotUrl = URL.createObjectURL(br.blob);
  $("latest-snapshot").innerHTML =
    `<img src="${selectedSnapshotUrl}"><p class="muted">${safe(s.title)} · ${new Date(s.capturedAt).toLocaleString()}</p>`;
}

async function compareLatest() {
  if (!context?.pageUrl) throw new Error("No active page.");
  const key = targetKey(parseUrlTarget(context.pageUrl));
  const snaps = (await byIndex("snapshots", "pageKey", key)).sort((a, b) =>
    String(b.capturedAt).localeCompare(String(a.capturedAt)),
  );
  if (snaps.length < 2)
    throw new Error("Capture at least two snapshots first.");
  const [a, b] = await Promise.all([
    get("blobs", snaps[0].screenshotBlobId),
    get("blobs", snaps[1].screenshotBlobId),
  ]);
  if (!a?.blob || !b?.blob) throw new Error("Snapshot image is missing.");
  const [ia, ib] = await Promise.all([
    createImageBitmap(a.blob),
    createImageBitmap(b.blob),
  ]);
  if (ia.width !== ib.width || ia.height !== ib.height) {
    ia.close();
    ib.close();
    throw new Error(
      "Snapshot dimensions differ. Pixel comparison would be misleading; capture matching viewports.",
    );
  }
  const scale = Math.min(
    1,
    1800 / ia.width,
    Math.sqrt(12000000 / (ia.width * ia.height)),
  );
  const w = Math.max(1, Math.round(ia.width * scale)),
    h = Math.max(1, Math.round(ia.height * scale));
  const c = $("diff-canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(ib, 0, 0, w, h);
  const before = ctx.getImageData(0, 0, w, h);
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(ia, 0, 0, w, h);
  const after = ctx.getImageData(0, 0, w, h);
  const out = ctx.createImageData(w, h);
  let changed = 0;
  for (let i = 0; i < after.data.length; i += 4) {
    const d =
      Math.abs(after.data[i] - before.data[i]) +
      Math.abs(after.data[i + 1] - before.data[i + 1]) +
      Math.abs(after.data[i + 2] - before.data[i + 2]);
    if (d > 60) {
      changed++;
      out.data[i] = 230;
      out.data[i + 1] = 40;
      out.data[i + 2] = 60;
      out.data[i + 3] = 210;
    } else {
      out.data[i] = after.data[i] * 0.45;
      out.data[i + 1] = after.data[i + 1] * 0.45;
      out.data[i + 2] = after.data[i + 2] * 0.45;
      out.data[i + 3] = 180;
    }
  }
  ctx.putImageData(out, 0, 0);
  $("diff-score").textContent =
    `${((changed / (w * h)) * 100).toFixed(2)}% pixels changed${scale < 1 ? " (uniformly downsampled)" : ""}`;
  ia.close();
  ib.close();
  $("compare-card").classList.remove("hidden");
}

function renderSchemaList() {
  const host = $("schema-list");
  host.replaceChildren();
  for (const s of schemas) {
    const el = document.createElement("div");
    el.className = "schema";
    el.innerHTML = `<strong>${safe(schemaLabel(s))}</strong><br><code>${safe(s.$id)}</code><div class="muted">${safe(Object.keys(s.properties || {}).join(", "))}</div>`;
    host.append(el);
  }
}

async function installSchema(file) {
  if (file.size > 262144) throw new Error("Schema exceeds 256 KiB.");
  const text = await file.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("The selected file is not valid JSON.");
  }
  const s = normalizeCustomSchema(parsed);
  await put("schemas", {
    id: s.$id,
    schema: s,
    updatedAt: new Date().toISOString(),
  });
  try {
    if (!(await settings()).autoSync) {
      setStatus($("schema-status"), `Installed locally: ${schemaLabel(s)}.`);
      await loadSchemas();
      return;
    }
    await pushSchema(s);
    setStatus($("schema-status"), `Installed and synced ${schemaLabel(s)}.`);
  } catch (e) {
    setStatus(
      $("schema-status"),
      `Installed locally; server sync failed: ${e.message}`,
      true,
    );
  }
  await loadSchemas();
}

async function loadSettingsForm() {
  const s = await settings();
  $("api-base").value = s.apiBase;
  $("author").value = s.author;
  $("gps-radius").value = s.defaultGpsRadius;
  $("auto-sync").checked = s.autoSync;
  $("quick-snapshot-mode").value = s.quickSnapshotMode || "full";
}


function usernamesFromInput(value) {
  return [...new Set(String(value || "").split(",").map((x) => x.trim()).filter(Boolean))];
}

async function adoptAccountAuthor(user) {
  if (!user) return;
  const current = await settings();
  const author = user.displayName || user.username || current.author;
  if (author && current.author !== author) {
    await saveSettings({ ...current, author });
    $("author").value = author;
  }
}

function renderMessageRows(host, items) {
  host.replaceChildren();
  for (const m of items) {
    const row = document.createElement("div");
    row.className = "message-row";
    const from = m.sender?.displayName || m.sender?.username || "User";
    row.innerHTML = `<div class="meta"><span>${safe(from)}</span><span>${safe(new Date(m.createdAt).toLocaleString())}</span></div><div class="body">${safe(m.body)}</div>`;
    host.append(row);
  }
  if (!items.length) host.innerHTML = '<p class="muted">No messages yet.</p>';
}

async function renderInvites() {
  const host = $("invite-list");
  const data = await listInvites();
  host.replaceChildren();
  $("create-invite").disabled = !data.system?.invitesEnabled || accountStateCache?.user?.canCreateInvites === false;
  for (const invite of data.items || []) {
    const row = document.createElement("div");
    row.className = "compact-row";
    row.innerHTML = `<code>${safe(invite.code)}</code><span>${invite.usedAt ? `used ${safe(new Date(invite.usedAt).toLocaleString())}` : `unused · created ${safe(new Date(invite.createdAt).toLocaleString())}`}</span>`;
    host.append(row);
  }
  if (!(data.items || []).length) host.innerHTML = '<p class="muted">No invitations created yet.</p>';
}

async function renderContactGroups() {
  const host = $("contact-group-list");
  const groups = await listContactGroups();
  host.replaceChildren();
  for (const group of groups) {
    const row = document.createElement("div");
    row.className = "compact-row contact-row";
    const names = (group.members || []).map((m) => m.username).join(", ");
    row.innerHTML = `<div><strong>${safe(group.name)}</strong><div class="muted">${safe(names || "No members")}</div></div>`;
    const del = document.createElement("button");
    del.type = "button";
    del.textContent = "Delete";
    del.onclick = async () => {
      await deleteContactGroup(group.id);
      await renderContactGroups();
    };
    row.append(del);
    host.append(row);
  }
  if (!groups.length) host.innerHTML = '<p class="muted">No contact groups yet.</p>';
}

async function loadDirectMessageThread() {
  const username = $("dm-user").value.trim();
  if (!username) {
    $("dm-thread").innerHTML = '<p class="muted">Enter a username to load a direct-message thread.</p>';
    return;
  }
  renderMessageRows($("dm-thread"), await directMessages(username));
}

async function renderGroupChatList() {
  const host = $("group-chat-list");
  const chats = await listGroupChats();
  host.replaceChildren();
  for (const chat of chats) {
    const row = document.createElement("div");
    row.className = "compact-row";
    row.innerHTML = `<div><strong>${safe(chat.name)}</strong><div class="muted">${safe(chat.url)} · ${(chat.members || []).length} members</div></div><code>${safe(chat.code)}</code>`;
    host.append(row);
  }
  if (!chats.length) host.innerHTML = '<p class="muted">No XT Group Chats yet.</p>';
}

async function renderAdminPanel() {
  const panel = $("admin-panel");
  if (accountStateCache?.user?.role !== "admin") {
    panel.classList.add("hidden");
    return;
  }
  panel.classList.remove("hidden");
  const data = await adminState();
  $("admin-system-enabled").checked = !!data.system.systemEnabled;
  $("admin-invites-enabled").checked = !!data.system.invitesEnabled;
  const host = $("admin-user-list");
  host.replaceChildren();
  for (const user of data.users || []) {
    const row = document.createElement("div");
    row.className = "admin-user-row";
    const who = document.createElement("div");
    who.innerHTML = `<strong>${safe(user.username)}</strong><div class="muted">${safe(user.displayName)} · ${safe(user.role)}</div>`;
    const enabled = document.createElement("label");
    enabled.className = "check compact-check";
    const enabledBox = document.createElement("input");
    enabledBox.type = "checkbox";
    enabledBox.checked = !!user.enabled;
    enabledBox.disabled = user.id === accountStateCache.user.id;
    enabled.append(enabledBox, document.createTextNode(" use"));
    const invites = document.createElement("label");
    invites.className = "check compact-check";
    const inviteBox = document.createElement("input");
    inviteBox.type = "checkbox";
    inviteBox.checked = !!user.canCreateInvites;
    invites.append(inviteBox, document.createTextNode(" invites"));
    enabledBox.onchange = async () => {
      try {
        await adminUpdateUser(user.id, { enabled: enabledBox.checked });
        await renderAdminPanel();
      } catch (e) {
        enabledBox.checked = !enabledBox.checked;
        setStatus($("account-status"), e.message, true);
      }
    };
    inviteBox.onchange = async () => {
      try {
        await adminUpdateUser(user.id, { canCreateInvites: inviteBox.checked });
        await renderAdminPanel();
      } catch (e) {
        inviteBox.checked = !inviteBox.checked;
        setStatus($("account-status"), e.message, true);
      }
    };
    row.append(who, enabled, invites);
    host.append(row);
  }
}

async function refreshAccountModule() {
  try {
    const state = await accountStatus();
    accountStateCache = state;
    $("register-invite-label").classList.toggle("hidden", !!state.setupRequired);
    $("register-help").textContent = state.setupRequired
      ? "No account exists yet. The first successful registration becomes the seed administrator and does not need an invitation."
      : "Registration requires a single-use invitation code from an existing user.";
    $("account-signed-out").classList.toggle("hidden", !!state.authenticated);
    $("account-signed-in").classList.toggle("hidden", !state.authenticated);
    if (!state.authenticated) {
      setStatus($("account-status"), state.system?.systemEnabled === false ? "Server use is currently disabled by the administrator." : "Not logged in.");
      return;
    }
    $("account-name").textContent = state.user.displayName || state.user.username;
    $("account-role").textContent = `@${state.user.username} · ${state.user.role}`;
    setStatus($("account-status"), state.system?.systemEnabled === false ? "Server use is disabled for normal users; administrator controls remain available." : "Logged in.");
    await adoptAccountAuthor(state.user);
    const tasks = [renderInvites(), renderContactGroups(), renderGroupChatList(), renderAdminPanel()];
    await Promise.all(tasks.map((x) => x.catch((e) => setStatus($("account-status"), e.message, true))));
  } catch (e) {
    accountStateCache = null;
    $("account-signed-out").classList.remove("hidden");
    $("account-signed-in").classList.add("hidden");
    setStatus($("account-status"), `Account service unavailable: ${e.message}`, true);
  }
}

function initAccountUi() {
  $("register-form").onsubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await registerAccount({
        username: $("register-username").value,
        displayName: $("register-display").value,
        password: $("register-password").value,
        inviteCode: $("register-invite").value,
      });
      await adoptAccountAuthor(data.user);
      $("register-password").value = "";
      $("register-invite").value = "";
      await refreshAccountModule();
      setStatus($("account-status"), data.firstAdmin ? "Seed administrator account created." : "Account created and logged in.");
    } catch (err) {
      setStatus($("account-status"), err.message, true);
    }
  };
  $("login-form").onsubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginAccount({ username: $("login-username").value, password: $("login-password").value });
      await adoptAccountAuthor(data.user);
      $("login-password").value = "";
      await refreshAccountModule();
      await renderFeed();
    } catch (err) {
      setStatus($("account-status"), err.message, true);
    }
  };
  $("logout").onclick = async () => {
    try { await logoutAccount(); } catch {}
    await refreshAccountModule();
    await renderFeed();
  };
  $("create-invite").onclick = async () => {
    try {
      const data = await createInvite();
      await renderInvites();
      setStatus($("account-status"), `Invitation created: ${data.item.code}`);
    } catch (e) { setStatus($("account-status"), e.message, true); }
  };
  $("contact-group-form").onsubmit = async (e) => {
    e.preventDefault();
    try {
      await saveContactGroup({ name: $("contact-group-name").value, memberUsernames: usernamesFromInput($("contact-group-members").value) });
      $("contact-group-name").value = "";$("contact-group-members").value = "";
      await renderContactGroups();
    } catch (err) { setStatus($("account-status"), err.message, true); }
  };
  $("load-dm").onclick = () => loadDirectMessageThread().catch((e) => setStatus($("account-status"), e.message, true));
  $("dm-form").onsubmit = async (e) => {
    e.preventDefault();
    try {
      const user = $("dm-user").value.trim(), body = $("dm-body").value.trim();
      if (!user || !body) throw new Error("Choose a username and enter a message.");
      await sendDirectMessage(user, body);$("dm-body").value = "";await loadDirectMessageThread();
    } catch (err) { setStatus($("account-status"), err.message, true); }
  };
  $("group-chat-create").onsubmit = async (e) => {
    e.preventDefault();
    try {
      const chat = await createGroupChat($("group-chat-name").value.trim() || "XT Group Chat", usernamesFromInput($("group-chat-members").value));
      $("group-chat-name").value = "";$("group-chat-members").value = "";
      await renderGroupChatList();setStatus($("account-status"), `Group chat created: ${chat.url}`);
    } catch (err) { setStatus($("account-status"), err.message, true); }
  };
  $("group-chat-grant").onsubmit = async (e) => {
    e.preventDefault();
    try {
      await grantGroupChat($("group-grant-code").value.trim(), $("group-grant-user").value.trim());
      $("group-grant-user").value = "";await renderGroupChatList();setStatus($("account-status"), "Group chat access granted.");
    } catch (err) { setStatus($("account-status"), err.message, true); }
  };
  $("admin-system-enabled").onchange = async () => {
    try { await adminSetSystemEnabled($("admin-system-enabled").checked);await refreshAccountModule(); }
    catch (e) { $("admin-system-enabled").checked = !$("admin-system-enabled").checked;setStatus($("account-status"), e.message, true); }
  };
  $("admin-invites-enabled").onchange = async () => {
    try { await adminSetInvitesEnabled($("admin-invites-enabled").checked);await refreshAccountModule(); }
    catch (e) { $("admin-invites-enabled").checked = !$("admin-invites-enabled").checked;setStatus($("account-status"), e.message, true); }
  };
}

function exportMetadata(items) {
  const blob = new Blob([JSON.stringify(items, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `xtratype-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

const PRIMARY_ORDER_KEY = "xtratypePrimaryOrder";

function applyPrimaryOrder(order) {
  const stack = $("primary-stack");
  if (!stack) return;
  const allowed = ["author", "annotations"];
  const normalized = Array.isArray(order)
    ? order.filter((x) => allowed.includes(x))
    : [];
  for (const x of allowed) if (!normalized.includes(x)) normalized.push(x);
  for (const name of normalized) {
    const el = stack.querySelector(`[data-primary-section="${name}"]`);
    if (el) stack.append(el);
  }
}

async function loadPrimaryOrder() {
  const stored = await chrome.storage.local.get(PRIMARY_ORDER_KEY);
  applyPrimaryOrder(stored[PRIMARY_ORDER_KEY]);
}

async function savePrimaryOrder() {
  const order = [...$("primary-stack").children]
    .map((el) => el.dataset.primarySection)
    .filter(Boolean);
  await chrome.storage.local.set({ [PRIMARY_ORDER_KEY]: order });
}

function swapPrimarySections(sourceName, targetName) {
  if (!sourceName || !targetName || sourceName === targetName) return;
  const stack = $("primary-stack"),
    source = stack.querySelector(`[data-primary-section="${sourceName}"]`),
    target = stack.querySelector(`[data-primary-section="${targetName}"]`);
  if (!source || !target) return;
  const children = [...stack.children];
  if (children.indexOf(source) < children.indexOf(target))
    stack.insertBefore(target, source);
  else stack.insertBefore(source, target);
  savePrimaryOrder().catch(() => {});
}

function initPrimaryReorder() {
  let dragging = null;
  const stack = $("primary-stack");
  for (const handle of stack.querySelectorAll(".drag-handle")) {
    const name = handle.dataset.dragSection;
    handle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    handle.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      e.stopPropagation();
      const other = name === "author" ? "annotations" : "author";
      swapPrimarySections(name, other);
    });
    handle.addEventListener("dragstart", (e) => {
      dragging = name;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", name);
      handle.closest("[data-primary-section]")?.classList.add("dragging");
    });
    handle.addEventListener("dragend", () => {
      dragging = null;
      for (const el of stack.querySelectorAll("[data-primary-section]"))
        el.classList.remove("dragging", "drag-over");
    });
  }
  for (const item of stack.querySelectorAll("[data-primary-section]")) {
    item.addEventListener("dragover", (e) => {
      if (!dragging || dragging === item.dataset.primarySection) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      item.classList.add("drag-over");
    });
    item.addEventListener("dragleave", () => item.classList.remove("drag-over"));
    item.addEventListener("drop", (e) => {
      e.preventDefault();
      item.classList.remove("drag-over");
      const source = dragging || e.dataTransfer.getData("text/plain");
      swapPrimarySections(source, item.dataset.primarySection);
    });
  }
}

$("target-kind").onchange = () => {
  renderTargetFields();
  renderFeed();
};
$("refresh-context").onclick = () =>
  refreshContext().catch((e) =>
    setStatus($("composer-status"), e.message, true),
  );
$("pull-annotations").onclick = (e) => {
  e.preventDefault();
  e.stopPropagation();
  pull();
};
$("mark-all-old").onclick = (e) => {
  e.preventDefault();
  e.stopPropagation();
  markAllCurrentTargetOld().catch((err) =>
    setStatus($("composer-status"), err.message, true),
  );
};
$("launch-quick-bar").onclick = async () => {
  const res = await chrome.runtime
    .sendMessage({ type: "xtratype:openQuickBar" })
    .catch((e) => ({ ok: false, error: e.message }));
  if (!res?.ok)
    setStatus(
      $("composer-status"),
      res?.error || "Could not open quick bar.",
      true,
    );
};
$("composer").onsubmit = (e) => {
  e.preventDefault();
  saveAnnotation().catch((err) =>
    setStatus($("composer-status"), err.message, true),
  );
};
$("clear-composer").onclick = () => {
  $("comment").value = "";
  $("highlighted-text").value = "";
  selectedFiles = [];
  $("images").value = "";
  dirty = false;
  renderPreviews();
};
$("images").onchange = () => {
  try {
    const incoming = [...$("images").files];
    validateFiles(incoming);
    selectedFiles = incoming;
    dirty = true;
    renderPreviews();
    setStatus($("composer-status"), "");
  } catch (e) {
    setStatus($("composer-status"), e.message, true);
  }
};
$("snapshot-quick").onclick = async () => {
  const mode = (await settings()).quickSnapshotMode || "full";
  takeSnapshot(mode === "full");
};
$("quick-snapshot-mode").onchange = async () => {
  try {
    const current = await settings();
    await saveSettings({ ...current, quickSnapshotMode: $("quick-snapshot-mode").value });
    setStatus($("capture-status"), `Top snapshot button set to ${$("quick-snapshot-mode").value === "full" ? "full page" : "visible viewport"}.`);
  } catch (e) {
    setStatus($("capture-status"), e.message, true);
  }
};
$("capture-visible").onclick = () => takeSnapshot(false);
$("capture-full").onclick = () => takeSnapshot(true);
$("compare-latest").onclick = () =>
  compareLatest().catch((e) => setStatus($("capture-status"), e.message, true));
$("schema-file").onchange = () => {
  const f = $("schema-file").files[0];
  if (f)
    installSchema(f).catch((e) =>
      setStatus($("schema-status"), e.message, true),
    );
};
$("settings-form").onsubmit = async (e) => {
  e.preventDefault();
  try {
    const current = await settings();
    await saveSettings({
      ...current,
      apiBase: $("api-base").value,
      author: $("author").value || "Local user",
      defaultGpsRadius: Number($("gps-radius").value),
      autoSync: $("auto-sync").checked,
    });
    setStatus($("settings-status"), "Settings saved.");
  } catch (e) {
    setStatus($("settings-status"), e.message, true);
  }
};
$("test-server").onclick = async () => {
  try {
    const h = await serverHealth();
    setStatus($("settings-status"), `Connected · ${h.service}`);
  } catch (e) {
    setStatus($("settings-status"), e.message, true);
  }
};
$("export-local").onclick = async () =>
  exportMetadata({
    exportedAt: new Date().toISOString(),
    annotations: await all("annotations"),
    schemas: await all("schemas"),
    snapshots: await all("snapshots"),
    events: await all("events"),
  });

let feedTimer;
$("composer").addEventListener("input", () => {
  dirty = true;
  clearTimeout(feedTimer);
  feedTimer = setTimeout(
    () =>
      renderFeed().catch((e) =>
        setStatus($("composer-status"), e.message, true),
      ),
    180,
  );
});
$("composer").addEventListener("change", () => {
  dirty = true;
});
$("account-module").addEventListener("toggle", () => {
  if ($("account-module").open) refreshAccountModule().catch(() => {});
});
$("annotations-module").addEventListener("toggle", () => {
  if ($("annotations-module").open)
    renderFeed().catch((e) => setStatus($("composer-status"), e.message, true));
});
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && $("annotations-module").open)
    renderFeed().catch(() => {});
});
chrome.runtime.onMessage.addListener((message, sender) => {
  if (sender.id !== chrome.runtime.id) return;
  if (
    context?.windowId != null &&
    message?.windowId != null &&
    context.windowId !== message.windowId
  )
    return;
  if (message?.type === "xtratype:beginAnnotation") {
    beginAnnotationFromTrigger(message.tabId, message.commentText || "").catch((e) =>
      setStatus($("composer-status"), e.message, true),
    );
    return;
  }
  if (message?.type === "xtratype:contextChanged")
    return scheduleContextRefresh(message.tabId);
  if (message?.type === "xtratype:annotationsUpdated")
    renderFeed().catch((e) => setStatus($("composer-status"), e.message, true));
});
try {
  await loadPrimaryOrder();
  initPrimaryReorder();
  initAccountUi();
  await loadSettingsForm();
  await refreshContext();
  await consumeComposeRequest();
} catch (e) {
  setStatus($("composer-status"), "Initialization failed: " + e.message, true);
}
