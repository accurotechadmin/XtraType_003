import { id, atomicPut, all } from "./db.js";
import {
  targetKey,
  parseUrlTarget,
  makeGpsTarget,
  makeYoutubeTarget,
  makeTimeTarget,
} from "./anchors.js";
import { normalizeCustomSchema, validateCustomValue } from "./schemas.js";
export function validateTarget(t, schema) {
  if (!t || typeof t.value !== "object" || !t.value || Array.isArray(t.value))
    throw new Error("A valid target is required.");
  const v = t.value;
  if (t.kind === "url") {
    const p = parseUrlTarget(v.url);
    if (
      p.value.url !== v.url ||
      !["ignore", "selected", "all"].includes(v.queryMode) ||
      !["ignore", "include"].includes(v.fragmentMode)
    )
      throw new Error("Invalid URL anchor.");
    if (
      !Array.isArray(v.queryParameters) ||
      v.queryParameters.some(
        (x) =>
          typeof x.key !== "string" ||
          typeof x.value !== "string" ||
          typeof x.include !== "boolean",
      )
    )
      throw new Error("Invalid query parameters.");
    if (v.fragment != null && typeof v.fragment !== "string")
      throw new Error("Invalid fragment.");
  } else if (t.kind === "gps") {
    if (
      typeof v.latitude !== "number" ||
      typeof v.longitude !== "number" ||
      (v.radiusMeters != null && typeof v.radiusMeters !== "number")
    )
      throw new Error("Coordinates and radius must be numbers.");
    makeGpsTarget(v.latitude, v.longitude, v.radiusMeters, v.label);
  } else if (t.kind === "youtube") {
    const p = makeYoutubeTarget(v.videoUrl, v.startSeconds, v.endSeconds);
    if (
      p.value.videoId !== v.videoId ||
      [v.startSeconds, v.endSeconds].some(
        (x) => x != null && typeof x !== "number",
      )
    )
      throw new Error("Video ID/URL/time mismatch.");
  } else if (t.kind === "time") {
    const p = makeTimeTarget(v.timestamp, v.startTime, v.endTime);
    if (
      p.value.timestamp !== (v.timestamp ?? null) ||
      p.value.startTime !== (v.startTime ?? null) ||
      p.value.endTime !== (v.endTime ?? null)
    )
      throw new Error("Time target must use canonical ISO timestamps.");
  } else if (t.kind === "custom") {
    if (!schema || schema.$id !== t.schemaId)
      throw new Error("Install this target schema before writing.");
    validateCustomValue(normalizeCustomSchema(schema), v);
  } else throw new Error("Unknown target kind.");
  if (t.kind !== "custom" && t.schemaId !== `xtratype.anchor.${t.kind}@1`)
    throw new Error("Target schema mismatch.");
  return t;
}
export function validateImages(files) {
  if (files.length > 3) throw new Error("Choose no more than three images.");
  for (const f of files)
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(f.type) ||
      f.size > 8 * 1024 * 1024 ||
      f.size === 0
    )
      throw new Error(
        "Images must be nonempty PNG/JPEG/WebP files up to 8 MiB.",
      );
}
export async function createAnnotation({
  target,
  body,
  highlightedText = "",
  files = [],
  parentAnnotationId = null,
  author = "Local user",
  autoSync = true,
  source = "panel",
}) {
  body = String(body || "").trim();
  if (!body || new TextEncoder().encode(body).length > 80000)
    throw new Error(
      "Comment is required and must be at most 80,000 UTF-8 bytes.",
    );
  if (new TextEncoder().encode(highlightedText).length > 80000)
    throw new Error("Quoted text is too long.");
  const stored =
    target.kind === "custom"
      ? (await all("schemas")).find(
          (r) => (r.schema || r).$id === target.schemaId,
        )
      : null;
  validateTarget(target, stored?.schema || stored);
  validateImages(files);
  const now = new Date().toISOString();
  const blobs = files.map((file) => ({
    id: id("blob"),
    blob: file,
    name: file.name || "image",
    type: file.type,
    size: file.size,
    createdAt: now,
  }));
  const annotation = {
    id: id("annotation"),
    recordType: "Context.Annotation",
    schemaVersion: 2,
    target,
    targetKey: targetKey(target),
    body,
    highlightedText,
    author: String(author).slice(0, 200),
    attachments: blobs.map((b) => ({
      id: id("attachment"),
      blobId: b.id,
      name: b.name,
      type: b.type,
      size: b.size,
      serverUrl: null,
    })),
    parentAnnotationId,
    createdAt: now,
    updatedAt: now,
    syncState: autoSync ? "pending" : "local",
  };
  const event = {
    id: id("event"),
    type: "annotation.created",
    data: {
      annotationId: annotation.id,
      targetKey: annotation.targetKey,
      source,
    },
    occurredAt: now,
  };
  await atomicPut([
    ...blobs.map((b) => ["blobs", b]),
    ["annotations", annotation],
    ["events", event],
  ]);
  return annotation;
}
