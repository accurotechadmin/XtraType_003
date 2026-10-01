import { createAnnotation } from "./core/records.js";
import { all, get, id, put, logEvent } from "./core/db.js";
import {
  parseUrlTarget,
  makeYoutubeTarget,
  youtubeInfo,
  targetKey,
  urlTargetMatchesPage,
} from "./core/anchors.js";
import { settings, syncAnnotation, pullAnnotations } from "./core/api.js";

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.contextMenus.removeAll().catch(() => {});
  chrome.contextMenus.create({
    id: "xtratype-panel",
    title: "Open XtraType side panel",
    contexts: ["selection", "page", "video", "link"],
  });
  chrome.contextMenus.create({
    id: "xtratype-quick",
    title: "Open XtraType quick comment bar",
    contexts: ["selection", "page", "video", "link"],
  });
  chrome.sidePanel
    .setPanelBehavior?.({ openPanelOnActionClick: true })
    .catch(() => {});
});

// Keep the toolbar action wired directly to Chrome's native side-panel behavior.
// This is more reliable than manually opening the panel from action.onClicked and
// also works on pages where script injection is not available.
chrome.sidePanel
  .setPanelBehavior?.({ openPanelOnActionClick: true })
  .catch(() => {});
chrome.runtime.onStartup.addListener(() => {
  chrome.sidePanel
    .setPanelBehavior?.({ openPanelOnActionClick: true })
    .catch(() => {});
  activeTab().then(updateBadgeForTab).catch(() => {});
});

const COMPOSE_REQUEST_KEY = "xtratypeComposeRequest";

chrome.omnibox?.setDefaultSuggestion?.({
  description: "Begin an XtraType annotation; entered text becomes the comment",
});

chrome.omnibox?.onInputEntered?.addListener((text, _disposition) => {
  // sidePanel.open must be invoked directly from the omnibox user gesture.
  // Open the current window immediately, then resolve its active tab and
  // capture page context/selection for the composer.
  const opened = chrome.sidePanel.open({
    windowId: chrome.windows?.WINDOW_ID_CURRENT ?? -2,
  });
  activeTab()
    .then((tab) => beginAnnotationFromOmnibox(tab, opened, text))
    .catch(() => {});
});

async function activeTab() {
  return (
    (await chrome.tabs.query({ active: true, currentWindow: true }))[0] || null
  );
}

// Ctrl+Q is bound to Manifest V3's reserved "_execute_action" command.
// Chrome therefore handles the shortcut exactly like a toolbar-action click.
// With openPanelOnActionClick enabled above, Chrome owns the native side-panel
// open/close toggle; _execute_action does not dispatch commands.onCommand.

const OLD_KEY = "xtratypeOldAnnotationIds";
const NEW_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const BADGE_PULL_THROTTLE_MS = 15_000;
let lastBadgePullAt = 0;
let badgePullPromise = null;

async function oldMap() {
  const stored = await chrome.storage.local.get(OLD_KEY);
  return stored?.[OLD_KEY] && typeof stored[OLD_KEY] === "object"
    ? stored[OLD_KEY]
    : {};
}

async function saveOldMap(map) {
  if (chrome.storage.local.set)
    await chrome.storage.local.set({ [OLD_KEY]: map });
}

function isRecentAnnotation(annotation, now = Date.now()) {
  const created = Date.parse(annotation?.createdAt || "");
  return Number.isFinite(created) && created >= now - NEW_WINDOW_MS;
}

async function markAnnotationIdsOld(ids) {
  const wanted = new Set(
    (Array.isArray(ids) ? ids : [])
      .filter((x) => typeof x === "string" && x.length <= 512)
      .slice(0, 5000),
  );
  if (!wanted.size) return 0;
  const map = await oldMap(), now = Date.now();
  let changed = 0;
  for (const [id, when] of Object.entries(map))
    if (!Number.isFinite(Number(when)) || Number(when) < now - NEW_WINDOW_MS * 2)
      delete map[id];
  for (const id of wanted)
    if (!map[id]) {
      map[id] = now;
      changed++;
    }
  await saveOldMap(map);
  return changed;
}

async function youngAnnotationsForPage(rawPageUrl) {
  const old = await oldMap(), now = Date.now();
  return (await all("annotations")).filter(
    (a) =>
      isRecentAnnotation(a, now) &&
      !old[a.id] &&
      annotationMatchesPage(a, rawPageUrl),
  );
}

