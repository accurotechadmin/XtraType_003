import {all, get, id, put, logEvent} from './core/db.js';
import {parseUrlTarget, makeYoutubeTarget, youtubeInfo, targetKey} from './core/anchors.js';
import {settings, syncAnnotation, pullAnnotations} from './core/api.js';

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.contextMenus.removeAll().catch(() => {});
  chrome.contextMenus.create({id:'xtratype-panel', title:'Open XtraType side panel', contexts:['selection','page','video','link']});
  chrome.contextMenus.create({id:'xtratype-quick', title:'Open XtraType quick comment bar', contexts:['selection','page','video','link']});
  chrome.sidePanel.setPanelBehavior?.({openPanelOnActionClick:true}).catch(() => {});
});

// Keep the toolbar action wired directly to Chrome's native side-panel behavior.
// This is more reliable than manually opening the panel from action.onClicked and
// also works on pages where script injection is not available.
chrome.sidePanel.setPanelBehavior?.({openPanelOnActionClick:true}).catch(() => {});
chrome.runtime.onStartup.addListener(() => {
  chrome.sidePanel.setPanelBehavior?.({openPanelOnActionClick:true}).catch(() => {});
});

async function activeTab() {
  return (await chrome.tabs.query({active:true,currentWindow:true}))[0] || null;
}

// Chrome still has browser-protected pages that no extension can script, even
// when <all_urls> is granted. Treat those as a known capability boundary so
// users get a useful message instead of Chrome's raw permission exception.
function pageScriptability(rawUrl='') {
  let u;
  try { u = new URL(rawUrl); } catch { return {ok:false, reason:'This tab does not expose a scriptable URL.'}; }
  const blockedSchemes = new Set(['chrome:', 'chrome-extension:', 'devtools:', 'edge:', 'about:', 'view-source:']);
  if (blockedSchemes.has(u.protocol)) return {ok:false, reason:`Chrome does not allow extensions to inject into ${u.protocol}// pages.`};
  if (u.hostname === 'chromewebstore.google.com' || (u.hostname === 'chrome.google.com' && u.pathname.startsWith('/webstore'))) {
    return {ok:false, reason:'Chrome does not allow extensions to inject into the Chrome Web Store.'};
  }
  return {ok:true, reason:''};
}

function requireScriptableTab(tab) {
  if (!tab?.id) throw new Error('No active tab.');
  const state = pageScriptability(tab.url || '');
  if (!state.ok) throw new Error(state.reason);
  return tab;
}

async function tabContext(tabId, tabUrl='') {
  const access = pageScriptability(tabUrl);
  if (!access.ok) throw new Error(access.reason);
  const [result] = await chrome.scripting.executeScript({target:{tabId}, func: () => {
    const selected=String(getSelection()?.toString() || '').trim().slice(0,10000);
    const video=document.querySelector('video');
    return {
      pageUrl:location.href,
      title:document.title,
      highlightedText:selected,
      currentVideoTime:video ? Number(video.currentTime||0) : null,
      viewport:{width:innerWidth,height:innerHeight,scrollX,scrollY,devicePixelRatio},
      page:{width:Math.max(document.documentElement.scrollWidth,document.body?.scrollWidth||0),height:Math.max(document.documentElement.scrollHeight,document.body?.scrollHeight||0)}
    };
  }});
  return result.result;
}

async function rememberContext(tab) {
  if (!tab?.id) return null;
  try {
    const context=await tabContext(tab.id, tab.url || '');
    const stored={...context,tabId:tab.id,capturedAt:new Date().toISOString()};
    await chrome.storage.session.set({xtratypeLastContext:stored});
    return stored;
  } catch (error) {
    const stored={pageUrl:tab.url||'',title:tab.title||'Current page',highlightedText:'',currentVideoTime:null,tabId:tab.id,capturedAt:new Date().toISOString(),scriptAccess:false,accessReason:error?.message||'Page access is unavailable.'};
    await chrome.storage.session.set({xtratypeLastContext:stored});
    return stored;
  }
}

async function openPanelForTab(tab) {
  if (!tab?.id) throw new Error('No active tab.');
  await rememberContext(tab);
  await chrome.sidePanel.setOptions?.({tabId:tab.id, path:'sidepanel/index.html', enabled:true}).catch(() => {});
  await chrome.sidePanel.open({tabId:tab.id});
  return {ok:true};
}

async function openQuickBarForTab(tab) {
  requireScriptableTab(tab);
  await rememberContext(tab);
  await chrome.scripting.executeScript({target:{tabId:tab.id}, files:['content/page-ui.js']});
  return {ok:true};
}


chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    if (info.menuItemId==='xtratype-quick') await openQuickBarForTab(tab);
    else await openPanelForTab(tab);
  } catch {}
});

async function quickCreate(payload) {
  const yt=youtubeInfo(payload.pageUrl);
  const target=yt ? makeYoutubeTarget(payload.pageUrl, Number.isFinite(payload.currentVideoTime) ? payload.currentVideoTime : null, null) : parseUrlTarget(payload.pageUrl);
  const now=new Date().toISOString();
  const s0=await settings();
  const annotation={
    id:id('annotation'),recordType:'Context.Annotation',schemaVersion:2,target,targetKey:targetKey(target),
    highlightedText:payload.highlightedText||'',body:String(payload.body||'').trim(),attachments:[],parentAnnotationId:null,
    author:s0.author||'Local user',createdAt:now,updatedAt:now,syncState:'pending'
  };
  if(!annotation.body) throw new Error('Comment text is required.');
  await put('annotations',annotation);
  await logEvent('annotation.created',{annotationId:annotation.id,targetKey:annotation.targetKey,source:'quickbar'});
  if(s0.autoSync){
    try{return await syncAnnotation(annotation,[])}
    catch(e){annotation.syncState='error';annotation.syncError=e.message;await put('annotations',annotation);}
  }
  return annotation;
}

