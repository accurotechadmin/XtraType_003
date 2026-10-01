const DB_NAME = 'portashape-xtratype';
const DB_VERSION = 1;
const STORES = ['annotations', 'blobs', 'schemas', 'snapshots', 'events'];
let dbPromise;

export function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const name of STORES) {
        if (!db.objectStoreNames.contains(name)) {
          const store = db.createObjectStore(name, {keyPath: 'id'});
          if (name === 'annotations') {
            store.createIndex('targetKey', 'targetKey', {unique: false});
            store.createIndex('createdAt', 'createdAt', {unique: false});
          }
          if (name === 'snapshots') store.createIndex('pageKey', 'pageKey', {unique: false});
        }
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function request(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function put(storeName, value) {
  const db = await openDb();
  const tx = db.transaction(storeName, 'readwrite');
  tx.objectStore(storeName).put(value);
  await new Promise((resolve, reject) => { tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error); });
  return value;
}

export async function get(storeName, id) {
  const db = await openDb();
  return request(db.transaction(storeName).objectStore(storeName).get(id));
}

export async function all(storeName) {
  const db = await openDb();
  return request(db.transaction(storeName).objectStore(storeName).getAll());
}

export async function remove(storeName, id) {
  const db = await openDb();
  const tx = db.transaction(storeName, 'readwrite');
  tx.objectStore(storeName).delete(id);
  await new Promise((resolve, reject) => { tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); });
}

export async function byIndex(storeName, indexName, key) {
  const db = await openDb();
  return request(db.transaction(storeName).objectStore(storeName).index(indexName).getAll(key));
}

export function id(prefix) { return `${prefix}:${crypto.randomUUID()}`; }

export async function addBlob(blob, meta = {}) {
  const record = {id: id('blob'), blob, type: blob.type, size: blob.size, createdAt: new Date().toISOString(), ...meta};
  await put('blobs', record);
  return record;
}

export async function logEvent(type, data = {}) {
  const event = {id: id('event'), type, data, occurredAt: new Date().toISOString()};
  await put('events', event);
  return event;
}