async function markPageAnnotationsOld(rawPageUrl) {
  if (!rawPageUrl) return 0;
  const items = await youngAnnotationsForPage(rawPageUrl);
  return markAnnotationIdsOld(items.map((a) => a.id));
}

async function refreshRemoteAnnotationsForBadge() {
  const now = Date.now();
  if (badgePullPromise) return badgePullPromise;
  if (now - lastBadgePullAt < BADGE_PULL_THROTTLE_MS) return false;
  lastBadgePullAt = now;
  badgePullPromise = (async () => {
    try {
      if (!(await settings()).autoSync) return false;
      await pullAnnotations();
      return true;
    } catch {
      return false;
    } finally {
      badgePullPromise = null;
    }
  })();
  return badgePullPromise;
}


async function updateBadgeForTab(tabOrId = null) {
  if (!chrome.action?.setBadgeText) return 0;
  const tab =
    typeof tabOrId === "number"
      ? await chrome.tabs.get(tabOrId).catch(() => null)
      : tabOrId || (await activeTab());
  if (!tab?.id) return 0;
  let count = 0;
  try {
    const u = new URL(tab.url || "");
    if (/^https?:$/.test(u.protocol))
      count = (await youngAnnotationsForPage(tab.url)).length;
  } catch {}
  const text = count > 99 ? "99+" : count ? String(count) : "";
  await chrome.action.setBadgeText({ tabId: tab.id, text }).catch(() => {});
  if (text && chrome.action.setBadgeBackgroundColor)
    await chrome.action
      .setBadgeBackgroundColor({ tabId: tab.id, color: "#2f9e5b" })
      .catch(() => {});
  return count;
}

async function announceContextChange(tab, reason) {
  if (!tab?.id) return;
  // Tell an already-open panel first so a badge calculation can never delay
  // navigation context refresh. The tab id also lets the panel request the
  // exact active tab in its own window rather than relying on focus heuristics.
  if (chrome.runtime.sendMessage)
    await chrome.runtime
      .sendMessage({
        type: "xtratype:contextChanged",
        tabId: tab.id,
        windowId: tab.windowId,
        pageUrl: tab.url || "",
        reason,
      })
      .catch(() => {});
  const pulled = await refreshRemoteAnnotationsForBadge();
  await updateBadgeForTab(tab).catch(() => {});
  if (pulled && chrome.runtime.sendMessage)
    await chrome.runtime
      .sendMessage({
        type: "xtratype:annotationsUpdated",
        tabId: tab.id,
        windowId: tab.windowId,
      })
      .catch(() => {});
}

chrome.tabs.onActivated?.addListener(({ tabId }) => {
  chrome.tabs
    .get(tabId)
    .then((tab) => announceContextChange(tab, "tab-activated"))
    .catch(() => {});
});
chrome.tabs.onUpdated?.addListener((_tabId, changeInfo, tab) => {
  if (tab?.active && (changeInfo.url || changeInfo.status === "complete"))
    announceContextChange(tab, changeInfo.url ? "url-updated" : "page-complete").catch(
      () => {},
    );
});
for (const event of [
  chrome.webNavigation?.onHistoryStateUpdated,
  chrome.webNavigation?.onReferenceFragmentUpdated,
])
  event?.addListener((details) => {
    if (details.frameId !== 0) return;
    chrome.tabs
      .get(details.tabId)
      .then((tab) => {
        if (tab.active) return announceContextChange(tab, "history-updated");
      })
      .catch(() => {});
  });

// Chrome still has browser-protected pages that no extension can script, even
// when <all_urls> is granted. Treat those as a known capability boundary so
// users get a useful message instead of Chrome's raw permission exception.
function pageScriptability(rawUrl = "") {
  let u;
  try {
    u = new URL(rawUrl);
  } catch {
    return { ok: false, reason: "This tab does not expose a scriptable URL." };
  }
  const blockedSchemes = new Set([
    "chrome:",
    "chrome-extension:",
    "devtools:",
    "edge:",
    "about:",
    "view-source:",
  ]);
  if (blockedSchemes.has(u.protocol))
    return {
      ok: false,
      reason: `Chrome does not allow extensions to inject into ${u.protocol}// pages.`,
    };
  if (
    u.hostname === "chromewebstore.google.com" ||
    (u.hostname === "chrome.google.com" && u.pathname.startsWith("/webstore"))
  ) {
    return {
      ok: false,
      reason:
        "Chrome does not allow extensions to inject into the Chrome Web Store.",
    };
  }
  return { ok: true, reason: "" };
}

