(() => {
  const selectedNow = String(getSelection()?.toString() || '').trim().slice(0, 10000);
  const existing = document.getElementById('xtratype-host');
  if (existing) {
    const root = existing.shadowRoot;
    const highlight = root?.querySelector('.highlight');
    const value = root?.querySelector('.highlight-value');
    if (highlight && value) {
      value.dataset.fullText = selectedNow;
      value.textContent = selectedNow;
      highlight.hidden = !selectedNow;
    }
    root?.querySelector('textarea')?.focus();
    return;
  }

  const host = document.createElement('div');
  host.id = 'xtratype-host';
  host.style.cssText = [
    'all:initial',
    'position:fixed',
    'z-index:2147483647',
    'top:12px',
    'left:50%',
    'transform:translateX(-50%)',
    'width:min(860px,calc(100vw - 24px))',
    'max-height:min(520px,calc(100vh - 24px))',
    'font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
    'color:#18202f'
  ].join(';');

  const shadow = host.attachShadow({mode:'open'});
  shadow.innerHTML = `
    <style>
      *{box-sizing:border-box}
      :host{color-scheme:light}
      .shell{position:relative;overflow:auto;max-height:min(520px,calc(100vh - 24px));background:rgba(255,255,255,.985);border:1px solid #cfd6e1;border-radius:16px;box-shadow:0 18px 52px rgba(15,23,42,.28);padding:12px 14px 13px;color:#18202f}
      .top{display:flex;align-items:flex-start;gap:10px;padding-right:42px}
      .brand{flex:none;width:32px;height:32px;display:grid;place-items:center;border-radius:9px;background:#172033;color:#fff;font-weight:850;font-size:12px;letter-spacing:-.04em}
      .main{min-width:0;flex:1}
      .context{font-size:10px;color:#667085;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:0 0 6px}
      textarea{display:block;width:100%;min-height:46px;max-height:130px;resize:vertical;border:1px solid #bcc5d2;border-radius:10px;padding:10px 11px;background:#fff;color:#18202f;font:13px/1.4 inherit;outline:none}
      textarea:focus{border-color:#64748b;box-shadow:0 0 0 3px rgba(100,116,139,.16)}
      .actions{display:flex;gap:7px;align-items:center;flex:none;padding-top:18px}
      button{border:1px solid #cfd6e1;border-radius:9px;background:#f4f6f8;color:#273244;padding:9px 11px;font:700 11px/1 inherit;cursor:pointer;white-space:nowrap}
      button:hover{background:#e9edf2}button:focus-visible{outline:2px solid #4f6b95;outline-offset:2px}button:disabled{opacity:.55;cursor:wait}
      .post{background:#172033;border-color:#172033;color:#fff}.post:hover{background:#263249}
      .panel{background:#eef1f5}
      .close{position:absolute;right:9px;top:9px;width:32px;height:32px;padding:0;border:2px solid #fff;border-radius:999px;background:#172033;color:#fff;font:800 22px/28px Arial,sans-serif;box-shadow:0 2px 9px rgba(0,0,0,.28);display:grid;place-items:center}
      .close:hover{background:#b42318;border-color:#fff}
      .highlight{margin:8px 0 0 42px;border-left:3px solid #98a2b3;background:#f7f8fa;border-radius:0 8px 8px 0;padding:7px 9px;min-width:0}
      .highlight-label{display:block;font-size:9px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#667085;margin-bottom:2px}
      .highlight-value{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden;white-space:pre-wrap;overflow-wrap:anywhere;font-size:11px;line-height:1.4;color:#465468}
      .status{min-height:15px;margin:7px 0 0 42px;font-size:10px;color:#667085}.status.error{color:#b42318}.status.ok{color:#067647}
      .recent{margin:9px 0 0 42px;border-top:1px solid #e7ebf0;padding-top:8px}
      .recent-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:5px}
      .recent-head strong{font-size:10px;color:#475467;text-transform:uppercase;letter-spacing:.06em}.recent-head span{font-size:9px;color:#98a2b3}
      .comments{display:grid;gap:5px}
      .comment{min-width:0;border:1px solid #e4e8ee;border-radius:9px;padding:7px 8px;background:#fbfcfd}
      .comment-meta{display:flex;gap:8px;justify-content:space-between;font-size:9px;color:#7b8493;margin-bottom:3px}.comment-meta span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .comment-body{font-size:11px;line-height:1.35;color:#2f3a4a;white-space:pre-wrap;overflow-wrap:anywhere;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
      .comment-quote{font-size:9px;line-height:1.3;color:#697586;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      @media(max-width:680px){
        .top{display:grid;grid-template-columns:32px minmax(0,1fr);padding-right:36px}.actions{grid-column:2;padding-top:0;justify-content:flex-end;flex-wrap:wrap}.highlight,.status,.recent{margin-left:42px}.panel{order:1}.post{order:2}
      }
      @media(max-width:440px){
        :host{width:calc(100vw - 14px)!important;top:7px!important}.shell{padding:10px}.brand{width:29px;height:29px}.top{grid-template-columns:29px minmax(0,1fr)}.highlight,.status,.recent{margin-left:0}.actions{grid-column:1 / -1}.actions button{flex:1}.close{right:7px;top:7px}.context{padding-right:4px}
      }
    </style>
    <section class="shell" role="dialog" aria-label="XtraType quick comment">
      <button class="close" type="button" aria-label="Close XtraType quick bar" title="Close">×</button>
      <div class="top">
        <div class="brand" aria-hidden="true">XT</div>
        <div class="main">
          <div class="context"></div>
          <textarea aria-label="Quick comment" placeholder="Quick comment at this URL"></textarea>
        </div>
        <div class="actions">
          <button class="post" type="button">Post</button>
          <button class="panel" type="button">Full panel</button>
        </div>
      </div>
      <div class="highlight" hidden>
        <span class="highlight-label">Highlighted text</span>
        <div class="highlight-value"></div>
      </div>
      <div class="status" aria-live="polite"></div>
      <section class="recent" hidden>
        <div class="recent-head"><strong>Recent comments here</strong><span class="recent-count"></span></div>
        <div class="comments"></div>
      </section>
    </section>`;

  document.documentElement.append(host);

  const textarea = shadow.querySelector('textarea');
  const postButton = shadow.querySelector('.post');
  const panelButton = shadow.querySelector('.panel');
  const closeButton = shadow.querySelector('.close');
  const status = shadow.querySelector('.status');
  const highlight = shadow.querySelector('.highlight');
  const highlightValue = shadow.querySelector('.highlight-value');
  const recent = shadow.querySelector('.recent');
  const comments = shadow.querySelector('.comments');
  const recentCount = shadow.querySelector('.recent-count');
  const contextLine = shadow.querySelector('.context');

  const video = document.querySelector('video');
  contextLine.textContent = video && /(?:youtube\.com|youtu\.be)$/i.test(location.hostname)
    ? `${document.title || 'YouTube'} · ${formatTime(video.currentTime || 0)}`
    : `${location.hostname}${location.pathname}`;

  highlightValue.dataset.fullText = selectedNow;
  highlightValue.textContent = selectedNow;
  highlight.hidden = !selectedNow;

  function formatTime(seconds) {
    const n = Math.max(0, Math.floor(Number(seconds) || 0));
    return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`;
  }

  function timeLabel(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const delta = Date.now() - d.getTime();
    if (delta < 60_000) return 'just now';
    if (delta < 3_600_000) return `${Math.floor(delta / 60_000)}m ago`;
    if (delta < 86_400_000) return `${Math.floor(delta / 3_600_000)}h ago`;
    return d.toLocaleDateString();
  }

  function setStatus(message, kind = '') {
    status.textContent = message || '';
    status.className = `status${kind ? ` ${kind}` : ''}`;
  }

  function targetSuffix(item) {
    if (item?.target?.kind !== 'youtube') return item?.target?.kind || 'url';
    const start = item.target.value?.startSeconds;
    const end = item.target.value?.endSeconds;
    if (start == null) return 'video';
    return end == null ? `video · ${formatTime(start)}` : `video · ${formatTime(start)}–${formatTime(end)}`;
  }

  function renderRecent(items) {
    comments.replaceChildren();
    const list = Array.isArray(items) ? items : [];
    recent.hidden = list.length === 0;
    recentCount.textContent = list.length ? String(list.length) : '';
    for (const item of list) {
      const card = document.createElement('article');
      card.className = 'comment';
      const meta = document.createElement('div');
      meta.className = 'comment-meta';
      const who = document.createElement('span');
      who.textContent = `${item.author || 'Local user'} · ${targetSuffix(item)}`;
      const when = document.createElement('span');
      when.textContent = timeLabel(item.createdAt);
      meta.append(who, when);
      const body = document.createElement('div');
      body.className = 'comment-body';
      body.textContent = item.body || '';
      card.append(meta, body);
      if (item.highlightedText) {
        const quote = document.createElement('div');
        quote.className = 'comment-quote';
        quote.textContent = `“${item.highlightedText}”`;
        card.append(quote);
      }
      comments.append(card);
    }
  }

  async function loadRecent() {
    const res = await chrome.runtime.sendMessage({
      type:'xtratype:getRecentContextAnnotations',
      pageUrl:location.href,
      limit:4
    }).catch(() => null);
    if (res?.ok) renderRecent(res.items);
  }

  closeButton.onclick = () => host.remove();
  panelButton.onclick = async () => {
    panelButton.disabled = true;
    const res = await chrome.runtime.sendMessage({type:'xtratype:openSidePanel'}).catch(e => ({ok:false,error:e.message}));
    if (!res?.ok) {
      setStatus(res?.error || 'Could not open the side panel. Click the XT toolbar button instead.', 'error');
      panelButton.disabled = false;
    }
  };

  postButton.onclick = async () => {
    const body = textarea.value.trim();
    if (!body) {
      setStatus('Write a comment first.', 'error');
      textarea.focus();
      return;
    }
    postButton.disabled = true;
    setStatus('Saving…');
    const currentVideo = document.querySelector('video');
    const res = await chrome.runtime.sendMessage({
      type:'xtratype:quickCreate',
      payload:{
        body,
        highlightedText:highlightValue.dataset.fullText || '',
        pageUrl:location.href,
        title:document.title,
        currentVideoTime:currentVideo ? Number(currentVideo.currentTime || 0) : null
      }
    }).catch(e => ({ok:false,error:e.message}));

    postButton.disabled = false;
    if (res?.ok) {
      textarea.value = '';
      setStatus('Saved. Your comment is now in the context feed.', 'ok');
      await loadRecent();
      textarea.focus();
    } else {
      setStatus(res?.error || 'Could not save the comment.', 'error');
    }
  };

  textarea.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      postButton.click();
    }
    if (event.key === 'Escape') host.remove();
  });

  loadRecent();
  textarea.focus();
})();