function urlTargetMatchesPage(target, rawPageUrl) {
  if (target?.kind !== 'url') return false;
  let page;
  try { page = new URL(rawPageUrl); } catch { return false; }
  const v = target.value || {};
  if (`${page.origin}${page.pathname}` !== v.url) return false;
  if (v.fragmentMode === 'include' && (v.fragment || '') !== page.hash.replace(/^#/, '')) return false;
  const chosen = (v.queryParameters || []).filter(p => v.queryMode === 'all' || (v.queryMode === 'selected' && p.include));
  if (!chosen.length || v.queryMode === 'ignore') return true;
  const livePairs = [...page.searchParams.entries()];
  if (v.queryMode === 'all' && livePairs.length !== chosen.length) return false;
  const pool = livePairs.map(([key,value]) => ({key,value,used:false}));
  return chosen.every(p => {
    const hit = pool.find(x => !x.used && x.key === p.key && x.value === p.value);
    if (!hit) return false;
    hit.used = true;
    return true;
  });
}

function annotationMatchesPage(annotation, rawPageUrl) {
  const yt = youtubeInfo(rawPageUrl);
  if (yt && annotation?.target?.kind === 'youtube') return annotation.target.value?.videoId === yt.videoId;
  return urlTargetMatchesPage(annotation?.target, rawPageUrl);
}

async function recentAnnotationsForPage(rawPageUrl, limit = 4) {
  const s = await settings();
  if (s.autoSync) {
    try {
      const remote = await pullAnnotations();
      for (const a of remote) await put('annotations', {...a, syncState:'synced'});
    } catch {}
  }
  const items = (await all('annotations'))
    .filter(a => annotationMatchesPage(a, rawPageUrl))
    .sort((a,b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
    .slice(0, Math.max(1, Math.min(10, Number(limit) || 4)));
  return items;
}

async function youtubeAnnotations(videoId) {
  let items=(await all('annotations')).filter(a=>a.target?.kind==='youtube'&&a.target?.value?.videoId===videoId);
  const s=await settings();
  if(s.autoSync){
    try{
      const remote=await pullAnnotations();
      for(const a of remote) await put('annotations',{...a,syncState:'synced'});
      items=(await all('annotations')).filter(a=>a.target?.kind==='youtube'&&a.target?.value?.videoId===videoId);
    }catch{}
  }
  return items;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async()=>{
    if(message.type==='xtratype:openSidePanel') {
      const tab=sender.tab || await activeTab();
      return openPanelForTab(tab);
    }
    if(message.type==='xtratype:openQuickBar') {
      const tab=sender.tab || await activeTab();
      return openQuickBarForTab(tab);
    }
    if(message.type==='xtratype:getContext') {
      const tab=await activeTab();
      if(!tab?.id) return {ok:false,error:'No active tab.'};
      try { return {ok:true,context:await tabContext(tab.id, tab.url || ''),tabId:tab.id}; }
      catch { return {ok:true,context:await rememberContext(tab),tabId:tab.id}; }
    }
    if(message.type==='xtratype:quickCreate') {
      const item=await quickCreate(message.payload);
      if(sender.tab?.id && item.target?.kind==='youtube') chrome.tabs.sendMessage(sender.tab.id,{type:'xtratype:refresh'}).catch(()=>{});
      return {ok:true,item};
    }
    if(message.type==='xtratype:getRecentContextAnnotations') return {ok:true,items:await recentAnnotationsForPage(message.pageUrl, message.limit)};
    if(message.type==='xtratype:getYouTubeAnnotations') return {ok:true,items:await youtubeAnnotations(message.videoId)};
    if(message.type==='xtratype:quickReply') {
      const parent=await get('annotations',message.annotationId);
      if(!parent) throw new Error('Original annotation not found.');
      const now=new Date().toISOString(); const ss=await settings();
      const a={id:id('annotation'),recordType:'Context.Annotation',schemaVersion:2,target:parent.target,targetKey:parent.targetKey,highlightedText:'',body:String(message.body||'').trim(),attachments:[],parentAnnotationId:parent.id,author:ss.author||'Local user',createdAt:now,updatedAt:now,syncState:'pending'};
      await put('annotations',a); try{await syncAnnotation(a,[])}catch{} return {ok:true,item:a};
    }
    if(message.type==='xtratype:scrollTo') {
      await chrome.scripting.executeScript({target:{tabId:message.tabId},func:(x,y)=>scrollTo(x,y),args:[message.x,message.y]});
      return {ok:true};
    }
    if(message.type==='xtratype:captureVisible') return {ok:true,dataUrl:await chrome.tabs.captureVisibleTab(message.windowId || sender.tab?.windowId || undefined,{format:'png'})};
    if(message.type==='xtratype:pageExtract') {
      const [r]=await chrome.scripting.executeScript({target:{tabId:message.tabId},func:()=>({html:document.documentElement.outerHTML.slice(0,5_000_000),text:(document.body?.innerText||'').slice(0,2_000_000),title:document.title,url:location.href})});
      return {ok:true,...r.result};
    }
    return {ok:false,error:'Unknown message.'};
  })().then(sendResponse).catch(e=>sendResponse({ok:false,error:e.message}));
  return true;
});
