import {all, byIndex, get, put, remove, addBlob, id, logEvent} from '../core/db.js';
import {BUILTIN, normalizeCustomSchema, validateCustomValue} from '../core/schemas.js';
import {parseUrlTarget, makeGpsTarget, makeYoutubeTarget, targetKey, youtubeInfo, gpsMatches} from '../core/anchors.js';
import {settings, saveSettings, syncAnnotation, pullAnnotations, pullSchemas, pushSchema, syncSnapshot, serverHealth} from '../core/api.js';

const $ = id => document.getElementById(id);
let context = null, schemas = [...BUILTIN], selectedFiles = [], selectedSnapshotUrl = null;
const enc = new TextEncoder();

function setStatus(el, message, error=false){el.textContent=message||'';el.classList.toggle('error',error)}
function safe(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function formatTime(sec){if(sec==null||!Number.isFinite(Number(sec)))return '';const n=Math.floor(Number(sec));return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`}
function schemaLabel(s){return s['x-xtratype']?.label || s.title || s.$id}
function schemaKind(s){return s['x-xtratype']?.kind || 'custom'}

async function loadSchemas(){
  const locals=await all('schemas'); const map=new Map(BUILTIN.map(s=>[s.$id,s])); for(const r of locals){const s=r.schema||r; if(s?.$id)map.set(s.$id,s)}
  try { const remote=await pullSchemas(); for(const s of remote){ if(s?.$id){ map.set(s.$id,s); if(!s.$id.startsWith('xtratype.anchor.')) await put('schemas',{id:s.$id,schema:s,updatedAt:new Date().toISOString()}); } } } catch {}
  schemas=[...map.values()];
  const select=$('target-kind'); const prior=select.value; select.replaceChildren(...schemas.map(s=>{const o=document.createElement('option');o.value=s.$id;o.textContent=schemaLabel(s);return o}));
  const yt=context?.pageUrl&&youtubeInfo(context.pageUrl); select.value = prior && map.has(prior) ? prior : yt ? 'xtratype.anchor.youtube@1' : 'xtratype.anchor.url@1'; renderTargetFields(); renderSchemaList();
}

async function refreshContext(){
  const session=(await chrome.storage.session.get('xtratypeLastContext')).xtratypeLastContext;
  const live=await chrome.runtime.sendMessage({type:'xtratype:getContext'}).catch(()=>null);
  context=live?.ok?{...live.context,tabId:live.tabId}:session||context;
  if(context?.highlightedText) $('highlighted-text').value=context.highlightedText;
  $('context-title').textContent=context?.title||'Current page';
  $('context-url').textContent=context?.scriptAccess===false ? (context.accessReason||'Browser context is unavailable on this page.') : (context?.pageUrl||'Browser context is unavailable on this page.');
  document.querySelector('.context-dot')?.classList.toggle('blocked', context?.scriptAccess===false);
  if(context?.scriptAccess===false) setStatus($('composer-status'), context.accessReason||'This browser page cannot be scripted.', true);
  await loadSchemas(); await renderFeed(); await renderSnapshots();
}

function renderTargetFields(){
  const schema=schemas.find(s=>s.$id===$('target-kind').value); const kind=schemaKind(schema); const host=$('target-fields'); host.replaceChildren();
  if(kind==='url') return renderUrl(host);
  if(kind==='gps') return renderGps(host);
  if(kind==='youtube') return renderYoutube(host);
  return renderCustom(host,schema);
}

function renderUrl(host){
  let parsed; try{parsed=parseUrlTarget(context?.pageUrl||'https://example.com/')}catch{parsed=parseUrlTarget('https://example.com/')}
  const v=parsed.value; host.innerHTML=`<label>Bare URL<input id="url-base" type="url" value="${safe(v.url)}"></label><label>Query handling<select id="url-query-mode"><option value="ignore">Ignore all query variables</option><option value="selected">Use selected variables</option><option value="all">Use all variables</option></select></label><div id="query-list"></div><label>Fragment handling<select id="url-fragment-mode"><option value="ignore">Ignore fragment</option><option value="include">Include fragment</option></select></label><div class="actions"><button type="button" id="url-extract">Extract variables from URL</button></div>`;
  const q=host.querySelector('#query-list'); if(!v.queryParameters.length)q.innerHTML='<p class="muted">No query parameters detected.</p>';
  for(const p of v.queryParameters){const row=document.createElement('div');row.className='query-row';row.innerHTML=`<input type="checkbox" class="q-include"><input class="q-key" value="${safe(p.key)}" aria-label="Query key"><input class="q-value" value="${safe(p.value)}" aria-label="Query value">`;q.append(row)}
  host.querySelector('#url-extract').onclick=()=>{try{const p=parseUrlTarget(host.querySelector('#url-base').value);const list=host.querySelector('#query-list');list.replaceChildren();for(const x of p.value.queryParameters){const row=document.createElement('div');row.className='query-row';row.innerHTML=`<input type="checkbox" class="q-include"><input class="q-key" value="${safe(x.key)}"><input class="q-value" value="${safe(x.value)}">`;list.append(row)}host.querySelector('#url-base').value=p.value.url;}catch(e){setStatus($('composer-status'),e.message,true)}};
}

function renderGps(host){
  host.innerHTML=`<div class="two"><label>Latitude<input id="gps-lat" type="number" step="any"></label><label>Longitude<input id="gps-lon" type="number" step="any"></label></div><div class="two"><label>Radius (m, optional)<input id="gps-r" type="number" min="1" step="1" placeholder="default"></label><label>Label<input id="gps-label" type="text" placeholder="optional"></label></div><div class="actions"><button type="button" id="use-location">Use my location</button></div><p class="muted">A blank radius stores bare coordinates; matching uses your configured default gate.</p>`;
  host.querySelector('#use-location').onclick=()=>navigator.geolocation.getCurrentPosition(p=>{host.querySelector('#gps-lat').value=p.coords.latitude;host.querySelector('#gps-lon').value=p.coords.longitude;},e=>setStatus($('composer-status'),e.message,true),{enableHighAccuracy:true,timeout:10000});
}

function renderYoutube(host){
  const info=youtubeInfo(context?.pageUrl||'') || {videoId:'',videoUrl:''}; const now=Number.isFinite(context?.currentVideoTime)?context.currentVideoTime:null;
  host.innerHTML=`<label>Video ID<input id="yt-id" value="${safe(info.videoId)}"></label><label>Video URL<input id="yt-url" type="url" value="${safe(info.videoUrl)}"></label><div class="two"><label>Start seconds<input id="yt-start" type="number" min="0" step="0.1" value="${now==null?'':Math.round(now*10)/10}"></label><label>End seconds<input id="yt-end" type="number" min="0" step="0.1"></label></div><div class="actions"><button id="yt-use-now" type="button">Use current time</button><button id="yt-clear-time" type="button">Bare video</button></div>`;
  host.querySelector('#yt-use-now').onclick=async()=>{const live=await chrome.runtime.sendMessage({type:'xtratype:getContext'});if(live.ok&&Number.isFinite(live.context.currentVideoTime))host.querySelector('#yt-start').value=Math.round(live.context.currentVideoTime*10)/10};
  host.querySelector('#yt-clear-time').onclick=()=>{host.querySelector('#yt-start').value='';host.querySelector('#yt-end').value=''};
}

function renderCustom(host,schema){
  const intro=document.createElement('p');intro.className='muted';intro.textContent=schema['x-xtratype']?.description||`Structured ${schemaLabel(schema)} handle`;host.append(intro);
  for(const [name,def] of Object.entries(schema.properties||{})){
    const label=document.createElement('label');label.textContent=def.title||name; let input;
    if(Array.isArray(def.enum)){input=document.createElement('select');for(const value of def.enum){const o=document.createElement('option');o.value=value;o.textContent=value;input.append(o)}}
    else if((Array.isArray(def.type)?def.type:[def.type]).includes('boolean')){input=document.createElement('input');input.type='checkbox';}
    else{input=document.createElement('input');const types=Array.isArray(def.type)?def.type:[def.type];input.type=types.some(t=>t==='number'||t==='integer')?'number':'text';if(def.minimum!=null)input.min=def.minimum;if(def.maximum!=null)input.max=def.maximum;if(types.includes('integer'))input.step='1';}
    input.dataset.field=name; label.append(input); host.append(label);
  }
}

function buildTarget(){
  const schema=schemas.find(s=>s.$id===$('target-kind').value); const kind=schemaKind(schema);
  if(kind==='url'){
    const params=[...document.querySelectorAll('.query-row')].map(r=>({key:r.querySelector('.q-key').value,value:r.querySelector('.q-value').value,include:r.querySelector('.q-include').checked}));
    const raw=$('url-base').value; const t=parseUrlTarget(raw); t.value.queryMode=$('url-query-mode').value;t.value.queryParameters=params;t.value.fragmentMode=$('url-fragment-mode').value;return t;
  }
  if(kind==='gps')return makeGpsTarget($('gps-lat').value,$('gps-lon').value,$('gps-r').value,$('gps-label').value);
  if(kind==='youtube'){
    const raw=$('yt-url').value||`https://www.youtube.com/watch?v=${$('yt-id').value}`;const t=makeYoutubeTarget(raw,$('yt-start').value,$('yt-end').value);t.value.videoId=$('yt-id').value.trim()||t.value.videoId;t.value.videoUrl=`https://www.youtube.com/watch?v=${t.value.videoId}`;return t;
  }
  const value={}; for(const input of $('target-fields').querySelectorAll('[data-field]')){const def=schema.properties[input.dataset.field]||{};const types=Array.isArray(def.type)?def.type:[def.type]; value[input.dataset.field]=input.type==='checkbox'?input.checked:types.includes('number')||types.includes('integer')?(input.value===''?null:Number(input.value)):input.value}
  validateCustomValue(schema,value); return {kind:'custom',schemaId:schema.$id,value};
}

