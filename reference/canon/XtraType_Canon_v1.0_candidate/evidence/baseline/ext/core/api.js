import {get, put} from './db.js';

export async function settings() {
  const defaults = {apiBase: 'http://localhost:8787/api', author: 'Local user', defaultGpsRadius: 75, autoSync: true};
  const stored = await chrome.storage.local.get('xtratypeSettings');
  return {...defaults, ...(stored.xtratypeSettings || {})};
}

export async function saveSettings(next) { await chrome.storage.local.set({xtratypeSettings: next}); return next; }

async function api(path, options = {}) {
  const s = await settings();
  const url = `${s.apiBase.replace(/\/$/,'')}/${path.replace(/^\//,'')}`;
  const res = await fetch(url, options);
  let data = null; try { data = await res.json(); } catch {}
  if (!res.ok) throw new Error(data?.message || `Server returned ${res.status}.`);
  return data;
}

export async function syncAnnotation(annotation, blobs = []) {
  const form = new FormData();
  const wire = {...annotation, syncState: 'pending', attachments: (annotation.attachments || []).filter(a => a.serverUrl || a.url).map(a => ({...a, url: a.serverUrl || a.url}))};
  form.append('payload', JSON.stringify(wire));
  for (const blobRecord of blobs) form.append('images[]', blobRecord.blob, blobRecord.name || 'image');
  const data = await api('annotations.php', {method:'POST', body:form, headers:{'X-XtraType-Client':'chrome-extension'}});
  const merged = {...annotation, ...data.item, attachments: data.item.attachments || annotation.attachments, syncState:'synced'};
  await put('annotations', merged);
  return merged;
}

export async function pullAnnotations() { return (await api('annotations.php')).items || []; }
export async function pullSchemas() { return (await api('schemas.php')).items || []; }
export async function pushSchema(schema) { return (await api('schemas.php', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({schema})})).schema; }

export async function syncSnapshot(snapshot, screenshotBlobRecord) {
  const form = new FormData();
  const payload = {...snapshot}; delete payload.screenshotBlobId;
  form.append('payload', JSON.stringify(payload));
  if (screenshotBlobRecord?.blob) form.append('screenshot', screenshotBlobRecord.blob, `snapshot-${snapshot.id.split(':').pop()}.png`);
  return (await api('snapshots.php', {method:'POST', body:form})).item;
}

export async function serverHealth() { return api('health.php'); }
