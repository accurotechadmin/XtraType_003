import {
  parseUrlTarget,
  makeGpsTarget,
  makeYoutubeTarget,
  makeTimeTarget,
  targetKey,
  haversineMeters,
} from "./core/anchors.js";
import {
  normalizeCustomSchema,
  validateCustomValue,
  readPrimitiveInput,
} from "./core/schemas.js";
const $ = (id) => document.getElementById(id);
let schemas = [],
  files = [],
  position = null,
  posting = false,
  postId = null,
  previews = [],
  feedGeneration = 0,
  webAuth = (() => {
    try { return JSON.parse(localStorage.getItem("xtratypeWebAuth") || "null"); }
    catch { return null; }
  })();
const safe = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const kind = (s) => s?.["x-xtratype"]?.kind || "custom";
const label = (s) => s?.["x-xtratype"]?.label || s?.title || s?.$id || "";
function status(el, text, error = false) {
  el.textContent = text;
  el.classList.toggle("error", error);
}
function localDateTimeValue(value = new Date()) {
  const d = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function timeSuffix(target) {
  if (target?.kind !== "time") return "";
  const v = target.value || {};
  if (v.timestamp) return ` · ${new Date(v.timestamp).toLocaleString()}`;
  if (v.startTime && v.endTime)
    return ` · ${new Date(v.startTime).toLocaleString()} – ${new Date(v.endTime).toLocaleString()}`;
  return "";
}
async function request(path, options = {}) {
  const c = new AbortController(),
    timer = setTimeout(() => c.abort(), 30000),
    { noAuth = false, headers: suppliedHeaders = {}, ...fetchOptions } = options,
    headers = { "X-XtraType-Client": "web", ...suppliedHeaders };
  if (!noAuth && webAuth?.token) headers.Authorization = `Bearer ${webAuth.token}`;
  try {
    const r = await fetch(`api/${path}`, {
      ...fetchOptions,
      headers,
      signal: c.signal,
      redirect: "error",
    });
    let d;
    try {
      d = await r.json();
    } catch {
      throw new Error(`Invalid server response (${r.status}).`);
    }
    if (!r.ok || !d?.ok)
      throw new Error(d?.message || `Request failed (${r.status}).`);
    return d;
  } catch (e) {
    if (e.name === "AbortError")
      throw new Error(
        "Server timed out. Draft retained; retry uses the same note ID.",
      );
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

function saveWebAuth(value) {
  webAuth = value;
  if (value) localStorage.setItem("xtratypeWebAuth", JSON.stringify(value));
  else localStorage.removeItem("xtratypeWebAuth");
}
async function refreshWebAccount() {
  const d = await request("auth.php");
  if (!d.authenticated && webAuth) saveWebAuth(null);
  $("web-account-pill").textContent = d.authenticated ? `@${d.user.username}` : d.setupRequired ? "first registration" : "logged out";
  $("web-auth-out").classList.toggle("hidden", !!d.authenticated);
  $("web-auth-in").classList.toggle("hidden", !d.authenticated);
  $("web-reg-invite-label").classList.toggle("hidden", !!d.setupRequired);
  $("web-register-help").textContent = d.setupRequired ? "The first successful registration becomes the seed administrator; no invitation is required." : "Registration requires a single-use invitation code.";
  if (d.authenticated) $("web-account-name").textContent = `${d.user.displayName || d.user.username} (@${d.user.username})`;
  status($("web-account-status"), d.system?.systemEnabled === false ? "Server use is currently disabled by the administrator." : d.authenticated ? "Authenticated." : "Log in or register to use an initialized multi-user server.");
  return d;
}
async function webRegister() {
  const d = await request("auth.php", { method: "POST", noAuth: true, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "register", username: $("web-reg-user").value, displayName: $("web-reg-display").value, password: $("web-reg-pass").value, inviteCode: $("web-reg-invite").value }) });
  saveWebAuth({ token: d.session.token, expiresAt: d.session.expiresAt, user: d.user });
  $("web-reg-pass").value = "";$("web-reg-invite").value = "";
  await refreshWebAccount();await loadSchemas();await loadFeed();
}
async function webLogin() {
  const d = await request("auth.php", { method: "POST", noAuth: true, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "login", username: $("web-login-user").value, password: $("web-login-pass").value }) });
  saveWebAuth({ token: d.session.token, expiresAt: d.session.expiresAt, user: d.user });
  $("web-login-pass").value = "";await refreshWebAccount();await loadSchemas();await loadFeed();
}
async function webLogout() {
  try { await request("auth.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) }); } catch {}
  saveWebAuth(null);await refreshWebAccount();
}
async function loadSchemas() {
  const d = await request("schemas.php");
  if (!Array.isArray(d.items)) throw new Error("Invalid schema catalog.");
  schemas = d.items;
  const sel = $("target-kind"),
    prior = sel.value;
  sel.replaceChildren(
    ...schemas.map((s) => {
      const o = document.createElement("option");
      o.value = s.$id;
      o.textContent = label(s);
      return o;
    }),
  );
  if (prior && schemas.some((s) => s.$id === prior)) sel.value = prior;
  if (!$("target-fields").children.length || prior !== sel.value)
    renderTarget();
  renderSchemas();
}
function renderTarget() {
  const s = schemas.find((x) => x.$id === $("target-kind").value),
    k = kind(s),
    h = $("target-fields");
  h.replaceChildren();
  if (!s) return;
  if (k === "url") {
    h.innerHTML =
      '<label>URL<input id="u-url" type="url" placeholder="https://example.com/path"></label><label>Query handling<select id="u-mode"><option value="ignore">Ignore</option><option value="selected">Selected</option><option value="all">All</option></select></label><div id="u-params"></div><label>Fragment<select id="u-fragment"><option value="ignore">Ignore</option><option value="include">Include</option></select></label><button type="button" id="parse-url">Extract URL variables</button>';
    $("parse-url").onclick = () => {
      try {
        const t = parseUrlTarget($("u-url").value),
          v = t.value;
        $("u-params").replaceChildren();
        for (const p of v.queryParameters) {
          const row = document.createElement("div");
          row.className = "query-row";
          row.innerHTML = `<input class="inc" type="checkbox" aria-label="Include query parameter"><input class="key" value="${safe(p.key)}" aria-label="Query key"><input class="val" value="${safe(p.value)}" aria-label="Query value">`;
          $("u-params").append(row);
        }
        $("u-url").value = v.url + (v.fragment ? "#" + v.fragment : "");
      } catch (e) {
        status($("post-status"), e.message, true);
      }
    };
    return;
  }
  if (k === "gps") {
    h.innerHTML =
      '<div class="two"><label>Latitude<input id="g-lat" type="number" step="any"></label><label>Longitude<input id="g-lon" type="number" step="any"></label></div><div class="two"><label>Radius meters (optional)<input id="g-r" type="number" min="1"></label><label>Label<input id="g-label"></label></div><button type="button" id="g-here">Use my location</button>';
    $("g-here").onclick = () => locate(true);
    if (position) {
      $("g-lat").value = position.coords.latitude;
      $("g-lon").value = position.coords.longitude;
    }
    return;
  }
  if (k === "time") {
    const now = localDateTimeValue();
    h.innerHTML = `<label>Time anchor type<select id="t-mode"><option value="moment">Single moment</option><option value="range">Timeframe / range</option></select></label><div id="t-moment"><label>Timestamp<input id="t-at" type="datetime-local" step="1" value="${safe(now)}"></label><button type="button" id="t-now">Use current time</button></div><div id="t-range" class="hidden"><div class="two"><label>Start time<input id="t-start" type="datetime-local" step="1" value="${safe(now)}"></label><label>End time<input id="t-end" type="datetime-local" step="1"></label></div><div class="actions"><button type="button" id="t-start-now">Start now</button><button type="button" id="t-end-now">End now</button></div></div><p class="muted">Time anchors are generic and are not attached to a URL, location, or video.</p>`;
    const toggle = () => {
      const range = $("t-mode").value === "range";
      $("t-moment").classList.toggle("hidden", range);
      $("t-range").classList.toggle("hidden", !range);
    };
    $("t-mode").onchange = toggle;
    $("t-now").onclick = () => ($("t-at").value = localDateTimeValue());
    $("t-start-now").onclick = () => ($("t-start").value = localDateTimeValue());
    $("t-end-now").onclick = () => ($("t-end").value = localDateTimeValue());
    toggle();
    return;
  }
  if (k === "youtube") {
    h.innerHTML =
      '<label>YouTube URL<input id="y-url" type="url" placeholder="https://www.youtube.com/watch?v=..."></label><div class="two"><label>Start seconds (optional)<input id="y-start" type="number" min="0" step="any"></label><label>End seconds (optional)<input id="y-end" type="number" min="0" step="any"></label></div>';
    return;
  }
  for (const [name, def] of Object.entries(s.properties || {})) {
    const l = document.createElement("label");
    l.textContent = def.title || name;
    let i;
    if (def.enum) {
      i = document.createElement("select");
      for (const [index, v] of def.enum.entries()) {
        const o = document.createElement("option");
        o.value = index;
        o.textContent = String(v);
        i.append(o);
      }
    } else {
      i = document.createElement("input");
      const ts = Array.isArray(def.type) ? def.type : [def.type];
      i.type =
        ts.includes("number") || ts.includes("integer")
          ? "number"
          : ts.includes("boolean")
            ? "checkbox"
            : "text";
      if (i.type === "number") i.step = ts.includes("integer") ? "1" : "any";
      if (def.minimum != null) i.min = def.minimum;
      if (def.maximum != null) i.max = def.maximum;
    }
    i.dataset.field = name;
    l.append(i);
    h.append(l);
  }
}
function getTarget() {
  const s = schemas.find((x) => x.$id === $("target-kind").value),
    k = kind(s);
  if (!s) throw new Error("Choose an available target.");
  if (k === "url") {
    const t = parseUrlTarget($("u-url").value);
    t.value.queryMode = $("u-mode").value;
    t.value.fragmentMode = $("u-fragment").value;
    if (t.value.queryParameters.length && t.value.queryMode === "selected")
      throw new Error(
        "Extract URL variables, then select the parameters to include.",
      );
    const rows = [...$("u-params").querySelectorAll(".query-row")];
    if (!t.value.queryParameters.length && rows.length)
      t.value.queryParameters = rows.map((r) => ({
        key: r.querySelector(".key").value,
        value: r.querySelector(".val").value,
        include: r.querySelector(".inc").checked,
      }));
    return t;
  }
  if (k === "gps")
    return makeGpsTarget(
      $("g-lat").value,
      $("g-lon").value,
      $("g-r").value,
      $("g-label").value,
    );
  if (k === "time")
    return $("t-mode").value === "range"
      ? makeTimeTarget(null, $("t-start").value, $("t-end").value)
      : makeTimeTarget($("t-at").value);
  if (k === "youtube")
    return makeYoutubeTarget(
      $("y-url").value,
      $("y-start").value,
      $("y-end").value,
    );
  const value = {};
  for (const i of $("target-fields").querySelectorAll("[data-field]")) {
    const v = readPrimitiveInput(i, s.properties[i.dataset.field]);
    if (v !== undefined) value[i.dataset.field] = v;
  }
  validateCustomValue(normalizeCustomSchema(s), value);
  return { kind: "custom", schemaId: s.$id, value };
}
function validateFiles() {
  if (files.length > 3) throw new Error("At most three images.");
  for (const f of files)
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(f.type) ||
      f.size > 8388608 ||
      !f.size
    )
      throw new Error("Images must be PNG/JPEG/WebP up to 8 MiB.");
}
async function post() {
  if (posting) return;
  posting = true;
  const button = $("post-form").querySelector("[type=submit]");
  button.disabled = true;
  try {
    validateFiles();
    const t = getTarget(),
      body = $("body").value.trim();
    if (!body || new TextEncoder().encode(body).length > 80000)
      throw new Error("Comment required, at most 80,000 UTF-8 bytes.");
    postId ??= `annotation:${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const p = {
      id: postId,
      recordType: "Context.Annotation",
      schemaVersion: 2,
      target: t,
      targetKey: targetKey(t),
      highlightedText: $("highlighted").value,
      body,
      attachments: [],
      parentAnnotationId: null,
      author: "Web user",
      createdAt: now,
      updatedAt: now,
      syncState: "synced",
    };
    const form = new FormData();
    form.append("payload", JSON.stringify(p));
    for (const f of files) form.append("images[]", f, f.name);
    await request("annotations.php", { method: "POST", body: form });
    $("body").value = "";
    $("highlighted").value = "";
    $("images").value = "";
    files = [];
    postId = null;
    renderPreviews();
    status($("post-status"), "Posted.");
    try {
      await loadFeed();
    } catch (e) {
      status(
        $("post-status"),
        "Posted; feed refresh failed: " + e.message,
        true,
      );
    }
  } catch (e) {
    status($("post-status"), e.message, true);
  } finally {
    posting = false;
    button.disabled = false;
  }
}
async function loadFeed() {
  const token = ++feedGeneration,
    d = await request("annotations.php");
  if (token !== feedGeneration) return;
  if (!Array.isArray(d.items)) throw new Error("Invalid annotation feed.");
  renderFeed($("feed"), d.items);
  renderNearby(d.items);
}
function renderFeed(host, items) {
  host.replaceChildren();
  for (const a of items) {
    const n = document.createElement("article");
    n.className = "note";
    const secs =
      a.target?.kind === "youtube" ? a.target.value.startSeconds : null;
    const suffix =
      secs == null
        ? timeSuffix(a.target)
        : ` · ${Math.floor(secs / 60)}:${String(Math.floor(secs % 60)).padStart(2, "0")}`;
    n.innerHTML = `<div class="meta"><span>${safe(a.author || "User")} · ${safe(a.target?.kind || "custom")}${safe(suffix)}</span><span>${safe(new Date(a.createdAt).toLocaleString())}</span></div>${a.highlightedText ? `<div class="quote">${safe(a.highlightedText)}</div>` : ""}<div class="body">${safe(a.body)}</div><div class="thumbs"></div>`;
    for (const at of a.attachments || []) {
      const src = at.url || at.serverUrl;
      if (!src || !/^\/media\/[\w./-]+$/.test(src) || src.includes(".."))
        continue;
      const image = document.createElement("img");
      image.src = src;
      image.alt = at.name || "Annotation image";
      image.loading = "lazy";
      n.querySelector(".thumbs").append(image);
    }
    host.append(n);
  }
  if (!items.length) host.innerHTML = '<p class="muted">Nothing here yet.</p>';
}
function renderNearby(items) {
  if (!position) {
    $("nearby-list").innerHTML =
      '<p class="muted">Use location to evaluate GPS gates.</p>';
    return;
  }
  const { latitude: lat, longitude: lon } = position.coords;
  const radius = Number(document.body.dataset.defaultRadius) || 75;
  renderFeed(
    $("nearby-list"),
    items.filter(
      (a) =>
        a.target?.kind === "gps" &&
        haversineMeters(
          lat,
          lon,
          a.target.value.latitude,
          a.target.value.longitude,
        ) <= Number(a.target.value.radiusMeters || radius),
    ),
  );
  $("location-state").textContent = `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
}
function locate(intoForm = false) {
  navigator.geolocation.getCurrentPosition(
    (p) => {
      position = p;
      if (intoForm && $("g-lat")) {
        $("g-lat").value = p.coords.latitude;
        $("g-lon").value = p.coords.longitude;
      }
      loadFeed().catch((e) => status($("location-state"), e.message, true));
    },
    (e) => status($("location-state"), e.message, true),
    { enableHighAccuracy: true, timeout: 10000 },
  );
}
function renderPreviews() {
  previews.forEach(URL.revokeObjectURL);
  previews = [];
  $("previews").replaceChildren();
  for (const f of files) {
    const i = document.createElement("img");
    i.src = URL.createObjectURL(f);
    previews.push(i.src);
    i.alt = f.name;
    $("previews").append(i);
  }
}
function renderSchemas() {
  $("schemas").replaceChildren();
  for (const s of schemas) {
    const d = document.createElement("div");
    d.className = "schema";
    d.innerHTML = `<b>${safe(label(s))}</b><br><code>${safe(s.$id)}</code><div class="muted">${safe(Object.keys(s.properties || {}).join(", "))}</div>`;
    $("schemas").append(d);
  }
}
async function installSchema(f) {
  if (f.size > 262144) throw new Error("Schema exceeds 256 KiB.");
  const s = normalizeCustomSchema(JSON.parse(await f.text()));
  await request("schemas.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ schema: s }),
  });
  status($("schema-status"), "Schema installed.");
  await loadSchemas();
}
for (const b of document.querySelectorAll("nav button"))
  b.onclick = () => {
    document.querySelectorAll("nav button").forEach((x) => {
      x.classList.toggle("active", x === b);
      x.setAttribute("aria-selected", String(x === b));
    });
    document
      .querySelectorAll(".tab")
      .forEach((t) =>
        t.classList.toggle("active", t.id === `tab-${b.dataset.tab}`),
      );
    if (b.dataset.tab === "nearby") locate();
  };
$("target-kind").onchange = () => {
  postId = null;
  renderTarget();
};
$("locate").onclick = () => locate();
$("refresh").onclick = () =>
  loadFeed().catch((e) => status($("feed-status"), e.message, true));
$("post-form").onsubmit = (e) => {
  e.preventDefault();
  post();
};
$("post-form").addEventListener("input", () => {
  postId = null;
});
$("images").onchange = () => {
  files = [...$("images").files];
  try {
    validateFiles();
    renderPreviews();
  } catch (e) {
    files = [];
    $("images").value = "";
    renderPreviews();
    status($("post-status"), e.message, true);
  }
};
$("web-register").onsubmit = (e) => { e.preventDefault();webRegister().catch((err) => status($("web-account-status"), err.message, true)); };
$("web-login").onsubmit = (e) => { e.preventDefault();webLogin().catch((err) => status($("web-account-status"), err.message, true)); };
$("web-logout").onclick = () => webLogout().catch((err) => status($("web-account-status"), err.message, true));
$("schema-file").onchange = () => {
  const f = $("schema-file").files[0];
  if (f)
    installSchema(f).catch((e) => status($("schema-status"), e.message, true));
};
window.addEventListener("pagehide", () =>
  previews.forEach(URL.revokeObjectURL),
);
try {
  const account = await refreshWebAccount();
  if (account.setupRequired || account.authenticated) {
    await loadSchemas();
    await loadFeed();
  } else {
    status($("post-status"), "Log in under Account before using this initialized server.", true);
  }
} catch (e) {
  status($("post-status"), "Server unavailable: " + e.message, true);
}