function validateFiles(files){const allowed=new Set(['image/png','image/jpeg','image/webp']);if(files.length>3)throw new Error('Choose no more than three images.');for(const f of files){if(!allowed.has(f.type))throw new Error('Only PNG, JPEG and WebP images are allowed.');if(f.size>8*1024*1024)throw new Error(`${f.name} is larger than 8 MiB.`)}}

async function saveAnnotation(){
  const body=$('comment').value.trim();if(!body)throw new Error('Write a comment first.');validateFiles(selectedFiles);const target=buildTarget();const s=await settings();const now=new Date().toISOString();const attachments=[],blobRecords=[];
  for(const file of selectedFiles){const rec=await addBlob(file,{name:file.name});blobRecords.push(rec);attachments.push({id:id('attachment'),name:file.name,type:file.type,size:file.size,blobId:rec.id,serverUrl:null})}
  let annotation={id:id('annotation'),recordType:'Context.Annotation',schemaVersion:2,target,targetKey:targetKey(target),highlightedText:$('highlighted-text').value.trim(),body,attachments,parentAnnotationId:null,author:s.author||'Local user',createdAt:now,updatedAt:now,syncState:s.autoSync?'pending':'local'};
  await put('annotations',annotation);await logEvent('annotation.created',{annotationId:annotation.id,targetKey:annotation.targetKey});
  setStatus($('composer-status'),'Saved locally.');
  if(s.autoSync){try{annotation=await syncAnnotation(annotation,blobRecords);setStatus($('composer-status'),'Saved locally and synced.')}catch(e){annotation.syncState='error';annotation.syncError=e.message;await put('annotations',annotation);setStatus($('composer-status'),`Saved locally; sync failed: ${e.message}`,true)}}
  $('comment').value='';selectedFiles=[];renderPreviews();await renderFeed();
  if(target.kind==='youtube'){const tabs=await chrome.tabs.query({active:true,currentWindow:true});if(tabs[0]?.url?.includes('youtube.com'))chrome.tabs.sendMessage(tabs[0].id,{type:'xtratype:refresh'}).catch(()=>{})}
}

