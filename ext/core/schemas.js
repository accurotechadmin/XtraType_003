export const BUILTIN = [
  {
    $id: "xtratype.anchor.url@1",
    title: "URL",
    type: "object",
    required: ["url"],
    properties: {
      url: { type: "string", title: "Bare URL" },
      queryMode: {
        type: "string",
        title: "Query matching",
        enum: ["ignore", "selected", "all"],
      },
      fragmentMode: {
        type: "string",
        title: "Fragment",
        enum: ["ignore", "include"],
      },
    },
    "x-xtratype": { label: "URL", kind: "url" },
  },
  {
    $id: "xtratype.anchor.gps@1",
    title: "GPS area",
    type: "object",
    required: ["latitude", "longitude"],
    properties: {
      latitude: {
        type: "number",
        title: "Latitude",
        minimum: -90,
        maximum: 90,
      },
      longitude: {
        type: "number",
        title: "Longitude",
        minimum: -180,
        maximum: 180,
      },
      radiusMeters: {
        type: ["number", "null"],
        title: "Radius (m)",
        minimum: 1,
      },
      label: { type: "string", title: "Label" },
    },
    "x-xtratype": { label: "GPS", kind: "gps", defaultRadiusMeters: 75 },
  },
  {
    $id: "xtratype.anchor.time@1",
    title: "Time / timeframe",
    type: "object",
    properties: {
      timestamp: { type: ["string", "null"], title: "Timestamp" },
      startTime: { type: ["string", "null"], title: "Start time" },
      endTime: { type: ["string", "null"], title: "End time" },
    },
    "x-xtratype": {
      label: "Time",
      kind: "time",
      description: "A generic moment or bounded timeframe that is not tied to a URL, location, or video.",
    },
  },
  {
    $id: "xtratype.anchor.youtube@1",
    title: "YouTube video/time",
    type: "object",
    required: ["videoId"],
    properties: {
      videoId: { type: "string", title: "Video ID" },
      videoUrl: { type: "string", title: "Video URL" },
      startSeconds: {
        type: ["number", "null"],
        title: "Start (seconds)",
        minimum: 0,
      },
      endSeconds: {
        type: ["number", "null"],
        title: "End (seconds)",
        minimum: 0,
      },
    },
    "x-xtratype": { label: "YouTube video", kind: "youtube" },
  },
];

