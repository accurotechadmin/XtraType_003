import { get, all, updateRecord } from "./db.js";

const AUTH_KEY = "xtratypeAuth";

export function normalizeBase(raw) {
  const u = new URL(raw);
  if (
    !["http:", "https:"].includes(u.protocol) ||
    u.username ||
    u.password ||
    u.search ||
    u.hash
  )
    throw new Error(
      "API base must be an HTTP(S) URL without credentials, query or fragment.",
    );
  return u.href.replace(/\/+$/, "");
}
export async function settings() {
  const stored = await chrome.storage.local.get("xtratypeSettings");
  return {
    apiBase: "http://localhost:8787/api",
    author: "Local user",
    defaultGpsRadius: 75,
    autoSync: true,
    quickSnapshotMode: "full",
    ...stored.xtratypeSettings,
  };
}
export async function saveSettings(next) {
  const current = await settings();
  next = { ...current, ...next, apiBase: normalizeBase(next.apiBase || current.apiBase) };
  if (!Number.isFinite(next.defaultGpsRadius) || next.defaultGpsRadius <= 0)
    throw new Error("Default radius must be positive.");
  if (!["full", "visible"].includes(next.quickSnapshotMode))
    throw new Error("Quick snapshot mode must be full or visible.");
  if (
    normalizeBase(current.apiBase) !== next.apiBase &&
    ((await all("annotations")).length || (await all("snapshots")).length)
  )
    throw new Error(
      "Server changes with existing data are blocked to prevent cross-server media and ID mixing. Keep this server or use a separate Chrome profile.",
    );
  await chrome.storage.local.set({ xtratypeSettings: next });
  return next;
}
export async function authSession() {
  const stored = await chrome.storage.local.get(AUTH_KEY);
  return stored?.[AUTH_KEY] && typeof stored[AUTH_KEY] === "object"
    ? stored[AUTH_KEY]
    : null;
}
export async function saveAuthSession(session) {
  if (!session) await chrome.storage.local.remove(AUTH_KEY);
  else await chrome.storage.local.set({ [AUTH_KEY]: session });
  return session;
}
export async function clearAuthSession() {
  await chrome.storage.local.remove(AUTH_KEY);
}
async function api(path, options = {}, base) {
  base = normalizeBase(base || (await settings()).apiBase);
  const { noAuth = false, headers: suppliedHeaders = {}, ...fetchOptions } = options;
  const auth = noAuth ? null : await authSession();
  const headers = { "X-XtraType-Client": "chrome-extension", ...suppliedHeaders };
  if (auth?.token) headers.Authorization = `Bearer ${auth.token}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(`${base}/${path}`, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
      credentials: "omit",
      redirect: "error",
    });
    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error(`Server returned invalid JSON (${res.status}).`);
    }
    if (!res.ok || !data?.ok)
      throw new Error(data?.message || `Server returned ${res.status}.`);
    return data;
  } catch (e) {
    if (e.name === "AbortError")
      throw new Error("Server timed out. Local data is retained; retry sync.");
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
export function mergeRemote(local, remote, base) {
  if (
    local &&
    (local.syncState !== "synced" ||
      (local.syncBase && local.syncBase !== base))
  )
    return local;
  return {
    ...local,
    ...remote,
    syncState: "synced",
    syncBase: base,
    attachments: (remote.attachments || []).map((r) => {
      const old = (local?.attachments || []).find((a) => a.id === r.id);
      return {
        ...r,
        ...(old?.blobId ? { blobId: old.blobId } : {}),
        serverUrl: r.serverUrl || r.url,
        serverBase: base,
      };
    }),
  };
}
export async function pullAnnotations() {
  const base = normalizeBase((await settings()).apiBase);
  const items = (await api("annotations.php", {}, base)).items;
  if (!Array.isArray(items)) throw new Error("Invalid annotation feed.");
  for (const a of items) {
    if (
      !a?.id ||
      a.recordType !== "Context.Annotation" ||
      a.schemaVersion !== 2 ||
      !a.target ||
      !Array.isArray(a.attachments)
    )
      continue;
    await updateRecord("annotations", a.id, (local) =>
      mergeRemote(local, a, base),
    );
  }
  return items;
}
const locks = new Map();
export async function syncAnnotation(annotation) {
  if (locks.has(annotation.id)) return locks.get(annotation.id);
  const task = syncOne(annotation).finally(() => locks.delete(annotation.id));
  locks.set(annotation.id, task);
  return task;
}
async function syncOne(annotation) {
  const base = normalizeBase((await settings()).apiBase);
  const current = (await get("annotations", annotation.id)) || annotation;
  try {
    if (current.syncBase && current.syncBase !== base)
      throw new Error("Annotation belongs to another server.");
    const form = new FormData(),
      wire = { ...current };
    delete wire.syncError;
    delete wire.syncBase;
    wire.attachments = [];
    for (const at of current.attachments || []) {
      if (at.serverBase && at.serverBase !== base)
        throw new Error("Image belongs to another server.");
      const br = at.blobId ? await get("blobs", at.blobId) : null;
      if (br?.blob) {
        wire.attachments.push({
          id: at.id,
          name: at.name,
          type: at.type,
          size: at.size,
          upload: true,
        });
        form.append("images[]", br.blob, at.name || "image");
      } else if (at.serverUrl || at.url) {
        wire.attachments.push({
          id: at.id,
          name: at.name,
          type: at.type,
          size: at.size,
          url: at.serverUrl || at.url,
        });
      } else
        throw new Error(
          `Local image is missing: ${at.name || at.id}. Record remains unsynced.`,
        );
    }
    form.append("payload", JSON.stringify(wire));
    const remote = (
      await api("annotations.php", { method: "POST", body: form }, base)
    ).item;
    if (
      remote?.id !== current.id ||
      !Array.isArray(remote.attachments) ||
      remote.attachments.length !== current.attachments.length
    )
      throw new Error(
        "Server response did not preserve the annotation attachments.",
      );
    return await updateRecord("annotations", current.id, (local) => {
      if (local && local.updatedAt !== current.updatedAt) return local;
      const merged = mergeRemote(
        { ...current, syncState: "synced" },
        remote,
        base,
      );
      delete merged.syncError;
      return merged;
    });
  } catch (e) {
    await updateRecord("annotations", current.id, (local) =>
      local && local.updatedAt === current.updatedAt
        ? { ...local, syncState: "error", syncError: e.message }
        : local,
    );
    throw e;
  }
}
export async function pullSchemas() {
  return (await api("schemas.php")).items || [];
}
export async function pushSchema(schema) {
  return (
    await api("schemas.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schema }),
    })
  ).schema;
}
export async function syncSnapshot(snapshot, blobRecord) {
  const base = normalizeBase((await settings()).apiBase);
  if (snapshot.syncBase && snapshot.syncBase !== base)
    throw new Error("Snapshot belongs to another server.");
  if (!blobRecord?.blob)
    throw new Error("Local screenshot is missing; snapshot remains unsynced.");
  if (blobRecord.blob.size > 8 * 1024 * 1024)
    throw new Error(
      "Screenshot exceeds the 8 MiB server limit; retained locally.",
    );
  const payload = { ...snapshot };
  delete payload.screenshotBlobId;
  delete payload.serverScreenshot;
  delete payload.syncError;
  delete payload.syncBase;
  const form = new FormData();
  form.append("payload", JSON.stringify(payload));
  form.append("screenshot", blobRecord.blob, "snapshot.png");
  return (await api("snapshots.php", { method: "POST", body: form }, base))
    .item;
}
export async function serverHealth() {
  return api("health.php");
}


export async function accountStatus() {
  const data = await api("auth.php");
  if (!data.authenticated && (await authSession())) await clearAuthSession();
  return data;
}
export async function registerAccount({ username, displayName, password, inviteCode }) {
  const data = await api("auth.php", {
    method: "POST",
    noAuth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "register", username, displayName, password, inviteCode }),
  });
  await saveAuthSession({ token: data.session.token, expiresAt: data.session.expiresAt, user: data.user });
  return data;
}
export async function loginAccount({ username, password }) {
  const data = await api("auth.php", {
    method: "POST",
    noAuth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "login", username, password }),
  });
  await saveAuthSession({ token: data.session.token, expiresAt: data.session.expiresAt, user: data.user });
  return data;
}
export async function logoutAccount() {
  try {
    await api("auth.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
  } finally {
    await clearAuthSession();
  }
}
export async function listInvites() { return api("invites.php"); }
export async function createInvite() {
  return api("invites.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
}
export async function adminState() { return api("admin.php"); }
export async function adminSetInvitesEnabled(enabled) {
  return api("admin.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "setInvitesEnabled", enabled: !!enabled }) });
}
export async function adminSetSystemEnabled(enabled) {
  return api("admin.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "setSystemEnabled", enabled: !!enabled }) });
}
export async function adminUpdateUser(userId, changes) {
  return api("admin.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "updateUser", userId, ...changes }) });
}
export async function listContactGroups() { return (await api("contacts.php")).items || []; }
export async function saveContactGroup({ id = null, name, memberUsernames = [] }) {
  return api("contacts.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "save", ...(id ? { id } : {}), name, memberUsernames }) });
}
export async function deleteContactGroup(id) {
  return api("contacts.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", id }) });
}
export async function directMessages(withUsername = "") {
  const q = withUsername ? `?with=${encodeURIComponent(withUsername)}` : "";
  return (await api(`messages.php${q}`)).items || [];
}
export async function sendDirectMessage(recipientUsername, body) {
  return (await api("messages.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipientUsername, body }) })).item;
}
export async function listGroupChats() { return (await api("group-chats.php")).items || []; }
export async function getGroupChat(code) { return api(`group-chats.php?code=${encodeURIComponent(code)}`); }
export async function createGroupChat(name, memberUsernames = []) {
  return (await api("group-chats.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create", name, memberUsernames }) })).chat;
}
export async function grantGroupChat(code, username) {
  return (await api("group-chats.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "grant", code, username }) })).chat;
}
export async function sendGroupChatMessage(code, body) {
  return (await api("group-chats.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "message", code, body }) })).item;
}