async function renderFeed(){
  const host=$('annotation-list');host.replaceChildren();let items=await all('annotations');let currentTarget=null;try{currentTarget=buildTarget()}catch{}
  if(currentTarget){const key=targetKey(currentTarget);items=items.filter(a=>a.targetKey===key || (currentTarget.kind==='youtube'&&a.target?.kind==='youtube'&&a.target.value.videoId===currentTarget.value.videoId));}
  items.sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
  for(const a of items.slice(0,50)){const el=document.createElement('article');el.className='annotation';const time=a.target?.kind==='youtube'&&a.target.value.startSeconds!=null?` · ${formatTime(a.target.value.startSeconds)}`:'';el.innerHTML=`<div class="meta"><span>${safe(a.author||'Local')} · ${safe(a.target?.kind||'custom')}${time}</span><span>${safe(a.syncState||'local')}</span></div>${a.highlightedText?`<div class="quote">${safe(a.highlightedText.slice(0,500))}</div>`:''}<div class="body">${safe(a.body)}</div><div class="thumbs"></div>`;const thumbs=el.querySelector('.thumbs');for(const at of a.attachments||[]){let src=at.serverUrl||at.url;if(!src&&at.blobId){const br=await get('blobs',at.blobId);if(br?.blob)src=URL.createObjectURL(br.blob)}if(src){const img=document.createElement('img');img.src=src.startsWith('/')?(await settings()).apiBase.replace(/\/api\/?$/,'')+src:src;thumbs.append(img)}}host.append(el)}
  if(!items.length)host.innerHTML='<p class="muted">No local annotations match this target yet.</p>';
}