function requireScriptableTab(tab) {
  if (!tab?.id) throw new Error("No active tab.");
  const state = pageScriptability(tab.url || "");
  if (!state.ok) throw new Error(state.reason);
  return tab;
}

async function tabContext(tabId, tabUrl = "") {
  const access = pageScriptability(tabUrl);
  if (!access.ok) throw new Error(access.reason);
  const [result] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const selected = String(getSelection()?.toString() || "")
        .trim()
        .slice(0, 10000);
      const video = document.querySelector("video");
      return {
        pageUrl: location.href,
        title: document.title,
        highlightedText: selected,
        currentVideoTime: video ? Number(video.currentTime || 0) : null,
        viewport: {
          width: innerWidth,
          height: innerHeight,
          scrollX,
          scrollY,
          devicePixelRatio,
        },
        page: {
          width: Math.max(
            document.documentElement.scrollWidth,
            document.body?.scrollWidth || 0,
          ),
          height: Math.max(
            document.documentElement.scrollHeight,
            document.body?.scrollHeight || 0,
          ),
        },
      };
    },
  });
  return { ...result.result, documentId: result.documentId, tabId };
}

async function rememberContext(tab) {
  if (!tab?.id) return null;
  try {
    const context = await tabContext(tab.id, tab.url || "");
    const stored = {
      ...context,
      tabId: tab.id,
      windowId: tab.windowId,
      capturedAt: new Date().toISOString(),
    };
    await chrome.storage.session.set({ xtratypeLastContext: stored });
    return stored;
  } catch (error) {
    const stored = {
      pageUrl: tab.url || "",
      title: tab.title || "Current page",
      highlightedText: "",
      currentVideoTime: null,
      tabId: tab.id,
      windowId: tab.windowId,
      capturedAt: new Date().toISOString(),
      scriptAccess: false,
      accessReason: error?.message || "Page access is unavailable.",
    };
    await chrome.storage.session.set({ xtratypeLastContext: stored });
    return stored;
  }
}

async function openPanelForTab(tab) {
  if (tab?.id == null || tab?.windowId == null) throw new Error("No active tab.");
  // Use the global XtraType panel for the active browser window so all entry
  // points agree on the same panel instance.
  const opened = chrome.sidePanel.open({ windowId: tab.windowId });
  const remembered = rememberContext(tab);
  await Promise.all([opened, remembered]);
  return { ok: true };
}

async function beginAnnotationFromOmnibox(tab, opened = Promise.resolve(), commentText = "") {
  if (tab?.id == null) throw new Error("No active tab.");
  const request = {
    tabId: tab.id,
    windowId: tab.windowId,
    requestedAt: Date.now(),
    commentText: String(commentText || "").slice(0, 20000),
  };
  await chrome.storage.session
    .set({ [COMPOSE_REQUEST_KEY]: request })
    .catch(() => {});
  const remembered = rememberContext(tab);
  await Promise.all([opened, remembered]);
  await chrome.runtime
    .sendMessage({
      type: "xtratype:beginAnnotation",
      tabId: tab.id,
      windowId: tab.windowId,
      commentText: request.commentText,
    })
    .catch(() => {});
  return { ok: true };
}

async function openQuickBarForTab(tab) {
  requireScriptableTab(tab);
  await rememberContext(tab);
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content/page-ui.js"],
  });
  return { ok: true };
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    if (info.menuItemId === "xtratype-quick") await openQuickBarForTab(tab);
    else await openPanelForTab(tab);
  } catch {}
});

async function quickCreate(payload) {
  const yt = youtubeInfo(payload.pageUrl);
  const target = yt
    ? makeYoutubeTarget(payload.pageUrl, payload.currentVideoTime, null)
    : parseUrlTarget(payload.pageUrl);
  const opts = await settings();
  const a = await createAnnotation({
    ...payload,
    target,
    author: opts.author,
    autoSync: opts.autoSync,
    source: "quickbar",
  });
  if (opts.autoSync) {
    try {
      return await syncAnnotation(a);
    } catch (e) {
      return { ...a, syncState: "error", syncError: e.message };
    }
  }
  return a;
}

