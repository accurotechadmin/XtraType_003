(() => {
  let annotations = [], lastVideoId = '', lastSecond = -1, markerHost, card, toast;
  const videoId = () => new URL(location.href).searchParams.get('v') || (location.pathname.startsWith('/shorts/') ? location.pathname.split('/')[2] : '');
  const esc = s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function ensureUi() {
    const progress = document.querySelector('.ytp-progress-bar-container,.ytp-progress-bar');
    if (!progress) return false;
    if (!markerHost || !markerHost.isConnected) {
      markerHost = document.createElement('div'); markerHost.className='xt-youtube-markers';
      markerHost.style.cssText='position:absolute;inset:0;z-index:45;pointer-events:none;';
      progress.style.position='relative'; progress.append(markerHost);
    }
    if (!toast || !toast.isConnected) {
      toast=document.createElement('div'); toast.style.cssText='display:none;position:absolute;left:50%;bottom:70px;transform:translateX(-50%);z-index:9999;background:rgba(12,16,24,.95);color:#fff;padding:10px 14px;border-radius:10px;max-width:min(520px,80%);font:14px system-ui;box-shadow:0 8px 30px #0008;';
      (document.querySelector('#movie_player') || document.body).append(toast);
    }
    return true;
  }
  function render() {
    const video=document.querySelector('video'); if (!video || !video.duration || !ensureUi()) return;
    markerHost.replaceChildren();
    for (const a of annotations) {
      const s=Number(a.target?.value?.startSeconds); if (!Number.isFinite(s)) continue;
      const e=Number(a.target?.value?.endSeconds); const start=Math.max(0,Math.min(100,s/video.duration*100)); const end=Number.isFinite(e)?Math.max(start,Math.min(100,e/video.duration*100)):start;
      const m=document.createElement('button'); m.type='button'; m.title=a.body || 'XtraType';
      m.style.cssText=`pointer-events:auto;position:absolute;left:${start}%;width:${Math.max(.45,end-start)}%;min-width:4px;height:12px;top:-4px;border:0;border-radius:4px;background:#ffd54a;box-shadow:0 0 0 1px #1118;cursor:pointer;padding:0;`;
      m.onmouseenter=()=>showCard(a,m,false); m.onclick=(ev)=>{ev.stopPropagation();showCard(a,m,true)}; markerHost.append(m);
    }
  }
  function showCard(a, marker, interactive) {
    card?.remove(); card=document.createElement('div');
    card.style.cssText='position:fixed;z-index:2147483646;width:min(340px,calc(100vw - 24px));background:#fff;color:#111;border:1px solid #ccd2dc;border-radius:12px;box-shadow:0 14px 40px #0005;padding:11px;font:13px system-ui;';
    const r=marker.getBoundingClientRect(); card.style.left=Math.min(innerWidth-352,Math.max(12,r.left-130))+'px'; card.style.top=Math.max(12,r.top-140)+'px';
    card.innerHTML=`<div style="font-weight:700;margin-bottom:5px">XtraType · ${formatTime(a.target?.value?.startSeconds)}</div><div style="margin-bottom:8px;white-space:pre-wrap">${esc(a.body)}</div><div class="actions"></div>`;
    const actions=card.querySelector('.actions');
    if (interactive) {
      const input=document.createElement('input'); input.placeholder='Quick reply'; input.style.cssText='width:100%;box-sizing:border-box;padding:7px;border:1px solid #ccd2dc;border-radius:7px;margin-bottom:6px';
      const reply=document.createElement('button'); reply.textContent='Reply'; const open=document.createElement('button'); open.textContent='Open XtraType';
      for(const b of [reply,open]) b.style.cssText='margin-right:6px;border:0;border-radius:7px;padding:7px 9px;cursor:pointer';
      reply.onclick=async()=>{if(!input.value.trim())return; await chrome.runtime.sendMessage({type:'xtratype:quickReply',annotationId:a.id,body:input.value.trim()}); input.value=''; reply.textContent='Saved';};
      open.onclick=()=>chrome.runtime.sendMessage({type:'xtratype:openSidePanel'});
      actions.append(input,reply,open);
    }
    document.body.append(card); card.onmouseleave=()=>{ if(!interactive) card?.remove(); };
  }
  function formatTime(sec){ if(sec==null||!Number.isFinite(Number(sec))) return 'video'; const n=Math.floor(Number(sec)); return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`; }
  async function refresh() {
    const id=videoId(); if(!id)return; const res=await chrome.runtime.sendMessage({type:'xtratype:getYouTubeAnnotations',videoId:id}).catch(()=>null); annotations=res?.items||[]; lastVideoId=id; render();
  }
  setInterval(()=>{
    const id=videoId(); if(id&&id!==lastVideoId) refresh();
    const video=document.querySelector('video'); if(!video)return; const sec=Math.floor(video.currentTime||0); if(sec===lastSecond)return; lastSecond=sec;
    for(const a of annotations){ const s=Number(a.target?.value?.startSeconds); const e=Number(a.target?.value?.endSeconds); if(Number.isFinite(s)&&Math.floor(s)===sec){ ensureUi(); toast.textContent=`XT: ${a.body}`; toast.style.display='block'; clearTimeout(toast._t); toast._t=setTimeout(()=>toast.style.display='none',4500); } if(Number.isFinite(s)&&Number.isFinite(e)&&sec>=Math.floor(s)&&sec<=Math.floor(e)){ /* range stays represented on timeline */ } }
  },700);
  new MutationObserver(()=>{ if(videoId()!==lastVideoId) refresh(); else render(); }).observe(document.documentElement,{childList:true,subtree:true});
  chrome.runtime.onMessage.addListener((m)=>{ if(m?.type==='xtratype:refresh') refresh(); });
  refresh();
})();