function renderPreviews(){const host=$('image-previews');host.replaceChildren();selectedFiles.forEach((f,i)=>{const d=document.createElement('div');d.className='preview';const img=document.createElement('img');img.src=URL.createObjectURL(f);const b=document.createElement('button');b.type='button';b.textContent='×';b.onclick=()=>{selectedFiles.splice(i,1);renderPreviews()};d.append(img,b);host.append(d)})}

async function pull(){try{
  let pushed=0;
  for(const a of await all('annotations')){if(a.syncState==='synced')continue;const blobs=[];for(const at of a.attachments||[]){if(at.blobId&&!at.serverUrl&&!at.url){const br=await get('blobs',at.blobId);if(br)blobs.push(br)}}try{await syncAnnotation({...a,syncState:'pending'},blobs);pushed++}catch{}}
  for(const r of await all('schemas')){const sc=r.schema||r;if(sc?.$id&&!sc.$id.startsWith('xtratype.anchor.')){try{await pushSchema(sc)}catch{}}}
  for(const snap of await all('snapshots')){if(snap.syncState==='synced')continue;try{const br=await get('blobs',snap.screenshotBlobId);const remote=await syncSnapshot(snap,br);await put('snapshots',{...snap,serverScreenshot:remote.screenshot||null,syncState:'synced'});}catch{}}
  const remote=await pullAnnotations();for(const a of remote)await put('annotations',{...a,syncState:'synced'});setStatus($('composer-status'),`Sync complete · pushed ${pushed}, pulled ${remote.length}.`);await loadSchemas();await renderFeed();await renderSnapshots();
}catch(e){setStatus($('composer-status'),`Local data is safe; sync failed: ${e.message}`,true)}}

