const DEFAULT_RADIUS = 75;

export function parseUrlTarget(rawUrl) {
  const u = new URL(rawUrl);
  if (!/^https?:$/.test(u.protocol)) throw new Error('URL anchors require HTTP(S).');
  const params = [];
  for (const [key, value] of u.searchParams.entries()) params.push({key, value, include: false});
  return {
    kind: 'url', schemaId: 'xtratype.anchor.url@1',
    value: {url: `${u.origin}${u.pathname}`, queryMode: 'ignore', queryParameters: params, fragmentMode: 'ignore', fragment: u.hash ? u.hash.slice(1) : null}
  };
}

export function youtubeInfo(rawUrl) {
  try {
    const u = new URL(rawUrl);
    let videoId = '';
    if (u.hostname.includes('youtu.be')) videoId = u.pathname.split('/').filter(Boolean)[0] || '';
    if (u.hostname.includes('youtube.com')) videoId = u.searchParams.get('v') || (u.pathname.startsWith('/shorts/') ? u.pathname.split('/')[2] : '');
    if (!videoId) return null;
    return {videoId, videoUrl: `https://www.youtube.com/watch?v=${videoId}`};
  } catch { return null; }
}

export function makeYoutubeTarget(rawUrl, startSeconds = null, endSeconds = null) {
  const info = youtubeInfo(rawUrl);
  if (!info) throw new Error('This is not a recognized YouTube video URL.');
  const start = numberOrNull(startSeconds), end = numberOrNull(endSeconds);
  if (end !== null && start === null) throw new Error('Set a start time before an end time.');
  if (start !== null && end !== null && end < start) throw new Error('End time must be after start time.');
  return {kind: 'youtube', schemaId: 'xtratype.anchor.youtube@1', value: {...info, startSeconds: start, endSeconds: end}};
}

export function makeGpsTarget(latitude, longitude, radiusMeters = null, label = '') {
  const lat = Number(latitude), lon = Number(longitude), r = numberOrNull(radiusMeters);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) throw new Error('Latitude must be between -90 and 90.');
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) throw new Error('Longitude must be between -180 and 180.');
  if (r !== null && (!Number.isFinite(r) || r <= 0)) throw new Error('Radius must be positive.');
  return {kind: 'gps', schemaId: 'xtratype.anchor.gps@1', value: {latitude: lat, longitude: lon, radiusMeters: r, label: String(label || '')}};
}

function numberOrNull(value) {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value); if (!Number.isFinite(n) || n < 0) throw new Error('Time/radius values must be non-negative numbers.'); return n;
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(k => [k, stable(value[k])]));
  return value;
}

export function targetKey(target) {
  if (target.kind === 'url') {
    const v = target.value; const u = new URL(v.url);
    const params = (v.queryParameters || []).filter(p => v.queryMode === 'all' || (v.queryMode === 'selected' && p.include));
    params.sort((a,b) => a.key.localeCompare(b.key) || a.value.localeCompare(b.value));
    for (const p of params) u.searchParams.append(p.key, p.value);
    if (v.fragmentMode === 'include' && v.fragment) u.hash = v.fragment;
    return `url:${u.toString()}`;
  }
  if (target.kind === 'gps') {
    const v = target.value; return `gps:${Number(v.latitude).toFixed(6)},${Number(v.longitude).toFixed(6)}${v.radiusMeters ? `@${Number(v.radiusMeters)}` : ''}`;
  }
  if (target.kind === 'youtube') {
    const v = target.value; const s = v.startSeconds == null ? '' : `@${Number(v.startSeconds).toFixed(3)}`; const e = v.endSeconds == null ? '' : `-${Number(v.endSeconds).toFixed(3)}`;
    return `youtube:${v.videoId}${s}${e}`;
  }
  return `custom:${target.schemaId}:${JSON.stringify(stable(target.value))}`;
}

export function haversineMeters(aLat, aLon, bLat, bLon) {
  const R = 6371000, rad = x => x * Math.PI / 180;
  const dLat = rad(bLat-aLat), dLon = rad(bLon-aLon);
  const q = Math.sin(dLat/2)**2 + Math.cos(rad(aLat))*Math.cos(rad(bLat))*Math.sin(dLon/2)**2;
  return 2 * R * Math.asin(Math.sqrt(q));
}

export function gpsMatches(target, latitude, longitude, defaultRadius = DEFAULT_RADIUS) {
  if (target.kind !== 'gps') return false;
  const v = target.value; const radius = Number(v.radiusMeters || defaultRadius);
  return haversineMeters(Number(v.latitude), Number(v.longitude), Number(latitude), Number(longitude)) <= radius;
}
