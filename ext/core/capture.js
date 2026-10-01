export const CAPTURE_LIMITS = {
  maxPixels: 40000000,
  maxDimension: 28000,
  maxTiles: 30,
};
async function send(type, context, extra = {}) {
  const r = await chrome.runtime.sendMessage({ type, ...context, ...extra });
  if (!r?.ok) throw new Error(r?.error || "Capture request failed.");
  return r;
}
export function dataUrlToBlob(url) {
  const [header, b64] = url.split(",");
  return new Blob([Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))], {
    type: /data:([^;]+)/.exec(header)?.[1] || "image/png",
  });
}
export function tilePositions(size, view) {
  const out = [];
  for (let p = 0; p < Math.max(0, size - view); p += view) out.push(p);
  out.push(Math.max(0, size - view));
  return [...new Set(out)];
}
export async function capturePage(full = false, onProgress = () => {}) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("No active page.");
  const live = await chrome.runtime.sendMessage({
    type: "xtratype:getContext",
  });
  if (
    !live?.ok ||
    live.tabId !== tab.id ||
    !live.context?.documentId ||
    live.context.scriptAccess === false
  )
    throw new Error("This page cannot be captured.");
  const c = live.context;
  new URL(c.pageUrl);
  if (!/^https?:/.test(c.pageUrl))
    throw new Error("Snapshots require HTTP(S).");
  const pin = {
    tabId: tab.id,
    windowId: tab.windowId,
    documentId: c.documentId,
    pageUrl: c.pageUrl,
    viewport: c.viewport,
    page: c.page,
  };
  if (!full) {
    const shot = await send("xtratype:captureVisible", pin);
    const extract = await send("xtratype:pageExtract", pin);
    return {
      context: c,
      extract,
      blob: dataUrlToBlob(shot.dataUrl),
      mode: "visible",
    };
  }
  const v = c.viewport,
    p = c.page,
    dpr = v.devicePixelRatio || 1;
  if (
    p.width * dpr > CAPTURE_LIMITS.maxDimension ||
    p.height * dpr > CAPTURE_LIMITS.maxDimension ||
    p.width * p.height * dpr * dpr > CAPTURE_LIMITS.maxPixels
  )
    throw new Error(
      "Page exceeds the full-page image budget (40 million pixels / 28,000 per side). Use visible capture. Nothing was clipped.",
    );
  const xs = tilePositions(p.width, v.width),
    ys = tilePositions(p.height, v.height);
  if (xs.length * ys.length > CAPTURE_LIMITS.maxTiles)
    throw new Error("Page requires more than 30 tiles. Use visible capture.");
  const canvas = document.createElement("canvas");
  let ctx,
    scale,
    count = 0,
    result,
    restoreError;
  try {
    for (const y of ys)
      for (const x of xs) {
        const pos = await send("xtratype:scrollTo", pin, { x, y });
        await new Promise((r) => setTimeout(r, 120));
        if (Math.abs(pos.x - x) > 2 || Math.abs(pos.y - y) > 2)
          throw new Error(
            "Page prevented the requested scroll. No partial snapshot saved.",
          );
        const shot = await send("xtratype:captureVisible", pin);
        const bitmap = await createImageBitmap(dataUrlToBlob(shot.dataUrl));
        try {
          if (!ctx) {
            scale = bitmap.width / v.width;
            canvas.width = Math.round(p.width * scale);
            canvas.height = Math.round(p.height * scale);
            if (canvas.width * canvas.height > CAPTURE_LIMITS.maxPixels)
              throw new Error("Actual image exceeds capture budget.");
            ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("Canvas allocation failed.");
          }
          if (Math.abs(bitmap.width / v.width - scale) > 0.01)
            throw new Error("Capture scale changed.");
          ctx.drawImage(bitmap, Math.round(x * scale), Math.round(y * scale));
        } finally {
          bitmap.close();
        }
        onProgress(++count, xs.length * ys.length);
      }
    const extract = await send("xtratype:pageExtract", pin);
    const blob = await new Promise((r) => canvas.toBlob(r, "image/png"));
    if (!blob) throw new Error("Image encoding failed.");
    result = { context: c, extract, blob, mode: "full-page" };
  } finally {
    try {
      await send("xtratype:scrollTo", pin, {
        x: v.scrollX,
        y: v.scrollY,
        page: undefined,
        viewport: undefined,
      });
    } catch (e) {
      restoreError = e.message;
    }
    canvas.width = canvas.height = 0;
  }
  if (restoreError)
    throw new Error(
      `Capture interrupted; scroll restoration unavailable: ${restoreError}`,
    );
  return result;
}