async function makeVisibleSnapshot(){
  const tabs=await chrome.tabs.query({active:true,currentWindow:true});const tab=tabs[0];if(!tab?.id)throw new Error('No active tab.');const live=await chrome.runtime.sendMessage({type:'xtratype:getContext'});const shot=await chrome.runtime.sendMessage({type:'xtratype:captureVisible',windowId:tab.windowId});if(!shot.ok)throw new Error(shot.error);const extract=await chrome.runtime.sendMessage({type:'xtratype:pageExtract',tabId:tab.id});return persistSnapshot(live.context,extract,dataUrlToBlob(shot.dataUrl),'visible');
}

async function makeFullSnapshot(){
  const tabs=await chrome.tabs.query({active:true,currentWindow:true});const tab=tabs[0];if(!tab?.id)throw new Error('No active tab.');const live=await chrome.runtime.sendMessage({type:'xtratype:getContext'});const c=live.context,m=c.page,v=c.viewport;const dpr=Math.max(1,Number(v.devicePixelRatio||1));const maxW=Math.min(m.width,Math.floor(14000/dpr)),maxH=Math.min(m.height,Math.floor(28000/dpr));const positions=(dim,view)=>{const max=Math.max(0,dim-view),a=[];for(let p=0;p<max;p+=view)a.push(p);a.push(max);return [...new Set(a)]};const xs=positions(maxW,v.width),ys=positions(maxH,v.height);if(xs.length*ys.length>30)throw new Error('Page requires more than 30 screenshot tiles; resize the window or use visible capture.');
  const tiles=[];let scale=1;for(const y of ys){for(const x of xs){await chrome.runtime.sendMessage({type:'xtratype:scrollTo',tabId:tab.id,x,y});await new Promise(r=>setTimeout(r,140));const res=await chrome.runtime.sendMessage({type:'xtratype:captureVisible',windowId:tab.windowId});if(!res.ok)throw new Error(res.error);const bmp=await createImageBitmap(dataUrlToBlob(res.dataUrl));scale=bmp.width/v.width;tiles.push({x,y,bmp});}}
  await chrome.runtime.sendMessage({type:'xtratype:scrollTo',tabId:tab.id,x:v.scrollX,y:v.scrollY});const canvas=document.createElement('canvas');canvas.width=Math.round(maxW*scale);canvas.height=Math.round(maxH*scale);const ctx=canvas.getContext('2d');for(const t of tiles)ctx.drawImage(t.bmp,Math.round(t.x*scale),Math.round(t.y*scale));const blob=await new Promise(r=>canvas.toBlob(r,'image/png'));const extract=await chrome.runtime.sendMessage({type:'xtratype:pageExtract',tabId:tab.id});return persistSnapshot(c,extract,blob,'full-page');
}

async function persistSnapshot(c,extract,blob,mode){
  const br=await addBlob(blob,{name:`snapshot-${Date.now()}.png`});let t;try{t=parseUrlTarget(c.pageUrl)}catch{throw new Error('Snapshots require an HTTP(S) page.')}const snap={id:id('snapshot'),recordType:'Revision.Snapshot',schemaVersion:1,pageKey:targetKey(t),url:c.pageUrl,title:c.title,capturedAt:new Date().toISOString(),mode,metrics:{viewport:c.viewport,page:c.page},renderedText:extract.text||'',renderedHtml:extract.html||'',screenshotBlobId:br.id,syncState:'pending'};await put('snapshots',snap);const s=await settings();if(s.autoSync){try{const remote=await syncSnapshot(snap,br);snap.serverScreenshot=remote.screenshot||null;snap.syncState='synced';await put('snapshots',snap)}catch(e){snap.syncState='error';snap.syncError=e.message;await put('snapshots',snap)}}await renderSnapshots();return snap;
}

function dataUrlToBlob(dataUrl){const [head,b64]=dataUrl.split(',');const type=/data:([^;]+)/.exec(head)?.[1]||'image/png';const bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));return new Blob([bytes],{type})}

