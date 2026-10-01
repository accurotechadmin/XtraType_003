const DEFAULT_RADIUS = 75;

export function parseUrlTarget(rawUrl) {
  const u = new URL(rawUrl);
  if (!/^https?:$/.test(u.protocol))
    throw new Error("URL anchors require HTTP(S).");
  const params = [];
  for (const [key, value] of u.searchParams.entries())
    params.push({ key, value, include: false });
  return {
    kind: "url",
    schemaId: "xtratype.anchor.url@1",
    value: {
      url: `${u.origin}${u.pathname}`,
      queryMode: "ignore",
      queryParameters: params,
      fragmentMode: "ignore",
      fragment: u.hash ? u.hash.slice(1) : null,
    },
  };
}

export function youtubeInfo(rawUrl) {
  try {
    const u = new URL(rawUrl);
    let videoId = "";
    if (u.hostname === "youtu.be")
      videoId = u.pathname.split("/").filter(Boolean)[0] || "";
    if (u.hostname === "youtube.com" || u.hostname.endsWith(".youtube.com"))
      videoId =
        u.searchParams.get("v") ||
        (u.pathname.startsWith("/shorts/") ? u.pathname.split("/")[2] : "");
    if (
      !/^https?:$/.test(u.protocol) ||
      !/^[A-Za-z0-9_-]{1,128}$/.test(videoId)
    )
      return null;
    return { videoId, videoUrl: `https://www.youtube.com/watch?v=${videoId}` };
  } catch {
    return null;
  }
}

export function makeYoutubeTarget(
  rawUrl,
  startSeconds = null,
  endSeconds = null,
) {
  const info = youtubeInfo(rawUrl);
  if (!info) throw new Error("This is not a recognized YouTube video URL.");
  const start = numberOrNull(startSeconds),
    end = numberOrNull(endSeconds);
  if (end !== null && start === null)
    throw new Error("Set a start time before an end time.");
  if (start !== null && end !== null && end < start)
    throw new Error("End time must be after start time.");
  return {
    kind: "youtube",
    schemaId: "xtratype.anchor.youtube@1",
    value: { ...info, startSeconds: start, endSeconds: end },
  };
}


export function makeTimeTarget(
  timestamp = null,
  startTime = null,
  endTime = null,
) {
  const at = isoTimeOrNull(timestamp, "Timestamp"),
    start = isoTimeOrNull(startTime, "Start time"),
    end = isoTimeOrNull(endTime, "End time");
  const range = start !== null || end !== null;
  if (range) {
    if (at !== null)
      throw new Error("Choose either a single timestamp or a timeframe, not both.");
    if (start === null || end === null)
      throw new Error("A timeframe requires both a start and an end time.");
    if (new Date(end).getTime() <= new Date(start).getTime())
      throw new Error("End time must be after start time.");
    return {
      kind: "time",
      schemaId: "xtratype.anchor.time@1",
      value: { timestamp: null, startTime: start, endTime: end },
    };
  }
  if (at === null) throw new Error("A timestamp is required.");
  return {
    kind: "time",
    schemaId: "xtratype.anchor.time@1",
    value: { timestamp: at, startTime: null, endTime: null },
  };
}

function isoTimeOrNull(value, label) {
  if (value === "" || value === null || value === undefined) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(d.getTime())) throw new Error(`${label} is invalid.`);
  return d.toISOString();
}

export function makeGpsTarget(
  latitude,
  longitude,
  radiusMeters = null,
  label = "",
) {
  if (
    latitude === null ||
    longitude === null ||
    String(latitude).trim() === "" ||
    String(longitude).trim() === ""
  )
    throw new Error("GPS coordinates are required.");
  const lat = Number(latitude),
    lon = Number(longitude),
    r = numberOrNull(radiusMeters);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90)
    throw new Error("Latitude must be between -90 and 90.");
  if (!Number.isFinite(lon) || lon < -180 || lon > 180)
    throw new Error("Longitude must be between -180 and 180.");
  if (r !== null && (!Number.isFinite(r) || r <= 0))
    throw new Error("Radius must be positive.");
  return {
    kind: "gps",
    schemaId: "xtratype.anchor.gps@1",
    value: {
      latitude: lat,
      longitude: lon,
      radiusMeters: r,
      label: String(label || ""),
    },
  };
}

function numberOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0)
    throw new Error("Time/radius values must be non-negative numbers.");
  return n;
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((k) => [k, stable(value[k])]),
    );
  return value;
}

export function targetKey(target) {
  if (target.kind === "url") {
    const v = target.value;
    const u = new URL(v.url);
    const params = (v.queryParameters || []).filter(
      (p) => v.queryMode === "all" || (v.queryMode === "selected" && p.include),
    );
    params.sort(
      (a, b) => a.key.localeCompare(b.key) || a.value.localeCompare(b.value),
    );
    for (const p of params) u.searchParams.append(p.key, p.value);
    if (v.fragmentMode === "include" && v.fragment) u.hash = v.fragment;
    return `url:${u.toString()}`;
  }
  if (target.kind === "gps") {
    const v = target.value;
    return `gps:${Number(v.latitude).toFixed(6)},${Number(v.longitude).toFixed(6)}${v.radiusMeters ? `@${Number(v.radiusMeters)}` : ""}`;
  }
  if (target.kind === "youtube") {
    const v = target.value;
    const s =
      v.startSeconds == null ? "" : `@${Number(v.startSeconds).toFixed(3)}`;
    const e = v.endSeconds == null ? "" : `-${Number(v.endSeconds).toFixed(3)}`;
    return `youtube:${v.videoId}${s}${e}`;
  }
  if (target.kind === "time") {
    const v = target.value;
    if (v.timestamp) return `time:${v.timestamp}`;
    return `time:${v.startTime}/${v.endTime}`;
  }
  return `custom:${target.schemaId}:${JSON.stringify(stable(target.value))}`;
}

export function haversineMeters(aLat, aLon, bLat, bLon) {
  const R = 6371000,
    rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(bLat - aLat),
    dLon = rad(bLon - aLon);
  const q =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(q));
}

export function gpsMatches(
  target,
  latitude,
  longitude,
  defaultRadius = DEFAULT_RADIUS,
) {
  if (target.kind !== "gps") return false;
  const v = target.value;
  const radius = Number(v.radiusMeters || defaultRadius);
  return (
    haversineMeters(
      Number(v.latitude),
      Number(v.longitude),
      Number(latitude),
      Number(longitude),
    ) <= radius
  );
}

// Applicability is deliberately separate from the stable persisted identity.
export function urlTargetMatchesPage(target, rawPageUrl) {
  if (target?.kind !== "url") return false;
  let page;
  try {
    page = new URL(rawPageUrl);
  } catch {
    return false;
  }
  const v = target.value || {};
  if (`${page.origin}${page.pathname}` !== v.url) return false;
  if (v.fragmentMode === "include" && (v.fragment || "") !== page.hash.slice(1))
    return false;
  if (v.queryMode === "ignore") return true;
  const chosen = (v.queryParameters || []).filter(
    (p) => v.queryMode === "all" || p.include,
  );
  const pool = [...page.searchParams].map(([key, value]) => ({
    key,
    value,
    used: false,
  }));
  if (v.queryMode === "all" && pool.length !== chosen.length) return false;
  return chosen.every((p) => {
    const hit = pool.find(
      (x) => !x.used && x.key === p.key && x.value === p.value,
    );
    if (!hit) return false;
    hit.used = true;
    return true;
  });
}
