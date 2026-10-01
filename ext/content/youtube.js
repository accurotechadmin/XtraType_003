(() => {
  if (globalThis.__xtratypeYouTube) return;
  globalThis.__xtratypeYouTube = true;
  let annotations = [],
    currentId = "",
    generation = 0,
    markerHost,
    toast,
    card,
    lastSecond = -1,
    lastRender = "",
    timer,
    toastTimer,
    stopped = false;
  const videoId = () => {
    const u = new URL(location.href);
    return (
      u.searchParams.get("v") ||
      (u.pathname.startsWith("/shorts/") ? u.pathname.split("/")[2] : "") ||
      ""
    );
  };
  const time = (s) => {
    const n = Math.floor(s);
    return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;
  };
  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const owned = (el) => {
    el.dataset.xtratypeOwned = "true";
    return el;
  };
  function disposeUi() {
    markerHost?.remove();
    toast?.remove();
    card?.remove();
    markerHost = toast = card = null;
    clearTimeout(toastTimer);
    lastRender = "";
    lastSecond = -1;
  }
  function closeCard() {
    card?.remove();
    card = null;
  }
  function ensureUi() {
    const progress = document.querySelector(
      ".ytp-progress-bar-container,.ytp-progress-bar",
    );
    if (!progress) return false;
    if (!markerHost?.isConnected || markerHost.parentElement !== progress) {
      markerHost?.remove();
      markerHost = owned(document.createElement("div"));
      markerHost.className = "xt-youtube-markers";
      markerHost.style.cssText =
        "position:absolute;inset:0;z-index:45;pointer-events:none";
      progress.append(markerHost);
      lastRender = "";
    }
    if (!toast?.isConnected) {
      toast = owned(document.createElement("div"));
      toast.setAttribute("role", "status");
      toast.style.cssText =
        "display:none;position:absolute;left:10%;right:10%;bottom:70px;z-index:9999;background:#101828ed;color:white;padding:12px;border-radius:10px;font:14px system-ui;pointer-events:none";
      (document.querySelector("#movie_player") || document.body).append(toast);
    }
    return true;
  }
  function render() {
    const video = document.querySelector("video");
    if (
      !video ||
      !Number.isFinite(video.duration) ||
      video.duration <= 0 ||
      !ensureUi()
    )
      return;
    const signature = JSON.stringify([
      video.duration,
      annotations.map((a) => [a.id, a.updatedAt, a.body, a.target?.value]),
    ]);
    if (signature === lastRender) return;
    lastRender = signature;
    markerHost.replaceChildren();
    for (const a of annotations) {
      const v = a.target?.value,
        s = v?.startSeconds,
        e = v?.endSeconds;
      if (s == null || typeof s !== "number" || !Number.isFinite(s)) continue;
      const start = Math.max(0, Math.min(100, (s / video.duration) * 100)),
        end =
          e == null
            ? start
            : Math.max(start, Math.min(100, (e / video.duration) * 100));
      const m = document.createElement("button");
      m.type = "button";
      m.title = a.body;
      m.setAttribute("aria-label", `XtraType at ${time(s)}: ${a.body}`);
      m.style.cssText = `pointer-events:auto;position:absolute;left:${start}%;width:${Math.max(0.45, end - start)}%;min-width:6px;height:14px;top:-4px;border:0;border-radius:4px;background:#ffd54a;cursor:pointer`;
      m.onmouseenter = () => showCard(a, m, false);
      m.onfocus = () => showCard(a, m, true);
      m.onclick = (ev) => {
        ev.stopPropagation();
        showCard(a, m, true);
      };
      markerHost.append(m);
    }
  }
  function showCard(a, marker, interactive) {
    closeCard();
    const element = owned(document.createElement("div"));
    card = element;
    element.setAttribute("role", "dialog");
    element.setAttribute("aria-label", "XtraType annotation");
    element.style.cssText =
      "position:fixed;z-index:2147483646;width:min(340px,calc(100vw - 24px));max-height:65vh;overflow:auto;box-sizing:border-box;background:white;color:#111;border:1px solid #ccd2dc;border-radius:12px;box-shadow:0 14px 40px #0005;padding:12px;font:13px system-ui";
    const r = marker.getBoundingClientRect();
    element.style.left =
      Math.max(
        12,
        Math.min(
          innerWidth - Math.min(340, innerWidth - 24) - 12,
          r.left - 130,
        ),
      ) + "px";
    element.style.top =
      Math.max(12, Math.min(innerHeight - 180, r.top - 150)) + "px";
    element.innerHTML = `<button type="button" aria-label="Close annotation" style="float:right">×</button><strong>XtraType · ${time(a.target.value.startSeconds)}</strong><p style="white-space:pre-wrap">${esc(a.body)}</p>`;
    element.querySelector("button").onclick = closeCard;
    if (interactive) {
      const input = document.createElement("textarea");
      input.placeholder = "Quick reply";
      input.setAttribute("aria-label", "Quick reply");
      input.style.cssText = "width:100%;box-sizing:border-box";
      input.maxLength = 20000;
      const reply = document.createElement("button");
      reply.textContent = "Reply";
      reply.type = "button";
      const open = document.createElement("button");
      open.textContent = "Open XtraType";
      open.type = "button";
      const status = document.createElement("p");
      status.setAttribute("role", "status");
      reply.onclick = async () => {
        if (reply.disabled || !input.value.trim()) return;
        reply.disabled = true;
        const res = await chrome.runtime
          .sendMessage({
            type: "xtratype:quickReply",
            annotationId: a.id,
            body: input.value.trim(),
          })
          .catch((e) => ({ error: e.message }));
        reply.disabled = false;
        if (res?.ok) {
          input.value = "";
          status.textContent =
            res.item.syncState === "error"
              ? "Saved locally; sync failed."
              : "Reply saved.";
        } else
          status.textContent = res?.error || "Reply failed; text retained.";
      };
      open.onclick = async () => {
        const res = await chrome.runtime
          .sendMessage({ type: "xtratype:openSidePanel" })
          .catch((e) => ({ error: e.message }));
        if (!res?.ok)
          status.textContent = res?.error || "Use the XT toolbar button.";
      };
      element.append(input, reply, open, status);
    } else
      element.onmouseleave = () => {
        if (card === element) closeCard();
      };
    document.body.append(element);
  }
  async function refresh() {
    const id = videoId(),
      token = ++generation;
    currentId = id;
    annotations = [];
    disposeUi();
    if (!id) return;
    const res = await chrome.runtime
      .sendMessage({ type: "xtratype:getYouTubeAnnotations", videoId: id })
      .catch(() => null);
    if (stopped || token !== generation || id !== videoId()) return;
    annotations = res?.ok && Array.isArray(res.items) ? res.items : [];
    render();
  }
  function tick() {
    if (stopped) return;
    if (videoId() !== currentId) {
      refresh();
      return;
    }
    render();
    const v = document.querySelector("video");
    if (!v) return;
    const sec = Math.floor(v.currentTime);
    if (sec === lastSecond) return;
    lastSecond = sec;
    const due = annotations.filter(
      (a) =>
        a.target?.value?.startSeconds != null &&
        Number.isFinite(a.target.value.startSeconds) &&
        Math.floor(a.target.value.startSeconds) === sec,
    );
    if (due.length && ensureUi()) {
      toast.textContent = due.map((a) => "XT: " + a.body).join(" • ");
      toast.style.display = "block";
      clearTimeout(toastTimer);
      const t = toast;
      toastTimer = setTimeout(() => {
        if (t.isConnected) t.style.display = "none";
      }, 4500);
    }
  }
  const message = (m) => {
    if (m?.type === "xtratype:refresh") refresh();
  };
  const escape = (e) => {
    if (e.key === "Escape") closeCard();
  };
  const outside = (e) => {
    if (card && !card.contains(e.target) && !markerHost?.contains(e.target))
      closeCard();
  };
  // Poll only identity/player state. No whole-document mutation feedback from our own UI.
  function start() {
    stopped = false;
    timer = setInterval(tick, 700);
    chrome.runtime.onMessage.addListener(message);
    document.addEventListener("keydown", escape);
    document.addEventListener("pointerdown", outside);
    refresh();
  }
  function stop() {
    stopped = true;
    generation++;
    clearInterval(timer);
    disposeUi();
    chrome.runtime.onMessage.removeListener(message);
    document.removeEventListener("keydown", escape);
    document.removeEventListener("pointerdown", outside);
  }
  window.addEventListener("pagehide", stop);
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) start();
  });
  start();
})();