async function renderSnapshots(){
  const host=$('snapshot-list'),latest=$('latest-snapshot');host.replaceChildren();latest.replaceChildren();if(!context?.pageUrl)return;let pageKey;try{pageKey=targetKey(parseUrlTarget(context.pageUrl))}catch{return}const snaps=(await byIndex('snapshots','pageKey',pageKey)).sort((a,b)=>String(b.capturedAt).localeCompare(String(a.capturedAt)));
  for(const [i,s] of snaps.entries()){const br=await get('blobs',s.screenshotBlobId);const url=br?.blob?URL.createObjectURL(br.blob):'';const row=document.createElement('div');row.className='snapshot';row.innerHTML=`${url?`<img src="${url}">`:'<div></div>'}<div><strong>${safe(s.mode)}</strong><br><small>${new Date(s.capturedAt).toLocaleString()} · ${safe(s.syncState||'local')}</small><br><span class="muted">${Math.round((s.renderedText?.length||0)/1000)}k text chars</span></div>`;row.onclick=()=>showSnapshot(s);host.append(row);if(i===0&&url){const img=document.createElement('img');img.src=url;latest.append(img)}}if(!snaps.length)host.innerHTML='<p class="muted">No snapshots for this page yet.</p>';
}

async function showSnapshot(s){const br=await get('blobs',s.screenshotBlobId);if(!br?.blob)return;if(selectedSnapshotUrl)URL.revokeObjectURL(selectedSnapshotUrl);selectedSnapshotUrl=URL.createObjectURL(br.blob);$('latest-snapshot').innerHTML=`<img src="${selectedSnapshotUrl}"><p class="muted">${safe(s.title)} · ${new Date(s.capturedAt).toLocaleString()}</p>`}

