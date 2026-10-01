export const BUILTIN = [
  {
    $id: 'xtratype.anchor.url@1', title: 'URL', type: 'object',
    required: ['url'],
    properties: {
      url: {type: 'string', title: 'Bare URL'},
      queryMode: {type: 'string', title: 'Query matching', enum: ['ignore', 'selected', 'all']},
      fragmentMode: {type: 'string', title: 'Fragment', enum: ['ignore', 'include']}
    },
    'x-xtratype': {label: 'URL', kind: 'url'}
  },
  {
    $id: 'xtratype.anchor.gps@1', title: 'GPS area', type: 'object', required: ['latitude', 'longitude'],
    properties: {
      latitude: {type: 'number', title: 'Latitude', minimum: -90, maximum: 90},
      longitude: {type: 'number', title: 'Longitude', minimum: -180, maximum: 180},
      radiusMeters: {type: ['number','null'], title: 'Radius (m)', minimum: 1},
      label: {type: 'string', title: 'Label'}
    },
    'x-xtratype': {label: 'GPS', kind: 'gps', defaultRadiusMeters: 75}
  },
  {
    $id: 'xtratype.anchor.youtube@1', title: 'YouTube video/time', type: 'object', required: ['videoId'],
    properties: {
      videoId: {type: 'string', title: 'Video ID'},
      videoUrl: {type: 'string', title: 'Video URL'},
      startSeconds: {type: ['number','null'], title: 'Start (seconds)', minimum: 0},
      endSeconds: {type: ['number','null'], title: 'End (seconds)', minimum: 0}
    },
    'x-xtratype': {label: 'YouTube', kind: 'youtube'}
  }
];

export function normalizeCustomSchema(schema) {
  if (!schema || typeof schema !== 'object') throw new Error('Schema must be a JSON object.');
  if (typeof schema.$id !== 'string' || !schema.$id.trim()) throw new Error('Custom schema requires a string $id.');
  if (schema.type !== 'object' || !schema.properties || typeof schema.properties !== 'object') throw new Error('Custom schema must use type: object with properties.');
  if (schema.$id.startsWith('xtratype.anchor.')) throw new Error('Built-in xtratype.anchor.* ids are reserved.');
  const allowed = new Set(['string', 'number', 'integer', 'boolean']);
  for (const [name, def] of Object.entries(schema.properties)) {
    const types = Array.isArray(def.type) ? def.type.filter(x => x !== 'null') : [def.type || 'string'];
    if (!types.some(t => allowed.has(t))) throw new Error(`Unsupported field type for ${name}.`);
  }
  return {...schema, 'x-xtratype': {kind: 'custom', label: schema['x-xtratype']?.label || schema.title || schema.$id, ...(schema['x-xtratype'] || {})}};
}

export function validateCustomValue(schema, value) {
  for (const required of schema.required || []) {
    const v = value[required];
    if (v === undefined || v === null || v === '') throw new Error(`${schema.properties[required]?.title || required} is required.`);
  }
  return true;
}