function annotationMatchesPage(annotation, rawPageUrl) {
  const yt = youtubeInfo(rawPageUrl);
  if (yt && annotation?.target?.kind === "youtube")
    return annotation.target.value?.videoId === yt.videoId;
  return urlTargetMatchesPage(annotation?.target, rawPageUrl);
}

async function recentAnnotationsForPage(rawPageUrl, limit = 4) {
  const s = await settings();
  if (s.autoSync) {
    try {
      const remote = await pullAnnotations();
      // pullAnnotations performs a protected merge.
    } catch {}
  }
  const items = (await all("annotations"))
    .filter((a) => annotationMatchesPage(a, rawPageUrl))
    .sort((a, b) =>
      String(b.createdAt || "").localeCompare(String(a.createdAt || "")),
    )
    .slice(0, Math.max(1, Math.min(10, Number(limit) || 4)));
  return items;
}

async function youtubeAnnotations(videoId) {
  let items = (await all("annotations")).filter(
    (a) => a.target?.kind === "youtube" && a.target?.value?.videoId === videoId,
  );
  const s = await settings();
  if (s.autoSync) {
    try {
      const remote = await pullAnnotations();
      // Protected merge occurs in API module.
      items = (await all("annotations")).filter(
        (a) =>
          a.target?.kind === "youtube" && a.target?.value?.videoId === videoId,
      );
    } catch {}
  }
  return items;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    if (!message || sender.id !== chrome.runtime.id)
      throw new Error("Untrusted caller.");
    const contentAllowed = new Set([
      "xtratype:openSidePanel",
      "xtratype:quickCreate",
      "xtratype:quickReply",
      "xtratype:getRecentContextAnnotations",
      "xtratype:getYouTubeAnnotations",
    ]);
    if (sender.tab && !contentAllowed.has(message.type))
      throw new Error("Operation requires an extension-owned view.");
    if (sender.tab && message.pageUrl && message.pageUrl !== sender.url)
      throw new Error("Page context changed.");
    if (
      sender.tab &&
      message.videoId &&
      youtubeInfo(sender.url)?.videoId !== message.videoId
    )
      throw new Error("Video context changed.");
    if (message.type === "xtratype:openSidePanel") {
      const tab = sender.tab || (await activeTab());
      return openPanelForTab(tab);
    }
    if (message.type === "xtratype:openQuickBar") {
      const tab = sender.tab || (await activeTab());
      return openQuickBarForTab(tab);
    }
    if (message.type === "xtratype:getContext") {
      const requestedTabId = Number.isInteger(message.tabId) ? message.tabId : null;
      const tab = requestedTabId
        ? await chrome.tabs.get(requestedTabId).catch(() => null)
        : await activeTab();
      if (!tab?.id || (requestedTabId && !tab.active))
        return { ok: false, error: "No active tab." };
      try {
        return {
          ok: true,
          context: await tabContext(tab.id, tab.url || ""),
          tabId: tab.id,
          windowId: tab.windowId,
        };
      } catch {
        return {
          ok: true,
          context: await rememberContext(tab),
          tabId: tab.id,
          windowId: tab.windowId,
        };
      }
    }
    if (message.type === "xtratype:markAnnotationsOld") {
      const count = await markAnnotationIdsOld(message.ids);
      await updateBadgeForTab();
      return { ok: true, count };
    }
    if (message.type === "xtratype:markPageOld") {
      const tab = await activeTab();
      const count = tab?.url ? await markPageAnnotationsOld(tab.url) : 0;
      await updateBadgeForTab(tab);
      return { ok: true, count };
    }
    if (message.type === "xtratype:updateBadge") {
      const count = await updateBadgeForTab();
      return { ok: true, count };
    }
    if (message.type === "xtratype:quickCreate") {
      if (!sender.tab) throw new Error("Quick save requires a page context.");
      const c = await tabContext(sender.tab.id, sender.tab.url);
      if (
        c.pageUrl !== message.payload?.pageUrl ||
        (sender.documentId && sender.documentId !== c.documentId)
      )
        throw new Error("Page changed. Reopen the quick bar.");
      const item = await quickCreate({
        ...message.payload,
        currentVideoTime: c.currentVideoTime,
      });
      if (sender.tab?.id && item.target?.kind === "youtube")
        chrome.tabs
          .sendMessage(sender.tab.id, { type: "xtratype:refresh" })
          .catch(() => {});
      await updateBadgeForTab(sender.tab);
      return { ok: true, item };
    }
    if (message.type === "xtratype:getRecentContextAnnotations")
      return {
        ok: true,
        items: await recentAnnotationsForPage(message.pageUrl, message.limit),
      };
    if (message.type === "xtratype:getYouTubeAnnotations")
      return { ok: true, items: await youtubeAnnotations(message.videoId) };
    if (message.type === "xtratype:quickReply") {
      const parent = await get("annotations", message.annotationId);
      if (!parent) throw new Error("Original annotation not found.");
      if (sender.tab && !annotationMatchesPage(parent, sender.url))
        throw new Error("Reply context changed.");
      const ss = await settings();
      let item = await createAnnotation({
        target: parent.target,
        body: message.body,
        parentAnnotationId: parent.id,
        author: ss.author,
        autoSync: ss.autoSync,
        source: "reply",
      });
      if (ss.autoSync) {
        try {
          item = await syncAnnotation(item);
        } catch (e) {
          item = { ...item, syncState: "error", syncError: e.message };
        }
      }
      if (sender.tab) await updateBadgeForTab(sender.tab);
      return { ok: true, item };
    }
    if (message.type === "xtratype:scrollTo") {
      await pinned(message, false);
      const [r] = await chrome.scripting.executeScript({
        target: { tabId: message.tabId, documentIds: [message.documentId] },
        func: (x, y) => {
          scrollTo({ left: x, top: y, behavior: "instant" });
          return { x: scrollX, y: scrollY };
        },
        args: [message.x, message.y],
      });
      return { ok: true, ...r.result };
    }
    if (message.type === "xtratype:captureVisible") {
      const run = captureQueue.then(async () => {
        await pinned(message, true);
        const prev =
          (await chrome.storage.session.get("xtratypeLastCapture"))
            .xtratypeLastCapture || 0;
        await new Promise((r) =>
          setTimeout(r, Math.max(0, 600 - (Date.now() - prev))),
        );
        await pinned(message, true);
        await chrome.storage.session.set({ xtratypeLastCapture: Date.now() });
        const dataUrl = await chrome.tabs.captureVisibleTab(message.windowId, {
          format: "png",
        });
        await pinned(message, true);
        return { ok: true, dataUrl };
      });
      captureQueue = run.catch(() => {});
      return run;
    }
    if (message.type === "xtratype:pageExtract") {
      await pinned(message, false);
      const [r] = await chrome.scripting.executeScript({
        target: { tabId: message.tabId, documentIds: [message.documentId] },
        func: () => {
          const html = document.documentElement.outerHTML,
            text = document.body?.innerText || "";
          return {
            html: html.slice(0, 5000000),
            text: text.slice(0, 2000000),
            htmlTruncated: html.length > 5000000,
            textTruncated: text.length > 2000000,
            title: document.title,
            url: location.href,
          };
        },
      });
      return { ok: true, ...r.result };
    }
    return { ok: false, error: "Unknown message." };
  })()
    .then(sendResponse)
    .catch((e) => sendResponse({ ok: false, error: e.message }));
  return true;
});

let captureQueue = Promise.resolve();
async function pinned(m, requireActive) {
  if (!Number.isInteger(m.tabId) || !m.documentId || !m.pageUrl)
    throw new Error("Pinned capture context required.");
  const tab = await chrome.tabs.get(m.tabId);
  if (
    tab.url !== m.pageUrl ||
    tab.pendingUrl ||
    (m.windowId != null && tab.windowId !== m.windowId) ||
    (requireActive && !tab.active)
  )
    throw new Error("Capture stopped: tab or page changed.");
  const c = await tabContext(m.tabId, tab.url);
  if (c.documentId !== m.documentId || c.pageUrl !== m.pageUrl)
    throw new Error("Capture document changed.");
  if (
    m.viewport &&
    (c.viewport.width !== m.viewport.width ||
      c.viewport.height !== m.viewport.height ||
      c.viewport.devicePixelRatio !== m.viewport.devicePixelRatio)
  )
    throw new Error("Viewport changed during capture.");
  if (
    m.page &&
    (c.page.width !== m.page.width || c.page.height !== m.page.height)
  )
    throw new Error(
      "Page dimensions changed during capture; retry after it settles.",
    );
  return c;
}