async function compareLatest(){
  if(!context?.pageUrl)throw new Error('No active page.');const key=targetKey(parseUrlTarget(context.pageUrl));const snaps=(await byIndex('snapshots','pageKey',key)).sort((a,b)=>String(b.capturedAt).localeCompare(String(a.capturedAt)));if(snaps.length<2)throw new Error('Capture at least two snapshots first.');const [a,b]=await Promise.all([get('blobs',snaps[0].screenshotBlobId),get('blobs',snaps[1].screenshotBlobId)]);if(!a?.blob||!b?.blob)throw new Error('Snapshot image is missing.');const [ia,ib]=await Promise.all([createImageBitmap(a.blob),createImageBitmap(b.blob)]);const w=Math.min(ia.width,ib.width,1800),h=Math.min(ia.height,ib.height,12000);const c=$('diff-canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(ib,0,0,w,h);const before=ctx.getImageData(0,0,w,h);ctx.clearRect(0,0,w,h);ctx.drawImage(ia,0,0,w,h);const after=ctx.getImageData(0,0,w,h);const out=ctx.createImageData(w,h);let changed=0;for(let i=0;i<after.data.length;i+=4){const d=Math.abs(after.data[i]-before.data[i])+Math.abs(after.data[i+1]-before.data[i+1])+Math.abs(after.data[i+2]-before.data[i+2]);if(d>60){changed++;out.data[i]=230;out.data[i+1]=40;out.data[i+2]=60;out.data[i+3]=210}else{out.data[i]=after.data[i]*.45;out.data[i+1]=after.data[i+1]*.45;out.data[i+2]=after.data[i+2]*.45;out.data[i+3]=180}}ctx.putImageData(out,0,0);$('diff-score').textContent=`${(changed/(w*h)*100).toFixed(2)}% pixels changed`;$('compare-card').classList.remove('hidden');
}

function renderSchemaList(){const host=$('schema-list');host.replaceChildren();for(const s of schemas){const el=document.createElement('div');el.className='schema';el.innerHTML=`<strong>${safe(schemaLabel(s))}</strong><br><code>${safe(s.$id)}</code><div class="muted">${safe(Object.keys(s.properties||{}).join(', '))}</div>`;host.append(el)}}

async function installSchema(file){const text=await file.text();let parsed;try{parsed=JSON.parse(text)}catch{throw new Error('The selected file is not valid JSON.')}const s=normalizeCustomSchema(parsed);await put('schemas',{id:s.$id,schema:s,updatedAt:new Date().toISOString()});try{await pushSchema(s);setStatus($('schema-status'),`Installed and synced ${schemaLabel(s)}.`)}catch(e){setStatus($('schema-status'),`Installed locally; server sync failed: ${e.message}`,true)}await loadSchemas()}

async function loadSettingsForm(){const s=await settings();$('api-base').value=s.apiBase;$('author').value=s.author;$('gps-radius').value=s.defaultGpsRadius;$('auto-sync').checked=s.autoSync}

function exportMetadata(items){const blob=new Blob([JSON.stringify(items,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`xtratype-export-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}

$('target-kind').onchange=()=>{renderTargetFields();renderFeed()};$('refresh-context').onclick=refreshContext;$('pull-annotations').onclick=e=>{e.preventDefault();e.stopPropagation();pull()};
$('launch-quick-bar').onclick=async()=>{const res=await chrome.runtime.sendMessage({type:'xtratype:openQuickBar'}).catch(e=>({ok:false,error:e.message}));if(!res?.ok)setStatus($('composer-status'),res?.error||'Could not open quick bar.',true)};
$('composer').onsubmit=e=>{e.preventDefault();saveAnnotation().catch(err=>setStatus($('composer-status'),err.message,true))};
$('clear-composer').onclick=()=>{$('comment').value='';$('highlighted-text').value='';selectedFiles=[];renderPreviews()};
$('images').onchange=()=>{try{const incoming=[...$('images').files];validateFiles(incoming);selectedFiles=incoming;renderPreviews();setStatus($('composer-status'),'')}catch(e){setStatus($('composer-status'),e.message,true)}};
$('capture-visible').onclick=async()=>{setStatus($('capture-status'),'Capturing visible viewport…');try{await makeVisibleSnapshot();setStatus($('capture-status'),'Snapshot saved.')}catch(e){setStatus($('capture-status'),e.message,true)}};
$('capture-full').onclick=async()=>{setStatus($('capture-status'),'Scrolling and stitching page…');try{await makeFullSnapshot();setStatus($('capture-status'),'Full-page snapshot saved.')}catch(e){setStatus($('capture-status'),e.message,true)}};
$('compare-latest').onclick=()=>compareLatest().catch(e=>setStatus($('capture-status'),e.message,true));
$('schema-file').onchange=()=>{const f=$('schema-file').files[0];if(f)installSchema(f).catch(e=>setStatus($('schema-status'),e.message,true))};
$('settings-form').onsubmit=async e=>{e.preventDefault();const current=await settings();const next={...current,apiBase:$('api-base').value.replace(/\/$/,''),author:$('author').value||'Local user',defaultGpsRadius:Number($('gps-radius').value)||75,autoSync:$('auto-sync').checked};try{const u=new URL(next.apiBase), origin=u.origin+'/*';if(!['localhost','127.0.0.1'].includes(u.hostname))await chrome.permissions.request({origins:[origin]});}catch{}await saveSettings(next);setStatus($('settings-status'),'Settings saved. The XT toolbar button opens the full side panel.')};
$('test-server').onclick=async()=>{try{const h=await serverHealth();setStatus($('settings-status'),`Connected · ${h.service}`)}catch(e){setStatus($('settings-status'),e.message,true)}};
$('export-local').onclick=async()=>exportMetadata({exportedAt:new Date().toISOString(),annotations:await all('annotations'),schemas:await all('schemas'),snapshots:await all('snapshots'),events:await all('events')});

await loadSettingsForm();await refreshContext();