const object = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const forbidden = new Set(["__proto__", "constructor", "prototype"]);
export function normalizeCustomSchema(schema) {
  if (
    !object(schema) ||
    typeof schema.$id !== "string" ||
    !schema.$id.trim() ||
    schema.$id.length > 512
  )
    throw new Error("Schema requires a bounded string $id.");
  if (schema.$id.startsWith("xtratype.anchor."))
    throw new Error("Built-in IDs are reserved.");
  if (
    schema.type !== "object" ||
    !object(schema.properties) ||
    Object.keys(schema.properties).length > 50
  )
    throw new Error(
      "Schema requires an object with at most 50 primitive properties.",
    );
  const rootKeys = new Set([
    "$schema",
    "$id",
    "title",
    "description",
    "type",
    "properties",
    "required",
    "additionalProperties",
    "x-xtratype",
  ]);
  for (const k of Object.keys(schema))
    if (!rootKeys.has(k)) throw new Error(`Unsupported schema keyword: ${k}`);
  if (
    schema.additionalProperties !== undefined &&
    typeof schema.additionalProperties !== "boolean"
  )
    throw new Error("additionalProperties must be boolean.");
  if (
    schema.required !== undefined &&
    (!Array.isArray(schema.required) ||
      schema.required.some(
        (k) => typeof k !== "string" || !Object.hasOwn(schema.properties, k),
      ))
  )
    throw new Error("Required fields must exist.");
  const allowed = new Set(["string", "number", "integer", "boolean", "null"]);
  const keys = new Set([
    "type",
    "title",
    "description",
    "enum",
    "minimum",
    "maximum",
    "minLength",
    "maxLength",
    "default",
  ]);
  for (const [name, def] of Object.entries(schema.properties)) {
    if (forbidden.has(name) || !object(def))
      throw new Error("Invalid property definition.");
    for (const key of Object.keys(def))
      if (!keys.has(key)) throw new Error(`Unsupported keyword ${name}.${key}`);
    const types = Array.isArray(def.type) ? def.type : [def.type || "string"];
    if (
      !types.length ||
      types.some((t) => !allowed.has(t)) ||
      types.filter((t) => t !== "null").length !== 1
    )
      throw new Error(`Unsupported type for ${name}.`);
    for (const k of ["minimum", "maximum", "minLength", "maxLength"])
      if (
        def[k] !== undefined &&
        (!Number.isFinite(def[k]) ||
          (k.endsWith("Length") && (!Number.isInteger(def[k]) || def[k] < 0)))
      )
        throw new Error(`Invalid bound ${name}.${k}`);
    if (def.minimum > def.maximum || def.minLength > def.maxLength)
      throw new Error(`Reversed bounds for ${name}.`);
    if (
      def.enum !== undefined &&
      (!Array.isArray(def.enum) ||
        !def.enum.length ||
        def.enum.length > 100 ||
        def.enum.some(
          (v) =>
            v !== null && !["string", "number", "boolean"].includes(typeof v),
        ))
    )
      throw new Error(`Invalid enum for ${name}.`);
    for (const v of [
      ...(def.enum || []),
      ...(Object.hasOwn(def, "default") ? [def.default] : []),
    ])
      validateField(def, v, name);
  }
  if (schema["x-xtratype"]?.kind && schema["x-xtratype"].kind !== "custom")
    throw new Error("Custom schemas cannot claim a built-in kind.");
  return {
    ...schema,
    "x-xtratype": {
      ...schema["x-xtratype"],
      kind: "custom",
      label: schema["x-xtratype"]?.label || schema.title || schema.$id,
    },
  };
}
function validateField(def, v, name) {
  const types = Array.isArray(def.type) ? def.type : [def.type || "string"];
  const matches = types.some((t) =>
    t === "null"
      ? v === null
      : t === "integer"
        ? Number.isInteger(v)
        : t === "number"
          ? typeof v === "number" && Number.isFinite(v)
          : typeof v === t,
  );
  if (!matches) throw new Error(`${name} has the wrong type.`);
  if (def.enum && !def.enum.some((x) => Object.is(x, v)))
    throw new Error(`${name} is not an allowed value.`);
  if (
    typeof v === "number" &&
    ((def.minimum != null && v < def.minimum) ||
      (def.maximum != null && v > def.maximum))
  )
    throw new Error(`${name} is outside its allowed range.`);
  if (
    typeof v === "string" &&
    ((def.minLength != null && [...v].length < def.minLength) ||
      (def.maxLength != null && [...v].length > def.maxLength))
  )
    throw new Error(`${name} has an invalid length.`);
}
export function validateCustomValue(schema, value) {
  if (!object(value)) throw new Error("Custom target must be an object.");
  for (const k of schema.required || [])
    if (value[k] === undefined || value[k] === null || value[k] === "")
      throw new Error(`${k} is required.`);
  for (const [k, v] of Object.entries(value)) {
    if (forbidden.has(k)) throw new Error("Invalid property name.");
    if (!Object.hasOwn(schema.properties, k)) {
      if (schema.additionalProperties === false)
        throw new Error(`Unknown property ${k}.`);
      continue;
    }
    validateField(schema.properties[k], v, k);
  }
  return true;
}
export function readPrimitiveInput(input, def) {
  if (def.enum) return def.enum[Number(input.value)];
  if (input.type === "checkbox") return input.checked;
  const types = Array.isArray(def.type) ? def.type : [def.type || "string"];
  if (input.value === "") return types.includes("null") ? null : undefined;
  return types.some((t) => t === "number" || t === "integer")
    ? Number(input.value)
    : input.value;
}
